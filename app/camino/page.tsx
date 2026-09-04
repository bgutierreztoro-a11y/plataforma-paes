import type { Metadata } from "next";
import { Camino } from "@/components/camino/Camino";
import { ENLACES_NAV, NavInferior } from "@/components/ui/linea/NavInferior";
import { ejesDelCamino } from "@/lib/camino";

export const metadata: Metadata = {
  /* El plan de la 3J acota esta ruta al comentario del reparto de ancho, así que
     el copy de la pestaña se queda como estaba aunque el titular de la pantalla
     ahora diga "Tu red". El desvío queda anotado en el recuento. */
  title: "Tu camino",
  description: "El temario de Matemática M1 por unidades, y en qué va cada una.",
};

/**
 * La única forma de navegar el contenido. Server component: cruza la taxonomía
 * con los archivos en disco y le pasa a la isla de cliente los cuatro ejes con
 * sus temas ya resueltos. El estado de cada estación lo resuelve el cliente,
 * porque depende del progreso guardado en el dispositivo.
 */
export default function PaginaCamino() {
  /* El ancho y el aire los pone la ruta, no el componente. Hasta la fase 3J era
     al revés —`Camino` montaba una franja fija a sangre que tenía que pegarse
     arriba, así que administraba su propio ancho—; con el resumen por línea esa
     franja desapareció y el reparto vuelve a ser el normal. Mismo envoltorio que
     /tu, que recibe exactamente la misma estructura de datos y dibuja el mismo
     cuerpo de la maqueta.

     La columna flex es para la barra: `NavInferior` no es `fixed` —es un
     `flex w-full border-t` que se sienta al final de su contenedor—, así que
     necesita un contenedor de alto completo del que colgar. `sticky bottom-0`
     le devuelve la superposición que antes daba el `fixed` de la barra global,
     sin volver a montarla en el layout. El `flex-1 flex-col` del `main` es lo
     que además sostiene el `mt-auto` del CTA al pie.

     Esta es la pantalla 02 del HTML, "La red", y por eso el destino activo es
     `red`. No lleva `estiloDeLinea()`: abarca los cuatro ejes y no hay una
     línea activa que instalar. */
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <Camino ejes={ejesDelCamino()} />
      </main>
      <NavInferior
        activo="red"
        enlaces={ENLACES_NAV}
        className="sticky bottom-0 z-40"
      />
    </div>
  );
}
