import { useId } from "react";
import type { FiguraDiagramaCajon } from "@/lib/advance/descarte";
import { LETRA, TICK, geometriaCajon, rotuloDeMarca, type ContextoCajon } from "@/lib/advance/diagramaCajon";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { DATO, HAIRLINE, HALO, TINTA, TINTE } from "./lienzo";

/**
 * Diagrama de cajón para la figura `diagrama-cajon` de un ítem Advance
 * (item-advance.schema.json, figuraDiagramaCajon). Declarativo: pinta los cinco
 * números que trae cada caja sobre el eje declarado y no calcula nada. Toda la
 * geometría (filas o carriles, marcas, dónde va cada rótulo) sale de
 * lib/advance/diagramaCajon.ts, la misma que usa la regla (24) del validador
 * para decidir si dos rótulos se pisan.
 *
 * Forma: caja de Q1 a Q3 con relleno --linea-tinte y borde --linea-nav; la
 * mediana en tinta y más gruesa que el borde, así que se distingue sin color;
 * bigotes hasta el mínimo y el máximo con remate perpendicular. Varias cajas
 * llevan el mismo trazo y se distinguen por su nombre, escrito junto a cada una.
 * Horizontal: nombre a la izquierda, eje abajo, q1, mediana y q3 sobre la caja,
 * mínimo y máximo bajo los bigotes. Vertical: eje a la izquierda, nombre bajo
 * cada carril, los rótulos a la derecha de la caja.
 *
 * Accesibilidad como PlanoFuncion: role="img", <title> corto generado y
 * <desc> = descripcion del banco.
 *
 * Letra: todo texto (números del eje, rótulos, nombres y unidad) va en LETRA =
 * 12 unidades, y el viewBox de cada ubicación es igual o menor que su carril
 * más angosto a 390 px (lib/advance/diagramaCajon.ts), así que no baja de 12
 * px. Sin medición en cliente: el SVG escala con CSS y el render es el mismo en
 * servidor y cliente. El ancho máximo evita que en escritorio la figura crezca
 * sin límite: 26rem en el enunciado, 22rem en una alternativa.
 */
const ANCHO_MAXIMO: Record<ContextoCajon, string> = { enunciado: "max-w-[26rem]", alternativa: "max-w-[22rem]" };

export function DiagramaCajon({ figura, contexto = "enunciado" }: { figura: FiguraDiagramaCajon; contexto?: ContextoCajon }) {
  const idBase = useId();
  const idTitulo = `${idBase}-titulo`;
  const idDesc = `${idBase}-desc`;
  const { eje, cajas, orientacion, descripcion } = figura;
  const g = geometriaCajon(figura, contexto);
  const horizontal = orientacion === "horizontal";

  /* Punto en (valor, transversal) → (x, y) del viewBox. */
  const xy = (valor: number, transversal: number) => (horizontal ? { x: g.aPos(valor), y: transversal } : { x: transversal, y: g.aPos(valor) });
  const linea = (v0: number, t0: number, v1: number, t1: number) => {
    const a = xy(v0, t0);
    const b = xy(v1, t1);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  };

  return (
    <svg
      viewBox={`0 0 ${g.ancho} ${g.alto}`}
      className={`block h-auto w-full ${ANCHO_MAXIMO[contexto]}`}
      role="img"
      aria-labelledby={`${idTitulo} ${idDesc}`}
      focusable="false"
      data-diagrama-cajon={contexto}
    >
      <title id={idTitulo}>{TEXTOS_ADVANCE.figura.cajon(cajas.length)}</title>
      <desc id={idDesc}>{descripcion}</desc>

      {eje.grilla && (
        <g stroke={HAIRLINE} strokeWidth="1" data-elemento="grilla">
          {g.marcas.map((m) => (
            <line key={m} {...linea(m, g.areaDesde, m, g.areaHasta)} />
          ))}
        </g>
      )}

      {/* Eje de valores con tick y número por marca. */}
      <g data-elemento="eje">
        <line {...linea(eje.min, g.lineaEje, eje.max, g.lineaEje)} stroke={TINTA} strokeWidth="1.5" />
        {g.marcas.map((m) => {
          const tick = horizontal ? linea(m, g.lineaEje, m, g.lineaEje + TICK) : linea(m, g.lineaEje - TICK, m, g.lineaEje);
          const p = xy(m, g.lineaEje);
          return (
            <g key={m}>
              <line {...tick} stroke={TINTA} strokeWidth="1" />
              <text
                {...HALO}
                x={horizontal ? p.x : p.x - TICK - 3}
                y={horizontal ? p.y + TICK + 2 : p.y}
                dy={horizontal ? "0.8em" : "0.35em"}
                textAnchor={horizontal ? "middle" : "end"}
                fontSize={LETRA}
                fill={TINTA}
                className="num"
              >
                {rotuloDeMarca(m, eje)}
              </text>
            </g>
          );
        })}
      </g>
      {g.etiqueta && eje.etiqueta && (
        <text {...HALO} x={g.etiqueta.x} y={g.etiqueta.y} textAnchor={g.etiqueta.ancla} fontSize={LETRA} fontWeight="600" fill={TINTA} data-elemento="etiqueta-eje">
          {eje.etiqueta}
        </text>
      )}

      {g.cajas.map(({ caja, centro, mediaCaja, medioRemate }, i) => {
        const { minimo, q1, mediana, q3, maximo, nombre } = caja;
        const a = xy(q1, centro - mediaCaja);
        const b = xy(q3, centro + mediaCaja);
        return (
          <g key={nombre ?? i} data-elemento="caja" data-caja={i}>
            <g stroke={DATO} strokeWidth="1.5" data-elemento="bigotes">
              <line {...linea(minimo, centro, q1, centro)} />
              <line {...linea(q3, centro, maximo, centro)} />
              <line {...linea(minimo, centro - medioRemate, minimo, centro + medioRemate)} data-elemento="remate" />
              <line {...linea(maximo, centro - medioRemate, maximo, centro + medioRemate)} data-elemento="remate" />
            </g>
            <rect
              x={Math.min(a.x, b.x)}
              y={Math.min(a.y, b.y)}
              width={Math.abs(b.x - a.x)}
              height={Math.abs(b.y - a.y)}
              fill={TINTE}
              stroke={DATO}
              strokeWidth="1.5"
              data-elemento="rectangulo"
            />
            <line {...linea(mediana, centro - mediaCaja, mediana, centro + mediaCaja)} stroke={TINTA} strokeWidth="3" data-elemento="mediana" />
            {nombre !== undefined && (
              <text
                {...HALO}
                x={horizontal ? g.nombres.x : centro}
                y={horizontal ? centro : g.nombres.y}
                dy={horizontal ? "0.35em" : undefined}
                textAnchor={horizontal ? "start" : "middle"}
                fontSize={LETRA}
                fontWeight="600"
                fill={TINTA}
                data-elemento="nombre"
              >
                {nombre}
              </text>
            )}
          </g>
        );
      })}

      <g fill={TINTA} fontSize={LETRA} className="num" data-elemento="rotulos">
        {g.rotulos.map((r) => (
          <text key={`${r.caja}-${r.valor}`} {...HALO} x={r.x} y={r.y} textAnchor={r.ancla} fontWeight={r.esMediana ? 700 : 400} data-rotulo={r.valor}>
            {r.texto}
          </text>
        ))}
      </g>
    </svg>
  );
}
