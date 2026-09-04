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
 *
 * **Tratamiento revelado, alineado con la 3H (fase 3J).** La correcta y la
 * elegida-revelada toman el mismo par que ya escribía a mano
 * `bloques/BloquePregunta.tsx:143-163`, que ese archivo declaraba como deuda
 * ("estas clases son casi las de components/ui/alternativa.ts … unificarlos va
 * en su propia tanda"). Ésta es esa tanda, del lado de `ItemPAES`.
 */

/* `border` sin color: lo pone cada estado. El outline de foco cuelga de
   `has-[:focus-visible]` porque el input real está dentro de la etiqueta —
   quien recibe el foco es él, pero lo que hay que ver rodeado es la fila.

   El foco va en `outline-strong` —tinta— y no en el color de la línea: el
   anillo tiene que leerse igual en las cuatro, y la 02 (#FFB600) sobre papel
   no llega. Misma decisión que en DetalleTema.tsx y ui/linea/Boton.tsx.

   **El ancho del borde no vive acá.** `border` (1px) y `border-[1.5px]` son la
   misma propiedad, y con las dos puestas el ganador lo decide el orden en que
   Tailwind las emite en la hoja, no el orden en el atributo. Así que cada estado
   trae su ancho junto con su color, igual que en BloquePregunta.tsx:139-147.

   Ojo al verificarlo: a devicePixelRatio 1 Chrome redondea cualquier borde de
   1,5px a 1px, y `getComputedStyle` devuelve ese valor usado —también con
   `style.borderWidth = "1.5px"` inline, comprobado—. La diferencia se ve en
   pantallas 2x, no midiendo con el inspector. */
export const ALTERNATIVA_BASE =
  "flex min-h-11 items-center gap-3 rounded-tarjeta bg-surface px-4 py-3 motion-safe:transition-[background-color,border-color,box-shadow] motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-strong";

/**
 * Sin responder todavía.
 *
 * La elegida se marca con `ring-inset` y no subiendo el borde a 2px: un borde
 * más grueso reflowea la fila un píxel al seleccionar, y esa sacudida en una
 * lista de cuatro se nota. El anillo hacia adentro dibuja el mismo grosor sin
 * mover nada.
 *
 * El color de "elegida" es el del eje: `--linea` en el borde y el anillo —ahí
 * el color es forma— y `--linea-tinte` de fondo, que es el pálido calibrado
 * sobre papel. Fuera de un eje los dos caen a su default de `:root` y la fila
 * elegida queda en tinta sobre superficie de tarjeta.
 */
export const ALTERNATIVA_REPOSO =
  "border border-border has-[:checked]:border-[var(--linea)] has-[:checked]:bg-[var(--linea-tinte)] has-[:checked]:ring-1 has-[:checked]:ring-inset has-[:checked]:ring-[var(--linea)]";

/**
 * Lo que responde al cursor. Va aparte de `ALTERNATIVA_REPOSO` porque hay un
 * caso donde no corresponde: el diagnóstico deshabilita el grupo mientras pasa
 * a la pregunta siguiente, y una fila que se ilumina al pasar por encima
 * mientras no se puede tocar promete algo que no va a cumplir.
 *
 * El hover es `bg-sunken` y no `--linea-tinte`: pasar el cursor no es
 * identidad de eje, y fuera de un eje el tinte cae a la superficie de tarjeta
 * —blanco sobre el blanco de la fila— y el hover se perdería entero en
 * /diagnostico y /cierre. `sunken` es neutro y funciona en las cinco rutas.
 */
export const ALTERNATIVA_INTERACTIVA =
  "cursor-pointer hover:border-border-fuerte hover:bg-sunken hover:shadow-nivel-1";

/**
 * Correcta, ya revelada. Sí se marca: acertar es información, no reproche.
 *
 * Se queda en el verde de `success` y no toma el color del eje: en las líneas 01
 * y 02 eso pintaría de rojo o de amarillo una respuesta correcta, y eso no
 * significa "correcto" en ninguna convención. Es la decisión de la 3H.
 */
export const ALTERNATIVA_CORRECTA =
  "cursor-default border-[1.5px] border-success bg-success-suave";

/**
 * Elegida y revelada, cuando no se está marcando como correcta.
 *
 * **Va a tinta —borde `strong` sobre superficie hundida—, no al color del eje.**
 * Es el `.opt.no` de la maqueta
 * (`docs/referencia/B-linea-interfaz-completa.html:43-44`) y lo mismo que ya
 * pinta `bloques/BloquePregunta.tsx`. Antes era
 * `border-[var(--linea)] bg-[var(--linea-tinte)]`, o sea **idéntica a estar
 * simplemente elegida**: el estado revelado no se distinguía del previo.
 *
 * Sigue sin ser roja ni ámbar, y eso no cambió: un color de "mal" acá contesta
 * "¿la tuve bien?" desde el costado, antes de que el estudiante lea la Capa 1
 * del feedback, que es donde está lo que enseña. El veredicto lo da el
 * feedback, no el borde. Por eso también sirve para /diagnostico, donde no hay
 * veredicto que dar: ahí marca "esto elegiste" y nada más.
 */
export const ALTERNATIVA_ELEGIDA_REVELADA =
  "cursor-default border-[1.5px] border-strong bg-sunken";

/** Ni elegida ni correcta: se apaga para que las dos que importan se lean. */
export const ALTERNATIVA_DESCARTADA = "cursor-default border border-border opacity-60";

/* ── El disco de la letra ──────────────────────────────────────────────────
 *
 * Los tres estados del círculo que lleva la A–D, en los mismos tonos que la
 * fila que lo contiene. Vive acá y no en `ItemPAES` por el mismo motivo que las
 * clases de la fila: es la pieza que la 3H ya había resuelto en
 * `BloquePregunta.tsx:155-163` y que estaba por duplicarse.
 *
 * `CHIP_BASE` es solo geometría; el color lo pone el estado.
 */
export const CHIP_BASE =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm";

/**
 * Sin revelar: neutro, y relleno con el color del eje cuando está marcado.
 *
 * El fondo va en `--linea-fondo` y no en `--linea` —en la 03 el color de línea
 * da 4,48:1 con texto claro— y la letra en `--linea-contraste`, que en la 02
 * amarilla es tinta y no blanco. El borde sí va en `--linea`, que es donde el
 * color es forma. Ver components/ui/linea/colores.ts.
 *
 * **Los `peer-checked:` solo se emiten mientras no hay revelación.** Como
 * variante tienen más especificidad que las clases base, así que si quedaran
 * puestos después de revelar se comerían el estado revelado y el disco seguiría
 * en `--linea-fondo` sobre una fila ya en verde o en tinta. Es lo que advierte
 * `BloquePregunta.tsx:126-129`, y es responsabilidad de quien elige el estado.
 */
export const CHIP_REPOSO =
  "border border-border-fuerte text-ink-suave peer-checked:border-[var(--linea)] peer-checked:bg-[var(--linea-fondo)] peer-checked:text-[var(--linea-contraste)]";

/**
 * Correcta, revelada. En verde y no en el color del eje: un disco rojo dentro de
 * una fila verde es justamente la contradicción que la decisión de la 3H evita.
 * `text-inverse` sobre #0E7C57 da 4,85:1.
 */
export const CHIP_CORRECTA = "border border-success bg-success text-inverse";

/** Elegida y revelada sin marcar como correcta: el negativo en tinta del `.opt.no`. */
export const CHIP_ELEGIDA_REVELADA = "border border-strong bg-strong text-inverse";
