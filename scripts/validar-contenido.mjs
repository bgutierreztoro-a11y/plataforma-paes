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
 * Exigencia gradual según "estado":
 *   borrador   → estructura básica (tipo, estado, orden de los 10 pasos si existen)
 *   revision   → contrato completo (todos los campos, feedback en cada distractor)
 *   publicable → además: checklist de originalidad, revisión matemática,
 *                declaración de originalidad real y cero placeholders
 *
 * En modo hook lee el evento por stdin (tool_input.file_path) o CLAUDE_FILE_PATH.
 * Si el archivo editado es contenido y no valida, sale con código 2 para que
 * Claude Code reciba el error como feedback y lo corrija.
 *
 * checklistOriginalidad.revisadoPor, revisionMatematica.revisadoPor y estado
 * los escribe siempre a mano el autor humano, después de leer el resultado
 * de una auditoría real. Ningún proceso automático los escribe.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, basename, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORDEN_PASOS = [
  'curiosidad', 'problema', 'pensar', 'pistas', 'descubrimiento',
  'generalizacion', 'practica', 'aplicacion', 'reflexion', 'consolidacion',
];
const HABILIDADES = ['resolver', 'modelar', 'representar', 'argumentar'];
const DIFICULTADES = ['baja', 'media', 'alta'];
const CLAVES = ['A', 'B', 'C', 'D'];
const ITEMS_POR_TIPO = { leccion: [2, 3], diagnostico: [5, 5], cierre: [8, 8] };
const NIVEL = { borrador: 0, revision: 1, publicable: 2 };
// Solo marcadores explícitos en MAYÚSCULAS: en español "todo" y "pendiente" son
// palabras normales (¡"pendiente" es el concepto central del módulo!).
const PLACEHOLDERS = /\b(TODO|FIXME|PLACEHOLDER|XXX)\b|\[PENDIENTE\]|lorem ipsum/;
const MIN_FEEDBACK_PUBLICABLE = 40; // el feedback artesanal no puede ser un placeholder

const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;

function validarItem(item, i, campo, nivel, errores) {
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
      } else if (nivel >= 2 && a.feedback.trim().length < MIN_FEEDBACK_PUBLICABLE) {
        errores.push(`${q}: feedback demasiado corto para publicar (<${MIN_FEEDBACK_PUBLICABLE} caracteres); debe explicar el error específico`);
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
  const nivel = NIVEL[data?.estado];
  if (nivel === undefined) {
    return [`"estado" debe ser borrador, revision o publicable (recibido: ${JSON.stringify(data?.estado)})`];
  }

  // El orden pedagógico se protege desde el borrador: si hay pasos, son 10 y en orden.
  if (tipo === 'leccion' && data.pasos !== undefined) {
    const pasos = data.pasos;
    if (!Array.isArray(pasos) || pasos.length !== 10) {
      errores.push(`pasos: deben ser exactamente 10 en el orden pedagógico del MOS (hay ${Array.isArray(pasos) ? pasos.length : 0})`);
    } else {
      pasos.forEach((paso, i) => {
        if (paso?.tipo !== ORDEN_PASOS[i]) {
          errores.push(`pasos[${i}].tipo: debe ser "${ORDEN_PASOS[i]}" (recibido: ${JSON.stringify(paso?.tipo)})`);
        }
        if (nivel >= 1) {
          if (!esTexto(paso?.titulo)) errores.push(`pasos[${i}]: falta titulo`);
          if (!Array.isArray(paso?.bloques) || paso.bloques.length === 0) {
            errores.push(`pasos[${i}]: falta bloques[] con al menos un bloque`);
          }
        }
      });
    }
  }

  if (nivel === 0) return errores; // borrador: libertad para redactar

  // revision y publicable: contrato completo
  if (!esTexto(data?.id)) errores.push('falta id');
  if (!esTexto(data?.titulo)) errores.push('falta titulo');

  if (tipo === 'leccion') {
    if (data.pasos === undefined) errores.push('faltan los 10 pasos');
    if (!esTexto(data?.objetivo)) errores.push('falta objetivo');
    if (!(Number.isFinite(data?.tiempoEstimadoMin) && data.tiempoEstimadoMin > 0)) errores.push('falta tiempoEstimadoMin (> 0)');
    if (!Array.isArray(data?.prerrequisitos)) errores.push('falta prerrequisitos[]');
    if (!Array.isArray(data?.conceptos)) errores.push('falta conceptos[]');
  }

  const campoItems = tipo === 'leccion' ? 'itemsPAES' : 'items';
  const items = data?.[campoItems];
  const [min, max] = ITEMS_POR_TIPO[tipo];
  if (!Array.isArray(items) || items.length < min || items.length > max) {
    const esperado = min === max ? `${min}` : `${min}–${max}`;
    errores.push(`${campoItems}: se esperan ${esperado} ítems (hay ${Array.isArray(items) ? items.length : 0})`);
  } else {
    items.forEach((it, i) => validarItem(it, i, campoItems, nivel, errores));
  }

  const prov = data?.proveniencia;
  if (!prov || !Array.isArray(prov.fuentesAnalisis) || typeof prov.declaracionOriginalidad !== 'string') {
    errores.push('falta proveniencia { fuentesAnalisis[], declaracionOriginalidad } (MOS §7.2)');
  }

  if (nivel >= 2) {
    if (!prov || prov.declaracionOriginalidad.trim().length < 30) {
      errores.push('publicable requiere una declaración de originalidad real (≥30 caracteres) en proveniencia');
    }

    const ck = data?.checklistOriginalidad || {};
    for (const campo of ['enunciadosOriginales', 'diagramasOriginales', 'secuenciaOriginal', 'provenienciaRegistrada']) {
      if (ck[campo] !== true) errores.push(`publicable requiere checklistOriginalidad.${campo} = true (MOS §7.3)`);
    }
    if (!esTexto(ck.revisadoPor)) errores.push('publicable requiere checklistOriginalidad.revisadoPor');

    const rm = data?.revisionMatematica || {};
    if (rm.aprobada !== true) {
      errores.push('publicable requiere revisionMatematica.aprobada = true (recalcular todo desde cero)');
    }
    if (!esTexto(rm.revisadoPor)) errores.push('publicable requiere revisionMatematica.revisadoPor');

    if (PLACEHOLDERS.test(JSON.stringify(data))) {
      errores.push('publicable no admite marcadores de trabajo pendiente (TODO, FIXME, [PENDIENTE], XXX, lorem ipsum)');
    }
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

function esContenido(ruta) {
  const partes = resolve(ruta).split(sep);
  return (
    /\.json$/i.test(ruta) &&
    partes.includes('content') &&
    !partes.includes('schema') &&
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

  if (!filePath || !existsSync(filePath) || !esContenido(filePath)) process.exit(0);

  const errores = validarArchivo(filePath);
  if (errores.length) {
    console.error(`El archivo de contenido ${filePath} no pasa la validación:`);
    for (const e of errores) console.error(` - ${e}`);
    console.error('Corrige estos puntos antes de continuar (contrato: content/schema/leccion.schema.json).');
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
  process.exit(reportar(ruta, validarArchivo(ruta)) ? 0 : 1);
}

const raiz = resolve(process.cwd(), 'content');
if (!existsSync(raiz)) {
  console.error('No existe el directorio content/ en el directorio actual.');
  process.exit(1);
}
let ok = true;
let n = 0;
for (const ruta of archivosDeContenido(raiz)) {
  n++;
  if (!reportar(ruta, validarArchivo(ruta))) ok = false;
}
if (n === 0) console.log('Sin archivos de contenido que validar (los que empiezan con "_" son plantillas y se omiten).');
process.exit(ok ? 0 : 1);
}
