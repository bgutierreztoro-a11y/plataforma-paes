import { posicionEnRecta, extremosDeLaRecta } from "@/lib/geometriaCamino";

/**
 * El camino como fondo: la misma recta y los mismos puntos de /camino, sin
 * enlaces, sin estados y sin nada que tocar.
 *
 * Existe para que la portada diga de inmediato qué es este producto. Un texto
 * que promete "lecciones interactivas" hay que leerlo y creerlo; el mapa del
 * curso dibujado detrás se entiende antes de leer nada.
 *
 * **Es el camino, no un dibujo parecido.** Las coordenadas salen de
 * `posicionEnRecta`, el mismo módulo que usa /camino. Si calculara las suyas,
 * las dos pantallas se desincronizarían al primer número que alguien mueva.
 *
 * Componente de servidor: no lee progreso ni necesita hidratarse. Los estados
 * de nodo no aparecen acá a propósito — el fondo insinúa la forma del curso, no
 * informa avance. Para eso está el botón que va encima.
 */
export function CaminoFantasma({ nodos }: { nodos: number }) {
  /* Un piso de nodos para que la recta se lea como recta. Hoy solo dos temas
     tienen contenido, y dos puntos sobre una diagonal parecen un error de
     dibujo más que un camino. El fondo no promete que esas unidades existan:
     no son clickeables, no llevan etiqueta y el temario real se cuenta con
     números en /camino. */
  const n = Math.max(nodos, 8);
  const { desde, hasta } = extremosDeLaRecta(n);

  /* La recta se abre en el centro y solo se ve hacia los bordes. Sin esto
     cruzaba justo por detrás del título y del botón: en un viewport angosto y
     alto, preserveAspectRatio="none" endereza la diagonal hasta dejarla casi
     vertical, atravesando el texto. MASTER.md §5 pide contraste AA en todo
     texto, y una textura por debajo lo baja aunque el color no cambie. */
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
      {/* Los ejes, igual que en /camino. */}
      <path
        d="M8 6 V92 H96"
        stroke="var(--color-border-fuerte)"
        strokeWidth="1"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={desde.x}
        y1={desde.y}
        x2={hasta.x}
        y2={hasta.y}
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {Array.from({ length: n }, (_, i) => {
        const { x, y } = posicionEnRecta(i, n);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            /* preserveAspectRatio="none" deforma el círculo junto con el
               lienzo. A esta opacidad y con el desenfoque encima no se nota, y
               la alternativa —un segundo sistema de coordenadas solo para los
               puntos— no compra nada. */
            r="1.6"
            fill="var(--color-accent)"
          />
        );
      })}
    </svg>
  );
}
