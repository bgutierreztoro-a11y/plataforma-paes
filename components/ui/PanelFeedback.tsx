import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";

/**
 * El recuadro que aparece después de comprobar una respuesta.
 *
 * Existe porque hasta la Fase 5 cada bloque lo resolvía por su cuenta: seis
 * componentes con su propio `<div role="status">`, sus propias clases y su
 * propia decisión de qué ícono poner. Eran seis lugares donde el tratamiento
 * podía divergir, y ya divergían.
 *
 * ## Los tres tonos, y por qué no hay un cuarto
 *
 * - `acierto` — verde. Es información, no elogio: dice qué pasó, no qué tan
 *   bueno es el estudiante.
 * - `atencion` — ámbar. **Respuesta incorrecta.** Terminar flojo es una
 *   invitación a volver, no una falla (MASTER.md §3.4).
 * - `neutro` — sin color de estado. El caso incorrecto de `FeedbackEnCapas`:
 *   ahí el veredicto visual no puede llegar antes que el texto que explica qué
 *   pasó, porque con la pregunta "¿la tuve bien?" ya resuelta se va el motivo
 *   para leer el resto. Es una excepción deliberada a la unificación, no un
 *   olvido.
 *
 * **No hay tono de error.** El rojo (`--color-error`) queda reservado a fallo
 * de sistema —hoy solo `app/error.tsx`— y no entra acá ni como opción: una
 * respuesta incorrecta no es una falla técnica, y el día que alguien quiera
 * pintar una de rojo va a tener que cambiar este archivo a propósito.
 *
 * ## Qué va acá adentro (regla para los casos futuros)
 *
 * Este panel es para lo que se **lee**: el veredicto y su explicación. Lo que
 * se **responde** —la autoexplicación restringida, cualquier control que pida
 * una decisión nueva— NO va acá y NO va en la zona anclada: vive en el flujo
 * normal, donde tiene el ancho y el alto de una pregunta. Ver la nota de
 * `ZonaAnclada.tsx`, que es donde esa regla decide el layout.
 */
export type TonoFeedback = "acierto" | "atencion" | "neutro";

const CLASES_TONO: Record<TonoFeedback, string> = {
  acierto: "bg-success-suave",
  atencion: "bg-attention-suave",
  neutro: "border border-border bg-surface",
};

export function PanelFeedback({
  tono,
  children,
  className = "",
}: {
  tono: TonoFeedback;
  children: React.ReactNode;
  className?: string;
}) {
  /* El ícono acompaña al color, nunca lo reemplaza ni va solo: el estado se
     distingue por forma **y** color (MASTER.md §2.1). El neutro no lleva
     ninguno de los dos, que es justamente su motivo. */
  const icono =
    tono === "acierto" ? <IconoCorrecto /> : tono === "atencion" ? <IconoIncorrecto /> : null;

  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm leading-relaxed ${CLASES_TONO[tono]} ${className}`}
    >
      {icono}
      <span>{children}</span>
    </div>
  );
}
