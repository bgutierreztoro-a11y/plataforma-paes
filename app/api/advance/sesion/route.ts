import { auth } from "@clerk/nextjs/server";
import { advanceVisible, estadoAdvance, type EstadoAdvance } from "@/lib/advance/acceso";
import { obtenerBanco } from "@/lib/advance/banco";
import { validarCuerpoSesion } from "@/lib/advance/descarte";
import { registrarSesionDescarte } from "@/lib/datos/advanceDescartes";
import { DatosError } from "@/lib/datos/db";

/**
 * POST /api/advance/sesion: guarda una sesión de descarte terminada
 * (docs/fobos-advance.md §4, registro F3). Solo escribe; no devuelve nada.
 *
 * ORDEN NO NEGOCIABLE. Primero la sesión de Clerk, después el gate de
 * producto, después el cuerpo, y recién ahí la base. Sin sesión se responde
 * 401 sin haber tocado Postgres. `usuario_id` sale de auth() y nunca del
 * cuerpo: acá vive la autorización, no en proxy.ts (CVE-2025-29927).
 *
 * El cuerpo no se confía: forma y tipos en lib/advance/descarte.ts, y la
 * unidad y sus ítems se cotejan contra el banco en disco. Sin ese cotejo,
 * unidad_id sería un string arbitrario del cliente y F4 agruparía sobre basura.
 *
 * Nada de este archivo arma SQL. Todo pasa por lib/datos/, y ningún detalle
 * interno de error vuelve al cliente: las respuestas van sin cuerpo.
 */

/* Cada petición escribe; nada que cachear. */
export const dynamic = "force-dynamic";

const sinCuerpo = (status: number) => new Response(null, { status });

export async function POST(req: Request) {
  /* Sin la flag, la API no existe, igual que las páginas bajo /advance. */
  if (!advanceVisible()) return sinCuerpo(404);

  const { userId } = await auth();
  if (!userId) return sinCuerpo(401);

  const estado: EstadoAdvance = await estadoAdvance();
  switch (estado) {
    case "sin-acceso":
    case "temporada-terminada":
      return sinCuerpo(403);
    case "activo":
      break;
    default: {
      const nunca: never = estado;
      throw new Error(`Estado de Advance sin manejar: ${nunca}`);
    }
  }

  let entrada: unknown;
  try {
    entrada = await req.json();
  } catch {
    return sinCuerpo(400);
  }
  const cuerpo = validarCuerpoSesion(entrada);
  if (!cuerpo) return sinCuerpo(400);

  const banco = obtenerBanco(cuerpo.unidadId);
  if (!banco) return sinCuerpo(400);
  const idsDelBanco = new Set(banco.items.map((item) => item.id));
  if (!cuerpo.registros.every((r) => idsDelBanco.has(r.itemId))) return sinCuerpo(400);

  try {
    await registrarSesionDescarte(userId, cuerpo.sesionId, cuerpo.unidadId, cuerpo.registros);
  } catch (e) {
    // DatosError ya viene saneado por lib/datos/db.ts. De cualquier otro error
    // se registra solo el nombre: el objeto puede arrastrar credenciales.
    const detalle =
      e instanceof DatosError ? e.message : e instanceof Error ? e.name : "desconocido";
    console.error(`[advance-sesion] ${detalle}`);
    return sinCuerpo(500);
  }
  return sinCuerpo(204);
}
