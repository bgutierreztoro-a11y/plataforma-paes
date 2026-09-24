/**
 * perfil_inicio (db/migraciones/011): la bienvenida del recorrido de entrada.
 * `usuarioId` es siempre el user id de Clerk verificado con auth() en el servidor.
 */
import { consultar } from "./db";
import type { RespuestaP1, RespuestaP2, RespuestaP3 } from "@/lib/eventos";

export interface FilaPerfilInicio {
  usuario_id: string;
  p1: RespuestaP1 | null;
  p2: RespuestaP2 | null;
  p3: RespuestaP3 | null;
  saltada: boolean;
  unidad_origen: string | null;
  error_origen: string | null;
  video: string | null;
  parada_tipo: "leccion" | "diagnostico" | "descarte";
  parada_destino: string;
  parada_iniciada_en: Date | null;
  creado_en: Date;
}

export type NuevoPerfilInicio = Omit<FilaPerfilInicio, "parada_iniciada_en" | "creado_en">;

const COLUMNAS = `usuario_id, p1, p2, p3, saltada, unidad_origen, error_origen, video,
                  parada_tipo, parada_destino, parada_iniciada_en, creado_en`;

export async function obtenerPerfilInicio(usuarioId: string): Promise<FilaPerfilInicio | null> {
  const filas = await consultar<FilaPerfilInicio>(
    "obtenerPerfilInicio",
    `SELECT ${COLUMNAS} FROM perfil_inicio WHERE usuario_id = $1`,
    [usuarioId],
  );
  return filas[0] ?? null;
}

/** La primera escritura gana: recargar o reenviar no cambia lo que se recomendó. */
export async function guardarPerfilInicio(p: NuevoPerfilInicio): Promise<FilaPerfilInicio> {
  await consultar(
    "guardarPerfilInicio",
    `INSERT INTO perfil_inicio
       (usuario_id, p1, p2, p3, saltada, unidad_origen, error_origen, video, parada_tipo, parada_destino)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (usuario_id) DO NOTHING`,
    [p.usuario_id, p.p1, p.p2, p.p3, p.saltada, p.unidad_origen, p.error_origen, p.video, p.parada_tipo, p.parada_destino],
  );
  const fila = await obtenerPerfilInicio(p.usuario_id);
  if (!fila) throw new Error("guardarPerfilInicio: la fila no quedó escrita");
  return fila;
}

/** Marca una sola vez: si ya tiene fecha, no la cambia. Devuelve true solo si la marcó ahora. */
export async function marcarParadaIniciada(usuarioId: string): Promise<boolean> {
  const filas = await consultar<{ usuario_id: string }>(
    "marcarParadaIniciada",
    `UPDATE perfil_inicio SET parada_iniciada_en = now()
      WHERE usuario_id = $1 AND parada_iniciada_en IS NULL
      RETURNING usuario_id`,
    [usuarioId],
  );
  return filas.length > 0;
}
