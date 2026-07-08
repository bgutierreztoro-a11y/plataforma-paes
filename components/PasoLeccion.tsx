import { Bloque } from "@/components/bloques/Bloque";
import type { Paso } from "@/lib/tipos";

interface PasoLeccionProps {
  paso: Paso;
  leccionId: string;
  numeroPaso: number;
}

export function PasoLeccion({ paso, leccionId, numeroPaso }: PasoLeccionProps) {
  return (
    <section className="transicion-paso space-y-6">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-suave">{paso.tipo}</p>
      <h2 className="text-lg font-semibold text-ink">{paso.titulo}</h2>
      <div className="space-y-8">
        {paso.bloques.map((bloque, i) => (
          <Bloque
            key={i}
            bloque={bloque}
            leccionId={leccionId}
            paso={numeroPaso}
            indiceBloque={i}
          />
        ))}
      </div>
    </section>
  );
}
