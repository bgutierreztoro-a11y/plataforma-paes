import {
  DOMINIO,
  TAMANO_SVG,
  calcularTriangulo,
  segmentoRecta,
  xAPixel,
  yAPixel,
} from "@/lib/planoCartesiano";

const ENTEROS = Array.from(
  { length: DOMINIO.max - DOMINIO.min + 1 },
  (_, i) => DOMINIO.min + i,
);
const ROTULOS = ENTEROS.filter((n) => n % 5 === 0);

interface PlanoCartesianoProps {
  m: number;
  b: number;
  mostrarCambio: boolean;
}

export function PlanoCartesiano({ m, b, mostrarCambio }: PlanoCartesianoProps) {
  const [p1, p2] = segmentoRecta(m, b);
  const triangulo = mostrarCambio ? calcularTriangulo(m, b) : null;

  return (
    <svg
      viewBox={`0 0 ${TAMANO_SVG} ${TAMANO_SVG}`}
      width={TAMANO_SVG}
      height={TAMANO_SVG}
      role="img"
      aria-label={`Plano cartesiano con la recta y = ${m}x + ${b}`}
      className="rounded-tarjeta bg-surface"
    >
      {ENTEROS.map((n) => (
        <line
          key={`v${n}`}
          x1={xAPixel(n)}
          y1={yAPixel(DOMINIO.min)}
          x2={xAPixel(n)}
          y2={yAPixel(DOMINIO.max)}
          stroke={n === 0 ? "var(--color-ink-suave)" : "var(--color-grid-fina)"}
          strokeWidth={n === 0 ? 1.5 : 1}
        />
      ))}
      {ENTEROS.map((n) => (
        <line
          key={`h${n}`}
          x1={xAPixel(DOMINIO.min)}
          y1={yAPixel(n)}
          x2={xAPixel(DOMINIO.max)}
          y2={yAPixel(n)}
          stroke={n === 0 ? "var(--color-ink-suave)" : "var(--color-grid-fina)"}
          strokeWidth={n === 0 ? 1.5 : 1}
        />
      ))}
      {ROTULOS.filter((n) => n !== 0).map((n) => (
        <text
          key={`rx${n}`}
          x={xAPixel(n)}
          y={yAPixel(0) + 12}
          fontSize={9}
          textAnchor="middle"
          className="fill-ink-suave font-mono tabular-nums"
        >
          {n}
        </text>
      ))}
      {ROTULOS.filter((n) => n !== 0).map((n) => (
        <text
          key={`ry${n}`}
          x={xAPixel(0) - 8}
          y={yAPixel(n) + 3}
          fontSize={9}
          textAnchor="end"
          className="fill-ink-suave font-mono tabular-nums"
        >
          {n}
        </text>
      ))}
      <line
        x1={xAPixel(p1.x)}
        y1={yAPixel(p1.y)}
        x2={xAPixel(p2.x)}
        y2={yAPixel(p2.y)}
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {triangulo && (
        <g>
          <line
            x1={xAPixel(triangulo.x0)}
            y1={yAPixel(triangulo.y0)}
            x2={xAPixel(triangulo.x1)}
            y2={yAPixel(triangulo.y0)}
            stroke="var(--color-ink)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <line
            x1={xAPixel(triangulo.x1)}
            y1={yAPixel(triangulo.y0)}
            x2={xAPixel(triangulo.x1)}
            y2={yAPixel(triangulo.y1)}
            stroke="var(--color-ink)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <text
            x={(xAPixel(triangulo.x0) + xAPixel(triangulo.x1)) / 2}
            y={yAPixel(triangulo.y0) - 6}
            fontSize={10}
            textAnchor="middle"
            className="fill-ink font-mono tabular-nums"
          >
            {`Δx = ${triangulo.dx}`}
          </text>
          <text
            x={xAPixel(triangulo.x1) + 6}
            y={(yAPixel(triangulo.y0) + yAPixel(triangulo.y1)) / 2}
            fontSize={10}
            textAnchor="start"
            className="fill-ink font-mono tabular-nums"
          >
            {`Δy = ${triangulo.dy}`}
          </text>
        </g>
      )}
    </svg>
  );
}
