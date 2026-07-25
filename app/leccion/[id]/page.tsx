import { notFound } from "next/navigation";
import { obtenerLeccion, idsPublicables, esPublicable, obtenerCierre } from "@/lib/contenido";
import { sanitizarLeccion } from "@/lib/sanitizar";
import { RunnerLeccion } from "@/components/RunnerLeccion";

export async function generateStaticParams() {
  return idsPublicables().map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: obtenerLeccion(id).titulo };
}

export default async function PaginaLeccion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leccion = obtenerLeccion(id);
  // `generateStaticParams` + `dynamicParams = false` ya impiden que se genere
  // la ruta de una lección no publicable (o de la demo). Esta guardia deja el
  // invariante explícito en el propio handler y lo mantiene aunque cambie la
  // configuración de rutas: nunca se renderiza contenido no publicable.
  if (!esPublicable(leccion)) notFound();
  /* El runner empuja a /cierre al terminar la lección, sin click elegido. Se
     resuelve acá si ese destino muestra el banner de demostración para poder
     avisarlo antes. Baja como booleano y no como contenido: el cierre completo
     viajaría en el payload RSC de cada lección sin renderizarse. `obtenerCierre`
     ya posee la ruta, así que el id no se escribe a mano. */
  const cierreEnDemostracion = !esPublicable(obtenerCierre());
  return (
    <RunnerLeccion
      leccion={sanitizarLeccion(leccion)}
      cierreEnDemostracion={cierreEnDemostracion}
    />
  );
}
