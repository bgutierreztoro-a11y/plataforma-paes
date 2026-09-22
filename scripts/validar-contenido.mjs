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
import { motivoRechazoDatosTransformacion } from '../lib/transformacionesIsometricas.ts';
import { motivoRechazoDatosSemejanza } from '../lib/semejanza.ts';
import { esTipoGraficoEstadistico, motivoRechazoDatosGrafico } from '../lib/estadistica.ts';
import { esTipoVisualProbabilidad, motivoRechazoDatosProbabilidad } from '../lib/probabilidad.ts';
import { MAX_CAJAS, MAX_LARGO_NOMBRE, choqueDeMarcas, choquesDeRotulos, num as numCajon } from '../lib/advance/diagramaCajon.ts';

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
 * Contrato de los `datos` de `visualizacion` que sí tienen forma cerrada
 * (schema: `datosTransformacion`, `datosSemejanza`, `datosGraficoBarras`,
 * `datosGraficoLineas`, `datosGraficoCircular`, `datosDiagramaCajon`,
 * `datosDiagramaArbol`, `datosCuadriculaEspacioMuestral`), discriminados por
 * `datos.tipo`. Los datos sin `tipo` siguen siendo libres y no se tocan.
 *
 * El motivo lo produce la misma función que usa el type guard del bloque en
 * `components/bloques/BloqueVisualizacion.tsx`: un JSON que pasa por acá se
 * dibuja, y uno que no se dibuja no pasa por acá. Sin este chequeo, un vértice
 * fuera de [−10, 10], una figura anidada que no es semejante, un circular cuyos
 * porcentajes no suman 100 o un cajón con Q1 > mediana caían en silencio al
 * `<figure>` de texto. Para los gráficos de datos el contrato exige además que
 * `ejeTruncado` venga solo en un bloque marcado `ejemploEnganoso` (el gráfico
 * que enseña a desconfiar) y que un cajón con datos crudos coincida con
 * `resumenCincoNumeros` de lib/estadistica.ts. Para los bloques de
 * probabilidad (lib/probabilidad.ts): en el árbol, las probabilidades de las
 * ramas hermanas de cada nodo suman exactamente 1 sobre racionales, toda hoja
 * está en la etapa declarada y su `probabilidadCamino`, si viene, es el
 * producto de las ramas; en la cuadrícula, cada celda marcada cae dentro de
 * filas × columnas sin repetirse y el `contador` declarado coincide con las
 * marcadas y con filas × columnas.
 */
function validarBloqueVisualizacion(bloque, donde, errores) {
  const datos = bloque?.datos;
  if (!datos || typeof datos !== 'object') return;
  const tipo = datos.tipo;
  if (tipo === 'transformacion') {
    const motivo = motivoRechazoDatosTransformacion(datos);
    if (motivo) errores.push(`${donde}.datos (transformacion): ${motivo}`);
  } else if (tipo === 'semejanza') {
    const motivo = motivoRechazoDatosSemejanza(datos);
    if (motivo) errores.push(`${donde}.datos (semejanza): ${motivo}`);
  } else if (esTipoGraficoEstadistico(tipo)) {
    const motivo = motivoRechazoDatosGrafico(datos);
    if (motivo) errores.push(`${donde}.datos (${tipo}): ${motivo}`);
  } else if (esTipoVisualProbabilidad(tipo)) {
    const motivo = motivoRechazoDatosProbabilidad(datos);
    if (motivo) errores.push(`${donde}.datos (${tipo}): ${motivo}`);
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
            if (bloque?.tipo === 'visualizacion') {
              validarBloqueVisualizacion(bloque, `pasos[${i}].bloques[${j}]`, errores);
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

const CAMPOS_REPASO = ['camino', 'correcto', 'ejemplo'];
const MIN_MOTIVO_RESERVADO = 20;

/**
 * Contrato de forma de un `content/errores/<unidad>.json`: tiene `unidad`, tiene
 * `errores[]` no vacío, y cada entrada lleva `id` con el prefijo `<unidad>/`,
 * `descripcion`, y sin ids locales duplicados.
 *
 * Desde F4b (2026-09-12) una entrada puede llevar además el copy para el
 * estudiante: `titulo` y `apoyo` (la tarjeta de /advance/errores) y
 * `repaso { camino, correcto, ejemplo }` (la pantalla de repaso). Los tres son
 * OPCIONALES, porque solo porcentaje los tiene y los otros catálogos siguen
 * siendo `{ id, descripcion }`; pero si están, son texto no vacío, y `repaso`
 * trae los tres campos. No se rechazan claves desconocidas: `descripcion` es la
 * ficha de autor y este contrato no decide qué más puede llevar una entrada.
 *
 * El espejo canónico ↔ catálogo embebido de la L1 (`MAPEO_LECCION_UNIDAD`) se
 * retiró junto con el último `catalogoErrores` embebido de `content/`: sin fuente
 * doble no hay divergencia posible. La cobertura de "todo id referenciado
 * resuelve" la da `validarReferenciasResuelven` sobre lecciones y cierres,
 * contra este mismo artefacto.
 *
 * Puro, sobre datos ya parseados, como `validarDatos` y
 * `validarDatosBancoAdvance`; `validarCatalogoErrores` es el envoltorio que lee
 * el archivo.
 */
export function validarDatosCatalogoErrores(data) {
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

    if (e.titulo !== undefined && !esTexto(e.titulo)) errores.push(`${p}.titulo: si está, es texto no vacío`);
    if (e.apoyo !== undefined && !esTexto(e.apoyo)) errores.push(`${p}.apoyo: si está, es texto no vacío`);
    if (e.reservado !== undefined && !(esTexto(e.reservado) && e.reservado.trim().length >= MIN_MOTIVO_RESERVADO)) {
      errores.push(`${p}.reservado: si está, es un motivo de al menos ${MIN_MOTIVO_RESERVADO} caracteres (para qué pieza se guarda el id)`);
    }
    if (e.repaso !== undefined) {
      if (!e.repaso || typeof e.repaso !== 'object' || Array.isArray(e.repaso)) {
        errores.push(`${p}.repaso: si está, es un objeto { camino, correcto, ejemplo }`);
      } else {
        for (const campo of CAMPOS_REPASO) {
          if (!esTexto(e.repaso[campo])) errores.push(`${p}.repaso.${campo}: falta o está vacío`);
        }
      }
    }
  });

  return errores;
}

export function validarCatalogoErrores(ruta) {
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }
  return validarDatosCatalogoErrores(data);
}

/**
 * Cobertura del catálogo canónico (2026-09-13): todo id de
 * `content/errores/<unidad>.json` tiene que estar referenciado por algún
 * `errorCatalogado` de un archivo de ESE módulo, o llevar `reservado` con el
 * motivo (para qué pieza se guarda). Es el gemelo de `validarReferenciasResuelven`:
 * aquel garantiza que todo id referenciado existe; este, que todo id que
 * existe se usa. Reemplaza al `catalogo-sin-usar` retirado el 2026-09-08, que
 * medía sobre la copia embebida por archivo (donde un id que la L1 embebía
 * para el cierre era un falso positivo); sobre el canónico y por módulo
 * entero no hay esa ambigüedad, y medido el 2026-09-13 da 0 disparos en los
 * 13 catálogos.
 *
 * `referenciados` es el conjunto de ids completos (`<unidad>/error-N`) que el
 * módulo referencia, armado por `idsReferenciadosPorUnidad` sobre el corpus.
 * Puro, sobre datos ya parseados. Solo tiene sentido en la corrida completa:
 * un archivo suelto no sabe qué usan los demás archivos de su módulo.
 */
export function validarCoberturaCatalogo(data, referenciados) {
  const errores = [];
  for (const e of Array.isArray(data?.errores) ? data.errores : []) {
    if (!esTexto(e?.id) || referenciados.has(e.id)) continue;
    if (esTexto(e?.reservado)) continue;
    errores.push(
      `${e.id} no lo referencia ningún errorCatalogado del módulo (lecciones, cierre, diagnóstico ni Advance); úsalo o decláralo "reservado" con el motivo`,
    );
  }
  return errores;
}

/**
 * Mapa unidad → conjunto de ids completos (`<unidad>/error-N`) que referencia
 * algún archivo de contenido de esa unidad. Recorre lecciones y cierres (id
 * local + `moduloId`), ítems de diagnóstico (id ya con namespace) y bancos
 * Advance (id local + `moduloId`). Un archivo sin `moduloId` cuyos ids no
 * traen namespace (content/diagnostico.json) no aporta: no se sabe de qué
 * módulo hablan, y `validarReferenciasResuelven` ya lo reporta aparte.
 */
function idsReferenciadosPorUnidad(dirContent) {
  const porUnidad = new Map();
  const anotar = (idCompleto) => {
    const unidad = idCompleto.split('/')[0];
    if (!porUnidad.has(unidad)) porUnidad.set(unidad, new Set());
    porUnidad.get(unidad).add(idCompleto);
  };
  const recorrerArchivo = (ruta) => {
    let data;
    try {
      data = JSON.parse(readFileSync(ruta, 'utf8'));
    } catch {
      return; // ese JSON roto ya se reporta por su cuenta
    }
    const moduloId = esTexto(data?.moduloId) ? data.moduloId : null;
    (function recorrer(nodo) {
      if (Array.isArray(nodo)) return void nodo.forEach(recorrer);
      if (!nodo || typeof nodo !== 'object') return;
      if (esTexto(nodo.errorCatalogado)) {
        if (nodo.errorCatalogado.includes('/')) anotar(nodo.errorCatalogado);
        else if (moduloId) anotar(`${moduloId}/${nodo.errorCatalogado}`);
      }
      for (const v of Object.values(nodo)) recorrer(v);
    })(data);
  };
  for (const ruta of archivosDeContenido(dirContent)) recorrerArchivo(ruta);
  for (const ruta of archivosDeItemDiagnostico(dirContent)) recorrerArchivo(ruta);
  for (const ruta of archivosDeBancoAdvance(dirContent)) recorrerArchivo(ruta);
  return porUnidad;
}

// ---------- bancos Fobos Advance: content/advance/<unidadId>/banco.json ----------
//
// Contrato: content/advance/schema/item-advance.schema.json. Igual que con
// leccion.schema.json, el schema no se lee: este bloque lo implementa a mano,
// campo por campo, más las reglas (1) a (5) y (7) a (9) de su $comment. La (6),
// colisión de valores contra content/lecciones/ y el resto de content/advance/,
// es del auditor (scripts/auditar-leccion.mjs), no de este gate.
//
// Sin esta rama, `esContenido` tomaría el banco como lección y `validarDatos`
// lo rechazaría con '"tipo" debe ser leccion, diagnostico o cierre', o sea el
// hook PostToolUse bloquearía cada edición del banco.

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ID_ITEM_ADVANCE = /^adv-[a-z0-9]+(-[a-z0-9]+)*$/;
// Id local del catálogo: slug descriptivo kebab-case (desde la migración del 2026-09-13,
// docs/analisis/mapa-migracion-ids.json). Ya no se admite la forma posicional error-N.
const ERROR_LOCAL = /^(?!error-[0-9]+$)[a-z0-9]+(-[a-z0-9]+)+$/;
// Desde el 2026-09-13 errorCatalogado es nullable, pero la ausencia se declara:
// null obliga a sinErrorCatalogado { motivo, nota }. Los cuatro motivos son las
// categorías del análisis de formas DEMRE (docs/analisis/propuesta-catalogo-transversal.md).
const MOTIVOS_SIN_ERROR_CATALOGADO = [
  'valor-plausible-no-derivable',
  'creencia-sobre-un-paso',
  'error-transversal-pendiente',
  'sin-mecanismo-identificado',
];
// Pisos de cobertura, reglas (8) y (9) del $comment del schema. Los dos son
// error, no advertencia: un ítem sin mapeos no alimenta el diagnóstico y un
// banco bajo el piso no sostiene la mecánica.
const PISO_MAPEOS_POR_ITEM = 1; // de 3 distractores
const PISO_COBERTURA_BANCO = 0.6; // fracción de los distractores del banco
const FUENTES_ORIGEN = ['propia', 'demre-liberada', 'temario-demre'];
const TIEMPO_REFERENCIA_SEG = [20, 600];
// §5.4: volumen mínimo para que el descarte tenga sentido en una unidad.
// Advertencia y no error, para no bloquear la escritura incremental del banco.
const MIN_ITEMS_BANCO_ADVANCE = 20;
const MIN_ERRORES_DISTINTOS_ADVANCE = 12;

const CLAVES_BANCO = ['tipo', 'unidadId', 'moduloId', 'titulo', 'items', 'contextosNumericos', 'auditoria', 'proveniencia'];
const CLAVES_ITEM_ADVANCE = ['id', 'unidadId', 'moduloId', 'habilidad', 'dificultad', 'tiempoReferenciaSeg', 'enunciado', 'alternativas', 'solucion', 'figura', 'proveniencia'];
// Figura declarativa (regla (10) del $comment del schema). Vocabulario cerrado:
// la figura muestra los datos del ítem y nunca la transformación pedida.
const CLAVES_FIGURA = ['plano', 'descripcion', 'elementos'];
const CLAVES_PLANO = ['xMin', 'xMax', 'yMin', 'yMax'];
const MIN_DESCRIPCION_FIGURA = 30;
const FORMAS_RECTA = ['x=c', 'y=c', 'y=x', 'y=-x'];
const CLAVES_POR_TIPO_FIGURA = {
  punto: ['tipo', 'nombre', 'x', 'y'],
  poligono: ['tipo', 'nombre', 'vertices'],
  recta: ['tipo', 'etiqueta', 'forma', 'c'],
  vector: ['tipo', 'etiqueta', 'desde', 'hasta'],
  centro: ['tipo', 'etiqueta', 'x', 'y'],
};
// Figuras de función (reglas (11) y (12) del $comment). Se distinguen del plano
// de isometrías por la presencia de `tipo`: sin `tipo` la figura es la de arriba.
const TIPOS_FIGURA_NUEVA = ['plano-funcion', 'tabla-valores'];
const CLAVES_PLANO_FUNCION = ['tipo', 'ventana', 'curvas', 'puntos', 'segmentos', 'ejeSimetria', 'regiones', 'etiquetaEjeX', 'etiquetaEjeY', 'descripcion'];
const CLAVES_POR_CLASE_CURVA = {
  parabola: ['clase', 'a', 'b', 'c', 'desde', 'hasta', 'rotulo', 'trazo'],
  recta: ['clase', 'm', 'b', 'por', 'desde', 'hasta', 'rotulo', 'trazo'],
  'recta-vertical': ['clase', 'x', 'rotulo', 'trazo'],
};
const TRAZOS_CURVA = ['solido', 'segmentado', 'punteado'];
const CLAVES_PUNTO_FUNCION = ['x', 'y', 'rotulo', 'estilo', 'mostrarCoordenadas'];
const ESTILOS_PUNTO = ['relleno', 'hueco'];
const CLAVES_SEGMENTO = ['desde', 'hasta', 'rotulo'];
const CLAVES_EJE_SIMETRIA = ['x', 'rotulo'];
const CLAVES_POR_CLASE_REGION = {
  'entre-curva-y-eje': ['clase', 'curva', 'desde', 'hasta'],
  'franja-x': ['clase', 'desde', 'hasta'],
};
const MAX_CURVAS = 3;
const MAX_PUNTOS_FUNCION = 6;
const MAX_SEGMENTOS = 4;
const MAX_REGIONES = 2;
const CLAVES_TABLA_VALORES = ['tipo', 'encabezados', 'filas', 'descripcion'];
const MAX_COLUMNAS_TABLA = 6;
const MAX_FILAS_TABLA = 8;
// Figuras de datos (reglas (13) a (17)): tablas y gráficos estadísticos, solo
// datos, nunca SVG libre. Topes por legibilidad a 380 px, no por el dominio.
const TIPOS_FIGURA_DATOS = ['tabla-datos', 'grafico-barras', 'histograma', 'grafico-lineas', 'grafico-circular', 'diagrama-cajon'];
const CLAVES_TABLA_DATOS = ['tipo', 'titulo', 'columnas', 'filas', 'filaTotal'];
const MIN_COLUMNAS_TABLA_DATOS = 2;
const MAX_FILAS_TABLA_DATOS = 10;
const CLAVES_GRAFICO_BARRAS = ['tipo', 'categorias', 'series', 'ejeX', 'ejeY', 'mostrarValores'];
const CLAVES_GRAFICO_LINEAS = ['tipo', 'categorias', 'series', 'ejeX', 'ejeY'];
const CLAVES_HISTOGRAMA = ['tipo', 'intervalos', 'frecuencias', 'ejeX', 'ejeY', 'poligono'];
const CLAVES_GRAFICO_CIRCULAR = ['tipo', 'sectores', 'modoEtiqueta'];
const CLAVES_EJE_CATEGORIAS = ['etiqueta'];
const CLAVES_EJE_VALORES = ['etiqueta', 'min', 'max', 'paso'];
const CLAVES_SERIE = ['nombre', 'valores'];
const CLAVES_INTERVALO = ['desde', 'hasta'];
const CLAVES_SECTOR = ['etiqueta', 'valor'];
const MAX_CATEGORIAS_BARRAS = 8;
const MIN_CATEGORIAS_LINEAS = 2;
const MAX_CATEGORIAS_LINEAS = 10;
const MAX_SERIES = 3;
const MAX_INTERVALOS = 10;
const MIN_SECTORES = 2;
const MAX_SECTORES = 8;
const MODOS_ETIQUETA_CIRCULAR = ['porcentaje', 'valor', 'angulo', 'ninguno'];
// Diagrama de cajón (reglas (18) a (24)): declarativo, cinco números por caja y
// ventana del eje declarada. El tope de marcas es el del histograma, la otra
// figura de datos con un eje numérico rotulado a lo ancho: 10 intervalos, 11
// bordes con número.
const CLAVES_DIAGRAMA_CAJON = ['tipo', 'orientacion', 'eje', 'cajas', 'descripcion'];
const CLAVES_EJE_CAJON = ['min', 'max', 'paso', 'etiqueta', 'grilla'];
const CLAVES_CAJA = ['nombre', 'minimo', 'q1', 'mediana', 'q3', 'maximo', 'rotulos'];
const CINCO_NUMEROS = ['minimo', 'q1', 'mediana', 'q3', 'maximo'];
const ORIENTACIONES_CAJON = ['horizontal', 'vertical'];
const MAX_MARCAS_EJE = MAX_INTERVALOS + 1;
const CLAVES_DISTRACTOR = ['clave', 'texto', 'figura', 'esCorrecta', 'errorCatalogado', 'sinErrorCatalogado', 'feedbackDescarte', 'feedback'];
const CLAVES_SIN_ERROR_CATALOGADO = ['motivo', 'nota'];
const CLAVES_CORRECTA = ['clave', 'texto', 'figura', 'esCorrecta', 'feedbackDescarteIncorrecto', 'feedback'];
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
    // Regla (26): el texto puede ir vacío solo si la alternativa trae figura, y
    // esa figura tiene descripcion: es el nombre accesible del botón.
    if (a.figura !== undefined) validarFiguraItem(a.figura, `${q}.figura`, errores);
    if (typeof a.texto !== 'string' || (a.texto.trim() === '' && a.figura === undefined)) {
      errores.push(`${q}: falta texto`);
    } else if (a.texto.trim() === '' && !esTexto(a.figura?.descripcion)) {
      const tipo = a.figura?.tipo ?? 'plano de isometrías';
      errores.push(`${q}: texto vacío exige una figura con descripcion, que es el nombre accesible del botón; ${tipo} no la trae, así que esta alternativa lleva texto`);
    }
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
      validarDeclaracionErrorCatalogado(a, q, banco, erroresCatalogados, errores);
      /* feedbackDescarte: obligatorio con o sin mapeo. Es la pieza de la que
         depende la mecánica de descarte, no el catálogo. */
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

  // Regla (25): alternativas gráficas, las cuatro o ninguna.
  const conFigura = alts.filter((a) => a && typeof a === 'object' && a.figura !== undefined).length;
  if (conFigura > 0 && conFigura < alts.length) {
    errores.push(`${donde}: ${conFigura} de ${alts.length} alternativas llevan figura; van las cuatro o ninguna`);
  }

  // Regla (8): piso por ítem. Un ítem con cero distractores mapeados no
  // alimenta el diagnóstico, así que no entra al banco.
  const mapeados = alts.filter((a) => a?.esCorrecta === false && esTexto(a.errorCatalogado)).length;
  if (mapeados < PISO_MAPEOS_POR_ITEM) {
    errores.push(
      `${donde}: ${mapeados} de 3 distractores con errorCatalogado; el piso por ítem es ${PISO_MAPEOS_POR_ITEM} (un ítem sin mapeos no alimenta el diagnóstico)`,
    );
  }
}

/**
 * Contrato de `errorCatalogado` en un distractor: la clave siempre está; el
 * valor es un slug del catálogo del módulo o null. Si es null, la ausencia se
 * declara con `sinErrorCatalogado { motivo, nota }`; si tiene valor,
 * `sinErrorCatalogado` sobra. Las dos direcciones son error.
 */
function validarDeclaracionErrorCatalogado(a, q, banco, erroresCatalogados, errores) {
  const declaracion = a.sinErrorCatalogado;

  if (a.errorCatalogado === undefined) {
    errores.push(`${q}: distractor sin la clave errorCatalogado; si no hay error mapeado va null con sinErrorCatalogado { motivo, nota }, nunca se omite`);
    return;
  }

  if (a.errorCatalogado === null) {
    if (declaracion === undefined) {
      errores.push(`${q}: errorCatalogado null sin sinErrorCatalogado; la ausencia de mapeo se declara con { motivo, nota }`);
      return;
    }
    if (!declaracion || typeof declaracion !== 'object' || Array.isArray(declaracion)) {
      errores.push(`${q}.sinErrorCatalogado: debe ser un objeto { motivo, nota }`);
      return;
    }
    clavesSobrantes(declaracion, CLAVES_SIN_ERROR_CATALOGADO, `${q}.sinErrorCatalogado`, errores);
    if (!MOTIVOS_SIN_ERROR_CATALOGADO.includes(declaracion.motivo)) {
      errores.push(`${q}.sinErrorCatalogado.motivo: debe ser uno de: ${MOTIVOS_SIN_ERROR_CATALOGADO.join(', ')} (recibido: ${JSON.stringify(declaracion.motivo)})`);
    }
    if (!esTexto(declaracion.nota)) {
      errores.push(`${q}.sinErrorCatalogado.nota: falta la nota (una línea: qué se intentó derivar y por qué no cierra)`);
    } else if (/[\r\n]/.test(declaracion.nota)) {
      errores.push(`${q}.sinErrorCatalogado.nota: es una sola línea, sin saltos de línea`);
    }
    return;
  }

  if (!esTexto(a.errorCatalogado)) {
    errores.push(`${q}: errorCatalogado debe ser un slug del catálogo o null (recibido: ${JSON.stringify(a.errorCatalogado)})`);
    return;
  }
  if (declaracion !== undefined) {
    errores.push(`${q}: tiene errorCatalogado "${a.errorCatalogado}" y sinErrorCatalogado a la vez; sinErrorCatalogado va solo con errorCatalogado null`);
  }
  if (!ERROR_LOCAL.test(a.errorCatalogado)) {
    errores.push(`${q}: errorCatalogado "${a.errorCatalogado}" no es un slug kebab-case (la forma posicional error-N dejó de existir el 2026-09-13)`);
  } else if (erroresCatalogados && esTexto(banco?.moduloId) && !erroresCatalogados.has(`${banco.moduloId}/${a.errorCatalogado}`)) {
    // Regla (3): todo errorCatalogado no nulo existe en el catálogo canónico del módulo.
    errores.push(`${q}: errorCatalogado "${a.errorCatalogado}" no está en content/errores/${banco.moduloId}.json`);
  }
}

/**
 * Regla (10): figura declarativa de un ítem Advance. Cada elemento se valida
 * por su `tipo`; después se cruzan: vértices contra puntos, coordenadas contra
 * el plano, nombres sin repetir. Todo es error.
 */
function validarFiguraItem(figura, donde, errores) {
  if (figura && typeof figura === 'object' && !Array.isArray(figura) && figura.tipo !== undefined) {
    if (figura.tipo === 'plano-funcion') return validarPlanoFuncion(figura, donde, errores);
    if (figura.tipo === 'tabla-valores') return validarTablaValores(figura, donde, errores);
    if (figura.tipo === 'tabla-datos') return validarTablaDatos(figura, donde, errores);
    if (figura.tipo === 'grafico-barras') return validarGraficoSeries(figura, donde, errores, CLAVES_GRAFICO_BARRAS, 1, MAX_CATEGORIAS_BARRAS);
    if (figura.tipo === 'grafico-lineas') return validarGraficoSeries(figura, donde, errores, CLAVES_GRAFICO_LINEAS, MIN_CATEGORIAS_LINEAS, MAX_CATEGORIAS_LINEAS);
    if (figura.tipo === 'histograma') return validarHistograma(figura, donde, errores);
    if (figura.tipo === 'grafico-circular') return validarGraficoCircular(figura, donde, errores);
    if (figura.tipo === 'diagrama-cajon') return validarDiagramaCajon(figura, donde, errores);
    return errores.push(`${donde}.tipo: debe ser uno de: ${[...TIPOS_FIGURA_NUEVA, ...TIPOS_FIGURA_DATOS].join(', ')}, o ausente para el plano de isometrías (recibido: ${JSON.stringify(figura.tipo)})`);
  }
  if (!figura || typeof figura !== 'object' || Array.isArray(figura)) {
    return errores.push(`${donde}: figura debe ser un objeto { plano, descripcion, elementos }`);
  }
  clavesSobrantes(figura, CLAVES_FIGURA, donde, errores);

  const plano = figura.plano;
  let planoValido = false;
  if (!plano || typeof plano !== 'object' || Array.isArray(plano)) {
    errores.push(`${donde}.plano: falta { xMin, xMax, yMin, yMax }`);
  } else {
    clavesSobrantes(plano, CLAVES_PLANO, `${donde}.plano`, errores);
    const enteros = CLAVES_PLANO.every((k) => Number.isInteger(plano[k]));
    if (!enteros) errores.push(`${donde}.plano: xMin, xMax, yMin e yMax deben ser enteros`);
    else {
      if (plano.xMin >= plano.xMax) errores.push(`${donde}.plano: xMin (${plano.xMin}) debe ser menor que xMax (${plano.xMax})`);
      if (plano.yMin >= plano.yMax) errores.push(`${donde}.plano: yMin (${plano.yMin}) debe ser menor que yMax (${plano.yMax})`);
      planoValido = plano.xMin < plano.xMax && plano.yMin < plano.yMax;
    }
  }

  if (!esTexto(figura.descripcion)) {
    errores.push(`${donde}.descripcion: falta (qué muestra la figura, en palabras, para lector de pantalla y Ronda 1)`);
  } else if (figura.descripcion.trim().length < MIN_DESCRIPCION_FIGURA) {
    errores.push(`${donde}.descripcion: demasiado corta (<${MIN_DESCRIPCION_FIGURA} caracteres)`);
  }

  const elementos = figura.elementos;
  if (!Array.isArray(elementos) || elementos.length === 0) {
    return errores.push(`${donde}.elementos: se espera un array con al menos un elemento`);
  }

  const dentro = (x, y) => !planoValido || (x >= plano.xMin && x <= plano.xMax && y >= plano.yMin && y <= plano.yMax);
  const nombresPunto = new Set();
  const poligonos = [];

  elementos.forEach((el, j) => {
    const q = `${donde}.elementos[${j}]`;
    if (!el || typeof el !== 'object' || Array.isArray(el)) return errores.push(`${q}: debe ser un objeto con tipo`);
    const permitidas = CLAVES_POR_TIPO_FIGURA[el.tipo];
    if (!permitidas) {
      return errores.push(`${q}: tipo debe ser uno de: ${Object.keys(CLAVES_POR_TIPO_FIGURA).join(', ')} (recibido: ${JSON.stringify(el.tipo)})`);
    }
    clavesSobrantes(el, permitidas, q, errores);

    if (el.tipo === 'punto') {
      if (!esTexto(el.nombre)) errores.push(`${q}: punto sin nombre`);
      else if (nombresPunto.has(el.nombre)) errores.push(`${q}: nombre de punto "${el.nombre}" repetido dentro de la figura`);
      else nombresPunto.add(el.nombre);
      if (!Number.isInteger(el.x) || !Number.isInteger(el.y)) errores.push(`${q}: x e y deben ser enteros`);
      else if (!dentro(el.x, el.y)) errores.push(`${q}: punto "${el.nombre}" (${el.x}, ${el.y}) fuera del plano`);
      return;
    }

    if (el.tipo === 'poligono') {
      if (el.nombre !== undefined && !esTexto(el.nombre)) errores.push(`${q}: nombre, si está, es texto no vacío`);
      if (!Array.isArray(el.vertices) || el.vertices.length < 3 || !el.vertices.every(esTexto)) {
        errores.push(`${q}: vertices debe ser un array de al menos 3 nombres de punto`);
      } else poligonos.push({ q, vertices: el.vertices });
      return;
    }

    if (el.tipo === 'recta') {
      if (!esTexto(el.etiqueta)) errores.push(`${q}: recta sin etiqueta`);
      if (!FORMAS_RECTA.includes(el.forma)) {
        errores.push(`${q}: forma debe ser una de: ${FORMAS_RECTA.join(', ')} (recibido: ${JSON.stringify(el.forma)})`);
      } else if (el.forma === 'x=c' || el.forma === 'y=c') {
        if (!Number.isInteger(el.c)) errores.push(`${q}: con forma ${el.forma} es obligatorio c entero`);
        else if (planoValido) {
          const [lo, hi] = el.forma === 'x=c' ? [plano.xMin, plano.xMax] : [plano.yMin, plano.yMax];
          if (el.c < lo || el.c > hi) errores.push(`${q}: recta ${el.forma} con c = ${el.c} fuera del plano`);
        }
      } else if (el.c !== undefined) {
        errores.push(`${q}: con forma ${el.forma} no va c`);
      }
      return;
    }

    if (el.tipo === 'vector') {
      if (!esTexto(el.etiqueta)) errores.push(`${q}: vector sin etiqueta`);
      for (const extremo of ['desde', 'hasta']) {
        const par = el[extremo];
        if (!Array.isArray(par) || par.length !== 2 || !par.every(Number.isInteger)) {
          errores.push(`${q}: ${extremo} debe ser [x, y] con enteros`);
        } else if (!dentro(par[0], par[1])) {
          errores.push(`${q}: vector "${el.etiqueta}" con ${extremo} (${par[0]}, ${par[1]}) fuera del plano`);
        }
      }
      return;
    }

    // centro
    if (!esTexto(el.etiqueta)) errores.push(`${q}: centro sin etiqueta`);
    if (!Number.isInteger(el.x) || !Number.isInteger(el.y)) errores.push(`${q}: x e y deben ser enteros`);
    else if (!dentro(el.x, el.y)) errores.push(`${q}: centro "${el.etiqueta}" (${el.x}, ${el.y}) fuera del plano`);
  });

  for (const { q, vertices } of poligonos) {
    for (const v of vertices) {
      if (!nombresPunto.has(v)) errores.push(`${q}: vértice "${v}" no existe como punto de la figura`);
    }
  }
}

const esNumero = (v) => typeof v === 'number' && Number.isFinite(v);
const esCoordenada = (p) => p && typeof p === 'object' && !Array.isArray(p) && esNumero(p.x) && esNumero(p.y);

/** y de la curva en x. Solo parabola y recta: la vertical no es función de x. */
function evaluarCurva(curva, x) {
  if (curva.clase === 'parabola') return curva.a * x * x + curva.b * x + curva.c;
  if (Array.isArray(curva.por)) {
    const [p, q] = curva.por;
    return p.y + ((q.y - p.y) / (q.x - p.x)) * (x - p.x);
  }
  return curva.m * x + curva.b;
}

/**
 * Regla (11): figura `plano-funcion`. Todo error. La contención dentro de la
 * ventana se comprueba solo cuando `ventana` viene declarada: la automática
 * se construye desde estos mismos puntos y lo afirma un test del motor
 * (lib/advance/planoFuncion.test.ts), no este validador.
 */
function validarPlanoFuncion(figura, donde, errores) {
  clavesSobrantes(figura, CLAVES_PLANO_FUNCION, donde, errores);

  let ventana = null;
  if (figura.ventana !== undefined) {
    const v = figura.ventana;
    if (!v || typeof v !== 'object' || Array.isArray(v)) errores.push(`${donde}.ventana: debe ser { xMin, xMax, yMin, yMax }`);
    else {
      clavesSobrantes(v, CLAVES_PLANO, `${donde}.ventana`, errores);
      if (!CLAVES_PLANO.every((k) => esNumero(v[k]))) errores.push(`${donde}.ventana: xMin, xMax, yMin e yMax deben ser números finitos`);
      else {
        if (v.xMin >= v.xMax) errores.push(`${donde}.ventana: xMin (${v.xMin}) debe ser menor que xMax (${v.xMax})`);
        if (v.yMin >= v.yMax) errores.push(`${donde}.ventana: yMin (${v.yMin}) debe ser menor que yMax (${v.yMax})`);
        if (v.xMin < v.xMax && v.yMin < v.yMax) ventana = v;
      }
    }
  }
  const dentro = (x, y) => !ventana || (x >= ventana.xMin && x <= ventana.xMax && y >= ventana.yMin && y <= ventana.yMax);
  const dentroX = (x) => !ventana || (x >= ventana.xMin && x <= ventana.xMax);

  if (!esTexto(figura.descripcion)) {
    errores.push(`${donde}.descripcion: falta (texto alternativo del gráfico, es el <desc> del SVG)`);
  } else if (figura.descripcion.trim().length < MIN_DESCRIPCION_FIGURA) {
    errores.push(`${donde}.descripcion: demasiado corta (<${MIN_DESCRIPCION_FIGURA} caracteres)`);
  }
  for (const campo of ['etiquetaEjeX', 'etiquetaEjeY']) {
    if (figura[campo] !== undefined && !esTexto(figura[campo])) errores.push(`${donde}.${campo}: si está, es texto no vacío`);
  }

  const rotulos = new Map();
  const rotulo = (valor, q) => {
    if (valor === undefined) return;
    if (!esTexto(valor)) return errores.push(`${q}.rotulo: si está, es texto no vacío`);
    if (rotulos.has(valor)) errores.push(`${q}.rotulo: "${valor}" repetido dentro de la figura (ya en ${rotulos.get(valor)})`);
    else rotulos.set(valor, q);
  };
  const rango = (obj, q, obligatorio) => {
    const tiene = obj.desde !== undefined || obj.hasta !== undefined;
    if (obligatorio || tiene) {
      for (const k of ['desde', 'hasta']) {
        if (obj[k] === undefined) {
          if (obligatorio) errores.push(`${q}: falta ${k}`);
        } else if (!esNumero(obj[k])) errores.push(`${q}.${k}: debe ser número finito`);
      }
      if (esNumero(obj.desde) && esNumero(obj.hasta) && obj.desde >= obj.hasta) {
        errores.push(`${q}: desde (${obj.desde}) debe ser menor que hasta (${obj.hasta})`);
      }
    }
  };

  // curvas
  const curvas = figura.curvas;
  const curvasValidas = [];
  if (!Array.isArray(curvas) || curvas.length < 1 || curvas.length > MAX_CURVAS) {
    errores.push(`${donde}.curvas: se esperan entre 1 y ${MAX_CURVAS} curvas (recibido: ${Array.isArray(curvas) ? curvas.length : JSON.stringify(curvas)})`);
  } else {
    curvas.forEach((cu, j) => {
      const q = `${donde}.curvas[${j}]`;
      curvasValidas.push(null);
      if (!cu || typeof cu !== 'object' || Array.isArray(cu)) return errores.push(`${q}: debe ser un objeto con clase`);
      const permitidas = CLAVES_POR_CLASE_CURVA[cu.clase];
      if (!permitidas) {
        return errores.push(`${q}: clase debe ser una de: ${Object.keys(CLAVES_POR_CLASE_CURVA).join(', ')} (recibido: ${JSON.stringify(cu.clase)})`);
      }
      clavesSobrantes(cu, permitidas, q, errores);
      if (cu.trazo !== undefined && !TRAZOS_CURVA.includes(cu.trazo)) errores.push(`${q}.trazo: debe ser uno de: ${TRAZOS_CURVA.join(', ')}`);
      rotulo(cu.rotulo, q);
      if (curvas.length >= 2 && cu.rotulo === undefined) errores.push(`${q}: con 2 o más curvas cada una lleva rotulo (no se distinguen solo por color)`);

      let valida = false;
      if (cu.clase === 'parabola') {
        if (!['a', 'b', 'c'].every((k) => esNumero(cu[k]))) errores.push(`${q}: a, b y c deben ser números finitos`);
        else if (cu.a === 0) errores.push(`${q}: a debe ser distinto de 0 (con a = 0 no es una parábola)`);
        else valida = true;
        rango(cu, q, false);
      } else if (cu.clase === 'recta') {
        const conPendiente = cu.m !== undefined || cu.b !== undefined;
        const conPuntos = cu.por !== undefined;
        if (conPendiente && conPuntos) errores.push(`${q}: recta con m y b o con por, nunca ambas`);
        else if (conPuntos) {
          if (!Array.isArray(cu.por) || cu.por.length !== 2 || !cu.por.every(esCoordenada)) errores.push(`${q}.por: deben ser dos puntos { x, y }`);
          else if (cu.por[0].x === cu.por[1].x) errores.push(`${q}.por: los dos puntos deben tener x distinto (recta vertical: usa clase recta-vertical)`);
          else valida = true;
        } else if (!esNumero(cu.m) || !esNumero(cu.b)) errores.push(`${q}: m y b deben ser números finitos`);
        else valida = true;
        rango(cu, q, false);
      } else {
        if (!esNumero(cu.x)) errores.push(`${q}: x debe ser número finito`);
        else if (!dentroX(cu.x)) errores.push(`${q}: recta-vertical x = ${cu.x} fuera de la ventana`);
        else valida = true;
      }
      if (!valida) return;
      curvasValidas[j] = cu;
      if (cu.clase === 'recta-vertical') return;

      for (const k of ['desde', 'hasta']) {
        if (!esNumero(cu[k])) continue;
        const y = evaluarCurva(cu, cu[k]);
        if (!dentro(cu[k], y)) errores.push(`${q}: extremo ${k} (${cu[k]}, ${y}) fuera de la ventana`);
      }
      if (cu.clase === 'parabola' && ventana) {
        const xv = -cu.b / (2 * cu.a);
        const visible = (cu.desde === undefined || xv >= cu.desde) && (cu.hasta === undefined || xv <= cu.hasta);
        if (visible && dentroX(xv)) {
          const yv = evaluarCurva(cu, xv);
          if (!dentro(xv, yv)) errores.push(`${q}: vértice (${xv}, ${yv}) fuera de la ventana`);
        }
      }
    });
  }

  // puntos
  if (figura.puntos !== undefined) {
    if (!Array.isArray(figura.puntos) || figura.puntos.length > MAX_PUNTOS_FUNCION) {
      errores.push(`${donde}.puntos: se esperan hasta ${MAX_PUNTOS_FUNCION} puntos`);
    } else {
      figura.puntos.forEach((pt, j) => {
        const q = `${donde}.puntos[${j}]`;
        if (!pt || typeof pt !== 'object' || Array.isArray(pt)) return errores.push(`${q}: debe ser un objeto { x, y }`);
        clavesSobrantes(pt, CLAVES_PUNTO_FUNCION, q, errores);
        if (!esNumero(pt.x) || !esNumero(pt.y)) errores.push(`${q}: x e y deben ser números finitos`);
        else if (!dentro(pt.x, pt.y)) errores.push(`${q}: punto (${pt.x}, ${pt.y}) fuera de la ventana`);
        if (pt.estilo !== undefined && !ESTILOS_PUNTO.includes(pt.estilo)) errores.push(`${q}.estilo: debe ser uno de: ${ESTILOS_PUNTO.join(', ')}`);
        if (pt.mostrarCoordenadas !== undefined && typeof pt.mostrarCoordenadas !== 'boolean') errores.push(`${q}.mostrarCoordenadas: debe ser booleano`);
        rotulo(pt.rotulo, q);
      });
    }
  }

  // segmentos
  if (figura.segmentos !== undefined) {
    if (!Array.isArray(figura.segmentos) || figura.segmentos.length > MAX_SEGMENTOS) {
      errores.push(`${donde}.segmentos: se esperan hasta ${MAX_SEGMENTOS} segmentos`);
    } else {
      figura.segmentos.forEach((s, j) => {
        const q = `${donde}.segmentos[${j}]`;
        if (!s || typeof s !== 'object' || Array.isArray(s)) return errores.push(`${q}: debe ser un objeto { desde, hasta }`);
        clavesSobrantes(s, CLAVES_SEGMENTO, q, errores);
        for (const k of ['desde', 'hasta']) {
          if (!esCoordenada(s[k])) errores.push(`${q}.${k}: debe ser { x, y } con números finitos`);
          else if (!dentro(s[k].x, s[k].y)) errores.push(`${q}: extremo ${k} (${s[k].x}, ${s[k].y}) fuera de la ventana`);
        }
        if (esCoordenada(s.desde) && esCoordenada(s.hasta) && s.desde.x === s.hasta.x && s.desde.y === s.hasta.y) {
          errores.push(`${q}: desde y hasta son el mismo punto`);
        }
        rotulo(s.rotulo, q);
      });
    }
  }

  // eje de simetría
  if (figura.ejeSimetria !== undefined) {
    const e = figura.ejeSimetria;
    const q = `${donde}.ejeSimetria`;
    if (!e || typeof e !== 'object' || Array.isArray(e)) errores.push(`${q}: debe ser { x, rotulo? }`);
    else {
      clavesSobrantes(e, CLAVES_EJE_SIMETRIA, q, errores);
      if (!esNumero(e.x)) errores.push(`${q}.x: debe ser número finito`);
      else if (!dentroX(e.x)) errores.push(`${q}: x = ${e.x} fuera de la ventana`);
      rotulo(e.rotulo, q);
    }
  }

  // regiones
  if (figura.regiones !== undefined) {
    if (!Array.isArray(figura.regiones) || figura.regiones.length > MAX_REGIONES) {
      errores.push(`${donde}.regiones: se esperan hasta ${MAX_REGIONES} regiones`);
    } else {
      figura.regiones.forEach((r, j) => {
        const q = `${donde}.regiones[${j}]`;
        if (!r || typeof r !== 'object' || Array.isArray(r)) return errores.push(`${q}: debe ser un objeto con clase`);
        const permitidas = CLAVES_POR_CLASE_REGION[r.clase];
        if (!permitidas) {
          return errores.push(`${q}: clase debe ser una de: ${Object.keys(CLAVES_POR_CLASE_REGION).join(', ')} (recibido: ${JSON.stringify(r.clase)})`);
        }
        clavesSobrantes(r, permitidas, q, errores);
        rango(r, q, true);
        if (r.clase === 'entre-curva-y-eje') {
          if (!Number.isInteger(r.curva) || r.curva < 0 || r.curva >= curvasValidas.length) {
            errores.push(`${q}.curva: debe ser el índice de una curva existente (0 a ${Math.max(curvasValidas.length - 1, 0)})`);
          } else if (curvasValidas[r.curva] && curvasValidas[r.curva].clase === 'recta-vertical') {
            errores.push(`${q}.curva: una recta-vertical no encierra región con el eje x`);
          }
        }
      });
    }
  }
}

/** Regla (12): figura `tabla-valores`. Todo error. */
function validarTablaValores(figura, donde, errores) {
  clavesSobrantes(figura, CLAVES_TABLA_VALORES, donde, errores);

  if (!esTexto(figura.descripcion)) {
    errores.push(`${donde}.descripcion: falta (qué muestra la tabla, en palabras)`);
  } else if (figura.descripcion.trim().length < MIN_DESCRIPCION_FIGURA) {
    errores.push(`${donde}.descripcion: demasiado corta (<${MIN_DESCRIPCION_FIGURA} caracteres)`);
  }

  const enc = figura.encabezados;
  let columnas = null;
  if (!Array.isArray(enc) || enc.length < 1 || enc.length > MAX_COLUMNAS_TABLA) {
    errores.push(`${donde}.encabezados: se esperan entre 1 y ${MAX_COLUMNAS_TABLA} encabezados`);
  } else {
    columnas = enc.length;
    const vistos = new Set();
    enc.forEach((h, j) => {
      if (!esTexto(h)) errores.push(`${donde}.encabezados[${j}]: texto no vacío`);
      else if (vistos.has(h)) errores.push(`${donde}.encabezados[${j}]: "${h}" repetido`);
      else vistos.add(h);
    });
  }

  const filas = figura.filas;
  if (!Array.isArray(filas) || filas.length < 1 || filas.length > MAX_FILAS_TABLA) {
    errores.push(`${donde}.filas: se esperan entre 1 y ${MAX_FILAS_TABLA} filas`);
  } else {
    filas.forEach((f, j) => {
      const q = `${donde}.filas[${j}]`;
      if (!Array.isArray(f)) return errores.push(`${q}: debe ser un array de celdas`);
      if (columnas !== null && f.length !== columnas) errores.push(`${q}: tiene ${f.length} celdas y encabezados tiene ${columnas}`);
      f.forEach((celda, k) => {
        if (!(typeof celda === 'string' || esNumero(celda))) errores.push(`${q}[${k}]: cada celda es texto o número finito`);
      });
    });
  }
}

/* ---------- figuras de datos, reglas (13) a (17) ---------- */

const esObjeto = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Regla (13): figura `tabla-datos`. Toda fila y filaTotal con el largo de columnas. Todo error. */
function validarTablaDatos(figura, donde, errores) {
  clavesSobrantes(figura, CLAVES_TABLA_DATOS, donde, errores);
  if (figura.titulo !== undefined && !esTexto(figura.titulo)) errores.push(`${donde}.titulo: si está, es texto no vacío`);

  const columnas = figura.columnas;
  let n = null;
  if (!Array.isArray(columnas) || columnas.length < MIN_COLUMNAS_TABLA_DATOS || columnas.length > MAX_COLUMNAS_TABLA) {
    errores.push(`${donde}.columnas: se esperan entre ${MIN_COLUMNAS_TABLA_DATOS} y ${MAX_COLUMNAS_TABLA} columnas`);
  } else {
    n = columnas.length;
    columnas.forEach((c, j) => {
      if (!esTexto(c)) errores.push(`${donde}.columnas[${j}]: texto no vacío`);
    });
  }

  const fila = (f, q) => {
    if (!Array.isArray(f)) return errores.push(`${q}: debe ser un array de celdas`);
    if (n !== null && f.length !== n) errores.push(`${q}: tiene ${f.length} celdas y columnas tiene ${n}`);
    f.forEach((celda, k) => {
      if (!(typeof celda === 'string' || esNumero(celda))) errores.push(`${q}[${k}]: cada celda es texto o número finito`);
    });
  };
  const filas = figura.filas;
  if (!Array.isArray(filas) || filas.length < 1 || filas.length > MAX_FILAS_TABLA_DATOS) {
    errores.push(`${donde}.filas: se esperan entre 1 y ${MAX_FILAS_TABLA_DATOS} filas`);
  } else {
    filas.forEach((f, j) => fila(f, `${donde}.filas[${j}]`));
  }
  if (figura.filaTotal !== undefined) fila(figura.filaTotal, `${donde}.filaTotal`);
}

function validarEjeCategorias(eje, q, errores) {
  if (!esObjeto(eje)) return errores.push(`${q}: debe ser { etiqueta }`);
  clavesSobrantes(eje, CLAVES_EJE_CATEGORIAS, q, errores);
  if (!esTexto(eje.etiqueta)) errores.push(`${q}.etiqueta: texto no vacío`);
}

function validarEjeValores(eje, q, errores) {
  if (!esObjeto(eje)) return errores.push(`${q}: debe ser { etiqueta, min?, max?, paso? }`);
  clavesSobrantes(eje, CLAVES_EJE_VALORES, q, errores);
  if (!esTexto(eje.etiqueta)) errores.push(`${q}.etiqueta: texto no vacío`);
  for (const k of ['min', 'max', 'paso']) {
    if (eje[k] !== undefined && !esNumero(eje[k])) errores.push(`${q}.${k}: si está, es número finito`);
  }
  if (esNumero(eje.min) && esNumero(eje.max) && eje.min >= eje.max) errores.push(`${q}: min (${eje.min}) debe ser menor que max (${eje.max})`);
  if (esNumero(eje.paso) && eje.paso <= 0) errores.push(`${q}.paso: debe ser mayor que 0 (recibido: ${eje.paso})`);
}

/**
 * Reglas (14) y (16): `grafico-barras` y `grafico-lineas` comparten forma.
 * Cada serie con el largo de categorias; con 2 o más series, nombre
 * obligatorio y sin repetir (es lo que las distingue, no el color).
 */
function validarGraficoSeries(figura, donde, errores, permitidas, minCategorias, maxCategorias) {
  clavesSobrantes(figura, permitidas, donde, errores);

  const categorias = figura.categorias;
  let n = null;
  if (!Array.isArray(categorias) || categorias.length < minCategorias || categorias.length > maxCategorias) {
    errores.push(`${donde}.categorias: se esperan entre ${minCategorias} y ${maxCategorias} categorías`);
  } else {
    n = categorias.length;
    categorias.forEach((c, j) => {
      if (!esTexto(c)) errores.push(`${donde}.categorias[${j}]: texto no vacío`);
    });
  }

  const series = figura.series;
  if (!Array.isArray(series) || series.length < 1 || series.length > MAX_SERIES) {
    errores.push(`${donde}.series: se esperan entre 1 y ${MAX_SERIES} series`);
  } else {
    const nombres = new Map();
    series.forEach((s, j) => {
      const q = `${donde}.series[${j}]`;
      if (!esObjeto(s)) return errores.push(`${q}: debe ser { nombre?, valores }`);
      clavesSobrantes(s, CLAVES_SERIE, q, errores);
      if (s.nombre !== undefined) {
        if (!esTexto(s.nombre)) errores.push(`${q}.nombre: si está, es texto no vacío`);
        else if (nombres.has(s.nombre)) errores.push(`${q}.nombre: "${s.nombre}" repetido (ya en ${nombres.get(s.nombre)})`);
        else nombres.set(s.nombre, q);
      } else if (series.length >= 2) {
        errores.push(`${q}: con 2 o más series cada una lleva nombre (no se distinguen solo por color)`);
      }
      if (!Array.isArray(s.valores)) return errores.push(`${q}.valores: debe ser un array de números`);
      if (n !== null && s.valores.length !== n) errores.push(`${q}.valores: tiene ${s.valores.length} valores y categorias tiene ${n}`);
      s.valores.forEach((v, k) => {
        if (!esNumero(v)) errores.push(`${q}.valores[${k}]: debe ser número finito`);
      });
    });
  }

  validarEjeCategorias(figura.ejeX, `${donde}.ejeX`, errores);
  validarEjeValores(figura.ejeY, `${donde}.ejeY`, errores);
  if (figura.mostrarValores !== undefined && typeof figura.mostrarValores !== 'boolean') errores.push(`${donde}.mostrarValores: debe ser booleano`);
}

/** Regla (15): `histograma`. Intervalos contiguos y crecientes, mismo largo que frecuencias, frecuencias ≥ 0. */
function validarHistograma(figura, donde, errores) {
  clavesSobrantes(figura, CLAVES_HISTOGRAMA, donde, errores);

  const intervalos = figura.intervalos;
  let n = null;
  if (!Array.isArray(intervalos) || intervalos.length < 1 || intervalos.length > MAX_INTERVALOS) {
    errores.push(`${donde}.intervalos: se esperan entre 1 y ${MAX_INTERVALOS} intervalos`);
  } else {
    n = intervalos.length;
    intervalos.forEach((it, j) => {
      const q = `${donde}.intervalos[${j}]`;
      if (!esObjeto(it)) return errores.push(`${q}: debe ser { desde, hasta }`);
      clavesSobrantes(it, CLAVES_INTERVALO, q, errores);
      if (!esNumero(it.desde) || !esNumero(it.hasta)) return errores.push(`${q}: desde y hasta deben ser números finitos`);
      if (it.desde >= it.hasta) errores.push(`${q}: desde (${it.desde}) debe ser menor que hasta (${it.hasta})`);
      const anterior = intervalos[j - 1];
      if (j > 0 && esObjeto(anterior) && esNumero(anterior.hasta) && anterior.hasta !== it.desde) {
        errores.push(`${q}: desde (${it.desde}) debe ser igual al hasta del intervalo anterior (${anterior.hasta}); los intervalos son contiguos`);
      }
    });
  }

  const frecuencias = figura.frecuencias;
  if (!Array.isArray(frecuencias)) {
    errores.push(`${donde}.frecuencias: debe ser un array de números`);
  } else {
    if (n !== null && frecuencias.length !== n) errores.push(`${donde}.frecuencias: tiene ${frecuencias.length} valores e intervalos tiene ${n}`);
    frecuencias.forEach((v, k) => {
      if (!esNumero(v)) errores.push(`${donde}.frecuencias[${k}]: debe ser número finito`);
      else if (v < 0) errores.push(`${donde}.frecuencias[${k}]: debe ser mayor o igual a 0 (recibido: ${v})`);
    });
  }

  validarEjeCategorias(figura.ejeX, `${donde}.ejeX`, errores);
  validarEjeValores(figura.ejeY, `${donde}.ejeY`, errores);
  if (figura.poligono !== undefined && typeof figura.poligono !== 'boolean') errores.push(`${donde}.poligono: debe ser booleano`);
}

/** Como máximo un decimal, exacto: 12,5 pasa; 12,25 y 33,333… no. */
const unDecimalExacto = (x) => Math.abs(x * 10 - Math.round(x * 10)) < 1e-9;

/**
 * Regla (17): `grafico-circular`. Valores > 0; en porcentaje y angulo, cada
 * valor calculado tiene como máximo 1 decimal exacto, y el error nombra el
 * sector: una etiqueta como "33,3 %" mentiría sobre un tercio.
 */
function validarGraficoCircular(figura, donde, errores) {
  clavesSobrantes(figura, CLAVES_GRAFICO_CIRCULAR, donde, errores);

  const modo = figura.modoEtiqueta;
  if (!MODOS_ETIQUETA_CIRCULAR.includes(modo)) errores.push(`${donde}.modoEtiqueta: debe ser uno de: ${MODOS_ETIQUETA_CIRCULAR.join(', ')}`);

  const sectores = figura.sectores;
  if (!Array.isArray(sectores) || sectores.length < MIN_SECTORES || sectores.length > MAX_SECTORES) {
    return errores.push(`${donde}.sectores: se esperan entre ${MIN_SECTORES} y ${MAX_SECTORES} sectores`);
  }
  let total = 0;
  let todosValidos = true;
  sectores.forEach((s, j) => {
    const q = `${donde}.sectores[${j}]`;
    if (!esObjeto(s)) {
      todosValidos = false;
      return errores.push(`${q}: debe ser { etiqueta, valor }`);
    }
    clavesSobrantes(s, CLAVES_SECTOR, q, errores);
    if (!esTexto(s.etiqueta)) errores.push(`${q}.etiqueta: texto no vacío`);
    if (!esNumero(s.valor) || s.valor <= 0) {
      todosValidos = false;
      errores.push(`${q}.valor: debe ser un número mayor que 0 (recibido: ${JSON.stringify(s.valor)})`);
    } else total += s.valor;
  });
  if (!todosValidos || (modo !== 'porcentaje' && modo !== 'angulo')) return;

  const factor = modo === 'porcentaje' ? 100 : 360;
  const unidad = modo === 'porcentaje' ? '%' : '°';
  sectores.forEach((s, j) => {
    const calculado = (factor * s.valor) / total;
    if (!unDecimalExacto(calculado)) {
      errores.push(`${donde}.sectores[${j}]: "${s.etiqueta}" da ${Number(calculado.toFixed(4))}${unidad} en modo ${modo}, y cada valor calculado tiene como máximo 1 decimal exacto`);
    }
  });
}

/* ---------- diagrama de cajón, reglas (18) a (24) ---------- */

/**
 * Reglas (18) a (24): `diagrama-cajon`. Declarativo: cada caja trae sus cinco
 * números y el eje su ventana; la figura no calcula nada desde datos crudos.
 * (18) forma: orientación, eje, 1 a 4 cajas, cinco números finitos, rotulos
 * booleano, nombre de hasta 14 caracteres, descripcion. (19) orden de los cinco
 * números. (20) todo dentro de la ventana del eje. (21) paso positivo que
 * divide el rango. (22) tope de marcas y números del eje que no se pisan.
 * (23) nombre obligatorio y único con 2 o más cajas. (24) rótulos de valores
 * que no se pisan ni se salen, medidos con la misma geometría que dibuja el
 * componente (lib/advance/diagramaCajon.ts). Todo error.
 */
function validarDiagramaCajon(figura, donde, errores) {
  const antes = errores.length;
  clavesSobrantes(figura, CLAVES_DIAGRAMA_CAJON, donde, errores);

  // (18) forma
  if (!ORIENTACIONES_CAJON.includes(figura.orientacion)) {
    errores.push(`${donde}.orientacion: debe ser una de: ${ORIENTACIONES_CAJON.join(', ')}`);
  }
  if (!esTexto(figura.descripcion)) {
    errores.push(`${donde}.descripcion: falta (texto alternativo del diagrama, es el <desc> del SVG)`);
  } else if (figura.descripcion.trim().length < MIN_DESCRIPCION_FIGURA) {
    errores.push(`${donde}.descripcion: demasiado corta (<${MIN_DESCRIPCION_FIGURA} caracteres)`);
  }

  const eje = figura.eje;
  let ejeValido = false;
  if (!esObjeto(eje)) {
    errores.push(`${donde}.eje: debe ser { min, max, paso, etiqueta?, grilla? }`);
  } else {
    const q = `${donde}.eje`;
    clavesSobrantes(eje, CLAVES_EJE_CAJON, q, errores);
    const faltan = ['min', 'max', 'paso'].filter((k) => !esNumero(eje[k]));
    if (faltan.length > 0) errores.push(`${q}: ${faltan.join(', ')} deben ser números finitos (la ventana del eje es obligatoria)`);
    if (eje.etiqueta !== undefined && !esTexto(eje.etiqueta)) errores.push(`${q}.etiqueta: si está, es texto no vacío`);
    if (eje.grilla !== undefined && typeof eje.grilla !== 'boolean') errores.push(`${q}.grilla: debe ser booleano`);
    if (faltan.length === 0) {
      // (21) ventana creciente y paso positivo que divide el rango
      const antes21 = errores.length;
      if (eje.min >= eje.max) errores.push(`${q}: min (${eje.min}) debe ser menor que max (${eje.max})`);
      if (eje.paso <= 0) errores.push(`${q}.paso: debe ser mayor que 0 (recibido: ${eje.paso})`);
      else if (eje.min < eje.max) {
        const divisiones = (eje.max - eje.min) / eje.paso;
        if (Math.abs(divisiones - Math.round(divisiones)) > 1e-9) {
          errores.push(`${q}.paso: ${eje.paso} no divide el rango ${eje.max} − ${eje.min} = ${Number((eje.max - eje.min).toFixed(9))} en partes enteras (quedan ${Number(divisiones.toFixed(4))})`);
        } else {
          // (22) tope de marcas
          const marcas = Math.round(divisiones) + 1;
          if (marcas > MAX_MARCAS_EJE) {
            errores.push(`${q}: ${marcas} marcas y el tope es ${MAX_MARCAS_EJE} (el mismo del histograma); agranda el paso`);
          }
        }
      }
      ejeValido = errores.length === antes21;
    }
  }

  const cajas = figura.cajas;
  let cajasValidas = false;
  if (!Array.isArray(cajas) || cajas.length < 1 || cajas.length > MAX_CAJAS) {
    errores.push(`${donde}.cajas: se esperan entre 1 y ${MAX_CAJAS} cajas`);
  } else {
    const antesCajas = errores.length;
    const nombres = new Map();
    cajas.forEach((c, j) => {
      const q = `${donde}.cajas[${j}]`;
      if (!esObjeto(c)) return errores.push(`${q}: debe ser { nombre?, minimo, q1, mediana, q3, maximo, rotulos? }`);
      clavesSobrantes(c, CLAVES_CAJA, q, errores);
      const noNumericos = CINCO_NUMEROS.filter((k) => !esNumero(c[k]));
      if (noNumericos.length > 0) errores.push(`${q}: ${noNumericos.join(', ')} deben ser números finitos`);
      if (c.rotulos !== undefined && typeof c.rotulos !== 'boolean') errores.push(`${q}.rotulos: debe ser booleano`);

      // (23) nombres
      if (c.nombre !== undefined) {
        if (!esTexto(c.nombre)) errores.push(`${q}.nombre: si está, es texto no vacío`);
        else if (c.nombre.length > MAX_LARGO_NOMBRE) errores.push(`${q}.nombre: "${c.nombre}" tiene ${c.nombre.length} caracteres y el tope es ${MAX_LARGO_NOMBRE}`);
        else if (nombres.has(c.nombre)) errores.push(`${q}.nombre: "${c.nombre}" repetido (ya en ${nombres.get(c.nombre)})`);
        else nombres.set(c.nombre, q);
      } else if (cajas.length >= 2) {
        errores.push(`${q}: con 2 o más cajas cada una lleva nombre (no se distinguen solo por posición ni por color)`);
      }
      if (noNumericos.length > 0) return;

      // (19) orden
      for (let k = 1; k < CINCO_NUMEROS.length; k++) {
        const a = CINCO_NUMEROS[k - 1];
        const b = CINCO_NUMEROS[k];
        if (c[a] > c[b]) errores.push(`${q}: ${a} (${c[a]}) debe ser menor o igual que ${b} (${c[b]}); el orden es minimo ≤ q1 ≤ mediana ≤ q3 ≤ maximo`);
      }
      // (20) contención en la ventana
      if (esObjeto(eje) && esNumero(eje.min) && esNumero(eje.max) && eje.min < eje.max) {
        for (const k of CINCO_NUMEROS) {
          if (c[k] < eje.min || c[k] > eje.max) errores.push(`${q}.${k}: ${c[k]} queda fuera del eje [${eje.min}, ${eje.max}]`);
        }
      }
    });
    cajasValidas = errores.length === antesCajas;
  }

  // (22) números del eje y (24) rótulos: solo sobre una figura que ya pasó lo anterior,
  // porque la geometría necesita la ventana, el orden y la orientación sanos.
  if (!ejeValido || !cajasValidas || errores.length !== antes) return;
  const marcas = choqueDeMarcas(figura);
  if (marcas) {
    errores.push(`${donde}.eje: los números ${numCajon(marcas[0])} y ${numCajon(marcas[1])} del eje se pisan; agranda el paso`);
  }
  for (const choque of choquesDeRotulos(figura)) {
    const q = `${donde}.cajas[${choque.caja}]`;
    if (choque.motivo === 'se-pisan') {
      errores.push(`${q}: los rótulos de ${numCajon(choque.valores[0])} y ${numCajon(choque.valores[1])} se pisan en la figura; quita "rotulos" de esta caja o separa los valores`);
    } else {
      errores.push(`${q}: el rótulo de ${numCajon(choque.valores[0])} se sale de su lugar en la figura; quita "rotulos" de esta caja`);
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
  if (item.figura !== undefined) validarFiguraItem(item.figura, `${p}.figura`, errores);

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
    // Regla (9): piso por banco. Se mide sobre todos los distractores del
    // banco, mapeados o declarados; el porcentaje se reporta siempre (CLI).
    const { total, mapeados, porcentaje } = coberturaErrorCatalogadoBanco(data);
    if (total > 0 && mapeados / total < PISO_COBERTURA_BANCO) {
      errores.push(
        `cobertura de errorCatalogado ${mapeados}/${total} (${porcentaje.toFixed(1)}%) bajo el piso del ${Math.round(PISO_COBERTURA_BANCO * 100)}% por banco`,
      );
    }
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

/**
 * Cobertura de `errorCatalogado` sobre los distractores de un banco Advance:
 * cuántos hay, cuántos mapean a un error del catálogo y, de los declarados
 * con `sinErrorCatalogado`, cuántos por motivo. Sobre datos en memoria, sin
 * disco. La usan la regla (9) del contrato y el reporte del CLI, para que el
 * número que bloquea y el que se imprime sean el mismo.
 */
export function coberturaErrorCatalogadoBanco(data) {
  let total = 0;
  let mapeados = 0;
  const porMotivo = {};
  for (const it of Array.isArray(data?.items) ? data.items : []) {
    for (const a of Array.isArray(it?.alternativas) ? it.alternativas : []) {
      if (a?.esCorrecta !== false) continue;
      total++;
      if (esTexto(a.errorCatalogado)) {
        mapeados++;
      } else {
        const motivo = esTexto(a.sinErrorCatalogado?.motivo) ? a.sinErrorCatalogado.motivo : 'sin-declarar';
        porMotivo[motivo] = (porMotivo[motivo] ?? 0) + 1;
      }
    }
  }
  return { total, mapeados, porcentaje: total ? (100 * mapeados) / total : 0, porMotivo };
}

/** Fila del reporte de cobertura por banco, siempre, aunque el banco pase el piso. */
function filaCoberturaBanco(unidadId, data) {
  const { total, mapeados, porcentaje, porMotivo } = coberturaErrorCatalogadoBanco(data);
  const pct = total ? `${porcentaje.toFixed(1)}%` : 'n/a';
  const motivos = Object.entries(porMotivo)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, n]) => `${m} ${n}`)
    .join(', ');
  return `   ${unidadId}: ${mapeados}/${total} (${pct})${motivos ? `; sin mapear por motivo: ${motivos}` : ''}`;
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
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const a of advertenciasBancoAdvance(data)) console.warn(`   ⚠ ${a}`);
    console.log(`Cobertura de errorCatalogado (piso ${Math.round(PISO_COBERTURA_BANCO * 100)}% por banco):`);
    console.log(filaCoberturaBanco(basename(dirname(resolve(filePath))), data));
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
    const data = JSON.parse(readFileSync(ruta, 'utf8'));
    for (const a of advertenciasBancoAdvance(data)) console.warn(`   ⚠ ${a}`);
    console.log(`Cobertura de errorCatalogado (piso ${Math.round(PISO_COBERTURA_BANCO * 100)}% por banco):`);
    console.log(filaCoberturaBanco(basename(dirname(ruta)), data));
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

const referenciadosPorUnidad = idsReferenciadosPorUnidad(raiz);
for (const ruta of archivosDeCatalogoErrores(raiz)) {
  n++;
  const errores = validarCatalogoErrores(ruta);
  if (errores.length === 0) {
    const data = JSON.parse(readFileSync(ruta, 'utf8'));
    errores.push(...validarCoberturaCatalogo(data, referenciadosPorUnidad.get(data.unidad) ?? new Set()));
  }
  if (!reportar(ruta, errores)) ok = false;
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

const filasCoberturaBancos = [];
for (const ruta of archivosDeBancoAdvance(raiz)) {
  n++;
  const errores = validarBancoAdvance(ruta, erroresCatalogados);
  if (!reportar(ruta, errores)) ok = false;
  try {
    const data = JSON.parse(readFileSync(ruta, 'utf8'));
    if (errores.length === 0) for (const a of advertenciasBancoAdvance(data)) console.warn(`   ⚠ ${a}`);
    // El porcentaje se reporta siempre, pase o no el piso: es el dato que
    // dice cuánto del banco alimenta el diagnóstico.
    filasCoberturaBancos.push(filaCoberturaBanco(basename(dirname(ruta)), data));
  } catch {
    /* JSON inválido: validarBancoAdvance ya lo reportó arriba como FALLA */
  }
}

if (filasCoberturaBancos.length > 0) {
  console.log(`\nCobertura de errorCatalogado por banco Advance (piso ${Math.round(PISO_COBERTURA_BANCO * 100)}%, error bajo el piso):`);
  for (const fila of filasCoberturaBancos) console.log(fila);
}

if (n === 0) console.log('Sin archivos de contenido que validar (los que empiezan con "_" son plantillas y se omiten).');
process.exit(ok ? 0 : 1);
}
