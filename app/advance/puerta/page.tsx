import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PuertaAdvance } from "@/components/advance/PuertaAdvance";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { advanceVisible } from "@/lib/advance/acceso";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

export const metadata: Metadata = {
  title: TEXTOS_ADVANCE.puerta.titulo,
  robots: { index: false, follow: false },
};

/**
 * /advance/puerta: la información de Advance para quien no tiene acceso.
 *
 * `?eje=<ejeId>` dice desde qué línea se llegó. En F1 solo alimenta el retorno
 * y el color de línea; queda listo para `advance_puerta_vista` en F2. Un eje
 * que no está en el mapa se ignora, no revienta.
 */
export default async function PaginaPuerta({
  searchParams,
}: {
  searchParams: Promise<{ eje?: string | string[] }>;
}) {
  if (!advanceVisible()) notFound();

  const { eje } = await searchParams;
  const ejeId = typeof eje === "string" && lineaDeEje(eje) ? eje : undefined;
  const linea = ejeId ? lineaDeEje(ejeId) : undefined;

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <PuertaAdvance ejeId={ejeId} />
    </main>
  );
}
