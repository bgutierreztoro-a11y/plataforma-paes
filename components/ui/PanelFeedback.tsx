import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";

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
 * ## La variante con rótulo (fase 3H)
 *
 * Con `rotulo`, el panel deja de ser una caja teñida y pasa a ser la `.card` de
 * la maqueta: tarjeta blanca, borde hairline, la palabra en versalitas arriba y
 * la explicación debajo (pantalla 06,
 * `docs/referencia/B-linea-interfaz-completa.html:280-283`). El tono sobrevive
 * en el color de esa palabra y en ningún otro lado.
 *
 * **El rótulo del acierto se queda en el verde de `success`, no en `--linea`.**
 * La maqueta lo pinta con el color del eje porque su pantalla de ejemplo es la
 * línea 03, que es verde. En las líneas 01 (rojo) y 02 (amarillo) ese mismo
 * gesto pintaría de rojo o de amarillo una respuesta correcta, que es
 * semánticamente falso. El color del eje identifica *dónde* estás; el veredicto
 * es otra cosa.
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

/**
 * El color del rótulo, cuando lo hay. Es el único lugar donde el tono se ve en la
 * variante con rótulo: la caja es la tarjeta blanca de la maqueta.
 *
 * Contraste sobre `--surface-card`: `success` #0E7C57 → 5,20:1, `atencion`
 * #B45309 → 5,02:1 y `secondary` #71747A → 4,69:1. Los tres pasan AA para el
 * rótulo de 10px. Hoy solo se usa `acierto`.
 */
const CLASES_ROTULO: Record<TonoFeedback, string> = {
  acierto: "text-success",
  atencion: "text-attention",
  neutro: "text-secondary",
};

export function PanelFeedback({
  tono,
  rotulo,
  children,
  className = "",
}: {
  tono: TonoFeedback;
  /**
   * Las versalitas de la maqueta ("Correcto",
   * `docs/referencia/B-linea-interfaz-completa.html:281`). Con rótulo, el panel
   * pasa a ser la `.card` blanca del sistema y el tono queda solo en el color de
   * esa palabra; sin rótulo, todo sigue exactamente como antes.
   *
   * Es una prop y no una lectura del tono porque `prediccion` y `abierta` usan
   * `tono="acierto"` para un acuse de recibo ("Predicción registrada"), y colgar
   * la palabra "Correcto" del tono la pondría también ahí, donde nadie evaluó
   * nada.
   */
  rotulo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (rotulo) {
    return (
      <div
        role="status"
        className={`${TARJETA_LINEA} px-[13px] py-3 text-sm leading-relaxed ${className}`}
      >
        {/* El rótulo hace el trabajo que hacía el ícono: el estado se distingue
            por forma **y** color (MASTER.md §2.1), y una palabra es más
            específica que un glifo. Por eso no van los dos. */}
        <p className={`text-etiqueta uppercase ${CLASES_ROTULO[tono]}`}>{rotulo}</p>
        <p className="mt-1.5">{children}</p>
      </div>
    );
  }

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
