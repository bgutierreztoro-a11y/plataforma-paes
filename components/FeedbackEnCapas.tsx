"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto } from "@/components/ui/Icono";

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
 * - Capa 3, opcional: qué hacer la próxima vez que aparezca.
 *
 * **Al fallar no hay color de alarma ni ✗.** El veredicto visual no puede
 * llegar antes que la Capa 1: si el recuadro ya es rojo, la frase que explica
 * qué pasó llega tarde. El acierto sí se marca —es información, no reproche—
 * y además ya viene anclado a la alternativa elegida.
 *
 * Nada de esto comenta a la persona. El elogio personal ("¡crack!", "eres bueno
 * en esto") desplaza al contenido sustantivo y está prohibido en las tres capas.
 */
export function FeedbackEnCapas({
  esCorrecta,
  capa1,
  capa2,
  capa3,
  onVerPorQue,
  extra,
}: {
  esCorrecta: boolean;
  /** Una frase. Nunca vacía: quien llama es responsable de dar un texto. */
  capa1: string;
  /** Ausente cuando el módulo no tiene `catalogoErrores` (hoy, los cierres). */
  capa2?: string;
  capa3?: string;
  /** Se dispara al abrir la Capa 2, una sola vez. Para instrumentación. */
  onVerPorQue?: () => void;
  /** Contenido propio de quien llama (tiempo de resolución, botón de avance). */
  extra?: React.ReactNode;
}) {
  const [porQueAbierto, setPorQueAbierto] = useState(false);

  function abrirPorQue() {
    setPorQueAbierto(true);
    onVerPorQue?.();
  }

  return (
    <div className="transicion-paso space-y-4">
      <div
        role="status"
        className={`rounded-tarjeta px-4 py-3 text-sm leading-relaxed ${
          esCorrecta
            ? "flex items-start gap-2.5 bg-success-suave"
            : "border border-border bg-surface text-ink"
        }`}
      >
        {esCorrecta && <IconoCorrecto />}
        <span>{capa1}</span>
      </div>

      {/* La Capa 2 se pide, no se impone: leerla es una decisión, y una
          explicación que aparece sola se salta con la misma facilidad con la
          que aparece. Solo en el caso incorrecto — al acertar, el mecanismo del
          error no viene al caso. */}
      {!esCorrecta && capa2 && !porQueAbierto && (
        <Boton variante="secundario" onClick={abrirPorQue}>
          ¿Por qué?
        </Boton>
      )}
      {!esCorrecta && capa2 && porQueAbierto && (
        <div className="transicion-paso space-y-2 rounded-tarjeta border border-border bg-surface px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-tenue">
            Qué pasó por dentro
          </p>
          <p className="text-sm leading-relaxed text-ink">{capa2}</p>
          {capa3 && <p className="text-sm leading-relaxed text-ink-suave">{capa3}</p>}
        </div>
      )}

      {extra}
    </div>
  );
}
