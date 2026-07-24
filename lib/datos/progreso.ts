/**
 * Avance por lección. Sin PII: id de lección, paso e instantes, nada más.
 *
 * Es el destino de la migración del progreso anónimo que el cliente guarda en
 * localStorage bajo `pm1:progreso:v1` mientras no hay cuenta.
 */
import { consultar, consultarEnLote } from "./db";

/** Espejo de db/migraciones/002_progreso_lecciones.sql. */
export interface FilaProgreso {
  id: string;
  usuario_id: string;
  leccion_id: string;
  paso_actual: number;
  completada: boolean;
  iniciada_en: Date;
  actualizada_en: Date;
}

export interface DatosProgreso {
  pasoActual: number;
  completada: boolean;
}

/**
 * Upsert base. `iniciada_en` no aparece en el DO UPDATE a propósito: conserva
 * el valor original, que es cuando el estudiante empezó de verdad.
 *
 * `completada` es monótona en las dos variantes. Una lección terminada no se
 * "descompleta" al revisitarla, y esa regla no debería depender de por qué
 * camino se escribió la fila.
 *
 * La diferencia entre las dos está en `paso_actual`:
 *   guardar  → toma el valor dado. Retroceder un paso es legítimo.
 *   fusionar → GREATEST. Es la regla "gana el que tenga más avance" de la
 *              migración desde localStorage, expresada en SQL para que sea
 *              atómica e idempotente, sin la carrera de leer-decidir-escribir.
 */
const UPSERT_GUARDAR = `
  INSERT INTO progreso_lecciones (usuario_id, leccion_id, paso_actual, completada)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (usuario_id, leccion_id) DO UPDATE
     SET paso_actual    = EXCLUDED.paso_actual,
         completada     = progreso_lecciones.completada OR EXCLUDED.completada,
         actualizada_en = now()
`;

const UPSERT_FUSIONAR = `
  INSERT INTO progreso_lecciones (usuario_id, leccion_id, paso_actual, completada)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (usuario_id, leccion_id) DO UPDATE
     SET paso_actual    = GREATEST(progreso_lecciones.paso_actual, EXCLUDED.paso_actual),
         completada     = progreso_lecciones.completada OR EXCLUDED.completada,
         actualizada_en = now()
`;

export async function obtenerProgreso(
  usuarioId: string,
  leccionId: string,
): Promise<FilaProgreso | null> {
  const filas = await consultar<FilaProgreso>(
    "obtenerProgreso",
    `SELECT id, usuario_id, leccion_id, paso_actual, completada,
            iniciada_en, actualizada_en
       FROM progreso_lecciones
      WHERE usuario_id = $1 AND leccion_id = $2`,
    [usuarioId, leccionId],
  );
  return filas[0] ?? null;
}

export async function guardarProgreso(
  usuarioId: string,
  leccionId: string,
  datos: DatosProgreso,
): Promise<void> {
  await consultar(
    "guardarProgreso",
    UPSERT_GUARDAR,
    [usuarioId, leccionId, datos.pasoActual, datos.completada],
  );
}

// ---------- migración desde localStorage ----------

/**
 * Forma de `pm1:progreso:v1`. El PASO 4 escribe este objeto en el cliente y
 * esta capa lo consume. Solo desempeño, nunca identidad: sin nombre, sin
 * email, sin nada que identifique a la persona (MOS §7.5).
 */
export interface ProgresoLocalLeccion {
  leccionId: string;
  pasoActual: number;
  completada: boolean;
}

export interface ProgresoLocal {
  version: 1;
  lecciones: ProgresoLocalLeccion[];
}

/**
 * El objeto viene del localStorage del cliente, o sea de fuera de la frontera
 * de confianza: puede estar corrupto, ser de otra versión, o venir manipulado.
 * Se valida la forma antes de tocar la base y las entradas malformadas se
 * descartan en silencio — un progreso raro no debe romper la migración ni
 * mostrarle un error al estudiante.
 */
function leccionesValidas(entrada: unknown): ProgresoLocalLeccion[] {
  if (typeof entrada !== "object" || entrada === null) return [];
  const objeto = entrada as { version?: unknown; lecciones?: unknown };
  if (objeto.version !== 1) return [];
  if (!Array.isArray(objeto.lecciones)) return [];

  const vistas = new Set<string>();
  const validas: ProgresoLocalLeccion[] = [];

  for (const cruda of objeto.lecciones) {
    if (typeof cruda !== "object" || cruda === null) continue;
    const l = cruda as Record<string, unknown>;

    if (typeof l.leccionId !== "string" || l.leccionId.trim() === "") continue;
    if (typeof l.pasoActual !== "number" || !Number.isInteger(l.pasoActual)) continue;
    if (l.pasoActual < 0) continue; // la tabla tiene CHECK (paso_actual >= 0)
    if (typeof l.completada !== "boolean") continue;
    // Dos entradas para la misma lección en el mismo lote harían que la
    // segunda pise a la primera dentro de la transacción. Gana la primera.
    if (vistas.has(l.leccionId)) continue;

    vistas.add(l.leccionId);
    validas.push({
      leccionId: l.leccionId,
      pasoActual: l.pasoActual,
      completada: l.completada,
    });
  }
  return validas;
}

/**
 * Migra el progreso anónimo al servidor cuando el estudiante crea cuenta.
 *
 * Idempotente por construcción: si se ejecuta dos veces no duplica filas ni
 * pisa un avance mayor, porque la fusión ocurre en el ON CONFLICT con GREATEST.
 * Todas las lecciones van en una sola transacción: o se migra todo o no se
 * migra nada, y no queda un estado a medias que confunda al reintento.
 *
 * NO borra nada del cliente. Limpiar `pm1:progreso:v1` es responsabilidad del
 * código que llama, y solo después de que esta función haya resuelto bien
 * (PASO 4). Si falla, el progreso local debe quedar intacto.
 *
 * Devuelve cuántas lecciones se migraron, para que el llamador pueda decidir
 * si vale la pena avisar algo al estudiante.
 */
export async function migrarProgresoLocal(
  usuarioId: string,
  progresoLocal: unknown,
): Promise<number> {
  const lecciones = leccionesValidas(progresoLocal);
  if (lecciones.length === 0) return 0;

  await consultarEnLote(
    "migrarProgresoLocal",
    lecciones.map(
      (l) =>
        [UPSERT_FUSIONAR, [usuarioId, l.leccionId, l.pasoActual, l.completada]] as const,
    ),
  );
  return lecciones.length;
}
