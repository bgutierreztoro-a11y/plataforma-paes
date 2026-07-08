"use client";

import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { EnlaceBoton } from "@/components/ui/Boton";
import type { DiagnosticoContenido } from "@/lib/tipos";

export function Diagnostico({ diagnostico }: { diagnostico: DiagnosticoContenido }) {
  return (
    <EjecutorSetItems
      items={diagnostico.items}
      mostrarFeedback={false}
      renderFinal={() => (
        <div className="fondo-cuadricula flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold text-ink">Listo, ya tenemos tu punto de partida</h1>
          <p className="max-w-md text-base text-ink-suave">
            Ahora sigamos con la primera lección.
          </p>
          <EnlaceBoton href="/leccion/l0-demo">Empezar la lección</EnlaceBoton>
        </div>
      )}
    />
  );
}
