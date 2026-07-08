interface IconoProps {
  className?: string;
}

/** Siempre se usa junto al color de estado (éxito/error), nunca el color solo. */
export function IconoCorrecto({ className = "" }: IconoProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 ${className}`}
    >
      <circle cx="10" cy="10" r="9" className="fill-success-suave" />
      <path
        d="M6 10.5l2.5 2.5 5.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
      />
    </svg>
  );
}

export function IconoIncorrecto({ className = "" }: IconoProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 ${className}`}
    >
      <circle cx="10" cy="10" r="9" className="fill-error-suave" />
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="text-error"
      />
    </svg>
  );
}
