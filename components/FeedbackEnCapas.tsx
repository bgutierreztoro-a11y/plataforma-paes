"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { TarjetaError } from "@/components/ui/linea/TarjetaError";
import { usePanelAnclado } from "@/components/ui/ZonaAnclada";

/**
 * Feedback en tres capas, para lo que pasa después de comprobar una respuesta.
 *
 * El problema que resuelve: antes, todo el feedback llegaba de una vez dentro
 * de un recuadro que ya era verde o rojo y ya traía ✓ o ✗. El color contestaba
 * "¿la tuve bien?" antes de que se leyera la primera palabra, y con esa
 * pregunta resuelta se iba el motivo para leer el resto — que es justo la parte
 * que enseña.
 *
 * - Capa 1, siempre visible: qué pasó con ESTA respuesta, en términos del
 *   objeto del problema. Nunca "Incorrecto" a secas.
 * - Capa 2, tras pedirla: el mecanismo del error, no el ejercicio. Sale del
 *   `catalogoErrores` del módulo, resuelto en el servidor (ver lib/sanitizar.ts).
 *   Se muestra en el banner en tinta de `ui/linea/TarjetaError.tsx` — la única
 *   superficie oscura del sistema. **Sigue detrás del gate:** el banner cambia
 *   cómo se lee la capa, no cuándo aparece. Que la explicación se pida y no se
 *   imponga es la decisión pedagógica de este archivo y no la toca el rediseño.
 * - Capa 3, opcional: qué hacer la próxima vez que aparezca.
 *
 * **Al fallar no hay color de alarma ni ✗.** El veredicto visual no puede
 * llegar antes que la Capa 1: si el recuadro ya es rojo, la frase que explica
 * qué pasó llega tarde. El acierto sí se marca —es información, no reproche—
 * y además ya viene anclado a la alternativa elegida.
 *
 * Nada de esto comenta a la persona. El elogio personal ("¡crack!", "eres bueno
 * en esto") desplaza al contenido sustantivo y está prohibido en las tres capas.
 *
 * ## Qué se ancla y qué no (Fase 5)
 *
 * La Capa 1 y el pie —lo que se **lee** y el control para seguir— van a la zona
 * anclada al fondo del viewport. La autoexplicación y la Capa 2 se quedan en el
 * flujo normal.
 *
 * No es una decisión de encuadre sino de tamaño medido: la autoexplicación son
 * tres opciones de catálogo y mide 484px a 390×844, contra los 94px de la Capa
 * 1. Anclarla obligaba a elegir entre tres opciones viendo dos, por una
 * ventanilla con scroll, con las alternativas del ítem fuera de cuadro. La
 * regla general —lo que se lee va anclado, lo que se responde vive en flujo
 * normal— está en `ZonaAnclada.tsx`.
 */
export function FeedbackEnCapas({
  esCorrecta,
  capa1,
  capa2,
  capa3,
  rotuloError,
  opcionesAutoexplicacion,
  onVerPorQue,
  onAutoexplicacion,
  pie,
  extra,
}: {
  esCorrecta: boolean;
  /** Una frase. Nunca vacía: quien llama es responsable de dar un texto. */
  capa1: string;
  /** Ausente cuando el módulo no tiene `catalogoErrores` (hoy, los cierres). */
  capa2?: string;
  capa3?: string;
  /**
   * Las versalitas del banner, ya compuestas por quien llama: la referencia del
   * error y, desde la segunda vez, cuántas van en la sesión. Ver
   * `rotuloDeError` en lib/progresoSesion.ts.
   *
   * Se recibe compuesto y no como `(id, conteo)` porque el conteo se registra al
   * comprobar la respuesta, no al pintar: contarlo acá lo sumaría de nuevo en
   * cada re-render del panel.
   */
  rotuloError?: string;
  /** Tres descripciones del catálogo del módulo, o ausente para omitir el paso. */
  opcionesAutoexplicacion?: string[];
  /** Se dispara al abrir la Capa 2, una sola vez. Para instrumentación. */
  onVerPorQue?: () => void;
  /** `elegida` es null si el estudiante saltó el paso. */
  onAutoexplicacion?: (elegida: string | null) => void;
  /**
   * Viaja con la Capa 1 a la zona anclada. Solo para el control que **cierra
   * este ejercicio y deja seguir** — el pie de ItemPAES, con el tiempo de
   * resolución y "Siguiente pregunta".
   */
  pie?: React.ReactNode;
  /**
   * Se queda en el flujo, al final, junto a su pregunta. Para acciones sobre el
   * **ejercicio** y no sobre el paso: "Intentar de nuevo" reintenta este bloque,
   * así que anclarlo lo pondría a competir con la navegación de pasos en una
   * barra de 390px, y rompería la regla de `ZonaAnclada.tsx` — lo que se
   * responde vive en flujo normal.
   */
  extra?: React.ReactNode;
}) {
  const [porQueAbierto, setPorQueAbierto] = useState(false);
  const [autoexplicado, setAutoexplicado] = useState(false);
  const anclar = usePanelAnclado();

  /* El paso solo existe si hay tres opciones reales del catálogo y hay una
     Capa 2 que revelar después: preguntar "¿qué te pasó?" para después no
     contestarlo sería un peaje sin contraparte. */
  const hayAutoexplicacion =
    !esCorrecta && !!capa2 && (opcionesAutoexplicacion?.length ?? 0) === 3 && !autoexplicado;

  function abrirPorQue() {
    setPorQueAbierto(true);
    onVerPorQue?.();
  }

  /* Elija lo que elija —o si lo salta— después ve la Capa 2 completa. No hay
     penalización, ni segundo intento, ni cambio en el resultado del ítem: esto
     mide si reconoce su propio error, no lo evalúa. */
  function responderAutoexplicacion(elegida: string | null) {
    setAutoexplicado(true);
    setPorQueAbierto(true);
    onAutoexplicacion?.(elegida);
  }

  return (
    <div className="transicion-paso space-y-4">
      {/* `neutro` al fallar: el veredicto visual no puede llegar antes que la
          frase que explica qué pasó. Es la excepción documentada a la
          unificación de tonos — ver PanelFeedback.tsx. */}
      {anclar(
        <div className="entra-panel-anclado space-y-3">
          <PanelFeedback tono={esCorrecta ? "acierto" : "neutro"}>{capa1}</PanelFeedback>
          {pie}
        </div>,
      )}

      {/* Autoexplicación restringida: intentar nombrar el propio error antes de
          leer la explicación es lo que hace que la explicación se lea de verdad.
          Va antes de la Capa 2 y se responde una sola vez. */}
      {hayAutoexplicacion && (
        <div className="transicion-paso space-y-3 rounded-tarjeta border border-border bg-surface px-4 py-3">
          <p className="text-sm font-medium text-ink">¿Cuál de estas describe lo que pasó?</p>
          <div className="space-y-2">
            {opcionesAutoexplicacion!.map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => responderAutoexplicacion(opcion)}
                className="flex w-full cursor-pointer items-start gap-3 rounded-tarjeta border border-border bg-surface px-4 py-3 text-left text-sm leading-relaxed text-ink hover:border-border-fuerte hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
              >
                {opcion}
              </button>
            ))}
          </div>
          {/* Saltable con un toque, para que no se vuelva un peaje.

              `--linea-nav` y no `--linea`: acá el color de la línea es texto
              sobre superficie clara, que es justo el rol donde la 02 (#FFB600)
              da 1,76:1 y cae a tinta. El hover oscurece a `text-primary` en vez
              de ir a un tono más fuerte del mismo color —esa escala no existe
              en la paleta de línea, y en la 02 `--linea-nav` ya *es*
              `--text-primary`, así que un hover al mismo valor no diría nada. */}
          <button
            type="button"
            onClick={() => responderAutoexplicacion(null)}
            className="inline-flex text-sm font-medium text-[var(--linea-nav)] underline underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
          >
            Prefiero ver la explicación
          </button>
        </div>
      )}

      {/* La Capa 2 se pide, no se impone: leerla es una decisión, y una
          explicación que aparece sola se salta con la misma facilidad con la
          que aparece. Solo en el caso incorrecto — al acertar, el mecanismo del
          error no viene al caso. */}
      {!esCorrecta && capa2 && !hayAutoexplicacion && !porQueAbierto && (
        <Boton variante="secundario" onClick={abrirPorQue}>
          ¿Por qué?
        </Boton>
      )}
      {!esCorrecta && capa2 && porQueAbierto && (
        rotuloError ? (
          /* El banner en tinta: la única superficie oscura del sistema, y la
             excepción se gasta acá porque un error catalogado no es un aviso
             más — es una pieza que el estudiante va a volver a ver. `--linea`
             y sus derivados ya cuelgan del contenedor de la lección o del
             cierre, así que el rótulo toma el color del eje sin recibir props.

             `detalle` no se pasa: el desarrollo numérico no existe como campo
             de contenido (docs/deuda-banner-error-desarrollo.md). */
          <TarjetaError
            className="transicion-paso"
            clave={rotuloError}
            diagnostico={capa2}
            detalle={capa3}
          />
        ) : (
          /* Sin id de catálogo no hay rótulo que poner en las versalitas, y un
             banner con la fila de arriba vacía se lee como un error de render.
             Cae al panel claro, que no la necesita. Hoy no ocurre —quien
             resuelve `capa2` es el mismo `errorCatalogado` que da el rótulo—,
             pero es una prop y quien llame mañana puede olvidarla. */
          <div className="transicion-paso space-y-2 rounded-tarjeta border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-tenue">
              Qué pasó por dentro
            </p>
            <p className="text-sm leading-relaxed text-ink">{capa2}</p>
            {capa3 && <p className="text-sm leading-relaxed text-ink-suave">{capa3}</p>}
          </div>
        )
      )}

      {extra}
    </div>
  );
}
