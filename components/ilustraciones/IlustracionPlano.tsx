import { CuadriculaFondo } from "./CuadriculaFondo";

/* l0-demo: plano cartesiano mínimo con tres puntos alineados sobre una
   recta implícita — el punto de partida, sin dibujar todavía la recta. */
export function IlustracionPlano() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* ejes con flechas */}
      <path
        d="M 60 130 H 214 M 60 130 V 26"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 208 126 L 216 130 L 208 134 M 56 32 L 60 24 L 64 32"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* tres puntos alineados: pendiente constante, la recta aún no se dibuja */}
      {[
        [95, 108],
        [135, 84],
        [175, 60],
      ].map(([cx, cy]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r="9" fill="var(--color-accent-suave)" />
          <circle cx={cx} cy={cy} r="4" fill="var(--color-accent)" />
        </g>
      ))}
    </svg>
  );
}
