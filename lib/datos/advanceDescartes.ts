/**
 * Sesiones del modo descarte de Fobos Advance. Una fila por ítem resuelto,
 * escrita al terminar la sesión; nunca se corrige una anterior.
 *
 * Este módulo NO expone lectura, actualización ni borrado, y no es un olvido:
 * F3 solo escribe (docs/fobos-advance.md §4, registro F3). La lectura llega
 * en F4 con su propia migración de permisos, y el rol app_m1 tiene solo INSERT
 * sobre esta tabla (db/migraciones/008_advance_descartes.sql). Las tres capas
 * afirman lo mismo.
 *
 * `usuarioId` es siempre el user id de Clerk verificado en el servidor con
 * auth(), nunca un valor que venga del cuerpo de la petición. La identidad de
 * un error es compuesta, (unidad_id, id local): por eso `unidadId` viaja en
 * cada fila y no en una tabla aparte.
 */
import type { RegistroItem } from "@/lib/advance/descarte";
import { consultarEnLote } from "./db";

/** Espejo de db/migraciones/008_advance_descartes.sql. */
export interface FilaAdvanceDescarte {
  id: string;
  usuario_id: string;
  sesion_id: string;
  unidad_id: string;
  item_id: string;
  orden_descartes: string[];
  errores_identificados: string[];
  descarte_fatal: string | null;
  tiempo_ms: number;
  creado_en: Date;
}

/*
 * ON CONFLICT DO NOTHING a secas: la única restricción única es
 * (usuario_id, sesion_id, item_id), así que un reenvío del mismo cierre no
 * inserta nada y no falla. Sin inferencia ni nombre de restricción, que
 * exigirían SELECT sobre las columnas y el rol no lo tiene.
 */
const INSERT_ITEM = `
  INSERT INTO advance_descartes
    (usuario_id, sesion_id, unidad_id, item_id,
     orden_descartes, errores_identificados, descarte_fatal, tiempo_ms)
  VALUES ($1, $2, $3, $4, $5::text[], $6::text[], $7, $8)
  ON CONFLICT DO NOTHING
`;

/**
 * Toda la sesión en una transacción: o quedan todos los ítems o ninguno.
 * Idempotente por el UNIQUE de la tabla: gana la primera escritura.
 */
export async function registrarSesionDescarte(
  usuarioId: string,
  sesionId: string,
  unidadId: string,
  registros: readonly RegistroItem[],
): Promise<void> {
  await consultarEnLote(
    "registrarSesionDescarte",
    registros.map(
      (r) =>
        [
          INSERT_ITEM,
          [
            usuarioId,
            sesionId,
            unidadId,
            r.itemId,
            r.ordenDescartes,
            r.erroresIdentificados,
            r.descarteFatal,
            r.tiempoMs,
          ],
        ] as const,
    ),
  );
}
