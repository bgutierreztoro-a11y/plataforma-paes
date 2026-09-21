import { DASH_SERIE, DATO, LETRA_MARCA, marcadorSerie, rellenoDe, TINTA } from "./lienzo";

interface LeyendaProps {
  nombres: string[];
  /** "barras": muestra el relleno de cada serie. "lineas": muestra trazo y marcador. */
  forma: "barras" | "lineas";
  idRayas: string;
  x: number;
  y: number;
}

/**
 * Fila de leyenda para 2 o 3 series: la muestra de cada una (relleno o trazo
 * y marcador) seguida de su nombre. El nombre es lo que las distingue; el
 * color es el mismo para todas.
 */
export function Leyenda({ nombres, forma, idRayas, x, y }: LeyendaProps) {
  const paso = 96;
  return (
    <g fontSize={LETRA_MARCA} fill={TINTA} data-elemento="leyenda">
      {nombres.map((nombre, j) => {
        const x0 = x + j * paso;
        return (
          <g key={j}>
            {forma === "barras" ? (
              <rect x={x0} y={y - 5} width="10" height="10" {...rellenoDe(j, idRayas)} />
            ) : (
              <>
                <line x1={x0 - 2} y1={y} x2={x0 + 14} y2={y} stroke={DATO} strokeWidth="2" strokeDasharray={DASH_SERIE[j]} />
                <path d={marcadorSerie(j, x0 + 6, y)} fill={DATO} />
              </>
            )}
            <text x={x0 + 16} y={y} dy="0.35em">
              {nombre}
            </text>
          </g>
        );
      })}
    </g>
  );
}
