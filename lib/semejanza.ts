/**
 * Primitivas de semejanza de figuras: escalar un polígono, razón de
 * semejanza, factores de perímetro y área, y el criterio de lados
 * proporcionales entre triángulos.
 *
 * Puro: sin I/O ni React. Comparte las tuplas `[x, y]` de
 * `lib/transformacionesIsometricas.ts` porque las dos librerías alimentan al
 * mismo plano y al mismo contenido; una semejanza es una isometría más una
 * homotecia, y conviene que hablen el mismo idioma.
 *
 * Las razones se comparan como fracciones exactas, nunca con tolerancia
 * flotante: 6/4 y 9/6 son la misma razón porque 6·6 = 9·4, no porque
 * 1.5 − 1.5 sea "chico". Con lados enteros el criterio es exacto; con lados
 * decimales se escala a enteros antes de comparar.
 */

import type { Poligono, Punto } from "./transformacionesIsometricas.ts";

export type Fraccion = { numerador: number; denominador: number };

const mcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mcd(b, a % b));

/**
 * Cuántas cifras decimales trae un número escrito en contenido. Se lee del
 * texto y no de un log10, para que 1,5 dé 1 y 0,25 dé 2 sin sorpresas.
 */
function cifrasDecimales(n: number): number {
  const texto = String(n);
  const i = texto.indexOf(".");
  return i === -1 ? 0 : texto.length - i - 1;
}

/**
 * La fracción a/b reducida y con denominador positivo. Admite a y b decimales
 * de pocas cifras (las medidas de un enunciado, como 7,5 cm) escalándolos a
 * enteros por la misma potencia de 10.
 */
export function fraccion(a: number, b: number): Fraccion {
  if (!(b !== 0)) throw new Error(`denominador nulo (recibido: ${a}/${b})`);
  const escala = 10 ** Math.max(cifrasDecimales(a), cifrasDecimales(b));
  let n = Math.round(a * escala);
  let d = Math.round(b * escala);
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = mcd(n, d) || 1;
  return { numerador: n / g, denominador: d / g };
}

export const mismaFraccion = (p: Fraccion, q: Fraccion): boolean =>
  p.numerador * q.denominador === q.numerador * p.denominador;

/** Razón de semejanza k = lado de la imagen / lado homólogo de la original. */
export function razon(ladoImagen: number, ladoOriginal: number): Fraccion {
  if (!(ladoImagen > 0) || !(ladoOriginal > 0)) {
    throw new Error(`los lados deben ser positivos (recibido: ${ladoImagen}, ${ladoOriginal})`);
  }
  return fraccion(ladoImagen, ladoOriginal);
}

export const valorDe = (f: Fraccion): number => f.numerador / f.denominador;

/** Con razón k, el perímetro se multiplica por k y el área por k². */
export function factores(k: number): { perimetro: number; area: number } {
  if (!(k > 0)) throw new Error(`k debe ser positivo (recibido: ${k})`);
  return { perimetro: k, area: k * k };
}

/**
 * Homotecia de razón k desde `centro` (el origen por defecto): cada vértice
 * se aleja del centro k veces. Con k entero y vértices enteros, la imagen es
 * entera; con k = 1/2 o 3/2 lo es solo si las coordenadas relativas al centro
 * son pares, y eso lo decide quien escribe el contenido.
 */
export function escalarPoligono(fig: Poligono, k: number, centro: Punto = [0, 0]): Poligono {
  if (!(k > 0)) throw new Error(`k debe ser positivo (recibido: ${k})`);
  return fig.map(([x, y]) => [centro[0] + k * (x - centro[0]), centro[1] + k * (y - centro[1])]);
}

export function perimetro(fig: Poligono): number {
  let total = 0;
  for (let i = 0; i < fig.length; i++) {
    const [x1, y1] = fig[i];
    const [x2, y2] = fig[(i + 1) % fig.length];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  return total;
}

export function area(fig: Poligono): number {
  let acumulado = 0;
  for (let i = 0; i < fig.length; i++) {
    const [x1, y1] = fig[i];
    const [x2, y2] = fig[(i + 1) % fig.length];
    acumulado += x1 * y2 - x2 * y1;
  }
  return Math.abs(acumulado) / 2;
}

/**
 * Empareja los lados de dos figuras por tamaño: el mayor con el mayor, el
 * menor con el menor. Es el emparejamiento correcto cuando las figuras son
 * semejantes, y el que no se hace cuando se comparan lados al azar.
 */
export function ladosHomologos(
  ladosA: readonly number[],
  ladosB: readonly number[],
): [number, number][] {
  if (ladosA.length !== ladosB.length) {
    throw new Error(`las figuras tienen distinto número de lados (${ladosA.length} y ${ladosB.length})`);
  }
  const a = [...ladosA].sort((p, q) => p - q);
  const b = [...ladosB].sort((p, q) => p - q);
  return a.map((lado, i) => [lado, b[i]]);
}

/**
 * Criterio LLL: dos triángulos son semejantes si las tres razones entre lados
 * homólogos coinciden exactamente. Devuelve la razón común (imagen/original,
 * con `triB` como imagen) o `null` si alguna difiere.
 */
export function sonSemejantesPorLados(
  triA: readonly [number, number, number],
  triB: readonly [number, number, number],
): Fraccion | null {
  for (const l of [...triA, ...triB]) {
    if (!(l > 0)) throw new Error(`los lados deben ser positivos (recibido: ${l})`);
  }
  const pares = ladosHomologos(triA, triB);
  const razones = pares.map(([a, b]) => razon(b, a));
  return razones.every((r) => mismaFraccion(r, razones[0])) ? razones[0] : null;
}
