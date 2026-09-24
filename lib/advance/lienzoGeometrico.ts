import type { ArcoLienzo, CardinalLienzo, Coordenada, FiguraLienzoGeometrico, SegmentoLienzo } from "./descarte.ts";
import { anchoTexto } from "./diagramaCajon.ts";

/**
 * Motor del lienzo geométrico de Advance (components/advance/figuras/
 * LienzoGeometrico.tsx). Puro, sin React y sin DOM: pasa del mundo a píxeles,
 * ubica cada rótulo, arma los paths de sectores y regiones, y responde las
 * preguntas del validador (scripts/validar-contenido.mjs, reglas 28 a 39): si
 * un rótulo calza con lo dibujado, si dos rótulos se pisan, cuánto mide la
 * figura. Una sola geometría para el dibujo y para las reglas.
 *
 * Declarativo (13a, firmado): coordenadas del mundo con y hacia arriba en una
 * ventana declarada. La escala es una sola en x e y (la figura va a escala) y
 * la fija el ancho: la ventana ocupa el carril menos el margen, y el alto sale
 * de la proporción de la ventana. Quien escribe el banco controla el tamaño con
 * la ventana; si la figura queda más alta que ALTO_MAXIMO, el validador lo dice.
 *
 * Legibilidad medida (13f): el viewBox tiene el ancho del carril real a 390 px
 * de viewport, así que una unidad es un píxel y la letra de 12 unidades se ve
 * de 12 px, también dentro de una alternativa. Los rótulos se ubican en
 * píxeles, no en unidades del mundo: la letra no cambia con la escala.
 */

export type ContextoLienzo = "enunciado" | "alternativa" | "solucion";

/**
 * Ancho del carril a 390 × 844, medido el 2026-09-23 en /advance/descarte y
 * /advance/triage (scratchpad/figuras-geometricas/carriles.mjs):
 * - enunciado: el carril de EjecutorDescarte e ItemTriage, 358 px;
 * - alternativa: el panel de FiguraDeAlternativa, 316 px (interior de la
 *   alternativa, 324, menos el p-1 del panel);
 * - solucion: el interior de la tarjeta de solución de EjecutorDescarte, 330 px.
 */
export const ANCHO_CARRIL: Record<ContextoLienzo, number> = { enunciado: 358, alternativa: 316, solucion: 330 };
/** Alto renderizado máximo (13f), en píxeles a 390. */
export const ALTO_MAXIMO = 320;
/** Letra de todo texto del lienzo, en unidades (= px a 390). */
export const LETRA = 12;
/** Margen alrededor de la ventana, para los rótulos que van por fuera de la figura. */
export const MARGEN = 20;
/** Fila de la nota "no está a escala", bajo el dibujo. */
export const FILA_NOTA = LETRA + 10;

/** Trazos (13g): el contorno más grueso que los auxiliares, que van punteados. */
export const TRAZO_CONTORNO = 2;
export const TRAZO_AUXILIAR = 1.25;
export const DASH_AUXILIAR = "5 4";
export const TRAZO_MARCA = 1.25;

/** Marcas y rótulos, en píxeles. */
export const RADIO_MARCA_ANGULO = 14;
export const LADO_MARCA_RECTO = 10;
export const SEPARACION = 5;
export const BANDA_ACHURADO = 7;
export const PASO_ACHURADO = 6;
export const ALTO_LLAVE = 7;
export const RADIO_PUNTO_MARCADO = 3;
/** Radio del vértice para decidir si un rótulo lo tapa. */
export const RADIO_VERTICE = 3;
/** Aire mínimo entre dos rótulos. */
export const AIRE = 1;
export const LARGO_RAYA = 8;
export const PUNTA_FLECHA = 8;
/** Celda mínima de la cuadrícula en píxeles (regla 38). */
export const CELDA_MINIMA = 8;

/** Topes (13j): el máximo del inventario (docs/analisis/material-referencia/figuras-geometria-plana.md) y uno menor en alternativas. */
export interface TopesLienzo {
  puntos: number;
  segmentos: number;
  formas: number;
  rotulos: number;
}
export const TOPES: Record<ContextoLienzo, TopesLienzo> = {
  enunciado: { puntos: 24, segmentos: 24, formas: 10, rotulos: 20 },
  alternativa: { puntos: 12, segmentos: 12, formas: 5, rotulos: 10 },
  solucion: { puntos: 24, segmentos: 24, formas: 10, rotulos: 20 },
};

/** Tolerancias firmadas (13d). */
export const TOLERANCIA_LONGITUD = 0.01;
export const TOLERANCIA_GRADOS = 1;
export const TOLERANCIA_RECTO = 0.5;
export const TOLERANCIA_PARALELAS = 0.5;

/* ---------- parser de rótulos (13d) ---------- */

export type UnidadLongitud = "mm" | "cm" | "m" | "km" | "u";
const METROS: Record<Exclude<UnidadLongitud, "u">, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };

/** Entero con punto de miles opcional y decimal con coma: 12, 1.250, 2,5. */
const NUM = String.raw`(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?`;
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const FORMAS_NUMERO: [RegExp, (m: RegExpMatchArray) => number][] = [
  [new RegExp(`^(${NUM})$`), (m) => num(m[1])],
  [new RegExp(`^(${NUM})/(${NUM})$`), (m) => num(m[1]) / num(m[2])],
  [new RegExp(`^√(${NUM})$`), (m) => Math.sqrt(num(m[1]))],
  [new RegExp(`^(${NUM})√(${NUM})$`), (m) => num(m[1]) * Math.sqrt(num(m[2]))],
  [new RegExp(`^(${NUM})?π$`), (m) => (m[1] ? num(m[1]) : 1) * Math.PI],
  [new RegExp(`^(${NUM})?π/(${NUM})$`), (m) => ((m[1] ? num(m[1]) : 1) * Math.PI) / num(m[2])],
];

/**
 * Valor de un rótulo de longitud: entero, decimal con coma, fracción a/b, √b,
 * a√b, aπ y aπ/b, con unidad opcional (cm, m, mm, km o u). Cualquier otra cosa
 * (letras que no son unidad, expresiones, áreas) no es una longitud verificable
 * y devuelve null.
 */
export function parsearLongitud(rotulo: string): { valor: number; unidad: UnidadLongitud | null } | null {
  const t = rotulo.trim();
  const conUnidad = t.match(/^(.*?)\s*(mm|cm|km|m|u)$/);
  const cuerpo = (conUnidad ? conUnidad[1] : t).replace(/\s+/g, "");
  const unidad = conUnidad ? (conUnidad[2] as UnidadLongitud) : null;
  if (cuerpo === "") return null;
  for (const [re, valor] of FORMAS_NUMERO) {
    const m = cuerpo.match(re);
    if (m) {
      const v = valor(m);
      return Number.isFinite(v) && v > 0 ? { valor: v, unidad } : null;
    }
  }
  return null;
}

/** Grados de un rótulo como "40°" o "12,5 °"; null si no es un ángulo en grados. */
export function parsearGrados(rotulo: string): number | null {
  const m = rotulo.trim().match(new RegExp(`^(${NUM})\\s*°$`));
  return m ? num(m[1]) : null;
}

/**
 * Longitudes de los rótulos en una misma unidad: la primera unidad física que
 * aparece (mm, cm, m o km) manda; "u" y los números sin unidad se leen en ella.
 */
export function longitudesComparables(rotulos: string[]): (number | null)[] {
  const leidos = rotulos.map(parsearLongitud);
  const base = leidos.find((l) => l && l.unidad && l.unidad !== "u")?.unidad as Exclude<UnidadLongitud, "u"> | undefined;
  return leidos.map((l) => {
    if (!l) return null;
    if (!base || !l.unidad || l.unidad === "u") return l.valor;
    return (l.valor * METROS[l.unidad]) / METROS[base];
  });
}

/** Texto plano: sin markdown ni LaTeX (13e). */
export const FUERA_DE_TEXTO_PLANO = /[$\\*_^`{}#]|\[|\]/;

/* ---------- mundo a píxeles ---------- */

export interface Escala {
  /** Píxeles por unidad del mundo. */
  s: number;
  ancho: number;
  /** Alto del dibujo, sin la nota. */
  altoDibujo: number;
  /** Alto total del viewBox: el dibujo más la nota si no está a escala. */
  alto: number;
  aPx: (p: Coordenada) => Coordenada;
}

export function escalaLienzo(figura: Pick<FiguraLienzoGeometrico, "ventana" | "aEscala">, contexto: ContextoLienzo = "enunciado"): Escala {
  const { xMin, xMax, yMin, yMax } = figura.ventana;
  const ancho = ANCHO_CARRIL[contexto];
  const s = (ancho - 2 * MARGEN) / (xMax - xMin);
  const altoDibujo = (yMax - yMin) * s + 2 * MARGEN;
  const alto = altoDibujo + (figura.aEscala === false ? FILA_NOTA : 0);
  return { s, ancho, altoDibujo, alto, aPx: (p) => ({ x: MARGEN + (p.x - xMin) * s, y: MARGEN + (yMax - p.y) * s }) };
}

/* ---------- vectores ---------- */

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
const r = (v: number) => Math.round(v * 100) / 100;
const pt = (p: Coordenada) => `${r(p.x)} ${r(p.y)}`;

/** Ángulo entre dos rayos, en grados, siempre el menor (0 a 180). */
export function anguloEntre(u: Coordenada, v: Coordenada): number {
  const c = Math.max(-1, Math.min(1, dot(unit(u), unit(v))));
  return (Math.acos(c) * 180) / Math.PI;
}

/** Barrido de un arco en grados, de `desde` a `hasta` en sentido antihorario, en (0, 360]. */
export function barridoDe(arco: Pick<ArcoLienzo, "desde" | "hasta">): number {
  const b = (((arco.hasta - arco.desde) % 360) + 360) % 360;
  return b === 0 ? 360 : b;
}

/** Caja que encierra un arco (o un sector, con el centro), en coordenadas del mundo. */
export function cajaDeArco(arco: ArcoLienzo, centro: Coordenada): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const barrido = barridoDe(arco);
  const angulos = [arco.desde, arco.desde + barrido];
  for (let k = Math.ceil(arco.desde / 90) * 90; k < arco.desde + barrido; k += 90) angulos.push(k);
  const ps = angulos.map((a) => ({ x: centro.x + arco.radio * Math.cos((a * Math.PI) / 180), y: centro.y + arco.radio * Math.sin((a * Math.PI) / 180) }));
  if (arco.clase === "sector") ps.push(centro);
  return {
    xMin: Math.min(...ps.map((p) => p.x)),
    xMax: Math.max(...ps.map((p) => p.x)),
    yMin: Math.min(...ps.map((p) => p.y)),
    yMax: Math.max(...ps.map((p) => p.y)),
  };
}

/* ---------- paths ---------- */

/** Punto de un arco en píxeles: el ángulo del mundo es antihorario con y hacia arriba. */
function puntoEnArco(c: Coordenada, rp: number, grados: number): Coordenada {
  const t = (grados * Math.PI) / 180;
  return { x: c.x + rp * Math.cos(t), y: c.y - rp * Math.sin(t) };
}

/**
 * Path de un arco o sector en píxeles. Antihorario en el mundo sigue siendo
 * antihorario a la vista, que en SVG (y hacia abajo) es sweep-flag 0.
 */
export function pathArco(arco: Pick<ArcoLienzo, "clase" | "radio" | "desde" | "hasta">, centroPx: Coordenada, s: number): string {
  const rp = arco.radio * s;
  const barrido = barridoDe(arco);
  const p0 = puntoEnArco(centroPx, rp, arco.desde);
  const p1 = puntoEnArco(centroPx, rp, arco.desde + barrido);
  const grande = barrido > 180 ? 1 : 0;
  const curva = `A ${r(rp)} ${r(rp)} 0 ${grande} 0 ${pt(p1)}`;
  return arco.clase === "sector" ? `M ${pt(centroPx)} L ${pt(p0)} ${curva} Z` : `M ${pt(p0)} ${curva}`;
}

export const pathPoligono = (vertices: Coordenada[]) => `M ${vertices.map(pt).join(" L ")} Z`;

/** Una forma cerrada lista para dibujar o para una máscara. */
export type FormaPx = { clase: "path"; d: string } | { clase: "circulo"; cx: number; cy: number; r: number };

/* ---------- rótulos ---------- */

export interface CajaRotulo {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface RotuloLienzo {
  texto: string;
  /** Centro del rótulo: se dibuja con textAnchor middle y dy 0.35em. */
  x: number;
  y: number;
  caja: CajaRotulo;
  origen: "punto" | "segmento" | "arco" | "angulo" | "texto";
}

const ALTO_ROTULO = LETRA;

/** Cuánto se extiende la caja de un rótulo en la dirección `d` desde su centro. */
function extension(d: Coordenada, ancho: number, alto: number): number {
  return (Math.abs(d.x) * ancho) / 2 + (Math.abs(d.y) * alto) / 2;
}

export function rotuloEn(texto: string, ancla: Coordenada, d: Coordenada, distancia: number, origen: RotuloLienzo["origen"]): RotuloLienzo {
  const ancho = anchoTexto(texto, LETRA);
  const c = add(ancla, mul(d, distancia + extension(d, ancho, ALTO_ROTULO)));
  return { texto, x: c.x, y: c.y, caja: { x0: c.x - ancho / 2, y0: c.y - ALTO_ROTULO / 2, x1: c.x + ancho / 2, y1: c.y + ALTO_ROTULO / 2 }, origen };
}

const CARDINAL: Record<CardinalLienzo, Coordenada> = {
  n: { x: 0, y: -1 },
  ne: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
  e: { x: 1, y: 0 },
  se: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  s: { x: 0, y: 1 },
  so: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
  o: { x: -1, y: 0 },
  no: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
};

/**
 * Hacia dónde va el rótulo de un punto: al medio del mayor ángulo libre entre
 * los trazos que llegan al punto (lados de polígonos, segmentos, radios de
 * sectores, tangentes de las circunferencias que pasan por él). En un vértice
 * convexo ese ángulo libre es el de afuera; en uno cóncavo (la esquina interior
 * de una L) el mayor queda adentro, así que se toma el mayor cuya bisectriz no
 * cae dentro de un polígono (`adentro`). Sin trazos, se aleja del centro de la
 * figura. Un empate se resuelve hacia afuera.
 */
export function direccionDeRotulo(direcciones: Coordenada[], desdeCentro: Coordenada, adentro: (d: Coordenada) => boolean = () => false): Coordenada {
  const afuera = len(desdeCentro) > 1e-6 ? unit(desdeCentro) : CARDINAL.ne;
  if (direcciones.length === 0) return afuera;
  const angulos = direcciones.map((d) => Math.atan2(d.y, d.x)).sort((a, b) => a - b);
  const huecos = angulos.map((a, i) => {
    const b = i + 1 < angulos.length ? angulos[i + 1] : angulos[0] + 2 * Math.PI;
    const g = b - a;
    return { g, medio: { x: Math.cos(a + g / 2), y: Math.sin(a + g / 2) } };
  });
  huecos.sort((h, k) => (Math.abs(h.g - k.g) > 1e-6 ? k.g - h.g : dot(k.medio, afuera) - dot(h.medio, afuera)));
  return (huecos.find((h) => !adentro(h.medio)) ?? huecos[0]).medio;
}

/* ---------- geometría completa ---------- */

export interface SegmentoPx {
  indice: number;
  p1: Coordenada;
  p2: Coordenada;
  trazo: "continuo" | "punteado";
  /** Normal del lado donde va lo que acompaña al segmento. */
  normal: Coordenada;
  marcas: string[];
  llave: string | null;
  achurado: string | null;
  flecha: string | null;
}

export interface AnguloPx {
  indice: number;
  d: string;
  grados: number;
}

export interface RegionPx {
  formas: FormaPx[];
  huecos: FormaPx[];
  estilo: "rayado" | "punteado";
}

export interface GeometriaLienzo extends Escala {
  puntos: Map<string, Coordenada>;
  poligonos: string[];
  circunferencias: { cx: number; cy: number; r: number }[];
  arcos: string[];
  segmentos: SegmentoPx[];
  angulos: AnguloPx[];
  regiones: RegionPx[];
  marcados: Coordenada[];
  cuadricula: { x1: number; y1: number; x2: number; y2: number }[];
  rotulos: RotuloLienzo[];
  nota: Coordenada | null;
}

/** Punto dentro de un polígono (par-impar), en píxeles. */
function dentroDePoligono(p: Coordenada, vs: Coordenada[]): boolean {
  let dentro = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const a = vs[i];
    const b = vs[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
}

/** El segmento une dos vértices consecutivos de algún polígono: devuelve ese polígono en píxeles. */
function poligonoDelLado(figura: FiguraLienzoGeometrico, seg: SegmentoLienzo, puntos: Map<string, Coordenada>): Coordenada[] | null {
  for (const pol of figura.poligonos ?? []) {
    const n = pol.vertices.length;
    for (let i = 0; i < n; i++) {
      const a = pol.vertices[i];
      const b = pol.vertices[(i + 1) % n];
      if ((a === seg.desde && b === seg.hasta) || (a === seg.hasta && b === seg.desde)) {
        return pol.vertices.map((v) => puntos.get(v) as Coordenada);
      }
    }
  }
  return null;
}

/** Dos segmentos sobre la misma recta que se tocan: para apilar la cota de uno sobre el achurado del otro. */
function colinealesQueSeTocan(a1: Coordenada, a2: Coordenada, b1: Coordenada, b2: Coordenada): boolean {
  const t = unit(sub(a2, a1));
  const lejos = (p: Coordenada) => Math.abs(cross(t, sub(p, a1)));
  if (lejos(b1) > 0.5 || lejos(b2) > 0.5) return false;
  const proy = (p: Coordenada) => dot(sub(p, a1), t);
  const [aMin, aMax] = [0, len(sub(a2, a1))];
  const [bMin, bMax] = [Math.min(proy(b1), proy(b2)), Math.max(proy(b1), proy(b2))];
  return bMin <= aMax + 0.5 && aMin <= bMax + 0.5;
}

/** Llave de cota entre a y b, con la punta hacia n a `alto` del segmento a-b. */
export function pathLlave(a: Coordenada, b: Coordenada, n: Coordenada, alto: number): string {
  const t = unit(sub(b, a));
  const m = mul(add(a, b), 0.5);
  const q = Math.min(alto, len(sub(b, a)) / 4);
  const h = mul(n, alto / 2);
  const p = (base: Coordenada, dt: number, dn: number) => add(add(base, mul(t, dt)), mul(n, dn));
  return [
    `M ${pt(a)}`,
    `Q ${pt(add(a, h))} ${pt(p(a, q, alto / 2))}`,
    `L ${pt(p(m, -q, alto / 2))}`,
    `Q ${pt(add(m, h))} ${pt(add(m, mul(n, alto)))}`,
    `Q ${pt(add(m, h))} ${pt(p(m, q, alto / 2))}`,
    `L ${pt(p(b, -q, alto / 2))}`,
    `Q ${pt(add(b, h))} ${pt(b)}`,
  ].join(" ");
}

/** Rayas cortas y oblicuas del lado n de a-b: suelo o muro. */
function pathAchurado(a: Coordenada, b: Coordenada, n: Coordenada): string {
  const t = unit(sub(b, a));
  const largo = len(sub(b, a));
  const partes: string[] = [];
  for (let k = PASO_ACHURADO / 2; k <= largo; k += PASO_ACHURADO) {
    const q = add(a, mul(t, k));
    const fin = add(add(q, mul(n, BANDA_ACHURADO)), mul(t, -BANDA_ACHURADO * 0.7));
    partes.push(`M ${pt(q)} L ${pt(fin)}`);
  }
  return partes.join(" ");
}

/** Rayas de igualdad (perpendiculares) o flechas de paralelismo (chevrones) centradas en `c`. */
function pathMarcas(c: Coordenada, t: Coordenada, cantidad: number, clase: "igualdad" | "paralelismo"): string {
  const n = { x: -t.y, y: t.x };
  const partes: string[] = [];
  for (let k = 0; k < cantidad; k++) {
    const q = add(c, mul(t, (k - (cantidad - 1) / 2) * 4));
    if (clase === "igualdad") {
      partes.push(`M ${pt(add(q, mul(n, LARGO_RAYA / 2)))} L ${pt(add(q, mul(n, -LARGO_RAYA / 2)))}`);
    } else {
      const atras = add(q, mul(t, -3.5));
      partes.push(`M ${pt(add(atras, mul(n, 3.5)))} L ${pt(add(q, mul(t, 1)))} L ${pt(add(atras, mul(n, -3.5)))}`);
    }
  }
  return partes.join(" ");
}

function pathFlecha(desde: Coordenada, hasta: Coordenada): string {
  const t = unit(sub(hasta, desde));
  const n = { x: -t.y, y: t.x };
  const base = add(hasta, mul(t, -PUNTA_FLECHA));
  return `M ${pt(hasta)} L ${pt(add(base, mul(n, PUNTA_FLECHA * 0.45)))} L ${pt(add(base, mul(n, -PUNTA_FLECHA * 0.45)))} Z`;
}

/**
 * Toda la geometría de una figura que ya pasó las reglas de forma y de
 * referencias (28, 29 y 36): puntos, trazos, marcas, regiones y rótulos en
 * píxeles del viewBox. El componente la dibuja y el validador la mide.
 */
export function geometriaLienzo(figura: FiguraLienzoGeometrico, contexto: ContextoLienzo = "enunciado"): GeometriaLienzo {
  const esc = escalaLienzo(figura, contexto);
  const { aPx, s } = esc;
  const puntos = new Map(figura.puntos.map((p) => [p.nombre, aPx(p)] as const));
  const P = (nombre: string) => puntos.get(nombre) as Coordenada;
  const todos = [...puntos.values()];
  const centro = todos.length
    ? { x: (Math.min(...todos.map((p) => p.x)) + Math.max(...todos.map((p) => p.x))) / 2, y: (Math.min(...todos.map((p) => p.y)) + Math.max(...todos.map((p) => p.y))) / 2 }
    : { x: esc.ancho / 2, y: esc.altoDibujo / 2 };

  const segmentos = figura.segmentos ?? [];
  const poligonos = figura.poligonos ?? [];
  const circunferencias = figura.circunferencias ?? [];
  const arcos = figura.arcos ?? [];
  const angulos = figura.angulos ?? [];

  /* Formas cerradas por id, para las regiones. */
  const formaPorId = new Map<string, FormaPx>();
  poligonos.forEach((pol) => pol.id && formaPorId.set(pol.id, { clase: "path", d: pathPoligono(pol.vertices.map(P)) }));
  circunferencias.forEach((c) => c.id && formaPorId.set(c.id, { clase: "circulo", cx: P(c.centro).x, cy: P(c.centro).y, r: c.radio * s }));
  arcos.forEach((a) => a.id && a.clase === "sector" && formaPorId.set(a.id, { clase: "path", d: pathArco(a, P(a.centro), s) }));

  /* Segmentos: lado, marcas, llave, achurado y flecha. */
  const segmentosPx: SegmentoPx[] = segmentos.map((seg, indice) => {
    const p1 = P(seg.desde);
    const p2 = P(seg.hasta);
    const t = unit(sub(p2, p1));
    const n1 = { x: -t.y, y: t.x };
    const medio = mul(add(p1, p2), 0.5);
    const pol = poligonoDelLado(figura, seg, puntos);
    let exterior: Coordenada;
    if (pol) {
      exterior = dentroDePoligono(add(medio, mul(n1, 0.75)), pol) ? mul(n1, -1) : n1;
    } else {
      const lejos = dot(sub(medio, centro), n1);
      exterior = Math.abs(lejos) > 1e-6 ? (lejos > 0 ? n1 : mul(n1, -1)) : n1.y <= 0 ? n1 : mul(n1, -1);
    }
    const normal = seg.lado === "interior" ? mul(exterior, -1) : exterior;
    const marcas: string[] = [];
    if (seg.igualdad) marcas.push(pathMarcas(seg.paralelismo ? add(p1, mul(sub(p2, p1), 0.62)) : medio, t, seg.igualdad, "igualdad"));
    if (seg.paralelismo) marcas.push(pathMarcas(seg.igualdad ? add(p1, mul(sub(p2, p1), 0.38)) : medio, t, seg.paralelismo, "paralelismo"));
    return {
      indice,
      p1,
      p2,
      trazo: seg.trazo ?? "continuo",
      normal,
      marcas,
      llave: null,
      achurado: seg.achurado ? pathAchurado(p1, p2, normal) : null,
      flecha: seg.flecha ? pathFlecha(p1, p2) : null,
    };
  });

  /* Separación del rótulo de cada segmento: su achurado (o el de un segmento colineal del mismo lado) y su llave. */
  const rotulos: RotuloLienzo[] = [];
  segmentos.forEach((seg, i) => {
    const sp = segmentosPx[i];
    const conBanda =
      seg.achurado ||
      segmentosPx.some((o, j) => j !== i && segmentos[j].achurado && dot(o.normal, sp.normal) > 0.99 && colinealesQueSeTocan(sp.p1, sp.p2, o.p1, o.p2));
    let distancia = SEPARACION + (conBanda ? BANDA_ACHURADO : 0);
    if (seg.cota) {
      const a = add(sp.p1, mul(sp.normal, distancia));
      const b = add(sp.p2, mul(sp.normal, distancia));
      sp.llave = pathLlave(a, b, sp.normal, ALTO_LLAVE);
      distancia += ALTO_LLAVE + 3;
    }
    if (seg.rotulo) rotulos.push(rotuloEn(seg.rotulo, mul(add(sp.p1, sp.p2), 0.5), sp.normal, distancia, "segmento"));
  });

  /* Ángulos: cuadrado o arco del lado del ángulo menor, rótulo sobre la bisectriz. */
  const angulosPx: AnguloPx[] = angulos.map((ang, indice) => {
    const v = P(ang.vertice);
    const u1 = unit(sub(P(ang.desde), v));
    const u2 = unit(sub(P(ang.hasta), v));
    const grados = anguloEntre(u1, u2);
    let d: string;
    let alcance: number;
    if (ang.marca === "recto") {
      const a = add(v, mul(u1, LADO_MARCA_RECTO));
      const b = add(add(v, mul(u1, LADO_MARCA_RECTO)), mul(u2, LADO_MARCA_RECTO));
      const c = add(v, mul(u2, LADO_MARCA_RECTO));
      d = `M ${pt(a)} L ${pt(b)} L ${pt(c)}`;
      alcance = LADO_MARCA_RECTO * Math.SQRT2;
    } else {
      const a = add(v, mul(u1, RADIO_MARCA_ANGULO));
      const c = add(v, mul(u2, RADIO_MARCA_ANGULO));
      d = `M ${pt(a)} A ${RADIO_MARCA_ANGULO} ${RADIO_MARCA_ANGULO} 0 0 ${cross(u1, u2) > 0 ? 1 : 0} ${pt(c)}`;
      alcance = RADIO_MARCA_ANGULO;
    }
    if (ang.rotulo) {
      const bis = len(add(u1, u2)) > 1e-6 ? unit(add(u1, u2)) : { x: -u1.y, y: u1.x };
      const ancho = anchoTexto(ang.rotulo, LETRA);
      const medio = ((grados / 2) * Math.PI) / 180;
      /* Que la caja no toque ninguno de los dos rayos: su distancia al rayo es D·sen(θ/2). */
      const holgura = (Math.max(ancho, ALTO_ROTULO) / 2 + 2) / Math.max(Math.sin(medio), 0.05);
      const distancia = Math.max(alcance + SEPARACION, holgura - extension(bis, ancho, ALTO_ROTULO));
      rotulos.push(rotuloEn(ang.rotulo, v, bis, distancia, "angulo"));
    }
    return { indice, d, grados };
  });

  /* Arcos y sectores, con su rótulo hacia afuera en la mitad del barrido. */
  const arcosPx = arcos.map((a) => {
    const c = P(a.centro);
    if (a.rotulo) {
      const medio = a.desde + barridoDe(a) / 2;
      const ancla = puntoEnArco(c, a.radio * s, medio);
      rotulos.push(rotuloEn(a.rotulo, ancla, unit(sub(ancla, c)), SEPARACION, "arco"));
    }
    return pathArco(a, c, s);
  });

  /* Rótulos de punto: al mayor ángulo libre. */
  for (const p of figura.puntos) {
    if (p.oculto) continue;
    const q = P(p.nombre);
    let d: Coordenada;
    if (p.ubicacion) d = CARDINAL[p.ubicacion];
    else {
      const dirs: Coordenada[] = [];
      const hacia = (otro: Coordenada) => {
        const v = sub(otro, q);
        if (len(v) > 1e-6) dirs.push(unit(v));
      };
      for (const seg of segmentos) {
        if (seg.desde === p.nombre) hacia(P(seg.hasta));
        if (seg.hasta === p.nombre) hacia(P(seg.desde));
      }
      for (const pol of poligonos) {
        const n = pol.vertices.length;
        pol.vertices.forEach((v, i) => {
          if (v !== p.nombre) return;
          hacia(P(pol.vertices[(i + n - 1) % n]));
          hacia(P(pol.vertices[(i + 1) % n]));
        });
      }
      for (const ang of angulos) {
        if (ang.vertice !== p.nombre) continue;
        hacia(P(ang.desde));
        hacia(P(ang.hasta));
        const u = add(unit(sub(P(ang.desde), q)), unit(sub(P(ang.hasta), q)));
        if (len(u) > 1e-6) dirs.push(unit(u));
      }
      for (const a of arcos) {
        const c = P(a.centro);
        const barrido = barridoDe(a);
        if (a.centro === p.nombre && a.clase === "sector") {
          for (let k = 0; k <= 8; k++) dirs.push(unit(sub(puntoEnArco(c, 1, a.desde + (barrido * k) / 8), c)));
        } else if (Math.abs(len(sub(q, c)) - a.radio * s) < 1) {
          const radial = unit(sub(q, c));
          dirs.push({ x: -radial.y, y: radial.x }, { x: radial.y, y: -radial.x });
          if (a.clase === "sector") dirs.push(mul(radial, -1));
        }
      }
      for (const cir of circunferencias) {
        const c = P(cir.centro);
        if (Math.abs(len(sub(q, c)) - cir.radio * s) < 1) {
          const radial = unit(sub(q, c));
          dirs.push({ x: -radial.y, y: radial.x }, { x: radial.y, y: -radial.x });
        }
      }
      const poligonosPx = poligonos.map((pol) => pol.vertices.map(P));
      d = direccionDeRotulo(dirs, sub(q, centro), (u) => poligonosPx.some((vs) => dentroDePoligono(add(q, mul(u, 6)), vs)));
    }
    rotulos.push(rotuloEn(p.nombre, q, d, SEPARACION - 1 + (p.marca ? RADIO_PUNTO_MARCADO : 0), "punto"));
  }

  /* Textos libres, centrados en su coordenada. */
  for (const t of figura.textos ?? []) rotulos.push(rotuloEn(t.texto, aPx(t), { x: 0, y: 0 }, 0, "texto"));

  /* Regiones. */
  const regiones: RegionPx[] = (figura.regiones ?? []).map((reg) => ({
    formas: reg.formas.map((id) => formaPorId.get(id) as FormaPx),
    huecos: (reg.huecos ?? []).map((id) => formaPorId.get(id) as FormaPx),
    estilo: reg.estilo ?? "rayado",
  }));

  /* Cuadrícula: líneas en los múltiplos del paso dentro de la ventana. */
  const cuadricula: GeometriaLienzo["cuadricula"] = [];
  if (figura.cuadricula && figura.cuadricula.paso > 0) {
    const { xMin, xMax, yMin, yMax } = figura.ventana;
    const paso = figura.cuadricula.paso;
    for (let k = Math.ceil(xMin / paso - 1e-9); k * paso <= xMax + 1e-9; k++) {
      const a = aPx({ x: k * paso, y: yMin });
      const b = aPx({ x: k * paso, y: yMax });
      cuadricula.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    for (let k = Math.ceil(yMin / paso - 1e-9); k * paso <= yMax + 1e-9; k++) {
      const a = aPx({ x: xMin, y: k * paso });
      const b = aPx({ x: xMax, y: k * paso });
      cuadricula.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
  }

  return {
    ...esc,
    puntos,
    poligonos: poligonos.map((pol) => pathPoligono(pol.vertices.map(P))),
    circunferencias: circunferencias.map((c) => ({ cx: P(c.centro).x, cy: P(c.centro).y, r: c.radio * s })),
    arcos: arcosPx,
    segmentos: segmentosPx,
    angulos: angulosPx,
    regiones,
    marcados: figura.puntos.filter((p) => p.marca).map((p) => P(p.nombre)),
    cuadricula,
    rotulos,
    nota: figura.aEscala === false ? { x: MARGEN / 2, y: esc.altoDibujo + FILA_NOTA / 2 } : null,
  };
}

/* ---------- lo que mide el validador ---------- */

export interface ChoqueLienzo {
  clase: "rotulos" | "vertice" | "fuera";
  a: string;
  b?: string;
}

const seTocan = (a: CajaRotulo, b: CajaRotulo, aire: number) => a.x0 < b.x1 + aire && b.x0 < a.x1 + aire && a.y0 < b.y1 + aire && b.y0 < a.y1 + aire;

/**
 * Los puntos que se ven como vértice: los de un polígono, los extremos de un
 * segmento, el vértice de un ángulo, el centro de un sector (ahí llegan sus
 * radios), los marcados y los que llevan su nombre a la vista. Un punto oculto
 * que solo es centro de una circunferencia o de un arco no se dibuja: un texto
 * encima no tapa nada.
 */
export function verticesVisibles(figura: FiguraLienzoGeometrico): Set<string> {
  const v = new Set<string>();
  for (const p of figura.puntos) if (!p.oculto || p.marca) v.add(p.nombre);
  for (const pol of figura.poligonos ?? []) pol.vertices.forEach((n) => v.add(n));
  for (const sg of figura.segmentos ?? []) v.add(sg.desde).add(sg.hasta);
  for (const a of figura.angulos ?? []) v.add(a.vertice);
  for (const a of figura.arcos ?? []) if (a.clase === "sector") v.add(a.centro);
  return v;
}

/**
 * Regla 33: rótulos que se pisan entre sí, que tapan un vértice o que se salen
 * del lienzo, en el carril de su ubicación. Cada choque nombra los rótulos.
 */
export function choquesDeLienzo(figura: FiguraLienzoGeometrico, contexto: ContextoLienzo = "enunciado"): ChoqueLienzo[] {
  const g = geometriaLienzo(figura, contexto);
  const choques: ChoqueLienzo[] = [];
  const rs = g.rotulos;
  for (let i = 0; i < rs.length; i++) {
    for (let j = i + 1; j < rs.length; j++) {
      if (seTocan(rs[i].caja, rs[j].caja, AIRE)) choques.push({ clase: "rotulos", a: rs[i].texto, b: rs[j].texto });
    }
  }
  const visibles = verticesVisibles(figura);
  for (const rot of rs) {
    for (const [nombre, p] of g.puntos) {
      if (!visibles.has(nombre)) continue;
      const c = rot.caja;
      if (p.x > c.x0 - RADIO_VERTICE && p.x < c.x1 + RADIO_VERTICE && p.y > c.y0 - RADIO_VERTICE && p.y < c.y1 + RADIO_VERTICE) {
        choques.push({ clase: "vertice", a: rot.texto, b: nombre });
      }
    }
    const c = rot.caja;
    if (c.x0 < 0 || c.y0 < 0 || c.x1 > g.ancho || c.y1 > g.altoDibujo) choques.push({ clase: "fuera", a: rot.texto });
  }
  return choques;
}

/** Regla 34: alto renderizado en el carril de su ubicación, en píxeles a 390. */
export const altoRenderizado = (figura: FiguraLienzoGeometrico, contexto: ContextoLienzo = "enunciado") => escalaLienzo(figura, contexto).alto;

/** Regla 35: lo que cuenta contra los topes. Rótulos visibles: nombres de punto, rótulos de segmento, arco y ángulo, y textos. */
export function conteosLienzo(figura: FiguraLienzoGeometrico): TopesLienzo {
  const rotulos =
    figura.puntos.filter((p) => !p.oculto).length +
    (figura.segmentos ?? []).filter((s) => s.rotulo).length +
    (figura.arcos ?? []).filter((a) => a.rotulo).length +
    (figura.angulos ?? []).filter((a) => a.rotulo).length +
    (figura.textos ?? []).length;
  return {
    puntos: figura.puntos.length,
    segmentos: (figura.segmentos ?? []).length,
    formas: (figura.poligonos ?? []).length + (figura.circunferencias ?? []).length + (figura.arcos ?? []).length,
    rotulos,
  };
}

/** Regla 30: lo que queda fuera de la ventana, con su nombre. */
export function fueraDeVentana(figura: FiguraLienzoGeometrico): string[] {
  const { xMin, xMax, yMin, yMax } = figura.ventana;
  const tol = 1e-9;
  const fuera = (x0: number, x1: number, y0: number, y1: number) => x0 < xMin - tol || x1 > xMax + tol || y0 < yMin - tol || y1 > yMax + tol;
  const puntos = new Map(figura.puntos.map((p) => [p.nombre, p] as const));
  const salida: string[] = [];
  for (const p of figura.puntos) if (fuera(p.x, p.x, p.y, p.y)) salida.push(`el punto ${p.nombre} (${p.x}, ${p.y})`);
  (figura.circunferencias ?? []).forEach((c, i) => {
    const o = puntos.get(c.centro) as Coordenada;
    if (fuera(o.x - c.radio, o.x + c.radio, o.y - c.radio, o.y + c.radio)) salida.push(`circunferencias[${i}] (centro ${c.centro}, radio ${c.radio})`);
  });
  (figura.arcos ?? []).forEach((a, i) => {
    const k = cajaDeArco(a, puntos.get(a.centro) as Coordenada);
    if (fuera(k.xMin, k.xMax, k.yMin, k.yMax)) salida.push(`arcos[${i}] (${a.clase} de centro ${a.centro}, radio ${a.radio})`);
  });
  for (const t of figura.textos ?? []) if (fuera(t.x, t.x, t.y, t.y)) salida.push(`el texto «${t.texto}» (${t.x}, ${t.y})`);
  return salida;
}

export interface ProblemaDeEscala {
  clase: "longitud" | "arco" | "grados" | "igualdad";
  donde: string;
  rotulo?: string;
  esperado: number;
  dibujado: number;
}

const distancia = (a: Coordenada, b: Coordenada) => len(sub(a, b));

/**
 * Regla 31 (13d), solo a escala: cada rótulo de longitud parseable calza con
 * la longitud dibujada (±1 %; en arcos, la longitud del arco), cada rótulo en
 * grados con el ángulo dibujado (±1°), y los segmentos con la misma marca de
 * igualdad miden lo mismo (±1 %). Rótulos con letras que no son unidad no se
 * verifican. Todo en unidades del mundo.
 */
export function problemasDeEscala(figura: FiguraLienzoGeometrico): ProblemaDeEscala[] {
  if (figura.aEscala === false) return [];
  const puntos = new Map(figura.puntos.map((p) => [p.nombre, p as Coordenada] as const));
  const P = (n: string) => puntos.get(n) as Coordenada;
  const salida: ProblemaDeEscala[] = [];
  const segmentos = figura.segmentos ?? [];
  const arcos = figura.arcos ?? [];
  const conRotulo = [
    ...segmentos.map((s, i) => ({ rotulo: s.rotulo, dibujado: distancia(P(s.desde), P(s.hasta)), donde: `segmentos[${i}] ${s.desde}${s.hasta}`, clase: "longitud" as const })),
    ...arcos.map((a, i) => ({ rotulo: a.rotulo, dibujado: (a.radio * barridoDe(a) * Math.PI) / 180, donde: `arcos[${i}]`, clase: "arco" as const })),
  ].filter((x) => x.rotulo);
  const valores = longitudesComparables(conRotulo.map((x) => x.rotulo as string));
  conRotulo.forEach((x, k) => {
    const esperado = valores[k];
    if (esperado !== null && Math.abs(x.dibujado - esperado) / esperado > TOLERANCIA_LONGITUD) {
      salida.push({ clase: x.clase, donde: x.donde, rotulo: x.rotulo, esperado, dibujado: x.dibujado });
    }
  });
  arcos.forEach((a, i) => {
    const g = a.rotulo ? parsearGrados(a.rotulo) : null;
    if (g !== null && Math.abs(barridoDe(a) - g) > TOLERANCIA_GRADOS) salida.push({ clase: "grados", donde: `arcos[${i}]`, rotulo: a.rotulo, esperado: g, dibujado: barridoDe(a) });
  });
  (figura.angulos ?? []).forEach((ang, i) => {
    const g = ang.rotulo ? parsearGrados(ang.rotulo) : null;
    if (g === null) return;
    const v = P(ang.vertice);
    const dibujado = anguloEntre(sub(P(ang.desde), v), sub(P(ang.hasta), v));
    if (Math.abs(dibujado - g) > TOLERANCIA_GRADOS) salida.push({ clase: "grados", donde: `angulos[${i}] en ${ang.vertice}`, rotulo: ang.rotulo, esperado: g, dibujado });
  });
  for (const rayas of [1, 2, 3]) {
    const grupo = segmentos.map((s, i) => ({ s, i })).filter(({ s }) => s.igualdad === rayas);
    if (grupo.length < 2) continue;
    const largos = grupo.map(({ s }) => distancia(P(s.desde), P(s.hasta)));
    const min = Math.min(...largos);
    const max = Math.max(...largos);
    if ((max - min) / min > TOLERANCIA_LONGITUD) {
      salida.push({ clase: "igualdad", donde: grupo.map(({ s, i }) => `segmentos[${i}] ${s.desde}${s.hasta}`).join(", "), esperado: min, dibujado: max });
    }
  }
  return salida;
}

export interface ProblemaDeMarca {
  clase: "recto" | "llano" | "paralelismo";
  donde: string;
  grados: number;
}

/**
 * Regla 32 (13d), a escala o no: la marca de ángulo recto solo donde el ángulo
 * mide 90° ± 0,5°, los segmentos con la misma marca de paralelismo son
 * paralelos (± 0,5°) y ninguna marca de ángulo cae en un ángulo nulo o llano.
 */
export function problemasDeMarcas(figura: FiguraLienzoGeometrico): ProblemaDeMarca[] {
  const puntos = new Map(figura.puntos.map((p) => [p.nombre, p as Coordenada] as const));
  const P = (n: string) => puntos.get(n) as Coordenada;
  const salida: ProblemaDeMarca[] = [];
  (figura.angulos ?? []).forEach((ang, i) => {
    const v = P(ang.vertice);
    const grados = anguloEntre(sub(P(ang.desde), v), sub(P(ang.hasta), v));
    const donde = `angulos[${i}] en ${ang.vertice}`;
    if (grados < 1 || grados > 179) salida.push({ clase: "llano", donde, grados });
    else if (ang.marca === "recto" && Math.abs(grados - 90) > TOLERANCIA_RECTO) salida.push({ clase: "recto", donde, grados });
  });
  const segmentos = figura.segmentos ?? [];
  for (const flechas of [1, 2]) {
    const grupo = segmentos.map((s, i) => ({ s, i })).filter(({ s }) => s.paralelismo === flechas);
    for (let a = 0; a < grupo.length; a++) {
      for (let b = a + 1; b < grupo.length; b++) {
        const u = sub(P(grupo[a].s.hasta), P(grupo[a].s.desde));
        const v = sub(P(grupo[b].s.hasta), P(grupo[b].s.desde));
        const ang = anguloEntre(u, v);
        const desvio = Math.min(ang, 180 - ang);
        if (desvio > TOLERANCIA_PARALELAS) {
          salida.push({ clase: "paralelismo", donde: `segmentos[${grupo[a].i}] ${grupo[a].s.desde}${grupo[a].s.hasta} y segmentos[${grupo[b].i}] ${grupo[b].s.desde}${grupo[b].s.hasta}`, grados: desvio });
        }
      }
    }
  }
  return salida;
}

/** Regla 38: tamaño de la celda de la cuadrícula en píxeles del carril. */
export const celdaDeCuadricula = (figura: FiguraLienzoGeometrico, contexto: ContextoLienzo = "enunciado") =>
  figura.cuadricula ? figura.cuadricula.paso * escalaLienzo(figura, contexto).s : Infinity;
