/**
 * Sesiones del triage de 20 segundos de Fobos Advance (§6.5, F5a). Una fila
 * por ítem decidido, escrita al terminar la sesión; nunca se corrige una
 * anterior.
 *
 * Escribe y lee. No expone actualización ni borrado, y no es un olvido: la
 * tabla es append-only y el rol app_m1 tiene INSERT y SELECT (010), nada
 * más. `listarTriageDeUsuario` es la lectura que justifica el SELECT de la
 * 010; en F5a ninguna ruta la llama todavía (docs/fobos-advance.md §4 F5a).
 *
 * `usuarioId` es siempre el user id de Clerk verificado en el servidor con
 * auth(), nunca un valor que venga del cuerpo de la petición. El veredicto no
 * se guarda: se calcula en runtime (D17).
 */
import type { Decision, RegistroTriage } from "@/lib/advance/triage";
import { consultar, consultarEnLote } from "./db";

/** Espejo de db/migraciones/010_advance_triage.sql. */
export interface FilaAdvanceTriage {
  id: string;
  usuario_id: string;
  sesion_id: string;
  unidad_id: string;
  item_id: string;
  decision: Decision;
  ms: number;
  creado_en: Date;
}

/*
 * ON CONFLICT DO NOTHING a secas: la única restricción única es
 * (usuario_id, sesion_id, item_id), así que un reenvío del mismo cierre no
 * inserta nada y no falla.
 */
const INSERT_ITEM = `
  INSERT INTO advance_triage
    (usuario_id, sesion_id, unidad_id, item_id, decision, ms)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT DO NOTHING
`;

/**
 * Toda la sesión en una transacción: o quedan todos los ítems o ninguno.
 * Idempotente por el UNIQUE de la tabla: gana la primera escritura.
 */
export async function registrarSesionTriage(
  usuarioId: string,
  sesionId: string,
  unidadId: string,
  registros: readonly RegistroTriage[],
): Promise<void> {
  await consultarEnLote(
    "registrarSesionTriage",
    registros.map(
      (r) => [INSERT_ITEM, [usuarioId, sesionId, unidadId, r.itemId, r.decision, r.ms]] as const,
    ),
  );
}

/**
 * Filas de un estudiante en una unidad, cronológicas. `item_id` como segundo
 * criterio solo hace determinista la lista: las filas de una sesión comparten
 * `creado_en`.
 */
export async function listarTriageDeUsuario(
  usuarioId: string,
  unidadId: string,
): Promise<FilaAdvanceTriage[]> {
  return consultar<FilaAdvanceTriage>(
    "listarTriageDeUsuario",
    `SELECT id, usuario_id, sesion_id, unidad_id, item_id, decision, ms, creado_en
       FROM advance_triage
      WHERE usuario_id = $1 AND unidad_id = $2
      ORDER BY creado_en ASC, item_id ASC`,
    [usuarioId, unidadId],
  );
}
