/**
 * Geometría del camino, en un módulo puro.
 *
 * Vive fuera de `lib/camino.ts` a propósito: ese módulo es server-only porque
 * lee `content/` del disco, y estos números los necesitan tres piezas de
 * cliente —el camino de /camino, el de lecciones de /tema/[id] y el fondo de la
 * portada—. Si cada una calculara los suyos, la portada dibujaría algo
 * *parecido* al camino en vez de ser el camino, y se desincronizarían a la
 * primera vez que alguien mueva un número.
 *
 * **El camino baja (enmienda del 2026-07-27).** Antes los nodos iban sobre una
 * recta ascendente, de abajo-izquierda a arriba-derecha, porque el módulo
 * enseña funciones lineales. Se revirtió tras probarlo en un teléfono real: la
 * progresión peleaba con el orden de lectura y con el scroll, que baja. La
 * metáfora de la función vive en el contenido de las lecciones, no en la
 * dirección en que se recorre la pantalla. Ver MASTER.md §3.2.
 */

/**
 * Alto de cada fila del camino, en píxeles, igual en móvil y en escritorio.
 *
 * Es un número compartido y no una clase de Tailwind porque la tarjeta del nodo
 * activo se ancla en `indice * PASO_FILA`: si el alto viviera solo en el CSS,
 * la tarjeta se despegaría del nodo en cuanto alguien lo cambiara.
 *
 * 76px es lo que permite el objetivo de densidad —6 nodos visibles sin scroll
 * en una pantalla de 360×800— una vez descontados el encabezado fijo (61px), la
 * tarjeta al pie (~150px) y la barra de navegación (56px). Medido en el
 * navegador, no estimado: con 84px entraban 5.
 */
export const PASO_FILA = 76;

/**
 * Alto de la fila del cierre. Más que las demás porque su disco mide ~1,4× y
 * con el paso normal quedaba pegado al de arriba: el tramo de trazo que los une
 * medía cuatro píxeles y el recorrido se leía cortado justo en la meta.
 *
 * Es el único alto distinto que existe, y por eso el ancla de la tarjeta suma
 * alturas (`desplazamientoVertical`) en vez de multiplicar por el paso.
 */
export const PASO_FILA_META = 100;

/** Alto de la fila `i`, en píxeles. */
export function altoDeFila(esMeta: boolean): number {
  return esMeta ? PASO_FILA_META : PASO_FILA;
}

/**
 * Distancia desde el inicio de la columna hasta el borde inferior de la fila
 * `i`. Es donde se cuelga la tarjeta del nodo activo en escritorio.
 */
export function desplazamientoVertical(metas: readonly boolean[], i: number): number {
  let y = 0;
  for (let k = 0; k <= i; k++) y += altoDeFila(metas[k]);
  return y;
}

/**
 * Ancho de la canaleta donde viven los discos y el trazo, en píxeles.
 *
 * Fijo a propósito. Tiene que caber lo más ancho de los dos casos: un disco
 * normal de 60px desplazado por el zigzag (60 + 2×12,5 = 85) y el disco de meta
 * de 84px con su contorno doble (84 + 2×6 = 96). Si la canaleta creciera con el
 * contenido, el trazo se doblaría justo en la fila del cierre.
 */
export const ANCHO_CANALETA = 104;

/** Ancho máximo de la columna. El escritorio no necesita un layout propio;
 *  necesita no estirarse. */
export const ANCHO_COLUMNA = 560;

/** Amplitud del zigzag, en porcentaje del ancho de la canaleta a cada lado del
 *  centro. Leve a propósito: lo justo para que el recorrido no se lea como una
 *  lista plana, no tanto como para que el trazo parezca una escalera. */
const ZIGZAG = 12;

/**
 * Desplazamiento horizontal del disco `i`, en porcentaje del ancho de la
 * canaleta. 50 es el centro.
 *
 * Se expresa en porcentaje y no en píxeles porque el mismo número posiciona el
 * disco (con `left`) y las puntas del trazo (en un SVG con
 * `preserveAspectRatio="none"`). Un solo número para las dos cosas es lo que
 * garantiza que el trazo toque el centro del disco y no pase cerca.
 */
export function desplazamientoDeNodo(i: number, esMeta = false): number {
  /* La meta no zigzaguea: va centrada. Es el punto donde el recorrido termina y
     centrarlo se lee como llegada; además es el disco más ancho, y desplazarlo
     encima lo sacaría de la canaleta. */
  if (esMeta) return 50;
  return i % 2 === 0 ? 50 - ZIGZAG : 50 + ZIGZAG;
}

/**
 * Retraso de entrada del nodo `i`, en milisegundos.
 *
 * El escalonamiento sigue el recorrido desde el primer nodo, que ahora es el de
 * arriba: el orden del DOM y el orden visual coinciden, así que el índice sirve
 * directo.
 */
export function retrasoDeEntrada(i: number): number {
  return i * 60;
}
