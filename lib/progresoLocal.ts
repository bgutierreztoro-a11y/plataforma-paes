/**
 * Progreso pedagógico del estudiante en el dispositivo, bajo una única clave
 * versionada: `pm1:progreso:v1`.
 *
 * Autorizado por MOS §7.5 tal como quedó tras la enmienda del 2026-07-23: se
 * puede guardar id de lección, índice de paso, respuestas por item id, si la
 * respuesta fue correcta, número de intento, tiempo por ítem y timestamps.
 * Guardarlo es lo que permite medir el delta pre/post más allá de una sola
 * sesión, que es la razón por la que se levantó la restricción anterior.
 *
 * **Frontera exacta: desempeño sí, identidad no.** Ni nombre, ni apellido, ni
 * email, ni RUT, ni fecha de nacimiento, ni colegio, ni curso, ni un solo campo
 * de texto libre escrito por el estudiante. El tipo `ValorRespuesta` es una
 * unión cerrada precisamente para que esto no dependa de la disciplina de quien
 * escriba el próximo bloque: no hay dónde meter texto libre aunque se quisiera.
 *
 * **Degradación obligatoria (MOS §7.5):** si el almacenamiento no está
 * disponible —modo privado, cuota llena, storage deshabilitado— la aplicación
 * funciona igual, sin persistir y sin romperse. Por eso todo va en try/catch y
 * ninguna función de este módulo lanza nunca.
 */
import type {
  ProgresoLocal,
  ProgresoLocalLeccion,
  RespuestaLocal,
  ValorRespuesta,
} from "@/lib/datos/progreso";

export type { ProgresoLocal, ProgresoLocalLeccion, RespuestaLocal, ValorRespuesta };

const CLAVE = "pm1:progreso:v1";

/**
 * Tope de respuestas guardadas. Cada una pesa ~200 bytes en JSON (~400 si el
 * navegador almacena en UTF-16), así que 500 son ~200 KB: un 4% de la cuota
 * típica de 5 MB, con margen incluso en Safari móvil, que es la más apretada.
 * Cubre unas 7 pasadas completas del módulo v1 (diagnóstico 5 + cierre 8 + ~7
 * por lección), o sea un estudiante que repite todo varias veces.
 */
const TOPE_RESPUESTAS = 500;

const VACIO: ProgresoLocal = { version: 1, lecciones: [] };

function almacen(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    // Acceder a localStorage puede lanzar por sí solo cuando las cookies de
    // terceros están bloqueadas o el storage está deshabilitado por política.
    return null;
  }
}

// ---------- validación defensiva ----------

/* Lo que sale de localStorage viene de fuera de la frontera de confianza:
   puede estar corrupto, ser de otra versión, o haber sido editado a mano desde
   la consola del navegador. Se valida campo por campo y lo malformado se
   descarta en silencio — un progreso raro no debe romperle la sesión a nadie ni
   mostrar un error que el estudiante no puede accionar. Mismo criterio que
   `leccionesValidas` en lib/datos/progreso.ts, que hace esto del lado servidor. */

function leccionValida(cruda: unknown): ProgresoLocalLeccion | null {
  if (typeof cruda !== "object" || cruda === null) return null;
  const l = cruda as Record<string, unknown>;
  if (typeof l.leccionId !== "string" || l.leccionId.trim() === "") return null;
  if (typeof l.pasoActual !== "number" || !Number.isInteger(l.pasoActual)) return null;
  if (l.pasoActual < 0) return null; // la tabla tiene CHECK (paso_actual >= 0)
  if (typeof l.completada !== "boolean") return null;
  return { leccionId: l.leccionId, pasoActual: l.pasoActual, completada: l.completada };
}

function valorValido(crudo: unknown): ValorRespuesta | null {
  if (typeof crudo !== "object" || crudo === null) return null;
  const v = crudo as Record<string, unknown>;
  switch (v.tipo) {
    case "alternativa":
      return v.clave === "A" || v.clave === "B" || v.clave === "C" || v.clave === "D"
        ? { tipo: "alternativa", clave: v.clave }
        : null;
    case "opcion":
      return typeof v.opcionId === "string" && v.opcionId.trim() !== ""
        ? { tipo: "opcion", opcionId: v.opcionId }
        : null;
    case "booleana":
      return typeof v.valor === "boolean" ? { tipo: "booleana", valor: v.valor } : null;
    case "numero":
      return typeof v.valor === "number" && Number.isFinite(v.valor)
        ? { tipo: "numero", valor: v.valor }
        : null;
    default:
      return null;
  }
}

function respuestaValida(cruda: unknown): RespuestaLocal | null {
  if (typeof cruda !== "object" || cruda === null) return null;
  const r = cruda as Record<string, unknown>;
  if (r.contexto !== "leccion" && r.contexto !== "diagnostico" && r.contexto !== "cierre") {
    return null;
  }
  if (typeof r.contextoId !== "string" || r.contextoId.trim() === "") return null;
  if (typeof r.itemId !== "string" || r.itemId.trim() === "") return null;
  if (typeof r.correcta !== "boolean") return null;
  if (typeof r.intento !== "number" || !Number.isInteger(r.intento) || r.intento < 1) return null;
  if (typeof r.tiempoMs !== "number" || !Number.isFinite(r.tiempoMs) || r.tiempoMs < 0) return null;
  if (typeof r.respondidaEn !== "string" || Number.isNaN(Date.parse(r.respondidaEn))) return null;
  const valor = valorValido(r.valor);
  if (!valor) return null;
  return {
    contexto: r.contexto,
    contextoId: r.contextoId,
    itemId: r.itemId,
    valor,
    correcta: r.correcta,
    intento: r.intento,
    tiempoMs: r.tiempoMs,
    respondidaEn: r.respondidaEn,
  };
}

// ---------- lectura y escritura ----------

/** El progreso guardado, o `null` si no hay, no se puede leer, o está corrupto.
 *  Nunca lanza. */
export function leer(): ProgresoLocal | null {
  const store = almacen();
  if (!store) return null;
  try {
    const crudo = store.getItem(CLAVE);
    if (!crudo) return null;
    const data = JSON.parse(crudo) as Record<string, unknown>;
    if (data?.version !== 1) return null;

    const lecciones: ProgresoLocalLeccion[] = [];
    const vistas = new Set<string>();
    if (Array.isArray(data.lecciones)) {
      for (const cruda of data.lecciones) {
        const l = leccionValida(cruda);
        // Dos entradas para la misma lección: gana la primera, igual que en la
        // migración del servidor.
        if (l && !vistas.has(l.leccionId)) {
          vistas.add(l.leccionId);
          lecciones.push(l);
        }
      }
    }

    const respuestas: RespuestaLocal[] = [];
    if (Array.isArray(data.respuestas)) {
      for (const cruda of data.respuestas) {
        const r = respuestaValida(cruda);
        if (r) respuestas.push(r);
      }
    }

    return respuestas.length > 0 ? { version: 1, lecciones, respuestas } : { version: 1, lecciones };
  } catch {
    return null;
  }
}

/**
 * Poda al tope, descartando primero lo más antiguo — **salvo el diagnóstico**.
 *
 * FIFO puro borraría justo la línea base del delta pre/post del MOS §6: el
 * diagnóstico es lo primero que rinde el estudiante y por lo tanto lo más viejo
 * del registro. Son 5 ítems por diseño, así que protegerlo no puede desbordar
 * el tope por sí solo.
 */
function podar(respuestas: RespuestaLocal[]): RespuestaLocal[] {
  if (respuestas.length <= TOPE_RESPUESTAS) return respuestas;
  const diagnostico = respuestas.filter((r) => r.contexto === "diagnostico");
  const resto = respuestas.filter((r) => r.contexto !== "diagnostico");
  const cupo = Math.max(0, TOPE_RESPUESTAS - diagnostico.length);
  // `resto` ya viene en orden de inserción (cronológico); nos quedamos con la
  // cola, que es lo más reciente.
  return [...diagnostico, ...resto.slice(resto.length - cupo)];
}

/** Guarda, podando si hace falta. Nunca lanza: si el almacenamiento falla, el
 *  progreso simplemente no persiste y la sesión sigue. */
export function guardar(progreso: ProgresoLocal): void {
  const store = almacen();
  if (!store) return;
  const podado: ProgresoLocal =
    progreso.respuestas && progreso.respuestas.length > 0
      ? { ...progreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  try {
    store.setItem(CLAVE, JSON.stringify(podado));
  } catch {
    // Cuota llena. Se reintenta una vez sin el detalle de respuestas: el avance
    // por lección es lo que sostiene la navegación, y perderlo desorienta al
    // estudiante; perder el histórico de intentos solo degrada la estadística.
    try {
      store.setItem(CLAVE, JSON.stringify({ version: 1, lecciones: podado.lecciones }));
    } catch {
      // Sin espacio ni para eso: se sigue sin persistir, como manda MOS §7.5.
    }
  }
}

export function limpiar(): void {
  const store = almacen();
  if (!store) return;
  try {
    store.removeItem(CLAVE);
  } catch {
    /* nada que hacer; no persistir no es un error que el estudiante deba ver */
  }
}

// ---------- operaciones de la aplicación ----------

/**
 * Registra el paso en que va el estudiante. `pasoActual` es monótono: se queda
 * con el máximo, igual que el `GREATEST` del upsert del servidor. Retroceder un
 * paso para releer no debe borrar avance real.
 */
export function registrarPaso(leccionId: string, pasoActual: number): void {
  const actual = leer() ?? VACIO;
  const previa = actual.lecciones.find((l) => l.leccionId === leccionId);
  const lecciones = previa
    ? actual.lecciones.map((l) =>
        l.leccionId === leccionId ? { ...l, pasoActual: Math.max(l.pasoActual, pasoActual) } : l,
      )
    : [...actual.lecciones, { leccionId, pasoActual, completada: false }];
  guardar({ ...actual, lecciones });
}

/** `completada` es monótona: una lección terminada no se "descompleta" al
 *  revisitarla. Misma regla que el servidor (lib/datos/progreso.ts). */
export function marcarCompletada(leccionId: string): void {
  const actual = leer() ?? VACIO;
  const previa = actual.lecciones.find((l) => l.leccionId === leccionId);
  const lecciones = previa
    ? actual.lecciones.map((l) => (l.leccionId === leccionId ? { ...l, completada: true } : l))
    : [...actual.lecciones, { leccionId, pasoActual: 0, completada: true }];
  guardar({ ...actual, lecciones });
}

/** Registra un intento. El timestamp lo pone este módulo: quien llama no tiene
 *  por qué saber el formato que espera la tabla `respuestas`. */
export function registrarRespuesta(intento: Omit<RespuestaLocal, "respondidaEn">): void {
  const actual = leer() ?? VACIO;
  const respuesta: RespuestaLocal = { ...intento, respondidaEn: new Date().toISOString() };
  guardar({ ...actual, respuestas: [...(actual.respuestas ?? []), respuesta] });
}

// ---------- lecturas derivadas ----------

export function progresoDeLeccion(leccionId: string): ProgresoLocalLeccion | undefined {
  return leer()?.lecciones.find((l) => l.leccionId === leccionId);
}

export function esLeccionCompletada(leccionId: string): boolean {
  return progresoDeLeccion(leccionId)?.completada === true;
}

/**
 * Aciertos al **primer intento** sobre los ítems de un contexto. Se deriva del
 * detalle en vez de guardarse aparte: el agregado sale del detalle, nunca al
 * revés, y guardar ambos sería una segunda fuente de verdad para el mismo hecho.
 *
 * Primer intento y no "acertó alguna vez" porque lo que mide el delta pre/post
 * del MOS §6 es si el estudiante lo sabía, no si lo encontró a la tercera.
 *
 * Devuelve solo el numerador: el denominador es `itemsPAES.length` del
 * contenido, que quien renderiza ya tiene a mano.
 */
export function aciertosAlPrimerIntento(contextoId: string): number {
  const respuestas = leer()?.respuestas ?? [];
  const primeros = new Map<string, boolean>();
  for (const r of respuestas) {
    if (r.contextoId !== contextoId) continue;
    if (r.intento !== 1) continue;
    if (!primeros.has(r.itemId)) primeros.set(r.itemId, r.correcta);
  }
  let aciertos = 0;
  for (const correcta of primeros.values()) if (correcta) aciertos++;
  return aciertos;
}
