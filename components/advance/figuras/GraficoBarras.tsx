import { useId } from "react";
import type { FiguraGraficoBarras } from "@/lib/advance/descarte";
import { ariaLabelBarras, ejeResuelto, num } from "@/lib/advance/figurasDatos";
import { escalaDe } from "@/lib/advance/planoFuncion";
import { EjesDatos } from "./EjesDatos";
import { Leyenda } from "./Leyenda";
import { ALTO, ANCHO, FILA_EXTRA, HALO, LETRA_MARCA, MARGEN_DER, MARGEN_INF, MARGEN_IZQ, MARGEN_SUP, rellenoDe, TINTA } from "./lienzo";
import { Rayas } from "./Rayas";

/**
 * Gráfico de barras verticales para la figura `grafico-barras` de un ítem
 * Advance (item-advance.schema.json, figuraGraficoBarras). SVG estático, sin
 * estado ni hover; la geometría del eje sale de lib/advance/figurasDatos.ts.
 *
 * Las barras nacen del 0 (o cuelgan de él si el valor es negativo). Con 2 o 3
 * series, cada categoría agrupa una barra por serie, distinguidas por relleno
 * (sólido, rayado, tinte) y por el nombre en la leyenda; el color es el mismo.
 * `mostrarValores` escribe el valor sobre cada barra con halo.
 *
 * Accesibilidad: role="img" y aria-label generado desde los datos, con la
 * lista completa de categorías y valores.
 */
export function GraficoBarras({ figura }: { figura: FiguraGraficoBarras }) {
  const idRayas = `r${useId()}`;
  const { categorias, series, ejeX, ejeY, mostrarValores } = figura;
  const conLeyenda = series.length >= 2;

  const eje = ejeResuelto(series.flatMap((s) => s.valores), ejeY);
  const margen = { izq: MARGEN_IZQ, der: MARGEN_DER, sup: MARGEN_SUP + FILA_EXTRA + (conLeyenda ? FILA_EXTRA : 0), inf: MARGEN_INF + FILA_EXTRA };
  const { yAPixel, izq, der, sup, inf } = escalaDe({ xMin: 0, xMax: categorias.length, yMin: eje.min, yMax: eje.max }, ANCHO, ALTO, margen);
  const yCero = eje.min <= 0 && 0 <= eje.max ? yAPixel(0) : inf;

  const anchoGrupo = (der - izq) / categorias.length;
  const anchoUtil = anchoGrupo * 0.72;
  const anchoBarra = anchoUtil / series.length;

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="block h-auto w-full max-w-[26rem]" role="img" aria-label={ariaLabelBarras(figura)} focusable="false" data-grafico-barras>
      <defs>
        <Rayas id={idRayas} />
      </defs>

      <EjesDatos eje={eje} yAPixel={yAPixel} izq={izq} der={der} sup={sup} inf={inf} yEjeX={yCero} etiquetaX={ejeX.etiqueta} etiquetaY={ejeY.etiqueta} />

      {conLeyenda && <Leyenda nombres={series.map((s) => s.nombre ?? "")} forma="barras" idRayas={idRayas} x={izq} y={MARGEN_SUP + FILA_EXTRA} />}

      {categorias.map((categoria, i) => {
        const x0 = izq + i * anchoGrupo + (anchoGrupo - anchoUtil) / 2;
        return (
          <g key={i} data-elemento="categoria">
            {series.map((s, j) => {
              const v = s.valores[i];
              const yV = yAPixel(Math.min(Math.max(v, eje.min), eje.max));
              const x = x0 + j * anchoBarra;
              const alto = Math.abs(yCero - yV);
              return (
                <g key={j} data-elemento="barra" data-serie={j}>
                  <rect x={x} y={Math.min(yCero, yV)} width={anchoBarra} height={alto} {...rellenoDe(j, idRayas)} />
                  {mostrarValores && (
                    <text {...HALO} x={x + anchoBarra / 2} y={v >= 0 ? yV - 3 : yV + 3} dy={v >= 0 ? 0 : "0.8em"} fontSize={LETRA_MARCA} fontWeight="600" textAnchor="middle" fill={TINTA} className="num">
                      {num(v)}
                    </text>
                  )}
                </g>
              );
            })}
            <text {...HALO} x={izq + (i + 0.5) * anchoGrupo} y={inf + 4} dy="0.8em" fontSize={LETRA_MARCA} textAnchor="middle" fill={TINTA} data-elemento="rotulo-categoria">
              {categoria}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
