/* Geometría. La estación de la derecha es `proxima` de `Estacion.tsx` a escala
   1:1 (15px de diámetro, borde de 3px: en SVG el trazo se reparte a los dos
   lados del radio, así que un `r` de 6 con `stroke-width` 3 mide 15px de borde
   a borde).

   **La estación de esta lección ya NO es 1:1 con `Estacion.tsx`.** Era el
   `actual` exacto —21px, borde de 5px, o sea `r` 8—, y eso deja 11px de hueco
   interior. Un visto de trazo 2 dentro de 11px son tres segmentos de dos o tres
   píxeles en un teléfono: cabe en el archivo y no se lee en la mano. Con `r` 11
   y el mismo borde de 5px la estación mide 27px y el hueco 17px, que es donde el
   visto entra con aire por los cuatro lados. La `proxima` no crece con ella: la
   jerarquía entre las dos es el punto, y engordar las dos habría subido el peso
   de la pieza entera sin ganar legibilidad donde hacía falta.

   El riel es de 6px, como el de `RielEstaciones.tsx:100` (`w-1.5`), y como allá
   solo van redondeados sus dos extremos.

   **`X_ESTACION` y `CENTRO_Y` están escritos también en el CSS**, como el
   `transform-origin: 14px 14px` de las cuatro clases `.sello-*`. No se pueden
   pasar por variable: `transform-origin` en SVG se resuelve en unidades del
   viewBox y el keyframe vive en `globals.css`. Si alguno de los dos se mueve,
   hay que mover el otro — el comentario del CSS dice lo mismo desde su lado. */
const CENTRO_Y = 14;
/* 288 y no 168. A 168 la pieza medía menos de un tercio de la fila de tarjetas
   (576px con su gap) y en la pantalla real se leía como un ícono separador entre
   el título y las cifras, no como el momento de la pantalla — verificado en
   /leccion/[id], que es donde único se puede ver: en /_design la pieza está
   aislada y no compite con nada.

   La mitad exacta de la fila. No más: el sello no lleva ningún dato y ganarle
   ancho a las dos tarjetas que sí lo llevan sería invertir la jerarquía. */
const ANCHO = 288;
const ALTO = 28;
const X_ESTACION = 14;
const X_SIGUIENTE = ANCHO - 14;
const ALTO_RIEL = 6;

/* El anillo de la estación de esta lección: 27px de borde a borde con el trazo
   de 5px, o sea 17px de hueco interior. Ver la nota de escala de arriba. */
const R_ANILLO = 11;

/* El núcleo: el campo teñido que cae dentro del anillo y sobre el que se traza
   el visto.

   **Llena el hueco y se mete medio píxel bajo el trazo.** El anillo tiene radio
   interior 8,5 (r 11 menos la mitad de sus 5px de trazo); un núcleo de 8,5
   exacto deja un hilo de fondo entre los dos por el antialiasing del trazo, que
   a radio justo no cierra. Con 9 el solape lo tapa. */
const R_NUCLEO = 9;

/* El visto, en coordenadas absolutas del viewBox: brazo corto bajando hacia el
   vértice y brazo largo subiendo. Los tres puntos caen dentro del radio interior
   de 8,5 con su medio trazo incluido — el más lejano es el extremo derecho, a
   6,16 del centro, 7,16 contando el trazo.

   Va en absolutas y no en relativas porque el anillo, el núcleo y el
   `transform-origin` del CSS ya están escritos así: una sola forma de leer dónde
   está el centro. */
const VISTO = `M ${X_ESTACION - 4.7} ${CENTRO_Y + 0.3} L ${X_ESTACION - 1.3} ${CENTRO_Y + 3.7} L ${X_ESTACION + 5} ${CENTRO_Y - 3.6}`;

/**
 * El sello de estación: el momento del cierre de una lección o de un módulo.
 *
 * Un tramo de línea con dos paradas —la estación de este cierre y la siguiente—
 * y, si quedó sólido, el sello estampado sobre la primera y el tramo creciendo
 * hacia la segunda.
 *
 * **Los dos estados dicen cosas distintas y ninguno miente.** Con aciertos
 * suficientes el sello se estampa y la línea avanza. Sin ellos el anillo se
 * asienta igual —llegaste a la estación— pero queda hueco y el tramo no se
 * mueve: el punto marcado, sin clavar. Un sello estampado con 0 de 3 sería la
 * única afirmación que esta pantalla no puede hacer.
 *
 * Quién decide cuál va: `alcanzaDominio()` de `lib/umbrales.ts`, el mismo
 * umbral que ya elige el título y el CTA primario del cierre de lección. El
 * sello no tiene opinión propia sobre el desempeño; repite en señalética lo que
 * la pantalla ya afirma en palabras.
 *
 * ## Color: silueta, campo y marca son tres roles distintos
 *
 * La **silueta** —los dos anillos y el tramo— va en `--linea-nav` y no en
 * `--linea`. No es capricho: `--line-02` (#FFB600) sobre el fondo de página da
 * **1,66:1**, muy por debajo del 3:1 de WCAG 1.4.11 para gráficos, y la 02 es
 * *álgebra*, o sea el eje del módulo v1 — el sello quedaría invisible justo
 * donde más se ve. `--linea-nav` es el token que ya existe para "color de línea
 * sobre superficie clara" (`colores.ts:149-154`) y en la 02 cae a tinta:
 * 16,75:1. En las otras tres es el color de línea crudo.
 *
 * El **núcleo** va en `--linea-tinte` y el **visto** en `--linea-sobre-tinte`.
 * Son el par que `colores.ts` ya tiene calibrado para exactamente esto: un
 * campo pálido con la identidad del eje y el color que se lee encima de él
 * (`colores.ts:156-185`, con su tabla). Medido sobre el tinte: 01 → 4,90 · 02 →
 * 16,50 · 03 → 5,58 · 04 → 5,84. Ningún token nuevo y ningún primitivo
 * recalibrado; el gate está en `lib/contrasteSello.test.ts`.
 *
 * ## Lo que esto cuesta, dicho entero
 *
 * El núcleo llevaba `--linea` crudo y era masa sólida del color del eje: la
 * estación `pasada` de `Estacion.tsx`, "el recorrido hecho es tinta, no
 * contorno". Con el tinte esa lectura se pierde — **la estación sellada ya no se
 * ve igual que en el riel de /camino**, y el disco por sí solo casi no contrasta
 * con el fondo (1,02 a 1,19 según la línea).
 *
 * Es deliberado y el reparto de trabajo cambió con él: lo que separa un estado
 * del otro pasó a ser **el visto**, no la presencia del disco. El disco es el
 * campo sobre el que el visto se lee, y quien sostiene la pieza contra el fondo
 * sigue siendo el anillo. A cambio, el sello afirma "correcto" con la marca que
 * eso tiene en cualquier interfaz, en vez de pedir que se infiera de un punto
 * relleno.
 *
 * ## Una suposición, escrita
 *
 * Los dos discos se rellenan con `--color-bg` y no con `transparent`: el riel
 * apagado cruza por detrás de los dos, y sin relleno se vería pasar por dentro
 * de la estación hueca. Eso da por sentado que la pieza se monta sobre el fondo
 * de página, que es donde los dos cierres la montan. Dentro de una superficie de
 * otro tono —una `Tarjeta`, o los paneles de `/_design`— el hueco queda de un
 * blanco apenas distinto al de su entorno. Es imperceptible entre #F8F8FB y
 * #FFFFFF, pero si algún día la pieza se mueve a una superficie oscura hay que
 * resolverlo acá y no allá.
 *
 * ## Accesibilidad
 *
 * `aria-hidden`. Es decoración pura: los aciertos ya están en la tarjeta
 * ACIERTOS, la posición en TU AVANCE y el estado en el `h1` de la pantalla.
 * Etiquetarlo sería la tercera repetición del mismo hecho para quien lee con
 * lector. Mismo criterio que `Estacion.tsx:5-8`.
 */
export function SelloDeEstacion({
  /** `true` cuando el cierre alcanzó el umbral: se estampa y el tramo avanza. */
  estampado,
  /**
   * Si el momento se reproduce. En `false` la pieza pinta su estado final
   * directo, sin retrasos: es la misma salida que da `prefers-reduced-motion`,
   * no una segunda maqueta. Quien lo decide es `RunnerLeccion`, que sabe si
   * este cierre es el primero.
   */
  animar = true,
  className = "",
}: {
  estampado: boolean;
  animar?: boolean;
  className?: string;
}) {
  const claseAnillo = animar ? "sello-anillo" : undefined;
  const claseNucleo = animar ? "sello-nucleo" : undefined;
  const claseVisto = animar ? "sello-visto" : undefined;
  const claseTramo = animar ? "sello-tramo" : undefined;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      width={ANCHO}
      height={ALTO}
      className={`mx-auto block ${className}`.trim()}
    >
      {/* El tramo que todavía no es tuyo. Está desde el primer frame en los dos
          estados, y en el que no avanza es lo único que queda: la línea sigue
          hasta la estación siguiente, pero no con vos.

          **`--text-muted` y no `--border-hairline`.** Iba en hairline (#D8D9D4,
          1,34:1 contra el fondo) y en la pantalla real era casi invisible: el
          estado sin sello se leía como dos puntos negros sueltos, sin ninguna
          línea que sugiriera que el recorrido sigue. Sin eso el anillo hueco no
          queda esperando, queda cerrado — y ahí la pieza deja de decir "todavía
          no" para no decir nada.

          `--text-muted` (#A9ABAF, 2,17:1) es el gris apagado que el sistema ya
          usa para esto mismo: es el del estado `cerrada` de `Estacion.tsx`. No
          se recalibra ningún primitivo; se elige el token del rol correcto. */}
      <rect
        x={X_ESTACION}
        y={CENTRO_Y - ALTO_RIEL / 2}
        width={X_SIGUIENTE - X_ESTACION}
        height={ALTO_RIEL}
        rx={ALTO_RIEL / 2}
        fill="var(--text-muted)"
      />

      {/* El tramo ganado, encima del anterior y creciendo desde la estación de
          este cierre. Solo existe en el estado con sello. */}
      {estampado && (
        <rect
          className={claseTramo}
          x={X_ESTACION}
          y={CENTRO_Y - ALTO_RIEL / 2}
          width={X_SIGUIENTE - X_ESTACION}
          height={ALTO_RIEL}
          rx={ALTO_RIEL / 2}
          fill="var(--linea-nav)"
        />
      )}

      {/* La estación siguiente: `proxima`, contorno sobre el fondo de página.
          No cambia entre estados — sigue siendo la que viene, se haya ganado el
          tramo o no. Va después de los rieles para que el relleno los tape y el
          trazo no se le vea cruzando por dentro. */}
      <circle
        cx={X_SIGUIENTE}
        cy={CENTRO_Y}
        r={6}
        fill="var(--color-bg)"
        stroke="var(--linea-nav)"
        strokeWidth={3}
      />

      {/* La estación de este cierre. El anillo es el mismo en los dos estados y
          se asienta en los dos: llegar acá es un hecho, no un logro. */}
      <circle
        className={claseAnillo}
        cx={X_ESTACION}
        cy={CENTRO_Y}
        r={R_ANILLO}
        fill="var(--color-bg)"
        stroke="var(--linea-nav)"
        strokeWidth={5}
      />

      {/* El sello: el campo teñido y el visto encima. Los dos solo en el estado
          estampado — el anillo hueco es el "todavía no", y un visto sobre un
          cierre bajo el umbral sería la afirmación que la pantalla no puede
          hacer. */}
      {estampado && (
        <>
          <circle
            className={claseNucleo}
            cx={X_ESTACION}
            cy={CENTRO_Y}
            r={R_NUCLEO}
            fill="var(--linea-tinte)"
          />
          <path
            className={claseVisto}
            d={VISTO}
            fill="none"
            stroke="var(--linea-sobre-tinte)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
