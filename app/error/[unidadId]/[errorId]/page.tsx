import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreguntaPublica } from "@/components/recorrido/PreguntaPublica";
import { obtenerBanco } from "@/lib/advance/banco";
import { protegerExpresiones } from "@/lib/advance/protegerExpresiones";
import { catalogoCompletoDelModulo } from "@/lib/catalogoErrores";
import { ERRORES_PUBLICOS, errorPublico, type CasoRespuesta } from "@/lib/recorrido/erroresPublicos";
import type { ClaveAlternativa } from "@/lib/tipos";

/* Solo las páginas de la lista blanca existen; cualquier otra ruta da 404 (ADR-01). */
export const dynamicParams = false;

export function generateStaticParams() {
  return ERRORES_PUBLICOS.map(({ unidadId, errorId }) => ({ unidadId, errorId }));
}

type Params = Promise<{ unidadId: string; errorId: string }>;

const TITULO = "La trampa del video: pruébala tú · Fobos";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { unidadId, errorId } = await params;
  const entrada = errorPublico(unidadId, errorId);
  const descripcion = entrada ? `${entrada.etiquetaUnidad} · 1 pregunta · sin cuenta` : undefined;
  return {
    title: { absolute: TITULO },
    description: descripcion,
    openGraph: { title: TITULO, description: descripcion, type: "website", locale: "es_CL" },
    robots: { index: false, follow: false },
  };
}

function proteger(caso: CasoRespuesta): CasoRespuesta {
  return { titulo: caso.titulo, parrafos: caso.parrafos.map(protegerExpresiones) };
}

export default async function PaginaErrorPublico({ params }: { params: Params }) {
  const { unidadId, errorId } = await params;
  const entrada = errorPublico(unidadId, errorId);
  if (!entrada) notFound();

  const banco = obtenerBanco(entrada.unidadId);
  const item = banco?.items.find((i) => i.id === entrada.itemId);
  const correcta = item?.alternativas.find((a) => a.esCorrecta)?.clave;
  /* Una entrada de la lista sin su ítem es un error de contenido: que falle el build, no un 404 silencioso. */
  if (!banco || !item || !correcta) {
    throw new Error(`Página pública ${unidadId}/${errorId}: no está ${entrada.itemId} en el banco`);
  }

  const otros = catalogoCompletoDelModulo(banco.moduloId).size - 1;
  const casos = Object.fromEntries(
    Object.entries(entrada.casos).map(([clave, caso]) => [clave, proteger(caso)]),
  ) as Record<ClaveAlternativa, CasoRespuesta>;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <header className="mb-6">
        <h1 className="text-display-m text-primary">La trampa del video</h1>
        <p className="mt-2 text-cuerpo-s text-secondary">
          {entrada.etiquetaUnidad} · 1 pregunta · sin cuenta
        </p>
      </header>
      <PreguntaPublica
        unidadId={entrada.unidadId}
        errorId={entrada.errorId}
        itemId={item.id}
        enunciado={item.enunciado}
        alternativas={item.alternativas.map((a) => ({ clave: a.clave, texto: a.texto }))}
        correcta={correcta}
        textos={{
          tentadora: entrada.tentadora,
          casos,
          lineaTrasOtra: protegerExpresiones(entrada.lineaTrasOtra),
        }}
        cierre={`En Fobos, cada alternativa incorrecta tiene detrás un error con nombre. En ${entrada.unidadEnFrase} hay ${otros} más como este.`}
      />
    </main>
  );
}
