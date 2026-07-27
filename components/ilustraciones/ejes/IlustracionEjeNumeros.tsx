import { CuadriculaFondo } from "../CuadriculaFondo";

/* Eje Números: una recta numérica con el cero marcado y saltos a ambos lados.
   Es la figura que comparten enteros, racionales, porcentaje y potencias — lo
   que tienen en común es que todos viven sobre esta recta. */
export function IlustracionEjeNumeros() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      <path
        d="M 24 80 H 216"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* puntas en los dos sentidos: la recta no empieza ni termina acá */}
      <path
        d="M 30 74 L 22 80 L 30 86 M 210 74 L 218 80 L 210 86"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {[-2, -1, 0, 1, 2].map((valor) => {
        const x = 120 + valor * 40;
        const esCero = valor === 0;
        return (
          <g key={valor}>
            <path
              d={`M ${x} ${esCero ? 66 : 72} V ${esCero ? 94 : 88}`}
              stroke={esCero ? "var(--color-accent)" : "var(--color-ink-suave)"}
              strokeWidth={esCero ? 2 : 1.5}
              strokeLinecap="round"
            />
            <text
              x={x}
              y={112}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="12"
              fill={esCero ? "var(--color-accent-fuerte)" : "var(--color-ink-suave)"}
            >
              {valor}
            </text>
          </g>
        );
      })}
      <circle cx="160" cy="80" r="4.5" fill="var(--color-accent)" />
    </svg>
  );
}
