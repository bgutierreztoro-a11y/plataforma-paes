import { useId } from "react";
import type { Coordenada, CurvaFuncion, FiguraPlanoFuncion, RegionFuncion } from "@/lib/advance/descarte";
import {
  bezierParabola,
  coeficientesRecta,
  escalaDe,
  formatoMarca,
  marcasDeEje,
  pathDeArco,
  recortarArco,
  segmentoRectaEnVentana,
  ventanaAutomatica,
  type ArcoBezier,
  type Ventana,
} from "@/lib/advance/planoFuncion";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * Plano de función para la figura `plano-funcion` de un ítem Advance
 * (item-advance.schema.json, figuraPlanoFuncion). SVG estático: sin estado,
 * sin hooks de efecto, sin animación y sin hover; lo mismo en el servidor que
 * en el cliente. Toda la geometría sale de lib/advance/planoFuncion.ts; acá
 * solo se pinta.
 *
 * Jerarquía visual, de más a menos peso: curvas > puntos rotulados > ejes >
 * grilla. Las curvas van en `--linea-nav` (color de línea calibrado como texto
 * sobre claro, ≥ 4,5:1 en las cuatro líneas), los ejes, rótulos y puntos de
 * referencia en tinta, la grilla en hairline. Con dos o más curvas, el trazo
 * (sólido / segmentado / punteado) y el rótulo al lado de la curva son los
 * canales que las distinguen; el color no lo es.
 *
 * Escalas independientes en x e y: la ventana se estira al lienzo fijo de
 * 320 × 240 unidades de viewBox, así que a 390 px de viewport la letra de 9,5
 * queda en torno a los 10 px reales. El margen izquierdo alcanza para un rótulo
 * de eje y de cinco caracteres ("−1,25").
 *
 * Accesibilidad: `role="img"` con `aria-labelledby` a un <title> corto
 * generado (qué clase de gráfico es) y a un <desc> que es `figura.descripcion`,
 * el texto alternativo real. Los rótulos son <text>, para que escalen con el
 * zoom del sistema. Los ids salen de `useId`, porque la galería monta muchos
 * planos en la misma página.
 */

interface PlanoFuncionProps {
  figura: FiguraPlanoFuncion;
}

const ANCHO = 320;
const ALTO = 240;
const MARGEN_IZQ = 38;
const MARGEN_DER = 14;
const MARGEN_SUP = 14;
const MARGEN_INF = 24;
const ETIQUETA_EJE = 13;
const LETRA_MARCA = 9.5;
const LETRA_ROTULO = 12;
const RADIO_PUNTO = 4;
const PUNTA_EJE = 7;
/* Cuánto sale la línea del eje del rectángulo antes de la punta. */
const SALIDA_EJE = 4;
const TICK = 3;

const DASH: Record<NonNullable<CurvaFuncion["trazo"]>, string | undefined> = {
  solido: undefined,
  segmentado: "7 4",
  punteado: "1.5 4.5",
};

/* Halo del color de fondo detrás de cada rótulo: donde una curva cruza un
   número (el eje y en una marca, el vértice bajo su etiqueta) el texto sigue
   legible. El halo se pinta debajo del relleno, así que no cambia el color
   medido del texto. */
const HALO = { stroke: "var(--color-bg)", strokeWidth: 3, strokeLinejoin: "round", paintOrder: "stroke" } as const;

const num = (v: number) => v.toLocaleString("es-CL", { maximumFractionDigits: 3 }).replace(/^-/, "−");
/* Par ordenado: con decimales el separador es ";" para que la coma decimal no se confunda. */
const par = (p: Coordenada) => `(${num(p.x)}${Number.isInteger(p.x) && Number.isInteger(p.y) ? ", " : "; "}${num(p.y)})`;

/** Los tramos visibles de una curva, ya recortados a la ventana, en unidades. */
function tramosDe(curva: CurvaFuncion, v: Ventana): ArcoBezier[] {
  if (curva.clase === "recta-vertical") {
    if (curva.x < v.xMin || curva.x > v.xMax) return [];
    const p0 = { x: curva.x, y: v.yMin };
    const p2 = { x: curva.x, y: v.yMax };
    return [{ p0, c: { x: curva.x, y: (v.yMin + v.yMax) / 2 }, p2 }];
  }
  if (curva.clase === "recta") {
    const { m, b } = coeficientesRecta(curva);
    const seg = segmentoRectaEnVentana(m, b, v, curva.desde, curva.hasta);
    if (!seg) return [];
    const [p0, p2] = seg;
    return [{ p0, c: { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 }, p2 }];
  }
  const x0 = Math.max(v.xMin, curva.desde ?? -Infinity);
  const x1 = Math.min(v.xMax, curva.hasta ?? Infinity);
  if (x0 >= x1) return [];
  return recortarArco(bezierParabola(curva.a, curva.b, curva.c, x0, x1), v);
}

/** Path cerrado de una región, en unidades: entre la curva y el eje x, o la franja vertical. */
function pathDeRegion(region: RegionFuncion, curvas: CurvaFuncion[], v: Ventana, aPixel: (p: Coordenada) => Coordenada): string | null {
  const desde = Math.max(region.desde, v.xMin);
  const hasta = Math.min(region.hasta, v.xMax);
  if (desde >= hasta) return null;
  if (region.clase === "franja-x") {
    const a = aPixel({ x: desde, y: v.yMax });
    const b = aPixel({ x: hasta, y: v.yMin });
    return `M ${a.x} ${a.y} H ${b.x} V ${b.y} H ${a.x} Z`;
  }
  const curva = curvas[region.curva];
  if (!curva || curva.clase === "recta-vertical") return null;
  const base0 = aPixel({ x: desde, y: 0 });
  const base1 = aPixel({ x: hasta, y: 0 });
  if (curva.clase === "recta") {
    const { m, b } = coeficientesRecta(curva);
    const p = aPixel({ x: desde, y: m * desde + b });
    const q = aPixel({ x: hasta, y: m * hasta + b });
    return `M ${base0.x} ${base0.y} L ${p.x} ${p.y} L ${q.x} ${q.y} L ${base1.x} ${base1.y} Z`;
  }
  const arco = bezierParabola(curva.a, curva.b, curva.c, desde, hasta);
  const p0 = aPixel(arco.p0);
  const c = aPixel(arco.c);
  const p2 = aPixel(arco.p2);
  return `M ${base0.x} ${base0.y} L ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y} L ${base1.x} ${base1.y} Z`;
}

export function PlanoFuncion({ figura }: PlanoFuncionProps) {
  const id = useId();
  const idTitulo = `t${id}`;
  const idDesc = `d${id}`;
  const idRecorte = `c${id}`;
  const { curvas, puntos = [], segmentos = [], regiones = [], ejeSimetria, etiquetaEjeX, etiquetaEjeY, descripcion } = figura;

  const otrosX = [...(ejeSimetria ? [ejeSimetria.x] : []), ...regiones.flatMap((r) => [r.desde, r.hasta])];
  const v = figura.ventana ?? ventanaAutomatica(curvas, puntos, segmentos, otrosX);

  const margen = {
    izq: MARGEN_IZQ,
    der: MARGEN_DER,
    sup: MARGEN_SUP + (etiquetaEjeY ? ETIQUETA_EJE : 0),
    inf: MARGEN_INF + (etiquetaEjeX ? ETIQUETA_EJE : 0),
  };
  const e = escalaDe(v, ANCHO, ALTO, margen);
  const { xAPixel, yAPixel, aPixel, izq, der, sup, inf } = e;

  const ejeXVisible = v.yMin <= 0 && 0 <= v.yMax;
  const ejeYVisible = v.xMin <= 0 && 0 <= v.xMax;
  const yEjeX = ejeXVisible ? yAPixel(0) : inf;
  const xEjeY = ejeYVisible ? xAPixel(0) : izq;

  const dentro = (n: number, lo: number, hi: number) => n >= lo - 1e-9 && n <= hi + 1e-9;
  const marcasX = marcasDeEje(v.xMin, v.xMax);
  const marcasY = marcasDeEje(v.yMin, v.yMax);
  const xs = marcasX.marcas.filter((x) => dentro(x, v.xMin, v.xMax));
  const ys = marcasY.marcas.filter((y) => dentro(y, v.yMin, v.yMax));
  const esCero = (n: number) => Math.abs(n) < 1e-9;

  const grilla = [
    ...xs.map((x) => `M ${xAPixel(x)} ${sup} V ${inf}`),
    ...ys.map((y) => `M ${izq} ${yAPixel(y)} H ${der}`),
  ].join(" ");

  const titulo = curvas.length === 1 ? TEXTOS_ADVANCE.figura.planoUnaCurva : TEXTOS_ADVANCE.figura.planoVariasCurvas(curvas.length);

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="block h-auto w-full max-w-[26rem]"
      role="img"
      aria-labelledby={`${idTitulo} ${idDesc}`}
      focusable="false"
      data-plano-funcion
    >
      <title id={idTitulo}>{titulo}</title>
      <desc id={idDesc}>{descripcion}</desc>
      <defs>
        <clipPath id={idRecorte}>
          <rect x={izq} y={sup} width={der - izq} height={inf - sup} />
        </clipPath>
      </defs>

      {/* Regiones debajo de todo: son fondo, no dato. */}
      {regiones.map((r, i) => {
        const d = pathDeRegion(r, curvas, v, aPixel);
        return d ? <path key={`r${i}`} d={d} fill="var(--linea-tinte)" clipPath={`url(#${idRecorte})`} data-elemento="region" /> : null;
      })}

      <path d={grilla} stroke="var(--border-hairline)" strokeWidth="1" fill="none" />

      {/* Ejes con punta de flecha, dibujada a mano (un <marker> lleva id por
          plano). La punta sale del rectángulo del plano, dentro del margen, para
          que no se monte sobre la marca del borde. */}
      {ejeXVisible && (
        <g data-elemento="eje-x">
          <line x1={izq} y1={yEjeX} x2={der + SALIDA_EJE} y2={yEjeX} stroke="var(--text-primary)" strokeWidth="1.5" />
          <polygon points={`${der + SALIDA_EJE + PUNTA_EJE},${yEjeX} ${der + SALIDA_EJE},${yEjeX - PUNTA_EJE / 2.4} ${der + SALIDA_EJE},${yEjeX + PUNTA_EJE / 2.4}`} fill="var(--text-primary)" />
        </g>
      )}
      {ejeYVisible && (
        <g data-elemento="eje-y">
          <line x1={xEjeY} y1={sup - SALIDA_EJE} x2={xEjeY} y2={inf} stroke="var(--text-primary)" strokeWidth="1.5" />
          <polygon points={`${xEjeY},${sup - SALIDA_EJE - PUNTA_EJE} ${xEjeY - PUNTA_EJE / 2.4},${sup - SALIDA_EJE} ${xEjeY + PUNTA_EJE / 2.4},${sup - SALIDA_EJE}`} fill="var(--text-primary)" />
        </g>
      )}

      {/* Marcas: tick corto sobre el eje y número como <text> real. */}
      <g fill="var(--text-primary)" stroke="none" fontSize={LETRA_MARCA} className="num" data-elemento="marcas">
        {xs.map((x) =>
          esCero(x) && ejeXVisible && ejeYVisible ? null : (
            <g key={`x${x}`}>
              <line x1={xAPixel(x)} y1={yEjeX - TICK} x2={xAPixel(x)} y2={yEjeX + TICK} stroke="var(--text-primary)" strokeWidth="1" />
              <text {...HALO} x={xAPixel(x)} y={yEjeX + TICK + 2} dy="0.8em" textAnchor="middle">
                {formatoMarca(x, marcasX.paso)}
              </text>
            </g>
          ),
        )}
        {ys.map((y) =>
          esCero(y) && ejeXVisible && ejeYVisible ? null : (
            <g key={`y${y}`}>
              <line x1={xEjeY - TICK} y1={yAPixel(y)} x2={xEjeY + TICK} y2={yAPixel(y)} stroke="var(--text-primary)" strokeWidth="1" />
              <text {...HALO} x={xEjeY - TICK - 3} y={yAPixel(y)} dy="0.35em" textAnchor="end">
                {formatoMarca(y, marcasY.paso)}
              </text>
            </g>
          ),
        )}
        {ejeXVisible && ejeYVisible && (
          <text {...HALO} x={xEjeY - TICK - 3} y={yEjeX + TICK + 2} dy="0.8em" textAnchor="end">
            0
          </text>
        )}
      </g>

      {etiquetaEjeX && (
        <text {...HALO} x={der} y={ALTO - 3} fontSize={LETRA_MARCA} fontWeight="600" textAnchor="end" fill="var(--text-primary)" data-elemento="etiqueta-eje-x">
          {etiquetaEjeX}
        </text>
      )}
      {etiquetaEjeY && (
        <text {...HALO} x={izq} y={LETRA_MARCA} fontSize={LETRA_MARCA} fontWeight="600" textAnchor="start" fill="var(--text-primary)" data-elemento="etiqueta-eje-y">
          {etiquetaEjeY}
        </text>
      )}

      {ejeSimetria && dentro(ejeSimetria.x, v.xMin, v.xMax) && (
        <g data-elemento="eje-simetria">
          <line x1={xAPixel(ejeSimetria.x)} y1={sup} x2={xAPixel(ejeSimetria.x)} y2={inf} stroke="var(--text-primary)" strokeWidth="1.25" strokeDasharray="2 4" strokeLinecap="round" />
          {ejeSimetria.rotulo && (
            <text {...HALO} x={xAPixel(ejeSimetria.x) + 4} y={sup + 2} dy="0.8em" fontSize={LETRA_ROTULO} fontWeight="600" fill="var(--text-primary)" className="num">
              {ejeSimetria.rotulo}
            </text>
          )}
        </g>
      )}

      {curvas.map((cu, i) => {
        const tramos = tramosDe(cu, v);
        if (tramos.length === 0) return null;
        const d = tramos.map((t) => pathDeArco(t, aPixel)).join(" ");
        /* El rótulo va al lado del extremo derecho visible de la curva. Si la
           curva sale por el borde derecho, se corre hacia adentro; si sale por
           arriba, baja bajo el borde para no pisar la punta ni la vecina. */
        const fin = aPixel(tramos[tramos.length - 1].p2);
        const pegado = fin.x > der - 16;
        const arriba = fin.y < sup + 10;
        const rx = pegado ? fin.x - 5 : fin.x + 5;
        const ry = Math.min(Math.max(fin.y + (pegado ? -8 : arriba ? 10 : 0), sup + 9), inf - 3);
        return (
          <g key={`c${i}`} data-elemento="curva" data-clase={cu.clase}>
            <path d={d} fill="none" stroke="var(--linea-nav)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={DASH[cu.trazo ?? "solido"]} />
            {cu.rotulo && (
              <text {...HALO} x={rx} y={ry} dy="0.35em" textAnchor={pegado ? "end" : "start"} fontSize={LETRA_ROTULO} fontWeight="600" fontStyle="italic" fill="var(--text-primary)">
                {cu.rotulo}
              </text>
            )}
          </g>
        );
      })}

      {segmentos.map((s, i) => {
        const a = aPixel(s.desde);
        const b = aPixel(s.hasta);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const largo = Math.hypot(dx, dy) || 1;
        const nx = -dy / largo;
        const ny = dx / largo;
        const tick = (p: Coordenada) => `M ${p.x + nx * TICK} ${p.y + ny * TICK} L ${p.x - nx * TICK} ${p.y - ny * TICK}`;
        /* El rótulo se aparta por la normal y se ancla hacia afuera, para no
           pisar la línea: a la izquierda de un segmento vertical va con ancla
           final, a la derecha con ancla inicial. */
        const ancla = nx > 0.3 ? "start" : nx < -0.3 ? "end" : "middle";
        return (
          <g key={`s${i}`} data-elemento="segmento" stroke="var(--text-primary)">
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth="1.5" />
            <path d={`${tick(a)} ${tick(b)}`} strokeWidth="1.5" />
            {s.rotulo && (
              <text {...HALO} x={(a.x + b.x) / 2 + nx * 6} y={(a.y + b.y) / 2 + ny * 6} dy="0.35em" textAnchor={ancla} fontSize={LETRA_ROTULO} fontWeight="600" fontStyle="italic" fill="var(--text-primary)" className="num">
                {s.rotulo}
              </text>
            )}
          </g>
        );
      })}

      {/* Los puntos van al final para quedar encima de las curvas. */}
      {puntos.map((p, i) => {
        const c = aPixel(p);
        const hueco = p.estilo === "hueco";
        const etiqueta = [p.rotulo, p.mostrarCoordenadas ? par(p) : null].filter(Boolean).join(" ");
        return (
          <g key={`p${i}`} data-elemento="punto" data-estilo={hueco ? "hueco" : "relleno"}>
            <circle cx={c.x} cy={c.y} r={RADIO_PUNTO} fill={hueco ? "var(--color-bg)" : "var(--linea-nav)"} stroke="var(--linea-nav)" strokeWidth="2" />
            {etiqueta && (
              <text {...HALO} x={c.x + RADIO_PUNTO + 2} y={c.y - RADIO_PUNTO - 1} fontSize={LETRA_ROTULO} fontWeight="600" fill="var(--text-primary)" className="num">
                {etiqueta}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
