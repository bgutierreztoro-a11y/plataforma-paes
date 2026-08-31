"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { estadoInicialRunner, reducerRunner } from "@/lib/estadoRunner";
import { registrarEvento } from "@/lib/eventos";
import { leer, marcarCompletada, registrarPaso } from "@/lib/progresoLocal";
import { estadoDeNodo, resumirRespuestas } from "@/lib/estadoNodo";
import type { TemaDelCamino } from "@/lib/camino";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { Boton } from "@/components/ui/Boton";
import { CascaronAnclado } from "@/components/ui/ZonaAnclada";
import { esPasoSimple } from "@/lib/feedbackDelPaso";
import { HeaderLeccion } from "@/components/leccion/HeaderLeccion";
import { PasoLeccion } from "@/components/PasoLeccion";
import { AnuncioPrevioItems } from "@/components/AnuncioPrevioItems";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { ItemsPAESFinal } from "@/components/ItemsPAESFinal";
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

  /* La línea del eje al que pertenece esta lección. Mismo puente que /camino y
     /tema/[id] (`DetalleTema.tsx`), que mapea por id de eje: entrar a una
     lección no cambia de color respecto del tramo del que se entró. El id ya
     viaja dentro de `tema`, así que no hace falta ninguna prop nueva.

     Un eje fuera del mapa devuelve `undefined` y no se pone `style`: el
     fallback es el default de `:root` en app/globals.css:130-135 —`--linea:
     var(--text-primary)` y sus cinco derivados en tinta neutra—, que es
     literalmente la segunda mitad de la regla ("fuera de un eje se usa
     text-primary", ver `components/ui/linea/colores.ts`). Escribir los seis
     tokens a mano acá duplicaría esa tabla en un segundo lugar. */
  const linea = lineaDeEje(tema.ejeId);
  const estiloLinea = linea ? estiloDeLinea(linea) : undefined;

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
      <div className="flex min-h-full flex-col" style={estiloLinea}>
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
      /* `contents` y no un `<div>` normal: el cascarón que arma
         `EjecutorSetItems` mide 100dvh, así que cualquier cosa apilada por
         fuera lo empuja y la zona anclada deja de tocar el fondo —por eso el
         banner de antes se movió adentro—. Un elemento con `display: contents`
         no genera caja y no puede empujar nada, pero las custom properties
         igual heredan: la herencia es por árbol DOM y no por contexto de
         formato, el mismo argumento que en DetalleTema.tsx deja que la tarjeta
         `position: fixed` tome el color. */
      <div className="contents" style={estiloLinea}>
        <EjecutorSetItems
          anclarAcciones
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

  /* Las acciones del paso, ahora ancladas al fondo del viewport (Fase 5).

     El primario domina y el "Paso anterior" baja a variante `texto`: eran dos
     botones del mismo peso decidiendo entre volver y avanzar, y avanzar es lo
     que el paso pide el 90% de las veces. El texto no pierde objetivo táctil
     —Boton mantiene min-h-11 y min-w-11 en todas las variantes—, solo caja.

     `flex-1` sobre el primario y ancho automático en el secundario: el primario
     se queda con todo el ancho sobrante en vez de repartirlo mitad y mitad. */
  const accionesDelPaso = (
    <div className="flex items-center gap-2">
      <Boton
        variante="texto"
        onClick={() => irA("IR_ANTERIOR")}
        disabled={estado.pasoActual === 0}
      >
        Paso anterior
      </Boton>
      {esUltimoPaso ? (
        <Boton className="flex-1" onClick={terminarPasos}>
          Terminar lección
        </Boton>
      ) : (
        <Boton className="flex-1" onClick={avanzar}>
          Siguiente paso
        </Boton>
      )}
    </div>
  );

  return (
    /* Mismo `contents` que la fase de ítems, y por el mismo motivo: el cascarón
       mide 100dvh, así que una caja envolvente de verdad se metería en ese
       cálculo. `display: contents` no genera caja y la variable igual baja por
       el árbol DOM. */
    <div className="contents" style={estiloLinea}>
      <CascaronAnclado
        acciones={accionesDelPaso}
        /* Solo los pasos con un único panel de veredicto anclan feedback: con dos
           ejercicios en pantalla el panel anclado no podría decir a cuál de los
           dos corresponde. 87 de los 100 pasos del corpus califican; los 13
           restantes son los `practica` y `pensar`, que dejan su feedback inline
           junto a cada pregunta. Ver `lib/feedbackDelPaso.ts`. */
        anclarFeedback={esPasoSimple(paso.bloques)}
      >
        {/* Fuera del contenedor con padding: el header y su borde inferior llegan
            a los dos bordes del viewport. Modo foco — acá adentro no hay barra de
            navegación persistente (ninguna pantalla del runner monta NavInferior),
            así que este es el único chrome de la pantalla. */}
        <HeaderLeccion
          pasoActual={estado.pasoActual}
          total={totalPasos}
          tipo={paso.tipo}
        />
        {/* 600px de medida de lectura y 20px de margen lateral. El caso con visual
            conserva el ancho grande: ahí el tope de línea lo pone la columna
            izquierda del grid, no el contenedor, y capar acá mataría las dos
            columnas de escritorio.

            El título de la lección ya no se pinta: lo dice `generateMetadata` en
            app/leccion/[id]/page.tsx, y en pantalla se repetía en cada uno de los
            diez pasos. El único h1 es el título del paso, que vive en
            PasoLeccion.tsx y sí cambia. */}
        <div
          className={`mx-auto w-full flex-1 px-5 py-8 sm:px-6 ${
            pasoConVisual ? "max-w-[37.5rem] lg:max-w-5xl" : "max-w-[37.5rem]"
          }`}
        >
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
          {/* El aviso aparece recién cuando el estudiante intenta avanzar, como
              en el guion: el botón no se deshabilita sin explicación.

              `bg-sunken` y no el tinte de la línea: es un aviso, no identidad de
              eje, y fuera de un eje `--linea-tinte` cae a la superficie de
              tarjeta —blanco sobre blanco— y el recuadro desaparecería. */}
          {mostrarAvisoExploracion && avanceBloqueado && (
            <p
              role="status"
              className="mt-4 rounded-tarjeta bg-sunken px-4 py-3 text-sm text-ink"
            >
              {bloqueConGate.feedbackExploracionInsuficiente}
            </p>
          )}
        </div>
      </CascaronAnclado>
    </div>
  );
}
