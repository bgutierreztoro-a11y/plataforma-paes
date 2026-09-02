"use client";

import Link from "next/link";
import { ALTO_ENCABEZADO_EJE } from "@/lib/geometriaCamino";

/**
 * La banda que abre cada eje del temario en /camino.
 *
 * Es sticky: el estudiante siempre sabe en qué eje va sin tener que subir a
 * buscarlo. `position: sticky` **no saca al elemento del flujo**, así que la
 * banda sigue ocupando su alto mientras está pegada — que es la propiedad de la
 * que depende el ancla de la tarjeta del nodo activo
 * (`desplazamientoVertical`).
 *
 * **El alto viene de `ALTO_ENCABEZADO_EJE` por `style`, no de una clase de
 * Tailwind ni de padding.** Es a propósito y es el punto delicado de este
 * componente: ese mismo número entra en el cálculo del ancla, y si el alto real
 * se separara de la constante —un padding que crezca con el tamaño de fuente
 * del sistema, una segunda línea de texto— la tarjeta se despegaría del nodo
 * sin que nada fallara. Atarlo por `style` hace que no exista la posibilidad de
 * que se separen. Mismo contrato que `PASO_FILA`.
 *
 * Por eso el nombre del eje se trunca en vez de envolver: "Probabilidad y
 * estadística" más su contador no caben en una línea a 360px, y dejar que
 * envuelva rompería el alto fijo. El nombre completo no se pierde — el eje es
 * también el rótulo de la tarjeta de cada nodo.
 *
 * **Con `href`, la banda entra a la línea del eje** (pantalla 03). En un eje
 * que no se pliega el enlace es la banda entera; en uno plegable comparte los
 * 44px con el botón que despliega, que se queda con el borde derecho y el
 * contador. Los dos conservan sus 44px de alto táctil.
 *
 * El enlace **no** convierte la banda en un `control` para
 * `tapariaUnaBanda`. La tarjeta del nodo activo arranca en `--canaleta`
 * (104px) y la columna mide 560, así que aun tapada le quedan 104px de enlace
 * clicables: nunca lo deshabilita, que es lo que ese volteo existe para
 * evitar. Contar todas las bandas como controles ya se probó y volteaba la
 * tarjeta en el primer nodo de la columna, donde termina bajo la barra de
 * navegación (ver `CaminoVertical`). El botón de plegado, en cambio, sí es un
 * control y por eso sigue marcándose como tal.
 */
export function EncabezadoEje({
  nombre,
  href,
  contador,
  expandido,
  onAlternar,
  desplazamientoSticky = 0,
}: {
  nombre: string;
  /** Destino de la banda: la pantalla de la línea de este eje. Ausente = la
   *  banda es solo un rótulo. */
  href?: string;
  /** Cuántos píxeles hay entre la barra de navegación y donde esta banda debe
   *  pegarse. En /camino es el alto de la franja fija; en el segundo nivel no
   *  hay bandas, así que no se usa. */
  desplazamientoSticky?: number;
  /** Solo en los ejes plegables: "4 unidades en construcción". Ya formateado:
   *  este componente no sabe qué se cuenta. */
  contador?: string;
  /** `undefined` en un eje que no se pliega (tiene contenido): la banda es un
   *  encabezado y no un control. */
  expandido?: boolean;
  onAlternar?: () => void;
}) {
  /* El tope se acumula: `--tope-nav` es 0 en móvil (la barra va abajo) y el
     alto real de la barra en escritorio (donde se pega arriba), y encima de eso
     va lo que ya ocupe la franja fija de la pantalla. Sumarlo con `calc` en vez
     de escribir el total a mano es lo que evita que las dos capas se pisen
     cuando una cambie de alto.

     `z-20`: sobre los discos y los títulos (`z-10`), que tienen que pasar por
     debajo al hacer scroll, y bajo la franja de la pantalla y la tarjeta del
     nodo activo (`z-30`), que son las únicas que pueden taparla.

     Sangrado negativo para que la banda llegue a los bordes de la caja del
     camino: una franja con aire a los lados no se lee como franja. */
  const nombreEje = (
    <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold uppercase tracking-wide text-ink-suave">
      {nombre}
    </span>
  );

  /* La zona del nombre: enlace a la línea si hay destino, texto si no. En un eje
     plegable no ocupa la banda entera —el botón se queda con el borde derecho—,
     así que el ancho lo reparte `flex-1`.

     El nombre accesible incluye el texto visible, que es lo que pide WCAG 2.5.3:
     "Números" solo diría de qué eje se trata, no que la banda lleva a alguna
     parte. */
  const nombreEnlazado = href ? (
    <Link
      href={href}
      aria-label={`Ver la línea completa: ${nombre}`}
      className={`flex h-full min-w-0 items-center gap-3 pl-3 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-strong sm:pl-4 ${
        onAlternar === undefined ? "w-full pr-3 sm:pr-4" : "flex-1"
      }`}
    >
      {nombreEje}
      {/* La flecha solo cuando la banda no comparte los 44px con el botón de
          plegado. Con los dos, a 390px "Probabilidad y estadística" se recorta a
          "PROBAB…" —medido en el navegador—: el glifo se come el ancho justo del
          único texto que identifica el tramo, y ahí el ± ya dice que la banda
          responde. */}
      {onAlternar === undefined && (
        <span aria-hidden="true" className="shrink-0 text-ink-suave">
          →
        </span>
      )}
    </Link>
  ) : null;

  const enlace =
    nombreEnlazado ??
    (onAlternar === undefined ? (
      <span className="flex w-full items-center px-3 sm:px-4">{nombreEje}</span>
    ) : null);

  return (
    <h2
      className="sticky z-20 -mx-3 flex items-center border-b border-border bg-surface/90 backdrop-blur-md sm:-mx-4"
      style={{
        height: ALTO_ENCABEZADO_EJE,
        top: `calc(var(--tope-nav) + ${desplazamientoSticky}px)`,
      }}
    >
      {enlace}
      {onAlternar !== undefined && (
        /* El botón conserva los 44px de alto táctil que pide MASTER.md §5 sin
           agregar padding propio —que rompería el alto fijo del que depende el
           ancla—. Con enlace deja de ocupar la banda entera y se queda con el
           borde derecho: el nombre pasa a ser el enlace, y por eso el botón
           necesita nombre accesible propio. */
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={expandido}
          aria-label={href ? `${expandido ? "Plegar" : "Desplegar"} ${nombre}` : undefined}
          className={`flex h-full items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-strong ${
            href ? "shrink-0 pl-3 pr-3 sm:pr-4" : "w-full px-3 sm:px-4"
          }`}
        >
          {href ? null : nombreEje}
          {/* Sin fecha y sin "próximamente": no prometemos plazos que no
              controlamos. */}
          {contador && (
            <span className="shrink-0 text-sm normal-case tracking-normal text-ink-tenue">
              {contador}
            </span>
          )}
          <span aria-hidden="true" className="shrink-0 text-ink-suave">
            {expandido ? "−" : "+"}
          </span>
        </button>
      )}
    </h2>
  );
}
