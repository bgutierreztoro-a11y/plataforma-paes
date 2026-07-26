"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { estadoInicialRunner, reducerRunner } from "@/lib/estadoRunner";
import { registrarEvento } from "@/lib/eventos";
import { marcarCompletada, registrarPaso } from "@/lib/progresoLocal";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { Boton } from "@/components/ui/Boton";
import { AvisoCierreDemostracion } from "@/components/ui/Banner";
import { PasoLeccion } from "@/components/PasoLeccion";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { ItemsPAESFinal } from "@/components/ItemsPAESFinal";
import type { LeccionCliente } from "@/lib/sanitizar";
import type { BloqueInteractivoSlider } from "@/lib/tipos";

export function RunnerLeccion({
  leccion,
  cierreEnDemostracion = false,
}: {
  leccion: LeccionCliente;
  /* `true` si /cierre va a mostrar el banner de demostración. Lo resuelve
     app/leccion/[id]/page.tsx en servidor. Sirve para avisarlo antes del click
     que navega, no después de aterrizar. */
  cierreEnDemostracion?: boolean;
}) {
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
  /* "Ir al cierre" solo navega de verdad a /cierre cuando la lección no tiene
     itemsPAES; si los tiene, abre esa fase y el aviso le toca a ItemsPAESFinal,
     que sí es el último click antes de irAlCierre(). */
  const botonFinalVaAlCierre = esUltimoPaso && leccion.itemsPAES.length === 0;

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
    // El avance se persiste en el mismo punto donde ya se instrumentaba el
    // paso: son el mismo hecho ("el estudiante llegó acá") y separarlos abriría
    // la puerta a que uno se registre y el otro no. `registrarPaso` es monótono
    // y nunca lanza, así que un almacenamiento no disponible no afecta al
    // runner (MOS §7.5).
    registrarPaso(leccion.id, estado.pasoActual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.pasoActual]);

  function irAlCierre() {
    registrarEvento({ nombre: "leccion_fin", props: { leccion_id: leccion.id } });
    marcarCompletada(leccion.id);
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
            <ItemsPAESFinal
              respuestas={respuestas}
              onContinuar={irAlCierre}
              cierreEnDemostracion={cierreEnDemostracion}
            />
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
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
          {leccion.titulo}
        </h1>
        {/* Sticky: header pinneado (link de salida + progreso) mientras se
            hace scroll dentro del paso. El título queda afuera, arriba, para
            no inflar la altura fija en mobile. top-28 en
            PasoLeccion.tsx:45 depende de la altura de este bloque — si se
            edita el padding o el gap, hay que revisar ese offset también. */}
        <div className="sticky top-0 z-10 mb-8 space-y-4 border-b border-border bg-surface py-3">
          {/* Modo foco: acá adentro no hay barra de navegación persistente
              (Navegacion.tsx no se monta en /leccion/[id]). Este es el único
              enlace de salida — discreto a propósito, para no competir con el
              CTA "Siguiente paso" del fondo del runner. */}
          <Link
            href="/lecciones"
            className="inline-flex text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← Salir al camino
          </Link>
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
        {botonFinalVaAlCierre && cierreEnDemostracion && (
          <div className="mt-4">
            <AvisoCierreDemostracion />
          </div>
        )}
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
