import { CuadriculaFondo } from "../CuadriculaFondo";

/* Eje Geometría: un triángulo rectángulo con su marca de ángulo recto y su
   copia semejante más chica. Cubre lo que el eje recorre —figuras, semejanza,
   transformaciones— sin comprometerse con un tema en particular. */
export function IlustracionEjeGeometria() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* triángulo grande */}
      <polygon
        points="60,124 180,124 60,44"
        fill="var(--color-accent-suave)"
        opacity="0.7"
      />
      <polygon
        points="60,124 180,124 60,44"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* marca de ángulo recto en el vértice inferior izquierdo */}
      <path
        d="M 60 110 H 74 V 124"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* la copia semejante, en trazo discontinuo */}
      <polygon
        points="150,84 195,84 150,54"
        fill="none"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="44" r="3.5" fill="var(--color-accent)" />
      <circle cx="180" cy="124" r="3.5" fill="var(--color-accent)" />
    </svg>
  );
}
