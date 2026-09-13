import { escalaDeValores } from "@/lib/estadistica";
import type { DatosGraficoLineas } from "@/lib/tipos";
import {
  CUADRICULA,
  ESTILO_SERIE,
  LIENZO,
  Leyenda,
  Quiebre,
  Rotulo,
  TRAZO_INK,
  Tramas,
  formatoNumero,
} from "./graficosComunes";

/**
 * Hasta dos series sobre categorías ORDENADAS en el tiempo. Cada punto lleva
 * su valor escrito, del lado contrario a la otra serie (arriba si este punto
 * es el más alto de la categoría, abajo si no; con una sola serie, arriba),
 * para que no se pisen cuando las líneas se cruzan. La segunda serie va con
 * trazo discontinuo y marcador cuadrado: nunca solo por color. Misma regla de
 * eje que las barras, con el quiebre cuando el bloque es el ejemplo engañoso.
 */

const IZQ = 44;
const DER = 14;
const ARRIBA = 30;
const ABAJO = 32;

export function GraficoLineas(datos: DatosGraficoLineas) {
  const { categorias, series, ejeVertical } = datos;
  const truncado = datos.ejeTruncado === true;
  const escala = escalaDeValores(series.flatMap((s) => s.valores), truncado);
  const x0 = IZQ;
  const x1 = LIENZO.ancho - DER;
  const y0 = ARRIBA;
  const y1 = LIENZO.alto - ABAJO;
  const yDe = (v: number) => y1 - ((v - escala.min) / (escala.max - escala.min)) * (y1 - y0);
  const xDe = (i: number) => x0 + ((i + 0.5) / categorias.length) * (x1 - x0);

  const lineas: number[] = [];
  for (let v = escala.min; v <= escala.max + 1e-9; v += escala.paso) lineas.push(Number(v.toFixed(6)));

  /* El rótulo va del lado libre: arriba del punto más alto de la categoría y
     abajo del más bajo; con empate, la primera serie arriba y la segunda abajo. */
  const arriba = (k: number, i: number) => {
    if (series.length === 1) return true;
    const otro = series[1 - k].valores[i];
    const propio = series[k].valores[i];
    return propio === otro ? k === 0 : propio > otro;
  };

  const lectura = series
    .map((s) => `${s.nombre}: ${s.valores.map((v, i) => `${categorias[i]} ${formatoNumero(v)}`).join(", ")}`)
    .join("; ");
  const etiqueta = `Gráfico de líneas de ${ejeVertical} a lo largo de ${categorias[0]} a ${categorias[categorias.length - 1]}. ${lectura}. Eje vertical de ${formatoNumero(escala.min)} a ${formatoNumero(escala.max)}, de ${formatoNumero(escala.paso)} en ${formatoNumero(escala.paso)}${truncado ? ". El eje no parte de 0: es un ejemplo de gráfico engañoso" : ""}.`;

  return (
    <svg viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      <Tramas />
      {lineas.map((v) => (
        <g key={`g${v}`}>
          <line x1={x0} y1={yDe(v)} x2={x1} y2={yDe(v)} stroke={CUADRICULA} strokeWidth="1" />
          <Rotulo x={x0 - 6} y={yDe(v)} anclaje="end" tamano={9} suave numero>
            {formatoNumero(v)}
          </Rotulo>
        </g>
      ))}
      <line x1={x0} y1={y0 - 4} x2={x0} y2={y1} stroke={TRAZO_INK} strokeWidth="1.5" />
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={TRAZO_INK} strokeWidth="1.5" />
      {truncado && <Quiebre x={x0} y={y1 - 12} vertical />}
      <Rotulo x={x0} y={12} anclaje="start" tamano={9} suave>
        {ejeVertical}
      </Rotulo>
      <Leyenda nombres={series.map((s) => s.nombre)} x={x0 + 100} y={12} />
      {categorias.map((categoria, i) => (
        <Rotulo key={categoria} x={xDe(i)} y={y1 + 12} tamano={9}>
          {categoria}
        </Rotulo>
      ))}
      {series.map((s, k) => {
        const estilo = ESTILO_SERIE[k];
        const puntos = s.valores.map((v, i) => ({ x: xDe(i), y: yDe(v), v }));
        return (
          <g key={s.nombre}>
            <polyline
              points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={estilo.trazo}
              strokeWidth="2"
              strokeDasharray={estilo.dasharray}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {puntos.map((p, i) => (
              <g key={i}>
                {estilo.marcador === "circulo" ? (
                  <circle cx={p.x} cy={p.y} r="3.5" fill="var(--color-card)" stroke={estilo.trazo} strokeWidth="2" />
                ) : (
                  <rect x={p.x - 3.5} y={p.y - 3.5} width="7" height="7" fill="var(--color-card)" stroke={estilo.trazo} strokeWidth="2" />
                )}
                <Rotulo x={p.x} y={arriba(k, i) ? p.y - 10 : p.y + 11} tamano={9} fuerte numero acento={k === 1} halo>
                  {formatoNumero(p.v)}
                </Rotulo>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
