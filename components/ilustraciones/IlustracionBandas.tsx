import { CuadriculaFondo } from "./CuadriculaFondo";

interface Banda {
  operacion: string;
  queSeVe?: string;
  puntos: number[];
  orden?: string;
}

interface Props {
  bandas: Banda[];
}

/* Rectas numéricas apiladas: una por operación, todas en la misma escala —
   sin escala común no se distingue deslizar de estirar. El primer punto va
   siempre en acento y el segundo en tinta, así que cuando la multiplicación
   por un negativo los cruza, el intercambio se ve sin tener que leerlo. */
export function IlustracionBandas({ bandas }: Props) {
  const valores = bandas.flatMap((b) => b.puntos);
  const min = Math.min(0, ...valores);
  const max = Math.max(0, ...valores);
  const margenEscala = (max - min) * 0.08;
  const desde = min - margenEscala;
  const hasta = max + margenEscala;
  const rango = Math.max(hasta - desde, 1);

  const xIni = 12;
  const xFin = 228;
  const x = (v: number) => xIni + ((v - desde) / rango) * (xFin - xIni);

  const altoBanda = 160 / bandas.length;

  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {bandas.map((banda, i) => {
        const yBase = i * altoBanda;
        const yRecta = yBase + altoBanda * 0.62;
        // El espejo solo se dibuja donde la recta efectivamente se da vuelta
        const seInvierte = banda.puntos.length === 2 && banda.puntos[0] > banda.puntos[1];
        return (
          <g key={banda.operacion}>
            <text
              x={xIni}
              y={yBase + altoBanda * 0.26}
              fontFamily="var(--font-sans)"
              fontSize="8"
              fill="var(--color-ink-tenue)"
            >
              {banda.operacion}
            </text>
            {/* eje de simetría en el 0, para la banda que se da vuelta */}
            {seInvierte && (
              <line
                x1={x(0)}
                y1={yBase + altoBanda * 0.3}
                x2={x(0)}
                y2={yBase + altoBanda * 0.95}
                stroke="var(--color-accent-fuerte)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}
            <line
              x1={xIni}
              y1={yRecta}
              x2={xFin}
              y2={yRecta}
              stroke="var(--color-ink-suave)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* marca del cero: la referencia que hace legible el estiramiento */}
            <line
              x1={x(0)}
              y1={yRecta - 3}
              x2={x(0)}
              y2={yRecta + 3}
              stroke="var(--color-ink-tenue)"
              strokeWidth="1.2"
            />
            {banda.puntos.map((valor, j) => (
              <g key={j}>
                <circle
                  cx={x(valor)}
                  cy={yRecta}
                  r="3.2"
                  fill={j === 0 ? "var(--color-accent)" : "var(--color-ink)"}
                />
                <text
                  x={x(valor)}
                  y={yRecta + 12}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="8"
                  fill={j === 0 ? "var(--color-accent-fuerte)" : "var(--color-ink-suave)"}
                >
                  {valor}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
