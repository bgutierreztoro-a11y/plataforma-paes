/* Plano cartesiano estático para ítems PAES cuyo enunciado entrega puntos
   concretos: visualizar la recta ayuda a razonar sin regalar la respuesta
   (el valor pedido igual hay que calcularlo). Primer cuadrante, escala
   automática según los puntos. */

interface PlanoItemProps {
  puntos: [number, number][];
  /* Dibuja la recta que pasa por los dos primeros puntos. */
  conRecta?: boolean;
}

const ANCHO = 280;
const ALTO = 220;
const MARGEN = { izq: 36, der: 14, sup: 14, inf: 30 };

function pasoBonito(rango: number): number {
  if (rango <= 8) return 1;
  if (rango <= 16) return 2;
  if (rango <= 40) return 5;
  return 10;
}

export function PlanoItem({ puntos, conRecta = true }: PlanoItemProps) {
  const xMax = Math.max(...puntos.map(([x]) => x)) + 1;
  const yMax = Math.max(...puntos.map(([, y]) => y)) + 2;
  const xMin = 0;
  const yMin = 0;

  const anchoUtil = ANCHO - MARGEN.izq - MARGEN.der;
  const altoUtil = ALTO - MARGEN.sup - MARGEN.inf;
  const sx = anchoUtil / (xMax - xMin);
  const sy = altoUtil / (yMax - yMin);

  const aSvg = (x: number, y: number): [number, number] => [
    MARGEN.izq + (x - xMin) * sx,
    ALTO - MARGEN.inf - (y - yMin) * sy,
  ];

  const pasoX = pasoBonito(xMax - xMin);
  const pasoY = pasoBonito(yMax - yMin);

  const lineasGrid: string[] = [];
  for (let x = xMin + pasoX; x <= xMax; x += pasoX) {
    const [gx] = aSvg(x, 0);
    lineasGrid.push(`M ${gx} ${MARGEN.sup} V ${ALTO - MARGEN.inf}`);
  }
  for (let y = yMin + pasoY; y <= yMax; y += pasoY) {
    const [, gy] = aSvg(0, y);
    lineasGrid.push(`M ${MARGEN.izq} ${gy} H ${ANCHO - MARGEN.der}`);
  }

  /* Recta por los dos primeros puntos, recortada al área visible. */
  let recta: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (conRecta && puntos.length >= 2) {
    const [[px1, py1], [px2, py2]] = puntos;
    const m = (py2 - py1) / (px2 - px1);
    const c = py1 - m * px1;
    let xa = xMin;
    let ya = m * xa + c;
    if (ya < yMin && m !== 0) [xa, ya] = [(yMin - c) / m, yMin];
    if (ya > yMax && m !== 0) [xa, ya] = [(yMax - c) / m, yMax];
    let xb = xMax;
    let yb = m * xb + c;
    if (yb < yMin && m !== 0) [xb, yb] = [(yMin - c) / m, yMin];
    if (yb > yMax && m !== 0) [xb, yb] = [(yMax - c) / m, yMax];
    const [x1, y1] = aSvg(xa, ya);
    const [x2, y2] = aSvg(xb, yb);
    recta = { x1, y1, x2, y2 };
  }

  const [origenX, origenY] = aSvg(0, 0);

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <path d={lineasGrid.join(" ")} stroke="var(--color-grid-fina)" strokeWidth="1" fill="none" />
      {/* ejes con rótulos por paso */}
      <path
        d={`M ${MARGEN.izq} ${origenY} H ${ANCHO - MARGEN.der} M ${origenX} ${ALTO - MARGEN.inf} V ${MARGEN.sup}`}
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {Array.from({ length: Math.floor((xMax - xMin) / pasoX) }, (_, i) => {
        const x = xMin + (i + 1) * pasoX;
        const [gx] = aSvg(x, 0);
        return (
          <text
            key={`x${x}`}
            x={gx}
            y={origenY + 16}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-ink-suave)"
          >
            {x}
          </text>
        );
      })}
      {Array.from({ length: Math.floor((yMax - yMin) / pasoY) }, (_, i) => {
        const y = yMin + (i + 1) * pasoY;
        const [, gy] = aSvg(0, y);
        return (
          <text
            key={`y${y}`}
            x={origenX - 8}
            y={gy + 3.5}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-ink-suave)"
          >
            {y}
          </text>
        );
      })}
      {recta && (
        <line
          {...recta}
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {puntos.map(([x, y]) => {
        const [cx, cy] = aSvg(x, y);
        /* La etiqueta va al cuadrante superior-izquierdo del punto (fuera del
           trazo de una recta creciente); si no hay espacio hacia la izquierda
           o hacia arriba, cae al inferior-derecho. */
        const cabeIzquierda = cx > MARGEN.izq + 52 && cy > MARGEN.sup + 18;
        return (
          <g key={`${x},${y}`}>
            <circle cx={cx} cy={cy} r="8" fill="var(--color-accent-suave)" />
            <circle cx={cx} cy={cy} r="4" fill="var(--color-accent)" />
            <text
              x={cabeIzquierda ? cx - 10 : cx + 10}
              y={cabeIzquierda ? cy - 10 : cy + 18}
              textAnchor={cabeIzquierda ? "end" : "start"}
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--color-ink)"
            >
              ({x}, {y})
            </text>
          </g>
        );
      })}
    </svg>
  );
}
