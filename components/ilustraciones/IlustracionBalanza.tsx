import { CuadriculaFondo } from "./CuadriculaFondo";

/* l3 (ecuaciones lineales): balanza de platillos en equilibrio perfecto —
   un platillo esconde la incógnita x, el otro sostiene pesas conocidas.
   Brazo horizontal = igualdad. */
export function IlustracionBalanza() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* base y fulcro */}
      <path
        d="M 96 140 H 144"
        stroke="var(--color-ink-suave)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <polygon
        points="120,102 111,140 129,140"
        fill="var(--color-accent-suave)"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* brazo en equilibrio (horizontal) con apoyo central */}
      <line
        x1="48"
        y1="100"
        x2="192"
        y2="100"
        stroke="var(--color-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="120" cy="100" r="4" fill="var(--color-accent)" />
      {/* platillo izquierdo: cuerdas + plato */}
      <path
        d="M 55 100 L 38 124 M 55 100 L 72 124"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 34 125 Q 55 133 76 125"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* caja con la incógnita */}
      <rect
        x="45"
        y="106"
        width="20"
        height="18"
        rx="3"
        fill="var(--color-accent-suave)"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      <text
        x="55"
        y="119"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="12"
        fill="var(--color-accent-fuerte)"
      >
        x
      </text>
      {/* platillo derecho: cuerdas + plato */}
      <path
        d="M 185 100 L 168 124 M 185 100 L 202 124"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 164 125 Q 185 133 206 125"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* pesas conocidas */}
      <rect
        x="169"
        y="110"
        width="15"
        height="14"
        rx="2"
        fill="var(--color-surface)"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
      />
      <text
        x="176.5"
        y="120.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--color-ink-suave)"
      >
        3
      </text>
      <rect
        x="186"
        y="110"
        width="15"
        height="14"
        rx="2"
        fill="var(--color-surface)"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
      />
      <text
        x="193.5"
        y="120.5"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--color-ink-suave)"
      >
        5
      </text>
    </svg>
  );
}
