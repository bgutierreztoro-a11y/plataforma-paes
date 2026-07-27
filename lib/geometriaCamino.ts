/**
 * Geometría de la recta del camino, en un módulo puro.
 *
 * Vive fuera de `lib/camino.ts` a propósito: ese módulo es server-only porque
 * lee `content/` del disco, y estas coordenadas las necesitan tres piezas de
 * cliente —el camino de /camino, el fondo de la portada y la celebración de
 * tema—. Si el fondo de la portada calculara sus propios puntos, sería un
 * dibujo *parecido* al camino en vez de ser el camino, y se desincronizaría a
 * la primera vez que alguien mueva un número.
 *
 * Sistema de coordenadas: porcentaje del lienzo, con el eje y hacia abajo (el
 * de SVG y el de CSS). Por eso el origen del *plano cartesiano* —el primer
 * tema— tiene la y más alta: `y: 86` es abajo.
 */

/** Margen desde el borde del lienzo hasta el primer y el último punto. Deja
 *  aire para el punto, su anillo y su sombra sin que ninguno se recorte. */
const X_ORIGEN = 12;
const Y_ORIGEN = 86;
const RECORRIDO = 72;

/**
 * Posición del punto `i` de `n` sobre la recta ascendente, en porcentaje.
 *
 * La recta va de abajo-izquierda a arriba-derecha: el índice 0 es el origen y
 * el último índice es la meta. No es decoración — el módulo enseña funciones
 * lineales y el avance se dibuja como la recta que el estudiante está
 * aprendiendo a leer.
 *
 * Con un solo punto se centra, en vez de dividir por cero.
 */
export function posicionEnRecta(i: number, n: number): { x: number; y: number } {
  if (n <= 1) return { x: 50, y: 50 };
  const avance = (i * RECORRIDO) / (n - 1);
  return { x: X_ORIGEN + avance, y: Y_ORIGEN - avance };
}

/** Los dos extremos del segmento que une todos los puntos. Se usa para trazar
 *  la recta una sola vez en vez de un tramo por par de nodos. */
export function extremosDeLaRecta(n: number) {
  return { desde: posicionEnRecta(0, n), hasta: posicionEnRecta(n - 1, n) };
}

/**
 * Retraso de entrada del nodo `i`, en milisegundos.
 *
 * El escalonamiento sigue el trazo **desde el origen**, así que depende del
 * índice en el camino y no del orden en que el DOM los pinta: en móvil la
 * lista se invierte visualmente con `flex-col-reverse` y el índice 0 sigue
 * siendo el primero en aparecer, abajo.
 */
export function retrasoDeEntrada(i: number): number {
  return i * 60;
}
