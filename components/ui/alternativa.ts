/**
 * El aspecto de una alternativa de opción múltiple, en un solo lugar.
 *
 * Estaba escrito dos veces —`components/ItemPAES.tsx` para los ítems formato
 * PAES y `components/ui/SelectorOpciones.tsx` para las preguntas dentro de una
 * lección— con treinta clases casi iguales y diferencias que no eran una
 * decisión, solo la deriva de haberlo tecleado dos veces. Son la misma pieza:
 * el estudiante no distingue en qué pantalla está respondiendo.
 *
 * Son constantes y no un componente a propósito. Las dos superficies difieren
 * en lo que va **dentro** de la etiqueta (ItemPAES pone la letra A–D en un
 * círculo; SelectorOpciones pone un radio nativo) y en cuándo revelan la
 * respuesta. Un componente que cubriera las dos necesitaría una prop por
 * diferencia; compartir las clases comparte exactamente lo que es común.
 */

/* `border` sin color: lo pone cada estado. El outline de foco cuelga de
   `has-[:focus-visible]` porque el input real está dentro de la etiqueta —
   quien recibe el foco es él, pero lo que hay que ver rodeado es la fila. */
export const ALTERNATIVA_BASE =
  "flex min-h-11 items-center gap-3 rounded-tarjeta border bg-surface px-4 py-3 motion-safe:transition-[background-color,border-color,box-shadow] motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent";

/**
 * Sin responder todavía.
 *
 * La elegida se marca con `ring-inset` y no subiendo el borde a 2px: un borde
 * más grueso reflowea la fila un píxel al seleccionar, y esa sacudida en una
 * lista de cuatro se nota. El anillo hacia adentro dibuja el mismo grosor sin
 * mover nada.
 */
export const ALTERNATIVA_REPOSO =
  "border-border has-[:checked]:border-accent has-[:checked]:bg-accent-suave has-[:checked]:ring-1 has-[:checked]:ring-inset has-[:checked]:ring-accent";

/**
 * Lo que responde al cursor. Va aparte de `ALTERNATIVA_REPOSO` porque hay un
 * caso donde no corresponde: el diagnóstico deshabilita el grupo mientras pasa
 * a la pregunta siguiente, y una fila que se ilumina al pasar por encima
 * mientras no se puede tocar promete algo que no va a cumplir.
 */
export const ALTERNATIVA_INTERACTIVA =
  "cursor-pointer hover:border-border-fuerte hover:bg-accent-suave/40 hover:shadow-nivel-1";

/** Correcta, ya revelada. Sí se marca: acertar es información, no reproche. */
export const ALTERNATIVA_CORRECTA = "cursor-default border-success bg-success-suave";

/**
 * Elegida y equivocada, ya revelada.
 *
 * **Queda marcada como elegida y nada más** — ni roja ni ámbar. No es un
 * descuido: es la decisión que ya estaba escrita en `ItemPAES.tsx` y que se
 * conserva tal cual. Un color de "mal" acá contesta "¿la tuve bien?" desde el
 * costado, antes de que el estudiante lea la Capa 1 del feedback, que es donde
 * está lo que enseña. El veredicto lo da el feedback, no el borde.
 */
export const ALTERNATIVA_ELEGIDA_REVELADA = "cursor-default border-accent bg-accent-suave";

/** Ni elegida ni correcta: se apaga para que las dos que importan se lean. */
export const ALTERNATIVA_DESCARTADA = "cursor-default opacity-60";
