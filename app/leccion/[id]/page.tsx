import { notFound } from "next/navigation";
import { obtenerLeccion, idsPublicables, esPublicable } from "@/lib/contenido";
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
  return <RunnerLeccion leccion={sanitizarLeccion(leccion)} />;
}
