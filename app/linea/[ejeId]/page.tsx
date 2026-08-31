import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ejesDelCamino } from "@/lib/camino";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";

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
 * **Andamiaje: solo el título.**
 *
 * Las estaciones con su riel, su estado y la tarjeta de la lección en curso
 * llegan después. No se pinta un riel de muestra: el dibujo del recorrido es
 * justamente lo que esta pantalla tiene que decir bien.
 *
 * **No lleva `NavInferior`.** En el HTML solo las pantallas 02, 10 y 11 traen
 * barra; la 03 es una pantalla de profundidad dentro de la red, no un destino
 * de la barra.
 *
 * `estiloDeLinea()` va acá, en la raíz de la pantalla, y no en una sección
 * interna: es lo que instala el color del eje sobre todo el subárbol para que
 * lo que venga después lo tome sin recibir props. Un `ejeId` fuera del mapa
 * devuelve `undefined` en `lineaDeEje` y la pantalla cae a tinta sin reventar
 * —aunque con `dynamicParams = false` solo se construyen los cuatro ejes
 * reales, así que en la práctica el fallback no se alcanza desde la web.
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

  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="mx-auto w-full max-w-2xl px-4 py-8"
    >
      <h1 className="text-3xl font-semibold text-ink">{eje.nombre}</h1>
    </main>
  );
}
