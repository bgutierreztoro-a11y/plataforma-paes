#!/usr/bin/env node
/**
 * Auditoría mecánica de lecciones — Plataforma M1
 * Cero dependencias. Node 18+.
 *
 * Uso:
 *   node scripts/auditar-leccion.mjs                       audita todas las lecciones
 *   node scripts/auditar-leccion.mjs <ruta.json>           audita una
 *   node scripts/auditar-leccion.mjs <ruta> --constante=40 fija la constante a mano
 *   node scripts/auditar-leccion.mjs --estricto            los 🟡 también fallan
 *
 * QUÉ ES Y QUÉ NO ES. Esto NO reemplaza a `npm run validar`: aquel mide el
 * contrato del schema (campos presentes, formato PAES, feedback mínimo). Este
 * mide las reglas que salieron de auditar L1 a mano y que ningún schema puede
 * expresar — que un distractor no colisione con una respuesta correcta, que la
 * constante no se filtre antes del descubrimiento, que los ids no delaten la
 * cifra. Son las reglas de docs/reglas-modulo.md, mecanizadas.
 *
 * Tampoco reemplaza a los subagentes de auditoría. Esto encuentra lo que se
 * puede decidir contando; `auditor-matematico` recalcula la aritmética y
 * `auditor-originalidad` compara contra el corpus. Los tres son necesarios y
 * ninguno cubre al otro.
 *
 * SEVERIDADES. 🔴 falla la corrida (exit 1). 🟡 se reporta y no falla, y hoy lo
 * usan dos chequeos. El de colisión numérica entre archivos, que tiene falsos
 * positivos conocidos y documentados: un dígito suelto reaparece de manera
 * legítima con otro significado y otras unidades (el 40 de esta unidad es «40 %»
 * en el módulo Porcentaje). Y el guard antidivergencia de catálogos, cuando la
 * lección no declara módulo en MODULO_POR_LECCION: ahí el chequeo se omite y lo
 * dice, en vez de comparar a ciegas contra catálogos de otro módulo. Con
 * --estricto los 🟡 también fallan.
 *
 * PARAMETRIZACIÓN. Opcionalmente la lección declara un bloque raíz `auditoria`:
 *
 *   "auditoria": {
 *     "constante": 40,
 *     "sliderJustificado": "por qué esta lección sí exige el slider",
 *     "camposAdimensionales": {
 *       "idDelCampo": "por qué este número no tiene magnitud que declarar"
 *     },
 *     "colisionesPermitidas": [
 *       { "valor": 40, "motivo": "es la constante: distractor antes del paso 5, respuesta en el paso 5" }
 *     ]
 *   }
 *
 * Es opcional y el schema lo admite (la raíz no cierra additionalProperties).
 * Sin `constante` declarada, el chequeo de filtración se salta y lo dice: se
 * prefiere un chequeo omitido y visible a uno adivinado y silencioso.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, basename, relative } from 'node:path';

const ORDEN_PASOS = [
  'curiosidad', 'problema', 'pensar', 'pistas', 'descubrimiento',
  'generalizacion', 'practica', 'aplicacion', 'reflexion', 'consolidacion',
];
const IDX_DESCUBRIMIENTO = ORDEN_PASOS.indexOf('descubrimiento');

/**
 * Claves cuyo valor NUNCA ve el estudiante: notas de diseño y andamiaje interno.
 * El chequeo de filtración de la constante las ignora a propósito — una nota que
 * discute el 40 no lo filtra, y prohibirlas ahí volvería inauditable el archivo.
 */
const CLAVES_INTERNAS = new Set(['notaDiseno', 'auditoria']);
const esClaveInterna = (k) => k.startsWith('_') || CLAVES_INTERNAS.has(k);

// ---------------------------------------------------------------- utilidades

/**
 * Convierte a número un literal escrito en formato español: "1.980" → 1980,
 * "12,5" → 12.5, "20.800" → 20800. El punto es separador de miles y la coma
 * decimal, al revés que en JS — parsearlo con Number() daría 1.98 y 12.
 */
function aNumero(texto) {
  const t = String(texto).trim();
  if (!/^\d[\d.,]*$/.test(t)) return null;
  let limpio = t;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) limpio = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d+,\d+$/.test(t)) limpio = t.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) limpio = t.replace(/\./g, '');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/**
 * Número de una alternativa SOLO si su texto es una cifra con unidad opcional
 * ("242 mL", "12,5"). Devuelve null para "b = 23 · p" o para una afirmación en
 * prosa: ahí no hay un valor que pueda colisionar con otro valor, y forzar la
 * extracción metería ruido (el 23 de una fórmula no es una respuesta numérica).
 */
function valorDeAlternativa(texto) {
  const m = String(texto ?? '').trim().match(/^([\d.,]+)\s*[^\d]*$/);
  return m ? aNumero(m[1]) : null;
}

/** Recorre el JSON acumulando [ruta, string] de todo texto visible al estudiante. */
function* textosVisibles(nodo, ruta = '') {
  if (typeof nodo === 'string') {
    yield [ruta, nodo];
    return;
  }
  if (Array.isArray(nodo)) {
    for (let i = 0; i < nodo.length; i++) yield* textosVisibles(nodo[i], `${ruta}[${i}]`);
    return;
  }
  if (nodo && typeof nodo === 'object') {
    for (const [k, v] of Object.entries(nodo)) {
      if (esClaveInterna(k)) continue;
      yield* textosVisibles(v, ruta ? `${ruta}.${k}` : k);
    }
  }
}

/**
 * ¿Aparece `n` como número suelto dentro de `texto`?
 *
 * Los lookarounds descartan "140", "40,8" y "$40.000" cuando se busca 40, pero
 * SÍ aceptan "el resultado es 40." — el punto final de una oración no continúa
 * el número. Distinguir esos dos casos es todo el chequeo: una versión anterior
 * excluía cualquier punto pegado y se le escapaba la constante al final de
 * frase, que es exactamente donde más suele aparecer.
 */
function apareceComoNumeroSuelto(texto, n) {
  const variantes = new Set([String(n)]);
  if (Number.isInteger(n) && n >= 1000) {
    variantes.add(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  }
  if (!Number.isInteger(n)) variantes.add(String(n).replace('.', ','));
  for (const v of variantes) {
    const escapado = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?<!\\d)(?<!\\d[.,])${escapado}(?!\\d)(?![.,]\\d)`).test(texto)) return true;
  }
  return false;
}

/**
 * Todos los números sueltos de un texto, ya normalizados desde formato español.
 * Las fechas ISO se borran antes: los contextosNumericos llevan fechas de
 * decisión ("2026-08-13") y sin esto el 2026 aparecía como cifra compartida
 * entre lecciones, que es ruido puro.
 */
function numerosDe(texto) {
  const out = [];
  const limpio = String(texto).replace(/\d{4}-\d{2}-\d{2}/g, ' ');
  for (const m of limpio.matchAll(/\d[\d.,]*\d|\d/g)) {
    const n = aNumero(m[0].replace(/[.,]$/, ''));
    if (n !== null) out.push(n);
  }
  return out;
}

const bloquesDe = (data) => (data?.pasos ?? []).flatMap((paso, i) =>
  (paso?.bloques ?? []).map((bloque, j) => ({ paso, i, bloque, j, donde: `paso ${i + 1} (${paso?.tipo})/bloque ${j + 1}` })));

// ---------------------------------------------------------------- chequeos

/** 1. Referencias colgando del catálogo, e ids catalogados que nadie usa. */
function chequearCatalogoErrores(data, add) {
  const catalogo = data?.catalogoErrores;
  if (!Array.isArray(catalogo)) return; // unidad sin catálogo embebido: nada que cruzar
  const ids = new Set(catalogo.map((e) => e?.id).filter(Boolean));
  const usados = new Map(); // id → [donde]

  const registrar = (id, donde) => {
    if (!id) return;
    usados.set(id, [...(usados.get(id) ?? []), donde]);
    if (!ids.has(id)) add('🔴', 'catalogo-colgando', `errorCatalogado "${id}" no existe en catalogoErrores (${donde})`);
  };

  for (const { bloque, donde } of bloquesDe(data)) {
    for (const o of bloque?.opciones ?? []) {
      if (o && typeof o === 'object' && o.esCorrecta !== true) registrar(o.errorCatalogado, `${donde}, opción ${o.id}`);
    }
    for (const f of bloque?.feedbackPorError ?? []) registrar(f?.errorCatalogado, `${donde}, valor ${f?.valorObtenido}`);
  }
  for (const it of data?.itemsPAES ?? []) {
    for (const a of it?.alternativas ?? []) {
      if (a?.esCorrecta !== true) registrar(a?.errorCatalogado, `${it.id}, alternativa ${a?.clave}`);
    }
  }

  for (const id of ids) {
    if (!usados.has(id)) add('🔴', 'catalogo-sin-usar', `"${id}" está en catalogoErrores pero ningún distractor lo usa`);
  }
}

/**
 * 2. Ningún distractor puede valer lo mismo que alguna respuesta correcta del
 * archivo. Es la regla que costó tres iteraciones en L1: el distractor 280 del
 * paso 2 colisionaba con la respuesta correcta de baseLote7 en el paso 5, y un
 * estudiante que escribiera 280 recibía feedback de error por un número que la
 * lección iba a declarar correcto dos pasos después.
 */
function chequearColisionDistractorCorrecta(data, add) {
  const correctas = new Map(); // valor → [donde]
  const distractores = new Map();
  const sumar = (mapa, valor, donde) => {
    if (valor === null || valor === undefined) return;
    mapa.set(valor, [...(mapa.get(valor) ?? []), donde]);
  };

  for (const { bloque, donde } of bloquesDe(data)) {
    for (const c of bloque?.campos ?? []) sumar(correctas, c?.respuestaCorrecta, `${donde}, campo ${c?.id}`);
    for (const o of bloque?.opciones ?? []) {
      if (!o || typeof o !== 'object') continue;
      const v = valorDeAlternativa(o.texto);
      sumar(o.esCorrecta === true ? correctas : distractores, v, `${donde}, opción ${o.id}`);
    }
    for (const f of bloque?.feedbackPorError ?? []) sumar(distractores, f?.valorObtenido, `${donde}, feedbackPorError`);
  }
  for (const it of data?.itemsPAES ?? []) {
    for (const a of it?.alternativas ?? []) {
      const v = valorDeAlternativa(a?.texto);
      sumar(a?.esCorrecta === true ? correctas : distractores, v, `${it.id}, alternativa ${a?.clave}`);
    }
  }

  const permitidas = new Map(
    (data?.auditoria?.colisionesPermitidas ?? []).map((c) => [c?.valor, c?.motivo]),
  );

  for (const [valor, dondeD] of distractores) {
    if (!correctas.has(valor)) continue;
    if (permitidas.has(valor)) {
      add('🟢', 'colision-declarada', `${valor} colisiona pero está declarado en auditoria.colisionesPermitidas: ${permitidas.get(valor)}`);
      continue;
    }
    add('🔴', 'colision-distractor-correcta',
      `${valor} es distractor en [${dondeD.join('; ')}] y respuesta correcta en [${correctas.get(valor).join('; ')}]`);
  }
}

/**
 * 3. La constante no puede circular antes del descubrimiento — ni en enunciados,
 * ni en pistas, ni en feedback de selección múltiple. Si el estudiante puede
 * leerla, el paso 5 deja de ser un descubrimiento y pasa a ser una confirmación.
 *
 * Única excepción admitida (regla fijada en L1): un `feedbackPorError` cuyo
 * `valorObtenido` ES la constante, porque solo se dispara cuando el estudiante
 * ya escribió ese número por su cuenta. Su `mensaje` igual no puede repetirlo.
 */
function chequearFiltracionConstante(data, constante, add) {
  if (constante === null) {
    add('🟢', 'constante-no-declarada', 'sin auditoria.constante ni --constante: chequeo de filtración OMITIDO');
    return;
  }
  const pasos = data?.pasos ?? [];
  for (let i = 0; i < Math.min(IDX_DESCUBRIMIENTO, pasos.length); i++) {
    const paso = pasos[i];
    for (let j = 0; j < (paso?.bloques ?? []).length; j++) {
      const bloque = paso.bloques[j];
      const donde = `paso ${i + 1} (${paso?.tipo})/bloque ${j + 1}`;

      for (const f of bloque?.feedbackPorError ?? []) {
        if (f?.valorObtenido === constante && apareceComoNumeroSuelto(String(f?.mensaje ?? ''), constante)) {
          add('🔴', 'constante-filtrada', `${donde}: el feedback del valor ${constante} repite la cifra en su texto (debe decir "ese número")`);
        }
      }

      for (const [ruta, texto] of textosVisibles(bloque, donde)) {
        if (ruta.includes('feedbackPorError')) continue; // ya evaluado arriba, con su excepción
        if (apareceComoNumeroSuelto(texto, constante)) {
          add('🔴', 'constante-filtrada', `${donde}: la constante ${constante} aparece en ${ruta}`);
        }
      }
    }
  }
}

/**
 * 4. Todo campo numérico declara unidad; ningún id de campo lleva la cifra dentro.
 *
 * EXCEPCIÓN ADIMENSIONAL (2026-08-14). La regla se escribió cuando todo el
 * contenido medía magnitudes físicas —mililitros, butacas, toneladas— y un campo
 * sin unidad era siempre un descuido. No cubre el contenido cuyos números no
 * tienen magnitud: en el módulo Expresiones algebraicas «73 × 73» no se mide en
 * nada, y lo mismo pasa en buena parte del eje Números. Inventarle una unidad a
 * esos campos haría pasar el chequeo mintiendo y dejaría el precedente de que la
 * unidad es un trámite.
 *
 * Por eso la salida es una excepción DECLARADA, mismo patrón que
 * `auditoria.sliderJustificado`: la lección lista los campos adimensionales con
 * su motivo en `auditoria.camposAdimensionales`, uno por campo, y con eso el
 * chequeo pasa y deja rastro verde en vez de silencio. Un campo sin unidad que
 * no esté declarado sigue siendo 🔴.
 */
function chequearCamposNumericos(data, add) {
  const adimensionales = data?.auditoria?.camposAdimensionales ?? {};
  for (const { bloque, donde } of bloquesDe(data)) {
    if (bloque?.tipo !== 'numerica') continue;
    for (const c of bloque?.campos ?? []) {
      if (typeof c?.unidad !== 'string' || c.unidad.trim() === '') {
        const motivo = adimensionales[c?.id];
        if (typeof motivo === 'string' && motivo.trim().length >= 20) {
          add('🟢', 'campo-adimensional', `${donde}: el campo "${c?.id}" no lleva unidad y está declarado en auditoria.camposAdimensionales`);
        } else {
          add('🔴', 'campo-sin-unidad', `${donde}: el campo "${c?.id}" no declara unidad. Si su número no tiene magnitud, decláralo en auditoria.camposAdimensionales con un motivo de ≥20 caracteres`);
        }
      }
      if (/\d/.test(String(c?.id ?? ''))) {
        add('🔴', 'id-con-cifra', `${donde}: el id "${c?.id}" contiene una cifra; los ids son neutros (regla de docs/reglas-modulo.md)`);
      }
    }
  }
}

/** 5. Ningún slider salvo que el archivo declare por qué su concepto lo exige. */
function chequearSlider(data, permitidoPorFlag, add) {
  const justificacion = data?.auditoria?.sliderJustificado;
  const declarado = permitidoPorFlag || (typeof justificacion === 'string' && justificacion.trim().length >= 20);
  for (const { bloque, donde } of bloquesDe(data)) {
    if (bloque?.tipo !== 'interactivoSlider') continue;
    if (declarado) add('🟢', 'slider-justificado', `${donde}: slider presente y declarado`);
    else add('🔴', 'slider-no-justificado', `${donde}: hay interactivoSlider sin auditoria.sliderJustificado (≥20 caracteres). No se usa una representación de función lineal en una lección cuyo concepto no la exige`);
  }
}

/** 6. Los 10 pasos, en el orden exacto del MOS. */
function chequearOrdenPasos(data, add) {
  const pasos = data?.pasos;
  if (!Array.isArray(pasos) || pasos.length !== ORDEN_PASOS.length) {
    add('🔴', 'pasos', `se esperan ${ORDEN_PASOS.length} pasos (hay ${Array.isArray(pasos) ? pasos.length : 0})`);
    return;
  }
  pasos.forEach((p, i) => {
    if (p?.tipo !== ORDEN_PASOS[i]) add('🔴', 'pasos', `pasos[${i}] es "${p?.tipo}" y debe ser "${ORDEN_PASOS[i]}"`);
  });
}

/** 7. Distribución de habilidades (calibración §3.5) y perfil de dificultad (§5.1). */
function chequearItemsPAES(data, add) {
  const items = data?.itemsPAES;
  if (!Array.isArray(items) || items.length < 2 || items.length > 3) {
    add('🔴', 'items', `se esperan 2–3 itemsPAES (hay ${Array.isArray(items) ? items.length : 0})`);
    return;
  }
  const hab = items.map((i) => i?.habilidad);
  const dif = items.map((i) => i?.dificultad);

  if (new Set(hab).size === 1) {
    add('🔴', 'habilidades', `los ${items.length} ítems son de la misma habilidad ("${hab[0]}"); §3.5 lo prohíbe`);
  } else if (!hab.includes('resolver')) {
    add('🔴', 'habilidades', `falta un ítem de "resolver" (§3.5); hay: ${hab.join(', ')}`);
  } else if (items.length === 2 && !hab.some((h) => h === 'representar' || h === 'argumentar')) {
    add('🔴', 'habilidades', `con 2 ítems se exige resolver + (representar|argumentar); hay: ${hab.join(', ')}`);
  } else if (items.length === 3) {
    if (!hab.includes('argumentar')) add('🔴', 'habilidades', `con 3 ítems se exige uno de "argumentar" (§3.5); hay: ${hab.join(', ')}`);
    if (!hab.some((h) => h === 'modelar' || h === 'representar')) {
      add('🔴', 'habilidades', `con 3 ítems se exige uno de "modelar" o "representar" (§3.5); hay: ${hab.join(', ')}`);
    }
  }

  if (dif.every((d) => d === 'baja')) {
    add('🔴', 'dificultad', 'todos los ítems son de dificultad baja; el cierre debe ser representativo (§5.1)');
  } else if (items.length === 2) {
    if (dif[0] !== 'media' || !['media', 'alta'].includes(dif[1])) {
      add('🔴', 'dificultad', `con 2 ítems se espera media + (media|alta); hay: ${dif.join(', ')}`);
    }
  } else if (!['baja', 'media'].includes(dif[0]) || dif[1] !== 'media' || dif[2] !== 'alta') {
    add('🔴', 'dificultad', `con 3 ítems se espera (baja|media), media, alta; hay: ${dif.join(', ')}`);
  }
}

/**
 * Mapeo manual lección → módulo, para el guard antidivergencia de abajo.
 *
 * El contrato de lección no declara a qué módulo pertenece —igual que pasa en
 * scripts/validar-contenido.mjs con MAPEO_LECCION_UNIDAD, y por la misma
 * razón—, así que la correspondencia vive acá a mano. No se deriva del id ni
 * del nombre de archivo a propósito: `lineal-patrones-de-cambio` y
 * `lineal-pendiente-e-intercepto` comparten módulo sin compartir prefijo
 * completo, y `ecuaciones-lineales` no lleva ninguno.
 *
 * Manténlo al día: una lección con catalogoErrores que no esté acá se reporta
 * como chequeo omitido (🟡) en vez de compararse a ciegas. Comparar catálogos
 * de módulos distintos daría puro ruido, porque los ids son locales al módulo
 * ("error-1" significa cosas distintas en Enteros y en Proporcionalidad).
 *
 * OJO con las entradas de cierre: hoy NO cubren nada. Este auditor solo mira
 * `content/lecciones/` por los dos lados —`archivosDeLeccion()` lee ese único
 * directorio, así que la corrida por defecto nunca ve un cierre y pasarle uno a
 * mano corta en el chequeo de `tipo`; y el bucle del guard de abajo itera sobre
 * esa misma función, así que un cierre tampoco entra jamás como el "otro"
 * archivo con el que comparar—. O sea que un cierre con catálogo embebido puede
 * divergir de las lecciones de su módulo sin que nada lo reporte, y ya pasa:
 * `cierre-proporcionalidad.json` lleva 11 entradas y ninguna se compara contra
 * las de sus tres lecciones. `cierre-expresiones-algebraicas` está registrado
 * por adelantado para cuando eso se cierre, que es ensanchar el auditor a
 * cierres, no agregar entradas a esta tabla. Anotado en docs/pendientes.md.
 */
const MODULO_POR_LECCION = {
  'ecuaciones-lineales': 'ecuaciones-inecuaciones',
  'enteros-operar-y-ordenar': 'enteros-racionales',
  'expresiones-sumar-lo-que-se-parece': 'expresiones-algebraicas',
  'expresiones-rectangulo': 'expresiones-algebraicas',
  'expresiones-deshacer-producto': 'expresiones-algebraicas',
  'cierre-expresiones-algebraicas': 'expresiones-algebraicas',
  'lineal-patrones-de-cambio': 'funcion-lineal-afin',
  'lineal-pendiente-e-intercepto': 'funcion-lineal-afin',
  'proporcionalidad-directa': 'proporcionalidad',
  'proporcionalidad-inversa': 'proporcionalidad',
  'proporcionalidad-reconocer': 'proporcionalidad',
  'potencias-multiplicar-corto': 'potencias-raices',
  'potencias-raiz-escondida': 'potencias-raices',
  'potencias-problemas-en-contexto': 'potencias-raices',
};

/**
 * 8b. Guard antidivergencia entre catálogos embebidos del MISMO módulo.
 *
 * Desde la decisión de arquitectura del 2026-08-14 (docs/reglas-modulo.md §5),
 * cada lección embebe el subconjunto del catálogo de su módulo que realmente
 * usa, copiado literalmente. Eso es lo único que hace funcionar la Capa 2 del
 * feedback, porque lib/sanitizar.ts resuelve `errorCatalogado` estrictamente
 * contra el catálogo del mismo archivo — pero crea una fuente doble sin dueño.
 *
 * Este chequeo es el precio de esa decisión: si dos lecciones del mismo módulo
 * declaran el mismo id, la descripción tiene que coincidir carácter a carácter.
 * Que diverjan en silencio sería tener dos versiones del mismo error catalogado
 * sin que nadie se entere, y el estudiante vería una u otra según por qué
 * lección haya entrado. Divergencia = 🔴, no advertencia.
 *
 * Un id reciclado con otro significado dentro del mismo módulo cae acá también,
 * y es el mismo defecto visto desde el otro lado: los ids son únicos por módulo.
 */
function chequearDivergenciaDeCatalogo(data, rutaPropia, raizContent, add) {
  const propio = data?.catalogoErrores;
  if (!Array.isArray(propio) || propio.length === 0) return;

  const modulo = MODULO_POR_LECCION[data?.id];
  if (!modulo) {
    add('🟡', 'catalogo-modulo-no-declarado',
      `"${data?.id}" tiene catalogoErrores pero no está en MODULO_POR_LECCION: guard antidivergencia OMITIDO`);
    return;
  }

  const mios = new Map();
  for (const e of propio) if (e?.id) mios.set(e.id, e.descripcion);

  for (const ruta of archivosDeLeccion(raizContent)) {
    if (resolve(ruta) === resolve(rutaPropia)) continue;
    let otro;
    try {
      otro = JSON.parse(readFileSync(ruta, 'utf8'));
    } catch {
      continue; // ese JSON roto ya lo reporta `npm run validar`
    }
    if (MODULO_POR_LECCION[otro?.id] !== modulo) continue;
    if (!Array.isArray(otro?.catalogoErrores)) continue;

    for (const e of otro.catalogoErrores) {
      if (!e?.id || !mios.has(e.id)) continue;
      if (mios.get(e.id) !== e.descripcion) {
        add('🔴', 'catalogo-divergente',
          `"${e.id}" tiene una descripción distinta en ${basename(ruta)} (mismo módulo "${modulo}"): las copias embebidas se copian literalmente y los ids no se reciclan con otro significado`);
      }
    }
  }
}

/**
 * 8. Colisión de cifras distintivas contra los contextosNumericos de las demás
 * lecciones. Distintiva = ≥100 o con decimales: por debajo de eso los dígitos
 * se repiten por azar y el chequeo no diría nada.
 *
 * Es 🟡 y no 🔴 a propósito. Un mismo dígito reaparece de forma legítima con
 * otro significado y otras unidades, y el script no puede distinguir "240
 * estudiantes" de "240 mL". Lo que entrega es una lista corta para revisar a
 * ojo, no un veredicto.
 */
function chequearColisionEntreArchivos(data, rutaPropia, raizContent, add) {
  const propios = new Set();
  for (const c of data?.contextosNumericos ?? []) {
    for (const n of numerosDe(c)) if (n >= 100 || !Number.isInteger(n)) propios.add(n);
  }
  if (propios.size === 0) return;

  for (const ruta of archivosDeLeccion(raizContent)) {
    if (resolve(ruta) === resolve(rutaPropia)) continue;
    let otro;
    try {
      otro = JSON.parse(readFileSync(ruta, 'utf8'));
    } catch {
      continue; // ese JSON roto ya lo reporta `npm run validar`
    }
    const ajenos = new Set();
    for (const c of otro?.contextosNumericos ?? []) for (const n of numerosDe(c)) ajenos.add(n);
    const comunes = [...propios].filter((n) => ajenos.has(n)).sort((a, b) => a - b);
    if (comunes.length) {
      add('🟡', 'colision-entre-archivos', `${basename(ruta)} comparte cifras en contextosNumericos: ${comunes.join(', ')}`);
    }
  }
}

// ---------------------------------------------------------------- corrida

function* archivosDeLeccion(raizContent) {
  const dir = join(raizContent, 'lecciones');
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory() || !ent.name.endsWith('.json') || ent.name.startsWith('_')) continue;
    yield join(dir, ent.name);
  }
}

function auditar(ruta, opciones, raizContent) {
  const hallazgos = [];
  const add = (severidad, chequeo, detalle) => hallazgos.push({ severidad, chequeo, detalle });

  let data;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    add('🔴', 'json', `JSON inválido: ${e.message}`);
    return hallazgos;
  }
  if (data?.tipo !== 'leccion') {
    add('🔴', 'tipo', `este auditor solo audita lecciones (tipo: ${JSON.stringify(data?.tipo)})`);
    return hallazgos;
  }

  const constante = opciones.constante ?? (typeof data?.auditoria?.constante === 'number' ? data.auditoria.constante : null);

  chequearOrdenPasos(data, add);
  chequearCatalogoErrores(data, add);
  chequearColisionDistractorCorrecta(data, add);
  chequearFiltracionConstante(data, constante, add);
  chequearCamposNumericos(data, add);
  chequearSlider(data, opciones.permitirSlider, add);
  chequearItemsPAES(data, add);
  chequearDivergenciaDeCatalogo(data, ruta, raizContent, add);
  chequearColisionEntreArchivos(data, ruta, raizContent, add);

  return hallazgos;
}

function imprimir(ruta, hallazgos, raiz) {
  const rel = relative(raiz, ruta) || ruta;
  const rojos = hallazgos.filter((h) => h.severidad === '🔴');
  const amarillos = hallazgos.filter((h) => h.severidad === '🟡');
  if (rojos.length === 0 && amarillos.length === 0) {
    console.log(`🟢 ${rel} — sin hallazgos`);
  } else {
    console.log(`${rojos.length ? '🔴' : '🟡'} ${rel} — ${rojos.length} bloqueante(s), ${amarillos.length} advertencia(s)`);
  }
  for (const h of hallazgos) {
    if (h.severidad === '🟢' && !process.env.AUDITAR_VERBOSE) continue;
    console.log(`   ${h.severidad} [${h.chequeo}] ${h.detalle}`);
  }
  return rojos.length === 0;
}

const argv = process.argv.slice(2);

// Una flag mal escrita ("--constate=40") no puede pasar en silencio: dejaría el
// chequeo de filtración omitido y la corrida en verde por la razón equivocada.
const FLAGS = ['--estricto', '--permitir-slider'];
const desconocida = argv.find((a) => a.startsWith('--') && !FLAGS.includes(a) && !a.startsWith('--constante='));
if (desconocida) {
  console.error(`Flag desconocida: ${desconocida}`);
  console.error(`Uso: node scripts/auditar-leccion.mjs [<ruta.json>...] [--constante=N] [${FLAGS.join('] [')}]`);
  process.exit(1);
}

const opciones = {
  estricto: argv.includes('--estricto'),
  permitirSlider: argv.includes('--permitir-slider'),
  constante: null,
};
const flagConstante = argv.find((a) => a.startsWith('--constante='));
if (flagConstante) {
  const n = aNumero(flagConstante.split('=')[1]);
  if (n === null) {
    console.error(`--constante inválida: ${flagConstante.split('=')[1]}`);
    process.exit(1);
  }
  opciones.constante = n;
}

const rutas = argv.filter((a) => !a.startsWith('--')).map((a) => resolve(a));
const raizProyecto = process.cwd();
const raizContent = resolve(raizProyecto, 'content');

if (!existsSync(raizContent)) {
  console.error('No existe content/ en el directorio actual.');
  process.exit(1);
}

let objetivos = rutas;
if (objetivos.length === 0) {
  objetivos = [...archivosDeLeccion(raizContent)].map((r) => resolve(r));
  if (objetivos.length === 0) {
    console.log('Sin lecciones que auditar.');
    process.exit(0);
  }
} else {
  for (const r of objetivos) {
    if (!existsSync(r) || !statSync(r).isFile()) {
      console.error(`No existe: ${r}`);
      process.exit(1);
    }
  }
}

let ok = true;
let totalAmarillos = 0;
for (const ruta of objetivos) {
  const hallazgos = auditar(ruta, opciones, raizContent);
  totalAmarillos += hallazgos.filter((h) => h.severidad === '🟡').length;
  if (!imprimir(ruta, hallazgos, raizProyecto)) ok = false;
}

if (opciones.estricto && totalAmarillos > 0) {
  console.error(`\n--estricto: ${totalAmarillos} advertencia(s) 🟡 cuentan como falla.`);
  ok = false;
}
process.exit(ok ? 0 : 1);
