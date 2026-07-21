"use client";

import { useEffect, useState } from "react";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { Boton, EnlaceBoton } from "@/components/ui/Boton";
import { BannerDemostracion } from "@/components/ui/Banner";
import { guardarResultadoDiagnostico } from "@/lib/progresoSesion";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";
import type { DiagnosticoCliente } from "@/lib/sanitizar";

/* Guarda el resultado en memoria de sesión al montar (efecto, no durante el
   render). Es la medición "pre" que el cierre compara al final del módulo. */
function FinalDiagnostico({ respuestas }: { respuestas: RespuestaRegistrada[] }) {
  useEffect(() => {
    guardarResultadoDiagnostico({
      aciertos: respuestas.filter((r) => r.correcta).length,
      total: respuestas.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar; respuestas ya no cambia
  }, []);

  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Listo, ya tenemos tu punto de partida
      </h1>
      <p className="max-w-md text-base leading-relaxed text-ink-suave">
        Guardamos tu resultado para esta sesión: cuando termines el módulo y rindas el cierre,
        vas a poder ver cuánto avanzaste.
      </p>
      <EnlaceBoton href="/leccion/l0-demo">Empezar la lección</EnlaceBoton>
    </div>
  );
}

export function Diagnostico({ diagnostico }: { diagnostico: DiagnosticoCliente }) {
  const [fase, setFase] = useState<"entrada" | "items">("entrada");

  if (fase === "entrada") {
    return (
      <div className="flex min-h-full flex-col">
        {diagnostico.estado !== "publicable" && <BannerDemostracion />}
        <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg rounded-tarjeta border border-border bg-surface p-8 shadow-tarjeta">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Antes de empezar, midamos tu punto de partida
            </h1>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-suave">
              <p>
                Son 5 preguntas formato PAES. No te vamos a decir cuáles tuviste buenas ni malas —
                es a propósito: esto no es una prueba, es la foto de dónde partes.
              </p>
              <p>
                Al final del módulo rindes el cierre y comparamos ambos resultados para que veas
                tu avance real. Intenta responder a ritmo de PAES: alrededor de 2 minutos por
                pregunta.
              </p>
            </div>
            <div className="mt-6">
              <Boton onClick={() => setFase("items")}>Empezar diagnóstico</Boton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {diagnostico.estado !== "publicable" && <BannerDemostracion />}
      <EjecutorSetItems
        items={diagnostico.items}
        mostrarFeedback={false}
        renderFinal={(respuestas) => <FinalDiagnostico respuestas={respuestas} />}
      />
    </div>
  );
}
