import { notFound } from "next/navigation";
import { obtenerLeccion, idsPublicables, esPublicable } from "@/lib/contenido";
import { temaDelCaminoPorId } from "@/lib/camino";
import { temaDeLeccion } from "@/lib/temas";
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

  /* El tema baja resuelto desde servidor: da el "Lección N de M" del cierre y
     permite que el runner sepa si terminar esta lección completa el tema. El
     barrido de lib/contenido.ts garantiza que toda lección no-demo pertenece a
     exactamente un tema, así que esto no puede quedar vacío para una lección
     publicable — pero si algún día lo hiciera, es un 404 honesto y no una
     pantalla a medias. */
  const registro = temaDeLeccion(leccion.id);
  const tema = registro ? temaDelCaminoPorId(registro.id) : undefined;
  if (!tema) notFound();

  return <RunnerLeccion leccion={sanitizarLeccion(leccion)} tema={tema} />;
}
