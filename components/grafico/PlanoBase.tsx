import type { ReactNode } from "react";

import { DOMINIO, TAMANO_SVG, xAPixel, yAPixel } from "@/lib/planoCartesiano";

/**
 * El plano vacío: el `<svg>`, la rejilla de enteros, los dos ejes marcados y los
 * rótulos cada 5 unidades. Nada más — lo que se dibuja encima lo pone quien lo
 * usa, como `children`.
 *
 * Salió de `PlanoCartesiano.tsx` cuando apareció el segundo objeto que necesita
 * el mismo plano (la parábola). No es una abstracción preventiva: son dos
 * consumidores reales, y duplicar la rejilla dejaría dos copias de la misma
 * decisión de escala que hay que mantener sincronizadas a mano.
 */

const ENTEROS = Array.from(
  { length: DOMINIO.max - DOMINIO.min + 1 },
  (_, i) => DOMINIO.min + i,
);
const ROTULOS = ENTEROS.filter((n) => n % 5 === 0);

interface PlanoBaseProps {
  ariaLabel: string;
  children: ReactNode;
}

export function PlanoBase({ ariaLabel, children }: PlanoBaseProps) {
  return (
    <svg
      viewBox={`0 0 ${TAMANO_SVG} ${TAMANO_SVG}`}
      role="img"
      aria-label={ariaLabel}
      className="aspect-square h-auto w-full max-w-md rounded-tarjeta border border-border bg-surface"
    >
      {ENTEROS.map((n) => (
        <line
          key={`v${n}`}
          x1={xAPixel(n)}
          y1={yAPixel(DOMINIO.min)}
          x2={xAPixel(n)}
          y2={yAPixel(DOMINIO.max)}
          stroke={n === 0 ? "var(--color-ink-suave)" : "var(--color-grid-fina)"}
          strokeWidth={n === 0 ? 1.5 : 1}
        />
      ))}
      {ENTEROS.map((n) => (
        <line
          key={`h${n}`}
          x1={xAPixel(DOMINIO.min)}
          y1={yAPixel(n)}
          x2={xAPixel(DOMINIO.max)}
          y2={yAPixel(n)}
          stroke={n === 0 ? "var(--color-ink-suave)" : "var(--color-grid-fina)"}
          strokeWidth={n === 0 ? 1.5 : 1}
        />
      ))}
      {ROTULOS.filter((n) => n !== 0).map((n) => (
        <text
          key={`rx${n}`}
          x={xAPixel(n)}
          y={yAPixel(0) + 12}
          fontSize={9}
          textAnchor="middle"
          className="fill-ink-suave num"
        >
          {n}
        </text>
      ))}
      {ROTULOS.filter((n) => n !== 0).map((n) => (
        <text
          key={`ry${n}`}
          x={xAPixel(0) - 8}
          y={yAPixel(n) + 3}
          fontSize={9}
          textAnchor="end"
          className="fill-ink-suave num"
        >
          {n}
        </text>
      ))}
      {children}
    </svg>
  );
}
