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

/**
 * Acompaña al feedback de "aún no": ámbar, nunca rojo (MASTER.md §2.1 y §3.4).
 *
 * El glifo es una flecha circular —"revisar", §3.4— y no una equis. Una equis
 * es un veredicto sobre la persona; la flecha invita a volver a intentar, que
 * es lo que el paso realmente ofrece. La equis queda reservada a fallos de
 * sistema, igual que el rojo.
 *
 * El trazo usa `attention-fuerte` y no `attention` porque el tono de acento no
 * alcanza el contraste mínimo para una línea de 1,8px (§5).
 */
export function IconoIncorrecto({ className = "" }: IconoProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 ${className}`}
    >
      <circle cx="10" cy="10" r="9" className="fill-attention-suave" />
      {/* Arco de 300° (hueco arriba a la izquierda) más la punta de flecha en
          el extremo superior, apuntando en el sentido del giro. */}
      <path
        d="M10 5A5 5 0 1 1 5.7 7.5M8.2 3.7L10 5 8.2 6.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-attention-fuerte"
      />
    </svg>
  );
}
