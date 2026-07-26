import type { Metadata } from "next";
import { Camino } from "@/components/camino/Camino";
import { temasConNodo, temasSinContenido } from "@/lib/camino";

export const metadata: Metadata = {
  title: "Tu camino",
  description: "El temario de Matemática M1 por unidades, y en qué va cada una.",
};

/**
 * La única forma de navegar el contenido. Server component: cruza la taxonomía
 * con los archivos en disco y le pasa a la isla de cliente solo lo que necesita
 * para pintar los nodos. El estado de cada uno lo resuelve el cliente, porque
 * depende del progreso guardado en el dispositivo.
 */
export default function PaginaCamino() {
  return (
    <div className="min-h-full flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <Camino temasConNodo={temasConNodo()} temasSinContenido={temasSinContenido()} />
      </div>
    </div>
  );
}
