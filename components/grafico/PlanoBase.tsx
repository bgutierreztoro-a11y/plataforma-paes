import type { ReactNode } from "react";

import {
  DOMINIO,
  RANGO_FIJO,
  TAMANO_SVG,
  escalaPara,
  pasoDeRotulos,
  type RangoPlano,
} from "@/lib/planoCartesiano";

/**
 * El plano vacío: el `<svg>`, la rejilla de enteros, los dos ejes marcados y los
 * rótulos numéricos. Nada más — lo que se dibuja encima lo pone quien lo
 * usa, como `children`.
 *
 * Salió de `PlanoCartesiano.tsx` cuando apareció el segundo objeto que necesita
 * el mismo plano (la parábola). No es una abstracción preventiva: son dos
 * consumidores reales, y duplicar la rejilla dejaría dos copias de la misma
 * decisión de escala que hay que mantener sincronizadas a mano.
 *
 * `rango` es opcional y llegó con el tercer consumidor, las transformaciones
 * isométricas: esas escenas se encuadran a sus propios puntos. Sin `rango` el
 * plano es el fijo de siempre, [−10, 10] con rótulos cada 5, píxel por píxel
 * igual que antes; la recta y la parábola no lo declaran y siguen usando
 * `xAPixel`/`yAPixel` de `lib/planoCartesiano` para sus propios trazos.
 */

const ENTEROS_FIJOS = Array.from(
  { length: DOMINIO.max - DOMINIO.min + 1 },
  (_, i) => DOMINIO.min + i,
);

interface PlanoBaseProps {
  ariaLabel: string;
  rango?: RangoPlano;
  children: ReactNode;
}

export function PlanoBase({ ariaLabel, rango, children }: PlanoBaseProps) {
  const r = rango ?? RANGO_FIJO;
  const { xAPixel, yAPixel } = escalaPara(r);
  const paso = rango ? pasoDeRotulos(r) : 5;
  const xs = rango ? Array.from({ length: r.xMax - r.xMin + 1 }, (_, i) => r.xMin + i) : ENTEROS_FIJOS;
  const ys = rango ? Array.from({ length: r.yMax - r.yMin + 1 }, (_, i) => r.yMin + i) : ENTEROS_FIJOS;
  const rotulosX = xs.filter((n) => n !== 0 && n % paso === 0);
  const rotulosY = ys.filter((n) => n !== 0 && n % paso === 0);
  /* Cuando el eje queda fuera del rango (no pasa con `rangoEscena`, que siempre
     incluye el origen), los rótulos se pegan al borde en vez de desaparecer. */
  const yEjeX = Math.min(Math.max(0, r.yMin), r.yMax);
  const xEjeY = Math.min(Math.max(0, r.xMin), r.xMax);

  return (
    <svg
      viewBox={`0 0 ${TAMANO_SVG} ${TAMANO_SVG}`}
      role="img"
      aria-label={ariaLabel}
      className="aspect-square h-auto w-full max-w-md rounded-tarjeta border border-border bg-surface"
    >
      {xs.map((n) => (
        <line
          key={`v${n}`}
          x1={xAPixel(n)}
          y1={yAPixel(r.yMin)}
          x2={xAPixel(n)}
          y2={yAPixel(r.yMax)}
          stroke={n === 0 ? "var(--color-ink-suave)" : "var(--color-grid-fina)"}
          strokeWidth={n === 0 ? 1.5 : 1}
        />
      ))}
      {ys.map((n) => (
        <line
          key={`h${n}`}
          x1={xAPixel(r.xMin)}
          y1={yAPixel(n)}
          x2={xAPixel(r.xMax)}
          y2={yAPixel(n)}
          stroke={n === 0 ? "var(--color-ink-suave)" : "var(--color-grid-fina)"}
          strokeWidth={n === 0 ? 1.5 : 1}
        />
      ))}
      {rotulosX.map((n) => (
        <text
          key={`rx${n}`}
          x={xAPixel(n)}
          y={yAPixel(yEjeX) + 12}
          fontSize={9}
          textAnchor="middle"
          className="fill-ink-suave num"
        >
          {n}
        </text>
      ))}
      {rotulosY.map((n) => (
        <text
          key={`ry${n}`}
          x={xAPixel(xEjeY) - 8}
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
