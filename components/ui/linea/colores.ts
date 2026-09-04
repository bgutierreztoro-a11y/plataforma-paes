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
 *
 * `--linea` es el color del eje **como forma**: barras, estaciones, rieles,
 * bordes, el disco de la placa. Cuando ese mismo color pasa a ser fondo de un
 * texto o texto él mismo, el tono tiene que moverse en los extremos de la
 * paleta para llegar a contraste, y esos roles son `--linea-fondo` (fondo de un
 * texto), `--linea-nav` (texto sobre blanco) y `--linea-sobre-tinte` (texto
 * sobre el tinte de la línea). Están abajo con sus números. La alternativa —un condicional
 * por línea dentro de cada componente— repartiría la misma tabla de contraste
 * en tantos sitios como componentes haya.
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

/**
 * El puente eje del temario → línea de la red.
 *
 * Se dejó fuera de este archivo mientras ninguna pantalla lo usaba. La Fase 2
 * —migrar /camino, /tema/[id] y /leccion/[id] a esta capa— lo trae acá porque
 * las tres pantallas y la galería `/_design` necesitan resolver "¿de qué línea
 * es este eje?", y `colores.ts` es el único punto que todas alcanzan sin
 * importar desde `lib/` (que es server-only).
 *
 * El orden es el de `EJES` en `lib/modulos.ts` —y por lo tanto el de
 * `ejesDelCamino()` en `lib/camino.ts`—: la posición en ese array **es** la
 * línea. El mapa se escribe por id y no por índice para que un reordenamiento de
 * `EJES` falle ruidoso acá en vez de renumerar las líneas en silencio.
 *
 * Un id que no esté en el mapa devuelve `undefined`: el llamador cae al color
 * fuera de eje (tinta), nunca revienta.
 */
const LINEA_POR_EJE: Record<string, LineaId> = {
  numeros: "01",
  "algebra-y-funciones": "02",
  geometria: "03",
  "probabilidad-y-estadistica": "04",
};

export function lineaDeEje(ejeId: string): LineaId | undefined {
  return LINEA_POR_EJE[ejeId];
}

/**
 * El texto que va ENCIMA del color de línea, es decir, encima de
 * `--linea-fondo`.
 *
 * No es una decisión de gusto: es contraste medido contra `--text-inverse`
 * (#F7F7F5). Línea 01 → 4,52:1, línea 03 → 5,81:1 (ya con el verde oscurecido
 * de `FONDO_POR_LINEA`; con el #00843D de la línea daba 4,48:1 y no pasaba),
 * línea 04 → 6,41:1. La línea 02 (#FFB600) da **1,64:1**, que no es legible, y
 * con `--text-primary` sube a 10,10:1. Por eso la 02 es la excepción.
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

/**
 * El color de línea cuando es **fondo de un texto**: el botón de variante
 * `linea` y el chip de la alternativa correcta.
 *
 * Tres de las cuatro son el color de línea tal cual. La 03 no: #00843D con
 * texto claro (#F7F7F5) da **4,48:1**, dos centésimas bajo el 4,5:1 de AA, y el
 * `titulo-s` del botón (15px/600) no llega a texto grande. `--line-03-oscura`
 * (#007034) sube ese par a 5,81:1.
 *
 * Las otras tres no lo necesitan: 01 → 4,52:1, 04 → 6,41:1, y la 02 lleva texto
 * en tinta (10,10:1). Por eso el mapa apunta al color de línea y no a una serie
 * "oscura" completa que habría que mantener sin que arreglara nada.
 *
 * Esto NO alcanza al disco de PlacaLinea, que también lleva un dígito encima:
 * ver el comentario en ese componente.
 */
const FONDO_POR_LINEA: Record<LineaId, string> = {
  "01": "var(--line-01)",
  "02": "var(--line-02)",
  "03": "var(--line-03-oscura)",
  "04": "var(--line-04)",
};

/**
 * El color de línea cuando es **texto sobre superficie clara**: hoy, la etiqueta
 * del ítem activo de NavInferior sobre `surface-card`.
 *
 * La excepción es la 02, por el motivo inverso al de `CONTRASTE_POR_LINEA`: ahí
 * el amarillo es el fondo y funciona; acá es el texto y sobre blanco da
 * **1,76:1** en un cuerpo de 9px. Cae a `--text-primary` (17,76:1). El aclarado
 * tampoco serviría: `--line-02-clara` está calibrado contra tinta oscura y sobre
 * blanco es peor todavía.
 *
 * Las otras tres pasan AA sobre blanco: 01 → 4,85:1, 03 → 4,81:1, 04 → 6,87:1.
 *
 * La 02 pierde el color en la etiqueta, no en la pantalla: la placa, las
 * estaciones y la barra de progreso siguen identificando la línea.
 */
const NAV_POR_LINEA: Record<LineaId, string> = {
  "01": "var(--linea)",
  "02": "var(--text-primary)",
  "03": "var(--linea)",
  "04": "var(--linea)",
};

/**
 * El color de línea cuando es texto sobre **el tinte de su propia línea**
 * (`--linea-tinte`): hoy, el rótulo "Lo que estás viendo" de la tarjeta teñida
 * del paso, y nada más.
 *
 * Es un mapa propio y no una segunda lectura de `NAV_POR_LINEA` porque el tinte
 * es más oscuro que la tarjeta y ahí se pierden dos pares. Medido:
 *
 * | | sobre #FFFFFF | sobre `--linea-tinte` |
 * |---|---|---|
 * | 01 #E4002B | 4,85 | **4,06** |
 * | 03 #00843D | 4,81 | **4,30** |
 * | 04 #0057B8 | 6,87 | 5,84 |
 *
 * Así que la 01 baja a `--line-01-oscura` (#CC0026 → 4,90) y la 03 al
 * `--line-03-oscura` que ya existía por el botón (#007034 → 5,58). La 04 pasa
 * con el color de línea crudo y la 02 va en tinta, igual que en el mapa de nav
 * y por el mismo motivo: el amarillo sobre su tinte da 1,63:1.
 *
 * `--linea-nav` no se tocó a propósito: está bien calibrado sobre blanco, que es
 * donde lo usan NavInferior y el botón de variante `texto`. Mezclar los dos roles
 * en un token arrastraría este ajuste a pantallas que no lo necesitan. Ver
 * docs/deuda-contraste-etiquetas.md.
 */
const SOBRE_TINTE_POR_LINEA: Record<LineaId, string> = {
  "01": "var(--line-01-oscura)",
  "02": "var(--text-primary)",
  "03": "var(--line-03-oscura)",
  "04": "var(--linea)",
};

/** `style` es `CSSProperties`, que no admite custom properties; esto sí. */
export interface EstiloDeLinea extends CSSProperties {
  "--linea": string;
  "--linea-contraste": string;
  "--linea-tinte": string;
  "--linea-clara": string;
  "--linea-fondo": string;
  "--linea-nav": string;
  "--linea-sobre-tinte": string;
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
    "--linea-fondo": FONDO_POR_LINEA[linea],
    "--linea-nav": NAV_POR_LINEA[linea],
    "--linea-sobre-tinte": SOBRE_TINTE_POR_LINEA[linea],
  };
}
