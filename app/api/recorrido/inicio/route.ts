import { auth } from "@clerk/nextjs/server";
import { DatosError } from "@/lib/datos/db";
import { marcarParadaIniciada, obtenerPerfilInicio } from "@/lib/datos/perfilInicio";
import { vistaDelPerfil } from "@/lib/recorrido/servidor";

/**
 * GET /api/recorrido/inicio: si la cuenta ya hizo la bienvenida y qué se le recomendó. Lo leen
 * las islas de cliente de la portada, así "/" sigue estática (ADR-03).
 * POST /api/recorrido/inicio: marca parada_iniciada_en una sola vez (embudo de activación, ADR-05).
 * `usuario_id` sale de auth() y de ningún otro lado.
 */
export const dynamic = "force-dynamic";

const sinCuerpo = (status: number) => new Response(null, { status });

function fallo(e: unknown) {
  const detalle = e instanceof DatosError ? e.message : e instanceof Error ? e.name : "desconocido";
  console.error(`[recorrido-inicio] ${detalle}`);
  return sinCuerpo(500);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return sinCuerpo(401);
  try {
    const perfil = await obtenerPerfilInicio(userId);
    if (!perfil) return Response.json({ perfil: false });
    return Response.json({
      perfil: true,
      paradaIniciada: perfil.parada_iniciada_en !== null,
      parada: vistaDelPerfil(perfil),
    });
  } catch (e) {
    return fallo(e);
  }
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return sinCuerpo(401);
  try {
    await marcarParadaIniciada(userId);
    return sinCuerpo(204);
  } catch (e) {
    return fallo(e);
  }
}
