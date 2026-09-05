/* Geometría, tomada de `Estacion.tsx` y no reinventada: el anillo es la estación
   `actual` (21px de diámetro, borde de 5px) y la de la derecha es `proxima`
   (15px, borde de 3px). En SVG el trazo se reparte a los dos lados del radio,
   así que un `r` de 8 con `stroke-width` 5 mide 21px de borde a borde, y uno de
   6 con 3 mide 15px.

   El riel es de 6px, como el de `RielEstaciones.tsx:100` (`w-1.5`), y como allá
   solo van redondeados sus dos extremos.

   **`X_ESTACION` y `CENTRO_Y` están escritos también en el CSS**, como el
   `transform-origin: 12px 12px` de las tres clases `.sello-*`. No se pueden
   pasar por variable: `transform-origin` en SVG se resuelve en unidades del
   viewBox y el keyframe vive en `globals.css`. Si alguno de los dos se mueve,
   hay que mover el otro — el comentario del CSS dice lo mismo desde su lado. */
const CENTRO_Y = 12;
/* 288 y no 168. A 168 la pieza medía menos de un tercio de la fila de tarjetas
   (576px con su gap) y en la pantalla real se leía como un ícono separador entre
   el título y las cifras, no como el momento de la pantalla — verificado en
   /leccion/[id], que es donde único se puede ver: en /_design la pieza está
   aislada y no compite con nada.

   La mitad exacta de la fila. No más: el sello no lleva ningún dato y ganarle
   ancho a las dos tarjetas que sí lo llevan sería invertir la jerarquía. */
const ANCHO = 288;
const ALTO = 24;
const X_ESTACION = 12;
const X_SIGUIENTE = ANCHO - 12;
const ALTO_RIEL = 6;

/* El núcleo del sello: el disco de color que cae dentro del anillo.

   **Llena el hueco y se mete medio píxel bajo el trazo.** El anillo tiene radio
   interior 5,5 (r 8 menos la mitad de sus 5px de trazo); un núcleo de 5 dejaba
   un hilo de fondo entre los dos, y en las tres líneas donde el anillo y el
   núcleo son del mismo color —01, 03 y 04, donde `--linea-nav` ES `--linea`—
   ese hilo era lo único que se veía: el disco se leía como una diana, no como
   una estación estampada, y la diferencia con el estado sin sello quedaba
   reducida a un arito. Verificado en /_design a 3×, no deducido.

   Con 6 el solape tapa también el antialiasing del trazo, que a radio exacto
   deja un hilo de subpíxel. En 01/03/04 el resultado es un disco sólido —o sea
   la estación `pasada` de `Estacion.tsx`, "el recorrido hecho es tinta, no
   contorno", que es justo lo que la pieza quiere decir— y en la 02 el amarillo
   pierde medio píxel bajo la tinta del anillo, imperceptible. */
const R_NUCLEO = 6;

/**
 * El sello de estación: el momento del cierre de una lección.
 *
 * Un tramo de línea con dos paradas —la estación de esta lección y la
 * siguiente— y, si la lección quedó sólida, el sello estampado sobre la
 * primera y el tramo creciendo hacia la segunda.
 *
 * **Los dos estados dicen cosas distintas y ninguno miente.** Con aciertos
 * suficientes el sello se estampa y la línea avanza. Sin ellos el anillo se
 * asienta igual —llegaste a la estación— pero queda hueco y el tramo no se
 * mueve: el punto marcado, sin clavar. Un sello estampado con 0 de 3 sería la
 * única afirmación que esta pantalla no puede hacer.
 *
 * Quién decide cuál va: `alcanzaDominio()` de `lib/umbrales.ts`, el mismo
 * umbral que ya elige el título y el CTA primario de la pantalla. El sello no
 * tiene opinión propia sobre el desempeño; repite en señalética lo que la
 * pantalla ya afirma en palabras.
 *
 * ## Color: silueta y relleno son roles distintos
 *
 * La silueta —los dos anillos y el tramo— va en `--linea-nav` y no en `--linea`.
 * No es capricho: `--line-02` (#FFB600) sobre el fondo de página da **1,66:1**,
 * muy por debajo del 3:1 de WCAG 1.4.11 para gráficos, y la 02 es *álgebra*, o
 * sea el eje del módulo v1 — el sello quedaría invisible justo donde más se ve.
 * `--linea-nav` es el token que ya existe para "color de línea sobre superficie
 * clara" (`colores.ts:149-154`) y en la 02 cae a tinta: 16,75:1. En las otras
 * tres es el color de línea crudo.
 *
 * El **núcleo** sí va en `--linea` crudo. Ahí el color es masa dentro de un
 * anillo que ya carga la legibilidad, y es donde tiene que estar la identidad
 * del eje. Ningún primitivo se recalibra: `--line-02` y `Estacion.tsx` quedan
 * como están. El gate está en `lib/contrasteSello.test.ts`.
 *
 * ## Una suposición, escrita
 *
 * Los dos discos se rellenan con `--color-bg` y no con `transparent`: el riel
 * apagado cruza por detrás de los dos, y sin relleno se vería pasar por dentro
 * de la estación hueca. Eso da por sentado que la pieza se monta sobre el fondo
 * de página, que es donde el cierre de lección la monta. Dentro de una
 * superficie de otro tono —una `Tarjeta`, o los paneles de `/_design`— el hueco
 * queda de un blanco apenas distinto al de su entorno. Es imperceptible entre
 * #F8F8FB y #FFFFFF, pero si algún día la pieza se mueve a una superficie
 * oscura hay que resolverlo acá y no allá.
 *
 * ## Accesibilidad
 *
 * `aria-hidden`. Es decoración pura: los aciertos ya están en la tarjeta
 * ACIERTOS, la posición en TU AVANCE y el estado en el `h1` de la pantalla.
 * Etiquetarlo sería la tercera repetición del mismo hecho para quien lee con
 * lector. Mismo criterio que `Estacion.tsx:5-8`.
 */
export function SelloDeEstacion({
  /** `true` cuando la lección alcanzó el umbral: se estampa y el tramo avanza. */
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
          esta lección. Solo existe en el estado con sello. */}
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

      {/* La estación de esta lección. El anillo es el mismo en los dos estados y
          se asienta en los dos: llegar acá es un hecho, no un logro. */}
      <circle
        className={claseAnillo}
        cx={X_ESTACION}
        cy={CENTRO_Y}
        r={8}
        fill="var(--color-bg)"
        stroke="var(--linea-nav)"
        strokeWidth={5}
      />

      {/* El sello. Lo único que separa un estado del otro dentro de la estación. */}
      {estampado && (
        <circle
          className={claseNucleo}
          cx={X_ESTACION}
          cy={CENTRO_Y}
          r={R_NUCLEO}
          fill="var(--linea)"
        />
      )}
    </svg>
  );
}
