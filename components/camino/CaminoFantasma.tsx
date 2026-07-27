import { desplazamientoDeNodo } from "@/lib/geometriaCamino";

/**
 * El camino como fondo: los mismos discos y el mismo trazo de /camino, sin
 * enlaces, sin estados y sin nada que tocar.
 *
 * Existe para que la portada diga de inmediato qué es este producto. Un texto
 * que promete "lecciones interactivas" hay que leerlo y creerlo; el mapa del
 * curso dibujado detrás se entiende antes de leer nada.
 *
 * **Es el camino, no un dibujo parecido.** El zigzag sale de
 * `desplazamientoDeNodo`, el mismo módulo que usa el camino real. Cuando el
 * recorrido dejó de subir (2026-07-27), este fondo bajó con él sin que hubiera
 * que acordarse: si calculara sus propias posiciones, hoy la portada estaría
 * anunciando un producto que ya no existe.
 *
 * Componente de servidor: no lee progreso ni necesita hidratarse. Los estados
 * de nodo no aparecen acá a propósito — el fondo insinúa la forma del curso, no
 * informa avance. Para eso está el botón que va encima.
 */
export function CaminoFantasma({ nodos }: { nodos: number }) {
  /* Un piso de nodos para que el recorrido se lea como recorrido. Hoy solo dos
     temas tienen contenido, y dos discos sueltos parecen un error de dibujo. El
     fondo no promete que esas unidades existan: no son clickeables, no llevan
     etiqueta y el temario real se cuenta con números en /camino. */
  const n = Math.max(nodos, 9);
  const paso = 100 / n;
  const y = (i: number) => paso / 2 + i * paso;

  /* La columna vive en el tercio izquierdo del lienzo y el zigzag es más ancho
     que en el camino real: acá no hay discos de 64px que lo escalen, así que
     con la amplitud original se leería como una línea recta. */
  const x = (i: number) => 14 + (desplazamientoDeNodo(i) - 50) * 0.5;

  const mascara =
    "radial-gradient(ellipse 62% 46% at 50% 50%, transparent 30%, black 100%)";

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40 blur-[2px]"
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
    >
      <polyline
        points={Array.from({ length: n }, (_, i) => `${x(i)},${y(i)}`).join(" ")}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(i)}
          /* preserveAspectRatio="none" deforma el círculo junto con el lienzo. A
             esta opacidad y con el desenfoque encima no se nota, y la
             alternativa —un segundo sistema de coordenadas solo para los
             discos— no compra nada. */
          r="1.6"
          fill="var(--color-accent)"
        />
      ))}
    </svg>
  );
}
