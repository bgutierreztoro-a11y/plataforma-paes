import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ejesDelCamino } from "@/lib/camino";
import { LineaDelEje } from "@/components/camino/LineaDelEje";
import { PlacaLinea, subtituloDePlaca } from "@/components/ui/linea/PlacaLinea";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { TramoAdvance } from "@/components/advance/TramoAdvance";
import { advanceVisible, estadoAdvance } from "@/lib/advance/acceso";

export async function generateStaticParams() {
  return ejesDelCamino().map((eje) => ({ ejeId: eje.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ejeId: string }>;
}): Promise<Metadata> {
  const { ejeId } = await params;
  const eje = ejesDelCamino().find((e) => e.id === ejeId);
  return { title: eje?.nombre ?? "Línea" };
}

/**
 * Pantalla 03 del HTML de referencia: una línea con sus estaciones.
 *
 * Server component: cruza la taxonomía con los archivos en disco y le entrega a
 * la isla de cliente (`LineaDelEje`) solo lo que necesita para pintar el riel.
 * El estado de cada estación lo resuelve el cliente, porque depende del
 * progreso guardado en el dispositivo. Mismo reparto que /camino.
 *
 * **No lleva `NavInferior`.** En el HTML solo las pantallas 02, 10 y 11 traen
 * barra; la 03 es una pantalla de profundidad dentro de la red, no un destino
 * de la barra. El retorno lo da la flecha de la placa (`BotonVolver`), que es
 * una salida y no un mapa de destinos: montar la barra acá convertiría una
 * pantalla de profundidad en un cuarto destino y borraría esa distinción.
 *
 * `estiloDeLinea()` va acá, en la raíz de la pantalla, y no solo en la placa
 * —que también lo instala en su propio nodo—: es lo que hace que el riel, la
 * tarjeta de la lección en curso y el CTA tomen el color sin recibir props. Un
 * `ejeId` fuera del mapa devuelve `undefined` en `lineaDeEje` y la pantalla cae
 * a tinta sin reventar —aunque con `dynamicParams = false` solo se construyen
 * los cuatro ejes reales, así que en la práctica el fallback no se alcanza
 * desde la web.
 */
export default async function PaginaLinea({
  params,
}: {
  params: Promise<{ ejeId: string }>;
}) {
  const { ejeId } = await params;
  const eje = ejesDelCamino().find((e) => e.id === ejeId);
  if (!eje) notFound();

  const linea = lineaDeEje(ejeId);
  const estaciones = eje.temas.length;

  /* El tramo de Advance al final del riel (docs/fobos-advance.md §3.1). Se
     resuelve acá, en el servidor, porque el gate vive en lib/advance/acceso.ts
     y se consume desde server components; la isla de cliente solo lo coloca.
     Sin `advanceVisible()` no se monta nada y la pantalla es la de siempre. */
  const tramoAdvance = advanceVisible() ? (
    <TramoAdvance estado={await estadoAdvance()} ejeId={ejeId} />
  ) : undefined;

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      {/* La placa va a sangre, sin la columna de contenido: es una banda de
          señalética y con aire a los lados dejaría de leerse como banda. Fuera
          del mapa de líneas no hay placa que pintar —el número y el disco son
          justamente lo que no existe— y queda el título a secas. */}
      {linea ? (
        <PlacaLinea
          linea={linea}
          titulo={eje.nombre}
          subtitulo={subtituloDePlaca(linea, estaciones)}
          volver={<BotonVolver destino="/camino" etiqueta="Volver a la red" />}
          /* Primera de la secuencia de entrada, sin retraso: la cabecera es lo
             que dice dónde estás y llega antes que nada. Los escalones que
             siguen —estaciones y CTA— los pone `LineaDelEje`. */
          className="entra-en-secuencia"
        />
      ) : (
        <h1 className="bg-primary px-4 py-3.5 text-titulo-l text-inverse">{eje.nombre}</h1>
      )}

      <LineaDelEje eje={eje} despuesDelRiel={tramoAdvance} />
    </main>
  );
}
