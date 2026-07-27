import { CuadriculaFondo } from "../CuadriculaFondo";

/* Eje Álgebra y funciones: un plano con dos curvas, una recta y una parábola.
   Las dos familias que el eje recorre, dibujadas sin decir cuál es cuál — es
   un rótulo de sección, no una lección. */
export function IlustracionEjeAlgebra() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* ejes */}
      <path
        d="M 40 134 H 214 M 40 134 V 26"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 208 130 L 216 134 L 208 138 M 36 32 L 40 24 L 44 32"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* la recta */}
      <line
        x1="50"
        y1="120"
        x2="200"
        y2="48"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* la parábola, más tenue: acompaña, no compite */}
      <path
        d="M 60 44 Q 120 160 190 44"
        stroke="var(--color-border-fuerte)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="125" cy="83" r="4" fill="var(--color-accent)" />
    </svg>
  );
}
