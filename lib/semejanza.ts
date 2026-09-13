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

// ---------- contrato del bloque de visualización { tipo: "semejanza" } ----------

export interface FiguraSemejanza {
  vertices: Punto[];
  /** Una cota por lado, en el orden vértice i → vértice i + 1. Todas van rotuladas. */
  cotas: string[];
  rotulos?: string[];
}

export interface DatosSemejanzaLadoALado {
  tipo: "semejanza";
  disposicion: "ladoALado";
  original: FiguraSemejanza;
  k: number;
  imagen: { cotas: string[]; rotulos?: string[] };
}

export interface TrianguloAnidado {
  horizontal: number;
  vertical: number;
  etiquetaHorizontal: string;
  etiquetaVertical: string;
}

/**
 * Dos triángulos rectángulos que comparten el vértice agudo del extremo de la
 * sombra: el grande (poste y su sombra) y el chico (persona y su sombra)
 * apoyados en el mismo suelo. Solo se dibuja si son semejantes de verdad,
 * o sea si vertical/horizontal coincide en los dos.
 */
export interface DatosSemejanzaAnidada {
  tipo: "semejanza";
  disposicion: "anidada";
  grande: TrianguloAnidado;
  chica: TrianguloAnidado;
}

export type DatosSemejanzaEscena = DatosSemejanzaLadoALado | DatosSemejanzaAnidada;

export const DISPOSICIONES_VALIDAS = ["ladoALado", "anidada"] as const;
export const MIN_VERTICES_SEMEJANZA = 3;
export const MAX_VERTICES_SEMEJANZA = 5;

/** Mismo viewBox que las figuras y los cuerpos: 240 × 200 con margen 28. */
export const VIEW_BOX_SEMEJANZA = { ancho: 240, alto: 200, margen: 28 } as const;
/**
 * Separación entre las dos figuras lado a lado, como fracción del ancho sumado
 * de ambas. Con 0,12 las cotas de los lados enfrentados se pisaban (medido el
 * 2026-09-13 en /vista-previa/semejanza); 0,35 deja sitio a las dos.
 */
export const SEPARACION_RELATIVA = 0.35;
/** Alto reservado bajo el suelo de la disposición anidada para la línea de cota de la base grande. */
export const RESERVA_COTA_INFERIOR = 34;
/** Mismo umbral que `ARISTA_MINIMA_PX` de los cuerpos: bajo 14 px una cota pisa a la vecina. */
export const LADO_MINIMO_PX = 14;

const esNumeroFinito = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const esPuntoFinito = (p: unknown): p is Punto =>
  Array.isArray(p) && p.length === 2 && esNumeroFinito(p[0]) && esNumeroFinito(p[1]);
const esTexto = (s: unknown): s is string => typeof s === "string" && s.length > 0;

export function extension(fig: Poligono) {
  const xs = fig.map((p) => p[0]);
  const ys = fig.map((p) => p[1]);
  return { ancho: Math.max(...xs) - Math.min(...xs), alto: Math.max(...ys) - Math.min(...ys) };
}

/**
 * Píxeles por unidad con que se dibujan las dos figuras lado a lado, un solo
 * factor para ambas para que la razón se vea. Es la misma cuenta que hace el
 * componente; vive acá para que el rechazo por legibilidad se decida con los
 * números reales y no con una estimación.
 */
export function escalaLadoALado(original: Poligono, k: number): number {
  const imagen = escalarPoligono(original, k);
  const a = extension(original);
  const b = extension(imagen);
  const anchoDatos = (a.ancho + b.ancho) * (1 + SEPARACION_RELATIVA);
  const altoDatos = Math.max(a.alto, b.alto);
  const areaAncho = VIEW_BOX_SEMEJANZA.ancho - VIEW_BOX_SEMEJANZA.margen * 2;
  const areaAlto = VIEW_BOX_SEMEJANZA.alto - VIEW_BOX_SEMEJANZA.margen * 2;
  return Math.min(areaAncho / (anchoDatos || 1), areaAlto / (altoDatos || 1));
}

export function ladoMasCorto(fig: Poligono): number {
  let minimo = Infinity;
  for (let i = 0; i < fig.length; i++) {
    const [x1, y1] = fig[i];
    const [x2, y2] = fig[(i + 1) % fig.length];
    minimo = Math.min(minimo, Math.hypot(x2 - x1, y2 - y1));
  }
  return minimo;
}

/** Píxeles por unidad de la disposición anidada: el triángulo grande llena el área útil, menos la reserva de la cota inferior. */
export function escalaAnidada(grande: TrianguloAnidado): number {
  const areaAncho = VIEW_BOX_SEMEJANZA.ancho - VIEW_BOX_SEMEJANZA.margen * 2;
  const areaAlto = VIEW_BOX_SEMEJANZA.alto - VIEW_BOX_SEMEJANZA.margen * 2 - RESERVA_COTA_INFERIOR;
  return Math.min(areaAncho / grande.horizontal, areaAlto / grande.vertical);
}

function motivoRechazoFigura(f: unknown, nombre: string): string | null {
  const d = f as Partial<FiguraSemejanza> | null;
  if (typeof d !== "object" || d === null) return `${nombre} debe ser un objeto`;
  const v = d.vertices;
  if (!Array.isArray(v) || v.length < MIN_VERTICES_SEMEJANZA || v.length > MAX_VERTICES_SEMEJANZA) {
    return `${nombre}.vertices debe tener entre ${MIN_VERTICES_SEMEJANZA} y ${MAX_VERTICES_SEMEJANZA} puntos`;
  }
  if (!v.every(esPuntoFinito)) return `${nombre}.vertices: todos los puntos deben ser pares de números`;
  if (area(v) === 0) return `${nombre}.vertices: los puntos están alineados, no forman una figura`;
  if (!Array.isArray(d.cotas) || d.cotas.length !== v.length || !d.cotas.every(esTexto)) {
    return `${nombre}.cotas debe traer exactamente un texto no vacío por lado (${v.length})`;
  }
  if (
    d.rotulos !== undefined &&
    (!Array.isArray(d.rotulos) || d.rotulos.length !== v.length || !d.rotulos.every(esTexto))
  ) {
    return `${nombre}.rotulos debe traer exactamente un texto no vacío por vértice (${v.length})`;
  }
  return null;
}

function motivoRechazoTrianguloAnidado(t: unknown, nombre: string): string | null {
  const d = t as Partial<TrianguloAnidado> | null;
  if (typeof d !== "object" || d === null) return `${nombre} debe ser un objeto`;
  if (!(esNumeroFinito(d.horizontal) && d.horizontal > 0) || !(esNumeroFinito(d.vertical) && d.vertical > 0)) {
    return `${nombre}: horizontal y vertical deben ser números positivos`;
  }
  if (!esTexto(d.etiquetaHorizontal) || !esTexto(d.etiquetaVertical)) {
    return `${nombre}: etiquetaHorizontal y etiquetaVertical son obligatorias`;
  }
  return null;
}

/**
 * Lo que rechaza un bloque `{ tipo: "semejanza" }` de contenido, o `null` si
 * se puede dibujar. Mismo contrato y mismo doble uso que
 * `motivoRechazoDatosTransformacion`: validador y type guard llaman acá.
 *
 * En la disposición anidada se exige que los dos triángulos sean semejantes de
 * verdad (misma razón vertical/horizontal, comparada como fracción exacta):
 * un dibujo donde el rayo del sol no pasa por la cabeza de la persona
 * enseñaría lo contrario de lo que el bloque quiere enseñar.
 */
export function motivoRechazoDatosSemejanza(datos: unknown): string | null {
  const d = datos as {
    tipo?: unknown;
    disposicion?: unknown;
    original?: unknown;
    k?: unknown;
    imagen?: unknown;
    grande?: unknown;
    chica?: unknown;
  } | null;
  if (typeof d !== "object" || d === null || d.tipo !== "semejanza") return 'tipo debe ser "semejanza"';
  if (d.disposicion === "ladoALado") {
    const motivoOriginal = motivoRechazoFigura(d.original, "original");
    if (motivoOriginal) return motivoOriginal;
    const original = d.original as FiguraSemejanza;
    if (!(esNumeroFinito(d.k) && d.k > 0)) return "k debe ser un número positivo";
    const k = d.k;
    const img = d.imagen as Partial<DatosSemejanzaLadoALado["imagen"]> | undefined;
    const n = original.vertices.length;
    if (typeof img !== "object" || img === null) return "imagen debe ser un objeto con sus cotas";
    if (!Array.isArray(img.cotas) || img.cotas.length !== n || !img.cotas.every(esTexto)) {
      return `imagen.cotas debe traer exactamente un texto no vacío por lado (${n})`;
    }
    if (
      img.rotulos !== undefined &&
      (!Array.isArray(img.rotulos) || img.rotulos.length !== n || !img.rotulos.every(esTexto))
    ) {
      return `imagen.rotulos debe traer exactamente un texto no vacío por vértice (${n})`;
    }
    const escala = escalaLadoALado(original.vertices, k);
    const corto =
      Math.min(ladoMasCorto(original.vertices), ladoMasCorto(escalarPoligono(original.vertices, k))) * escala;
    if (corto < LADO_MINIMO_PX) {
      return `el lado más corto mediría ${corto.toFixed(1)} px en pantalla y no admite su cota (mínimo ${LADO_MINIMO_PX} px)`;
    }
    return null;
  }
  if (d.disposicion === "anidada") {
    const mg = motivoRechazoTrianguloAnidado(d.grande, "grande");
    if (mg) return mg;
    const mc = motivoRechazoTrianguloAnidado(d.chica, "chica");
    if (mc) return mc;
    const g = d.grande as TrianguloAnidado;
    const c = d.chica as TrianguloAnidado;
    if (!(c.horizontal < g.horizontal && c.vertical < g.vertical)) {
      return "chica debe ser menor que grande en las dos medidas";
    }
    if (!mismaFraccion(fraccion(c.vertical, c.horizontal), fraccion(g.vertical, g.horizontal))) {
      return `los triángulos no son semejantes: ${c.vertical}/${c.horizontal} no es igual a ${g.vertical}/${g.horizontal}`;
    }
    const escala = escalaAnidada(g);
    const corto = Math.min(c.horizontal, c.vertical, g.horizontal - c.horizontal) * escala;
    if (corto < LADO_MINIMO_PX) {
      return `el tramo más corto mediría ${corto.toFixed(1)} px en pantalla y no admite su cota (mínimo ${LADO_MINIMO_PX} px)`;
    }
    return null;
  }
  return `disposicion debe ser una de: ${DISPOSICIONES_VALIDAS.join(", ")}`;
}
