import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Bienvenida } from "@/components/recorrido/Bienvenida";
import { asegurarPrueba } from "@/lib/datos/entitlements";
import { obtenerPerfilInicio } from "@/lib/datos/perfilInicio";
import { errorPublico } from "@/lib/recorrido/erroresPublicos";
import { COOKIE_ORIGEN, leerCookieOrigen } from "@/lib/recorrido/origen";
import { asegurarUsuario } from "@/lib/recorrido/servidor";
import { encabezadoAcceso } from "@/lib/recorrido/textosBienvenida";

export const metadata: Metadata = {
  title: "Bienvenida",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /bienvenida (docs/recorrido-entrada.md, ADR-03 y ADR-04): el registro siempre termina acá.
 * En el servidor: asegura la fila de usuarios, asegura la prueba y lee el origen. Quien ya
 * tiene perfil_inicio ya pasó por acá y vuelve a la portada; por eso recargar no crea nada nuevo.
 */
export default async function PaginaBienvenida() {
  const { userId } = await auth();
  if (!userId) redirect("/registrarse");
  if (await obtenerPerfilInicio(userId)) redirect("/");

  await asegurarUsuario(userId);
  const acceso = await asegurarPrueba(userId);
  const origen = leerCookieOrigen((await cookies()).get(COOKIE_ORIGEN)?.value);
  const publica = origen ? errorPublico(origen.unidadId, origen.errorId) : undefined;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col px-4 py-8">
      <Bienvenida
        encabezado={encabezadoAcceso(acceso)}
        unidadOrigen={publica?.unidadEnFrase ?? null}
        entrada={origen ? "video" : "directa"}
        video={origen?.video ?? null}
        acceso={acceso?.origen ?? null}
      />
    </main>
  );
}
