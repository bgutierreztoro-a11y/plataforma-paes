interface IconoProps {
  className?: string;
}

/**
 * Los cuatro iconos de la barra inferior.
 *
 * Todos comparten viewBox de 16, trazo de 2px, extremos y uniones redondas y
 * `currentColor`: la fila tiene que leerse de un solo peso, y el color activo lo
 * hereda cada uno del ítem que lo contiene.
 *
 * No reemplazan a `components/navegacion/IconosNav.tsx`, que son otros tres, de
 * 24px y trazo 1.75, y siguen sirviendo a la barra actual hasta que las
 * pantallas migren.
 */
const BASE = "h-4 w-4 shrink-0";

const TRAZO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Red: el trazo de una línea que dobla, que es el dibujo de todo el producto. */
export function IconoRed({ className = "" }: IconoProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`${BASE} ${className}`}>
      <path d="M2.5 12.5H6L10 3.5h3.5" {...TRAZO} />
    </svg>
  );
}

/** Ensayo: la prueba corregida. */
export function IconoEnsayo({ className = "" }: IconoProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`${BASE} ${className}`}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" {...TRAZO} />
      <path d="M5.5 8.5 7.5 10.5 11 6" {...TRAZO} />
    </svg>
  );
}

/** Errores: la señal de atención, sin caja y sin alarma. */
export function IconoErrores({ className = "" }: IconoProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`${BASE} ${className}`}>
      <path d="M8 2.5v6.5" {...TRAZO} />
      <circle cx="8" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
}

/** Tú. */
export function IconoTu({ className = "" }: IconoProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`${BASE} ${className}`}>
      <circle cx="8" cy="5" r="2.5" {...TRAZO} />
      <path d="M3.5 13.5a4.5 4.5 0 0 1 9 0" {...TRAZO} />
    </svg>
  );
}
