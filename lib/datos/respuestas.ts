/**
 * Respuestas por ítem. Cada intento es una fila nueva; nunca se corrige una
 * anterior. Eso es lo que permite reconstruir cuántos intentos necesitó un
 * ítem, que es la señal pedagógica que interesa.
 *
 * Este módulo NO expone ninguna función de actualización ni de borrado, y no
 * es un olvido: el comentario de db/migraciones/003_respuestas.sql dice lo
 * mismo, y el rol app_m1 no tiene UPDATE ni DELETE sobre esta tabla. Las tres
 * capas afirman la misma intención en vez de que una pelee contra otra.
 */
import { consultar } from "./db";

/**
 * `diagnostico` y `cierre` quedan separables por esta columna: de eso depende
 * la comparación pre/post del MOS §6.
 */
export type ContextoRespuesta = "diagnostico" | "leccion" | "cierre";

/** Espejo de db/migraciones/003_respuestas.sql. */
export interface FilaRespuesta {
  id: string;
  usuario_id: string;
  contexto: ContextoRespuesta;
  contexto_id: string;
  item_id: string;
  alternativa_elegida: string;
  correcta: boolean;
  intento: number;
  tiempo_ms: number;
  respondida_en: Date;
}

export interface DatosRespuesta {
  contexto: ContextoRespuesta;
  /** id de lección cuando contexto es 'leccion'; 'diagnostico' o 'cierre' si no. */
  contextoId: string;
  /** Clave elegida, hoy siempre 'A'–'D' (CLAUDE.md regla 2). */
  alternativaElegida: string;
  correcta: boolean;
  /** 1 para el primer intento de ese ítem. */
  intento: number;
  tiempoMs: number;
}

export async function registrarRespuesta(
  usuarioId: string,
  itemId: string,
  datos: DatosRespuesta,
): Promise<void> {
  await consultar(
    "registrarRespuesta",
    `INSERT INTO respuestas
       (usuario_id, contexto, contexto_id, item_id,
        alternativa_elegida, correcta, intento, tiempo_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      usuarioId,
      datos.contexto,
      datos.contextoId,
      itemId,
      datos.alternativaElegida,
      datos.correcta,
      datos.intento,
      datos.tiempoMs,
    ],
  );
}

export interface FiltroRespuestas {
  contexto?: ContextoRespuesta;
  contextoId?: string;
  itemId?: string;
}

/**
 * Lectura para el delta pre/post del MOS §6 y para contar intentos previos de
 * un ítem.
 *
 * El filtro se arma en el orden (usuario_id, contexto, contexto_id) porque así
 * está construido el índice respuestas_usuario_contexto_idx.
 */
export async function obtenerRespuestas(
  usuarioId: string,
  filtro: FiltroRespuestas = {},
): Promise<FilaRespuesta[]> {
  const condiciones = ["usuario_id = $1"];
  const params: unknown[] = [usuarioId];

  if (filtro.contexto !== undefined) {
    params.push(filtro.contexto);
    condiciones.push(`contexto = $${params.length}`);
  }
  if (filtro.contextoId !== undefined) {
    params.push(filtro.contextoId);
    condiciones.push(`contexto_id = $${params.length}`);
  }
  if (filtro.itemId !== undefined) {
    params.push(filtro.itemId);
    condiciones.push(`item_id = $${params.length}`);
  }

  return consultar<FilaRespuesta>(
    "obtenerRespuestas",
    `SELECT id, usuario_id, contexto, contexto_id, item_id,
            alternativa_elegida, correcta, intento, tiempo_ms, respondida_en
       FROM respuestas
      WHERE ${condiciones.join(" AND ")}
      ORDER BY respondida_en ASC`,
    params,
  );
}
