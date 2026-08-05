interface Fila {
  signo: string;
  lectura: string;
  incluido: boolean;
  direccion: "izquierda" | "derecha";
}

interface Props {
  filas: Fila[];
}

/* Una fila por signo: el signo, cómo se lee, y el dibujo del conjunto solución
   en la recta. El borde no se describe con palabras — el punto hueco o relleno
   ES la descripción, y decirlo además al lado le quita al dibujo el trabajo
   que vino a hacer. Las cuatro rectas comparten escala y posición del borde,
   así que lo único que cambia de fila a fila es lo que importa. */

const xIni = 6;
const xFin = 114;
const xBorde = 60;
const yRecta = 15;

function MiniRecta({ incluido, direccion }: Pick<Fila, "incluido" | "direccion">) {
  const haciaIzquierda = direccion === "izquierda";
  const xExtremo = haciaIzquierda ? xIni : xFin;
  // La punta de flecha marca que el sombreado no termina: sigue hasta el infinito
  const puntaX = haciaIzquierda ? xIni + 6 : xFin - 6;

  return (
    <svg viewBox="0 0 120 32" className="h-8 w-[120px] shrink-0" aria-hidden="true">
      {/* recta completa, tenue: el fondo sobre el que se recorta la solución */}
      <line
        x1={xIni}
        y1={yRecta}
        x2={xFin}
        y2={yRecta}
        stroke="var(--color-ink-tenue)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* tramo sombreado: el conjunto solución */}
      <line
        x1={xBorde}
        y1={yRecta}
        x2={xExtremo}
        y2={yRecta}
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={`M ${puntaX} ${yRecta - 4} L ${xExtremo} ${yRecta} L ${puntaX} ${yRecta + 4}`}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* el borde: hueco si queda afuera, relleno si queda adentro */}
      <circle
        cx={xBorde}
        cy={yRecta}
        r="4.5"
        fill={incluido ? "var(--color-accent-fuerte)" : "var(--color-surface)"}
        stroke="var(--color-accent-fuerte)"
        strokeWidth="2"
      />
      <text
        x={xBorde}
        y={yRecta + 14}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--color-ink-tenue)"
      >
        5
      </text>
    </svg>
  );
}

export function TablaReglaSigno({ filas }: Props) {
  return (
    <ul className="divide-y divide-border">
      {filas.map((fila) => (
        <li key={fila.signo} className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm tabular-nums text-ink">{fila.signo}</p>
            <p className="text-sm leading-relaxed text-ink-suave">{fila.lectura}</p>
          </div>
          <MiniRecta incluido={fila.incluido} direccion={fila.direccion} />
        </li>
      ))}
    </ul>
  );
}
