import { CuadriculaFondo } from "./CuadriculaFondo";

/* l2 (pendiente e intercepto): recta ascendente con el triángulo Δx/Δy en
   trazo discontinuo — el mismo lenguaje visual que el gráfico interactivo
   de la lección (PlanoCartesiano). Recta por (90,109) y (170,66). */
export function IlustracionPendiente() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* ejes */}
      <path
        d="M 50 134 H 214 M 50 134 V 26"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 208 130 L 216 134 L 208 138 M 46 32 L 50 24 L 54 32"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* triángulo Δx/Δy: relleno suave + catetos discontinuos */}
      <polygon points="90,109 170,109 170,66" fill="var(--color-accent-suave)" opacity="0.7" />
      <path
        d="M 90 109 H 170 V 66"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
      />
      {/* la recta: pendiente positiva, corta al eje y sobre el origen */}
      <line
        x1="60"
        y1="125"
        x2="205"
        y2="47"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* vértices del triángulo sobre la recta */}
      <circle cx="90" cy="109" r="3.5" fill="var(--color-accent)" />
      <circle cx="170" cy="66" r="3.5" fill="var(--color-accent)" />
      <text
        x="130"
        y="124"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="var(--color-ink-suave)"
      >
        Δx
      </text>
      <text
        x="181"
        y="91"
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="var(--color-ink-suave)"
      >
        Δy
      </text>
    </svg>
  );
}
