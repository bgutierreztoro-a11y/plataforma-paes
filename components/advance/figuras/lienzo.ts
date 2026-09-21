/**
 * Lo que comparten los SVG de las figuras de datos (barras, histograma, líneas,
 * circular). Mismo lienzo que PlanoFuncion: 320 de ancho en unidades de
 * viewBox, así que a 380 px de viewport la letra de 9,5 queda cerca de los
 * 10 px reales. Colores solo por tokens: tinta para ejes y texto, hairline para
 * la grilla, --linea-nav para el dato, --color-bg para halos y huecos.
 */

export const ANCHO = 320;
export const ALTO = 220;
export const MARGEN_IZQ = 40;
export const MARGEN_DER = 12;
export const MARGEN_SUP = 14;
export const MARGEN_INF = 26;
/** Alto que suma una etiqueta de eje o una fila de leyenda. */
export const FILA_EXTRA = 14;
export const LETRA_MARCA = 9.5;
export const LETRA_ROTULO = 11;
export const TICK = 3;
export const RADIO_PUNTO = 3.25;

export const TINTA = "var(--text-primary)";
export const HAIRLINE = "var(--border-hairline)";
export const DATO = "var(--linea-nav)";
export const TINTE = "var(--linea-tinte)";
export const FONDO = "var(--color-bg)";

/** Halo del color de fondo detrás de un rótulo, para que siga legible sobre una barra o una línea. */
export const HALO = { stroke: FONDO, strokeWidth: 3, strokeLinejoin: "round", paintOrder: "stroke" } as const;

/**
 * Tres trazos para hasta tres series: el dash distingue las líneas sin color,
 * junto con el marcador (círculo, cuadrado, triángulo) y el nombre en la
 * leyenda.
 */
export const DASH_SERIE = [undefined, "7 4", "1.5 4.5"] as const;

/** Marcador de la serie `j` centrado en (x, y): un path cerrado. */
export function marcadorSerie(j: number, x: number, y: number, r = RADIO_PUNTO): string {
  if (j === 1) return `M ${x - r} ${y - r} h ${2 * r} v ${2 * r} h ${-2 * r} Z`;
  if (j === 2) return `M ${x} ${y - r * 1.2} L ${x + r * 1.15} ${y + r * 0.8} L ${x - r * 1.15} ${y + r * 0.8} Z`;
  return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
}

/**
 * Relleno de la serie o sector `j`, sin depender del color: sólido, rayado
 * (pattern por id), tinte y hueco. `idRayas` es el id del <pattern> del SVG.
 */
export function rellenoDe(j: number, idRayas: string): { fill: string; stroke: string; strokeWidth: number } {
  switch (j % 4) {
    case 1:
      return { fill: `url(#${idRayas})`, stroke: DATO, strokeWidth: 1 };
    case 2:
      return { fill: TINTE, stroke: DATO, strokeWidth: 1 };
    case 3:
      return { fill: FONDO, stroke: DATO, strokeWidth: 1.5 };
    default:
      return { fill: DATO, stroke: DATO, strokeWidth: 1 };
  }
}
