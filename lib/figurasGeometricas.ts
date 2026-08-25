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

/**
 * Vértices de un triángulo genérico (no necesariamente rectángulo): base
 * sobre el eje x desde el origen, ápice a la altura dada. `desplazamientoApice`
 * mueve el ápice horizontalmente — por defecto queda centrado (isósceles),
 * pero un valor distinto produce un triángulo escaleno de aspecto oblicuo.
 */
export function verticesTriangulo(
  base: number,
  altura: number,
  desplazamientoApice = base / 2,
): [Punto, Punto, Punto] {
  if (!(base > 0) || !(altura > 0)) {
    throw new Error(`base y altura deben ser positivos (recibido: ${base}, ${altura})`);
  }
  return [
    { x: 0, y: 0 },
    { x: base, y: 0 },
    { x: desplazamientoApice, y: altura },
  ];
}

/**
 * Vértices de un paralelogramo: base sobre el eje x, lado superior desplazado
 * horizontalmente (`desplazamiento`, corte/shear) para que se vea inclinado
 * en vez de un rectángulo.
 */
export function verticesParalelogramo(
  base: number,
  altura: number,
  desplazamiento = base / 3,
): [Punto, Punto, Punto, Punto] {
  if (!(base > 0) || !(altura > 0)) {
    throw new Error(`base y altura deben ser positivos (recibido: ${base}, ${altura})`);
  }
  return [
    { x: 0, y: 0 },
    { x: base, y: 0 },
    { x: base + desplazamiento, y: altura },
    { x: desplazamiento, y: altura },
  ];
}

/**
 * Vértices de un trapecio: baseMayor sobre el eje x, baseMenor a la altura
 * dada. `desplazamientoIzquierdo` ubica el vértice superior-izquierdo — por
 * defecto centra la baseMenor (trapecio isósceles), pero un valor distinto
 * produce un trapecio escaleno.
 */
export function verticesTrapecio(
  baseMayor: number,
  baseMenor: number,
  altura: number,
  desplazamientoIzquierdo = (baseMayor - baseMenor) / 2,
): [Punto, Punto, Punto, Punto] {
  if (!(baseMayor > baseMenor) || !(baseMenor > 0)) {
    throw new Error(
      `baseMayor debe ser mayor que baseMenor, y baseMenor positivo (recibido: baseMayor=${baseMayor}, baseMenor=${baseMenor})`,
    );
  }
  if (!(altura > 0)) {
    throw new Error(`altura debe ser positiva (recibido: ${altura})`);
  }
  if (desplazamientoIzquierdo < 0 || desplazamientoIzquierdo > baseMayor - baseMenor) {
    throw new Error(
      `desplazamientoIzquierdo debe estar entre 0 y baseMayor-baseMenor (${baseMayor - baseMenor}) (recibido: ${desplazamientoIzquierdo})`,
    );
  }
  return [
    { x: 0, y: 0 },
    { x: baseMayor, y: 0 },
    { x: desplazamientoIzquierdo + baseMenor, y: altura },
    { x: desplazamientoIzquierdo, y: altura },
  ];
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

export interface CirculoEnViewBox {
  centro: Punto;
  radioEscalado: number;
}

/**
 * Análogo a `escalarPuntosAViewBox` pero para un círculo: no hay vértices que
 * reescalar, así que se calcula el mismo factor de escala (ajustar el
 * cuadrado de lado 2*radio al área útil del viewBox) y se centra en ella.
 */
export function calcularCirculoEnViewBox(radio: number, viewBox: ConfigViewBox): CirculoEnViewBox {
  if (!(radio > 0)) {
    throw new Error(`radio debe ser positivo (recibido: ${radio})`);
  }
  const areaAncho = viewBox.ancho - viewBox.margen * 2;
  const areaAlto = viewBox.alto - viewBox.margen * 2;
  const escala = Math.min(areaAncho / (radio * 2), areaAlto / (radio * 2));
  return {
    centro: { x: viewBox.margen + areaAncho / 2, y: viewBox.margen + areaAlto / 2 },
    radioEscalado: radio * escala,
  };
}
