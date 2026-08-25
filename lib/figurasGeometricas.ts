export interface Punto {
  x: number;
  y: number;
}

/**
 * Vértices de un triángulo rectángulo con el ángulo recto en el origen y los
 * catetos sobre los ejes: A=(0,0), B=(catetoA,0), C=(0,catetoB). Orientación
 * fija a propósito — Pitágoras no necesita una orientación arbitraria, y
 * fijarla hace que "ángulo recto en el origen" sea válido por construcción,
 * sin cómputo adicional que pueda desviarse.
 */
export function verticesTrianguloRectangulo(catetoA: number, catetoB: number): [Punto, Punto, Punto] {
  if (!(catetoA > 0) || !(catetoB > 0)) {
    throw new Error(`catetoA y catetoB deben ser positivos (recibido: ${catetoA}, ${catetoB})`);
  }
  return [
    { x: 0, y: 0 },
    { x: catetoA, y: 0 },
    { x: 0, y: catetoB },
  ];
}

export function hipotenusa(catetoA: number, catetoB: number): number {
  return Math.sqrt(catetoA * catetoA + catetoB * catetoB);
}

export interface ConfigViewBox {
  ancho: number;
  alto: number;
  margen: number;
}

/**
 * Reescala un conjunto de puntos a un viewBox con un único factor de escala
 * para x e y (a diferencia del mapeo 1D de `IlustracionBandas`, que estira
 * cada eje por separado): con escalas independientes, un ángulo recto en los
 * datos dejaría de verse recto en pantalla. También invierte el eje y, porque
 * los puntos se definen en convención matemática (y crece hacia arriba) y el
 * SVG crece hacia abajo.
 */
export function escalarPuntosAViewBox(puntos: Punto[], viewBox: ConfigViewBox): Punto[] {
  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const anchoDatos = maxX - minX || 1;
  const altoDatos = maxY - minY || 1;
  const areaAncho = viewBox.ancho - viewBox.margen * 2;
  const areaAlto = viewBox.alto - viewBox.margen * 2;
  const escala = Math.min(areaAncho / anchoDatos, areaAlto / altoDatos);
  const anchoEscalado = anchoDatos * escala;
  const altoEscalado = altoDatos * escala;
  const offsetX = viewBox.margen + (areaAncho - anchoEscalado) / 2;
  const offsetY = viewBox.margen + (areaAlto - altoEscalado) / 2;
  return puntos.map((p) => ({
    x: offsetX + (p.x - minX) * escala,
    y: offsetY + (maxY - p.y) * escala,
  }));
}
