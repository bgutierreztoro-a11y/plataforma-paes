"use client";

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
 */
export function EncabezadoEje({
  nombre,
  contador,
  expandido,
  onAlternar,
  desplazamientoSticky = 0,
}: {
  nombre: string;
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

  return (
    <h2
      className="sticky z-20 -mx-3 flex items-center border-b border-border bg-surface/90 backdrop-blur-md sm:-mx-4"
      style={{
        height: ALTO_ENCABEZADO_EJE,
        top: `calc(var(--tope-nav) + ${desplazamientoSticky}px)`,
      }}
    >
      {onAlternar === undefined ? (
        <span className="flex w-full items-center px-3 sm:px-4">{nombreEje}</span>
      ) : (
        /* El botón ocupa la banda entera: su área táctil es los 44px de alto
           que pide MASTER.md §5, sin agregar padding propio —que rompería el
           alto fijo del que depende el ancla. */
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={expandido}
          className="flex h-full w-full items-center gap-3 px-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-4"
        >
          {nombreEje}
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
