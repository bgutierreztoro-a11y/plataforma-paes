import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { DatosError } from "@/lib/datos/db";
import { guardarPerfilInicio, obtenerPerfilInicio } from "@/lib/datos/perfilInicio";
import { validarEnvio } from "@/lib/recorrido/flujoBienvenida";
import { COOKIE_ORIGEN, leerCookieOrigen } from "@/lib/recorrido/origen";
import { primeraParada } from "@/lib/recorrido/primeraParada";
import { contextoParada, vistaDelPerfil } from "@/lib/recorrido/servidor";

/**
 * POST /api/recorrido/bienvenida: guarda las respuestas en perfil_inicio con la primera parada
 * recomendada, borra la cookie fobos_origen y devuelve lo que muestra la tarjeta.
 * Mismo orden que /api/advance: sesión de Clerk, cuerpo, y recién ahí la base. `usuario_id`
 * sale de auth(); el origen, de la cookie leída en el servidor; la parada la calcula el servidor.
 */
export const dynamic = "force-dynamic";

const sinCuerpo = (status: number) => new Response(null, { status });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return sinCuerpo(401);

  let entrada: unknown;
  try {
    entrada = await req.json();
  } catch {
    return sinCuerpo(400);
  }
  const envio = validarEnvio(entrada);
  if (!envio) return sinCuerpo(400);

  const almacen = await cookies();
  const origen = leerCookieOrigen(almacen.get(COOKIE_ORIGEN)?.value);
  /* La pregunta 3 solo existe con origen (CHECK de la 011). */
  const respuestas = { p1: envio.p1, p2: envio.p2, p3: origen ? envio.p3 : null };

  try {
    let perfil = await obtenerPerfilInicio(userId);
    if (!perfil) {
      const { recomendada } = primeraParada(respuestas, contextoParada(origen?.unidadId ?? null));
      if (recomendada.tipo !== "leccion" && recomendada.tipo !== "diagnostico" && recomendada.tipo !== "descarte") {
        throw new Error(`primera parada de tipo ${recomendada.tipo}`);
      }
      perfil = await guardarPerfilInicio({
        usuario_id: userId,
        ...respuestas,
        saltada: envio.saltada,
        unidad_origen: origen?.unidadId ?? null,
        error_origen: origen?.errorId ?? null,
        video: origen?.video ?? null,
        parada_tipo: recomendada.tipo,
        parada_destino: recomendada.destino,
      });
    }
    almacen.delete(COOKIE_ORIGEN);
    return Response.json(vistaDelPerfil(perfil));
  } catch (e) {
    const detalle = e instanceof DatosError ? e.message : e instanceof Error ? e.name : "desconocido";
    console.error(`[recorrido-bienvenida] ${detalle}`);
    return sinCuerpo(500);
  }
}
