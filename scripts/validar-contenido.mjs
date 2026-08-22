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

export function validarDatos(data) {
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

export function validarArchivo(ruta) {
  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return [`JSON inválido: ${e.message}`];
  }
  return validarDatos(data);
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

/**
 * Mapeo manual lección → unidad del DAG.
 *
 * El contrato de lección no declara a qué unidad pertenece: esa
 * correspondencia hoy solo existe en prosa, en docs/pendientes.md y
 * docs/calibracion-lecciones-e-items.md. Sin esta tabla, la regla de abajo no
 * tendría con qué comparar un content/errores/<unidad>.json contra el
 * catálogo embebido de su L1.
 *
 * Mantenla a mano al día: si se agrega un L1 nuevo con catalogoErrores y su
 * content/errores/<unidad>.json correspondiente, hay que sumar la entrada
 * acá. Sin ella, una divergencia entre ambos catálogos pasa desapercibida —
 * justo lo que esta regla existe para evitar.
 */
const MAPEO_LECCION_UNIDAD = {
  'enteros-operar-y-ordenar': 'enteros-racionales',
  // 'ecuaciones-lineales': 'ecuaciones-inecuaciones',  ← excluida a propósito (2026-08-03)
  //
  // Es la primera unidad donde content/errores/<unidad>.json pasa a ser la
  // ÚNICA fuente, que es lo que el commit 195bea7 decía querer ("catalogo de
  // errores como artefacto propio") pero no llegó a implementar: el espejo de
  // abajo dejó a los dos archivos acoplados como co-fuentes, no como canónico
  // + legado.
  //
  // El acople se volvió un bloqueo real cuando la unidad creció más allá de su
  // L1: las lecciones de inecuaciones aportaron error-6..error-10, que son
  // errores de desigualdades y NO tienen nada que hacer dentro del
  // catalogoErrores embebido de ecuaciones-lineales.json (una lección que no
  // enseña inecuaciones). Con la entrada activa, el espejo exigía copiarlos
  // ahí para que `npm run validar` pasara.
  //
  // Efecto de excluirla: el catalogoErrores embebido de ecuaciones-lineales.json
  // queda congelado como legado —se conserva, no se toca, y nadie lo compara
  // contra nada—, mientras content/errores/ecuaciones-inecuaciones.json crece
  // solo. Se pierde el guard antidivergencia para ESTA unidad; es el precio de
  // que el artefacto canónico pueda existir de verdad.
  //
  // Las otras dos unidades siguen con el espejo ACTIVO y no cambian de
  // comportamiento: enteros-racionales (vía enteros-operar-y-ordenar) y
  // funcion-lineal-afin (vía lineal-patrones-de-cambio). Cuando se migren —o
  // sea, cuando se les borre el catalogoErrores embebido a sus L1 y el
  // artefacto quede como única fuente— sus entradas salen de acá también y
  // este mapeo desaparece completo, junto con la regla de espejo.
  'lineal-patrones-de-cambio': 'funcion-lineal-afin',
};

function leccionesDe(unidad) {
  return Object.entries(MAPEO_LECCION_UNIDAD)
    .filter(([, u]) => u === unidad)
    .map(([leccionId]) => leccionId);
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

/** La raíz `content/` que contiene a `ruta`, para ubicar `content/lecciones/` desde ahí. */
function raizContentDe(ruta) {
  const partes = resolve(ruta).split(sep);
  const i = partes.lastIndexOf('content');
  return partes.slice(0, i + 1).join(sep);
}

/**
 * Valida un `content/errores/<unidad>.json`.
 *
 * Regla dura (2026-08-02): si la unidad también tiene catálogo embebido en su
 * L1 (`MAPEO_LECCION_UNIDAD`), los ids locales (sin el prefijo "<unidad>/") y
 * las descripciones deben coincidir exactamente entre ambos archivos. Es la
 * única fuente doble que existe hoy para el mismo error catalogado; que
 * diverjan en silencio sería tener dos versiones del mismo error sin que
 * nadie se entere. Divergencia = error, no warning.
 */
export function validarCatalogoErrores(ruta, dirLecciones) {
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

  const idsLocales = new Map(); // id local (sin prefijo) → descripción
  const prefijo = `${unidad}/`;
  lista.forEach((e, i) => {
    const p = `errores[${i}]`;
    if (!esTexto(e?.id)) return errores.push(`${p}: falta id`);
    if (!esTexto(e?.descripcion)) return errores.push(`${p}: falta descripcion`);
    if (!e.id.startsWith(prefijo)) return errores.push(`${p}: id "${e.id}" debe empezar con "${prefijo}"`);
    const local = e.id.slice(prefijo.length);
    if (idsLocales.has(local)) errores.push(`${p}: id local "${local}" duplicado`);
    idsLocales.set(local, e.descripcion);
  });
  if (errores.length > 0) return errores;

  for (const leccionId of leccionesDe(unidad)) {
    const rutaLeccion = join(dirLecciones, `${leccionId}.json`);
    if (!existsSync(rutaLeccion)) continue;
    let leccion;
    try {
      leccion = JSON.parse(readFileSync(rutaLeccion, 'utf8'));
    } catch {
      continue; // el validador de lecciones ya reporta ese JSON roto por su cuenta
    }
    const embebido = leccion?.catalogoErrores;
    if (!Array.isArray(embebido)) continue;

    const idsEmbebidos = new Map();
    for (const e of embebido) if (esTexto(e?.id)) idsEmbebidos.set(e.id, e.descripcion);

    for (const [local, descripcion] of idsLocales) {
      if (!idsEmbebidos.has(local)) {
        errores.push(`"${unidad}/${local}" no existe en catalogoErrores de ${leccionId}.json`);
      } else if (idsEmbebidos.get(local) !== descripcion) {
        errores.push(`"${unidad}/${local}" diverge de catalogoErrores de ${leccionId}.json (la descripción no coincide)`);
      }
    }
    for (const local of idsEmbebidos.keys()) {
      if (!idsLocales.has(local)) {
        errores.push(`catalogoErrores de ${leccionId}.json tiene "${local}", ausente en content/errores/${unidad}.json`);
      }
    }
  }

  return errores;
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
  const requiereValidacion = esContenido(filePath) || esErrores || esDag || esItem;
  if (!filePath || !existsSync(filePath) || !requiereValidacion) process.exit(0);

  let errores;
  let esLeccion = false;
  if (esErrores) {
    errores = validarCatalogoErrores(filePath, join(raizContentDe(filePath), 'lecciones'));
  } else if (esDag) {
    errores = validarDagM1Archivo(filePath);
  } else if (esItem) {
    const porRuta = validarBancoDiagnostico(raizContentDe(filePath));
    errores = porRuta.get(resolve(filePath)) ?? [];
  } else {
    errores = validarArchivo(filePath);
    esLeccion = true;
  }

  if (errores.length) {
    console.error(`El archivo de contenido ${filePath} no pasa la validación:`);
    for (const e of errores) console.error(` - ${e}`);
    if (esLeccion) {
      console.error('Corrige estos puntos antes de continuar (contrato: content/schema/leccion.schema.json).');
    }
    process.exit(2); // Claude Code recibe este error como feedback y corrige
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
  if (esCatalogoErrores(ruta)) {
    errores = validarCatalogoErrores(ruta, join(raizContentDe(ruta), 'lecciones'));
  } else if (esDagM1(ruta)) {
    errores = validarDagM1Archivo(ruta);
  } else if (esItemDiagnostico(ruta)) {
    const porRuta = validarBancoDiagnostico(raizContentDe(ruta));
    errores = porRuta.get(ruta) ?? [];
  } else {
    errores = validarArchivo(ruta);
  }
  process.exit(reportar(ruta, errores) ? 0 : 1);
}

const raiz = resolve(PROJECT_ROOT, 'content');
if (!existsSync(raiz)) {
  console.error(`No existe el directorio content/ en ${PROJECT_ROOT}.`);
  process.exit(1);
}
let ok = true;
let n = 0;
for (const ruta of archivosDeContenido(raiz)) {
  n++;
  if (!reportar(ruta, validarArchivo(ruta))) ok = false;
}
const dirLecciones = join(raiz, 'lecciones');
for (const ruta of archivosDeCatalogoErrores(raiz)) {
  n++;
  if (!reportar(ruta, validarCatalogoErrores(ruta, dirLecciones))) ok = false;
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

if (n === 0) console.log('Sin archivos de contenido que validar (los que empiezan con "_" son plantillas y se omiten).');
process.exit(ok ? 0 : 1);
}
