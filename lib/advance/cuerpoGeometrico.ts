import type { Coordenada, Coordenada3D, CotaArista, CotaCuerpo, FiguraCuerpoGeometrico } from "./descarte.ts";
import {
  AIRE,
  ALTO_LLAVE,
  ALTO_MAXIMO,
  ANCHO_CARRIL,
  SEPARACION,
  longitudesComparables,
  pathLlave,
  rotuloEn,
  type CajaRotulo,
  type ContextoLienzo,
  type RotuloLienzo,
} from "./lienzoGeometrico.ts";

/**
 * Motor del cuerpo geométrico de Advance (components/advance/figuras/
 * CuerpoGeometrico.tsx). Puro, sin React y sin DOM, como el del lienzo: pasa
 * del espacio a píxeles, decide qué aristas se ven, ubica cotas y rótulos, y
 * responde las preguntas del validador (scripts/validar-contenido.mjs, reglas
 * 41 a 50). Una sola geometría para el dibujo y para las reglas.
 *
 * Proyección: la caballera del tier gratis (lib/cuerposGeometricos.ts, que no
 * se importa): la profundidad z sube a 45° hacia la derecha, a la mitad de su
 * largo. La tapa del cilindro no pasa por esa proyección: como en el gratis, es
 * una elipse de ejes horizontales con alto igual a la mitad del ancho. Por eso
 * cajas y cilindros no van en una misma figura (regla 42).
 *
 * Las medidas de las piezas son proporciones del dibujo; los datos son los
 * rótulos, y la figura no se promete a escala. Una sola escala para x e y: la
 * fija el ancho del carril y, si el alto pasa de ALTO_MAXIMO, el alto. Los
 * rótulos se ubican en píxeles (letra de 12 px a 390), no en unidades.
 */

/** Copiado de lib/cuerposGeometricos.ts:40 (FACTOR_PROFUNDIDAD), sin importarlo. */
export const FACTOR_PROFUNDIDAD = 0.5;
/** Corrimiento en x y en y por unidad de z: FACTOR_PROFUNDIDAD · cos 45°. */
export const K = FACTOR_PROFUNDIDAD * Math.SQRT1_2;
/** Alto de la tapa sobre su radio: lib/cuerposGeometricos.ts:272 (ry = radio · k). */
export const ELIPSE = 0.5;

/** Guardas de legibilidad a 390 px (regla 47), en px del carril. */
export const ARISTA_VISIBLE_MINIMA = 12;
export const ARISTA_ACOTADA_MINIMA = 24;
export const RAZON_MAXIMA = 4;
export const ALTURA_RADIO_MIN = 0.25;
export const ALTURA_RADIO_MAX = 8;
export const ELIPSE_MINIMA = 8;
/** Aire mínimo entre cuerpos separados (reglas 43 y 44). */
export const SEPARACION_GRUPOS = 12;
/** Margen del dibujo dentro del viewBox. */
export const MARGEN_CUERPO = 8;
/** Topes (regla 49): 11 bloques en 2024 invierno n.º 45; 6 cotas en 2026 regular n.º 47. */
export const TOPES_CUERPO = { piezas: 12, cotas: 6 };
/** Dos rótulos iguales van sobre tramos iguales, con este error relativo (regla 46). */
export const TOLERANCIA_IGUALES = 0.01;

/* ---------- vectores ---------- */

type Eje = "x" | "y" | "z";
const EJES: Eje[] = ["x", "y", "z"];

const sub = (a: Coordenada, b: Coordenada): Coordenada => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Coordenada, b: Coordenada): Coordenada => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Coordenada, k: number): Coordenada => ({ x: a.x * k, y: a.y * k });
const len = (a: Coordenada) => Math.hypot(a.x, a.y);
const unit = (a: Coordenada): Coordenada => {
  const l = len(a);
  return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
};
const dot = (a: Coordenada, b: Coordenada) => a.x * b.x + a.y * b.y;
const cross = (a: Coordenada, b: Coordenada) => a.x * b.y - a.y * b.x;
const r2 = (v: number) => Math.round(v * 100) / 100;
const pt = (p: Coordenada) => `${r2(p.x)} ${r2(p.y)}`;
const fmt = (v: number) => Number(v.toFixed(3));
/** Número de un mensaje, con coma decimal. */
const num = (v: number) => String(fmt(v)).replace(".", ",");
const entre = (a: Coordenada3D, b: Coordenada3D, t: number): Coordenada3D => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});

/** Espacio al plano del dibujo (y hacia arriba): (x + K·z, y + K·z). */
export function proyectar(p: Coordenada3D): Coordenada {
  return { x: p.x + K * p.z, y: p.y + K * p.z };
}

/* ---------- piezas ---------- */

/** Caja alineada con los ejes; `pieza` es su índice en `figura.piezas`. */
export interface Caja {
  min: Coordenada3D;
  max: Coordenada3D;
  pieza: number;
}

/** Las cajas y los cubos de la figura; el cubo es una caja de lados iguales y `en` va por defecto al origen. */
export function cajasDe(figura: Pick<FiguraCuerpoGeometrico, "piezas">): Caja[] {
  const cajas: Caja[] = [];
  figura.piezas.forEach((p, pieza) => {
    if (p.cuerpo === "cilindro") return;
    const [l, h, w] = p.cuerpo === "cubo" ? [p.arista, p.arista, p.arista] : [p.largo, p.alto, p.ancho];
    const en = p.en ?? { x: 0, y: 0, z: 0 };
    cajas.push({ min: { ...en }, max: { x: en.x + l, y: en.y + h, z: en.z + w }, pieza });
  });
  return cajas;
}

export interface Cilindro {
  pieza: number;
  x: number;
  radio: number;
  y0: number;
  y1: number;
}

/** Cilindros con la misma x, de abajo hacia arriba en el orden del array. */
export interface Pila {
  x: number;
  cilindros: Cilindro[];
}

export function pilasDe(figura: Pick<FiguraCuerpoGeometrico, "piezas">): Pila[] {
  const pilas = new Map<number, Cilindro[]>();
  figura.piezas.forEach((p, pieza) => {
    if (p.cuerpo !== "cilindro") return;
    const x = p.x ?? 0;
    const pila = pilas.get(x) ?? [];
    const y0 = pila.length > 0 ? pila[pila.length - 1].y1 : 0;
    pila.push({ pieza, x, radio: p.radio, y0, y1: y0 + p.altura });
    pilas.set(x, pila);
  });
  return [...pilas.entries()].map(([x, cilindros]) => ({ x, cilindros }));
}

/** Tamaño de la escena, para las tolerancias relativas. */
function tamanoDe(cajas: Caja[]): number {
  let t = 1;
  for (const c of cajas) for (const e of EJES) t = Math.max(t, Math.abs(c.min[e]), Math.abs(c.max[e]));
  return t;
}

/* ---------- ocultas en cajas: rayo hacia el observador ---------- */

/**
 * Los puntos que caen en el mismo lugar del dibujo están sobre la recta de
 * dirección (−K, −K, 1); el observador queda hacia (K, K, −1). Por eso se ven
 * las caras de adelante, de arriba y de la derecha, como en el gratis
 * (CARAS_VISIBLES, lib/cuerposGeometricos.ts:92).
 */
const RAYO: Coordenada3D = { x: K, y: K, z: -1 };

/** El rayo de p hacia el observador entra al interior de alguna caja: p está tapado. */
export function tapado(p: Coordenada3D, cajas: Caja[], eps = 1e-9): boolean {
  return cajas.some((c) => {
    let t0 = eps;
    let t1 = Infinity;
    for (const e of EJES) {
      let ta = (c.min[e] - p[e]) / RAYO[e];
      let tb = (c.max[e] - p[e]) / RAYO[e];
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta);
      t1 = Math.min(t1, tb);
    }
    return t1 - t0 > eps;
  });
}

/** Las 12 aristas de una caja, cada una con su eje. */
function aristasDeCaja(c: Caja): [Coordenada3D, Coordenada3D, Eje][] {
  const aristas: [Coordenada3D, Coordenada3D, Eje][] = [];
  for (const eje of EJES) {
    const [u, v] = EJES.filter((e) => e !== eje);
    for (const cu of [c.min[u], c.max[u]]) {
      for (const cv of [c.min[v], c.max[v]]) {
        const a: Coordenada3D = { x: 0, y: 0, z: 0 };
        a[eje] = c.min[eje];
        a[u] = cu;
        a[v] = cv;
        const b: Coordenada3D = { ...a };
        b[eje] = c.max[eje];
        aristas.push([a, b, eje]);
      }
    }
  }
  return aristas;
}

/** Parámetros (0 a 1) donde la arista a-b, dibujada, cruza o empieza a solaparse con el dibujo de una arista de alguna caja. */
function cortesEnElDibujo(a3: Coordenada3D, b3: Coordenada3D, cajas: Caja[]): number[] {
  const A = proyectar(a3);
  const r = sub(proyectar(b3), A);
  const rr = dot(r, r);
  const cortes: number[] = [];
  for (const c of cajas) {
    for (const [p3, q3] of aristasDeCaja(c)) {
      const C = proyectar(p3);
      const s = sub(proyectar(q3), C);
      const den = cross(r, s);
      const ac = sub(C, A);
      if (Math.abs(den) < 1e-12) {
        if (Math.abs(cross(ac, r)) > 1e-9 * Math.max(1, len(r))) continue;
        for (const P of [C, add(C, s)]) cortes.push(dot(sub(P, A), r) / rr);
        continue;
      }
      const t = cross(ac, s) / den;
      const u = cross(ac, r) / den;
      if (u >= -1e-9 && u <= 1 + 1e-9) cortes.push(t);
    }
  }
  return cortes.filter((t) => t > 1e-9 && t < 1 - 1e-9);
}

/**
 * Qué es un tramo de arista por los cuatro cuadrantes que lo rodean (±ε en los
 * dos ejes perpendiculares): 1 o 3 llenos, o 2 en diagonal, es un pliegue
 * (esquina saliente o entrante); 2 contiguos de cajas distintas, una junta (dos
 * caras en un mismo plano); 0 o 4, nada.
 */
function claseDeTramo(m: Coordenada3D, eje: Eje, cajas: Caja[], e: number): "pliegue" | "junta" | null {
  const [u, v] = EJES.filter((k) => k !== eje);
  const llenos = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([su, sv]) => {
    const p = { ...m };
    p[u] += su * e;
    p[v] += sv * e;
    return cajas.findIndex((c) => EJES.every((k) => p[k] > c.min[k] && p[k] < c.max[k]));
  });
  const n = llenos.filter((i) => i >= 0).length;
  if (n === 1 || n === 3) return "pliegue";
  if (n !== 2) return null;
  if ((llenos[0] >= 0 && llenos[2] >= 0) || (llenos[1] >= 0 && llenos[3] >= 0)) return "pliegue";
  return new Set(llenos.filter((i) => i >= 0)).size > 1 ? "junta" : null;
}

/** Un tramo de arista con lo que es y si se ve. */
export interface TramoArista {
  a: Coordenada3D;
  b: Coordenada3D;
  clase: "pliegue" | "junta";
  visible: boolean;
}

/**
 * Las aristas del conjunto de cajas partidas en tramos donde algo cambia (el
 * borde de otra caja sobre el eje de la arista, o un cruce en el dibujo), cada
 * tramo con su clase (pliegue o junta) y su visibilidad (el rayo desde su punto
 * medio). Tramos seguidos iguales se unen; una arista compartida por dos cajas
 * sale una vez.
 */
export function tramosDeAristas(cajas: Caja[]): TramoArista[] {
  const tam = tamanoDe(cajas);
  const eps = 1e-9 * tam;
  const sonda = 1e-6 * tam;
  const tramos: TramoArista[] = [];
  for (const caja of cajas) {
    for (const [a, b, eje] of aristasDeCaja(caja)) {
      const largo = b[eje] - a[eje];
      const cortes = new Set([0, 1]);
      for (const o of cajas) {
        for (const v of [o.min[eje], o.max[eje]]) {
          const t = (v - a[eje]) / largo;
          if (t > 1e-9 && t < 1 - 1e-9) cortes.add(t);
        }
      }
      for (const t of cortesEnElDibujo(a, b, cajas)) cortes.add(t);
      const orden = [...cortes].sort((x, y) => x - y);
      let actual: TramoArista | null = null;
      for (let i = 0; i + 1 < orden.length; i++) {
        if (orden[i + 1] - orden[i] < 1e-9) continue;
        const m = entre(a, b, (orden[i] + orden[i + 1]) / 2);
        const clase = claseDeTramo(m, eje, cajas, sonda);
        if (!clase) {
          actual = null;
          continue;
        }
        const visible = !tapado(m, cajas, eps);
        const p1 = entre(a, b, orden[i + 1]);
        if (actual && actual.clase === clase && actual.visible === visible) {
          actual.b = p1;
          continue;
        }
        actual = { a: entre(a, b, orden[i]), b: p1, clase, visible };
        tramos.push(actual);
      }
    }
  }
  /* Una arista compartida por dos cajas sale de las dos: queda el tramo que contiene al otro (el de índice menor si son iguales). */
  const intervalo = (t: TramoArista, e: Eje): [number, number] => [Math.min(t.a[e], t.b[e]), Math.max(t.a[e], t.b[e])];
  const contenido = (t: TramoArista, o: TramoArista) =>
    EJES.every((e) => {
      const [a, b] = intervalo(t, e);
      const [c, d] = intervalo(o, e);
      return a >= c - eps && b <= d + eps;
    });
  const sobran = new Set<number>();
  tramos.forEach((t, i) => {
    const dueno = tramos.findIndex((o, j) => j !== i && !sobran.has(j) && o.clase === t.clase && o.visible === t.visible && contenido(t, o) && (!contenido(o, t) || j < i));
    if (dueno >= 0) sobran.add(i);
  });
  return tramos.filter((_, i) => !sobran.has(i));
}

/* ---------- ocultas en cilindros: analítico ---------- */

/** Medio arco de tapa: la elipse de centro (cx, cy) y semiejes (radio, ELIPSE·radio), de desde a hasta en radianes, antihorario. */
export interface ArcoTapa {
  cx: number;
  cy: number;
  radio: number;
  desde: number;
  hasta: number;
  visible: boolean;
}

/**
 * Semiancho del tramo del arco de atrás de una tapa de radio r que tapa el
 * cilindro de encima (radio ru < r, alto h). Un punto del arco a abscisa u
 * sube ELIPSE·√(r² − u²) sobre el centro; el dibujo del de encima cubre, en
 * u, hasta h + ELIPSE·√(ru² − u²). La diferencia decrece con |u|: el tramo
 * tapado es |u| < u*, y con el de encima chato (h < ELIPSE·(r − ru)) no tapa
 * nada.
 */
export function tramoTapado(r: number, ru: number, h: number): number {
  const f = (u: number) => h + ELIPSE * Math.sqrt(Math.max(0, ru * ru - u * u)) - ELIPSE * Math.sqrt(Math.max(0, r * r - u * u));
  if (f(0) < 0) return 0;
  if (f(ru) >= 0) return ru;
  let lo = 0;
  let hi = ru;
  for (let k = 0; k < 60; k++) {
    const m = (lo + hi) / 2;
    if (f(m) >= 0) lo = m;
    else hi = m;
  }
  return lo;
}

/**
 * Generatrices y medios arcos de tapa de cada pila. La base: arco de adelante
 * visible y de atrás oculto (IlustracionCuerpoGeometrico.tsx:253 del gratis).
 * La tapa de arriba de la pila, entera visible. En una unión, la tapa de abajo
 * tiene el arco de adelante visible y, del de atrás, oculto el tramo que tapa
 * el de encima (tramoTapado).
 */
export function trazosDePilas(pilas: Pila[]): { generatrices: [Coordenada, Coordenada][]; arcos: ArcoTapa[] } {
  const generatrices: [Coordenada, Coordenada][] = [];
  const arcos: ArcoTapa[] = [];
  for (const pila of pilas) {
    pila.cilindros.forEach((c, i) => {
      const { x, radio, y0, y1 } = c;
      for (const lado of [-1, 1]) generatrices.push([{ x: x + lado * radio, y: y0 }, { x: x + lado * radio, y: y1 }]);
      const arco = (cy: number, desde: number, hasta: number, visible: boolean) => arcos.push({ cx: x, cy, radio, desde, hasta, visible });
      arco(y0, Math.PI, 2 * Math.PI, true);
      arco(y0, 0, Math.PI, false);
      arco(y1, Math.PI, 2 * Math.PI, true);
      const encima = pila.cilindros[i + 1];
      const u = encima ? tramoTapado(radio, encima.radio, encima.y1 - encima.y0) : 0;
      if (u <= 0) {
        arco(y1, 0, Math.PI, true);
        return;
      }
      const th = Math.acos(Math.min(1, u / radio));
      arco(y1, 0, th, true);
      arco(y1, th, Math.PI - th, false);
      arco(y1, Math.PI - th, Math.PI, true);
    });
  }
  return { generatrices, arcos };
}

/* ---------- boceto en el plano y montaje en píxeles ---------- */

type ClaseTrazo = "visible" | "oculta" | "junta" | "radio";

interface CotaPlano {
  indice: number;
  a: Coordenada;
  b: Coordenada;
  rotulo: string;
  llave: boolean;
  /** Normal fija en píxeles (cilindros), o null: lejos del centro del dibujo (cajas). */
  normal: Coordenada | null;
  invertir: boolean;
}

interface Boceto {
  trazos: { clase: ClaseTrazo; a: Coordenada; b: Coordenada }[];
  arcos: ArcoTapa[];
  cotas: CotaPlano[];
  caja: { xMin: number; xMax: number; yMin: number; yMax: number };
}

const esCotaArista = (c: CotaCuerpo): c is CotaArista => "desde" in c;

const puntoDeArco = (a: Pick<ArcoTapa, "cx" | "cy" | "radio">, th: number): Coordenada => ({
  x: a.cx + a.radio * Math.cos(th),
  y: a.cy + ELIPSE * a.radio * Math.sin(th),
});

function muestrasDeArco(a: ArcoTapa, n = 24): Coordenada[] {
  return Array.from({ length: n + 1 }, (_, k) => puntoDeArco(a, a.desde + ((a.hasta - a.desde) * k) / n));
}

/** Lo que se dibuja, en unidades del plano (y hacia arriba), antes de escalar. */
function boceto(figura: FiguraCuerpoGeometrico): Boceto {
  const conOcultas = figura.ocultas !== false;
  const trazos: Boceto["trazos"] = [];
  let arcos: ArcoTapa[] = [];
  const cotas: CotaPlano[] = [];
  const pilas = pilasDe(figura);
  const cilindros = new Map(pilas.flatMap((p) => p.cilindros).map((c) => [c.pieza, c]));
  if (pilas.length > 0) {
    const { generatrices, arcos: todos } = trazosDePilas(pilas);
    for (const [a, b] of generatrices) trazos.push({ clase: "visible", a, b });
    arcos = todos.filter((a) => a.visible || conOcultas);
  } else {
    for (const t of tramosDeAristas(cajasDe(figura))) {
      if (t.clase === "junta" && !(t.visible && figura.juntas === true)) continue;
      if (t.clase === "pliegue" && !t.visible && !conOcultas) continue;
      trazos.push({ clase: t.clase === "junta" ? "junta" : t.visible ? "visible" : "oculta", a: proyectar(t.a), b: proyectar(t.b) });
    }
  }
  (figura.cotas ?? []).forEach((c, indice) => {
    if (esCotaArista(c)) {
      cotas.push({ indice, a: proyectar(c.desde), b: proyectar(c.hasta), rotulo: c.rotulo, llave: c.llave !== false, normal: null, invertir: c.lado === "interior" });
      return;
    }
    const cil = cilindros.get(c.pieza);
    if (!cil) return;
    const { x, radio: r, y0, y1 } = cil;
    const base = { indice, rotulo: c.rotulo, llave: c.llave !== false, invertir: false };
    if (c.medida === "radio") {
      const a = { x, y: y1 };
      const b = { x: x + r, y: y1 };
      trazos.push({ clase: "radio", a, b });
      cotas.push({ ...base, a, b, llave: false, normal: { x: 0, y: -1 } });
    } else if (c.medida === "diametro") {
      const abajo = c.lado === "abajo";
      const y = abajo ? y0 - ELIPSE * r : y1 + ELIPSE * r;
      cotas.push({ ...base, a: { x: x - r, y }, b: { x: x + r, y }, normal: { x: 0, y: abajo ? 1 : -1 } });
    } else {
      const derecha = c.lado === "derecha";
      const gx = derecha ? x + r : x - r;
      cotas.push({ ...base, a: { x: gx, y: y0 }, b: { x: gx, y: y1 }, normal: { x: derecha ? 1 : -1, y: 0 } });
    }
  });
  const puntos = [...trazos.flatMap((t) => [t.a, t.b]), ...arcos.flatMap((a) => muestrasDeArco(a))];
  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  const caja = puntos.length
    ? { xMin: Math.min(...xs), xMax: Math.max(...xs), yMin: Math.min(...ys), yMax: Math.max(...ys) }
    : { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  return { trazos, arcos, cotas, caja };
}

/** Un trazo del dibujo como segmento en píxeles, para las reglas de choque. */
export interface SegmentoCuerpo {
  clase: ClaseTrazo;
  a: Coordenada;
  b: Coordenada;
}

/** La línea media de una llave: se prueba con un ancho de ALTO_LLAVE. */
export interface BandaLlave {
  cota: number;
  a: Coordenada;
  b: Coordenada;
}

export interface GeometriaCuerpo {
  /** Píxeles por unidad. */
  s: number;
  ancho: number;
  alto: number;
  visibles: string[];
  ocultas: string[];
  juntas: string[];
  radios: string[];
  llaves: string[];
  rotulos: RotuloLienzo[];
  /** Índice de la cota de cada rótulo. */
  rotuloDeCota: number[];
  segmentos: SegmentoCuerpo[];
  bandas: BandaLlave[];
  /** Largo en píxeles de cada tramo acotado, por índice de cota (regla 47). */
  largoDeCota: Map<number, number>;
  /** Caja de todo lo dibujado (trazos, llaves y rótulos), en px del viewBox. */
  caja: CajaRotulo;
}

type Montaje = Omit<GeometriaCuerpo, "s" | "ancho" | "alto">;

const pathArco = (a: ArcoTapa, aPx: (p: Coordenada) => Coordenada, s: number) => {
  const p0 = aPx(puntoDeArco(a, a.desde));
  const p1 = aPx(puntoDeArco(a, a.hasta));
  const grande = a.hasta - a.desde > Math.PI + 1e-9 ? 1 : 0;
  /* Antihorario en el plano es antihorario en pantalla: sweep 0 con la y hacia abajo. */
  return `M ${pt(p0)} A ${r2(a.radio * s)} ${r2(ELIPSE * a.radio * s)} 0 ${grande} 0 ${pt(p1)}`;
};

function montar(b: Boceto, s: number, ox: number, oy: number): Montaje {
  const aPx = (p: Coordenada): Coordenada => ({ x: ox + p.x * s, y: oy - p.y * s });
  const visibles: string[] = [];
  const ocultas: string[] = [];
  const juntas: string[] = [];
  const radios: string[] = [];
  const segmentos: SegmentoCuerpo[] = [];
  for (const t of b.trazos) {
    const a = aPx(t.a);
    const c = aPx(t.b);
    segmentos.push({ clase: t.clase, a, b: c });
    const d = `M ${pt(a)} L ${pt(c)}`;
    ({ visible: visibles, oculta: ocultas, junta: juntas, radio: radios })[t.clase].push(d);
  }
  for (const arco of b.arcos) {
    (arco.visible ? visibles : ocultas).push(pathArco(arco, aPx, s));
    const muestras = muestrasDeArco(arco).map(aPx);
    for (let k = 0; k + 1 < muestras.length; k++) segmentos.push({ clase: arco.visible ? "visible" : "oculta", a: muestras[k], b: muestras[k + 1] });
  }
  const xs = segmentos.flatMap((g) => [g.a.x, g.b.x]);
  const ys = segmentos.flatMap((g) => [g.a.y, g.b.y]);
  const centro = xs.length ? { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 } : { x: ox, y: oy };
  const llaves: string[] = [];
  const bandas: BandaLlave[] = [];
  const rotulos: RotuloLienzo[] = [];
  const rotuloDeCota: number[] = [];
  const largoDeCota = new Map<number, number>();
  const extremos: Coordenada[] = [...segmentos.flatMap((g) => [g.a, g.b])];
  for (const c of b.cotas) {
    const A = aPx(c.a);
    const B = aPx(c.b);
    const medio = mul(add(A, B), 0.5);
    largoDeCota.set(c.indice, len(sub(B, A)));
    let n: Coordenada;
    if (c.normal) n = c.normal;
    else {
      const t = unit(sub(B, A));
      const n1 = { x: -t.y, y: t.x };
      const lejos = dot(sub(medio, centro), n1);
      n = Math.abs(lejos) > 1e-6 ? (lejos > 0 ? n1 : mul(n1, -1)) : n1.y <= 0 ? n1 : mul(n1, -1);
    }
    if (c.invertir) n = mul(n, -1);
    let distancia = SEPARACION;
    if (c.llave) {
      const a = add(A, mul(n, SEPARACION));
      const z = add(B, mul(n, SEPARACION));
      llaves.push(pathLlave(a, z, n, ALTO_LLAVE));
      bandas.push({ cota: c.indice, a: add(a, mul(n, ALTO_LLAVE / 2)), b: add(z, mul(n, ALTO_LLAVE / 2)) });
      extremos.push(a, z, add(a, mul(n, ALTO_LLAVE)), add(z, mul(n, ALTO_LLAVE)));
      distancia += ALTO_LLAVE + 3;
    }
    rotulos.push(rotuloEn(c.rotulo, medio, n, distancia, "segmento"));
    rotuloDeCota.push(c.indice);
  }
  const cajas = rotulos.map((r) => r.caja);
  const caja: CajaRotulo = {
    x0: Math.min(...extremos.map((p) => p.x), ...cajas.map((k) => k.x0)),
    y0: Math.min(...extremos.map((p) => p.y), ...cajas.map((k) => k.y0)),
    x1: Math.max(...extremos.map((p) => p.x), ...cajas.map((k) => k.x1)),
    y1: Math.max(...extremos.map((p) => p.y), ...cajas.map((k) => k.y1)),
  };
  return { visibles, ocultas, juntas, radios, llaves, rotulos, rotuloDeCota, segmentos, bandas, largoDeCota, caja };
}

/**
 * La geometría completa en el carril de la ubicación: la escala se ajusta para
 * que dibujo, llaves y rótulos ocupen el ancho del carril menos el margen, y
 * baja si el alto pasa de ALTO_MAXIMO. Las holguras de llaves y rótulos son
 * fijas en píxeles; las de las cotas en diagonal dependen de la escala, por eso
 * se itera. El dibujo va centrado.
 */
export function geometriaCuerpo(figura: FiguraCuerpoGeometrico, contexto: ContextoLienzo = "enunciado"): GeometriaCuerpo {
  const b = boceto(figura);
  const ancho = ANCHO_CARRIL[contexto];
  const util = ancho - 2 * MARGEN_CUERPO;
  const utilAlto = ALTO_MAXIMO - 2 * MARGEN_CUERPO;
  const bw = Math.max(b.caja.xMax - b.caja.xMin, 1e-9);
  const bh = Math.max(b.caja.yMax - b.caja.yMin, 1e-9);
  let s = util / bw;
  for (let k = 0; k < 40; k++) {
    const m = montar(b, s, 0, 0);
    const w = m.caja.x1 - m.caja.x0;
    const h = m.caja.y1 - m.caja.y0;
    const siguiente = Math.max(0.01, Math.min((util - (w - bw * s)) / bw, (utilAlto - (h - bh * s)) / bh));
    const cabe = w <= util + 1e-6 && h <= utilAlto + 1e-6;
    if (cabe && Math.abs(siguiente - s) < 1e-7) break;
    s = cabe ? siguiente : Math.min(siguiente, s * 0.999);
  }
  const m0 = montar(b, s, 0, 0);
  const w = m0.caja.x1 - m0.caja.x0;
  const h = m0.caja.y1 - m0.caja.y0;
  return { ...montar(b, s, (ancho - w) / 2 - m0.caja.x0, MARGEN_CUERPO - m0.caja.y0), s, ancho, alto: h + 2 * MARGEN_CUERPO };
}

/* ---------- lo que mide el validador ---------- */

export interface ProblemaCuerpo {
  /** Camino relativo a la figura: "", ".piezas[1]", ".cotas[0]". */
  donde: string;
  mensaje: string;
}

const volumenComun = (a: Caja, b: Caja) => EJES.reduce((v, e) => v * Math.max(0, Math.min(a.max[e], b.max[e]) - Math.max(a.min[e], b.min[e])), 1);

/** Dos cajas se tocan por una cara con área mayor que 0. */
function seTocanPorCara(a: Caja, b: Caja, eps: number): boolean {
  return EJES.some((e) => {
    const pegadas = Math.abs(a.max[e] - b.min[e]) <= eps || Math.abs(b.max[e] - a.min[e]) <= eps;
    return pegadas && EJES.filter((k) => k !== e).every((k) => Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]) > eps);
  });
}

/** Reglas 42 a 44 sin píxeles: una sola familia, juntas, cajas sin cruces y apoyadas, pilas que se angostan hacia arriba. */
export function problemasDeComposicion(figura: FiguraCuerpoGeometrico): ProblemaCuerpo[] {
  const problemas: ProblemaCuerpo[] = [];
  const hayCilindros = figura.piezas.some((p) => p.cuerpo === "cilindro");
  const hayCajas = figura.piezas.some((p) => p.cuerpo !== "cilindro");
  if (hayCajas && hayCilindros) return [{ donde: ".piezas", mensaje: "mezcla cajas y cilindros; una figura lleva solo cajas o solo cilindros" }];
  if (figura.juntas !== undefined && (hayCilindros || figura.piezas.length < 2)) problemas.push({ donde: ".juntas", mensaje: "solo va con dos o más cajas" });
  if (hayCajas) {
    const cajas = cajasDe(figura);
    const tam = tamanoDe(cajas);
    const eps = 1e-9 * tam;
    for (let i = 0; i < cajas.length; i++) {
      for (let j = i + 1; j < cajas.length; j++) {
        const v = volumenComun(cajas[i], cajas[j]);
        if (v > 1e-9 * tam ** 3) {
          problemas.push({ donde: "", mensaje: `piezas[${cajas[i].pieza}] y piezas[${cajas[j].pieza}] se cruzan (volumen común ${num(v)}); las cajas se tocan por una cara o van separadas` });
        }
      }
    }
    for (const c of cajas) {
      if (c.min.y < -eps) problemas.push({ donde: `.piezas[${c.pieza}]`, mensaje: "queda bajo el suelo (y menor que 0)" });
      else if (c.min.y > eps) {
        const apoya = cajas.some((o) => o !== c && Math.abs(o.max.y - c.min.y) <= eps && (["x", "z"] as Eje[]).every((k) => Math.min(o.max[k], c.max[k]) - Math.max(o.min[k], c.min[k]) > eps));
        if (!apoya) problemas.push({ donde: `.piezas[${c.pieza}]`, mensaje: "queda en el aire: su base no apoya en el suelo ni en la tapa de otra caja" });
      }
    }
  }
  for (const pila of pilasDe(figura)) {
    for (let i = 1; i < pila.cilindros.length; i++) {
      const [abajo, arriba] = [pila.cilindros[i - 1], pila.cilindros[i]];
      if (arriba.radio >= abajo.radio) {
        problemas.push({ donde: `.piezas[${arriba.pieza}]`, mensaje: `radio ${num(arriba.radio)} sobre un cilindro de radio ${num(abajo.radio)}; en una pila cada cilindro es más angosto que el de abajo` });
      }
    }
  }
  return problemas;
}

const ejeDe = (a: Coordenada3D, b: Coordenada3D, eps: number): Eje[] => EJES.filter((e) => Math.abs(b[e] - a[e]) > eps);

/** El intervalo [lo, hi] queda cubierto por la unión de los intervalos. */
function cubre(intervalos: [number, number][], lo: number, hi: number, eps: number): boolean {
  let hasta = lo;
  for (const [a, b] of [...intervalos].sort((x, y) => x[0] - y[0])) {
    if (a > hasta + eps) break;
    hasta = Math.max(hasta, b);
  }
  return hasta >= hi - eps;
}

/** Por qué el tramo de una cota de arista no va entero por aristas visibles dibujadas, o null si va. */
function motivoDeTramo(c: CotaArista, eje: Eje, tramos: TramoArista[], juntas: boolean, eps: number): string | null {
  const [u, v] = EJES.filter((e) => e !== eje);
  const lo = Math.min(c.desde[eje], c.hasta[eje]);
  const hi = Math.max(c.desde[eje], c.hasta[eje]);
  const sobre = tramos.filter((t) => {
    const ejes = ejeDe(t.a, t.b, eps);
    return ejes.length === 1 && ejes[0] === eje && Math.abs(t.a[u] - c.desde[u]) <= eps && Math.abs(t.a[v] - c.desde[v]) <= eps;
  });
  const intervalo = (t: TramoArista): [number, number] => [Math.min(t.a[eje], t.b[eje]), Math.max(t.a[eje], t.b[eje])];
  const solapa = (t: TramoArista) => {
    const [a, b] = intervalo(t);
    return Math.min(b, hi) - Math.max(a, lo) > eps;
  };
  if (cubre(sobre.filter((t) => t.visible && (t.clase === "pliegue" || juntas)).map(intervalo), lo, hi, eps)) return null;
  if (sobre.some((t) => t.clase === "pliegue" && !t.visible && solapa(t))) return "el tramo va por una arista oculta; una cota va sobre una arista que se ve";
  if (sobre.some((t) => t.clase === "junta" && solapa(t))) return "el tramo va por una junta que no se dibuja";
  return "el tramo no va por una arista del cuerpo";
}

/** Regla 45: cotas que existen, se ven y no se repiten. */
export function problemasDeCotas(figura: FiguraCuerpoGeometrico): ProblemaCuerpo[] {
  const problemas: ProblemaCuerpo[] = [];
  const deCilindros = figura.piezas.every((p) => p.cuerpo === "cilindro");
  const cajas = deCilindros ? [] : cajasDe(figura);
  const tramos = deCilindros ? [] : tramosDeAristas(cajas);
  const eps = 1e-9 * tamanoDe(cajas);
  const vistas = new Map<string, number>();
  (figura.cotas ?? []).forEach((c, j) => {
    const q = `.cotas[${j}]`;
    const repetida = (clave: string, que: string) => {
      if (vistas.has(clave)) problemas.push({ donde: q, mensaje: `repite ${que} de cotas[${vistas.get(clave)}]` });
      else vistas.set(clave, j);
    };
    if (esCotaArista(c)) {
      if (deCilindros) return problemas.push({ donde: q, mensaje: "es de arista y la figura es de cilindros" });
      const ejes = ejeDe(c.desde, c.hasta, eps);
      if (ejes.length === 0) return problemas.push({ donde: q, mensaje: "desde y hasta son el mismo punto" });
      if (ejes.length > 1) return problemas.push({ donde: q, mensaje: "no es paralela a un eje; una cota va sobre una arista" });
      const motivo = motivoDeTramo(c, ejes[0], tramos, figura.juntas === true, eps);
      if (motivo) problemas.push({ donde: q, mensaje: motivo });
      const k = (p: Coordenada3D) => EJES.map((e) => fmt(p[e])).join(",");
      repetida([k(c.desde), k(c.hasta)].sort().join("|"), "el tramo");
      return;
    }
    if (!deCilindros) return problemas.push({ donde: q, mensaje: "es de cilindro y la figura es de cajas" });
    if (figura.piezas[c.pieza] === undefined) return problemas.push({ donde: q, mensaje: `pieza ${c.pieza} no existe` });
    if (c.medida === "radio") {
      if (c.lado !== undefined) problemas.push({ donde: q, mensaje: "el radio no lleva lado: va sobre la tapa" });
      if (c.llave !== undefined) problemas.push({ donde: q, mensaje: "el radio no lleva llave: es un segmento sobre la tapa" });
    }
    if (c.medida === "diametro" && c.lado !== undefined && c.lado !== "arriba" && c.lado !== "abajo") problemas.push({ donde: q, mensaje: `el diámetro va arriba o abajo, no ${c.lado}` });
    if (c.medida === "altura" && c.lado !== undefined && c.lado !== "izquierda" && c.lado !== "derecha") problemas.push({ donde: q, mensaje: `la altura va a la izquierda o a la derecha, no ${c.lado}` });
    repetida(`${c.pieza}|${c.medida}`, "la medida");
    const otra = c.medida === "radio" ? "diametro" : c.medida === "diametro" ? "radio" : null;
    if (otra && vistas.has(`${c.pieza}|${otra}`) && vistas.get(`${c.pieza}|${otra}`) !== j) {
      problemas.push({ donde: q, mensaje: `radio y diámetro en la misma pieza (con cotas[${vistas.get(`${c.pieza}|${otra}`)}]); se muestra uno de los dos` });
    }
  });
  return problemas;
}

/** Largo en unidades del mundo del tramo que mide una cota, sin el escorzo de la profundidad. */
function largoEnElMundo(figura: FiguraCuerpoGeometrico, c: CotaCuerpo): number | null {
  if (esCotaArista(c)) return Math.hypot(c.hasta.x - c.desde.x, c.hasta.y - c.desde.y, c.hasta.z - c.desde.z);
  const p = figura.piezas[c.pieza];
  if (!p || p.cuerpo !== "cilindro") return null;
  return c.medida === "radio" ? p.radio : c.medida === "diametro" ? 2 * p.radio : p.altura;
}

/**
 * Regla 46: el dibujo no contradice a los rótulos. Entre dos cotas con rótulo
 * de longitud legible (parsearLongitud, misma unidad o convertible), el rótulo
 * mayor no va sobre el tramo más corto, y dos rótulos iguales van sobre tramos
 * iguales (1 %). No promete escala.
 */
export function problemasDeCoherencia(figura: FiguraCuerpoGeometrico): ProblemaCuerpo[] {
  const cotas = figura.cotas ?? [];
  const valores = longitudesComparables(cotas.map((c) => c.rotulo));
  const largos = cotas.map((c) => largoEnElMundo(figura, c));
  const problemas: ProblemaCuerpo[] = [];
  for (let i = 0; i < cotas.length; i++) {
    for (let j = i + 1; j < cotas.length; j++) {
      const [vi, vj, li, lj] = [valores[i], valores[j], largos[i], largos[j]];
      if (vi === null || vj === null || li === null || lj === null) continue;
      if (Math.abs(vi - vj) <= 1e-9 * Math.max(vi, vj)) {
        if (Math.abs(li - lj) > TOLERANCIA_IGUALES * Math.max(li, lj)) {
          problemas.push({ donde: "", mensaje: `«${cotas[i].rotulo}» y «${cotas[j].rotulo}» son iguales y sus tramos miden ${num(li)} y ${num(lj)}; iguala las medidas del dibujo` });
        }
        continue;
      }
      const [M, m] = vi > vj ? [i, j] : [j, i];
      if ((largos[M] as number) < (largos[m] as number) * (1 - 1e-9)) {
        problemas.push({ donde: "", mensaje: `«${cotas[M].rotulo}» es mayor que «${cotas[m].rotulo}» y su tramo se dibuja más corto (${num(largos[M] as number)} contra ${num(largos[m] as number)}); ajusta las medidas del dibujo` });
      }
    }
  }
  return problemas;
}

/** Tramos en x de pantalla que ocupa cada cuerpo separado (grupo de cajas unidas por cara, o pila), en px. */
function tramosSeparados(figura: FiguraCuerpoGeometrico, s: number): [number, number][] {
  const pilas = pilasDe(figura);
  if (pilas.length > 0) {
    return pilas.map((p) => {
      const r = Math.max(...p.cilindros.map((c) => c.radio));
      return [(p.x - r) * s, (p.x + r) * s];
    });
  }
  const cajas = cajasDe(figura);
  const eps = 1e-9 * tamanoDe(cajas);
  const grupo = cajas.map((_, i) => i);
  const raiz = (i: number): number => (grupo[i] === i ? i : (grupo[i] = raiz(grupo[i])));
  for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) if (seTocanPorCara(cajas[i], cajas[j], eps)) grupo[raiz(i)] = raiz(j);
  const porGrupo = new Map<number, [number, number]>();
  cajas.forEach((c, i) => {
    const xs = [proyectar(c.min).x, proyectar(c.max).x, c.max.x + K * c.min.z, c.min.x + K * c.max.z];
    const [a, b] = [Math.min(...xs) * s, Math.max(...xs) * s];
    const g = porGrupo.get(raiz(i));
    porGrupo.set(raiz(i), g ? [Math.min(g[0], a), Math.max(g[1], b)] : [a, b]);
  });
  return [...porGrupo.values()];
}

/**
 * Reglas 43 y 44 con píxeles (cuerpos separados con aire) y regla 47
 * (legibilidad), en el carril de la ubicación.
 */
export function problemasDeLegibilidad(figura: FiguraCuerpoGeometrico, contexto: ContextoLienzo = "enunciado"): ProblemaCuerpo[] {
  const g = geometriaCuerpo(figura, contexto);
  const { s, ancho } = g;
  const donde = `en el carril de ${ancho} px (${contexto})`;
  const problemas: ProblemaCuerpo[] = [];
  const separados = tramosSeparados(figura, s).sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < separados.length; i++) {
    const aire = separados[i][0] - separados[i - 1][1];
    if (aire < SEPARACION_GRUPOS - 1e-9) {
      problemas.push({ donde: "", mensaje: `dos cuerpos separados quedan a ${num(aire)} px ${donde}; el mínimo es ${SEPARACION_GRUPOS}: sepáralos más o júntalos por una cara` });
    }
  }
  figura.piezas.forEach((p, i) => {
    const q = `.piezas[${i}]`;
    if (p.cuerpo === "cilindro") {
      const razon = p.altura / p.radio;
      if (razon < ALTURA_RADIO_MIN - 1e-9 || razon > ALTURA_RADIO_MAX + 1e-9) {
        problemas.push({ donde: q, mensaje: `altura sobre radio = ${num(razon)}, fuera de ${num(ALTURA_RADIO_MIN)} a ${num(ALTURA_RADIO_MAX)}` });
      }
      const ry = ELIPSE * p.radio * s;
      if (ry < ELIPSE_MINIMA - 1e-9) problemas.push({ donde: q, mensaje: `la tapa mide ${num(ry)} px de alto ${donde}; el mínimo es ${ELIPSE_MINIMA}` });
      return;
    }
    const medidas: [string, number, number][] =
      p.cuerpo === "cubo"
        ? [["la arista de profundidad", p.arista, FACTOR_PROFUNDIDAD * p.arista * s]]
        : [
            ["el largo", p.largo, p.largo * s],
            ["el alto", p.alto, p.alto * s],
            ["el ancho (profundidad)", p.ancho, FACTOR_PROFUNDIDAD * p.ancho * s],
          ];
    if (p.cuerpo === "paralelepipedo") {
      const mayor = Math.max(p.largo, p.alto, p.ancho);
      const menor = Math.min(p.largo, p.alto, p.ancho);
      if (mayor / menor > RAZON_MAXIMA + 1e-9) {
        problemas.push({ donde: q, mensaje: `la medida mayor (${num(mayor)}) es ${num(mayor / menor)} veces la menor (${num(menor)}) y el tope es ${RAZON_MAXIMA}` });
      }
    }
    for (const [nombre, , px] of medidas) {
      if (px < ARISTA_VISIBLE_MINIMA - 1e-9) problemas.push({ donde: q, mensaje: `${nombre} mide ${num(px)} px ${donde}; el mínimo es ${ARISTA_VISIBLE_MINIMA}` });
    }
  });
  for (const [j, px] of g.largoDeCota) {
    if (px < ARISTA_ACOTADA_MINIMA - 1e-9) problemas.push({ donde: `.cotas[${j}]`, mensaje: `el tramo acotado mide ${num(px)} px ${donde}; el mínimo es ${ARISTA_ACOTADA_MINIMA}` });
  }
  return problemas;
}

export interface ChoqueCuerpo {
  clase: "rotulos" | "trazo" | "rotulo-llave" | "llaves" | "llave-trazo" | "fuera";
  a: string;
  b?: string;
}

const seTocan = (a: CajaRotulo, b: CajaRotulo, aire: number) => a.x0 < b.x1 + aire && b.x0 < a.x1 + aire && a.y0 < b.y1 + aire && b.y0 < a.y1 + aire;

/** El segmento a-b toca la caja agrandada en `margen` (recorte de Liang-Barsky). */
function segmentoTocaCaja(a: Coordenada, b: Coordenada, c: CajaRotulo, margen: number): boolean {
  const d = sub(b, a);
  let t0 = 0;
  let t1 = 1;
  const bordes: [number, number][] = [
    [-d.x, a.x - (c.x0 - margen)],
    [d.x, c.x1 + margen - a.x],
    [-d.y, a.y - (c.y0 - margen)],
    [d.y, c.y1 + margen - a.y],
  ];
  for (const [p, q] of bordes) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return true;
}

/** Distancia entre dos segmentos. */
function distanciaEntreSegmentos(p1: Coordenada, p2: Coordenada, q1: Coordenada, q2: Coordenada): number {
  const d1 = sub(p2, p1);
  const d2 = sub(q2, q1);
  const den = cross(d1, d2);
  if (Math.abs(den) > 1e-12) {
    const t = cross(sub(q1, p1), d2) / den;
    const u = cross(sub(q1, p1), d1) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0;
  }
  const alSegmento = (p: Coordenada, a: Coordenada, b: Coordenada) => {
    const ab = sub(b, a);
    const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / Math.max(dot(ab, ab), 1e-12)));
    return len(sub(p, add(a, mul(ab, t))));
  };
  return Math.min(alSegmento(p1, q1, q2), alSegmento(p2, q1, q2), alSegmento(q1, p1, p2), alSegmento(q2, p1, p2));
}

/**
 * Regla 48, en el carril de la ubicación y con letra de 12 px: rótulos que se
 * pisan, rótulos sobre un trazo del cuerpo o sobre la llave de otra cota,
 * llaves que se cruzan o cortan un trazo, y lo que se sale del viewBox. Con
 * `ocultas: false` las ocultas no se dibujan y no cuentan. Un rótulo sí puede
 * quedar sobre una cara.
 */
export function choquesDeCuerpo(figura: FiguraCuerpoGeometrico, contexto: ContextoLienzo = "enunciado"): ChoqueCuerpo[] {
  const g = geometriaCuerpo(figura, contexto);
  const choques: ChoqueCuerpo[] = [];
  const cotas = figura.cotas ?? [];
  const rotuloDe = (indice: number) => cotas[indice]?.rotulo ?? "";
  const { rotulos, bandas, segmentos } = g;
  for (let i = 0; i < rotulos.length; i++) {
    for (let j = i + 1; j < rotulos.length; j++) {
      if (seTocan(rotulos[i].caja, rotulos[j].caja, AIRE)) choques.push({ clase: "rotulos", a: rotulos[i].texto, b: rotulos[j].texto });
    }
  }
  rotulos.forEach((r, i) => {
    const propia = g.rotuloDeCota[i];
    if (segmentos.some((sg) => segmentoTocaCaja(sg.a, sg.b, r.caja, AIRE))) choques.push({ clase: "trazo", a: r.texto });
    for (const banda of bandas) {
      if (banda.cota !== propia && segmentoTocaCaja(banda.a, banda.b, r.caja, ALTO_LLAVE / 2)) choques.push({ clase: "rotulo-llave", a: r.texto, b: rotuloDe(banda.cota) });
    }
    const c = r.caja;
    if (c.x0 < 0 || c.y0 < 0 || c.x1 > g.ancho || c.y1 > g.alto) choques.push({ clase: "fuera", a: r.texto });
  });
  /* Entre llaves se comparan sin sus puntas, que se curvan hacia la arista (el
     q de pathLlave): dos llaves de un mismo vértice, como largo y profundidad
     en la esquina de abajo a la derecha, se acercan ahí sin pisarse. */
  const sinPuntas = (banda: BandaLlave): [Coordenada, Coordenada] => {
    const d = sub(banda.b, banda.a);
    const q = Math.min(ALTO_LLAVE, len(d) / 4);
    const t = unit(d);
    return [add(banda.a, mul(t, q)), add(banda.b, mul(t, -q))];
  };
  for (let i = 0; i < bandas.length; i++) {
    for (let j = i + 1; j < bandas.length; j++) {
      if (distanciaEntreSegmentos(...sinPuntas(bandas[i]), ...sinPuntas(bandas[j])) < ALTO_LLAVE) {
        choques.push({ clase: "llaves", a: rotuloDe(bandas[i].cota), b: rotuloDe(bandas[j].cota) });
      }
    }
    if (segmentos.some((sg) => distanciaEntreSegmentos(bandas[i].a, bandas[i].b, sg.a, sg.b) < ALTO_LLAVE / 2)) {
      choques.push({ clase: "llave-trazo", a: rotuloDe(bandas[i].cota) });
    }
  }
  return choques;
}
