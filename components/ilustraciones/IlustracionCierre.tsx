import { CuadriculaFondo } from "./CuadriculaFondo";

/* Pantalla final del cierre: la recta completa recorrida, con el punto de
   llegada destacado con círculos concéntricos. Celebración sobria. */
export function IlustracionCierre() {
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
      {/* trayecto recorrido: puntos intermedios sobre la recta */}
      <line
        x1="62"
        y1="126"
        x2="186"
        y2="52"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="90" cy="109.3" r="3" fill="var(--color-accent)" />
      <circle cx="130" cy="85.4" r="3" fill="var(--color-accent)" />
      {/* punto de llegada: círculos concéntricos */}
      <circle cx="186" cy="52" r="16" fill="none" stroke="var(--color-accent-suave)" strokeWidth="3" />
      <circle cx="186" cy="52" r="9" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
      <circle cx="186" cy="52" r="4" fill="var(--color-accent)" />
    </svg>
  );
}
