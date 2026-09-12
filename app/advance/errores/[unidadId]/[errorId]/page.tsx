import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { IngresoErrores } from "@/components/advance/IngresoErrores";
import { RepasoError } from "@/components/advance/RepasoError";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { advanceVisible, estadoAdvance, type EstadoAdvance } from "@/lib/advance/acceso";
import { obtenerBanco } from "@/lib/advance/banco";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { catalogoCompletoDelModulo } from "@/lib/catalogoErrores";
import { ejeDeTema } from "@/lib/modulos";

/* Lee disco en cada petición, como el resto de Advance: sin caché de contenido. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unidadId: string; errorId: string }>;
}): Promise<Metadata> {
  const { unidadId, errorId } = await params;
  const banco = advanceVisible() ? obtenerBanco(unidadId) : null;
  const entrada = banco ? catalogoCompletoDelModulo(banco.moduloId).get(errorId) : undefined;
  const titulo = entrada ? (entrada.titulo ?? entrada.descripcion) : undefined;
  const partes = [titulo, TEXTOS_ADVANCE.nombre].filter(Boolean);
  return { title: partes.join(" · "), robots: { index: false, follow: false } };
}

/**
 * /advance/errores/[unidadId]/[errorId] (F4b): el repaso de un error, desde la
 * tarjeta de /advance/errores.
 *
 * Mismo orden de guardas que /advance/errores y que POST /api/advance/sesion,
 * con dos guardas más al final: flag → sesión Clerk → acceso → `unidadId` →
 * `errorId`. Los parámetros de la URL se validan después de las tres guardas
 * de acceso, así una petición anónima o sin acceso nunca toca disco.
 *
 * `unidadId` lo valida `obtenerBanco` (regex kebab-case + banco en disco,
 * igual que /advance/descarte/[unidadId]); sin banco, 404. `errorId` no arma
 * ninguna ruta de disco —es solo una clave del `Map` de
 * `catalogoCompletoDelModulo`— así que no necesita su propio regex: si no
 * resuelve en el catálogo del módulo de esa unidad, 404.
 */
export default async function PaginaRepasoError({
  params,
}: {
  params: Promise<{ unidadId: string; errorId: string }>;
}) {
  if (!advanceVisible()) notFound();

  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <IngresoErrores />
      </main>
    );
  }

  const estado: EstadoAdvance = await estadoAdvance();
  switch (estado) {
    case "sin-acceso":
    case "temporada-terminada":
      redirect("/advance/puerta");
    case "activo":
      break;
    default: {
      const nunca: never = estado;
      throw new Error(`Estado de Advance sin manejar: ${nunca}`);
    }
  }

  const { unidadId, errorId } = await params;
  const banco = obtenerBanco(unidadId);
  if (!banco) notFound();

  const entrada = catalogoCompletoDelModulo(banco.moduloId).get(errorId);
  if (!entrada) notFound();

  const ejeId = ejeDeTema(banco.moduloId)?.id ?? null;
  const linea = ejeId ? lineaDeEje(ejeId) : undefined;

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <RepasoError
        unidadId={unidadId}
        ejeId={ejeId}
        titulo={entrada.titulo ?? entrada.descripcion}
        repaso={entrada.repaso}
      />
    </main>
  );
}
