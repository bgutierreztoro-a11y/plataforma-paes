"use client";

import { IconoCorrecto } from "@/components/ui/Icono";
import type { EstadoNodo } from "@/lib/estadoNodo";

/** Copy reutilizado de la grilla que este camino reemplaza: ya estaba escrito y
 *  ya era honesto sobre por qué una lección todavía no abre. */
export const COPY_EN_PREPARACION =
  "En preparación. Se abre después de la revisión matemática y de originalidad.";

/**
 * El disco del camino. Es lo único que quedó en este archivo: la etiqueta, la
 * tarjeta por nodo y la fila se retiraron el 2026-07-27, cuando los nodos
 * dejaron de arrastrar una tarjeta cada uno. El layout vive ahora en
 * `CaminoVertical`, y acá queda la forma del disco, que es lo que los dos
 * niveles del camino comparten de verdad.
 *
 * Los estados se distinguen por forma **y** color, nunca por color solo
 * (MASTER.md §2.1): un nodo que solo cambia de tono no comunica nada a quien no
 * distingue esos tonos. El texto que los nombra vive en la tarjeta del nodo
 * activo.
 *
 * El de "en construcción" NO lleva candado. Un candado promete que existe algo
 * detrás y que se puede abrir cumpliendo un requisito; acá el contenido todavía
 * no está escrito, así que mentiría. Contorno punteado = "en obra".
 *
 * `meta` lo agranda y le pone un segundo contorno. Se reserva al cierre de un
 * tema: es el último punto del recorrido y el único que termina algo, así que
 * tiene que leerse distinto sin cambiar de vocabulario. Un disco más grande y
 * con doble anillo es "la meta"; un color nuevo habría sido un estado nuevo.
 */
export function PuntoNodo({ estado, meta = false }: { estado: EstadoNodo; meta?: boolean }) {
  /* La transición cubre color, sombra y escala, no solo color. Cuando el
     estudiante vuelve de terminar una lección, el nodo se repinta con el estado
     nuevo al hidratar; sin transición ese cambio es un salto y no se alcanza a
     ver. Con ella el nodo se mueve hacia su estado nuevo (`--dur-slow`, 360ms).

     Límite conocido: es una transición al pintar el estado nuevo, no una
     animación que conozca el anterior. No hay evento de navegación entre la
     lección y el camino que permita lo segundo. */
  /* 56px en móvil y 60px en escritorio; la meta, 1,4× (78 y 84). Bien por
     encima del mínimo táctil de 44px de MASTER.md §5 — el disco es lo que se
     toca para mover la tarjeta, así que no puede ser un adorno chico. */
  const tamano = meta
    ? "h-[78px] w-[78px] sm:h-[84px] sm:w-[84px]"
    : "h-14 w-14 sm:h-[60px] sm:w-[60px]";
  const base = `flex ${tamano} shrink-0 items-center justify-center rounded-full shadow-tarjeta motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-[360ms] motion-reduce:transition-none${
    meta ? " outline outline-2 outline-offset-4 outline-border-fuerte" : ""
  }`;
  switch (estado) {
    case "completado":
      return (
        <span className={`${base} bg-success text-white`}>
          <IconoCorrecto className="h-7 w-7 text-white sm:h-8 sm:w-8" />
        </span>
      );
    case "porRepasar":
      return (
        <span
          className={`${base} bg-surface ring-2 ring-attention-fuerte ring-offset-2 ring-offset-bg`}
        >
          <span className="h-3.5 w-3.5 rounded-full bg-attention-fuerte sm:h-4 sm:w-4" />
        </span>
      );
    case "enCurso":
      // Mismo anillo de acento que "disponible" pero sin respiración: hay algo
      // empezado, así que no hace falta llamar la atención para arrancar.
      return (
        <span className={`${base} bg-surface ring-2 ring-accent ring-offset-2 ring-offset-bg`}>
          <span className="h-4 w-4 rounded-full bg-accent sm:h-5 sm:w-5" />
        </span>
      );
    case "disponible":
      /* Respiración continua, no parpadeo: es el único disco que dice "acá se
         empieza". La animación es decorativa —se apaga con
         prefers-reduced-motion— y el estado sigue legible por el anillo, por el
         relleno y por la tarjeta, nunca solo por el movimiento. */
      return (
        <span
          className={`${base} respiracion-nodo bg-accent text-white ring-2 ring-accent ring-offset-2 ring-offset-bg`}
        >
          <span className="h-4 w-4 rounded-full bg-white sm:h-5 sm:w-5" />
        </span>
      );
    case "enConstruccion":
      // Sin sombra: lo que está en obra no despega (MASTER.md §2.5).
      return (
        <span
          className={`${base} border-2 border-dashed border-border-fuerte bg-bg !shadow-none`}
        />
      );
  }
}
