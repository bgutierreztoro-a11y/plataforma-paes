import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import {
  advanceVisible,
  estadoAdvance,
  type EstadoAdvance,
} from "@/lib/advance/acceso";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

export const metadata: Metadata = {
  title: TEXTOS_ADVANCE.portada.titulo,
  robots: { index: false, follow: false },
};

/**
 * /advance: la portada, "qué hacer ahora" (docs/fobos-advance.md §1.2).
 *
 * Sin acceso, redirige a la puerta conservando el eje de origen. Con acceso,
 * en F1 no hay nada que hacer todavía y la pantalla lo dice tal cual, sin
 * prometer fecha. Los entrenamientos llegan en F2.
 */
export default async function PaginaAdvance({
  searchParams,
}: {
  searchParams: Promise<{ eje?: string | string[] }>;
}) {
  if (!advanceVisible()) notFound();

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

  const { portada, puerta } = TEXTOS_ADVANCE;
  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <PantallaCentrada className="gap-5 text-center">
        <div className="w-full max-w-md space-y-3">
          <h1 className="text-titulo-l text-primary">{portada.titulo}</h1>
          <p className="text-titulo-m text-primary">{portada.vacio}</p>
          <p className="text-cuerpo-m text-secondary">{portada.detalle}</p>
        </div>
        <div className="w-full max-w-md">
          {ejeId ? (
            <BotonVolver
              destino={`/linea/${ejeId}`}
              etiqueta={puerta.volverAlEje}
              tono="sobre-papel"
              className="justify-center"
            />
          ) : (
            <BotonVolver
              destino="/camino"
              etiqueta={puerta.volverALaRed}
              tono="sobre-papel"
              className="justify-center"
            />
          )}
        </div>
      </PantallaCentrada>
    </main>
  );
}
