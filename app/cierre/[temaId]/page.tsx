import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerCierre } from "@/lib/contenido";
import { temaDelCaminoPorId, temasDelCamino } from "@/lib/camino";
import { sanitizarCierre } from "@/lib/sanitizar";
import { Cierre } from "@/components/Cierre";

export async function generateStaticParams() {
  return temasDelCamino()
    .filter((tema) => tema.cierreId)
    .map((tema) => ({ temaId: tema.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ temaId: string }>;
}): Promise<Metadata> {
  const { temaId } = await params;
  const tema = temaDelCaminoPorId(temaId);
  return {
    title: "Cierre",
    description: `Preguntas formato PAES para ver cuánto avanzaste en ${tema?.nombre ?? "el módulo"}.`,
  };
}

export default async function PaginaCierre({
  params,
}: {
  params: Promise<{ temaId: string }>;
}) {
  const { temaId } = await params;
  const tema = temaDelCaminoPorId(temaId);
  if (!tema || !tema.cierreId) notFound();

  const cierre = obtenerCierre(tema.cierreId);
  /* Última lección de ESTE tema: es la que el estudiante deja atrás cuando
     pide "la próxima". Scoped al tema y no al camino completo, para que un
     módulo no apunte a la última lección de otro módulo. */
  const ultimaLeccionId = tema.lecciones.at(-1)?.id;

  return <Cierre cierre={sanitizarCierre(cierre)} ultimaLeccionId={ultimaLeccionId} />;
}
