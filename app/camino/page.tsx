import type { Metadata } from "next";
import { Camino } from "@/components/camino/Camino";
import { ENLACES_NAV, NavInferior } from "@/components/ui/linea/NavInferior";
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
     componente. Mismo reparto que /tema/[id] con `DetalleTema`.

     La columna flex es solo para la barra: `NavInferior` no es `fixed` —es un
     `flex w-full border-t` que se sienta al final de su contenedor—, así que
     necesita un contenedor de alto completo del que colgar. `sticky bottom-0`
     le devuelve la superposición que antes daba el `fixed` de la barra global,
     sin volver a montarla en el layout.

     Esta es la pantalla 02 del HTML, "La red", y por eso el destino activo es
     `red`. No lleva `estiloDeLinea()`: abarca los cuatro ejes y no hay una
     línea activa que instalar. */
  return (
    <div className="flex min-h-screen flex-col">
      <Camino ejes={ejesDelCamino()} />
      <NavInferior
        activo="red"
        enlaces={ENLACES_NAV}
        className="sticky bottom-0 z-40"
      />
    </div>
  );
}
