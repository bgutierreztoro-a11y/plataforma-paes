import type { Metadata } from "next";
import { Camino } from "@/components/camino/Camino";
import { ejesDelCamino } from "@/lib/camino";

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
  /* Sin envoltorio con padding: la franja fija de `Camino` va a sangre para
     poder pegarse arriba, así que el ancho y el aire los administra el propio
     componente. Mismo reparto que /tema/[id] con `DetalleTema`. */
  return <Camino ejes={ejesDelCamino()} />;
}
