/**
 * La tarjeta de la dirección "Línea", como constantes de clase.
 *
 * Es la `.card` del HTML de referencia
 * (`docs/referencia/B-linea-interfaz-completa.html:73`): superficie de tarjeta,
 * borde hairline de 1px y radio de 2px. Sin sombra — la jerarquía la dan el
 * borde y el color.
 *
 * Vive como constante y no como componente por lo mismo que
 * `components/ui/alternativa.ts`: los envoltorios que la usan son elementos
 * distintos (`<figure>` con `<figcaption>`, `<div>` de escena, el panel con
 * `role="status"`) y meterlos en un componente común obligaría a parametrizar la
 * etiqueta y la semántica para no ganar nada.
 *
 * `TARJETA_VISUAL` es la variante de la pantalla 05, que baja el padding a 8px
 * (`B-linea-interfaz-completa.html:246`): ahí adentro va un SVG a ancho completo
 * y el aire lo pone el propio dibujo, no la caja.
 */
export const TARJETA_LINEA = "rounded-sm border border-hairline bg-card";

export const TARJETA_VISUAL = `${TARJETA_LINEA} p-2`;
