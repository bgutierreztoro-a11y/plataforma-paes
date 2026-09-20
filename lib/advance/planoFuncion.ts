import type { Coordenada, CurvaFuncion, PuntoFuncion, SegmentoFuncion, VentanaFuncion } from "./descarte.ts";

/**
 * Motor geométrico de los planos de función de Advance
 * (components/advance/PlanoFuncion.tsx). Puro y determinista: sin React, sin
 * Math.random, sin Date, sin estado. Trabaja en unidades del plano; el paso a
 * píxeles es una transformación afín (`escalaDe`) que se aplica al final, y
 * como una Bézier cuadrática es invariante bajo transformaciones afines, el
 * arco calculado en unidades sigue siendo exacto en píxeles.
 *
 * Nada de acá calcula contenido de ítems: los valores de un ítem se siguen
 * calculando aparte con node -e. Estas funciones solo deciden qué dibujar.
 */

export type Ventana = VentanaFuncion;

/** Bézier cuadrática: extremos P0 y P2, punto de control C. */
export interface ArcoBezier {
  p0: Coordenada;
  c: Coordenada;
  p2: Coordenada;
}

const f = (a: number, b: number, c: number, x: number) => a * x * x + b * x + c;

/* ---------- parábola ---------- */

export function verticeDe(a: number, b: number, c: number): Coordenada {
  const x = -b / (2 * a);
  return { x, y: f(a, b, c, x) };
}

/**
 * Raíces reales de ax² + bx + c, ordenadas. Con |discriminante| ≤ tolerancia
 * se informa una raíz doble; bajo −tolerancia, ninguna.
 */
export function cerosDe(a: number, b: number, c: number, tolerancia = 1e-9): number[] {
  const disc = b * b - 4 * a * c;
  if (disc < -tolerancia) return [];
  if (Math.abs(disc) <= tolerancia) return [-b / (2 * a) + 0];
  const raiz = Math.sqrt(disc);
  const x1 = (-b - raiz) / (2 * a);
  const x2 = (-b + raiz) / (2 * a);
  return x1 < x2 ? [x1, x2] : [x2, x1];
}

export function interceptoY(a: number, b: number, c: number): Coordenada {
  return { x: 0, y: c };
}

/**
 * Arco exacto de la parábola entre x0 y x1 como Bézier cuadrática. El punto de
 * control es la intersección de las tangentes en P0 y P2 y cae en
 * x = (x0 + x1)/2: igualando f(x0) + f'(x0)(x − x0) = f(x1) + f'(x1)(x − x1)
 * queda 2a(x0 − x1)·x = a(x0² − x1²), y como x0 ≠ x1, x = (x0 + x1)/2.
 * Con eso x(t) es lineal en t y y(t) es la única cuadrática que coincide con
 * f∘x en t = 0 y t = 1 y en la derivada en t = 0, o sea f(x(t)) exacta.
 */
export function bezierParabola(a: number, b: number, c: number, x0: number, x1: number): ArcoBezier {
  const y0 = f(a, b, c, x0);
  const xc = (x0 + x1) / 2;
  const yc = y0 + (2 * a * x0 + b) * (x1 - x0) / 2;
  return { p0: { x: x0, y: y0 }, c: { x: xc, y: yc }, p2: { x: x1, y: f(a, b, c, x1) } };
}

/** El mismo arco como path SVG `M x0 y0 Q xc yc x1 y1`, en unidades del plano. */
export function arcoParabola(a: number, b: number, c: number, x0: number, x1: number): string {
  return pathDeArco(bezierParabola(a, b, c, x0, x1));
}

export function pathDeArco(arco: ArcoBezier, aPixel: (p: Coordenada) => Coordenada = (p) => p): string {
  const p0 = aPixel(arco.p0);
  const c = aPixel(arco.c);
  const p2 = aPixel(arco.p2);
  return `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y}`;
}

/** Punto de la Bézier en t. */
export function puntoDeArco(arco: ArcoBezier, t: number): Coordenada {
  const u = 1 - t;
  return {
    x: u * u * arco.p0.x + 2 * u * t * arco.c.x + t * t * arco.p2.x,
    y: u * u * arco.p0.y + 2 * u * t * arco.c.y + t * t * arco.p2.y,
  };
}

const lerp = (p: Coordenada, q: Coordenada, t: number): Coordenada => ({
  x: p.x + (q.x - p.x) * t,
  y: p.y + (q.y - p.y) * t,
});

/** De Casteljau: las dos mitades en t. */
function partir(arco: ArcoBezier, t: number): [ArcoBezier, ArcoBezier] {
  const q0 = lerp(arco.p0, arco.c, t);
  const q1 = lerp(arco.c, arco.p2, t);
  const m = lerp(q0, q1, t);
  return [
    { p0: arco.p0, c: q0, p2: m },
    { p0: m, c: q1, p2: arco.p2 },
  ];
}

/** El tramo del arco entre t0 y t1 (0 ≤ t0 < t1 ≤ 1), sin deformarlo. */
export function subarco(arco: ArcoBezier, t0: number, t1: number): ArcoBezier {
  const [izquierda] = t1 < 1 ? partir(arco, t1) : [arco];
  if (t0 <= 0) return izquierda;
  return partir(izquierda, t0 / t1)[1];
}

/** Raíces en (0, 1) de la cuadrática en t que da y(t) − nivel. */
function cruces(arco: ArcoBezier, nivel: number): number[] {
  const { p0, c, p2 } = arco;
  const A = p0.y - 2 * c.y + p2.y;
  const B = 2 * (c.y - p0.y);
  const C = p0.y - nivel;
  const raices: number[] = [];
  if (Math.abs(A) < 1e-12) {
    if (Math.abs(B) > 1e-12) raices.push(-C / B);
  } else {
    const disc = B * B - 4 * A * C;
    if (disc >= 0) {
      const r = Math.sqrt(disc);
      raices.push((-B - r) / (2 * A), (-B + r) / (2 * A));
    }
  }
  return raices.filter((t) => t > 0 && t < 1);
}

/**
 * Recorta el arco al rectángulo de la ventana. Como x(t) es lineal, el corte
 * en x es un intervalo de t; el corte en y parte el arco en los t donde cruza
 * yMin o yMax y conserva los tramos cuyo punto medio queda dentro. Devuelve
 * 0, 1 o 2 tramos, cada uno un sub-Bézier exacto (De Casteljau).
 */
export function recortarArco(arco: ArcoBezier, ventana: Ventana): ArcoBezier[] {
  const { p0, p2 } = arco;
  const dx = p2.x - p0.x;
  if (dx === 0) return [];
  const tDe = (x: number) => (x - p0.x) / dx;
  const [ta, tb] = [tDe(ventana.xMin), tDe(ventana.xMax)].sort((m, n) => m - n);
  const t0 = Math.max(0, ta);
  const t1 = Math.min(1, tb);
  if (t0 >= t1) return [];

  const cortes = [t0, ...cruces(arco, ventana.yMin), ...cruces(arco, ventana.yMax), t1]
    .filter((t) => t >= t0 && t <= t1)
    .sort((m, n) => m - n);

  const eps = 1e-9;
  const tramos: ArcoBezier[] = [];
  for (let i = 0; i + 1 < cortes.length; i++) {
    const ini = cortes[i];
    const fin = cortes[i + 1];
    if (fin - ini < eps) continue;
    const medio = puntoDeArco(arco, (ini + fin) / 2);
    if (medio.y >= ventana.yMin - eps && medio.y <= ventana.yMax + eps) {
      tramos.push(subarco(arco, ini, fin));
    }
  }
  return tramos;
}

/* ---------- recta ---------- */

/** Pendiente e intercepto de una recta declarada con m y b o con dos puntos. */
export function coeficientesRecta(curva: Extract<CurvaFuncion, { clase: "recta" }>): { m: number; b: number } {
  if (curva.por) {
    const [p, q] = curva.por;
    const m = (q.y - p.y) / (q.x - p.x);
    return { m, b: p.y - m * p.x };
  }
  return { m: curva.m, b: curva.b };
}

/** Los dos extremos de y = mx + b dentro de la ventana y de [desde, hasta], o null si no entra. */
export function segmentoRectaEnVentana(
  m: number,
  b: number,
  ventana: Ventana,
  desde = -Infinity,
  hasta = Infinity,
): [Coordenada, Coordenada] | null {
  let x0 = Math.max(ventana.xMin, desde);
  let x1 = Math.min(ventana.xMax, hasta);
  if (m !== 0) {
    const [xa, xb] = [(ventana.yMin - b) / m, (ventana.yMax - b) / m].sort((p, q) => p - q);
    x0 = Math.max(x0, xa);
    x1 = Math.min(x1, xb);
  } else if (b < ventana.yMin || b > ventana.yMax) return null;
  if (x0 >= x1) return null;
  return [
    { x: x0, y: m * x0 + b },
    { x: x1, y: m * x1 + b },
  ];
}

/* ---------- números redondos (Heckbert, Graphics Gems I) ---------- */

/** El número "redondo" (1, 2 o 5 por potencia de 10) más cercano a x, o el mayor que x si `redondear` es false. */
export function numeroRedondo(x: number, redondear: boolean): number {
  const exponente = Math.floor(Math.log10(x));
  const potencia = 10 ** exponente;
  const fraccion = x / potencia;
  let redondo: number;
  if (redondear) redondo = fraccion < 1.5 ? 1 : fraccion < 3 ? 2 : fraccion < 7 ? 5 : 10;
  else redondo = fraccion <= 1 ? 1 : fraccion <= 2 ? 2 : fraccion <= 5 ? 5 : 10;
  return redondo * potencia;
}

/** Los decimales justos para escribir el paso sin perderlo (0,25 necesita 2). */
function decimalesDe(paso: number): number {
  for (let d = 0; d < 6; d++) if (Number(paso.toFixed(d)) === paso) return d;
  return 6;
}
const redondearA = (v: number, decimales: number) => Number(v.toFixed(decimales));

/**
 * Marcas de eje entre min y max: paso 1, 2 o 5 por potencia de 10 elegido
 * para acercarse a `objetivo` marcas, extremos redondeados hacia afuera.
 */
export function marcasDeEje(min: number, max: number, objetivo = 6): { paso: number; marcas: number[] } {
  const rango = numeroRedondo(max - min, false);
  const paso = numeroRedondo(rango / (objetivo - 1), true);
  const decimales = decimalesDe(paso);
  const desde = Math.floor(min / paso + 1e-9);
  const hasta = Math.ceil(max / paso - 1e-9);
  const marcas: number[] = [];
  for (let i = desde; i <= hasta; i++) marcas.push(redondearA(i * paso, decimales) + 0);
  return { paso, marcas };
}

/** Rótulo de una marca con los decimales que exige el paso, formato es-CL y signo menos Unicode. */
export function formatoMarca(valor: number, paso: number): string {
  const decimales = decimalesDe(paso);
  const v = redondearA(valor, decimales) + 0;
  return v.toLocaleString("es-CL", { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).replace(/^-/, "−");
}

/* ---------- ventana automática ---------- */

function puntosDeCurva(curva: CurvaFuncion): Coordenada[] {
  if (curva.clase === "recta-vertical") return [{ x: curva.x, y: 0 }];
  if (curva.clase === "recta") {
    const { m, b } = coeficientesRecta(curva);
    const puntos: Coordenada[] = [];
    if (curva.desde !== undefined) puntos.push({ x: curva.desde, y: m * curva.desde + b });
    if (curva.hasta !== undefined) puntos.push({ x: curva.hasta, y: m * curva.hasta + b });
    if (puntos.length === 2) return puntos;
    puntos.push({ x: 0, y: b });
    if (m !== 0) puntos.push({ x: -b / m, y: 0 });
    return puntos;
  }
  const { a, b, c, desde, hasta } = curva;
  const enRango = (x: number) => (desde === undefined || x >= desde) && (hasta === undefined || x <= hasta);
  const v = verticeDe(a, b, c);
  const puntos: Coordenada[] = [];
  if (desde !== undefined) puntos.push({ x: desde, y: f(a, b, c, desde) });
  if (hasta !== undefined) puntos.push({ x: hasta, y: f(a, b, c, hasta) });
  if (enRango(v.x)) puntos.push(v);
  if (enRango(0)) puntos.push({ x: 0, y: c });
  const ceros = cerosDe(a, b, c).filter(enRango);
  for (const x of ceros) puntos.push({ x, y: 0 });
  if (ceros.length < 2 && desde === undefined && hasta === undefined) {
    /* Sin dos ceros la parábola no tiene ancho propio: se muestra hasta donde
       sube tanto como dista el vértice del eje x (mínimo una unidad). */
    const w = Math.sqrt(Math.max(Math.abs(v.y), 1) / Math.abs(a));
    puntos.push({ x: v.x - w, y: f(a, b, c, v.x - w) }, { x: v.x + w, y: f(a, b, c, v.x + w) });
  }
  return puntos;
}

/** Redondea [min, max] hacia afuera al paso de Heckbert, garantizando ancho no nulo. */
function extremosRedondos(min: number, max: number, holgura: number): [number, number] {
  let lo = min - holgura;
  let hi = max + holgura;
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const { paso } = marcasDeEje(lo, hi);
  const decimales = decimalesDe(paso);
  return [redondearA(Math.floor(lo / paso + 1e-9) * paso, decimales), redondearA(Math.ceil(hi / paso - 1e-9) * paso, decimales)];
}

/**
 * Ventana que contiene vértices, ceros, interceptos y extremos de arco de las
 * curvas, más todo punto y segmento declarado (y `otrosX`, para eje de
 * simetría y regiones). Agrega un 10 % de holgura por lado, incluye el
 * origen si queda a menos de una holgura del contenido y redondea los
 * extremos con números redondos. Los puntos declarados quedan dentro por
 * construcción, y eso lo afirma planoFuncion.test.ts.
 */
export function ventanaAutomatica(
  curvas: CurvaFuncion[],
  puntos: PuntoFuncion[] = [],
  segmentos: SegmentoFuncion[] = [],
  otrosX: number[] = [],
): Ventana {
  const xs: number[] = [...otrosX];
  const ys: number[] = [];
  const agregar = (p: Coordenada) => {
    xs.push(p.x);
    ys.push(p.y);
  };
  for (const cu of curvas) puntosDeCurva(cu).forEach(agregar);
  puntos.forEach(agregar);
  for (const s of segmentos) {
    agregar(s.desde);
    agregar(s.hasta);
  }
  if (ys.length === 0) ys.push(0);

  const eje = (valores: number[]): [number, number] => {
    let min = Math.min(...valores);
    let max = Math.max(...valores);
    const holgura = Math.max((max - min) * 0.1, 0.5);
    if (0 < min && min - holgura <= 0) min = 0;
    if (0 > max && max + holgura >= 0) max = 0;
    return extremosRedondos(min, max, holgura);
  };
  const [xMin, xMax] = eje(xs);
  const [yMin, yMax] = eje(ys);
  return { xMin, xMax, yMin, yMax };
}

/* ---------- escala a píxeles ---------- */

export interface Margen {
  izq: number;
  der: number;
  sup: number;
  inf: number;
}

/**
 * Escalas independientes en x e y: la unidad de x (segundos) y la de y
 * (metros) no tienen por qué medir lo mismo. Devuelve el paso a píxeles y
 * el rectángulo interior del plano.
 */
export function escalaDe(ventana: Ventana, ancho: number, alto: number, margen: number | Margen) {
  const m: Margen = typeof margen === "number" ? { izq: margen, der: margen, sup: margen, inf: margen } : margen;
  const anchoUtil = ancho - m.izq - m.der;
  const altoUtil = alto - m.sup - m.inf;
  const escalaX = anchoUtil / (ventana.xMax - ventana.xMin);
  const escalaY = altoUtil / (ventana.yMax - ventana.yMin);
  const xAPixel = (x: number) => m.izq + (x - ventana.xMin) * escalaX;
  const yAPixel = (y: number) => m.sup + (ventana.yMax - y) * escalaY;
  const aPixel = (p: Coordenada): Coordenada => ({ x: xAPixel(p.x), y: yAPixel(p.y) });
  return {
    escalaX,
    escalaY,
    xAPixel,
    yAPixel,
    aPixel,
    izq: m.izq,
    der: ancho - m.der,
    sup: m.sup,
    inf: alto - m.inf,
  };
}
