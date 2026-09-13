/**
 * Primitivas de estadística descriptiva para los módulos 14 (tablas y
 * gráficos) y 15 (medidas de posición): tablas de frecuencia, sectores
 * circulares, promedios, mediana, cuartiles, percentiles, resumen de cinco
 * números y el contrato de los cuatro bloques visuales de datos.
 *
 * Puro: sin I/O ni React. Enteros y racionales exactos donde el concepto lo
 * permite: una frecuencia relativa es una fracción reducida y la suma de las
 * fracciones de una tabla se comprueba como fracción, nunca con tolerancia
 * flotante. Los promedios sí son decimales (son cocientes), y el contenido
 * elige los datos para que salgan enteros o con un decimal.
 *
 * CONVENCIONES FIJAS DEL CURSO (las lecciones las nombran como "la que usa
 * este curso"):
 * - mediana: dato central; con n par, promedio de los dos centrales.
 * - cuartiles: Q2 es la mediana; Q1 es la mediana de la mitad inferior y Q3
 *   la de la mitad superior, EXCLUYENDO la mediana cuando n es impar.
 * - percentil k: posición p = k·n/100; si p es entero, promedio de los datos en
 *   las posiciones p y p + 1; si no, el dato en la posición ⌈p⌉.
 *
 * `cuartilesIncluyendo` y `percentilAlternativo` son ORÁCULOS DE DISEÑO, no
 * contenido: sirven para exigir que cada ítem dé el mismo resultado con las
 * dos convenciones habituales, y si difieren, se cambian los datos del ítem.
 */

// ---------- racionales exactos ----------

export type Fraccion = { num: number; den: number };

const mcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mcd(b, a % b));

/** La fracción num/den reducida y con denominador positivo. Solo enteros. */
export function racional(num: number, den: number): Fraccion {
  if (!Number.isInteger(num) || !Number.isInteger(den)) {
    throw new Error(`racional exige enteros (recibido: ${num}/${den})`);
  }
  if (den === 0) throw new Error(`denominador nulo (recibido: ${num}/${den})`);
  let n = num;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = mcd(n, d) || 1;
  return { num: n / g, den: d / g };
}

export function sumarFracciones(a: Fraccion, b: Fraccion): Fraccion {
  return racional(a.num * b.den + b.num * a.den, a.den * b.den);
}

export const mismaFraccion = (a: Fraccion, b: Fraccion): boolean => a.num * b.den === b.num * a.den;

export const valorDe = (f: Fraccion): number => f.num / f.den;

/**
 * Cuántas cifras decimales trae un número tal como se escribe en contenido
 * (12,5 tiene una; 0,25 tiene dos). Se lee del texto, no de un log10.
 */
function cifrasDecimales(n: number): number {
  const texto = String(n);
  const i = texto.indexOf(".");
  return i === -1 ? 0 : texto.length - i - 1;
}

/**
 * Suma exacta de números decimales de pocas cifras (porcentajes o ángulos
 * escritos en contenido): se escalan a enteros por la misma potencia de 10 y
 * se suman como enteros. 33,3 + 33,3 + 33,4 da 100 exacto; 0,1 + 0,2 no da
 * 0,30000000000000004.
 */
export function sumaExacta(valores: readonly number[]): number {
  const escala = 10 ** Math.max(0, ...valores.map(cifrasDecimales));
  const total = valores.reduce((s, v) => s + Math.round(v * escala), 0);
  return total / escala;
}

// ---------- tablas de frecuencia ----------

export type Dato = number | string;

export interface FilaFrecuencia<T extends Dato = Dato> {
  valor: T;
  fAbs: number;
  fRel: Fraccion;
  fRelDecimal: number;
  porcentaje: number;
}

function esListaNumerica(datos: readonly Dato[]): datos is readonly number[] {
  return datos.every((d) => typeof d === "number");
}

/**
 * Tabla de frecuencias de una lista de datos. Los valores numéricos se ordenan
 * de menor a mayor; los categóricos, por orden de primera aparición (el orden
 * en que el enunciado los nombra). La suma de `fAbs` es n y la de `fRel` es 1
 * exacto (ver `sumaFrecuenciasRelativas`).
 */
export function tablaFrecuencias<T extends Dato>(datos: readonly T[]): FilaFrecuencia<T>[] {
  if (datos.length === 0) throw new Error("tablaFrecuencias exige al menos un dato");
  const n = datos.length;
  const conteo = new Map<T, number>();
  for (const d of datos) conteo.set(d, (conteo.get(d) ?? 0) + 1);
  const valores = [...conteo.keys()];
  if (esListaNumerica(valores)) (valores as number[]).sort((a, b) => a - b);
  return valores.map((valor) => {
    const fAbs = conteo.get(valor)!;
    return {
      valor,
      fAbs,
      fRel: racional(fAbs, n),
      fRelDecimal: fAbs / n,
      porcentaje: (100 * fAbs) / n,
    };
  });
}

export const totalDeTabla = (tabla: readonly { fAbs: number }[]): number =>
  tabla.reduce((s, f) => s + f.fAbs, 0);

/** Suma exacta de las frecuencias relativas de una tabla, como fracción. Debe dar 1/1. */
export function sumaFrecuenciasRelativas(tabla: readonly { fRel: Fraccion }[]): Fraccion {
  return tabla.reduce((acc, f) => sumarFracciones(acc, f.fRel), racional(0, 1));
}

/** Frecuencia relativa de un grupo dentro de un total, como fracción reducida. */
export function frecuenciaRelativa(fAbs: number, n: number): Fraccion {
  if (!(n > 0)) throw new Error(`el total debe ser positivo (recibido: ${n})`);
  return racional(fAbs, n);
}

// ---------- gráfico circular ----------

/**
 * Ángulo del sector de un grupo con frecuencia `fAbs` sobre `n` datos:
 * fAbs/n · 360, como fracción exacta de grados y como número.
 */
export function anguloSector(fAbs: number, n: number): { exacto: Fraccion; grados: number } {
  if (!(n > 0)) throw new Error(`el total debe ser positivo (recibido: ${n})`);
  const exacto = racional(fAbs * 360, n);
  return { exacto, grados: valorDe(exacto) };
}

/** Los ángulos de todos los grupos de una tabla; suman 360 exacto. */
export function angulosDeTabla(tabla: readonly { fAbs: number }[]): number[] {
  const n = totalDeTabla(tabla);
  return tabla.map((f) => anguloSector(f.fAbs, n).grados);
}

// ---------- promedio ----------

export function media(datos: readonly number[]): number {
  if (datos.length === 0) throw new Error("media exige al menos un dato");
  return datos.reduce((s, d) => s + d, 0) / datos.length;
}

/**
 * Promedio desde una tabla de frecuencias: Σ valor · fAbs dividido por n. Es
 * el promedio ponderado; promediar los valores distintos sin ponderar es el
 * error que este cálculo existe para distinguir.
 */
export function mediaDesdeTabla(tabla: readonly { valor: number; fAbs: number }[]): number {
  const n = totalDeTabla(tabla);
  if (!(n > 0)) throw new Error("mediaDesdeTabla exige frecuencias positivas");
  return tabla.reduce((s, f) => s + f.valor * f.fAbs, 0) / n;
}

/** Promedio de la unión de grupos conocidos por su tamaño y su promedio: ponderado por n. */
export function mediaUnion(grupos: readonly { n: number; media: number }[]): number {
  const total = grupos.reduce((s, g) => s + g.n, 0);
  if (!(total > 0)) throw new Error("mediaUnion exige grupos con n positivo");
  return grupos.reduce((s, g) => s + g.n * g.media, 0) / total;
}

/**
 * El dato que falta para que n datos tengan el promedio objetivo, conocidos
 * los otros n − 1: mediaObjetivo · n − Σ conocidos.
 */
export function datoFaltante(mediaObjetivo: number, datosConocidos: readonly number[], n: number): number {
  if (datosConocidos.length !== n - 1) {
    throw new Error(`se esperan ${n - 1} datos conocidos para n = ${n} (hay ${datosConocidos.length})`);
  }
  return mediaObjetivo * n - datosConocidos.reduce((s, d) => s + d, 0);
}

// ---------- medidas de posición ----------

export function ordenar(datos: readonly number[]): number[] {
  return [...datos].sort((a, b) => a - b);
}

function medianaOrdenada(ordenados: readonly number[]): number {
  const n = ordenados.length;
  if (n === 0) throw new Error("mediana exige al menos un dato");
  const mitad = Math.floor(n / 2);
  return n % 2 === 1 ? ordenados[mitad] : (ordenados[mitad - 1] + ordenados[mitad]) / 2;
}

export function mediana(datos: readonly number[]): number {
  return medianaOrdenada(ordenar(datos));
}

export interface Cuartiles {
  q1: number;
  q2: number;
  q3: number;
}

/**
 * Cuartiles con la convención del curso: Q2 es la mediana; Q1 y Q3 son las
 * medianas de las dos mitades, y con n impar la mediana no entra en ninguna.
 * Exige al menos 4 datos: con menos no hay dos mitades que promediar.
 */
export function cuartiles(datos: readonly number[]): Cuartiles {
  const o = ordenar(datos);
  const n = o.length;
  if (n < 4) throw new Error(`cuartiles exige al menos 4 datos (hay ${n})`);
  const mitad = Math.floor(n / 2);
  const inferior = o.slice(0, mitad);
  const superior = o.slice(n % 2 === 1 ? mitad + 1 : mitad);
  return { q1: medianaOrdenada(inferior), q2: medianaOrdenada(o), q3: medianaOrdenada(superior) };
}

/**
 * ORÁCULO DE DISEÑO. Misma regla, pero con n impar la mediana entra en las dos
 * mitades. Con n par coincide con `cuartiles`. Sirve para exigir que un ítem
 * dé lo mismo con ambas convenciones antes de fijar sus datos.
 */
export function cuartilesIncluyendo(datos: readonly number[]): Cuartiles {
  const o = ordenar(datos);
  const n = o.length;
  if (n < 4) throw new Error(`cuartilesIncluyendo exige al menos 4 datos (hay ${n})`);
  const mitad = Math.floor(n / 2);
  const inferior = o.slice(0, n % 2 === 1 ? mitad + 1 : mitad);
  const superior = o.slice(mitad);
  return { q1: medianaOrdenada(inferior), q2: medianaOrdenada(o), q3: medianaOrdenada(superior) };
}

function validarK(k: number): void {
  if (!(Number.isFinite(k) && k >= 0 && k <= 100)) throw new Error(`k debe estar en [0, 100] (recibido: ${k})`);
}

/**
 * Percentil k con la convención del curso: p = k·n/100. Si p es entero,
 * promedio de los datos en las posiciones p y p + 1 (contando desde 1); si no,
 * el dato en la posición ⌈p⌉. En los bordes: k = 0 da el mínimo y k = 100 el
 * máximo (la posición n + 1 no existe, así que no hay con qué promediar).
 */
export function percentil(datos: readonly number[], k: number): number {
  validarK(k);
  const o = ordenar(datos);
  const n = o.length;
  if (n === 0) throw new Error("percentil exige al menos un dato");
  const p = (k * n) / 100;
  if (p <= 0) return o[0];
  if (p >= n) return o[n - 1];
  if (Number.isInteger(p)) return (o[p - 1] + o[p]) / 2;
  return o[Math.ceil(p) - 1];
}

/**
 * ORÁCULO DE DISEÑO. Percentil k como el dato en la posición ⌈k·n/100⌉ sin
 * promediar nunca (k = 0 da el mínimo). Mismo uso que `cuartilesIncluyendo`.
 */
export function percentilAlternativo(datos: readonly number[], k: number): number {
  validarK(k);
  const o = ordenar(datos);
  const n = o.length;
  if (n === 0) throw new Error("percentilAlternativo exige al menos un dato");
  const posicion = Math.min(n, Math.max(1, Math.ceil((k * n) / 100)));
  return o[posicion - 1];
}

export interface ResumenCincoNumeros {
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
}

export function resumenCincoNumeros(datos: readonly number[]): ResumenCincoNumeros {
  const o = ordenar(datos);
  const { q1, q2, q3 } = cuartiles(o);
  return { min: o[0], q1, mediana: q2, q3, max: o[o.length - 1] };
}

export function rangoIntercuartil(datos: readonly number[]): number {
  const { q1, q3 } = cuartiles(datos);
  return q3 - q1;
}

/** Porcentaje de los datos que son menores o iguales que `valor`. Para el máximo da 100. */
export function porcentajeBajo(datos: readonly number[], valor: number): number {
  if (datos.length === 0) throw new Error("porcentajeBajo exige al menos un dato");
  const bajo = datos.filter((d) => d <= valor).length;
  return (100 * bajo) / datos.length;
}

// ---------- contrato de los bloques visuales de datos ----------

export interface SerieDatos {
  nombre: string;
  valores: number[];
}

/**
 * Barras simples (una serie) o agrupadas (dos). El eje vertical arranca
 * SIEMPRE en 0 salvo `ejeTruncado: true`, que solo se admite en un bloque
 * marcado `ejemploEnganoso: true`: es el gráfico que la lección muestra para
 * enseñar a desconfiar, nunca un gráfico de lectura.
 */
export interface DatosGraficoBarras {
  tipo: "graficoBarras";
  categorias: string[];
  series: SerieDatos[];
  /** Rótulo del eje vertical, con su unidad ("Estudiantes", "Litros por día"). */
  ejeVertical: string;
  ejeTruncado?: boolean;
  ejemploEnganoso?: boolean;
}

/** Líneas sobre categorías ORDENADAS (meses, años, semanas). Misma regla de eje que las barras. */
export interface DatosGraficoLineas {
  tipo: "graficoLineas";
  categorias: string[];
  series: SerieDatos[];
  ejeVertical: string;
  ejeTruncado?: boolean;
  ejemploEnganoso?: boolean;
}

export interface SectorCircular {
  categoria: string;
  porcentaje?: number;
  angulo?: number;
}

/**
 * Sectores con rótulo de porcentaje o de ángulo, declarados desde el
 * contenido: el componente no calcula nada a ojo. Los porcentajes suman 100
 * exacto (o los ángulos 360), medido con `sumaExacta`.
 */
export interface DatosGraficoCircular {
  tipo: "graficoCircular";
  sectores: SectorCircular[];
  rotulo: "porcentaje" | "angulo";
}

export interface CajonResumen {
  nombre: string;
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
  /** Si vienen, el resumen declarado tiene que coincidir con `resumenCincoNumeros(datos)`. */
  datos?: number[];
}

export interface MarcaCajon {
  valor: number;
  rotulo: string;
}

/** Uno o dos cajones horizontales sobre la MISMA escala, con los cinco valores rotulados. */
export interface DatosDiagramaCajon {
  tipo: "diagramaCajon";
  cajones: CajonResumen[];
  /** Rótulo del eje horizontal, con su unidad. */
  ejeHorizontal: string;
  marcas?: MarcaCajon[];
}

export type DatosGraficoEstadistico =
  | DatosGraficoBarras
  | DatosGraficoLineas
  | DatosGraficoCircular
  | DatosDiagramaCajon;

export const TIPOS_GRAFICO_ESTADISTICO = ["graficoBarras", "graficoLineas", "graficoCircular", "diagramaCajon"] as const;
export type TipoGraficoEstadistico = (typeof TIPOS_GRAFICO_ESTADISTICO)[number];

export const MIN_CATEGORIAS = 2;
export const MAX_CATEGORIAS = 8;
export const MAX_SERIES = 2;
export const MIN_SECTORES = 2;
export const MAX_SECTORES = 6;
export const MAX_CAJONES = 2;
export const MAX_MARCAS = 2;
/** Un nombre más largo no cabe en la leyenda ni en el margen del cajón sin pisar al vecino. */
export const MAX_LARGO_NOMBRE = 18;

const esNumeroFinito = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const esTexto = (s: unknown): s is string => typeof s === "string" && s.trim().length > 0;
const esTextoCorto = (s: unknown): s is string => esTexto(s) && s.length <= MAX_LARGO_NOMBRE;

/**
 * Paso "redondo" de cuadrícula para un rango de valores: 1, 2, 5 por potencia
 * de 10, elegido para que el eje tenga entre 3 y 6 líneas. Es la cuadrícula
 * DECLARADA del gráfico: lo que no cae en una de estas líneas ni lleva rótulo
 * no puede pedirse leer.
 */
export function pasoDeCuadricula(rango: number): number {
  if (!(rango > 0)) return 1;
  let potencia = 10 ** (Math.floor(Math.log10(rango)) - 1);
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    for (const m of [1, 2, 5]) {
      const paso = m * potencia;
      if (rango / paso <= 6) return paso;
    }
    potencia *= 10;
  }
  return potencia;
}

export interface EscalaEje {
  min: number;
  max: number;
  paso: number;
}

/**
 * Escala del eje de valores de barras y líneas. Sin truncar arranca en 0 y
 * termina en el múltiplo del paso que cubre el máximo (más una línea si el
 * máximo cae justo en la última, para que el rótulo del valor tenga aire).
 * Truncado, arranca un paso por debajo del mínimo redondeado, y ese es
 * exactamente el efecto engañoso que el bloque marcado enseña a detectar.
 */
export function escalaDeValores(valores: readonly number[], ejeTruncado = false): EscalaEje {
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  if (!ejeTruncado) {
    const paso = pasoDeCuadricula(maximo || 1);
    const max = Math.ceil(maximo / paso) * paso + (maximo % paso === 0 ? paso : 0);
    return { min: 0, max, paso };
  }
  const paso = pasoDeCuadricula(maximo - minimo || 1);
  const min = Math.max(0, (Math.floor(minimo / paso) - 1) * paso);
  const max = Math.ceil(maximo / paso) * paso + (maximo % paso === 0 ? paso : 0);
  return { min, max, paso };
}

/**
 * Escala del eje horizontal de un diagrama de cajón: cubre TODOS los valores
 * (los cinco de cada cajón y las marcas) con al menos medio paso de margen a
 * cada lado, para que ningún rótulo quede fuera del cuadro.
 */
export function escalaDeCajon(datos: DatosDiagramaCajon): EscalaEje {
  const valores = [
    ...datos.cajones.flatMap((c) => [c.min, c.q1, c.mediana, c.q3, c.max]),
    ...(datos.marcas ?? []).map((m) => m.valor),
  ];
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const paso = pasoDeCuadricula(maximo - minimo || 1);
  return {
    min: Math.floor((minimo - paso / 2) / paso) * paso,
    max: Math.ceil((maximo + paso / 2) / paso) * paso,
    paso,
  };
}

function motivoRechazoSeries(d: { categorias?: unknown; series?: unknown; ejeVertical?: unknown; ejeTruncado?: unknown; ejemploEnganoso?: unknown }): string | null {
  const cats = d.categorias;
  if (!Array.isArray(cats) || cats.length < MIN_CATEGORIAS || cats.length > MAX_CATEGORIAS) {
    return `categorias debe tener entre ${MIN_CATEGORIAS} y ${MAX_CATEGORIAS} textos`;
  }
  if (!cats.every(esTextoCorto)) return `categorias: cada una es un texto no vacío de hasta ${MAX_LARGO_NOMBRE} caracteres`;
  const series = d.series;
  if (!Array.isArray(series) || series.length < 1 || series.length > MAX_SERIES) {
    return `series debe tener entre 1 y ${MAX_SERIES} series`;
  }
  for (let i = 0; i < series.length; i++) {
    const s = series[i] as Partial<SerieDatos> | null;
    if (typeof s !== "object" || s === null) return `series[${i}] debe ser un objeto { nombre, valores }`;
    if (!esTextoCorto(s.nombre)) return `series[${i}].nombre: texto no vacío de hasta ${MAX_LARGO_NOMBRE} caracteres`;
    if (!Array.isArray(s.valores) || s.valores.length !== cats.length) {
      return `series[${i}].valores debe traer exactamente un número por categoría (${cats.length})`;
    }
    if (!s.valores.every((v) => esNumeroFinito(v) && v >= 0)) return `series[${i}].valores: todos deben ser números no negativos`;
  }
  if (!esTexto(d.ejeVertical)) return "ejeVertical (rótulo del eje con su unidad) es obligatorio";
  if (d.ejeTruncado !== undefined && typeof d.ejeTruncado !== "boolean") return "ejeTruncado debe ser booleano";
  if (d.ejemploEnganoso !== undefined && typeof d.ejemploEnganoso !== "boolean") return "ejemploEnganoso debe ser booleano";
  if (d.ejeTruncado === true && d.ejemploEnganoso !== true) {
    return "ejeTruncado solo se admite en un bloque marcado ejemploEnganoso: true";
  }
  const todos = (series as SerieDatos[]).flatMap((s) => s.valores);
  if (d.ejeTruncado === true && Math.max(...todos) === Math.min(...todos)) {
    return "ejeTruncado no tiene sentido con todos los valores iguales";
  }
  return null;
}

function motivoRechazoCircular(d: { sectores?: unknown; rotulo?: unknown }): string | null {
  const sectores = d.sectores;
  if (!Array.isArray(sectores) || sectores.length < MIN_SECTORES || sectores.length > MAX_SECTORES) {
    return `sectores debe tener entre ${MIN_SECTORES} y ${MAX_SECTORES} sectores`;
  }
  if (d.rotulo !== "porcentaje" && d.rotulo !== "angulo") return 'rotulo debe ser "porcentaje" o "angulo"';
  const clave = d.rotulo;
  for (let i = 0; i < sectores.length; i++) {
    const s = sectores[i] as Partial<SectorCircular> | null;
    if (typeof s !== "object" || s === null) return `sectores[${i}] debe ser un objeto`;
    if (!esTextoCorto(s.categoria)) return `sectores[${i}].categoria: texto no vacío de hasta ${MAX_LARGO_NOMBRE} caracteres`;
    if (!(esNumeroFinito(s[clave]) && s[clave]! > 0)) return `sectores[${i}].${clave} debe ser un número positivo (es el rótulo declarado)`;
    for (const otra of ["porcentaje", "angulo"] as const) {
      if (s[otra] !== undefined && !(esNumeroFinito(s[otra]) && s[otra]! > 0)) return `sectores[${i}].${otra}: si está, es un número positivo`;
    }
  }
  const lista = sectores as SectorCircular[];
  if (lista.every((s) => s.porcentaje !== undefined)) {
    const suma = sumaExacta(lista.map((s) => s.porcentaje!));
    if (suma !== 100) return `los porcentajes suman ${suma}, no 100`;
  }
  if (lista.every((s) => s.angulo !== undefined)) {
    const suma = sumaExacta(lista.map((s) => s.angulo!));
    if (suma !== 360) return `los ángulos suman ${suma}, no 360`;
  }
  return null;
}

function motivoRechazoCajon(d: { cajones?: unknown; ejeHorizontal?: unknown; marcas?: unknown }): string | null {
  const cajones = d.cajones;
  if (!Array.isArray(cajones) || cajones.length < 1 || cajones.length > MAX_CAJONES) {
    return `cajones debe tener entre 1 y ${MAX_CAJONES} cajones`;
  }
  for (let i = 0; i < cajones.length; i++) {
    const c = cajones[i] as Partial<CajonResumen> | null;
    if (typeof c !== "object" || c === null) return `cajones[${i}] debe ser un objeto`;
    if (!esTextoCorto(c.nombre)) return `cajones[${i}].nombre: texto no vacío de hasta ${MAX_LARGO_NOMBRE} caracteres`;
    const cinco = [c.min, c.q1, c.mediana, c.q3, c.max];
    if (!cinco.every(esNumeroFinito)) return `cajones[${i}]: min, q1, mediana, q3 y max son números obligatorios`;
    const [min, q1, mediana, q3, max] = cinco as number[];
    if (!(min <= q1 && q1 <= mediana && mediana <= q3 && q3 <= max)) {
      return `cajones[${i}]: se exige min ≤ q1 ≤ mediana ≤ q3 ≤ max (recibido ${min}, ${q1}, ${mediana}, ${q3}, ${max})`;
    }
    if (min === max) return `cajones[${i}]: todos los valores iguales, no hay cajón que dibujar`;
    if (c.datos !== undefined) {
      if (!Array.isArray(c.datos) || c.datos.length < 4 || !c.datos.every(esNumeroFinito)) {
        return `cajones[${i}].datos: si vienen, son al menos 4 números`;
      }
      const r = resumenCincoNumeros(c.datos);
      if (r.min !== min || r.q1 !== q1 || r.mediana !== mediana || r.q3 !== q3 || r.max !== max) {
        return `cajones[${i}]: el resumen declarado (${min}, ${q1}, ${mediana}, ${q3}, ${max}) no coincide con el de los datos (${r.min}, ${r.q1}, ${r.mediana}, ${r.q3}, ${r.max})`;
      }
    }
  }
  if (!esTexto(d.ejeHorizontal)) return "ejeHorizontal (rótulo del eje con su unidad) es obligatorio";
  if (d.marcas !== undefined) {
    if (!Array.isArray(d.marcas) || d.marcas.length > MAX_MARCAS) return `marcas: hasta ${MAX_MARCAS} datos individuales`;
    for (let i = 0; i < d.marcas.length; i++) {
      const m = d.marcas[i] as Partial<MarcaCajon> | null;
      if (typeof m !== "object" || m === null || !esNumeroFinito(m.valor) || !esTextoCorto(m.rotulo)) {
        return `marcas[${i}] debe ser { valor: número, rotulo: texto corto }`;
      }
    }
  }
  return null;
}

/**
 * Lo que rechaza un bloque de visualización de datos, o `null` si se puede
 * dibujar. Mismo doble uso que `motivoRechazoDatosSemejanza`: lo llama
 * `scripts/validar-contenido.mjs` y el type guard de
 * `components/bloques/BloqueVisualizacion.tsx`, así que un JSON que pasa el
 * validador se dibuja, y uno que no, cae al `<figure>` de texto.
 */
export function motivoRechazoDatosGrafico(datos: unknown): string | null {
  const d = datos as { tipo?: unknown } | null;
  if (typeof d !== "object" || d === null) return "datos debe ser un objeto";
  switch (d.tipo) {
    case "graficoBarras":
    case "graficoLineas":
      return motivoRechazoSeries(d as DatosGraficoBarras);
    case "graficoCircular":
      return motivoRechazoCircular(d as DatosGraficoCircular);
    case "diagramaCajon":
      return motivoRechazoCajon(d as DatosDiagramaCajon);
    default:
      return `tipo debe ser uno de: ${TIPOS_GRAFICO_ESTADISTICO.join(", ")}`;
  }
}

export function esTipoGraficoEstadistico(tipo: unknown): tipo is TipoGraficoEstadistico {
  return TIPOS_GRAFICO_ESTADISTICO.includes(tipo as TipoGraficoEstadistico);
}
