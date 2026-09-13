/**
 * Primitivas de transformaciones isométricas en el plano: puntos, vectores,
 * traslación, rotación (múltiplos de 90° en torno a un centro) y reflexión
 * (ejes coordenados, origen y rectas verticales u horizontales).
 *
 * Puro: sin I/O ni React. Todo opera sobre tuplas `[x, y]`, no sobre `{x, y}`
 * como `lib/figurasGeometricas.ts`, porque acá los puntos se escriben en JSON
 * de contenido como pares y una tupla es la forma que menos ruido mete en un
 * enunciado (`[3, -2]` se lee como (3, −2)). Con entradas enteras todas las
 * salidas son enteras: no hay seno ni coseno, solo intercambio y cambio de
 * signo de coordenadas, así que ninguna imagen arrastra error de redondeo.
 */

export type Punto = [number, number];
export type Vector = [number, number];
export type Poligono = Punto[];

export type Grados = 90 | 180 | 270;
export type Sentido = "antihorario" | "horario";

export type EjeReflexion = "x" | "y" | "origen" | { vertical: number } | { horizontal: number };

export interface Rotacion {
  grados: Grados;
  sentido: Sentido;
  centro?: Punto;
}

export interface Reflexion {
  eje: EjeReflexion;
}

export type Transformacion =
  | { tipo: "traslacion"; vector: Vector }
  | ({ tipo: "rotacion" } & Rotacion)
  | ({ tipo: "reflexion" } & Reflexion);

export const GRADOS_VALIDOS = [90, 180, 270] as const;
export const SENTIDOS_VALIDOS = ["antihorario", "horario"] as const;
export const EJES_NOMBRADOS = ["x", "y", "origen"] as const;

export const ORIGEN: Punto = [0, 0];

/**
 * `-y` con y = 0 da -0, y un rótulo diría "(−0, 3)". Se normaliza en cada
 * salida, igual que `sinCeroNegativo` en `lib/planoCartesiano.ts`: -0 === 0,
 * así que ninguna comparación cambia, solo la impresión.
 */
const limpiar = (p: Punto): Punto => [p[0] === 0 ? 0 : p[0], p[1] === 0 ? 0 : p[1]];

export function sumarVectores(u: Vector, v: Vector): Vector {
  return [u[0] + v[0], u[1] + v[1]];
}

export function restarVectores(u: Vector, v: Vector): Vector {
  return [u[0] - v[0], u[1] - v[1]];
}

export function ponderarVector(k: number, v: Vector): Vector {
  return limpiar([k * v[0], k * v[1]]);
}

/** El vector que lleva de A a B: B − A. El orden importa y es el que confunde. */
export function vectorEntre(a: Punto, b: Punto): Vector {
  return [b[0] - a[0], b[1] - a[1]];
}

export function distancia(a: Punto, b: Punto): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

export function trasladar(fig: Poligono, v: Vector): Poligono {
  return fig.map((p) => sumarVectores(p, v));
}

/**
 * Rotación en múltiplos de 90°. Se normaliza a giros antihorarios: un giro
 * horario de g grados es un giro antihorario de 360 − g. Cada giro antihorario
 * de 90° respecto del origen es (x, y) → (−y, x); respecto de otro centro se
 * traslada al origen, se gira y se vuelve.
 */
export function rotar(fig: Poligono, r: Rotacion): Poligono {
  const centro = r.centro ?? ORIGEN;
  const antihorarios = (r.sentido === "horario" ? 360 - r.grados : r.grados) / 90;
  return fig.map((p) => {
    let [x, y] = restarVectores(p, centro);
    for (let i = 0; i < antihorarios; i++) [x, y] = [-y, x];
    return limpiar(sumarVectores([x, y], centro));
  });
}

export function reflejar(fig: Poligono, r: Reflexion): Poligono {
  const eje = r.eje;
  return fig.map(([x, y]) => {
    if (eje === "x") return limpiar([x, -y]);
    if (eje === "y") return limpiar([-x, y]);
    if (eje === "origen") return limpiar([-x, -y]);
    if ("vertical" in eje) return limpiar([2 * eje.vertical - x, y]);
    return limpiar([x, 2 * eje.horizontal - y]);
  });
}

/** Aplica las transformaciones en el orden del arreglo: la primera se aplica primero. */
export function componer(fig: Poligono, transformaciones: readonly Transformacion[]): Poligono {
  return transformaciones.reduce<Poligono>((actual, t) => {
    switch (t.tipo) {
      case "traslacion":
        return trasladar(actual, t.vector);
      case "rotacion":
        return rotar(actual, t);
      case "reflexion":
        return reflejar(actual, t);
    }
  }, fig);
}

/** Área con signo por la fórmula del zapato: el signo dice la orientación. */
export function areaConSigno(fig: Poligono): number {
  let acumulado = 0;
  for (let i = 0; i < fig.length; i++) {
    const [x1, y1] = fig[i];
    const [x2, y2] = fig[(i + 1) % fig.length];
    acumulado += x1 * y2 - x2 * y1;
  }
  return acumulado / 2;
}

export const esEntero = (n: number) => Number.isInteger(n);

export const esPuntoEntero = (p: unknown): p is Punto =>
  Array.isArray(p) && p.length === 2 && esEntero(p[0]) && esEntero(p[1]);

/**
 * Lo que rechaza una transformación escrita en contenido, o `null` si es
 * válida. Mismo contrato que `motivoRechazoParalelepipedo`: devuelve el motivo
 * en vez de lanzar, porque el llamador es un type guard que degrada el bloque
 * al texto en lugar de reventar la página.
 */
export function motivoRechazoTransformacion(t: unknown): string | null {
  const d = t as Partial<Transformacion> | null;
  if (typeof d !== "object" || d === null) return "la transformación debe ser un objeto";
  switch (d.tipo) {
    case "traslacion": {
      const v = (d as { vector?: unknown }).vector;
      return esPuntoEntero(v) ? null : "traslacion: vector debe ser un par de enteros";
    }
    case "rotacion": {
      const r = d as Partial<Rotacion>;
      if (!GRADOS_VALIDOS.includes(r.grados as Grados)) return "rotacion: grados debe ser 90, 180 o 270";
      if (!SENTIDOS_VALIDOS.includes(r.sentido as Sentido)) {
        return 'rotacion: sentido debe ser "antihorario" u "horario"';
      }
      if (r.centro !== undefined && !esPuntoEntero(r.centro)) return "rotacion: centro debe ser un par de enteros";
      return null;
    }
    case "reflexion": {
      const eje = (d as { eje?: unknown }).eje;
      if (EJES_NOMBRADOS.includes(eje as (typeof EJES_NOMBRADOS)[number])) return null;
      if (typeof eje === "object" && eje !== null) {
        const claves = Object.keys(eje);
        if (claves.length === 1 && claves[0] === "vertical" && esEntero((eje as { vertical: number }).vertical)) return null;
        if (claves.length === 1 && claves[0] === "horizontal" && esEntero((eje as { horizontal: number }).horizontal)) return null;
      }
      return 'reflexion: eje debe ser "x", "y", "origen", { vertical: n } o { horizontal: n }';
    }
    default:
      return 'tipo debe ser "traslacion", "rotacion" o "reflexion"';
  }
}

// ---------- contrato del bloque de visualización { tipo: "transformacion" } ----------

/** Toda coordenada de contenido vive en [−10, 10], igual que el plano de los sliders. */
export const LIMITE_COORDENADA = 10;
export const MAX_VERTICES = 5;
export const MAX_TRANSFORMACIONES = 3;
/** Margen en unidades del plano alrededor del punto más extremo de la escena. */
export const MARGEN_UNIDADES = 1;
/**
 * Ancho mínimo de una celda de la cuadrícula, en píxeles del viewBox de 320
 * con margen 28 (`lib/planoCartesiano.ts`): bajo 12 px un rótulo de vértice
 * de 9 px pisa al vecino. Con coordenadas en [−10, 10] y margen 1 la escena
 * más ancha posible mide 22 unidades y da exactamente 12 px por celda.
 */
export const CELDA_MINIMA_PX = 12;
const AREA_PLANO_PX = 320 - 28 * 2;

export interface DatosTransformacionEscena {
  tipo: "transformacion";
  figura: Punto[];
  transformaciones: Transformacion[];
  rotulos?: string[];
  rotulosImagen?: string[];
  rotuloVector?: string;
  trazo?: "poligono" | "puntos";
  mostrarImagen?: boolean;
  mostrarIntermedias?: boolean;
}

export interface Rango {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * Las figuras de la escena, en orden: la original y una imagen por cada
 * transformación aplicada sobre la anterior. `figuras[k]` es el resultado de
 * las primeras k transformaciones.
 */
export function figurasDeEscena(datos: DatosTransformacionEscena): Poligono[] {
  const figuras: Poligono[] = [datos.figura];
  for (const t of datos.transformaciones) figuras.push(componer(figuras[figuras.length - 1], [t]));
  return figuras;
}

/**
 * Puntos que la escena necesita dentro de cuadro además de los vértices: el
 * centro de cada rotación y un punto de cada eje de reflexión, para que el
 * eje se vea aunque la figura quede lejos de él.
 */
export function puntosAuxiliares(datos: DatosTransformacionEscena): Punto[] {
  const puntos: Punto[] = [];
  for (const t of datos.transformaciones) {
    if (t.tipo === "rotacion") puntos.push(t.centro ?? ORIGEN);
    if (t.tipo === "reflexion") {
      if (typeof t.eje === "object") {
        puntos.push("vertical" in t.eje ? [t.eje.vertical, 0] : [0, t.eje.horizontal]);
      } else {
        puntos.push(ORIGEN);
      }
    }
  }
  return puntos;
}

/**
 * Rango cuadrado, con celdas enteras, que contiene todos los puntos con el
 * margen dado. Se hace cuadrado ensanchando el lado corto de forma simétrica,
 * para que las celdas sean cuadradas dentro del viewBox cuadrado de
 * `PlanoBase` y un ángulo recto se vea recto. Siempre incluye el origen: los
 * ejes son la referencia que hace legible cualquier coordenada.
 */
export function rangoEscena(puntos: readonly Punto[], margen = MARGEN_UNIDADES): Rango {
  const xs = [0, ...puntos.map((p) => p[0])];
  const ys = [0, ...puntos.map((p) => p[1])];
  let xMin = Math.min(...xs) - margen;
  let xMax = Math.max(...xs) + margen;
  let yMin = Math.min(...ys) - margen;
  let yMax = Math.max(...ys) + margen;
  const ancho = xMax - xMin;
  const alto = yMax - yMin;
  if (ancho > alto) {
    const extra = ancho - alto;
    yMin -= Math.floor(extra / 2);
    yMax += Math.ceil(extra / 2);
  } else if (alto > ancho) {
    const extra = alto - ancho;
    xMin -= Math.floor(extra / 2);
    xMax += Math.ceil(extra / 2);
  }
  return { xMin, xMax, yMin, yMax };
}

export const celdaEnPantalla = (rango: Rango) => AREA_PLANO_PX / (rango.xMax - rango.xMin);

const dentroDelLimite = (p: Punto) =>
  Math.abs(p[0]) <= LIMITE_COORDENADA && Math.abs(p[1]) <= LIMITE_COORDENADA;

/**
 * Lo que rechaza un bloque `{ tipo: "transformacion" }` de contenido, o
 * `null` si se puede dibujar. Cubre la forma (puntos enteros, rótulos con la
 * cantidad justa, transformaciones válidas) y la legibilidad (toda la escena,
 * imágenes incluidas, dentro de [−10, 10] y con celdas de al menos
 * `CELDA_MINIMA_PX`). El validador de contenido y el type guard del bloque
 * llaman a esta misma función: un JSON que pasa `npm run validar` se dibuja.
 */
export function motivoRechazoDatosTransformacion(datos: unknown): string | null {
  const d = datos as Partial<DatosTransformacionEscena> | null;
  if (typeof d !== "object" || d === null || d.tipo !== "transformacion") {
    return 'tipo debe ser "transformacion"';
  }
  const figura = d.figura;
  if (!Array.isArray(figura) || figura.length < 1 || figura.length > MAX_VERTICES) {
    return `figura debe tener entre 1 y ${MAX_VERTICES} puntos`;
  }
  if (!figura.every(esPuntoEntero)) return "figura: todos los puntos deben ser pares de enteros";
  if (!figura.every(dentroDelLimite)) return `figura: toda coordenada debe estar en [−${LIMITE_COORDENADA}, ${LIMITE_COORDENADA}]`;
  if (new Set(figura.map((p) => p.join(","))).size !== figura.length) return "figura: hay vértices repetidos";

  const ts = d.transformaciones;
  if (!Array.isArray(ts) || ts.length > MAX_TRANSFORMACIONES) {
    return `transformaciones debe ser un arreglo de 0 a ${MAX_TRANSFORMACIONES} elementos`;
  }
  for (let i = 0; i < ts.length; i++) {
    const motivo = motivoRechazoTransformacion(ts[i]);
    if (motivo) return `transformaciones[${i}]: ${motivo}`;
  }

  for (const clave of ["rotulos", "rotulosImagen"] as const) {
    const r = d[clave];
    if (r === undefined) continue;
    if (!Array.isArray(r) || r.length !== figura.length || !r.every((s) => typeof s === "string" && s.length > 0)) {
      return `${clave} debe traer exactamente un texto no vacío por vértice (${figura.length})`;
    }
  }
  if (d.rotuloVector !== undefined && typeof d.rotuloVector !== "string") return "rotuloVector debe ser texto";
  if (d.trazo !== undefined && d.trazo !== "poligono" && d.trazo !== "puntos") return 'trazo debe ser "poligono" o "puntos"';
  for (const clave of ["mostrarImagen", "mostrarIntermedias"] as const) {
    if (d[clave] !== undefined && typeof d[clave] !== "boolean") return `${clave} debe ser booleano`;
  }
  if (d.trazo === "puntos" && figura.length > 3) return 'con trazo "puntos" se admiten hasta 3 puntos';

  const escena = d as DatosTransformacionEscena;
  const todos = [...figurasDeEscena(escena).flat(), ...puntosAuxiliares(escena)];
  const fuera = todos.find((p) => !dentroDelLimite(p));
  if (fuera) return `la imagen (${fuera[0]}, ${fuera[1]}) se sale de [−${LIMITE_COORDENADA}, ${LIMITE_COORDENADA}]`;
  const celda = celdaEnPantalla(rangoEscena(todos));
  if (celda < CELDA_MINIMA_PX) {
    return `la escena es demasiado ancha: cada celda mediría ${celda.toFixed(1)} px y el mínimo es ${CELDA_MINIMA_PX}`;
  }
  return null;
}
