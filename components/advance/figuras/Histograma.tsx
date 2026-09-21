import type { FiguraHistograma } from "@/lib/advance/descarte";
import { ariaLabelHistograma, ejeResuelto, marcasDeClase, num } from "@/lib/advance/figurasDatos";
import { escalaDe } from "@/lib/advance/planoFuncion";
import { EjesDatos } from "./EjesDatos";
import { ALTO, ANCHO, DATO, FILA_EXTRA, FONDO, HALO, LETRA_MARCA, MARGEN_DER, MARGEN_INF, MARGEN_IZQ, MARGEN_SUP, RADIO_PUNTO, TICK, TINTA } from "./lienzo";

/**
 * Histograma para la figura `histograma` de un ítem Advance
 * (item-advance.schema.json, figuraHistograma). El eje x es numérico: los
 * intervalos son contiguos (lo garantiza el validador) y cada borde lleva su
 * número. Las barras van pegadas, separadas por un filete del color de fondo.
 * Con `poligono`, el polígono de frecuencias une las marcas de clase (punto
 * medio de cada intervalo) en tinta, sobre las barras.
 *
 * Accesibilidad: role="img" y aria-label generado desde los datos, intervalo
 * por intervalo.
 */
export function Histograma({ figura }: { figura: FiguraHistograma }) {
  const { intervalos, frecuencias, ejeX, ejeY, poligono } = figura;

  const eje = ejeResuelto(frecuencias, ejeY);
  const xMin = intervalos[0].desde;
  const xMax = intervalos[intervalos.length - 1].hasta;
  const margen = { izq: MARGEN_IZQ, der: MARGEN_DER + 6, sup: MARGEN_SUP + FILA_EXTRA, inf: MARGEN_INF + FILA_EXTRA };
  const { xAPixel, yAPixel, izq, der, sup, inf } = escalaDe({ xMin, xMax, yMin: eje.min, yMax: eje.max }, ANCHO, ALTO, margen);
  const yCero = eje.min <= 0 && 0 <= eje.max ? yAPixel(0) : inf;

  const bordes = [xMin, ...intervalos.map((it) => it.hasta)];
  const clases = marcasDeClase(intervalos);
  const puntos = clases.map((x, i) => ({ x: xAPixel(x), y: yAPixel(Math.min(frecuencias[i], eje.max)) }));

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="block h-auto w-full max-w-[26rem]" role="img" aria-label={ariaLabelHistograma(figura)} focusable="false" data-histograma>
      <EjesDatos eje={eje} yAPixel={yAPixel} izq={izq} der={der} sup={sup} inf={inf} yEjeX={yCero} etiquetaX={ejeX.etiqueta} etiquetaY={ejeY.etiqueta} />

      {intervalos.map((it, i) => {
        const yV = yAPixel(Math.min(frecuencias[i], eje.max));
        return (
          <rect key={i} x={xAPixel(it.desde)} y={yV} width={xAPixel(it.hasta) - xAPixel(it.desde)} height={yCero - yV} fill={DATO} stroke={FONDO} strokeWidth="1" data-elemento="barra" />
        );
      })}

      <g fill={TINTA} fontSize={LETRA_MARCA} className="num" data-elemento="marcas-x">
        {bordes.map((b) => (
          <g key={b}>
            <line x1={xAPixel(b)} y1={yCero} x2={xAPixel(b)} y2={yCero + TICK} stroke={TINTA} strokeWidth="1" />
            <text {...HALO} x={xAPixel(b)} y={yCero + TICK + 2} dy="0.8em" textAnchor="middle">
              {num(b)}
            </text>
          </g>
        ))}
      </g>

      {poligono && (
        <g data-elemento="poligono">
          <polyline points={puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={TINTA} strokeWidth="1.5" strokeLinejoin="round" />
          {puntos.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={RADIO_PUNTO} fill={FONDO} stroke={TINTA} strokeWidth="1.5" />
          ))}
        </g>
      )}
    </svg>
  );
}
