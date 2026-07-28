"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { estadoInicialRunner, reducerRunner } from "@/lib/estadoRunner";
import { registrarEvento } from "@/lib/eventos";
import { leer, marcarCompletada, registrarPaso } from "@/lib/progresoLocal";
import { estadoDeNodo, resumirRespuestas } from "@/lib/estadoNodo";
import type { TemaDelCamino } from "@/lib/camino";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { Boton } from "@/components/ui/Boton";
import { PasoLeccion } from "@/components/PasoLeccion";
import { AnuncioPrevioItems } from "@/components/AnuncioPrevioItems";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { ItemsPAESFinal } from "@/components/ItemsPAESFinal";
import { BannerDemostracion } from "@/components/ui/Banner";
import type { LeccionCliente } from "@/lib/sanitizar";
import type { BloqueInteractivoSlider } from "@/lib/tipos";

export function RunnerLeccion({
  leccion,
  tema,
  siguienteLeccionId,
}: {
  leccion: LeccionCliente;
  /* El tema al que pertenece esta lección, resuelto en servidor por
     app/leccion/[id]/page.tsx. Da el "Lección N de M" del cierre y permite
     saber si terminar esta lección cierra el tema completo. */
  tema: TemaDelCamino;
  /* Id de la siguiente lección publicable del camino completo (no solo de
     este tema), resuelta en servidor con idsPublicables(). Sin siguiente
     (última lección publicable de hoy) queda undefined. */
  siguienteLeccionId?: string;
}) {
  const [estado, dispatch] = useReducer(reducerRunner, estadoInicialRunner);
  const [fase, setFase] = useState<"pasos" | "anuncio" | "itemsPAES">("pasos");
  /* Gate de exploración: un paso con slider de variante unaVariable no deja
     avanzar hasta que el estudiante probó `exploracionMinima` valores
     distintos. Sin ese piso, el paso se puede pasar de largo sin mirar el
     gráfico, que es justo lo único que el paso enseña. */
  const [exploracionCumplida, setExploracionCumplida] = useState(false);
  const [mostrarAvisoExploracion, setMostrarAvisoExploracion] = useState(false);
  const router = useRouter();
  const totalPasos = leccion.pasos.length;
  const esUltimoPaso = estado.pasoActual === totalPasos - 1;
  const indiceEnTema = tema.lecciones.findIndex((l) => l.id === leccion.id);

  /* Los dos `ref` de abajo son el mismo guardia que CelebracionTema.tsx y
     ItemsPAESFinal.tsx ya usan: React vuelve a invocar los efectos en modo
     estricto de desarrollo (mount → cleanup → mount) para detectar
     impurezas, y sin guardia estos dos duplicaban el evento — verificado en
     el navegador, con navegación cliente hacia /leccion/[id] (por URL
     directa no se reproducía, por eso pasó una sesión sin notarse). */
  const yaInicio = useRef(false);
  useEffect(() => {
    if (yaInicio.current) return;
    yaInicio.current = true;
    registrarEvento({ nombre: "leccion_inicio", props: { leccion_id: leccion.id } });
    // Solo al montar: leccion_inicio se dispara una vez por sesión de lección.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Guarda el último paso ya registrado y no un booleano de una sola vez,
     porque a diferencia de leccion_inicio este evento sí tiene que volver a
     dispararse cada vez que estado.pasoActual cambia de verdad — solo se
     salta la re-invocación del modo estricto sobre el MISMO valor. */
  const ultimoPasoRegistrado = useRef<number | null>(null);
  useEffect(() => {
    if (ultimoPasoRegistrado.current === estado.pasoActual) return;
    ultimoPasoRegistrado.current = estado.pasoActual;
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

  /* Terminar la lección la marca completada y decide el destino. Si con esto el
     tema entero queda completado y su celebración no se ha mostrado nunca, se
     va a esa pantalla; si no, al camino. La decisión se toma DESPUÉS de
     marcarCompletada para que el estado del nodo ya incluya esta lección. */
  function terminar() {
    registrarEvento({ nombre: "leccion_fin", props: { leccion_id: leccion.id } });
    marcarCompletada(leccion.id);

    const progreso = leer();
    const estadoTema = estadoDeNodo(tema, progreso, resumirRespuestas(progreso));
    const yaCelebrado = progreso?.temasCelebrados?.includes(tema.id) ?? false;

    if (estadoTema === "completado" && !yaCelebrado) {
      router.push(`/tema/${tema.id}/completado`);
    } else if (siguienteLeccionId) {
      router.push(`/leccion/${siguienteLeccionId}`);
    } else {
      router.push("/camino");
    }
  }

  /* Repetir solo el cierre (itemsPAES), sin rehacer los 10 pasos. Volver a
     pasar por la fase "anuncio" alcanza: EjecutorSetItems no lleva `key` y su
     estado vive en un useReducer local, así que al desmontarse (esta fase) y
     volver a montarse (fase "itemsPAES") arranca limpio, sin arrastrar
     respuestas de la vuelta anterior. */
  function repetirCierre() {
    setFase("anuncio");
    window.scrollTo({ top: 0 });
  }

  function repasar() {
    dispatch({ type: "REINICIAR" });
    setFase("pasos");
    setExploracionCumplida(false);
    setMostrarAvisoExploracion(false);
    window.scrollTo({ top: 0 });
  }

  function terminarPasos() {
    if (leccion.itemsPAES.length > 0) {
      setFase("anuncio");
    } else {
      terminar();
    }
  }

  if (fase === "anuncio") {
    return (
      <div className="flex min-h-full flex-col">
        {leccion.estado !== "publicable" && <BannerDemostracion />}
        <AnuncioPrevioItems
          variante="leccion"
          cantidad={leccion.itemsPAES.length}
          onEmpezar={() => setFase("itemsPAES")}
        />
      </div>
    );
  }

  if (fase === "itemsPAES") {
    return (
      <div className="flex min-h-full flex-col">
        {leccion.estado !== "publicable" && <BannerDemostracion />}
        <EjecutorSetItems
          items={leccion.itemsPAES}
          mostrarFeedback={true}
          contexto="leccion"
          contextoId={leccion.id}
          renderFinal={(respuestas) => (
            <ItemsPAESFinal
              respuestas={respuestas}
              leccionId={leccion.id}
              temaNombre={tema.nombre}
              ordinalLeccion={indiceEnTema + 1}
              totalLeccionesTema={tema.lecciones.length}
              onRepasar={repasar}
              onRepetirCierre={repetirCierre}
              onContinuar={terminar}
              siguienteLeccionId={siguienteLeccionId}
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
      {leccion.estado !== "publicable" && <BannerDemostracion />}
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
            href="/camino"
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
            <Boton onClick={terminarPasos}>Terminar lección</Boton>
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
