import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SesionDescarte } from "@/components/advance/SesionDescarte";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { advanceVisible, estadoAdvance, type EstadoAdvance } from "@/lib/advance/acceso";
import { obtenerBanco } from "@/lib/advance/banco";
import { seleccionarSesion } from "@/lib/advance/seleccion";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { catalogoDelModulo } from "@/lib/catalogoErrores";

export const metadata: Metadata = {
  title: `${TEXTOS_ADVANCE.descarte.pill} · ${TEXTOS_ADVANCE.nombre}`,
  robots: { index: false, follow: false },
};

/* Cada petición arma una sesión distinta (cinco ítems al azar). Sin esto, un
   segmento dinámico sin `generateStaticParams` ni APIs dinámicas puede quedar
   cacheado tras la primera petición y congelar los mismos cinco. */
export const dynamic = "force-dynamic";

const ITEMS_POR_SESION = 5;

/**
 * /advance/descarte/[unidadId]: una sesión de descarte (docs/fobos-advance.md
 * §6.1). Sin persistencia en F2: nada a localStorage ni al servidor.
 *
 * Mismo gate que la portada: 404 si Advance no es visible o no hay banco para
 * la unidad; sin acceso, a la puerta. La selección y la mezcla ocurren acá, en
 * el servidor, así que al cliente viajan solo los cinco ítems de esta sesión.
 */
export default async function PaginaDescarte({
  params,
  searchParams,
}: {
  params: Promise<{ unidadId: string }>;
  searchParams: Promise<{ eje?: string | string[] }>;
}) {
  if (!advanceVisible()) notFound();

  const { unidadId } = await params;
  const banco = obtenerBanco(unidadId);
  if (!banco) notFound();

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

  const items = seleccionarSesion(banco.items, ITEMS_POR_SESION);
  const catalogo = Object.fromEntries(catalogoDelModulo(banco.moduloId));
  const ruta = ejeId ? `/advance/descarte/${unidadId}?eje=${ejeId}` : `/advance/descarte/${unidadId}`;

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <SesionDescarte items={items} unidadId={unidadId} catalogo={catalogo} ruta={ruta} />
    </main>
  );
}
