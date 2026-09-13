import { escalaDeValores } from "@/lib/estadistica";
import type { DatosGraficoBarras } from "@/lib/tipos";
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
 * Barras simples o agrupadas (hasta dos series) sobre categorías. El eje
 * vertical parte de 0 salvo `ejeTruncado`, que el contrato solo admite en un
 * bloque marcado `ejemploEnganoso` y que acá se dibuja con un quiebre visible
 * en el eje y el rótulo del valor donde arranca. Cada barra lleva su valor
 * escrito encima: ese número, y no la altura, es lo que se lee.
 */

const IZQ = 44;
const DER = 10;
const ARRIBA = 30;
const ABAJO = 32;

export function GraficoBarras(datos: DatosGraficoBarras) {
  const { categorias, series, ejeVertical } = datos;
  const truncado = datos.ejeTruncado === true;
  const escala = escalaDeValores(series.flatMap((s) => s.valores), truncado);
  const x0 = IZQ;
  const x1 = LIENZO.ancho - DER;
  const y0 = ARRIBA;
  const y1 = LIENZO.alto - ABAJO;
  const yDe = (v: number) => y1 - ((v - escala.min) / (escala.max - escala.min)) * (y1 - y0);

  const ancho = (x1 - x0) / categorias.length;
  const anchoGrupo = ancho * 0.66;
  const anchoBarra = anchoGrupo / series.length;

  const lineas: number[] = [];
  for (let v = escala.min; v <= escala.max + 1e-9; v += escala.paso) lineas.push(Number(v.toFixed(6)));

  const lectura = series
    .map((s) => `${s.nombre}: ${s.valores.map((v, i) => `${categorias[i]} ${formatoNumero(v)}`).join(", ")}`)
    .join("; ");
  const etiqueta = `Gráfico de barras de ${ejeVertical} por categoría. ${lectura}. Eje vertical de ${formatoNumero(escala.min)} a ${formatoNumero(escala.max)}, de ${formatoNumero(escala.paso)} en ${formatoNumero(escala.paso)}${truncado ? ". El eje no parte de 0: es un ejemplo de gráfico engañoso" : ""}.`;

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
      {categorias.map((categoria, i) => {
        const centro = x0 + ancho * (i + 0.5);
        const inicioGrupo = centro - anchoGrupo / 2;
        return (
          <g key={categoria}>
            {series.map((s, k) => {
              const v = s.valores[i];
              const estilo = ESTILO_SERIE[k];
              const bx = inicioGrupo + k * anchoBarra;
              const alto = Math.max(0, y1 - yDe(v));
              return (
                <g key={s.nombre}>
                  <rect
                    x={bx + 1}
                    y={y1 - alto}
                    width={Math.max(0, anchoBarra - 2)}
                    height={alto}
                    fill={estilo.relleno}
                    stroke={estilo.trazo}
                    strokeWidth="1.2"
                    strokeDasharray={estilo.dasharray}
                  />
                  <Rotulo x={bx + anchoBarra / 2} y={y1 - alto - 7} tamano={9} fuerte numero>
                    {formatoNumero(v)}
                  </Rotulo>
                </g>
              );
            })}
            <Rotulo x={centro} y={y1 + 12} tamano={9}>
              {categoria}
            </Rotulo>
          </g>
        );
      })}
    </svg>
  );
}
