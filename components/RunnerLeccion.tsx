"use client";

import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { estadoInicialRunner, reducerRunner } from "@/lib/estadoRunner";
import { registrarEvento } from "@/lib/eventos";
import { marcarLeccionCompletada } from "@/lib/progresoSesion";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { Boton } from "@/components/ui/Boton";
import { PasoLeccion } from "@/components/PasoLeccion";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { ItemsPAESFinal } from "@/components/ItemsPAESFinal";
import type { LeccionCliente } from "@/lib/sanitizar";
import type { BloqueInteractivoSlider } from "@/lib/tipos";

export function RunnerLeccion({ leccion }: { leccion: LeccionCliente }) {
  const [estado, dispatch] = useReducer(reducerRunner, estadoInicialRunner);
  const [fase, setFase] = useState<"pasos" | "itemsPAES">("pasos");
  /* Gate de exploración: un paso con slider de variante unaVariable no deja
     avanzar hasta que el estudiante probó `exploracionMinima` valores
     distintos. Sin ese piso, el paso se puede pasar de largo sin mirar el
     gráfico, que es justo lo único que el paso enseña. */
  const [exploracionCumplida, setExploracionCumplida] = useState(false);
  const [mostrarAvisoExploracion, setMostrarAvisoExploracion] = useState(false);
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

  const bloqueConGate = paso.bloques.find(
    (b): b is BloqueInteractivoSlider =>
      b.tipo === "interactivoSlider" && typeof b.exploracionMinima === "number",
  );
  const avanceBloqueado = bloqueConGate !== undefined && !exploracionCumplida;

  /* El gate se reinicia al cambiar de paso, en el handler y no en un efecto:
     el cambio de paso lo dispara siempre un click, no hay otra fuente. */
  function irA(accion: "IR_SIGUIENTE" | "IR_ANTERIOR") {
    dispatch({ type: accion });
    setExploracionCumplida(false);
    setMostrarAvisoExploracion(false);
  }

  function avanzar() {
    if (avanceBloqueado) {
      setMostrarAvisoExploracion(true);
      return;
    }
    irA("IR_SIGUIENTE");
  }

  return (
    <div className="flex min-h-full flex-col">
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
          onExploracionCompleta={() => {
            setExploracionCumplida(true);
            setMostrarAvisoExploracion(false);
          }}
        />
        <div className="mt-8 flex justify-between gap-3">
          <Boton
            variante="secundario"
            onClick={() => irA("IR_ANTERIOR")}
            disabled={estado.pasoActual === 0}
          >
            Paso anterior
          </Boton>
          {esUltimoPaso ? (
            <Boton onClick={terminarPasos}>Ir al cierre</Boton>
          ) : (
            <Boton onClick={avanzar}>Siguiente paso</Boton>
          )}
        </div>
        {/* El aviso aparece recién cuando el estudiante intenta avanzar, como
            en el guion: el botón no se deshabilita sin explicación. */}
        {mostrarAvisoExploracion && avanceBloqueado && (
          <p
            role="status"
            className="mt-4 rounded-tarjeta bg-accent-suave px-4 py-3 text-sm text-ink"
          >
            {bloqueConGate.feedbackExploracionInsuficiente}
          </p>
        )}
      </div>
    </div>
  );
}
