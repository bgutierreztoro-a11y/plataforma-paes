import type { ElementoFigura, FiguraItem, PlanoFigura } from "@/lib/advance/descarte";

/**
 * Plano cartesiano estático para la figura declarativa de un ítem Advance
 * (item-advance.schema.json, `figuraPlano`). Cuatro cuadrantes, cuadrícula
 * unitaria, ejes numerados en cada entero, escala automática desde `plano`.
 * SVG puro sin estado, sin hooks, sin animación y sin hover: lo mismo en el
 * servidor que en el cliente.
 *
 * La figura muestra los DATOS del enunciado y nunca la transformación pedida;
 * quien la escribe en el banco es responsable de eso, acá solo se dibuja.
 *
 * El viewBox tiene ancho fijo (`ANCHO`) y alto proporcional al plano, así que
 * la letra en unidades de viewBox se rinde al mismo tamaño en píxeles sin
 * importar cuántas unidades tenga el plano: a 390 px de viewport el SVG mide
 * 358 px y `LETRA_NOMBRE` (12) queda sobre los 11 px reales aun en la
 * galería, que le resta 34 px de borde y padding.
 *
 * Colores, todos tokens de la dirección Línea: cuadrícula en hairline, ejes y
 * texto en tinta, figura y vector en `--linea-nav` (el color de línea
 * calibrado como texto sobre claro, la 02 cae a tinta), relleno del polígono
 * en `--linea-tinte`. Recta y centro en tinta, para que no compitan con la
 * figura: son referencias, no datos de la figura.
 *
 * La punta del vector se dibuja a mano y no con `<marker>`: un marker lleva
 * id, y la galería monta doce planos en la misma página.
 */

interface PlanoIsometriasProps {
  figura: FiguraItem;
}

const ANCHO = 320;
/* Margen alrededor del plano, en unidades de viewBox, para que los números
   del eje y los nombres de punto del borde no se corten. */
const MARGEN = 22;
const LETRA_EJE = 9.5;
const LETRA_NOMBRE = 12;
const RADIO_PUNTO = 4;
const RADIO_CENTRO = 5.5;
const PUNTA_VECTOR = 9;

type Punto = Extract<ElementoFigura, { tipo: "punto" }>;

function escala(plano: PlanoFigura) {
  const unidades = plano.xMax - plano.xMin;
  const u = (ANCHO - 2 * MARGEN) / unidades;
  const alto = (plano.yMax - plano.yMin) * u + 2 * MARGEN;
  const aSvg = (x: number, y: number): [number, number] => [
    MARGEN + (x - plano.xMin) * u,
    MARGEN + (plano.yMax - y) * u,
  ];
  return { alto, aSvg };
}

function enteros(desde: number, hasta: number): number[] {
  const lista: number[] = [];
  for (let n = desde; n <= hasta; n++) lista.push(n);
  return lista;
}

/* Los dos extremos de una recta recortada al rectángulo del plano. */
function extremosDeRecta(
  el: Extract<ElementoFigura, { tipo: "recta" }>,
  plano: PlanoFigura,
): [[number, number], [number, number]] {
  const { xMin, xMax, yMin, yMax } = plano;
  switch (el.forma) {
    case "x=c":
      return [[el.c, yMin], [el.c, yMax]];
    case "y=c":
      return [[xMin, el.c], [xMax, el.c]];
    case "y=x": {
      const a = Math.max(xMin, yMin);
      const b = Math.min(xMax, yMax);
      return [[a, a], [b, b]];
    }
    case "y=-x": {
      const a = Math.max(xMin, -yMax);
      const b = Math.min(xMax, -yMin);
      return [[a, -a], [b, -b]];
    }
  }
}

export function PlanoIsometrias({ figura }: PlanoIsometriasProps) {
  const { plano, descripcion, elementos } = figura;
  const { alto, aSvg } = escala(plano);
  const xs = enteros(plano.xMin, plano.xMax);
  const ys = enteros(plano.yMin, plano.yMax);
  const [x0, y0] = aSvg(0, 0);
  const [izq, sup] = aSvg(plano.xMin, plano.yMax);
  const [der, inf] = aSvg(plano.xMax, plano.yMin);
  const ejeXVisible = plano.yMin <= 0 && 0 <= plano.yMax;
  const ejeYVisible = plano.xMin <= 0 && 0 <= plano.xMax;
  /* Donde no se ve el eje, los números van pegados al borde del plano. */
  const filaNumerosX = ejeXVisible ? y0 : inf;
  const columnaNumerosY = ejeYVisible ? x0 : izq;

  const puntos = new Map<string, Punto>();
  for (const el of elementos) if (el.tipo === "punto") puntos.set(el.nombre, el);

  const cuadricula = [
    ...xs.map((x) => `M ${aSvg(x, 0)[0]} ${sup} V ${inf}`),
    ...ys.map((y) => `M ${izq} ${aSvg(0, y)[1]} H ${der}`),
  ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${alto}`}
      className="block h-auto w-full max-w-[26rem]"
      role="img"
      aria-label={descripcion}
      data-plano-isometrias
    >
      <title>{descripcion}</title>

      <path d={cuadricula} stroke="var(--border-hairline)" strokeWidth="1" fill="none" />

      {ejeXVisible && <line x1={izq} y1={y0} x2={der} y2={y0} stroke="var(--text-primary)" strokeWidth="1.5" />}
      {ejeYVisible && <line x1={x0} y1={sup} x2={x0} y2={inf} stroke="var(--text-primary)" strokeWidth="1.5" />}

      {elementos.map((el, i) => {
        switch (el.tipo) {
          case "poligono": {
            const vertices = el.vertices.map((n) => puntos.get(n)).filter((p): p is Punto => p !== undefined);
            if (vertices.length < 3) return null;
            const trazo = vertices.map((p) => aSvg(p.x, p.y).join(",")).join(" ");
            const cx = vertices.reduce((s, p) => s + p.x, 0) / vertices.length;
            const cy = vertices.reduce((s, p) => s + p.y, 0) / vertices.length;
            const [lx, ly] = aSvg(cx, cy);
            return (
              <g key={i} data-elemento="poligono">
                <polygon points={trazo} fill="var(--linea-tinte)" stroke="var(--linea-nav)" strokeWidth="2" strokeLinejoin="round" />
                {el.nombre && (
                  <text x={lx} y={ly} dy="0.35em" textAnchor="middle" fontSize={LETRA_NOMBRE} fontWeight="600" fill="var(--text-primary)">
                    {el.nombre}
                  </text>
                )}
              </g>
            );
          }
          case "recta": {
            const [a, b] = extremosDeRecta(el, plano);
            const [ax, ay] = aSvg(a[0], a[1]);
            const [bx, by] = aSvg(b[0], b[1]);
            return (
              <g key={i} data-elemento="recta">
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--text-primary)" strokeWidth="1.5" strokeDasharray="6 4" />
                <text x={bx + 5} y={by} dy="0.35em" fontSize={LETRA_NOMBRE} fontWeight="600" fill="var(--text-primary)">
                  {el.etiqueta}
                </text>
              </g>
            );
          }
          case "vector": {
            const [ax, ay] = aSvg(el.desde[0], el.desde[1]);
            const [bx, by] = aSvg(el.hasta[0], el.hasta[1]);
            const dx = bx - ax;
            const dy = by - ay;
            const largo = Math.hypot(dx, dy) || 1;
            const ux = dx / largo;
            const uy = dy / largo;
            /* La línea se acorta para que termine en la base de la punta. */
            const fx = bx - ux * PUNTA_VECTOR;
            const fy = by - uy * PUNTA_VECTOR;
            const px = -uy * (PUNTA_VECTOR / 2);
            const py = ux * (PUNTA_VECTOR / 2);
            const punta = `${bx},${by} ${fx + px},${fy + py} ${fx - px},${fy - py}`;
            const mx = (ax + bx) / 2 - uy * 10;
            const my = (ay + by) / 2 + ux * 10;
            return (
              <g key={i} data-elemento="vector">
                <line x1={ax} y1={ay} x2={fx} y2={fy} stroke="var(--linea-nav)" strokeWidth="2" strokeLinecap="round" />
                <polygon points={punta} fill="var(--linea-nav)" />
                <text x={mx} y={my} dy="0.35em" textAnchor="middle" fontSize={LETRA_NOMBRE} fontWeight="600" fill="var(--text-primary)">
                  {el.etiqueta}
                </text>
              </g>
            );
          }
          case "centro": {
            const [cx, cy] = aSvg(el.x, el.y);
            return (
              <g key={i} data-elemento="centro">
                <circle cx={cx} cy={cy} r={RADIO_CENTRO} fill="none" stroke="var(--text-primary)" strokeWidth="1.5" />
                <circle cx={cx} cy={cy} r="1.5" fill="var(--text-primary)" />
                <text x={cx + RADIO_CENTRO + 3} y={cy - RADIO_CENTRO} dy="0.35em" fontSize={LETRA_NOMBRE} fontWeight="600" fill="var(--text-primary)">
                  {el.etiqueta}
                </text>
              </g>
            );
          }
          case "punto":
            return null;
        }
      })}

      {/* Los números van sobre las formas: el relleno del polígono los taparía. */}
      <g fill="var(--text-primary)" fontSize={LETRA_EJE} className="num">
        {xs.map((x) =>
          x === 0 && ejeXVisible && ejeYVisible ? null : (
            <text key={`x${x}`} x={aSvg(x, 0)[0]} y={filaNumerosX + 4} dy="0.7em" textAnchor="middle">
              {x}
            </text>
          ),
        )}
        {ys.map((y) =>
          y === 0 && ejeXVisible && ejeYVisible ? null : (
            <text key={`y${y}`} x={columnaNumerosY - 4} y={aSvg(0, y)[1]} dy="0.35em" textAnchor="end">
              {y}
            </text>
          ),
        )}
        {ejeXVisible && ejeYVisible && (
          <text x={x0 - 4} y={y0 + 4} dy="0.7em" textAnchor="end">
            0
          </text>
        )}
      </g>

      {/* Los puntos van al final para quedar encima del polígono y del vector. */}
      {elementos.map((el, i) => {
        if (el.tipo !== "punto") return null;
        const [cx, cy] = aSvg(el.x, el.y);
        return (
          <g key={i} data-elemento="punto">
            <circle cx={cx} cy={cy} r={RADIO_PUNTO} fill="var(--linea-nav)" />
            <text
              x={cx + RADIO_PUNTO + 2}
              y={cy - RADIO_PUNTO - 1}
              fontSize={LETRA_NOMBRE}
              fontWeight="600"
              fill="var(--text-primary)"
              data-nombre-punto
            >
              {el.nombre}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
