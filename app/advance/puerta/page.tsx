import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PuertaAdvance } from "@/components/advance/PuertaAdvance";
import { RegistroPuertaVista, type OrigenPuerta } from "@/components/advance/RegistroPuertaVista";
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
 * `?eje=<ejeId>` dice desde qué línea se llegó: alimenta el retorno, el color
 * de línea y el `eje_id` de `advance_puerta_vista`. `?origen=` lo declaran los
 * enlaces internos (`tramo` desde el riel, `portada` desde el redirect de
 * /advance); cualquier otro valor, o ninguno, cuenta como `directo`. Un eje que
 * no está en el mapa se ignora, no revienta.
 */
const ORIGENES_DECLARADOS: readonly string[] = ["tramo", "portada"] satisfies OrigenPuerta[];

export default async function PaginaPuerta({
  searchParams,
}: {
  searchParams: Promise<{ eje?: string | string[]; origen?: string | string[] }>;
}) {
  if (!advanceVisible()) notFound();

  const { eje, origen } = await searchParams;
  const ejeId = typeof eje === "string" && lineaDeEje(eje) ? eje : undefined;
  const linea = ejeId ? lineaDeEje(ejeId) : undefined;
  const origenPuerta: OrigenPuerta =
    typeof origen === "string" && ORIGENES_DECLARADOS.includes(origen)
      ? (origen as OrigenPuerta)
      : "directo";

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <PuertaAdvance ejeId={ejeId} />
      <RegistroPuertaVista ejeId={ejeId ?? null} origen={origenPuerta} />
    </main>
  );
}
