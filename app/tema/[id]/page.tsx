import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { temasConNodo, temaDelCaminoPorId } from "@/lib/camino";
import { DetalleTema } from "@/components/camino/DetalleTema";

/** Solo los temas con nodo tienen página propia. Un tema sin ninguna lección no
 *  tendría nada que mostrar, y con `dynamicParams = false` cae en el 404 normal
 *  en vez de renderizar una pantalla vacía. */
export async function generateStaticParams() {
  return temasConNodo().map((t) => ({ id: t.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tema = temaDelCaminoPorId(id);
  return { title: tema?.nombre ?? "Tema", description: tema?.objetivo };
}

export default async function PaginaTema({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tema = temaDelCaminoPorId(id);
  if (!tema || tema.lecciones.length === 0) notFound();
  return <DetalleTema tema={tema} />;
}
