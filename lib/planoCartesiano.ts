export const DOMINIO = { min: -10, max: 10 } as const;
export const TAMANO_SVG = 320;
export const MARGEN = 28;

const AREA = TAMANO_SVG - MARGEN * 2;
const ESCALA = AREA / (DOMINIO.max - DOMINIO.min);

export const xAPixel = (x: number) => MARGEN + (x - DOMINIO.min) * ESCALA;
export const yAPixel = (y: number) => TAMANO_SVG - MARGEN - (y - DOMINIO.min) * ESCALA;

export interface Punto {
  x: number;
  y: number;
}

/**
 * Recorta la recta y = mx + b contra el cuadrado [-10,10] x [-10,10].
 * Con b ∈ [-8,8] (dentro del dominio), la recta siempre cruza el cuadrado:
 * no hay caso degenerado que manejar para los rangos de slider dados.
 */
export function segmentoRecta(m: number, b: number): [Punto, Punto] {
  const EPS = 1e-9;
  const candidatos: Punto[] = [];
  const agregar = (x: number, y: number) => {
    if (
      x >= DOMINIO.min - EPS &&
      x <= DOMINIO.max + EPS &&
      y >= DOMINIO.min - EPS &&
      y <= DOMINIO.max + EPS
    ) {
      candidatos.push({
        x: Math.min(Math.max(x, DOMINIO.min), DOMINIO.max),
        y: Math.min(Math.max(y, DOMINIO.min), DOMINIO.max),
      });
    }
  };
  agregar(DOMINIO.min, m * DOMINIO.min + b);
  agregar(DOMINIO.max, m * DOMINIO.max + b);
  if (m !== 0) {
    agregar((DOMINIO.min - b) / m, DOMINIO.min);
    agregar((DOMINIO.max - b) / m, DOMINIO.max);
  }
  candidatos.sort((a, z) => a.x - z.x);
  return [
    candidatos[0] ?? { x: DOMINIO.min, y: m * DOMINIO.min + b },
    candidatos[candidatos.length - 1] ?? { x: DOMINIO.max, y: m * DOMINIO.max + b },
  ];
}

/**
 * Triángulo Δx/Δy: ancla fija en x0 = 0 (siempre dentro del dominio porque
 * y(0) = b ∈ [-8,8]), con Δx adaptativo para que el segundo punto quede
 * siempre visible dentro del cuadrado.
 */
export function calcularTriangulo(m: number, b: number) {
  const x0 = 0;
  const y0 = m * x0 + b;
  const candidatosDx = [4, 3, 2, 1];
  const dx =
    candidatosDx.find((d) => Math.abs(m * (x0 + d) + b) <= DOMINIO.max) ?? 1;
  const x1 = x0 + dx;
  const y1 = m * x1 + b;
  return { x0, y0, x1, y1, dx, dy: y1 - y0 };
}

export const formatoDecimalChileno = (n: number) =>
  n.toLocaleString("es-CL", { maximumFractionDigits: 1 });

// ---------- parábola y = ax² + bx + c ----------

/**
 * Paso de muestreo en unidades del plano. Con 0,1 la flecha máxima entre dos
 * muestras es |a|·Δx²/8 = 2·0,01/8 = 0,0025 unidades ≈ 0,04 px al |a| más grande
 * de los sliders: por debajo de un píxel, así que la poligonal se ve curva.
 * Bajarlo más solo engorda el atributo `points`.
 */
const PASO_MUESTREO = 0.1;

/**
 * `-b / (2a)` con b = 0 da -0, y `formatoDecimalChileno(-0)` devuelve "-0":
 * el rótulo del vértice diría "(-0, -4)". Se normaliza acá, en el cálculo, y no
 * en cada rótulo — `-0 === 0` es verdadero, así que la comparación no cambia
 * ningún otro valor.
 */
const sinCeroNegativo = (n: number) => (n === 0 ? 0 : n);

/**
 * La curva como atributo `points` de una `<polyline>`, muestreada en todo el
 * ancho del dominio. Los tramos que se salen por arriba o por abajo se emiten
 * igual, con coordenadas fuera del viewBox: recortarlos es trabajo del
 * `<clipPath>` de quien la dibuja, no de esta función. Partir la poligonal en
 * tramos visibles daría el mismo píxel con más casos borde.
 */
export function puntosParabola(a: number, b: number, c: number): string {
  const total = Math.round((DOMINIO.max - DOMINIO.min) / PASO_MUESTREO);
  const puntos: string[] = [];
  for (let i = 0; i <= total; i++) {
    /* x se reconstruye desde el índice en vez de acumular `x += PASO`: sumar
       0,1 doscientas veces se desvía lo suficiente para que el último punto no
       caiga en el borde exacto del dominio. */
    const x = DOMINIO.min + i * PASO_MUESTREO;
    const y = a * x * x + b * x + c;
    puntos.push(`${xAPixel(x).toFixed(2)},${yAPixel(y).toFixed(2)}`);
  }
  return puntos.join(" ");
}

/**
 * El vértice, o `null` si `a === 0` — con a en 0 la expresión es la recta
 * y = bx + c y no hay vértice que marcar. Devolverlo igual obligaría a cada
 * llamador a repetir la comprobación, y el caso a = 0 es alcanzable con los
 * pasos de slider del bloque.
 */
export function verticeParabola(a: number, b: number, c: number): Punto | null {
  if (a === 0) return null;
  const x = sinCeroNegativo(-b / (2 * a));
  return { x, y: sinCeroNegativo(a * x * x + b * x + c) };
}

/**
 * Los ceros reales, ordenados de menor a mayor: dos, uno o ninguno según el
 * discriminante. Con `a === 0` cae a la recta y = bx + c (un cero, o ninguno si
 * además b = 0). El caso a = b = c = 0 —toda recta y = 0 es cero— devuelve la
 * lista vacía: no hay puntos que marcar, son todos.
 *
 * El `d === 0` se compara exacto a propósito. Los sliders del bloque entregan
 * a en pasos de 0,5 y b/c enteros, todos exactos en binario, así que
 * b² - 4ac no arrastra error: la raíz doble se detecta cuando de verdad la hay.
 */
export function cerosParabola(a: number, b: number, c: number): number[] {
  if (a === 0) {
    if (b === 0) return [];
    return [sinCeroNegativo(-c / b)];
  }
  const d = b * b - 4 * a * c;
  if (d < 0) return [];
  if (d === 0) return [sinCeroNegativo(-b / (2 * a))];
  const raiz = Math.sqrt(d);
  /* Se ordena porque con a < 0 el denominador invierte el orden de las dos
     expresiones y la de la resta deja de ser la menor. */
  return [(-b - raiz) / (2 * a), (-b + raiz) / (2 * a)]
    .map(sinCeroNegativo)
    .sort((p, q) => p - q);
}
