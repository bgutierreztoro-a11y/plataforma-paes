import type {
  EjeValores,
  FiguraGraficoBarras,
  FiguraGraficoCircular,
  FiguraGraficoLineas,
  FiguraHistograma,
  FiguraTablaDatos,
  ModoEtiquetaCircular,
} from "./descarte.ts";
import { formatoMarca, marcasDeEje } from "./planoFuncion.ts";
import { TEXTOS_ADVANCE } from "./textos.ts";

/**
 * Motor de las figuras de datos (tabla-datos, grafico-barras, histograma,
 * grafico-lineas, grafico-circular): la geometría y el texto que los
 * componentes de components/advance/figuras/ solo pintan. Puro, sin React y
 * sin DOM, para que node --test lo cubra directo.
 *
 * Las marcas del eje numérico salen del mismo Heckbert que el plano de función
 * (`marcasDeEje`, `formatoMarca` en lib/advance/planoFuncion.ts): un ítem con
 * un gráfico de barras y otro con una parábola escriben sus ejes igual.
 */

const T = TEXTOS_ADVANCE.figura;

/** Número en es-CL con signo menos Unicode y hasta 3 decimales. */
export const num = (v: number) => v.toLocaleString("es-CL", { maximumFractionDigits: 3 }).replace(/^-/, "−");

/* ---------- eje numérico ---------- */

export interface EjeResuelto {
  min: number;
  max: number;
  paso: number;
  /** Marcas dentro de [min, max], crecientes. */
  marcas: number[];
}

const redondear = (v: number, paso: number) => {
  let d = 0;
  while (d < 6 && Number(paso.toFixed(d)) !== paso) d++;
  return Number(v.toFixed(d)) + 0;
};

/**
 * El eje y de barras, histograma y líneas. Lo declarado en `ejeY` manda; lo
 * que falta se calcula desde los datos con números redondos. El 0 siempre
 * entra (las barras nacen del 0) y un eje degenerado (todos los valores
 * iguales a 0) se abre a [0, 1] para no dividir por cero.
 */
export function ejeResuelto(valores: number[], eje: EjeValores, objetivo = 5): EjeResuelto {
  const datoMin = Math.min(0, ...valores);
  const datoMax = Math.max(0, ...valores);
  let lo = eje.min ?? datoMin;
  let hi = eje.max ?? datoMax;
  if (hi - lo < 1e-9) hi = lo + 1;

  /* Aire: si el extremo automático coincide con el dato más alto (o más bajo,
     bajo 0), la barra tocaría el borde; se abre un paso más. */
  const conAire = (min: number, max: number, paso: number): [number, number] => [
    eje.min === undefined && min < 0 && min - datoMin > -1e-9 ? redondear(min - paso, paso) : min,
    eje.max === undefined && max - datoMax < 1e-9 ? redondear(max + paso, paso) : max,
  ];

  if (eje.paso !== undefined) {
    const paso = eje.paso;
    if (eje.min === undefined) lo = redondear(Math.floor(lo / paso + 1e-9) * paso, paso);
    if (eje.max === undefined) hi = redondear(Math.ceil(hi / paso - 1e-9) * paso, paso);
    [lo, hi] = conAire(lo, hi, paso);
    const marcas: number[] = [];
    for (let i = Math.ceil(lo / paso - 1e-9); i <= Math.floor(hi / paso + 1e-9); i++) marcas.push(redondear(i * paso, paso));
    return { min: lo, max: hi, paso, marcas };
  }

  const { paso, marcas } = marcasDeEje(lo, hi, objetivo);
  const [min, max] = conAire(eje.min ?? marcas[0], eje.max ?? marcas[marcas.length - 1], paso);
  const todas = [...marcas];
  if (todas[0] > min) todas.unshift(min);
  if (todas[todas.length - 1] < max) todas.push(max);
  return { min, max, paso, marcas: todas.filter((m) => m >= min - 1e-9 && m <= max + 1e-9) };
}

/** Rótulo de una marca del eje, con los decimales del paso. */
export const rotuloMarca = (valor: number, eje: EjeResuelto) => formatoMarca(valor, eje.paso);

/* ---------- histograma ---------- */

/** Marca de clase de cada intervalo: el punto medio. Es donde va el polígono de frecuencias. */
export const marcasDeClase = (intervalos: FiguraHistograma["intervalos"]) => intervalos.map((it) => (it.desde + it.hasta) / 2);

/* ---------- gráfico circular ---------- */

export interface SectorResuelto {
  etiqueta: string;
  valor: number;
  /** 100 · valor / total, sin redondear. */
  porcentaje: number;
  /** 360 · valor / total, sin redondear. */
  angulo: number;
  /** Ángulo inicial y final en grados, desde las 12 en punto y en sentido horario. */
  inicio: number;
  fin: number;
}

export function sectoresResueltos(sectores: FiguraGraficoCircular["sectores"]): SectorResuelto[] {
  const total = sectores.reduce((s, x) => s + x.valor, 0);
  let acumulado = 0;
  return sectores.map((s) => {
    const angulo = (360 * s.valor) / total;
    const inicio = acumulado;
    acumulado += angulo;
    return { etiqueta: s.etiqueta, valor: s.valor, porcentaje: (100 * s.valor) / total, angulo, inicio, fin: acumulado };
  });
}

/** El texto del sector según el modo: "25 %", "12", "90°" o nada. La etiqueta va aparte. */
export function textoDeSector(s: SectorResuelto, modo: ModoEtiquetaCircular): string | null {
  switch (modo) {
    case "porcentaje":
      return `${num(s.porcentaje)} %`;
    case "valor":
      return num(s.valor);
    case "angulo":
      return `${num(s.angulo)}°`;
    case "ninguno":
      return null;
  }
}

/** Punto sobre la circunferencia: grados desde las 12 en punto, sentido horario. */
export function puntoPolar(cx: number, cy: number, r: number, grados: number): { x: number; y: number } {
  const rad = ((grados - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Path cerrado del sector [inicio, fin] en grados. Un sector de 360° se dibuja como dos mitades. */
export function pathSector(cx: number, cy: number, r: number, inicio: number, fin: number): string {
  const barrido = fin - inicio;
  if (barrido >= 360 - 1e-9) {
    const a = puntoPolar(cx, cy, r, 0);
    const b = puntoPolar(cx, cy, r, 180);
    return `M ${a.x} ${a.y} A ${r} ${r} 0 1 1 ${b.x} ${b.y} A ${r} ${r} 0 1 1 ${a.x} ${a.y} Z`;
  }
  const a = puntoPolar(cx, cy, r, inicio);
  const b = puntoPolar(cx, cy, r, fin);
  const arcoLargo = barrido > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${arcoLargo} 1 ${b.x} ${b.y} Z`;
}

/* ---------- texto alternativo, generado desde los datos ---------- */

/** "A 12, B 15, C 9", una serie. */
const listaDeValores = (categorias: string[], valores: number[]) => categorias.map((c, i) => `${c} ${num(valores[i])}`).join(", ");

function seriesEnTexto(cabeza: string, figura: FiguraGraficoBarras | FiguraGraficoLineas): string {
  const { categorias, series, ejeX, ejeY } = figura;
  const cuerpo =
    series.length === 1
      ? listaDeValores(categorias, series[0].valores)
      : series.map((s) => `${s.nombre ?? T.serieUnica}: ${listaDeValores(categorias, s.valores)}`).join(". ");
  return `${cabeza}, ${T.porCategoria(ejeY.etiqueta, ejeX.etiqueta)}: ${cuerpo}.`;
}

export const ariaLabelBarras = (figura: FiguraGraficoBarras) => seriesEnTexto(T.barras, figura);
export const ariaLabelLineas = (figura: FiguraGraficoLineas) => seriesEnTexto(T.lineas, figura);

export function ariaLabelHistograma(figura: FiguraHistograma): string {
  const { intervalos, frecuencias, ejeX, ejeY } = figura;
  const cuerpo = intervalos.map((it, i) => `${T.intervalo(num(it.desde), num(it.hasta))} ${num(frecuencias[i])}`).join(", ");
  return `${T.histograma}, ${T.porCategoria(ejeY.etiqueta, ejeX.etiqueta)}: ${cuerpo}.`;
}

/**
 * En modo ninguno solo se nombran los sectores en orden: el lector de pantalla
 * recibe lo mismo que ve el estudiante, no las cifras que el ítem esconde.
 */
export function ariaLabelCircular(figura: FiguraGraficoCircular): string {
  const sectores = sectoresResueltos(figura.sectores);
  const cuerpo = sectores.map((s) => [s.etiqueta, textoDeSector(s, figura.modoEtiqueta)].filter(Boolean).join(" ")).join(", ");
  return `${T.circular}: ${cuerpo}.`;
}

/** Caption de la tabla: el título si viene, y si no la cabeza genérica. La tabla es su propio texto alternativo. */
export const captionTablaDatos = (figura: FiguraTablaDatos) => figura.titulo ?? T.tablaDatos;
