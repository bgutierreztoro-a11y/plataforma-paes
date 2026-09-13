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
