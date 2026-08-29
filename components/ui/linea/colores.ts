import type { CSSProperties } from "react";

/**
 * Las cuatro líneas de la red y cómo se aplican.
 *
 * El color de línea identifica un eje temático y se mantiene constante en todas
 * las pantallas dentro de ese eje. Fuera de un eje se usa `text-primary`.
 *
 * Esa regla se implementa con **una custom property heredada** (`--linea`) y no
 * con un mapa de clases de Tailwind, por dos razones:
 *
 * 1. Tailwind no compila clases armadas en runtime. `bg-line-${id}` no genera
 *    nada: habría que escribir un `Record<LineaId, string>` por cada propiedad
 *    (fondo, texto, borde, relleno de SVG…) para que el JIT las viera, y eso es
 *    una matriz de 4 × N que hay que mantener a mano.
 * 2. La variable dice literalmente lo que dice la regla: se setea una vez arriba
 *    —en la placa de la línea, o en el layout del eje— y todo lo que cuelga
 *    debajo la hereda. El default de `--linea` en app/globals.css es
 *    `var(--text-primary)`, que es la segunda mitad de la regla.
 */
export const LINEAS = ["01", "02", "03", "04"] as const;

export type LineaId = (typeof LINEAS)[number];

/** El eje que identifica cada línea. */
export const NOMBRE_DE_LINEA: Record<LineaId, string> = {
  "01": "Números",
  "02": "Álgebra y funciones",
  "03": "Geometría",
  "04": "Probabilidad y datos",
};

/* El mapa línea → eje del temario NO vive acá a propósito: `lib/modulos.ts` es
   la taxonomía del contenido y esta fase es solo la capa visual. Atarlas ahora
   obligaría a esta carpeta a conocer los ids de eje antes de que ninguna
   pantalla los use. Ese puente se construye en la fase de migración. */

/**
 * El texto que va ENCIMA del color de línea.
 *
 * No es una decisión de gusto: es contraste medido contra `--text-inverse`
 * (#F7F7F5). Línea 01 → 4.5:1, línea 03 → 4.5:1, línea 04 → 6.4:1; las tres
 * pasan AA. La línea 02 (#FFB600) da **1.6:1**, que no es legible, y con
 * `--text-primary` sube a 10.1:1. Por eso la 02 es la excepción.
 */
const CONTRASTE_POR_LINEA: Record<LineaId, string> = {
  "01": "var(--text-inverse)",
  "02": "var(--text-primary)",
  "03": "var(--text-inverse)",
  "04": "var(--text-inverse)",
};

/**
 * Los dos derivados del color de línea, uno por cada fondo: el tinte pálido
 * sobre papel (fondo de la alternativa correcta) y el aclarado sobre tinta
 * oscura (la clave de TarjetaError).
 *
 * Son series propias y no un `color-mix()` calculado sobre el color de línea:
 * los cuatro colores están calibrados a mano contra su fondo, y una mezcla
 * uniforme daría un amarillo aclarado casi blanco y un azul aclarado que sigue
 * apagado. Vienen del sistema de diseño.
 */
const TINTE_POR_LINEA: Record<LineaId, string> = {
  "01": "var(--line-01-tint)",
  "02": "var(--line-02-tint)",
  "03": "var(--line-03-tint)",
  "04": "var(--line-04-tint)",
};

const CLARA_POR_LINEA: Record<LineaId, string> = {
  "01": "var(--line-01-clara)",
  "02": "var(--line-02-clara)",
  "03": "var(--line-03-clara)",
  "04": "var(--line-04-clara)",
};

/** `style` es `CSSProperties`, que no admite custom properties; esto sí. */
export interface EstiloDeLinea extends CSSProperties {
  "--linea": string;
  "--linea-contraste": string;
  "--linea-tinte": string;
  "--linea-clara": string;
}

/**
 * El estilo que instala una línea sobre un subárbol.
 *
 * Se pone en el elemento más alto que pertenece al eje —la placa, el contenedor
 * de la lección— y todo lo de adentro toma el color sin recibir props.
 */
export function estiloDeLinea(linea: LineaId): EstiloDeLinea {
  return {
    "--linea": `var(--line-${linea})`,
    "--linea-contraste": CONTRASTE_POR_LINEA[linea],
    "--linea-tinte": TINTE_POR_LINEA[linea],
    "--linea-clara": CLARA_POR_LINEA[linea],
  };
}
