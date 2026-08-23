"use client";

import { useId } from "react";

import { PlanoBase } from "./PlanoBase";
import {
  DOMINIO,
  cerosParabola,
  formatoDecimalChileno,
  puntosParabola,
  verticeParabola,
  xAPixel,
  yAPixel,
} from "@/lib/planoCartesiano";

interface PlanoParabolaProps {
  a: number;
  b: number;
  c: number;
  /* Marcas opcionales. Vienen del contenido, no de un control del estudiante:
     un paso sobre "¿abre hacia arriba o hacia abajo?" no tiene por qué regalar
     el vértice, y uno sobre el vértice no tiene por qué mostrar los ceros. */
  mostrarVertice: boolean;
  mostrarCeros: boolean;
}

const dentroDelPlano = (v: number) => Math.abs(v) <= DOMINIO.max;

export function PlanoParabola({
  a,
  b,
  c,
  mostrarVertice,
  mostrarCeros,
}: PlanoParabolaProps) {
  /* Id propio por instancia: si un día un paso monta dos parábolas, dos
     clipPath con el mismo id harían que la segunda recortara con la primera.
     Se le quitan los caracteres decorativos que React le pone («r0», :r0:)
     porque el id viaja dentro de un `url(#...)` y no vale la pena depender de
     cómo cada navegador parsea un fragmento con dos puntos o con guillemets. */
  const idRecorte = `recorte-parabola-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const vertice = mostrarVertice ? verticeParabola(a, b, c) : null;
  const verticeVisible =
    vertice !== null && dentroDelPlano(vertice.x) && dentroDelPlano(vertice.y);
  const ceros = mostrarCeros ? cerosParabola(a, b, c).filter(dentroDelPlano) : [];

  /* El área de la rejilla, que es donde puede pintarse la curva. El `<svg>` ya
     recorta a su viewBox por sí solo, pero eso dejaría la curva invadiendo los
     28 px de margen y pasando por encima de los rótulos de los ejes. */
  const izquierda = xAPixel(DOMINIO.min);
  const arriba = yAPixel(DOMINIO.max);
  const lado = xAPixel(DOMINIO.max) - izquierda;

  return (
    <PlanoBase ariaLabel={`Plano cartesiano con la parábola y = ${a}x² + ${b}x + ${c}`}>
      <defs>
        <clipPath id={idRecorte}>
          <rect x={izquierda} y={arriba} width={lado} height={lado} />
        </clipPath>
      </defs>
      <polyline
        points={puntosParabola(a, b, c)}
        clipPath={`url(#${idRecorte})`}
        /* Mismo cian que la recta de PlanoCartesiano: es el objeto que los
           sliders mueven, y esa reserva de color es lo que lo distingue del
           azul de acción (MASTER.md §2.1 y §3.3). */
        stroke="var(--color-interactive-fuerte)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Vértice y ceros van en tinta neutra, no en el acento: son anotaciones
          encima del objeto, igual que el triángulo Δx/Δy de la recta. */}
      {verticeVisible && (
        <g>
          <circle
            cx={xAPixel(vertice.x)}
            cy={yAPixel(vertice.y)}
            r={5}
            fill="var(--color-surface)"
            stroke="var(--color-ink)"
            strokeWidth={2}
          />
          <text
            x={xAPixel(vertice.x)}
            /* El rótulo va del lado hacia el que NO abre la curva: con a > 0 el
               vértice es el punto más bajo y arriba pasa la parábola, así que
               el texto va abajo. Fijarlo siempre arriba lo dejaba tachado por
               el propio trazo. */
            y={yAPixel(vertice.y) + (a > 0 ? 20 : -12)}
            fontSize={10}
            textAnchor="middle"
            className="fill-ink num"
          >
            {/* Separador ";" y no ",": la coma ya es el separador decimal
                chileno, y "(-1,5, 2)" no se puede leer. */}
            {`(${formatoDecimalChileno(vertice.x)} ; ${formatoDecimalChileno(vertice.y)})`}
          </text>
        </g>
      )}
      {ceros.map((cero) => (
        <g key={`cero-${cero}`}>
          <circle
            cx={xAPixel(cero)}
            cy={yAPixel(0)}
            r={5}
            fill="var(--color-surface)"
            stroke="var(--color-ink)"
            strokeWidth={2}
          />
          <text
            x={xAPixel(cero)}
            y={yAPixel(0) + 22}
            fontSize={10}
            textAnchor="middle"
            className="fill-ink num"
          >
            {formatoDecimalChileno(cero)}
          </text>
        </g>
      ))}
    </PlanoBase>
  );
}
