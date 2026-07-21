import { obtenerLeccion, idsDeLecciones } from "@/lib/contenido";
import { sanitizarLeccion } from "@/lib/sanitizar";
import { RunnerLeccion } from "@/components/RunnerLeccion";

export async function generateStaticParams() {
  return idsDeLecciones().map((id) => ({ id }));
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
  return <RunnerLeccion leccion={sanitizarLeccion(leccion)} />;
}
