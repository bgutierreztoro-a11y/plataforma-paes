import { useId } from "react";
import type { FiguraGraficoLineas } from "@/lib/advance/descarte";
import { ariaLabelLineas, ejeResuelto } from "@/lib/advance/figurasDatos";
import { escalaDe } from "@/lib/advance/planoFuncion";
import { EjesDatos } from "./EjesDatos";
import { Leyenda } from "./Leyenda";
import { ALTO, ANCHO, DASH_SERIE, DATO, FILA_EXTRA, HALO, LETRA_MARCA, MARGEN_DER, MARGEN_INF, MARGEN_IZQ, MARGEN_SUP, marcadorSerie, TICK, TINTA } from "./lienzo";

/**
 * Gráfico de líneas para la figura `grafico-lineas` de un ítem Advance
 * (item-advance.schema.json, figuraGraficoLineas). Las categorías se reparten
 * a lo ancho del eje x con un tick cada una; cada serie es una polilínea con
 * un marcador por punto. Con 2 o 3 series el trazo (sólido, segmentado,
 * punteado), el marcador (círculo, cuadrado, triángulo) y el nombre en la
 * leyenda las distinguen; el color es el mismo. Cubre la ojiva: categorías =
 * bordes superiores, valores = frecuencia acumulada.
 *
 * Accesibilidad: role="img" y aria-label generado desde los datos.
 */
export function GraficoLineas({ figura }: { figura: FiguraGraficoLineas }) {
  const idRayas = `r${useId()}`;
  const { categorias, series, ejeX, ejeY } = figura;
  const conLeyenda = series.length >= 2;

  const eje = ejeResuelto(series.flatMap((s) => s.valores), ejeY);
  const margen = { izq: MARGEN_IZQ, der: MARGEN_DER + 6, sup: MARGEN_SUP + FILA_EXTRA + (conLeyenda ? FILA_EXTRA : 0), inf: MARGEN_INF + FILA_EXTRA };
  const n = categorias.length;
  /* Media casilla de aire a cada lado, para que el primer y el último marcador no pisen el eje ni el borde. */
  const { xAPixel, yAPixel, izq, der, sup, inf } = escalaDe({ xMin: -0.5, xMax: n - 0.5, yMin: eje.min, yMax: eje.max }, ANCHO, ALTO, margen);
  const yCero = eje.min <= 0 && 0 <= eje.max ? yAPixel(0) : inf;
  const acotar = (v: number) => Math.min(Math.max(v, eje.min), eje.max);

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="block h-auto w-full max-w-[26rem]" role="img" aria-label={ariaLabelLineas(figura)} focusable="false" data-grafico-lineas>
      <EjesDatos eje={eje} yAPixel={yAPixel} izq={izq} der={der} sup={sup} inf={inf} yEjeX={yCero} etiquetaX={ejeX.etiqueta} etiquetaY={ejeY.etiqueta} />

      {conLeyenda && <Leyenda nombres={series.map((s) => s.nombre ?? "")} forma="lineas" idRayas={idRayas} x={izq} y={MARGEN_SUP + FILA_EXTRA} />}

      <g fill={TINTA} fontSize={LETRA_MARCA} data-elemento="marcas-x">
        {categorias.map((c, i) => (
          <g key={i}>
            <line x1={xAPixel(i)} y1={yCero} x2={xAPixel(i)} y2={yCero + TICK} stroke={TINTA} strokeWidth="1" />
            <text {...HALO} x={xAPixel(i)} y={inf + 4} dy="0.8em" textAnchor="middle" className="num">
              {c}
            </text>
          </g>
        ))}
      </g>

      {series.map((s, j) => {
        const puntos = s.valores.map((v, i) => ({ x: xAPixel(i), y: yAPixel(acotar(v)) }));
        return (
          <g key={j} data-elemento="serie" data-serie={j}>
            <polyline points={puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={DATO} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={DASH_SERIE[j]} />
            {puntos.map((p, i) => (
              <path key={i} d={marcadorSerie(j, p.x, p.y)} fill={DATO} data-elemento="punto" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
