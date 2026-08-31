"use client";

import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

/**
 * El cascarón de las pantallas donde el estudiante responde: el contenido
 * scrollea en su propia región y las acciones quedan ancladas al fondo del
 * viewport, siempre visibles.
 *
 * ## Por qué anclado y no al final del scroll
 *
 * Hasta la Fase 4 las acciones del paso vivían al final del contenido. En un
 * paso largo —el más largo del corpus mide 2963px en un viewport de 844— eso
 * significa que avanzar exige scrollear hasta el fondo, y que el feedback, al
 * aparecer inline, empuja todo hacia abajo: la pantalla salta justo cuando el
 * estudiante acaba de responder.
 *
 * ## La regla que decide qué va anclado
 *
 * **La zona anclada es para lo que se LEE; lo que se RESPONDE vive en flujo
 * normal.**
 *
 * Anclado va el veredicto (una frase que dice qué pasó) y el control que
 * permite seguir. Inline va todo lo que pida una decisión nueva: la
 * autoexplicación restringida de `FeedbackEnCapas`, y cualquier cosa que se le
 * parezca en el futuro.
 *
 * El caso que fijó la regla, medido a 390×844: la autoexplicación son tres
 * opciones de catálogo, 484px de alto. Anclarla contra el tope de 40vh (338px)
 * dejaba al estudiante eligiendo entre tres opciones viendo dos, por una
 * ventanilla con scroll propio, y con las alternativas del ítem fuera de
 * cuadro. Eso no es feedback acompañando al ejercicio: es una segunda pregunta
 * compitiendo con la primera por la misma pantalla.
 *
 * ## El tope de altura es una red, no un mecanismo
 *
 * `max-h-[40vh]` con piso de 200px existe para que un panel que crezca de más
 * no se coma la pantalla. Con la regla de arriba aplicada, el panel más alto
 * que llega acá mide ~181px (veredicto 94 + pie 87) y nunca lo toca. **Si
 * algún día se activa, es señal de que algo creció donde no correspondía y hay
 * que mirarlo** — no de que el tope esté haciendo bien su trabajo.
 */

/* El nodo del DOM donde aterrizan los paneles anclados. `null` = esta pantalla
   no ancla feedback (paso con varios ejercicios), y los paneles se quedan
   donde están. */
const ContextoZonaAnclada = createContext<HTMLElement | null>(null);

/**
 * Manda un panel a la zona anclada, o lo deja en su lugar si no hay ninguna.
 *
 * Es un portal y no estado levantado a propósito: el `revelado` de cada bloque
 * se queda donde siempre estuvo, y ningún componente tiene que aprender a
 * describir su feedback en una forma que un padre sepa dibujar. Lo único que
 * cambia es dónde se pinta.
 */
export function usePanelAnclado(): (panel: React.ReactNode) => React.ReactNode {
  const destino = useContext(ContextoZonaAnclada);
  return (panel) => (destino ? createPortal(panel, destino) : panel);
}

export function CascaronAnclado({
  children,
  acciones,
  /* Solo los pasos con un único panel de veredicto anclan feedback: ver
     `lib/feedbackDelPaso.ts`. Con dos ejercicios en pantalla, un panel anclado
     tendría que elegir a cuál de los dos representa. */
  anclarFeedback = false,
  className = "",
}: {
  children: React.ReactNode;
  acciones: React.ReactNode;
  anclarFeedback?: boolean;
  className?: string;
}) {
  /* Callback ref y no `useRef`: el portal necesita el nodo durante el render de
     los hijos, y una ref no dispara el segundo render que lo publica. */
  const [destino, setDestino] = useState<HTMLElement | null>(null);

  return (
    /* Columna de alto fijo con una sola región que scrollea. Evita todo el
       aparato de `position: fixed` + padding compensatorio + observador de
       tamaño: la zona anclada es simplemente el último hijo de un flex que no
       encoge.

       Ya no hay margen negativo que compensar. Mientras la navegación se
       montaba global y era `fixed`, <body> le reservaba el alto con `pb-14` y
       este cascarón lo devolvía con `-mb-14` vía una prop `modoFoco`. Eran un
       par y se fueron juntos: la barra ya no se monta en el layout, así que el
       <body> no reserva nada y no queda nada que cancelar.

       El par nunca estuvo mal aplicado, aunque lo parezca: `EjecutorSetItems`
       pasaba `modoFoco` siempre, pero corta antes con `anclarAcciones` (que
       solo pasa RunnerLeccion), así que este cascarón únicamente se montaba en
       /leccion/[id] — donde la barra no estaba y cancelar era lo correcto.
       Medido a 390×844 tras el cambio: top 0, bottom 844, sin scroll de más. */
    <div className={`flex h-[100dvh] flex-col ${className}`}>
      {/* `relative` no es decorativo y no se puede sacar: los `sr-only` de
          Tailwind y el `.solo-lector` propio son `position: absolute`, y sin un
          ancestro posicionado acá adentro resuelven contra el viewport. Ahí
          escapan del recorte de `overflow-y-auto` y estiran el documento —
          medido: 1757px de scroll en una pantalla de 844, con lo que la barra
          anclada se iba con el scroll y dejaba de estar anclada. */}
      <div className="desvanece-bajo-anclado relative flex-1 overflow-y-auto">
        {/* El destino se publica por contexto y no por props: los paneles los
            renderizan los bloques, a tres o cuatro niveles de profundidad, y
            enhebrar la ref por cada uno los obligaría a conocer un layout que
            no les incumbe. */}
        <ContextoZonaAnclada.Provider value={destino}>{children}</ContextoZonaAnclada.Provider>
      </div>
      <div className="shrink-0 border-t border-border bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-[37.5rem] flex-col gap-3">
          {/* Los paneles anclados aterrizan acá, sobre las acciones: primero se
              lee qué pasó, después se sigue. El contenedor va siempre montado
              —aunque esté vacío— porque es el destino del portal. */}
          {anclarFeedback && (
            <div ref={setDestino} className="max-h-[40vh] min-h-0 overflow-y-auto" />
          )}
          {acciones}
        </div>
      </div>
    </div>
  );
}
