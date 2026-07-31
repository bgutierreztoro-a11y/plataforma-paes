"use client";

import type { EstadoNodo } from "@/lib/estadoNodo";

/** Copy reutilizado de la grilla que este camino reemplaza: ya estaba escrito y
 *  ya era honesto sobre por qué una lección todavía no abre. */
export const COPY_EN_PREPARACION =
  "En preparación. Se abre después de la revisión matemática y de originalidad.";

/* ---------- glifos ---------- */

/*
 * Dibujados acá y no importados de `components/ui/Icono`: los de allá vienen con
 * su propio disco de fondo, pensados para ir junto a un texto de feedback. Acá
 * el disco es el nodo, así que el glifo es solo el trazo. Trazo y no relleno
 * porque a 20-24px dentro de un disco de 56 el relleno se empasta.
 *
 * Todos comparten viewBox 24×24 y `currentColor`, así que el color lo pone el
 * disco que los contiene y ninguno trae el suyo.
 */

/** Terminado. */
function GlifoCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Volver a pasar por acá.
 *
 * Es una flecha circular —"revisar"— y **no** una equis ni un signo de
 * admiración, por la misma razón que MASTER.md §3.4 reserva el ámbar: terminar
 * flojo es una invitación a volver, no una falla. La equis es un veredicto
 * sobre la persona y queda para fallos de sistema, igual que el rojo.
 */
function GlifoRepasar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      {/* Arco de ~300°, hueco arriba a la izquierda, con la punta de flecha en
          el extremo superior apuntando en el sentido del giro. */}
      <path
        d="M12 5.5A6.5 6.5 0 1 1 6.4 8.75M9.6 3.6L12 5.5 9.6 7.4"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * La meta: el cierre del tema.
 *
 * Un banderín, que es lo único del camino que no es un punto de paso. Hasta
 * ahora la meta se distinguía **solo por tamaño y contorno**, así que un cierre
 * disponible y una lección disponible dibujaban exactamente el mismo punto
 * blanco: la diferencia se leía si estaban una al lado de la otra, y en el
 * recorrido nunca lo están.
 */
function GlifoMeta({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 21V4"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M7 4.5h10.5l-2.6 4 2.6 4H7z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  );
}

/** El punto de paso, para los estados que no tienen glifo propio. */
function GlifoPunto({ className = "" }: { className?: string }) {
  return <span className={`block rounded-full bg-current ${className}`} />;
}

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
 * **Cada estado tiene su glifo (2026-07-31).** Hasta acá solo "completado" lo
 * tenía: "en curso" y "por repasar" eran los dos un punto con anillo, y lo
 * único que los separaba era el tono —azul contra ámbar—. Es exactamente la
 * distinción por color solo que la regla de arriba prohíbe, y estaba escrita en
 * el archivo que la cita. Ahora "por repasar" lleva la flecha de revisar y la
 * meta su banderín.
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

  /* El glifo escala con el disco: en la meta todo mide 1,4×, y un trazo del
     tamaño de siempre dentro de un disco más grande se lee como un error de
     centrado antes que como énfasis. */
  const glifo = meta ? "h-9 w-9 sm:h-10 sm:w-10" : "h-7 w-7 sm:h-8 sm:w-8";
  const punto = meta ? "h-5 w-5 sm:h-6 sm:w-6" : "h-4 w-4 sm:h-5 sm:w-5";

  /* El glifo se resuelve una vez y en orden de prioridad, no dentro de cada
     rama: qué se dibuja depende del estado **y** de si es meta, y repetir esa
     decisión en cuatro ramas es la forma más segura de que una quede distinta.

     El check gana sobre el banderín: llegar a la meta se cuenta con el mismo
     símbolo que terminar cualquier otra cosa, y ahí el banderín ya cumplió. */
  const contenido =
    estado === "completado" ? (
      <GlifoCheck className={glifo} />
    ) : meta ? (
      <GlifoMeta className={glifo} />
    ) : estado === "porRepasar" ? (
      <GlifoRepasar className={glifo} />
    ) : (
      <GlifoPunto className={punto} />
    );

  switch (estado) {
    case "completado":
      return <span className={`${base} bg-success text-white`}>{contenido}</span>;
    case "porRepasar":
      return (
        <span
          className={`${base} bg-surface text-attention-fuerte ring-2 ring-attention-fuerte ring-offset-2 ring-offset-bg`}
        >
          {contenido}
        </span>
      );
    case "enCurso":
      // Mismo anillo de acento que "disponible" pero sin respiración: hay algo
      // empezado, así que no hace falta llamar la atención para arrancar.
      return (
        <span
          className={`${base} bg-surface text-accent ring-2 ring-accent ring-offset-2 ring-offset-bg`}
        >
          {contenido}
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
          {contenido}
        </span>
      );
    case "enConstruccion":
      /* Relleno gris plano y contorno punteado. Antes el relleno era el color de
         fondo de la página, así que el disco no era un disco: era un hueco en la
         cuadrícula, y en el recorrido se leía como si faltara algo en vez de
         como algo que todavía no está. Sin sombra: lo que está en obra no
         despega (MASTER.md §2.5).

         El punteado sube de `border-fuerte` a `ink-tenue`. El anterior daba
         1,42:1 contra el fondo —prácticamente invisible—, y desde que estos
         nodos son seleccionables (muestran su tarjeta con la razón) ya no son
         un adorno que se pueda dejar al borde de lo perceptible. `ink-tenue`
         da 2,99:1: sigue recesivo, que es lo que corresponde a algo que no se
         puede abrir, pero se ve. No se sube más a propósito — hoy 13 de 16
         unidades están en construcción, y un gris de alto contraste convertiría
         el camino en una pared de discos apagados que le ganaría la atención a
         los dos que sí se pueden abrir. */
      return (
        <span
          className={`${base} border-2 border-dashed border-ink-tenue bg-border !shadow-none`}
        />
      );
  }
}
