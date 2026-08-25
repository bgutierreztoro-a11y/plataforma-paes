interface IconoNavProps {
  className?: string;
}

/** Mismo viewBox y stroke-width que los otros dos para que la fila se vea de un solo peso. */
export function IconoInicio({ className = "" }: IconoNavProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-6 w-6 shrink-0 ${className}`}
    >
      <path
        d="M4 10.5L12 4l8 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 20v-5a2 2 0 0 1 4 0v5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Tres checkpoints sobre un trazo recto en zigzag, no una curva suave: la
 * curva anterior con un punto en cada extremo leía como un teléfono, no como
 * progreso. El zigzag en línea recta y el nodo del medio son lo que rompe esa
 * lectura.
 */
export function IconoCamino({ className = "" }: IconoNavProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-6 w-6 shrink-0 ${className}`}
    >
      <path
        d="M4.5 18.5L9.5 12.5L14.5 12.5L19.5 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4.5" cy="18.5" r="2" fill="currentColor" />
      <circle cx="12" cy="12.5" r="2" fill="currentColor" />
      <circle cx="19.5" cy="5.5" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconoPerfil({ className = "" }: IconoNavProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-6 w-6 shrink-0 ${className}`}
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
