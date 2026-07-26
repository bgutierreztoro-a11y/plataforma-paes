import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { temasConNodo, temaDelCaminoPorId } from "@/lib/camino";
import { CelebracionTema } from "@/components/camino/CelebracionTema";

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
  return { title: tema ? `${tema.nombre} · completado` : "Tema completado" };
}

/** Pantalla de celebración de tema. Es ruta propia y no un estado dentro del
 *  runner para que exista una URL a la que volver desde el botón atrás sin
 *  reejecutar la lección — y para que la idempotencia sea visible en un solo
 *  lugar (components/camino/CelebracionTema.tsx). */
export default async function PaginaTemaCompletado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tema = temaDelCaminoPorId(id);
  if (!tema || tema.lecciones.length === 0) notFound();
  return <CelebracionTema tema={tema} temasConNodo={temasConNodo()} />;
}
