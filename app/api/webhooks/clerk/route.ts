import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { UserJSON } from "@clerk/backend";
import { crearUsuario, actualizarUsuario } from "@/lib/datos/usuarios";
import { otorgarEntitlementGratis } from "@/lib/datos/entitlements";
import { DatosError } from "@/lib/datos/db";
import { consultarRateLimit } from "@/lib/rateLimit";

/**
 * Webhook de Clerk: sincroniza la tabla `usuarios` y otorga el acceso gratuito.
 *
 * ORDEN NO NEGOCIABLE. Lo primero que ocurre es la verificación de la firma
 * svix, antes de parsear el cuerpo y antes de cualquier consulta a la base. Si
 * la firma no valida, se responde 401 sin haber tocado Postgres. Sin esa
 * barrera, cualquiera que descubra la URL podría fabricar un `user.deleted` y
 * borrar cuentas — y el ON DELETE CASCADE se llevaría además su progreso, sus
 * respuestas y sus entitlements.
 *
 * `verifyWebhook` toma el secreto de CLERK_WEBHOOK_SIGNING_SECRET y lanza si
 * la verificación falla. No hace falta instalar `svix`: @clerk/backend ya trae
 * `standardwebhooks`.
 *
 * Nada de este archivo arma SQL. Todo pasa por lib/datos/, que es donde vive
 * la autorización y el único lugar del proyecto con consultas.
 */

function ipDe(req: NextRequest): string {
  const reenviada = req.headers.get("x-forwarded-for");
  return reenviada?.split(",")[0]?.trim() || "desconocida";
}

/**
 * El correo primario, buscado por id — no `email_addresses[0]`. El orden del
 * arreglo no está garantizado, y mandar el correo equivocado a una columna
 * única sería un error silencioso y difícil de rastrear.
 */
function correoPrimario(datos: UserJSON): string | null {
  const primario = datos.email_addresses.find(
    (correo) => correo.id === datos.primary_email_address_id,
  );
  return primario?.email_address ?? null;
}

/** Nombre opcional. Nunca requerido, y nunca sale de la tabla `usuarios`. */
function nombreDe(datos: UserJSON): string | null {
  const partes = [datos.first_name, datos.last_name].filter(Boolean);
  return partes.length > 0 ? partes.join(" ") : null;
}

const ok = () => new Response(null, { status: 200 });

export async function POST(req: NextRequest) {
  let evento;
  try {
    evento = await verifyWebhook(req);
  } catch {
    // Solo los fallos de verificación cuentan contra el limitador. El tráfico
    // legítimo llega desde las pocas IPs fijas de Svix, así que contar todo
    // metería los eventos reales en el mismo balde y una cohorte registrándose
    // a la vez empezaría a perder eventos. Ver lib/rateLimit.ts.
    const limite = consultarRateLimit(`webhook-clerk:${ipDe(req)}`);
    if (!limite.permitido) {
      return new Response("Demasiados intentos", {
        status: 429,
        headers: { "Retry-After": String(limite.reintentarEnSegundos) },
      });
    }
    // No se loguea el error: sus detalles incluyen cabeceras de la petición.
    console.warn("[webhook-clerk] firma inválida");
    return new Response("Firma inválida", { status: 401 });
  }

  try {
    switch (evento.type) {
      case "user.created": {
        const correo = correoPrimario(evento.data);
        if (!correo) {
          // Un reintento no va a hacer aparecer un correo: se cierra con 200.
          console.error(
            `[webhook-clerk] user.created sin correo primario, clerk_id=${evento.data.id}`,
          );
          return ok();
        }
        await crearUsuario(evento.data.id, correo, nombreDe(evento.data));
        // Se otorga siempre, haya creado fila o no: es idempotente por el
        // ON CONFLICT, y así un reintento tras un fallo a medio camino deja al
        // usuario con su entitlement igual.
        await otorgarEntitlementGratis(evento.data.id);
        return ok();
      }

      case "user.updated": {
        const correo = correoPrimario(evento.data);
        const actualizado = await actualizarUsuario(evento.data.id, {
          ...(correo ? { email: correo } : {}),
          nombre: nombreDe(evento.data),
        });
        if (!actualizado) {
          // Puede pasar si este evento se adelanta a `user.created`. Se deja
          // constancia y se cierra con 200 en vez de forzar reintentos: si el
          // alta nunca llega, reintentar no lo arregla y solo genera ruido.
          console.warn(
            `[webhook-clerk] user.updated sin fila que actualizar, clerk_id=${evento.data.id}`,
          );
        }
        return ok();
      }

      case "user.deleted": {
        const id = evento.data.id;
        if (!id) {
          console.error("[webhook-clerk] user.deleted sin id");
          return ok();
        }
        // app_m1 no tiene DELETE sobre `usuarios` — llega en la migración 007,
        // después de que esta verificación de firma exista y esté probada. Lo
        // que sí podemos hoy, con el UPDATE que ya tenemos, es sacar la PII:
        // el correo pasa a una lápida y el nombre a NULL. Lo que queda es
        // progreso y respuestas colgando de un id opaco que ya no apunta a
        // ninguna persona.
        //
        // Se responde 200 y no se reintenta: lo que falta es un permiso, no una
        // condición transitoria, así que reintentar no lo arreglaría.
        //
        // Cómo encontrar después las filas que faltan purgar de verdad: la
        // consulta está en docs/pendientes.md, sección "Borrados de cuenta
        // pendientes". El registro durable es la base, no estos logs, que
        // expiran.
        await actualizarUsuario(id, {
          email: `borrado-${id}@invalido.local`,
          nombre: null,
        });
        console.warn(
          `[BORRADO-PENDIENTE] clerk_id=${id} PII neutralizada; falta el DELETE de la 007`,
        );
        return ok();
      }

      default:
        // Cualquier otro evento se acepta y se ignora, sin ruido: Clerk manda
        // varios tipos que no nos incumben y responder distinto solo
        // provocaría reintentos inútiles.
        return ok();
    }
  } catch (e) {
    // DatosError ya viene saneado por lib/datos/db.ts. De cualquier otro error
    // se registra solo el nombre: el objeto puede arrastrar credenciales.
    const detalle =
      e instanceof DatosError ? e.message : e instanceof Error ? e.name : "desconocido";
    console.error(`[webhook-clerk] ${evento.type}: ${detalle}`);
    // 500 para que Clerk reintente. Es seguro: crearUsuario,
    // otorgarEntitlementGratis y actualizarUsuario son todas idempotentes.
    return new Response("Error al procesar el evento", { status: 500 });
  }
}
