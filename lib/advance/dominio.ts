/**
 * Ciclo de vida del error (docs/fobos-advance.md §6.3) sobre el knowledge
 * tracing bayesiano de docs/doctrina-aprendizaje-fobos.md P10 (Corbett &
 * Anderson, 1995). Puro: sin React, sin acceso a datos y sin reloj. Todo
 * instante entra como parámetro en milisegundos; acá no hay `Date.now()` ni
 * `new Date()`, y por eso la regla de 24 horas se prueba con instantes falsos.
 *
 * El estado se calcula al vuelo desde las filas de `advance_descartes` cruzadas
 * con el banco (decisión firmada 2026-09-12: no existe tabla `estado_error`).
 * Quien llama arma un `ItemResuelto` por fila; este módulo no sabe de SQL.
 *
 * SEÑALES POR ÍTEM (decisión D5, 2026-09-12). Un distractor descartado
 * correctamente es un acierto sobre su error. Si el ítem terminó en descarte
 * fatal, los distractores que seguían en pie en ese momento reciben fracaso.
 * Un error nunca recibe las dos cosas en el mismo ítem: el acierto gana. Sin
 * fatal no hay fracaso, y el ítem completo son tres aciertos. Los errores se
 * resuelven desde el banco (`distractores`), no desde `errores_identificados`,
 * para que aciertos y fracasos salgan de una sola derivación.
 *
 * ORDEN DE LAS ACTUALIZACIONES (decisión 1, Op1, 2026-09-12). BKT es secuencial
 * y no conmuta: desde p(L0)=0,30, acierto→fracaso da 0,328 y fracaso→acierto
 * 0,547. Las filas de una sesión comparten `creado_en` y el orden real de los
 * ítems no se persiste (docs/pendientes.md). Regla: cronológico por instante;
 * a igual instante, para cada error, primero todos sus aciertos y al final sus
 * fracasos. Es la permutación que termina más baja en los casos medidos, así
 * que nunca cierra un error que el orden real no habría cerrado, y se explica
 * en una frase: si en la sesión cometiste el error, queda abierto.
 *
 * CIERRE Y RECAÍDA. Cerrar exige las dos cosas a la vez: p(L) >= UMBRAL_CIERRE
 * y al menos dos aciertos separados por SEPARACION_MINIMA_MS o más. Insistir
 * en una sola sesión no cierra nada. Un error cerrado que recibe un fracaso
 * vuelve a abierto, suma una recaída y reinicia el conteo de separación
 * (decisión 2, 2026-09-12): para volver a cerrar hacen falta dos aciertos
 * nuevos, posteriores a la recaída. Un error sin ningún intento no es
 * "abierto": es `sin-datos`, y se conserva aparte porque la pantalla de errores
 * lo necesita distinguido.
 */

/* ---------- BKT ---------- */

export interface ParametrosBKT {
  /** Conocimiento previo. */
  pL0: number;
  /** Probabilidad de aprender por oportunidad. */
  pT: number;
  /** Adivinar: 1 de 4 alternativas, dato del formato oficial. */
  pG: number;
  /** Equivocarse sabiendo. */
  pS: number;
}

/** Doctrina P10, tal cual. Se calibran con datos reales cuando existan. */
export const PARAMETROS_BKT: ParametrosBKT = { pL0: 0.3, pT: 0.15, pG: 0.25, pS: 0.1 };

/** Doctrina P10: umbral de dominio. */
export const UMBRAL_CIERRE = 0.95;

/** §6.3: dos de los aciertos tienen que estar separados por al menos 24 horas. */
export const SEPARACION_MINIMA_MS = 24 * 60 * 60 * 1000;

export type Observacion = "acierto" | "fracaso";

/** Las tres líneas de P10: evidencia y luego oportunidad de aprender. */
export function actualizarPL(
  pL: number,
  observacion: Observacion,
  p: ParametrosBKT = PARAMETROS_BKT,
): number {
  const conEvidencia =
    observacion === "acierto"
      ? (pL * (1 - p.pS)) / (pL * (1 - p.pS) + (1 - pL) * p.pG)
      : (pL * p.pS) / (pL * p.pS + (1 - pL) * (1 - p.pG));
  return conEvidencia + (1 - conEvidencia) * p.pT;
}

/* ---------- señales por ítem ---------- */

export interface DistractorResuelto {
  /** Clave del JSON, la misma que guarda `orden_descartes`. */
  claveOriginal: string;
  /** Id local del catálogo (slug); la unidad la pone quien llama. Null es un
      distractor sin error mapeado: cuenta como descarte pero no produce
      observación, ni acierto ni fracaso, y nunca tiene estado BKT. */
  errorId: string | null;
}

/** Una fila de `advance_descartes` cruzada con su ítem del banco. */
export interface ItemResuelto {
  itemId: string;
  /** Los tres distractores del ítem, en el orden de las alternativas del JSON. */
  distractores: readonly DistractorResuelto[];
  ordenDescartes: readonly string[];
  descarteFatal: string | null;
  /** `creado_en` de la fila, en ms. */
  enMs: number;
}

export interface ObservacionesDeItem {
  /** Errores de los distractores descartados correctamente, en el orden en que se descartaron. */
  aciertos: string[];
  /** Errores de los distractores en pie al momento del fatal; vacío sin fatal. */
  fracasos: string[];
}

export function observacionesDeItem(item: ItemResuelto): ObservacionesDeItem {
  const aciertos: string[] = [];
  for (const clave of item.ordenDescartes) {
    /* La clave correcta (última de un ítem con fatal) no es distractor: se salta sola.
       Un distractor con errorId null tampoco observa nada. */
    const distractor = item.distractores.find((d) => d.claveOriginal === clave);
    const errorId = distractor?.errorId ?? null;
    if (errorId !== null && !aciertos.includes(errorId)) aciertos.push(errorId);
  }

  const fracasos: string[] = [];
  if (item.descarteFatal !== null) {
    const descartadas = new Set(item.ordenDescartes);
    for (const distractor of item.distractores) {
      if (distractor.errorId === null) continue;
      if (descartadas.has(distractor.claveOriginal)) continue;
      /* El acierto gana: un error acertado en este ítem no recibe además fracaso. */
      if (aciertos.includes(distractor.errorId) || fracasos.includes(distractor.errorId)) continue;
      fracasos.push(distractor.errorId);
    }
  }
  return { aciertos, fracasos };
}

/* ---------- estado por error ---------- */

export type FaseError = "sin-datos" | "abierto" | "observacion" | "cerrado";

export interface EstadoDeError {
  errorId: string;
  fase: FaseError;
  /** p(L0) mientras no haya intentos. */
  pL: number;
  aciertos: number;
  fracasos: number;
  /** Veces que pasó de cerrado a abierto. 0 = nunca. Es la marca de recaída de §6.3. */
  recaidas: number;
  ultimoIntentoMs: number | null;
  /** Primer acierto del ciclo actual, es decir desde la última recaída. Base de la regla de 24 horas. */
  primerAciertoMs: number | null;
}

export function estadoSinDatos(errorId: string, p: ParametrosBKT = PARAMETROS_BKT): EstadoDeError {
  return {
    errorId,
    fase: "sin-datos",
    pL: p.pL0,
    aciertos: 0,
    fracasos: 0,
    recaidas: 0,
    ultimoIntentoMs: null,
    primerAciertoMs: null,
  };
}

/** Una observación sobre un error. Devuelve un estado nuevo; no muta el recibido. */
export function aplicarObservacion(
  estado: EstadoDeError,
  observacion: Observacion,
  enMs: number,
  p: ParametrosBKT = PARAMETROS_BKT,
): EstadoDeError {
  const pL = actualizarPL(estado.pL, observacion, p);

  if (observacion === "fracaso") {
    const recae = estado.fase === "cerrado";
    return {
      ...estado,
      pL,
      fase: "abierto",
      fracasos: estado.fracasos + 1,
      recaidas: recae ? estado.recaidas + 1 : estado.recaidas,
      primerAciertoMs: recae ? null : estado.primerAciertoMs,
      ultimoIntentoMs: enMs,
    };
  }

  const primerAciertoMs = estado.primerAciertoMs ?? enMs;
  const cierra =
    estado.fase === "cerrado" ||
    (pL >= UMBRAL_CIERRE && enMs - primerAciertoMs >= SEPARACION_MINIMA_MS);
  return {
    ...estado,
    pL,
    fase: cierra ? "cerrado" : "observacion",
    aciertos: estado.aciertos + 1,
    primerAciertoMs,
    ultimoIntentoMs: enMs,
  };
}

interface ObservacionFechada {
  errorId: string;
  observacion: Observacion;
  enMs: number;
}

/* A igual instante, acierto antes que fracaso (Op1). */
const RANGO: Record<Observacion, number> = { acierto: 0, fracaso: 1 };

/**
 * Estado de cada error del catálogo para un estudiante, a partir de sus ítems
 * resueltos. Los errores del catálogo sin intentos salen como `sin-datos`; un
 * error observado que no esté en `erroresDelCatalogo` sale igual, al final.
 */
export function estadoDeErrores(
  erroresDelCatalogo: readonly string[],
  items: readonly ItemResuelto[],
  p: ParametrosBKT = PARAMETROS_BKT,
): EstadoDeError[] {
  const observaciones: ObservacionFechada[] = [];
  for (const item of items) {
    const { aciertos, fracasos } = observacionesDeItem(item);
    for (const errorId of aciertos) observaciones.push({ errorId, observacion: "acierto", enMs: item.enMs });
    for (const errorId of fracasos) observaciones.push({ errorId, observacion: "fracaso", enMs: item.enMs });
  }
  observaciones.sort((a, b) => a.enMs - b.enMs || RANGO[a.observacion] - RANGO[b.observacion]);

  const estados = new Map<string, EstadoDeError>();
  for (const errorId of erroresDelCatalogo) estados.set(errorId, estadoSinDatos(errorId, p));
  for (const o of observaciones) {
    const previo = estados.get(o.errorId) ?? estadoSinDatos(o.errorId, p);
    estados.set(o.errorId, aplicarObservacion(previo, o.observacion, o.enMs, p));
  }
  return [...estados.values()];
}
