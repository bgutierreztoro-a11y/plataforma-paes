/**
 * Primitivas de probabilidad para el módulo 16 (reglas de las probabilidades):
 * fracciones exactas, regla de Laplace, complemento, espacios producto, reglas
 * aditiva y multiplicativa, árboles con y sin reposición, tablas de doble
 * entrada, frecuencia relativa, y el contrato de los dos bloques visuales del
 * módulo (diagrama de árbol y cuadrícula del espacio muestral).
 *
 * Puro: sin I/O ni React. TODA la aritmética es exacta sobre racionales: una
 * probabilidad es una `Fraccion` irreducible con denominador positivo, y dos
 * probabilidades se comparan por producto cruzado, nunca con tolerancia
 * flotante. `aDecimal` y `aPorcentaje` existen solo para mostrar; el contenido
 * elige los datos para que esos decimales sean finitos y cortos.
 *
 * Fuera de alcance, a propósito (docs/diseno-modulo-reglas-de-probabilidades.md):
 * probabilidad condicional como tema, combinatoria (factorial, C(n, k)),
 * variable aleatoria, distribuciones. Lo "sin reposición" se modela SOLO como
 * árbol donde el total y los favorables bajan de etapa a etapa.
 */

// ---------- racionales exactos ----------

export type Fraccion = { num: number; den: number };

export function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** La fracción num/den reducida y con denominador positivo. Solo enteros. */
export function frac(num: number, den: number): Fraccion {
  if (!Number.isInteger(num) || !Number.isInteger(den)) {
    throw new Error(`frac exige enteros (recibido: ${num}/${den})`);
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

export const simplificar = (f: Fraccion): Fraccion => frac(f.num, f.den);

export const igual = (a: Fraccion, b: Fraccion): boolean => a.num * b.den === b.num * a.den;

/** −1 si a < b, 0 si son iguales, 1 si a > b. Producto cruzado, sin decimales. */
export function comparar(a: Fraccion, b: Fraccion): -1 | 0 | 1 {
  const izq = a.num * b.den;
  const der = b.num * a.den;
  return izq < der ? -1 : izq > der ? 1 : 0;
}

export const aDecimal = (f: Fraccion): number => f.num / f.den;

export const aPorcentaje = (f: Fraccion): number => (100 * f.num) / f.den;

/** "3/8", "1" o "0": la forma en que el contenido escribe una probabilidad. */
export function aTexto(f: Fraccion): string {
  const r = simplificar(f);
  return r.den === 1 ? String(r.num) : `${r.num}/${r.den}`;
}

/**
 * Lee una probabilidad tal como aparece en una alternativa o en el rótulo de
 * una rama: "3/8", "1", "0", "0,25", "0.375", "25 %", "12,5 %". Devuelve null
 * si el texto no es ninguna de esas formas. Decimales y porcentajes se
 * convierten por su escritura (cifras decimales contadas en el texto), así que
 * "0,375" es exactamente 3/8 y no un flotante cercano.
 */
export function fraccionDesdeTexto(texto: string): Fraccion | null {
  const t = String(texto).trim().replace(/\s+/g, " ");
  const fraccion = t.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fraccion) {
    const den = Number(fraccion[2]);
    return den === 0 ? null : frac(Number(fraccion[1]), den);
  }
  const decimal = t.match(/^(-?\d+)(?:[.,](\d+))?\s*(%)?$/);
  if (!decimal) return null;
  const entero = decimal[1];
  const cifras = decimal[2] ?? "";
  const escala = 10 ** cifras.length;
  const num = Number(entero) * escala + (entero.startsWith("-") ? -1 : 1) * Number(cifras || "0");
  return decimal[3] ? frac(num, escala * 100) : frac(num, escala);
}

export const sumar = (a: Fraccion, b: Fraccion): Fraccion =>
  frac(a.num * b.den + b.num * a.den, a.den * b.den);

export const restar = (a: Fraccion, b: Fraccion): Fraccion =>
  frac(a.num * b.den - b.num * a.den, a.den * b.den);

export const multiplicar = (a: Fraccion, b: Fraccion): Fraccion => frac(a.num * b.num, a.den * b.den);

export const CERO: Fraccion = { num: 0, den: 1 };
export const UNO: Fraccion = { num: 1, den: 1 };

export function sumarTodas(lista: readonly Fraccion[]): Fraccion {
  return lista.reduce((acc, f) => sumar(acc, f), CERO);
}

/** ¿Es una probabilidad? Entre 0 y 1 inclusive. */
export const esProbabilidad = (f: Fraccion): boolean => f.den > 0 && f.num >= 0 && f.num <= f.den;

// ---------- Laplace y complemento ----------

/** Casos favorables sobre casos posibles, cuando los posibles son igualmente probables. */
export function laplace(favorables: number, posibles: number): Fraccion {
  if (!Number.isInteger(favorables) || !Number.isInteger(posibles)) {
    throw new Error(`laplace exige conteos enteros (recibido: ${favorables}/${posibles})`);
  }
  if (posibles <= 0) throw new Error(`los casos posibles deben ser positivos (recibido: ${posibles})`);
  if (favorables < 0 || favorables > posibles) {
    throw new Error(`los favorables deben estar entre 0 y ${posibles} (recibido: ${favorables})`);
  }
  return frac(favorables, posibles);
}

/** P(no A) = 1 − P(A). */
export function complemento(p: Fraccion): Fraccion {
  if (!esProbabilidad(p)) throw new Error(`complemento exige una probabilidad entre 0 y 1 (recibido: ${aTexto(p)})`);
  return restar(UNO, p);
}

// ---------- espacios muestrales enumerables ----------

/** Todos los pares (a, b) con a de A y b de B, en el orden de las listas. */
export function espacioProducto<A, B>(A: readonly A[], B: readonly B[]): [A, B][] {
  const pares: [A, B][] = [];
  for (const a of A) for (const b of B) pares.push([a, b]);
  return pares;
}

export const CARAS_DADO = [1, 2, 3, 4, 5, 6] as const;

/** Los 36 pares de dos dados. */
export function espacioDadoDoble(): [number, number][] {
  return espacioProducto(CARAS_DADO, CARAS_DADO);
}

export function contar<T>(espacio: readonly T[], predicado: (x: T) => boolean): number {
  return espacio.filter(predicado).length;
}

/** Probabilidad de un evento por enumeración: cuenta sobre total del espacio. */
export function probEvento<T>(espacio: readonly T[], predicado: (x: T) => boolean): Fraccion {
  return laplace(contar(espacio, predicado), espacio.length);
}

// ---------- regla aditiva ----------

/** P(A o B) cuando A y B no pueden ocurrir a la vez. */
export function unionExcluyentes(pA: Fraccion, pB: Fraccion): Fraccion {
  const p = sumar(pA, pB);
  if (!esProbabilidad(p)) {
    throw new Error(`P(A) + P(B) = ${aTexto(p)} supera 1: los eventos no pueden ser excluyentes`);
  }
  return p;
}

/** P(A o B) = P(A) + P(B) − P(A y B), en general. */
export function union(pA: Fraccion, pB: Fraccion, pAB: Fraccion): Fraccion {
  return restar(sumar(pA, pB), pAB);
}

// ---------- regla multiplicativa ----------

/** P(A y luego B) cuando el primero no cambia al segundo (independientes, o con reposición). */
export function interseccionIndependientes(pA: Fraccion, pB: Fraccion): Fraccion {
  return multiplicar(pA, pB);
}

/**
 * Una urna descrita por su composición: cuántos objetos de cada clase. El
 * orden de las claves es el orden de las ramas en el árbol.
 */
export type Composicion = Record<string, number>;

export interface RamaArbol {
  camino: string[];
  prob: Fraccion;
}

function validarComposicion(composicion: Composicion): number {
  const clases = Object.keys(composicion);
  if (clases.length === 0) throw new Error("la composición no tiene clases");
  let total = 0;
  for (const clase of clases) {
    const n = composicion[clase];
    if (!Number.isInteger(n) || n < 0) throw new Error(`la clase "${clase}" debe tener un conteo entero no negativo (recibido: ${n})`);
    total += n;
  }
  if (total === 0) throw new Error("la composición está vacía");
  return total;
}

/**
 * Todas las hojas del árbol de `etapas` extracciones sucesivas desde la
 * composición. Con reposición cada etapa repite las mismas razones; sin
 * reposición el total baja 1 por etapa y el conteo de la clase extraída baja 1,
 * y una clase agotada deja de tener rama. La probabilidad de cada hoja es el
 * producto exacto de las razones de su camino. Las probabilidades de las hojas
 * suman 1.
 */
export function ramasArbol(composicion: Composicion, etapas: number, reposicion: boolean): RamaArbol[] {
  if (!Number.isInteger(etapas) || etapas < 1) throw new Error(`etapas debe ser un entero positivo (recibido: ${etapas})`);
  const total = validarComposicion(composicion);
  if (!reposicion && etapas > total) throw new Error(`sin reposición no se pueden extraer ${etapas} de ${total}`);
  const hojas: RamaArbol[] = [];
  const recorrer = (restante: Composicion, totalRestante: number, camino: string[], prob: Fraccion) => {
    if (camino.length === etapas) {
      hojas.push({ camino, prob });
      return;
    }
    for (const clase of Object.keys(restante)) {
      const n = restante[clase];
      if (n === 0) continue;
      const razon = frac(n, totalRestante);
      const siguiente = reposicion ? restante : { ...restante, [clase]: n - 1 };
      recorrer(siguiente, reposicion ? totalRestante : totalRestante - 1, [...camino, clase], multiplicar(prob, razon));
    }
  };
  recorrer({ ...composicion }, total, [], UNO);
  return hojas;
}

/**
 * Probabilidad de UNA secuencia concreta de clases (por ejemplo ["roja", "azul"]):
 * producto de las razones, que cambian de etapa a etapa si no hay reposición.
 * Devuelve 0 si la secuencia pide más de una clase de las que hay.
 */
export function probSecuencia(composicion: Composicion, secuencia: readonly string[], reposicion: boolean): Fraccion {
  let total = validarComposicion(composicion);
  const restante: Composicion = { ...composicion };
  let prob = UNO;
  for (const clase of secuencia) {
    if (!(clase in restante)) throw new Error(`la clase "${clase}" no está en la composición`);
    const n = restante[clase];
    if (n === 0) return CERO;
    prob = multiplicar(prob, frac(n, total));
    if (!reposicion) {
      restante[clase] = n - 1;
      total -= 1;
    }
  }
  return prob;
}

/** P(al menos uno) = 1 − P(ninguno). */
export const probAlMenosUno = (pNinguno: Fraccion): Fraccion => complemento(pNinguno);

// ---------- tabla de doble entrada ----------

export interface TablaDobleEntrada {
  celdas: number[][];
  totalesFila: number[];
  totalesColumna: number[];
  total: number;
}

/** Totales por fila, por columna y general de una matriz de conteos (filas × columnas). */
export function tablaDobleEntrada(conteos: readonly (readonly number[])[]): TablaDobleEntrada {
  if (conteos.length === 0 || conteos[0].length === 0) throw new Error("la tabla necesita al menos una fila y una columna");
  const columnas = conteos[0].length;
  for (const fila of conteos) {
    if (fila.length !== columnas) throw new Error("todas las filas deben tener la misma cantidad de columnas");
    for (const n of fila) if (!Number.isInteger(n) || n < 0) throw new Error(`conteo inválido: ${n}`);
  }
  const celdas = conteos.map((fila) => [...fila]);
  const totalesFila = celdas.map((fila) => fila.reduce((s, n) => s + n, 0));
  const totalesColumna = Array.from({ length: columnas }, (_, j) => celdas.reduce((s, fila) => s + fila[j], 0));
  const total = totalesFila.reduce((s, n) => s + n, 0);
  return { celdas, totalesFila, totalesColumna, total };
}

export interface SelectorTabla {
  fila?: number;
  columna?: number;
}

/**
 * Probabilidad de elegir al azar a alguien de la tabla que esté en la fila, en
 * la columna, o en la celda (fila y columna), sobre el total general.
 */
export function probDesdeTabla(tabla: TablaDobleEntrada, selector: SelectorTabla): Fraccion {
  const { fila, columna } = selector;
  if (fila !== undefined && (fila < 0 || fila >= tabla.celdas.length)) throw new Error(`fila ${fila} fuera de la tabla`);
  if (columna !== undefined && (columna < 0 || columna >= tabla.totalesColumna.length)) throw new Error(`columna ${columna} fuera de la tabla`);
  if (fila !== undefined && columna !== undefined) return laplace(tabla.celdas[fila][columna], tabla.total);
  if (fila !== undefined) return laplace(tabla.totalesFila[fila], tabla.total);
  if (columna !== undefined) return laplace(tabla.totalesColumna[columna], tabla.total);
  return UNO;
}

/** P(fila o columna) desde la tabla: total de la fila + total de la columna − la celda que se contó dos veces. */
export function probUnionDesdeTabla(tabla: TablaDobleEntrada, fila: number, columna: number): Fraccion {
  const enFila = tabla.totalesFila[fila];
  const enColumna = tabla.totalesColumna[columna];
  const ambos = tabla.celdas[fila][columna];
  return laplace(enFila + enColumna - ambos, tabla.total);
}

// ---------- frecuencial ----------

/** Frecuencia relativa de un resultado en una serie de ensayos, como fracción reducida. */
export function frecuenciaRelativa(exitos: number, ensayos: number): Fraccion {
  return laplace(exitos, ensayos);
}

// ---------- alternativas ----------

/** true si ninguna fracción de la lista vale lo mismo que otra (3/6 y 1/2 son iguales). */
export function distintosEnValor(lista: readonly Fraccion[]): boolean {
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      if (igual(lista[i], lista[j])) return false;
    }
  }
  return true;
}

/** true si la lista va en orden estrictamente creciente por valor. */
export function enOrdenCreciente(lista: readonly Fraccion[]): boolean {
  for (let i = 1; i < lista.length; i++) if (comparar(lista[i - 1], lista[i]) !== -1) return false;
  return true;
}

// ---------- contrato de los bloques visuales ----------

/**
 * Una rama del árbol: el resultado que rotula el nodo al que llega y la
 * probabilidad de la rama, escrita como texto ("3/8"), que es lo que se dibuja.
 * Nada se calcula en el componente: si la hoja lleva `probabilidadCamino`, es
 * el producto de las ramas del camino y el validador lo comprueba. Un nodo con
 * `ramas` sigue a la etapa siguiente; sin `ramas` es una hoja.
 */
export interface RamaArbolDatos {
  resultado: string;
  probabilidad: string;
  id?: string;
  probabilidadCamino?: string;
  ramas?: RamaArbolDatos[];
}

/**
 * Árbol horizontal, raíz a la izquierda, de 1 a 3 etapas (`etapas` rotula cada
 * columna y fija la profundidad: toda hoja está en la última etapa). Hasta 3
 * ramas por nodo y hasta 12 hojas. Las probabilidades de las ramas hermanas de
 * cada nodo suman exactamente 1. `resaltar` lista ids de hojas cuyos caminos se
 * dibujan con trazo grueso y acento.
 */
export interface DatosDiagramaArbol {
  tipo: "diagramaArbol";
  etapas: string[];
  ramas: RamaArbolDatos[];
  resaltar?: string[];
  raiz?: string;
}

/**
 * Cuadrícula de pares de dos experimentos: las filas son los resultados del
 * primero y las columnas los del segundo (2 a 6 cada uno). `marcadas` son las
 * celdas [fila, columna] (desde 0) del evento, dibujadas con trama y trazo, y
 * `contador` es el "marcadas de total" que se escribe abajo, declarado desde
 * el contenido y verificado contra `marcadas` y filas × columnas. `celdas`
 * es el texto de cada celda (por ejemplo la suma); sin él, la celda muestra
 * el par cuando los rótulos son cortos.
 */
export interface DatosCuadriculaEspacioMuestral {
  tipo: "cuadriculaEspacioMuestral";
  filas: string[];
  columnas: string[];
  rotuloFilas?: string;
  rotuloColumnas?: string;
  celdas?: string[][];
  marcadas?: [number, number][];
  contador?: { marcadas: number; total: number };
  rotuloEvento?: string;
}

export type DatosVisualProbabilidad = DatosDiagramaArbol | DatosCuadriculaEspacioMuestral;

export const TIPOS_VISUAL_PROBABILIDAD = ["diagramaArbol", "cuadriculaEspacioMuestral"] as const;
export type TipoVisualProbabilidad = (typeof TIPOS_VISUAL_PROBABILIDAD)[number];

export const MAX_ETAPAS = 3;
export const MAX_RAMAS_POR_NODO = 3;
export const MAX_HOJAS = 12;
export const MIN_RESULTADOS = 2;
export const MAX_RESULTADOS = 6;
/** Un rótulo más largo no cabe en el nodo del árbol ni en el borde de la cuadrícula. */
export const MAX_LARGO_ROTULO = 14;
export const MAX_LARGO_CELDA = 6;

const esTexto = (s: unknown): s is string => typeof s === "string" && s.trim().length > 0;
const esRotulo = (s: unknown): s is string => esTexto(s) && s.length <= MAX_LARGO_ROTULO;

export function hojasDelArbol(ramas: readonly RamaArbolDatos[]): RamaArbolDatos[] {
  return ramas.flatMap((r) => (r.ramas && r.ramas.length > 0 ? hojasDelArbol(r.ramas) : [r]));
}

function motivoRechazoRamas(
  ramas: unknown,
  profundidad: number,
  etapas: number,
  acumulado: Fraccion,
  donde: string,
  hojas: RamaArbolDatos[],
): string | null {
  if (!Array.isArray(ramas) || ramas.length < 1 || ramas.length > MAX_RAMAS_POR_NODO) {
    return `${donde}: cada nodo tiene entre 1 y ${MAX_RAMAS_POR_NODO} ramas`;
  }
  // Primero el nodo entero (forma de cada rama y suma de las hermanas), después
  // cada subárbol: así el motivo apunta al nodo donde la suma falla, y no a una
  // hoja más abajo cuyo producto dejó de cuadrar por culpa de ese mismo error.
  const probs: Fraccion[] = [];
  for (let i = 0; i < ramas.length; i++) {
    const r = ramas[i] as Partial<RamaArbolDatos> | null;
    const aqui = `${donde}[${i}]`;
    if (typeof r !== "object" || r === null) return `${aqui} debe ser un objeto { resultado, probabilidad }`;
    if (!esRotulo(r.resultado)) return `${aqui}.resultado: texto no vacío de hasta ${MAX_LARGO_ROTULO} caracteres`;
    if (!esTexto(r.probabilidad)) return `${aqui}.probabilidad: texto obligatorio (la rama se rotula desde el contenido)`;
    const p = fraccionDesdeTexto(r.probabilidad);
    if (!p || !esProbabilidad(p)) return `${aqui}.probabilidad "${r.probabilidad}" no es una probabilidad entre 0 y 1`;
    if (r.id !== undefined && !esTexto(r.id)) return `${aqui}.id: si está, es texto no vacío`;
    probs.push(p);
  }
  const suma = sumarTodas(probs);
  if (!igual(suma, UNO)) return `${donde}: las ramas hermanas suman ${aTexto(suma)}, no 1`;

  for (let i = 0; i < ramas.length; i++) {
    const r = ramas[i] as RamaArbolDatos;
    const aqui = `${donde}[${i}]`;
    const producto = multiplicar(acumulado, probs[i]);
    const tieneHijos = r.ramas !== undefined;
    if (profundidad < etapas) {
      if (!tieneHijos) return `${aqui}: le faltan ramas, el árbol declara ${etapas} etapas`;
      if (r.probabilidadCamino !== undefined) return `${aqui}.probabilidadCamino solo va en las hojas`;
      const motivo = motivoRechazoRamas(r.ramas, profundidad + 1, etapas, producto, `${aqui}.ramas`, hojas);
      if (motivo) return motivo;
    } else {
      if (tieneHijos) return `${aqui}: tiene ramas más allá de la etapa ${etapas}`;
      if (r.probabilidadCamino !== undefined) {
        const pc = esTexto(r.probabilidadCamino) ? fraccionDesdeTexto(r.probabilidadCamino) : null;
        if (!pc) return `${aqui}.probabilidadCamino "${r.probabilidadCamino}" no se lee como probabilidad`;
        if (!igual(pc, producto)) {
          return `${aqui}.probabilidadCamino "${r.probabilidadCamino}" no es el producto de las ramas del camino (${aTexto(producto)})`;
        }
      }
      hojas.push(r);
    }
  }
  return null;
}

function motivoRechazoArbol(d: Partial<DatosDiagramaArbol>): string | null {
  const etapas = d.etapas;
  if (!Array.isArray(etapas) || etapas.length < 1 || etapas.length > MAX_ETAPAS) {
    return `etapas debe tener entre 1 y ${MAX_ETAPAS} rótulos (uno por columna del árbol)`;
  }
  if (!etapas.every(esRotulo)) return `etapas: cada rótulo es un texto no vacío de hasta ${MAX_LARGO_ROTULO} caracteres`;
  if (d.raiz !== undefined && !esRotulo(d.raiz)) return `raiz: si está, es un texto de hasta ${MAX_LARGO_ROTULO} caracteres`;
  const hojas: RamaArbolDatos[] = [];
  const motivo = motivoRechazoRamas(d.ramas, 1, etapas.length, UNO, "ramas", hojas);
  if (motivo) return motivo;
  if (hojas.length > MAX_HOJAS) return `el árbol tiene ${hojas.length} hojas; el máximo legible es ${MAX_HOJAS}`;
  const ids = hojas.map((h) => h.id).filter((id): id is string => id !== undefined);
  if (new Set(ids).size !== ids.length) return "los ids de las hojas se repiten";
  if (d.resaltar !== undefined) {
    if (!Array.isArray(d.resaltar) || !d.resaltar.every(esTexto)) return "resaltar: lista de ids de hojas";
    for (const id of d.resaltar) if (!ids.includes(id)) return `resaltar: "${id}" no es el id de ninguna hoja`;
  }
  return null;
}

function motivoRechazoCuadricula(d: Partial<DatosCuadriculaEspacioMuestral>): string | null {
  for (const eje of ["filas", "columnas"] as const) {
    const lista = d[eje];
    if (!Array.isArray(lista) || lista.length < MIN_RESULTADOS || lista.length > MAX_RESULTADOS) {
      return `${eje} debe tener entre ${MIN_RESULTADOS} y ${MAX_RESULTADOS} resultados`;
    }
    if (!lista.every(esRotulo)) return `${eje}: cada resultado es un texto no vacío de hasta ${MAX_LARGO_ROTULO} caracteres`;
    if (new Set(lista).size !== lista.length) return `${eje}: hay resultados repetidos`;
  }
  const nFilas = d.filas!.length;
  const nColumnas = d.columnas!.length;
  for (const rotulo of ["rotuloFilas", "rotuloColumnas", "rotuloEvento"] as const) {
    if (d[rotulo] !== undefined && !esTexto(d[rotulo])) return `${rotulo}: si está, es texto no vacío`;
  }
  if (d.celdas !== undefined) {
    if (!Array.isArray(d.celdas) || d.celdas.length !== nFilas) return `celdas debe tener exactamente ${nFilas} filas`;
    for (let i = 0; i < nFilas; i++) {
      const fila = d.celdas[i];
      if (!Array.isArray(fila) || fila.length !== nColumnas) return `celdas[${i}] debe tener exactamente ${nColumnas} textos`;
      if (!fila.every((c) => typeof c === "string" && c.length <= MAX_LARGO_CELDA)) {
        return `celdas[${i}]: cada celda es un texto de hasta ${MAX_LARGO_CELDA} caracteres`;
      }
    }
  }
  const marcadas = d.marcadas ?? [];
  if (!Array.isArray(marcadas)) return "marcadas debe ser una lista de pares [fila, columna]";
  const vistas = new Set<string>();
  for (let k = 0; k < marcadas.length; k++) {
    const m = marcadas[k];
    if (!Array.isArray(m) || m.length !== 2 || !m.every((v) => Number.isInteger(v))) {
      return `marcadas[${k}] debe ser un par de enteros [fila, columna]`;
    }
    const [f, c] = m;
    if (f < 0 || f >= nFilas || c < 0 || c >= nColumnas) return `marcadas[${k}] = [${f}, ${c}] cae fuera de la cuadrícula de ${nFilas} × ${nColumnas}`;
    const clave = `${f},${c}`;
    if (vistas.has(clave)) return `marcadas[${k}] = [${f}, ${c}] está repetida`;
    vistas.add(clave);
  }
  if (d.contador !== undefined) {
    const c = d.contador;
    if (typeof c !== "object" || c === null || !Number.isInteger(c.marcadas) || !Number.isInteger(c.total)) {
      return "contador debe ser { marcadas: entero, total: entero }";
    }
    if (c.marcadas !== marcadas.length) return `contador.marcadas = ${c.marcadas} pero hay ${marcadas.length} celdas marcadas`;
    if (c.total !== nFilas * nColumnas) return `contador.total = ${c.total} pero la cuadrícula tiene ${nFilas * nColumnas} celdas`;
  }
  return null;
}

/**
 * Lo que rechaza un bloque visual de probabilidad, o `null` si se puede
 * dibujar. Mismo doble uso que `motivoRechazoDatosGrafico`: lo llama
 * `scripts/validar-contenido.mjs` y el type guard de
 * `components/bloques/BloqueVisualizacion.tsx`.
 */
export function motivoRechazoDatosProbabilidad(datos: unknown): string | null {
  const d = datos as { tipo?: unknown } | null;
  if (typeof d !== "object" || d === null) return "datos debe ser un objeto";
  switch (d.tipo) {
    case "diagramaArbol":
      return motivoRechazoArbol(d as Partial<DatosDiagramaArbol>);
    case "cuadriculaEspacioMuestral":
      return motivoRechazoCuadricula(d as Partial<DatosCuadriculaEspacioMuestral>);
    default:
      return `tipo debe ser uno de: ${TIPOS_VISUAL_PROBABILIDAD.join(", ")}`;
  }
}

export function esTipoVisualProbabilidad(tipo: unknown): tipo is TipoVisualProbabilidad {
  return TIPOS_VISUAL_PROBABILIDAD.includes(tipo as TipoVisualProbabilidad);
}

/**
 * Construye las `ramas` de un `DatosDiagramaArbol` desde una composición, con
 * cada probabilidad ya escrita como texto y cada hoja con su id (las clases
 * del camino unidas por "-") y su `probabilidadCamino`. Es la forma de
 * escribir un árbol en el JSON sin calcular nada a mano: el contenido copia
 * la salida de `node -e` y el validador la vuelve a comprobar.
 */
export function ramasDesdeComposicion(
  composicion: Composicion,
  etapas: number,
  reposicion: boolean,
  rotulos: Record<string, string> = {},
): RamaArbolDatos[] {
  const total = validarComposicion(composicion);
  if (!reposicion && etapas > total) throw new Error(`sin reposición no se pueden extraer ${etapas} de ${total}`);
  const construir = (restante: Composicion, totalRestante: number, camino: string[], acumulado: Fraccion): RamaArbolDatos[] => {
    const ramas: RamaArbolDatos[] = [];
    for (const clase of Object.keys(restante)) {
      const n = restante[clase];
      if (n === 0) continue;
      const razon = frac(n, totalRestante);
      const producto = multiplicar(acumulado, razon);
      const caminoNuevo = [...camino, clase];
      const rama: RamaArbolDatos = { resultado: rotulos[clase] ?? clase, probabilidad: aTexto(razon) };
      if (caminoNuevo.length < etapas) {
        const siguiente = reposicion ? restante : { ...restante, [clase]: n - 1 };
        rama.ramas = construir(siguiente, reposicion ? totalRestante : totalRestante - 1, caminoNuevo, producto);
      } else {
        rama.id = caminoNuevo.join("-");
        rama.probabilidadCamino = aTexto(producto);
      }
      ramas.push(rama);
    }
    return ramas;
  };
  return construir({ ...composicion }, total, [], UNO);
}
