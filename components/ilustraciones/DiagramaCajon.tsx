import { escalaDeCajon } from "@/lib/estadistica";
import type { DatosDiagramaCajon } from "@/lib/tipos";
import {
  CUADRICULA,
  ESTILO_SERIE,
  LIENZO,
  Rotulo,
  TRAZO_ACENTO,
  TRAZO_INK,
  Tramas,
  formatoNumero,
} from "./graficosComunes";

/**
 * Uno o dos cajones horizontales sobre la MISMA escala, con los cinco valores
 * rotulados: mínimo y máximo bajo los bigotes, Q1, mediana y Q3 sobre la caja
 * (escalonados cuando quedan a menos de 26 px). La escala sale de
 * `escalaDeCajon`, que cubre todos los valores y las marcas con margen, así
 * que nada queda fuera del cuadro. Una marca es una línea vertical con su
 * rótulo y su valor, que cruza todos los cajones: sirve para ubicar un dato
 * individual frente a la distribución.
 *
 * El segundo cajón lleva trama diagonal y trazo discontinuo, nunca solo otro
 * color. El nombre de cada cajón va a la izquierda de su fila.
 */

const IZQ = 76;
const DER = 14;
const ARRIBA = 30;
const ALTO_FILA = 72;
const ZONA_EJE = 42;
const MEDIA_CAJA = 11;
const SEPARACION_MINIMA = 26;

function partirNombre(nombre: string): string[] {
  if (nombre.length <= 11) return [nombre];
  const corte = nombre.lastIndexOf(" ", 12);
  return corte > 0 ? [nombre.slice(0, corte), nombre.slice(corte + 1)] : [nombre];
}

/**
 * Nivel (0, 1 o 2) de cada rótulo superior para que ninguno pise a otro: de
 * izquierda a derecha, cada rótulo toma el nivel más bajo cuyo último ocupante
 * quede a SEPARACION_MINIMA o más. Con una caja muy angosta (Q1, mediana y Q3
 * a menos de 26 px entre sí) hacen falta los tres niveles, y ALTO_FILA deja
 * sitio para ellos sin invadir la fila de arriba.
 */
function niveles(xs: number[]): number[] {
  const orden = xs.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x);
  const nivel = new Array<number>(xs.length).fill(0);
  const ultimoEnNivel: number[] = [];
  for (const { x, i } of orden) {
    let n = 0;
    while (ultimoEnNivel[n] !== undefined && x - ultimoEnNivel[n] < SEPARACION_MINIMA) n++;
    nivel[i] = n;
    ultimoEnNivel[n] = x;
  }
  return nivel;
}

export function DiagramaCajon(datos: DatosDiagramaCajon) {
  const { cajones, ejeHorizontal } = datos;
  const marcas = datos.marcas ?? [];
  const escala = escalaDeCajon(datos);
  const alto = ARRIBA + ALTO_FILA * cajones.length + ZONA_EJE;
  const x0 = IZQ;
  const x1 = LIENZO.ancho - DER;
  const xDe = (v: number) => x0 + ((v - escala.min) / (escala.max - escala.min)) * (x1 - x0);
  const yEje = ARRIBA + ALTO_FILA * cajones.length + 6;

  const lineas: number[] = [];
  for (let v = escala.min; v <= escala.max + 1e-9; v += escala.paso) lineas.push(Number(v.toFixed(6)));

  const lectura = cajones
    .map(
      (c) =>
        `${c.nombre}: mínimo ${formatoNumero(c.min)}, primer cuartil ${formatoNumero(c.q1)}, mediana ${formatoNumero(c.mediana)}, tercer cuartil ${formatoNumero(c.q3)}, máximo ${formatoNumero(c.max)}`,
    )
    .join("; ");
  const lecturaMarcas = marcas.length ? ` Marcas: ${marcas.map((m) => `${m.rotulo} en ${formatoNumero(m.valor)}`).join(", ")}.` : "";
  const etiqueta = `Diagrama de cajón de ${ejeHorizontal}, ${cajones.length === 1 ? "un cajón" : "dos cajones sobre la misma escala"}. ${lectura}. Escala de ${formatoNumero(escala.min)} a ${formatoNumero(escala.max)}, de ${formatoNumero(escala.paso)} en ${formatoNumero(escala.paso)}.${lecturaMarcas}`;

  return (
    <svg viewBox={`0 0 ${LIENZO.ancho} ${alto}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      <Tramas />
      {lineas.map((v) => (
        <g key={`g${v}`}>
          <line x1={xDe(v)} y1={ARRIBA - 6} x2={xDe(v)} y2={yEje} stroke={CUADRICULA} strokeWidth="1" />
          <Rotulo x={xDe(v)} y={yEje + 11} tamano={9} suave numero>
            {formatoNumero(v)}
          </Rotulo>
        </g>
      ))}
      <line x1={x0} y1={yEje} x2={x1} y2={yEje} stroke={TRAZO_INK} strokeWidth="1.5" />
      <Rotulo x={x0} y={yEje + 27} anclaje="start" tamano={9} suave>
        {ejeHorizontal}
      </Rotulo>

      {cajones.map((c, i) => {
        const cy = ARRIBA + ALTO_FILA * i + ALTO_FILA / 2;
        const estilo = ESTILO_SERIE[i];
        const xs = [xDe(c.q1), xDe(c.mediana), xDe(c.q3)];
        const nivel = niveles(xs);
        const yArriba = (n: number) => cy - MEDIA_CAJA - 8 - n * 10;
        const lineasNombre = partirNombre(c.nombre);
        return (
          <g key={c.nombre}>
            {lineasNombre.map((linea, k) => (
              <Rotulo key={k} x={8} y={cy + (k - (lineasNombre.length - 1) / 2) * 12} anclaje="start" tamano={10} fuerte>
                {linea}
              </Rotulo>
            ))}
            {/* Bigotes con sus topes. */}
            <line x1={xDe(c.min)} y1={cy} x2={xDe(c.q1)} y2={cy} stroke={estilo.trazo} strokeWidth="1.5" strokeDasharray={estilo.dasharray} />
            <line x1={xDe(c.q3)} y1={cy} x2={xDe(c.max)} y2={cy} stroke={estilo.trazo} strokeWidth="1.5" strokeDasharray={estilo.dasharray} />
            <line x1={xDe(c.min)} y1={cy - 7} x2={xDe(c.min)} y2={cy + 7} stroke={estilo.trazo} strokeWidth="1.5" />
            <line x1={xDe(c.max)} y1={cy - 7} x2={xDe(c.max)} y2={cy + 7} stroke={estilo.trazo} strokeWidth="1.5" />
            {/* Caja y mediana. */}
            <rect
              x={xDe(c.q1)}
              y={cy - MEDIA_CAJA}
              width={Math.max(0, xDe(c.q3) - xDe(c.q1))}
              height={MEDIA_CAJA * 2}
              fill={estilo.relleno}
              stroke={estilo.trazo}
              strokeWidth="1.5"
              strokeDasharray={estilo.dasharray}
            />
            <line x1={xDe(c.mediana)} y1={cy - MEDIA_CAJA} x2={xDe(c.mediana)} y2={cy + MEDIA_CAJA} stroke={estilo.trazo} strokeWidth="2.5" />
            {/* Los cinco valores. */}
            <Rotulo x={xDe(c.min)} y={cy + MEDIA_CAJA + 9} tamano={9} numero>
              {formatoNumero(c.min)}
            </Rotulo>
            <Rotulo x={xDe(c.max)} y={cy + MEDIA_CAJA + 9} tamano={9} numero>
              {formatoNumero(c.max)}
            </Rotulo>
            <Rotulo x={xs[0]} y={yArriba(nivel[0])} tamano={9} numero>
              {formatoNumero(c.q1)}
            </Rotulo>
            <Rotulo x={xs[1]} y={yArriba(nivel[1])} tamano={9} fuerte numero>
              {formatoNumero(c.mediana)}
            </Rotulo>
            <Rotulo x={xs[2]} y={yArriba(nivel[2])} tamano={9} numero>
              {formatoNumero(c.q3)}
            </Rotulo>
          </g>
        );
      })}

      {marcas.map((m, i) => (
        <g key={i}>
          <line x1={xDe(m.valor)} y1={ARRIBA - 4} x2={xDe(m.valor)} y2={yEje} stroke={TRAZO_ACENTO} strokeWidth="1.5" strokeDasharray="3 3" />
          <Rotulo x={xDe(m.valor)} y={9 + i * 11} tamano={9} fuerte acento>
            {`${m.rotulo}: ${formatoNumero(m.valor)}`}
          </Rotulo>
        </g>
      ))}
    </svg>
  );
}
