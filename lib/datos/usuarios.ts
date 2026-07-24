/**
 * Espejo de Clerk en la base. Lo escribe el webhook /api/webhooks/clerk
 * (PASO 3); ningún otro camino toca esta tabla.
 *
 * Es el único lugar del esquema con PII. El email y el nombre no se copian a
 * otra tabla, no salen al dispositivo y no entran a la analítica
 * (CLAUDE.md regla 7, MOS §7.5).
 *
 * `usuarioId` es siempre el user id de Clerk verificado en el servidor con
 * auth(). Nunca un valor que venga del cliente: acá vive la autorización, no
 * en proxy.ts (CVE-2025-29927).
 */
import { consultar, DatosError } from "./db";

/** Espejo de db/migraciones/001_usuarios.sql. */
export interface FilaUsuario {
  id: string;
  email: string;
  nombre: string | null;
  fecha_nacimiento: string | null;
  creado_en: Date;
  actualizado_en: Date;
}

/**
 * Alta desde `user.created`. Idempotente: Clerk reintenta los webhooks ante
 * timeout, y un reintento no debe reventar con violación de clave primaria.
 * Devuelve true solo si creó la fila.
 */
export async function crearUsuario(
  clerkId: string,
  email: string,
  nombre?: string | null,
): Promise<boolean> {
  const filas = await consultar<{ id: string }>(
    "crearUsuario",
    `INSERT INTO usuarios (id, email, nombre)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [clerkId, email, nombre ?? null],
  );
  return filas.length > 0;
}

export interface CambiosUsuario {
  email?: string;
  nombre?: string | null;
}

/**
 * Actualización desde `user.updated`. Solo toca los campos presentes en
 * `cambios`: pasar `{ email }` no debe borrar el nombre.
 *
 * `actualizado_en` se escribe acá y no con un trigger, a propósito: toda
 * mutación tiene que quedar legible en el código.
 */
export async function actualizarUsuario(
  clerkId: string,
  cambios: CambiosUsuario,
): Promise<boolean> {
  const asignaciones: string[] = [];
  const params: unknown[] = [clerkId];

  if (cambios.email !== undefined) {
    params.push(cambios.email);
    asignaciones.push(`email = $${params.length}`);
  }
  if (cambios.nombre !== undefined) {
    params.push(cambios.nombre);
    asignaciones.push(`nombre = $${params.length}`);
  }
  if (asignaciones.length === 0) return false;

  const filas = await consultar<{ id: string }>(
    "actualizarUsuario",
    `UPDATE usuarios
        SET ${asignaciones.join(", ")}, actualizado_en = now()
      WHERE id = $1
      RETURNING id`,
    params,
  );
  return filas.length > 0;
}

export async function obtenerUsuarioPorClerkId(
  clerkId: string,
): Promise<FilaUsuario | null> {
  const filas = await consultar<FilaUsuario>(
    "obtenerUsuarioPorClerkId",
    `SELECT id, email, nombre, fecha_nacimiento, creado_en, actualizado_en
       FROM usuarios
      WHERE id = $1`,
    [clerkId],
  );
  return filas[0] ?? null;
}

/**
 * Baja desde `user.deleted`. NO ejecuta ninguna consulta todavía.
 *
 * El rol app_m1 no tiene DELETE sobre `usuarios`, y eso es deliberado: el
 * webhook no existe, así que no hay verificación de firma svix corriendo, y un
 * endpoint sin firma verificada con ese permiso dejaría que cualquiera que
 * descubra la URL fabrique un `user.deleted` y borre cuentas — con el
 * ON DELETE CASCADE llevándose además progreso, respuestas y entitlements.
 *
 * Lanza en vez de intentar el DELETE porque un `permission denied` pelado en
 * producción manda a depurar la base cuando el problema es de secuencia de
 * trabajo. El permiso llega en la migración 007, después de la defensa.
 */
export async function eliminarUsuario(clerkId: string): Promise<never> {
  void clerkId;
  throw new DatosError(
    "eliminarUsuario: pendiente de 007 — requiere validación de firma svix primero",
  );
}
