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
