import { Bloque } from "@/components/bloques/Bloque";
import type { Paso, Bloque as BloqueTipo } from "@/lib/tipos";

interface PasoLeccionProps {
  paso: Paso;
  leccionId: string;
  numeroPaso: number;
  onExploracionCompleta?: () => void;
}

const TIPOS_VISUALES: BloqueTipo["tipo"][] = ["interactivoSlider", "visualizacion"];

export function PasoLeccion({
  paso,
  leccionId,
  numeroPaso,
  onExploracionCompleta,
}: PasoLeccionProps) {
  /* Los bloques visuales (gráfico interactivo, tablas/diagramas) van al
     costado en desktop, con posición de grid fija (col-start/row-start) que
     no depende del orden en el DOM. En mobile no hay grid, así que el orden
     en el DOM sí importa: el grupo que aparece primero en el JSON define cuál
     de los dos bloques va arriba, para no adelantar un gráfico que revela el
     patrón antes de que el estudiante llegue a la pregunta que lo antecede
     (p. ej. un bloque `prediccion`). Se separan preservando el índice
     original para que las keys y los eventos por bloque no cambien entre
     layouts. */
  const bloquesConIndice = paso.bloques.map((bloque, i) => ({ bloque, i }));
  const visuales = bloquesConIndice.filter(({ bloque }) => TIPOS_VISUALES.includes(bloque.tipo));
  const lectura = bloquesConIndice.filter(({ bloque }) => !TIPOS_VISUALES.includes(bloque.tipo));
  const visualesVanPrimero =
    paso.bloques.length > 0 && TIPOS_VISUALES.includes(paso.bloques[0].tipo);

  function pintar({ bloque, i }: { bloque: BloqueTipo; i: number }) {
    return (
      <Bloque
        key={i}
        bloque={bloque}
        leccionId={leccionId}
        paso={numeroPaso}
        indiceBloque={i}
        onExploracionCompleta={onExploracionCompleta}
      />
    );
  }

  return (
    <section className="transicion-paso">
      {/* El único h1 de la pantalla. Antes era h2, bajo el título de la lección
          que RunnerLeccion pintaba arriba del header; ese salió y el nombre de
          la lección lo da ahora `document.title`. El que cambia en cada paso
          —y por lo tanto el que nombra lo que se está mirando— es este. */}
      <h1 className="text-xl font-semibold text-ink">{paso.titulo}</h1>
      {visuales.length > 0 && lectura.length > 0 ? (
        <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-10">
          <div
            // top-20 (80px) = los 56px del header de HeaderLeccion.tsx más 24
            // de aire, para que no se pisen al hacer scroll en desktop. Venía
            // de top-28 (112px), calibrado contra el header viejo de 97px.
            className={`space-y-8 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:order-none ${
              visualesVanPrimero ? "order-1" : "order-2"
            }`}
          >
            {visuales.map(pintar)}
          </div>
          <div
            className={`space-y-8 lg:col-start-1 lg:row-start-1 lg:order-none ${
              visualesVanPrimero ? "order-2" : "order-1"
            }`}
          >
            {lectura.map(pintar)}
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-2xl space-y-8">
          {paso.bloques.map((bloque, i) => pintar({ bloque, i }))}
        </div>
      )}
    </section>
  );
}
