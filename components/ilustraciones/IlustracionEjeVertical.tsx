import { CuadriculaFondo } from "./CuadriculaFondo";

interface Punto {
  etiqueta: string;
  profundidad: number;
}

interface Props {
  puntos: Punto[];
  tramoDestacado?: { desde: number; hasta: number; longitud: number };
}

function pasoGraduacion(rango: number) {
  if (rango <= 10) return 2;
  if (rango <= 30) return 5;
  if (rango <= 60) return 10;
  return 20;
}

/* Eje vertical de profundidades bajo una superficie en 0. La escala sale del
   rango real de los puntos, así que sirve igual para −5 m que para −270 m. Un
   punto en 0 no dibuja su propia línea: la superficie ya es esa línea. */
export function IlustracionEjeVertical({ puntos, tramoDestacado }: Props) {
  const profundidades = puntos.map((p) => p.profundidad);
  const min = Math.min(0, ...profundidades);
  const max = Math.max(0, ...profundidades);
  const rango = Math.max(max - min, 1);

  const yTop = 28;
  const yBase = 140;
  const xEje = 56;
  const y = (p: number) => yTop + ((max - p) / rango) * (yBase - yTop);

  const paso = pasoGraduacion(rango);
  const marcas: number[] = [];
  for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) {
    marcas.push(v);
  }

  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* eje graduado */}
      <line
        x1={xEje}
        y1={yTop}
        x2={xEje}
        y2={yBase}
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {marcas.map((v) => (
        <g key={v}>
          <line
            x1={xEje - 4}
            y1={y(v)}
            x2={xEje}
            y2={y(v)}
            stroke="var(--color-ink-suave)"
            strokeWidth="1.5"
          />
          <text
            x={xEje - 8}
            y={y(v) + 3.5}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="var(--color-ink-tenue)"
          >
            {v}
          </text>
        </g>
      ))}
      {/* superficie del agua en 0 */}
      <line
        x1={xEje - 12}
        y1={y(0)}
        x2={228}
        y2={y(0)}
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* cada profundidad: línea punteada hasta el eje + etiqueta */}
      {puntos.map((punto) => {
        const yp = y(punto.profundidad);
        const enSuperficie = punto.profundidad === 0;
        return (
          <g key={punto.etiqueta}>
            {!enSuperficie && (
              <>
                <line
                  x1={xEje}
                  y1={yp}
                  x2={150}
                  y2={yp}
                  stroke="var(--color-ink-suave)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle cx={xEje} cy={yp} r="3.5" fill="var(--color-accent)" />
              </>
            )}
            <text
              x={enSuperficie ? xEje + 6 : 154}
              y={enSuperficie ? yp - 6 : yp + 3.5}
              fontFamily="var(--font-sans)"
              fontSize="9.5"
              fill="var(--color-ink-suave)"
            >
              {punto.etiqueta}
            </text>
          </g>
        );
      })}
      {/* tramo entre dos profundidades, con su longitud al lado */}
      {tramoDestacado && (
        <g>
          <path
            d={`M 214 ${y(tramoDestacado.desde)} V ${y(tramoDestacado.hasta)}`}
            stroke="var(--color-accent-fuerte)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d={`M 210 ${y(tramoDestacado.desde) + 5} L 214 ${y(tramoDestacado.desde)} L 218 ${y(tramoDestacado.desde) + 5} M 210 ${y(tramoDestacado.hasta) - 5} L 214 ${y(tramoDestacado.hasta)} L 218 ${y(tramoDestacado.hasta) - 5}`}
            fill="none"
            stroke="var(--color-accent-fuerte)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x={208}
            y={(y(tramoDestacado.desde) + y(tramoDestacado.hasta)) / 2 + 3.5}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-accent-fuerte)"
          >
            {tramoDestacado.longitud}
          </text>
        </g>
      )}
    </svg>
  );
}
