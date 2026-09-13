import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { IngresoErrores } from "@/components/advance/IngresoErrores";
import { SesionTriage } from "@/components/advance/SesionTriage";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { advanceVisible, estadoAdvance, type EstadoAdvance } from "@/lib/advance/acceso";
import { obtenerBanco } from "@/lib/advance/banco";
import { copyDelCatalogo } from "@/lib/advance/copyDeError";
import { estadoDeErrores } from "@/lib/advance/dominio";
import { itemsResueltosDe } from "@/lib/advance/itemsResueltos";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { fasesDe, seleccionarItems } from "@/lib/advance/triage";
import { catalogoCompletoDelModulo } from "@/lib/catalogoErrores";
import { listarDescartesDeUsuario } from "@/lib/datos/advanceDescartes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unidadId: string }>;
}): Promise<Metadata> {
  const { unidadId } = await params;
  const banco = advanceVisible() ? obtenerBanco(unidadId) : null;
  const partes = [TEXTOS_ADVANCE.triage.pill, banco?.titulo, TEXTOS_ADVANCE.nombre].filter(Boolean);
  return { title: partes.join(" · "), robots: { index: false, follow: false } };
}

/* Cada petición arma una sesión distinta y lee Neon: nada que cachear. */
export const dynamic = "force-dynamic";

/**
 * /advance/triage/[unidadId]: una sesión de triage de 20 segundos
 * (docs/fobos-advance.md §6.5, F5a).
 *
 * Mismo orden de guardas que /advance/errores y que POST /api/advance/triage:
 * sin flag 404; sin sesión Clerk la pantalla de ingreso, antes de tocar disco
 * o Postgres (el triage se evalúa contra el historial propio, y sin cuenta no
 * hay historial ni escritura); sin acceso, a la puerta; y recién ahí
 * `unidadId` vía `obtenerBanco`, 404 si no resuelve.
 *
 * La selección y la mezcla ocurren acá, en el servidor (20 ítems). Las fases
 * de los errores se calculan por el mismo camino que /advance/errores
 * (`listarDescartesDeUsuario` → `itemsResueltosDe` → `estadoDeErrores`) y
 * cruzan al cliente proyectadas a `errorId → fase`, sin p(L) (D10). El
 * veredicto se calcula en el cliente al cerrar, sobre ese estado (D17).
 */
export default async function PaginaTriage({
  params,
  searchParams,
}: {
  params: Promise<{ unidadId: string }>;
  searchParams: Promise<{ eje?: string | string[] }>;
}) {
  if (!advanceVisible()) notFound();

  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <IngresoErrores
          titulo={TEXTOS_ADVANCE.triage.ingresoTitulo}
          cuerpo={TEXTOS_ADVANCE.triage.ingresoCuerpo}
        />
      </main>
    );
  }

  const { eje } = await searchParams;
  const ejeId = typeof eje === "string" && lineaDeEje(eje) ? eje : undefined;
  const linea = ejeId ? lineaDeEje(ejeId) : undefined;

  const estado: EstadoAdvance = await estadoAdvance();
  switch (estado) {
    case "sin-acceso":
    case "temporada-terminada":
      redirect(ejeId ? `/advance/puerta?eje=${ejeId}` : "/advance/puerta");
    case "activo":
      break;
    default: {
      const nunca: never = estado;
      throw new Error(`Estado de Advance sin manejar: ${nunca}`);
    }
  }

  const { unidadId } = await params;
  const banco = obtenerBanco(unidadId);
  if (!banco) notFound();

  const items = seleccionarItems(banco.items);
  const catalogo = catalogoCompletoDelModulo(banco.moduloId);
  const filas = await listarDescartesDeUsuario(userId, unidadId);
  const fases = fasesDe(estadoDeErrores([...catalogo.keys()], itemsResueltosDe(filas, banco.items)));
  const ruta = ejeId ? `/advance/triage/${unidadId}?eje=${ejeId}` : `/advance/triage/${unidadId}`;

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <SesionTriage
        items={items}
        unidadId={unidadId}
        titulo={banco.titulo}
        fases={fases}
        catalogo={copyDelCatalogo(catalogo)}
        ruta={ruta}
      />
    </main>
  );
}
