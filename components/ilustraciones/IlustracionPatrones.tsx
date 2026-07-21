import { CuadriculaFondo } from "./CuadriculaFondo";

const VALORES = [4, 7, 10, 13, 16];
const X_INICIO = 40;
const PASO_X = 40;
const Y_RECTA = 110;

/* l1 (patrones de cambio): secuencia sobre una recta numérica con la
   diferencia constante +3 marcada con arcos-flecha entre términos. */
export function IlustracionPatrones() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* recta numérica */}
      <path
        d={`M 22 ${Y_RECTA} H 218`}
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M 212 ${Y_RECTA - 4} L 220 ${Y_RECTA} L 212 ${Y_RECTA + 4}`}
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {VALORES.map((valor, i) => {
        const x = X_INICIO + i * PASO_X;
        return (
          <g key={valor}>
            <circle cx={x} cy={Y_RECTA} r="4" fill="var(--color-accent)" />
            <text
              x={x}
              y={Y_RECTA + 24}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="12"
              fill="var(--color-ink)"
            >
              {valor}
            </text>
          </g>
        );
      })}
      {/* arcos +3 entre términos consecutivos */}
      {VALORES.slice(0, -1).map((_, i) => {
        const x1 = X_INICIO + i * PASO_X;
        const x2 = x1 + PASO_X;
        const xMedio = (x1 + x2) / 2;
        return (
          <g key={xMedio}>
            <path
              d={`M ${x1} ${Y_RECTA - 10} Q ${xMedio} ${Y_RECTA - 42} ${x2 - 3} ${Y_RECTA - 11}`}
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${x2 - 9} ${Y_RECTA - 12} L ${x2 - 3} ${Y_RECTA - 11} L ${x2 - 6} ${Y_RECTA - 18}`}
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <text
              x={xMedio}
              y={Y_RECTA - 40}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--color-accent-fuerte)"
            >
              +3
            </text>
          </g>
        );
      })}
    </svg>
  );
}
