#!/usr/bin/env node
/**
 * Validador de contenido — Plataforma M1
 * Cero dependencias. Node 18+.
 *
 * Uso:
 *   node scripts/validar-contenido.mjs                  valida todo content/
 *   node scripts/validar-contenido.mjs <ruta.json>      valida un archivo
 *   node scripts/validar-contenido.mjs --hook           modo hook de Claude Code
 *
 * Exigencia única (desde 2026-08-12): todo archivo de content/ se mide contra
 * el contrato completo —todos los campos, feedback en cada distractor,
 * declaración de originalidad real y cero placeholders—. Ya no hay campo
 * `estado` ni exigencia gradual: un archivo a medio escribir no se commitea.
 *
 * En modo hook lee el evento por stdin (tool_input.file_path) o CLAUDE_FILE_PATH.
 * Si el archivo editado es contenido y no valida, sale con código 2 para que
 * Claude Code reciba el error como feedback y lo corrija.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { construirDag, ancestros } from '../lib/diagnostico/dag.ts';

// Autolocalización (mismo patrón que consultar-fuentes.mjs y el fix del
// 2026-08-22 de check-fuentes-aisladas.mjs): el modo sin argumentos (más abajo)
// resolvía `content/` contra process.cwd(), que depende de desde dónde se lance
// el proceso. El comando del hook PostToolUse en settings.json ya no depende de
// $CLAUDE_PROJECT_DIR (mismo bug de fondo que el hook de fuentes aisladas), así
// que esto solo importaba para invocaciones directas con cwd distinto — se
// endurece igual, por el mismo patrón, para no dejar la última dependencia de
// cwd en el script.
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const ORDEN_PASOS = [
  'curiosidad', 'problema', 'pensar', 'pistas', 'descubrimiento',
  'generalizacion', 'practica', 'aplicacion', 'reflexion', 'consolidacion',
];
const HABILIDADES = ['resolver', 'modelar', 'representar', 'argumentar'];
const DIFICULTADES = ['baja', 'media', 'alta'];
const CLAVES = ['A', 'B', 'C', 'D'];
const ITEMS_POR_TIPO = { leccion: [2, 3], diagnostico: [5, 5], cierre: [8, 8] };
// Solo marcadores explícitos en MAYÚSCULAS: en español "todo" y "pendiente" son
// palabras normales (¡"pendiente" es el concepto central del módulo!).
const PLACEHOLDERS = /\b(TODO|FIXME|PLACEHOLDER|XXX)\b|\[PENDIENTE\]|lorem ipsum/;
const MIN_FEEDBACK_PUBLICABLE = 40; // el feedback artesanal no puede ser un placeholder

const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;

function validarItem(item, i, campo, errores) {
  const p = `${campo}[${i}]`;
  if (!esTexto(item?.id)) errores.push(`${p}: falta id`);
  if (!HABILIDADES.includes(item?.habilidad)) errores.push(`${p}: habilidad debe ser una de: ${HABILIDADES.join(', ')}`);
  if (!DIFICULTADES.includes(item?.dificultad)) errores.push(`${p}: dificultad debe ser una de: ${DIFICULTADES.join(', ')}`);
  if (!esTexto(item?.enunciado)) errores.push(`${p}: falta enunciado`);
  if (!esTexto(item?.solucion)) errores.push(`${p}: falta la solución paso a paso`);

  const alts = item?.alternativas;
  if (!Array.isArray(alts) || alts.length !== 4) {
    errores.push(`${p}: debe tener exactamente 4 alternativas A–D (formato PAES M1)`);
    return;
  }
  const claves = alts.map((a) => a?.clave);
  for (const c of CLAVES) if (!claves.includes(c)) errores.push(`${p}: falta la alternativa ${c}`);
  const correctas = alts.filter((a) => a?.esCorrecta === true);
  if (correctas.length !== 1) errores.push(`${p}: debe haber exactamente una alternativa correcta (hay ${correctas.length})`);
  for (const a of alts) {
    const q = `${p}.${a?.clave ?? '?'}`;
    if (!esTexto(a?.texto)) errores.push(`${q}: falta texto`);
    if (a?.esCorrecta !== true) {
      if (!esTexto(a?.feedback)) {
        errores.push(`${q}: distractor sin feedback artesanal (regla MOS §4: cada distractor explica el error que lo produce)`);
      } else if (a.feedback.trim().length < MIN_FEEDBACK_PUBLICABLE) {
        errores.push(`${q}: feedback demasiado corto (<${MIN_FEEDBACK_PUBLICABLE} caracteres); debe explicar el error específico`);
      }
    }
  }
}

/**
 * Contrato del bloque `interactivoSlider` (content/schema/leccion.schema.json,
 * `bloqueInteractivoSlider`): `objeto` es "recta", "parabola" o ausente
 * (ausente = "recta", mismo default que `BloqueInteractivo.tsx`), y el número
 * de controles en `variables[]` lo fija ESE objeto, no `variante` — la
 * parábola necesita exactamente a, b y c; la recta admite como máximo dos.
 *
 * El schema JSON ya declara este contrato (commit be6f51b), pero
 * `npm run validar` no lo lee: es un validador escrito a mano, sin ajv de por
 * medio. Sin este chequeo, un bloque con `objeto: "circulo"` o una parábola con
 * 2 controles pasaba en silencio.
 */
function validarBloqueInteractivoSlider(bloque, donde, errores) {
  const objeto = bloque?.objeto;
  if (objeto !== undefined && objeto !== 'recta' && objeto !== 'parabola') {
    errores.push(`${donde}.objeto: debe ser "recta", "parabola" o estar ausente (recibido: ${JSON.stringify(objeto)})`);
  }

  const variables = bloque?.variables;
  const cantidad = Array.isArray(variables) ? variables.length : 0;
  const esperadas = objeto === 'parabola' ? 3 : 2;
  if (cantidad !== esperadas) {
    errores.push(
      `${donde}.variables: con objeto ${objeto === 'parabola' ? '"parabola"' : '"recta" (o ausente)'} se esperan ${esperadas} controles (hay ${cantidad})`,
    );
  }
}

/**
 * Regla local de catálogo de errores para el cierre: todo id del `catalogoErrores`
 * embebido tiene que estar referenciado por algún distractor del mismo archivo
 * ("sin tag" al revés). Sin array `catalogoErrores` no hay nada que cruzar y el
 * chequeo se omite.
 *
 * La rama contraria —"un id en catalogoErrores que ningún distractor referencia"—
 * se retiró (2026-09-08), igual que su gemelo `catalogo-sin-usar` del auditor:
 * cero verdaderos positivos en los 11 módulos, porque un catálogo de módulo
 * embebido en una pieza declara errores que otras piezas del módulo usan. La
 * cobertura de "todo id referenciado resuelve" la da ahora `validarReferenciasResuelven`
 * contra el canónico. Ver docs/deuda-catalogo-errores-crossfile.md.
 */
function validarCatalogoLocal(data, campoItems, errores) {
  const catalogo = data?.catalogoErrores;
  if (!Array.isArray(catalogo)) return;

  const definidos = new Set(catalogo.map((e) => e?.id).filter((id) => esTexto(id)));
  const usados = new Set();
  for (const it of data?.[campoItems] ?? []) {
    for (const a of it?.alternativas ?? []) {
      if (a?.esCorrecta !== true && esTexto(a?.errorCatalogado)) usados.add(a.errorCatalogado);
    }
  }

  for (const id of usados) {
    if (!definidos.has(id)) {
      errores.push(`errorCatalogado "${id}" lo referencia un distractor pero no está en catalogoErrores local (sin tag)`);
    }
  }
}

/**
 * Chequeo inverso: todo `errorCatalogado` que el archivo referencia, en
 * cualquier profundidad, tiene que RESOLVER contra el catálogo canónico de su
 * módulo (`content/errores/<moduloId>.json`). Verifica exactamente lo que
 * `catalogoDe()` de `lib/sanitizar.ts` garantiza, así que un id que pasa acá es
 * un id que el estudiante va a ver resuelto en la Capa 2.
 *
 * Es la red de cobertura que dejó el espejo canónico ↔ embebido de la L1 al
 * retirarse (ver docs/deuda-catalogo-errores-crossfile.md), y más ancha:
 * recorre TODOS los portadores —`bloque.alternativas`, `feedbackPorError`,
 * `feedbackPorPrediccion`, el campo `items` de los cierres— y no solo los
 * distractores.
 *
 * `erroresCatalogados` es el mapa `"<unidad>/error-N" → unidad` de
 * `cargarErroresCatalogados`. Sin él (la llamada de runtime desde
 * `lib/contenido.ts`) el chequeo se omite: en runtime un id sin resolver ya se
 * degrada sin romper nada, el gate es `npm run validar`.
 */
function validarReferenciasResuelven(data, erroresCatalogados, errores) {
  const referenciados = new Set();
  (function recorrer(nodo) {
    if (Array.isArray(nodo)) return void nodo.forEach(recorrer);
    if (!nodo || typeof nodo !== 'object') return;
    if (esTexto(nodo.errorCatalogado)) referenciados.add(nodo.errorCatalogado);
    for (const v of Object.values(nodo)) recorrer(v);
  })(data);
  if (referenciados.size === 0) return;

  const moduloId = data?.moduloId;

  for (const id of referenciados) {
    if (esTexto(moduloId) && erroresCatalogados.has(`${moduloId}/${id}`)) continue;
    errores.push(
      esTexto(moduloId)
        ? `errorCatalogado "${id}" no resuelve: no está en content/errores/${moduloId}.json`
        : `errorCatalogado "${id}" no resuelve: el archivo no declara moduloId`,
    );
  }
}

export function validarDatos(data, erroresCatalogados) {
  const errores = [];

  const tipo = data?.tipo;
  if (!(tipo in ITEMS_POR_TIPO)) {
    return [`"tipo" debe ser leccion, diagnostico o cierre (recibido: ${JSON.stringify(tipo)})`];
  }
  if (tipo === 'leccion' && data.pasos !== undefined) {
    const pasos = data.pasos;
    if (!Array.isArray(pasos) || pasos.length !== 10) {
      errores.push(`pasos: deben ser exactamente 10 en el orden pedagógico del MOS (hay ${Array.isArray(pasos) ? pasos.length : 0})`);
    } else {
      pasos.forEach((paso, i) => {
        if (paso?.tipo !== ORDEN_PASOS[i]) {
          errores.push(`pasos[${i}].tipo: debe ser "${ORDEN_PASOS[i]}" (recibido: ${JSON.stringify(paso?.tipo)})`);
        }
        if (!esTexto(paso?.titulo)) errores.push(`pasos[${i}]: falta titulo`);
        if (!Array.isArray(paso?.bloques) || paso.bloques.length === 0) {
          errores.push(`pasos[${i}]: falta bloques[] con al menos un bloque`);
        } else {
          paso.bloques.forEach((bloque, j) => {
            if (bloque?.tipo === 'interactivoSlider') {
              validarBloqueInteractivoSlider(bloque, `pasos[${i}].bloques[${j}]`, errores);
            }
          });
        }
      });
    }
  }

  const campoItems = tipo === 'leccion' ? 'itemsPAES' : 'items';
  const items = data?.[campoItems];
  const [minItems, maxItems] = ITEMS_POR_TIPO[tipo];
  const esperadoItems = minItems === maxItems ? `${minItems}` : `${minItems}–${maxItems}`;
  const conteoOk = Array.isArray(items) && items.length >= minItems && items.length <= maxItems;

  if (items !== undefined && !conteoOk) {
    errores.push(
      `${campoItems}: se esperan ${esperadoItems} ítems (hay ${Array.isArray(items) ? items.length : 0})`,
    );
  }

  // Contrato completo, siempre. Desde que se eliminó el sistema de `estado`
  // (2026-08-12) no hay exigencia gradual: todo archivo de content/ se mide
  // contra el contrato entero, que es el que antes solo se aplicaba a
  // 'publicable'. Un archivo a medio escribir simplemente no se commitea.
  if (!esTexto(data?.id)) errores.push('falta id');
  if (!esTexto(data?.titulo)) errores.push('falta titulo');

  // moduloId: obligatorio en lección y cierre desde el cierre de la migración a
  // canónico único (2026-09-08). Es el declarador de módulo del que sale el
  // catálogo de errores. `diagnostico` no lo lleva: no es contenido de un módulo.
  if ((tipo === 'leccion' || tipo === 'cierre') && !esTexto(data?.moduloId)) {
    errores.push('falta moduloId (unidad del DAG a la que pertenece; ver content/errores/<moduloId>.json)');
  }

  if (tipo === 'leccion') {
    if (data.pasos === undefined) errores.push('faltan los 10 pasos');
    if (!esTexto(data?.objetivo)) errores.push('falta objetivo');
    if (!(Number.isFinite(data?.tiempoEstimadoMin) && data.tiempoEstimadoMin > 0)) errores.push('falta tiempoEstimadoMin (> 0)');
    if (!Array.isArray(data?.prerrequisitos)) errores.push('falta prerrequisitos[]');
    if (!Array.isArray(data?.conceptos)) errores.push('falta conceptos[]');
  }

  if (items === undefined) {
    errores.push(`${campoItems}: se esperan ${esperadoItems} ítems (hay 0)`);
  } else if (conteoOk) {
    items.forEach((it, i) => validarItem(it, i, campoItems, errores));
  }

  if (tipo === 'cierre') {
    validarCatalogoLocal(data, campoItems, errores);
  }

  if ((tipo === 'leccion' || tipo === 'cierre') && erroresCatalogados) {
    validarReferenciasResuelven(data, erroresCatalogados, errores);
  }

  const prov = data?.proveniencia;
  if (!prov || !Array.isArray(prov.fuentesAnalisis) || typeof prov.declaracionOriginalidad !== 'string') {
    errores.push('falta proveniencia { fuentesAnalisis[], declaracionOriginalidad } (MOS §7.2)');
  } else if (prov.declaracionOriginalidad.trim().length < 30) {
    errores.push('proveniencia requiere una declaración de originalidad real (≥30 caracteres)');
  }

  if (PLACEHOLDERS.test(JSON.stringify(data))) {
    errores.push('no se admiten marcadores de trabajo pendiente (TODO, FIXME, [PENDIENTE], XXX, lorem ipsum)');
  }

  return errores;
}

export function validarArchivo(ruta, erroresCatalogados) {
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }
  return validarDatos(data, erroresCatalogados);
}

/**
 * Carpetas bajo `content/` que NO llevan contenido pedagógico y por lo tanto no
 * se miden contra el contrato de lecciones:
 *   schema/      el contrato mismo
 *   errores/     catálogo de errores por unidad ({ unidad, errores[] }). Tiene
 *                su propio contrato, más abajo (`validarCatalogoErrores`).
 *
 * `content/diagnostico/` YA NO está acá (2026-08-02). Era una exención en
 * bloque —introducida en `8a13a4f`, la deuda registrada en
 * docs/pendientes.md— que la sacaba de TODO contrato sin darle uno propio: un
 * ítem real mal formado habría entrado ahí sin que nada lo validara. Ahora
 * tiene dos contratos dedicados, discriminados por ruta (`esDagM1`,
 * `esItemDiagnostico`, justo abajo): `dag-m1.json` contra su propia
 * estructura (16 unidades, 22 aristas, acíclico, raíz única) e
 * `items/*.json` contra `content/schema/item-diagnostico.schema.json`.
 * Sigue sin pasar por el contrato de LECCIÓN porque no es material que lea un
 * estudiante — pero ya no pasa en silencio.
 *
 * Ojo: `content/diagnostico.json` (archivo, no carpeta) SÍ es contenido de
 * lección y sigue validándose contra ese contrato — acá se compara contra
 * segmentos de ruta, no contra el nombre.
 */
const CARPETAS_SIN_CONTRATO = new Set(['schema', 'errores']);

/** `content/diagnostico/dag-m1.json` (o cualquier .json ahí, salvo lo que cuelga de `items/`). */
function esDagM1(ruta) {
  const partes = resolve(ruta).split(sep);
  return (
    /\.json$/i.test(ruta) &&
    partes.includes('content') &&
    partes.includes('diagnostico') &&
    !partes.includes('items') &&
    !basename(ruta).startsWith('_')
  );
}

/** Cualquier `content/diagnostico/items/*.json`. Un archivo = un ítem. */
function esItemDiagnostico(ruta) {
  const partes = resolve(ruta).split(sep);
  return (
    /\.json$/i.test(ruta) &&
    partes.includes('content') &&
    partes.includes('diagnostico') &&
    partes.includes('items') &&
    !basename(ruta).startsWith('_')
  );
}

function esContenido(ruta) {
  const partes = resolve(ruta).split(sep);
  return (
    /\.json$/i.test(ruta) &&
    partes.includes('content') &&
    !partes.some((p) => CARPETAS_SIN_CONTRATO.has(p)) &&
    !esDagM1(ruta) &&
    !esItemDiagnostico(ruta) &&
    !esBancoAdvance(ruta) &&
    !basename(ruta).startsWith('_')
  );
}

function* archivosDeContenido(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, ent.name);
    if (ent.isDirectory()) yield* archivosDeContenido(ruta);
    else if (esContenido(ruta)) yield ruta;
  }
}

function esCatalogoErrores(ruta) {
  const partes = resolve(ruta).split(sep);
  return (
    /\.json$/i.test(ruta) &&
    partes.includes('content') &&
    partes.includes('errores') &&
    !basename(ruta).startsWith('_')
  );
}

function* archivosDeCatalogoErrores(dirContent) {
  const dir = join(dirContent, 'errores');
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, ent.name);
    if (!ent.isDirectory() && esCatalogoErrores(ruta)) yield ruta;
  }
}

/** La raíz `content/` que contiene a `ruta`. */
function raizContentDe(ruta) {
  const partes = resolve(ruta).split(sep);
  const i = partes.lastIndexOf('content');
  return partes.slice(0, i + 1).join(sep);
}

/**
 * Contrato de forma de un `content/errores/<unidad>.json`: tiene `unidad`, tiene
 * `errores[]` no vacío, y cada entrada lleva `id` con el prefijo `<unidad>/`,
 * `descripcion`, y sin ids locales duplicados.
 *
 * El espejo canónico ↔ catálogo embebido de la L1 (`MAPEO_LECCION_UNIDAD`) se
 * retiró junto con el último `catalogoErrores` embebido de `content/`: sin fuente
 * doble no hay divergencia posible. La cobertura de "todo id referenciado
 * resuelve" la da `validarReferenciasResuelven` sobre lecciones y cierres,
 * contra este mismo artefacto.
 */
export function validarCatalogoErrores(ruta) {
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }

  const errores = [];
  const unidad = data?.unidad;
  if (!esTexto(unidad)) return ['falta "unidad"'];

  const lista = data?.errores;
  if (!Array.isArray(lista) || lista.length === 0) return ['falta "errores"[] con al menos un error'];

  const idsLocales = new Set();
  const prefijo = `${unidad}/`;
  lista.forEach((e, i) => {
    const p = `errores[${i}]`;
    if (!esTexto(e?.id)) return errores.push(`${p}: falta id`);
    if (!esTexto(e?.descripcion)) return errores.push(`${p}: falta descripcion`);
    if (!e.id.startsWith(prefijo)) return errores.push(`${p}: id "${e.id}" debe empezar con "${prefijo}"`);
    const local = e.id.slice(prefijo.length);
    if (idsLocales.has(local)) errores.push(`${p}: id local "${local}" duplicado`);
    idsLocales.add(local);
  });

  return errores;
}

// ---------- bancos Fobos Advance: content/advance/<unidadId>/banco.json ----------
//
// Contrato: content/advance/schema/item-advance.schema.json. Igual que con
// leccion.schema.json, el schema no se lee: este bloque lo implementa a mano,
// campo por campo, más las reglas (1) a (5) y (7) de su $comment. La (6),
// colisión de valores contra content/lecciones/ y el resto de content/advance/,
// es del auditor (scripts/auditar-leccion.mjs), no de este gate.
//
// Sin esta rama, `esContenido` tomaría el banco como lección y `validarDatos`
// lo rechazaría con '"tipo" debe ser leccion, diagnostico o cierre', o sea el
// hook PostToolUse bloquearía cada edición del banco.

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ID_ITEM_ADVANCE = /^adv-[a-z0-9]+(-[a-z0-9]+)*$/;
const ERROR_LOCAL = /^error-[0-9]+$/;
const FUENTES_ORIGEN = ['propia', 'demre-liberada', 'temario-demre'];
const TIEMPO_REFERENCIA_SEG = [20, 600];
// §5.4: volumen mínimo para que el descarte tenga sentido en una unidad.
// Advertencia y no error, para no bloquear la escritura incremental del banco.
const MIN_ITEMS_BANCO_ADVANCE = 20;
const MIN_ERRORES_DISTINTOS_ADVANCE = 12;

const CLAVES_BANCO = ['tipo', 'unidadId', 'moduloId', 'titulo', 'items', 'contextosNumericos', 'auditoria', 'proveniencia'];
const CLAVES_ITEM_ADVANCE = ['id', 'unidadId', 'moduloId', 'habilidad', 'dificultad', 'tiempoReferenciaSeg', 'enunciado', 'alternativas', 'solucion', 'proveniencia'];
const CLAVES_DISTRACTOR = ['clave', 'texto', 'esCorrecta', 'errorCatalogado', 'feedbackDescarte', 'feedback'];
const CLAVES_CORRECTA = ['clave', 'texto', 'esCorrecta', 'feedbackDescarteIncorrecto', 'feedback'];
const CLAVES_PROVENIENCIA_ITEM = ['fuenteOrigen', 'referencia', 'notaAdaptacion', 'autor', 'fecha'];
const CLAVES_PROVENIENCIA_BANCO = ['fuentesAnalisis', 'declaracionOriginalidad', 'autor', 'fecha'];

/** `content/advance/<unidadId>/banco.json`, exactamente esa forma. Nada bajo `_` ni `schema/`. */
function esBancoAdvance(ruta) {
  const partes = resolve(ruta).split(sep);
  const i = partes.lastIndexOf('content');
  return (
    i >= 0 &&
    partes.length === i + 4 &&
    partes[i + 1] === 'advance' &&
    partes[i + 2] !== 'schema' &&
    !partes[i + 2].startsWith('_') &&
    partes[i + 3] === 'banco.json'
  );
}

function* archivosDeBancoAdvance(dirContent) {
  const dir = join(dirContent, 'advance');
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const ruta = join(dir, ent.name, 'banco.json');
    if (existsSync(ruta) && esBancoAdvance(ruta)) yield ruta;
  }
}

/** `additionalProperties: false` del schema, expresado como error por clave sobrante. */
function clavesSobrantes(objeto, permitidas, donde, errores) {
  for (const clave of Object.keys(objeto ?? {})) {
    if (!permitidas.includes(clave)) errores.push(`${donde}: clave "${clave}" no admitida por el schema`);
  }
}

function validarProvenienciaItem(prov, donde, errores) {
  if (!prov || typeof prov !== 'object' || Array.isArray(prov)) {
    return errores.push(`${donde}: falta proveniencia { fuenteOrigen }`);
  }
  clavesSobrantes(prov, CLAVES_PROVENIENCIA_ITEM, `${donde}.proveniencia`, errores);
  if (!FUENTES_ORIGEN.includes(prov.fuenteOrigen)) {
    errores.push(`${donde}.proveniencia.fuenteOrigen: debe ser una de: ${FUENTES_ORIGEN.join(', ')} (recibido: ${JSON.stringify(prov.fuenteOrigen)})`);
  }
  if (prov.fuenteOrigen === 'demre-liberada') {
    if (!esTexto(prov.referencia)) errores.push(`${donde}.proveniencia: con fuenteOrigen "demre-liberada" es obligatoria referencia (año, forma y número de pregunta)`);
    if (!esTexto(prov.notaAdaptacion)) errores.push(`${donde}.proveniencia: con fuenteOrigen "demre-liberada" es obligatoria notaAdaptacion (qué se cambió respecto del original)`);
  }
  for (const campo of ['referencia', 'notaAdaptacion', 'autor', 'fecha']) {
    if (prov[campo] !== undefined && !esTexto(prov[campo])) errores.push(`${donde}.proveniencia.${campo}: si está, es texto no vacío`);
  }
}

function validarAlternativasDescarte(alts, donde, banco, erroresCatalogados, errores) {
  if (!Array.isArray(alts) || alts.length !== 4) {
    return errores.push(`${donde}: debe tener exactamente 4 alternativas A–D (formato PAES M1)`);
  }

  // Regla (2): las cuatro claves presentes y sin repetir.
  const claves = alts.map((a) => a?.clave);
  for (const c of CLAVES) {
    const veces = claves.filter((k) => k === c).length;
    if (veces === 0) errores.push(`${donde}: falta la alternativa ${c}`);
    if (veces > 1) errores.push(`${donde}: la clave ${c} está repetida`);
  }

  // Regla (1): exactamente una correcta y tres distractores.
  const correctas = alts.filter((a) => a?.esCorrecta === true);
  if (correctas.length !== 1) errores.push(`${donde}: debe haber exactamente una alternativa correcta (hay ${correctas.length})`);

  for (const a of alts) {
    const q = `${donde}.${a?.clave ?? '?'}`;
    if (!a || typeof a !== 'object') {
      errores.push(`${q}: la alternativa debe ser un objeto`);
      continue;
    }
    if (!CLAVES.includes(a.clave)) errores.push(`${q}: clave debe ser A, B, C o D (recibido: ${JSON.stringify(a.clave)})`);
    if (!esTexto(a.texto)) errores.push(`${q}: falta texto`);
    if (typeof a.esCorrecta !== 'boolean') {
      errores.push(`${q}: esCorrecta debe ser true o false`);
      continue;
    }

    if (a.esCorrecta) {
      clavesSobrantes(a, CLAVES_CORRECTA, q, errores);
      if (!esTexto(a.feedbackDescarteIncorrecto)) {
        errores.push(`${q}: la correcta lleva feedbackDescarteIncorrecto (lo que se muestra cuando el estudiante la descarta por error)`);
      } else if (a.feedbackDescarteIncorrecto.trim().length < MIN_FEEDBACK_PUBLICABLE) {
        errores.push(`${q}: feedbackDescarteIncorrecto demasiado corto (<${MIN_FEEDBACK_PUBLICABLE} caracteres)`);
      }
      if (a.feedback !== undefined && !esTexto(a.feedback)) errores.push(`${q}: feedback, si está, es texto no vacío`);
    } else {
      clavesSobrantes(a, CLAVES_DISTRACTOR, q, errores);
      if (!esTexto(a.errorCatalogado)) {
        errores.push(`${q}: distractor sin errorCatalogado; en Advance es obligatorio en los tres (sin él el modo descarte no funciona)`);
      } else if (!ERROR_LOCAL.test(a.errorCatalogado)) {
        errores.push(`${q}: errorCatalogado "${a.errorCatalogado}" no tiene la forma error-N`);
      } else if (erroresCatalogados && esTexto(banco?.moduloId) && !erroresCatalogados.has(`${banco.moduloId}/${a.errorCatalogado}`)) {
        // Regla (3): todo errorCatalogado existe en el catálogo canónico del módulo.
        errores.push(`${q}: errorCatalogado "${a.errorCatalogado}" no está en content/errores/${banco.moduloId}.json`);
      }
      if (!esTexto(a.feedbackDescarte)) {
        errores.push(`${q}: distractor sin feedbackDescarte (lo que se muestra al descartarlo correctamente)`);
      } else if (a.feedbackDescarte.trim().length < MIN_FEEDBACK_PUBLICABLE) {
        errores.push(`${q}: feedbackDescarte demasiado corto (<${MIN_FEEDBACK_PUBLICABLE} caracteres)`);
      }
      if (a.feedback !== undefined && (!esTexto(a.feedback) || a.feedback.trim().length < MIN_FEEDBACK_PUBLICABLE)) {
        errores.push(`${q}: feedback, si está, tiene al menos ${MIN_FEEDBACK_PUBLICABLE} caracteres (mismo umbral que en lecciones)`);
      }
    }
  }
}

function validarItemAdvance(item, i, banco, erroresCatalogados, errores) {
  const p = `items[${i}]`;
  if (!item || typeof item !== 'object' || Array.isArray(item)) return errores.push(`${p}: el ítem debe ser un objeto`);
  clavesSobrantes(item, CLAVES_ITEM_ADVANCE, p, errores);

  if (!esTexto(item.id)) errores.push(`${p}: falta id`);
  else if (!ID_ITEM_ADVANCE.test(item.id)) errores.push(`${p}: id "${item.id}" debe ser kebab-case con prefijo adv- (p. ej. adv-porcentaje-001)`);

  // Regla (4): unidadId y moduloId del ítem coinciden con los del banco.
  for (const campo of ['unidadId', 'moduloId']) {
    if (!esTexto(item[campo]) || !KEBAB.test(item[campo])) errores.push(`${p}: falta ${campo} en kebab-case`);
    else if (esTexto(banco?.[campo]) && item[campo] !== banco[campo]) {
      errores.push(`${p}: ${campo} "${item[campo]}" no coincide con el del banco ("${banco[campo]}")`);
    }
  }

  if (!HABILIDADES.includes(item.habilidad)) errores.push(`${p}: habilidad debe ser una de: ${HABILIDADES.join(', ')}`);
  if (!DIFICULTADES.includes(item.dificultad)) errores.push(`${p}: dificultad debe ser una de: ${DIFICULTADES.join(', ')}`);

  const t = item.tiempoReferenciaSeg;
  const [tMin, tMax] = TIEMPO_REFERENCIA_SEG;
  if (!Number.isInteger(t) || t < tMin || t > tMax) {
    errores.push(`${p}: tiempoReferenciaSeg debe ser un entero entre ${tMin} y ${tMax} (recibido: ${JSON.stringify(t)})`);
  }

  if (!esTexto(item.enunciado)) errores.push(`${p}: falta enunciado`);
  if (!esTexto(item.solucion)) errores.push(`${p}: falta la solución paso a paso`);

  validarAlternativasDescarte(item.alternativas, p, banco, erroresCatalogados, errores);
  validarProvenienciaItem(item.proveniencia, p, errores);
}

function validarAuditoriaBanco(auditoria, errores) {
  if (auditoria === undefined) return;
  if (!auditoria || typeof auditoria !== 'object' || Array.isArray(auditoria)) return errores.push('auditoria: debe ser un objeto');
  clavesSobrantes(auditoria, ['colisionesPermitidas'], 'auditoria', errores);
  const lista = auditoria.colisionesPermitidas;
  if (lista === undefined) return;
  if (!Array.isArray(lista)) return errores.push('auditoria.colisionesPermitidas: debe ser un array');
  lista.forEach((c, i) => {
    const q = `auditoria.colisionesPermitidas[${i}]`;
    if (!c || typeof c !== 'object' || Array.isArray(c)) return errores.push(`${q}: debe ser { valor, motivo }`);
    clavesSobrantes(c, ['valor', 'motivo'], q, errores);
    if (typeof c.valor !== 'number' || !Number.isFinite(c.valor)) errores.push(`${q}.valor: debe ser un número`);
    if (!esTexto(c.motivo)) errores.push(`${q}.motivo: falta el motivo`);
  });
}

/**
 * Contrato completo de un banco Advance. `erroresCatalogados` es el mismo mapa
 * `"<unidad>/error-N" → unidad` que usa `validarReferenciasResuelven`.
 */
export function validarDatosBancoAdvance(data, unidadDelDirectorio, dirContent, erroresCatalogados) {
  const errores = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['el banco debe ser un objeto JSON'];

  if (data.tipo !== 'banco-advance') {
    return [`"tipo" debe ser "banco-advance" (recibido: ${JSON.stringify(data.tipo)})`];
  }
  clavesSobrantes(data, CLAVES_BANCO, 'raíz', errores);

  if (!esTexto(data.unidadId) || !KEBAB.test(data.unidadId)) errores.push('falta unidadId en kebab-case');
  else if (unidadDelDirectorio && data.unidadId !== unidadDelDirectorio) {
    errores.push(`unidadId "${data.unidadId}" no coincide con el directorio content/advance/${unidadDelDirectorio}/`);
  }

  if (!esTexto(data.moduloId) || !KEBAB.test(data.moduloId)) errores.push('falta moduloId en kebab-case');
  else if (dirContent && !existsSync(join(dirContent, 'errores', `${data.moduloId}.json`))) {
    errores.push(`moduloId "${data.moduloId}" no tiene catálogo canónico en content/errores/${data.moduloId}.json`);
  }

  /* Obligatorio: la portada y la sesión muestran el título, nunca el unidadId. */
  if (!esTexto(data.titulo)) errores.push('falta titulo (nombre técnico DEMRE de la unidad, lo que ve el estudiante)');

  if (data.contextosNumericos !== undefined) {
    if (!Array.isArray(data.contextosNumericos)) errores.push('contextosNumericos: debe ser un array de textos');
    else data.contextosNumericos.forEach((c, i) => { if (!esTexto(c)) errores.push(`contextosNumericos[${i}]: texto no vacío`); });
  }

  validarAuditoriaBanco(data.auditoria, errores);

  const items = data.items;
  if (!Array.isArray(items) || items.length === 0) {
    errores.push('items: se espera al menos un ítem');
  } else {
    items.forEach((it, i) => validarItemAdvance(it, i, data, erroresCatalogados, errores));
    // Regla (7): ningún id de ítem se repite dentro del banco.
    const vistos = new Set();
    items.forEach((it, i) => {
      if (!esTexto(it?.id)) return;
      if (vistos.has(it.id)) errores.push(`items[${i}]: id "${it.id}" repetido dentro del banco`);
      vistos.add(it.id);
    });
  }

  const prov = data.proveniencia;
  if (!prov || typeof prov !== 'object' || Array.isArray(prov)) {
    errores.push('falta proveniencia { fuentesAnalisis[], declaracionOriginalidad }');
  } else {
    clavesSobrantes(prov, CLAVES_PROVENIENCIA_BANCO, 'proveniencia', errores);
    if (!Array.isArray(prov.fuentesAnalisis)) errores.push('proveniencia.fuentesAnalisis: debe ser un array de textos');
    else prov.fuentesAnalisis.forEach((f, i) => { if (!esTexto(f)) errores.push(`proveniencia.fuentesAnalisis[${i}]: texto no vacío`); });
    if (!esTexto(prov.declaracionOriginalidad)) errores.push('proveniencia.declaracionOriginalidad: falta');
    else if (prov.declaracionOriginalidad.trim().length < 30) {
      errores.push('proveniencia requiere una declaración de originalidad real (≥30 caracteres, mismo umbral que lecciones y cierres)');
    }
    for (const campo of ['autor', 'fecha']) {
      if (prov[campo] !== undefined && !esTexto(prov[campo])) errores.push(`proveniencia.${campo}: si está, es texto no vacío`);
    }
  }

  if (PLACEHOLDERS.test(JSON.stringify(data))) {
    errores.push('no se admiten marcadores de trabajo pendiente (TODO, FIXME, [PENDIENTE], XXX, lorem ipsum)');
  }

  return errores;
}

export function validarBancoAdvance(ruta, erroresCatalogados) {
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }
  const unidadDelDirectorio = basename(dirname(resolve(ruta)));
  return validarDatosBancoAdvance(data, unidadDelDirectorio, raizContentDe(ruta), erroresCatalogados);
}

/** Regla (5), §5.4: 20 ítems y al menos 12 errores distintos. Advertencia, no error. */
function advertenciasBancoAdvance(data) {
  const advertencias = [];
  const items = Array.isArray(data?.items) ? data.items : [];
  if (items.length < MIN_ITEMS_BANCO_ADVANCE) {
    advertencias.push(`banco con ${items.length} ítems; el mínimo por unidad es ${MIN_ITEMS_BANCO_ADVANCE} (§5.4, advertencia no bloqueante)`);
  }
  const distintos = new Set();
  for (const it of items) {
    for (const a of Array.isArray(it?.alternativas) ? it.alternativas : []) {
      if (a?.esCorrecta !== true && esTexto(a?.errorCatalogado)) distintos.add(a.errorCatalogado);
    }
  }
  if (distintos.size < MIN_ERRORES_DISTINTOS_ADVANCE) {
    advertencias.push(`banco cubre ${distintos.size} errores distintos; el mínimo por unidad es ${MIN_ERRORES_DISTINTOS_ADVANCE} (§5.4, advertencia no bloqueante)`);
  }
  return advertencias;
}

function* archivosDeItemDiagnostico(dirContent) {
  const dir = join(dirContent, 'diagnostico', 'items');
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const ruta = resolve(join(dir, ent.name));
    if (!ent.isDirectory() && esItemDiagnostico(ruta)) yield ruta;
  }
}

/**
 * Valida `content/diagnostico/dag-m1.json`: 16 unidades, 22 aristas, DAG
 * acíclico y raíz única en sentido fuerte (una sola unidad sin
 * prerrequisitos, y toda otra unidad desciende de ella).
 *
 * Reutiliza `construirDag`/`ancestros` de `lib/diagnostico/dag.ts`: la misma
 * noción de "ancestro" y el mismo detector de ciclos que usa el motor en
 * producción, no una reimplementación paralela del grafo que se pueda
 * desincronizar con calladita.
 */
export function validarDagM1Archivo(ruta) {
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }

  const errores = [];
  const unidades = data?.unidades;
  if (!Array.isArray(unidades)) return ['falta "unidades"[]'];
  if (unidades.length !== 16) errores.push(`se esperan 16 unidades (hay ${unidades.length})`);

  let totalAristas = 0;
  for (const u of unidades) totalAristas += Array.isArray(u?.prerrequisitos) ? u.prerrequisitos.length : 0;
  if (totalAristas !== 22) errores.push(`se esperan 22 aristas en total (hay ${totalAristas})`);

  let dag;
  try {
    dag = construirDag(unidades);
  } catch (e) {
    errores.push(e.message); // construirDag ya cubre ids duplicados, prerrequisitos rotos y ciclos
    return errores; // sin un DAG válido, "raíz única" no se puede evaluar con sentido
  }

  const sinPrerrequisitos = unidades.filter((u) => !u?.prerrequisitos?.length).map((u) => u.id);
  if (sinPrerrequisitos.length !== 1) {
    errores.push(
      `debe haber exactamente una unidad sin prerrequisitos (hay ${sinPrerrequisitos.length}: ${sinPrerrequisitos.join(', ') || 'ninguna'})`,
    );
  } else {
    const raiz = sinPrerrequisitos[0];
    const huerfanas = unidades
      .filter((u) => u.id !== raiz && !ancestros(dag, u.id).has(raiz))
      .map((u) => u.id);
    if (huerfanas.length) {
      errores.push(`unidades que no descienden de la raíz única ("${raiz}"): ${huerfanas.join(', ')}`);
    }
  }

  return errores;
}

/** Lee content/diagnostico/items/*.json ya parseados. Un archivo = un ítem. */
function leerBancoDiagnostico(dirContent) {
  const items = []; // { ruta, data }
  const rotos = []; // { ruta, mensaje }
  for (const ruta of archivosDeItemDiagnostico(dirContent)) {
    try {
      items.push({ ruta, data: JSON.parse(readFileSync(ruta, 'utf8')) });
    } catch (e) {
      rotos.push({ ruta, mensaje: `JSON inválido: ${e.message}` });
    }
  }
  return { items, rotos };
}

/** Mapa errorCatalogado completo ("<unidad>/error-N") → unidad dueña, leído de content/errores/*.json. */
function cargarErroresCatalogados(dirContent) {
  const porId = new Map();
  const dir = join(dirContent, 'errores');
  if (!existsSync(dir)) return porId;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, ent.name);
    if (ent.isDirectory() || !esCatalogoErrores(ruta)) continue;
    let data;
    try {
      data = JSON.parse(readFileSync(ruta, 'utf8'));
    } catch {
      continue; // ese archivo ya reporta su propio JSON roto por su cuenta
    }
    const unidad = data?.unidad;
    for (const e of data?.errores ?? []) {
      if (esTexto(e?.id)) porId.set(e.id, unidad);
    }
  }
  return porId;
}

/** Forma de un ítem individual y sus referencias al DAG y a content/errores/ (reglas 6a, 6b, 6c, 6d, 6e, y el contrato de verificacionNumerica/revisionMatematica/checklistOriginalidad/estado). */
function validarFormaItemDiagnostico(data, dag, erroresCatalogados) {
  const errores = [];

  if (!esTexto(data?.id)) errores.push('falta id');

  const unidad = data?.unidad;
  if (!esTexto(unidad)) errores.push('falta unidad');
  else if (!dag.porId.has(unidad)) errores.push(`unidad "${unidad}" no existe en dag-m1.json`); // regla 6a

  const invol = data?.unidadesInvolucradas;
  if (!Array.isArray(invol) || invol.length === 0) {
    errores.push('falta unidadesInvolucradas[] (al menos "unidad")');
  } else {
    if (esTexto(unidad) && !invol.includes(unidad)) {
      errores.push('unidadesInvolucradas debe contener "unidad" (regla 6b)');
    }
    for (const u of invol) {
      if (!dag.porId.has(u)) errores.push(`unidadesInvolucradas incluye "${u}", que no existe en dag-m1.json`);
    }
  }

  if (!esTexto(data?.temarioDemre)) errores.push('falta temarioDemre');
  if (!esTexto(data?.enunciado)) errores.push('falta enunciado');
  if (!esTexto(data?.contextoNumerico)) errores.push('falta contextoNumerico');

  const alts = data?.alternativas;
  if (!Array.isArray(alts) || alts.length !== 4) {
    errores.push(`se esperan exactamente 4 alternativas (hay ${Array.isArray(alts) ? alts.length : 0})`); // regla 6c
  } else {
    const letras = alts.map((a) => a?.letra);
    for (const l of CLAVES) if (!letras.includes(l)) errores.push(`falta la alternativa ${l}`);
    const correctas = alts.filter((a) => a?.esCorrecta === true);
    if (correctas.length !== 1) errores.push(`debe haber exactamente una alternativa correcta (hay ${correctas.length})`); // regla 6c

    for (const a of alts) {
      const q = `alternativas.${a?.letra ?? '?'}`;
      if (!esTexto(a?.texto)) errores.push(`${q}: falta texto`);
      if (!esTexto(a?.feedback)) errores.push(`${q}: falta feedback`);

      if (a?.esCorrecta === true) {
        if (a?.errorCatalogado !== null) errores.push(`${q}: la alternativa correcta debe tener errorCatalogado: null`); // regla 6d
      } else if (!esTexto(a?.errorCatalogado)) {
        errores.push(`${q}: el distractor debe tener errorCatalogado (no nulo)`); // regla 6d
      } else {
        const dueño = erroresCatalogados.get(a.errorCatalogado); // regla 6e
        if (dueño === undefined) {
          errores.push(`${q}: errorCatalogado "${a.errorCatalogado}" no existe en ningún content/errores/<unidad>.json`);
        } else if (!(Array.isArray(invol) && invol.includes(dueño))) {
          errores.push(`${q}: errorCatalogado "${a.errorCatalogado}" pertenece a "${dueño}", que no está en unidadesInvolucradas`);
        }
      }
    }
  }

  const vn = data?.verificacionNumerica;
  if (!vn || typeof vn !== 'object') {
    errores.push('falta verificacionNumerica'); // regla 5
  } else if (vn.metodo === 'calculo') {
    if (!esTexto(vn.expresion)) errores.push('verificacionNumerica.expresion es obligatoria en metodo "calculo"');
    if (vn.esperado === undefined || vn.esperado === null || vn.esperado === '') {
      errores.push('verificacionNumerica.esperado es obligatorio en metodo "calculo"');
    }
  } else if (vn.metodo === 'sin-calculo') {
    if (!esTexto(vn.justificacion) || vn.justificacion.trim().length < 20) {
      errores.push('verificacionNumerica.justificacion debe explicar, con sustancia, por qué no se puede verificar aritméticamente');
    }
  } else {
    errores.push('verificacionNumerica.metodo debe ser "calculo" o "sin-calculo"');
  }

  return errores;
}

/**
 * Valida el BANCO COMPLETO de content/diagnostico/items/*.json a la vez.
 *
 * Reglas 6f, 6g y 6h solo tienen sentido mirando el banco entero, no un
 * archivo aislado — por eso este validador, a diferencia de `validarArchivo`,
 * no opera archivo por archivo: lee todo y devuelve un mapa ruta → errores
 * para que cada modo de invocación (hook, archivo suelto, corrida completa)
 * muestre el error contra el archivo que corresponde.
 *
 * 6g y 6h se evalúan solo sobre unidades que YA tienen ítems: un banco vacío
 * es un estado válido —`content/diagnostico/items/` está vacío a propósito en
 * esta sesión— y no dispara ninguna de las dos.
 */
export function validarBancoDiagnostico(dirContent) {
  const porRuta = new Map();
  const agregar = (ruta, mensaje) => porRuta.set(ruta, [...(porRuta.get(ruta) ?? []), mensaje]);

  const { items, rotos } = leerBancoDiagnostico(dirContent);
  for (const { ruta, mensaje } of rotos) agregar(ruta, mensaje);
  if (items.length === 0) return porRuta; // banco vacío: nada más que validar

  let dag;
  try {
    const dagData = JSON.parse(readFileSync(join(dirContent, 'diagnostico', 'dag-m1.json'), 'utf8'));
    dag = construirDag(dagData.unidades);
  } catch (e) {
    for (const { ruta } of items) agregar(ruta, `no se pudo cargar dag-m1.json: ${e.message}`);
    return porRuta;
  }
  const erroresCatalogados = cargarErroresCatalogados(dirContent);

  for (const { ruta, data } of items) {
    for (const e of validarFormaItemDiagnostico(data, dag, erroresCatalogados)) agregar(ruta, e);
  }

  // Unicidad de id en TODO el banco (parte de la definición del campo "id").
  const porId = new Map();
  for (const { ruta, data } of items) {
    if (!esTexto(data?.id)) continue;
    porId.set(data.id, [...(porId.get(data.id) ?? []), ruta]);
  }
  for (const [id, rutas] of porId) {
    if (rutas.length > 1) {
      for (const ruta of rutas) agregar(ruta, `id "${id}" duplicado con: ${rutas.filter((r) => r !== ruta).join(', ')}`);
    }
  }

  // Regla 6f: ningún contexto numérico se repite entre ítems del banco.
  const porContexto = new Map();
  for (const { ruta, data } of items) {
    if (!esTexto(data?.contextoNumerico)) continue;
    porContexto.set(data.contextoNumerico, [...(porContexto.get(data.contextoNumerico) ?? []), ruta]);
  }
  for (const [contexto, rutas] of porContexto) {
    if (rutas.length > 1) {
      for (const ruta of rutas) {
        agregar(ruta, `contextoNumerico "${contexto}" repetido con: ${rutas.filter((r) => r !== ruta).join(', ')}`);
      }
    }
  }

  // Reglas 6g y 6h: cobertura por unidad, solo sobre unidades que ya tienen ítems.
  const itemsPorUnidad = new Map();
  for (const entrada of items) {
    const u = entrada.data?.unidad;
    if (!esTexto(u) || !dag.porId.has(u)) continue;
    itemsPorUnidad.set(u, [...(itemsPorUnidad.get(u) ?? []), entrada]);
  }

  for (const [unidad, entradas] of itemsPorUnidad) {
    // 6g: al menos un ítem aislante (unidadesInvolucradas ⊆ {unidad} ∪ ancestros).
    const permitidas = new Set([unidad, ...ancestros(dag, unidad).keys()]);
    const aislantes = entradas.filter(({ data }) => {
      const invol = data?.unidadesInvolucradas;
      return Array.isArray(invol) && invol.length > 0 && invol.every((u2) => permitidas.has(u2));
    });
    if (aislantes.length === 0) {
      const mensaje = `la unidad "${unidad}" tiene ítems pero ninguno es aislante (unidadesInvolucradas ⊆ {unidad} ∪ ancestros)`;
      for (const { ruta } of entradas) agregar(ruta, mensaje);
    }

    // 6h: si hay ≥2 ítems, al menos un errorCatalogado propio se repite en ≥2 de ellos.
    if (entradas.length >= 2) {
      const itemsPorError = new Map();
      for (const { ruta, data } of entradas) {
        for (const a of data?.alternativas ?? []) {
          const errId = a?.errorCatalogado;
          if (esTexto(errId) && errId.startsWith(`${unidad}/`)) {
            const s = itemsPorError.get(errId) ?? new Set();
            s.add(ruta);
            itemsPorError.set(errId, s);
          }
        }
      }
      const algunoRepetido = [...itemsPorError.values()].some((s) => s.size >= 2);
      if (!algunoRepetido) {
        const mensaje = `la unidad "${unidad}" tiene ${entradas.length} ítems pero ningún errorCatalogado propio se repite en 2 de ellos: error-confirmado sería inalcanzable`;
        for (const { ruta } of entradas) agregar(ruta, mensaje);
      }
    }
  }

  return porRuta;
}

function reportar(ruta, errores) {
  if (errores.length === 0) {
    console.log(`OK  ${ruta}`);
    return true;
  }
  console.error(`FALLA  ${ruta}`);
  for (const e of errores) console.error(`   - ${e}`);
  return false;
}

/**
 * F0.4 (docs/fobos-advance.md §4): errorCatalogado en los distractores de
 * itemsPAES/items sube de opcional a ADVERTENCIA no bloqueante, con cobertura
 * por módulo. Sube a obligatorio solo cuando la cobertura llegue a 100% —
 * antes de eso rompería los 11 módulos publicados.
 *
 * Deliberadamente separada de `validarDatos`/`validarArchivo`: esas dos
 * funciones se exportan y `lib/contenido.ts` las llama en RUNTIME esperando
 * `string[]` de errores (ver `lib/validar-contenido.d.ts`); cambiar su firma
 * para devolver advertencias además de errores rompería esa ruta en
 * producción. Esta función solo la usa la sección de CLI, más abajo.
 *
 * Mide `alternativas[]` (`clave` A–D + `esCorrecta`, el contrato
 * `alternativasABCD` del schema) dondequiera que aparezca con esa forma: en
 * itemsPAES/items, y en `bloquePregunta` embebido dentro de `pasos[].bloques`
 * (paso 7/8 de una lección), que el propio schema describe como "ítem
 * formato PAES (A-D) EMBEBIDO... reutiliza la misma estructura de
 * alternativas que 'item'" — es el mismo distractor, solo que dentro de un
 * paso en vez del cierre. No cuenta `bloqueSeleccion.opciones[]`
 * (explícitamente "NO formato PAES" en el schema, usa `id` no `clave`) ni
 * `feedbackPorError[]`/`feedbackPorPrediccion[]`, que no son distractores
 * A–D. Ampliar el alcance a esos tres es una decisión aparte: cambiaría el
 * denominador de la cobertura ya reportada.
 */
function analizarCoberturaErrorCatalogado(data) {
  const advertencias = [];
  let total = 0;
  let mapeados = 0;

  const medirAlternativas = (alternativas, etiqueta) => {
    for (const a of Array.isArray(alternativas) ? alternativas : []) {
      if (a?.esCorrecta === true) continue;
      total++;
      if (esTexto(a?.errorCatalogado)) {
        mapeados++;
      } else {
        advertencias.push(
          `${etiqueta}.${a?.clave ?? '?'}: distractor sin errorCatalogado (F0.4, advertencia no bloqueante)`,
        );
      }
    }
  };

  const campoItems = data?.tipo === 'leccion' ? 'itemsPAES' : 'items';
  for (const it of Array.isArray(data?.[campoItems]) ? data[campoItems] : []) {
    medirAlternativas(it?.alternativas, it?.id ?? '?');
  }

  if (data?.tipo === 'leccion') {
    (data?.pasos ?? []).forEach((paso, i) => {
      (paso?.bloques ?? []).forEach((bloque, j) => {
        if (bloque?.tipo === 'pregunta') {
          medirAlternativas(bloque?.alternativas, `pasos[${i}].bloques[${j}] (bloquePregunta)`);
        }
      });
    });
  }

  const moduloId =
    (data?.tipo === 'leccion' || data?.tipo === 'cierre') && esTexto(data?.moduloId)
      ? data.moduloId
      : null;

  return { moduloId, total, mapeados, advertencias };
}

// ---------- entrada (solo si se ejecuta directamente, no al importar) ----------
const esEjecutadoDirectamente =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (esEjecutadoDirectamente) {
const arg = process.argv[2];

if (arg === '--hook') {
  let filePath = process.env.CLAUDE_FILE_PATH || '';
  if (!process.stdin.isTTY) {
    try {
      const stdin = readFileSync(0, 'utf8');
      if (stdin.trim()) {
        const evento = JSON.parse(stdin);
        filePath = evento?.tool_input?.file_path || evento?.tool_input?.path || filePath;
      }
    } catch {
      /* stdin sin JSON: seguimos con la variable de entorno */
    }
  }

  const esErrores = esCatalogoErrores(filePath);
  const esDag = esDagM1(filePath);
  const esItem = esItemDiagnostico(filePath);
  const esBanco = esBancoAdvance(filePath);
  const requiereValidacion = esContenido(filePath) || esErrores || esDag || esItem || esBanco;
  if (!filePath || !existsSync(filePath) || !requiereValidacion) process.exit(0);

  let errores;
  let esLeccion = false;
  if (esErrores) {
    errores = validarCatalogoErrores(filePath);
  } else if (esDag) {
    errores = validarDagM1Archivo(filePath);
  } else if (esItem) {
    const porRuta = validarBancoDiagnostico(raizContentDe(filePath));
    errores = porRuta.get(resolve(filePath)) ?? [];
  } else if (esBanco) {
    errores = validarBancoAdvance(filePath, cargarErroresCatalogados(raizContentDe(filePath)));
  } else {
    errores = validarArchivo(filePath, cargarErroresCatalogados(raizContentDe(filePath)));
    esLeccion = true;
  }

  if (errores.length) {
    console.error(`El archivo de contenido ${filePath} no pasa la validación:`);
    for (const e of errores) console.error(` - ${e}`);
    if (esLeccion) {
      console.error('Corrige estos puntos antes de continuar (contrato: content/schema/leccion.schema.json).');
    }
    if (esBanco) {
      console.error('Corrige estos puntos antes de continuar (contrato: content/advance/schema/item-advance.schema.json).');
    }
    process.exit(2); // Claude Code recibe este error como feedback y corrige
  }
  if (esLeccion) {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    const { advertencias } = analizarCoberturaErrorCatalogado(data);
    for (const a of advertencias) console.warn(`   ⚠ ${a}`);
  }
  if (esBanco) {
    for (const a of advertenciasBancoAdvance(JSON.parse(readFileSync(filePath, 'utf8')))) console.warn(`   ⚠ ${a}`);
  }
  process.exit(0);
}

if (arg) {
  const ruta = resolve(arg);
  if (!existsSync(ruta)) {
    console.error(`No existe: ${ruta}`);
    process.exit(1);
  }
  let errores;
  let esLeccion = false;
  let esBanco = false;
  if (esCatalogoErrores(ruta)) {
    errores = validarCatalogoErrores(ruta);
  } else if (esDagM1(ruta)) {
    errores = validarDagM1Archivo(ruta);
  } else if (esItemDiagnostico(ruta)) {
    const porRuta = validarBancoDiagnostico(raizContentDe(ruta));
    errores = porRuta.get(ruta) ?? [];
  } else if (esBancoAdvance(ruta)) {
    errores = validarBancoAdvance(ruta, cargarErroresCatalogados(raizContentDe(ruta)));
    esBanco = true;
  } else {
    errores = validarArchivo(ruta, cargarErroresCatalogados(raizContentDe(ruta)));
    esLeccion = true;
  }
  const paso = reportar(ruta, errores);
  if (esLeccion && errores.length === 0) {
    const { advertencias } = analizarCoberturaErrorCatalogado(JSON.parse(readFileSync(ruta, 'utf8')));
    for (const a of advertencias) console.warn(`   ⚠ ${a}`);
  }
  if (esBanco && errores.length === 0) {
    for (const a of advertenciasBancoAdvance(JSON.parse(readFileSync(ruta, 'utf8')))) console.warn(`   ⚠ ${a}`);
  }
  process.exit(paso ? 0 : 1);
}

const raiz = resolve(PROJECT_ROOT, 'content');
if (!existsSync(raiz)) {
  console.error(`No existe el directorio content/ en ${PROJECT_ROOT}.`);
  process.exit(1);
}
let ok = true;
let n = 0;
const erroresCatalogados = cargarErroresCatalogados(raiz);
const coberturaPorModulo = new Map(); // moduloId -> { total, mapeados }
for (const ruta of archivosDeContenido(raiz)) {
  n++;
  if (!reportar(ruta, validarArchivo(ruta, erroresCatalogados))) ok = false;
  try {
    const data = JSON.parse(readFileSync(ruta, 'utf8'));
    const { moduloId, total, mapeados, advertencias } = analizarCoberturaErrorCatalogado(data);
    for (const a of advertencias) console.warn(`   ⚠ ${a}`);
    if (moduloId) {
      const acc = coberturaPorModulo.get(moduloId) ?? { total: 0, mapeados: 0 };
      acc.total += total;
      acc.mapeados += mapeados;
      coberturaPorModulo.set(moduloId, acc);
    }
  } catch {
    /* JSON inválido: validarArchivo ya lo reportó arriba como FALLA */
  }
}

if (coberturaPorModulo.size > 0) {
  console.log('\nCobertura de errorCatalogado por módulo (F0.4, advertencia no bloqueante):');
  let granTotal = 0;
  let granMapeados = 0;
  const filas = [...coberturaPorModulo.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [moduloId, { total, mapeados }] of filas) {
    granTotal += total;
    granMapeados += mapeados;
    const pct = total ? `${((100 * mapeados) / total).toFixed(1)}%` : 'n/a';
    console.log(`   ${moduloId}: ${mapeados}/${total} (${pct})`);
  }
  const pctGlobal = granTotal ? `${((100 * granMapeados) / granTotal).toFixed(1)}%` : 'n/a';
  console.log(`   TOTAL: ${granMapeados}/${granTotal} (${pctGlobal})`);
}

for (const ruta of archivosDeCatalogoErrores(raiz)) {
  n++;
  if (!reportar(ruta, validarCatalogoErrores(ruta))) ok = false;
}

const rutaDagM1 = join(raiz, 'diagnostico', 'dag-m1.json');
if (existsSync(rutaDagM1)) {
  n++;
  if (!reportar(rutaDagM1, validarDagM1Archivo(rutaDagM1))) ok = false;
}

const porRutaItems = validarBancoDiagnostico(raiz);
for (const ruta of archivosDeItemDiagnostico(raiz)) {
  n++;
  if (!reportar(ruta, porRutaItems.get(ruta) ?? [])) ok = false;
}

for (const ruta of archivosDeBancoAdvance(raiz)) {
  n++;
  const errores = validarBancoAdvance(ruta, erroresCatalogados);
  if (!reportar(ruta, errores)) ok = false;
  else for (const a of advertenciasBancoAdvance(JSON.parse(readFileSync(ruta, 'utf8')))) console.warn(`   ⚠ ${a}`);
}

if (n === 0) console.log('Sin archivos de contenido que validar (los que empiezan con "_" son plantillas y se omiten).');
process.exit(ok ? 0 : 1);
}
