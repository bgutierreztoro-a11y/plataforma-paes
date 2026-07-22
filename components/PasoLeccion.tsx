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
  /* Los bloques visuales (gráfico interactivo, tablas/diagramas) van arriba en
     mobile y al costado en desktop; el resto conserva su orden de lectura.
     Se separan preservando el índice original para que las keys y los eventos
     por bloque no cambien entre layouts. */
  const bloquesConIndice = paso.bloques.map((bloque, i) => ({ bloque, i }));
  const visuales = bloquesConIndice.filter(({ bloque }) => TIPOS_VISUALES.includes(bloque.tipo));
  const lectura = bloquesConIndice.filter(({ bloque }) => !TIPOS_VISUALES.includes(bloque.tipo));

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
      <h2 className="text-lg font-semibold text-ink">{paso.titulo}</h2>
      {visuales.length > 0 && lectura.length > 0 ? (
        <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-10">
          <div className="space-y-8 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
            {visuales.map(pintar)}
          </div>
          <div className="space-y-8 lg:col-start-1 lg:row-start-1">{lectura.map(pintar)}</div>
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-2xl space-y-8">
          {paso.bloques.map((bloque, i) => pintar({ bloque, i }))}
        </div>
      )}
    </section>
  );
}
