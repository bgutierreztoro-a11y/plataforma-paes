"use client";

import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { estadoInicialRunner, reducerRunner } from "@/lib/estadoRunner";
import { registrarEvento } from "@/lib/eventos";
import { marcarLeccionCompletada } from "@/lib/progresoSesion";
import { BannerDemostracion } from "@/components/ui/Banner";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { Boton } from "@/components/ui/Boton";
import { PasoLeccion } from "@/components/PasoLeccion";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { ItemsPAESFinal } from "@/components/ItemsPAESFinal";
import type { LeccionCliente } from "@/lib/sanitizar";

export function RunnerLeccion({ leccion }: { leccion: LeccionCliente }) {
  const [estado, dispatch] = useReducer(reducerRunner, estadoInicialRunner);
  const [fase, setFase] = useState<"pasos" | "itemsPAES">("pasos");
  const router = useRouter();
  const totalPasos = leccion.pasos.length;
  const esUltimoPaso = estado.pasoActual === totalPasos - 1;

  useEffect(() => {
    registrarEvento({ nombre: "leccion_inicio", props: { leccion_id: leccion.id } });
    // Solo al montar: leccion_inicio se dispara una vez por sesión de lección.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registrarEvento({
      nombre: "paso_inicio",
      props: { paso: estado.pasoActual + 1, leccion_id: leccion.id },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.pasoActual]);

  function irAlCierre() {
    registrarEvento({ nombre: "leccion_fin", props: { leccion_id: leccion.id } });
    marcarLeccionCompletada(leccion.id);
    router.push("/cierre");
  }

  function terminarPasos() {
    if (leccion.itemsPAES.length > 0) {
      setFase("itemsPAES");
    } else {
      irAlCierre();
    }
  }

  if (fase === "itemsPAES") {
    return (
      <div className="flex min-h-full flex-col">
        {leccion.estado !== "publicable" && <BannerDemostracion />}
        <EjecutorSetItems
          items={leccion.itemsPAES}
          mostrarFeedback={true}
          renderFinal={(respuestas) => (
            <ItemsPAESFinal respuestas={respuestas} onContinuar={irAlCierre} />
          )}
        />
      </div>
    );
  }

  const paso = leccion.pasos[estado.pasoActual];
  /* El paso usa dos columnas en desktop (y necesita más ancho) solo cuando
     mezcla bloque visual con bloques de lectura — mismo criterio que
     PasoLeccion. */
  const esVisual = (t: string) => t === "interactivoSlider" || t === "visualizacion";
  const pasoConVisual =
    paso.bloques.some((b) => esVisual(b.tipo)) && paso.bloques.some((b) => !esVisual(b.tipo));

  return (
    <div className="flex min-h-full flex-col">
      {leccion.estado !== "publicable" && <BannerDemostracion />}
      <div
        className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 ${
          pasoConVisual ? "max-w-2xl lg:max-w-5xl" : "max-w-2xl"
        }`}
      >
        <div className="mb-8 space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{leccion.titulo}</h1>
          <BarraProgreso
            pasoActual={estado.pasoActual}
            total={totalPasos}
            detalle={paso.tipo}
          />
        </div>
        <PasoLeccion
          key={estado.pasoActual}
          paso={leccion.pasos[estado.pasoActual]}
          leccionId={leccion.id}
          numeroPaso={estado.pasoActual + 1}
        />
        <div className="mt-8 flex justify-between gap-3">
          <Boton
            variante="secundario"
            onClick={() => dispatch({ type: "IR_ANTERIOR" })}
            disabled={estado.pasoActual === 0}
          >
            Paso anterior
          </Boton>
          {esUltimoPaso ? (
            <Boton onClick={terminarPasos}>Ir al cierre</Boton>
          ) : (
            <Boton onClick={() => dispatch({ type: "IR_SIGUIENTE" })}>Siguiente paso</Boton>
          )}
        </div>
      </div>
    </div>
  );
}
