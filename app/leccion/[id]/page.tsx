import { obtenerLeccion, idsDeLecciones } from "@/lib/contenido";
import { RunnerLeccion } from "@/components/RunnerLeccion";

export async function generateStaticParams() {
  return idsDeLecciones().map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function PaginaLeccion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leccion = obtenerLeccion(id);
  return <RunnerLeccion leccion={leccion} />;
}
