import { CaminoFantasma } from "@/components/camino/CaminoFantasma";
import { PuntoDePartida } from "@/components/PuntoDePartida";
import { temasConNodo } from "@/lib/camino";

/**
 * La entrada al producto: el camino de fondo y una sola decisión encima.
 *
 * Antes había dos entradas casi iguales que además se contradecían — `/` era un
 * hero de texto que mandaba a la primera lección, `/inicio` era el punto de
 * partida que mandaba al diagnóstico. Dos pantallas para la misma pregunta, con
 * dos respuestas distintas. Ahora es una sola y `/inicio` redirige acá.
 *
 * El fondo no es decoración: es el mapa del curso, y se entiende antes de leer
 * nada. Va desenfocado, a baja opacidad y sin eventos de puntero, porque su
 * trabajo es explicar de qué se trata esto, no ofrecer una segunda navegación
 * que compita con el botón.
 *
 * Server component: cruza taxonomía con disco y le pasa a la isla solo lo que
 * necesita para decidir el CTA. El estado del estudiante lo resuelve el cliente,
 * porque vive en el dispositivo.
 */
export default function Portada() {
  const temas = temasConNodo();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <section className="fondo-cuadricula cuadricula-desvanecida relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24 lg:py-32">
        <CaminoFantasma nodos={temas.length} />

        <div className="relative w-full">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-ink-suave">
            Matemática M1 · Piloto privado
          </p>
          <div className="mt-4">
            <PuntoDePartida temas={temas} />
          </div>
        </div>
      </section>
    </div>
  );
}
