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
export function PuntoNodo({
  estado,
  meta = false,
  destacado = false,
}: {
  estado: EstadoNodo;
  meta?: boolean;
  /** El nodo trae la tarjeta activa ahora mismo. No es un estado nuevo — se
   *  compone con cualquiera de los cinco, salvo `enConstruccion`: quien
   *  llama ya filtra ese caso, porque un disco grande y de relleno sólido
   *  prometería una acción que un nodo bloqueado no tiene (ver
   *  `FilaCamino`, que aplica la misma exclusión al fondo de la fila). Tiene
   *  que ganar la pantalla sin ayuda de la tarjeta: por eso vive en el disco
   *  y no en el texto de al lado. */
  destacado?: boolean;
}) {
  /* La transición cubre color, sombra y escala, no solo color. Cuando el
     estudiante vuelve de terminar una lección, el nodo se repinta con el estado
     nuevo al hidratar; sin transición ese cambio es un salto y no se alcanza a
     ver. Con ella el nodo se mueve hacia su estado nuevo (`--dur-slow`, 360ms).

     Límite conocido: es una transición al pintar el estado nuevo, no una
     animación que conozca el anterior. No hay evento de navegación entre la
     lección y el camino que permita lo segundo. */
  /* 56px en móvil y 60px en escritorio; la meta, 1,4× (78 y 84). Bien por
     encima del mínimo táctil de 44px de MASTER.md §5 — el disco es lo que se
     toca para mover la tarjeta, así que no puede ser un adorno chico.

     El destacado (Fase 4) es un escalón intermedio, 64/68px: por debajo de
     la meta —que sigue siendo el disco más grande del camino, es la
     llegada— pero claramente por encima del resto. No usa el multiplicador
     de la meta porque no comparten motivo: uno dice "esto termina el tema",
     el otro dice "esto es lo tuyo ahora mismo". */
  const tamano = meta
    ? "h-[78px] w-[78px] sm:h-[84px] sm:w-[84px]"
    : destacado
      ? "h-16 w-16 sm:h-[68px] sm:w-[68px]"
      : "h-14 w-14 sm:h-[60px] sm:w-[60px]";
  /* La sombra la pone cada estado, no la base. La elevación es la jerarquía del
     recorrido: cuanto más cerca está un nodo de ser lo próximo que hay que
     hacer, más despega del papel. Antes los cinco compartían la misma sombra y
     el camino se leía como una fila de discos igual de lejanos.
     `respiracion-nodo` anima solo `transform`, así que la sombra más alta del
     nodo disponible convive con ella sin parpadear.

     El borde inferior de 3px es el mismo lenguaje que `Boton.tsx` (variante
     `primario`): el disco destacado se lee como un control, no solo como un
     marcador de estado. Sin el `motion-safe:active:*` de Boton — el clic lo
     recibe el `<button>` que envuelve al disco en `FilaCamino`, no el disco
     mismo, así que no hay un `:active` propio que animar sin acoplarse al
     padre. */
  const base = `flex ${tamano} shrink-0 items-center justify-center rounded-full motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-[360ms] motion-reduce:transition-none${
    meta ? " outline outline-2 outline-offset-4 outline-border-fuerte" : ""
  }${destacado ? " border-b-[3px] border-b-[var(--linea)]" : ""}`;

  /* El glifo escala con el disco: en la meta todo mide 1,4×, y un trazo del
     tamaño de siempre dentro de un disco más grande se lee como un error de
     centrado antes que como énfasis. Mismo motivo para el destacado, un
     escalón más chico. */
  const glifo = meta
    ? "h-9 w-9 sm:h-10 sm:w-10"
    : destacado
      ? "h-8 w-8 sm:h-9 sm:w-9"
      : "h-7 w-7 sm:h-8 sm:w-8";
  const punto = meta
    ? "h-5 w-5 sm:h-6 sm:w-6"
    : destacado
      ? "h-4.5 w-4.5 sm:h-5.5 sm:w-5.5"
      : "h-4 w-4 sm:h-5 sm:w-5";

  /* Relleno sólido incluso en los estados que hoy se leen por anillo
     (`porRepasar`, `enCurso`): destacado es "esto es lo tuyo ahora", y un
     disco que sigue siendo `bg-surface` con un aro no gana la pantalla por sí
     solo — necesita leer la tarjeta para confirmarlo, que es justo lo que el
     objetivo pide evitar. El color no cambia de familia, solo de tratamiento:
     el ámbar de "por repasar" sigue siendo ámbar, el color de línea de "en
     curso" sigue siendo el de la línea.

     El relleno va en `--linea-fondo`, no en `--linea`: acá el color es fondo de
     un glifo, y ese es el rol que `--linea-fondo` cubre —oscurece la 03 a
     #007034 para llegar a AA, igual que el botón de variante `linea`—. El glifo
     encima toma `--linea-contraste` (claro en 01/03/04, tinta en la 02, que con
     glifo claro daría 1,6:1). */
  const colorDestacado: Record<EstadoNodo, string> = {
    completado: "bg-success",
    porRepasar: "bg-attention-fuerte",
    enCurso: "bg-[var(--linea-fondo)]",
    disponible: "bg-[var(--linea-fondo)]",
    /* No se usa: quien llama excluye este caso (ver el comentario de la prop
       `destacado` más arriba). Declarado igual para que el `Record` sea
       exhaustivo y un estado nuevo no pueda faltar acá en silencio. */
    enConstruccion: "bg-border",
  };

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
      // Lo terminado apoya: está hecho, no reclama nada. Destacado sube un
      // escalón de sombra, igual que el resto de los estados — no cambia de
      // familia de color, ya era relleno sólido.
      return (
        <span
          className={`${base} ${colorDestacado.completado} text-white ${destacado ? "shadow-tarjeta-hover" : "shadow-nivel-1"}`}
        >
          {contenido}
        </span>
      );
    case "porRepasar":
      return (
        <span
          className={
            destacado
              ? `${base} ${colorDestacado.porRepasar} text-white shadow-tarjeta-hover ring-2 ring-attention-fuerte ring-offset-2 ring-offset-bg`
              : `${base} bg-surface text-attention-fuerte shadow-nivel-1 ring-2 ring-attention-fuerte ring-offset-2 ring-offset-bg`
          }
        >
          {contenido}
        </span>
      );
    case "enCurso":
      // Mismo anillo de acento que "disponible" pero sin respiración: hay algo
      // empezado, así que no hace falta llamar la atención para arrancar. El
      // destacado es la excepción: ahí sí hace falta, porque es el nodo con
      // la tarjeta abierta, así que pasa a relleno sólido igual que
      // "disponible".
      return (
        <span
          className={
            destacado
              ? `${base} ${colorDestacado.enCurso} text-[var(--linea-contraste)] shadow-tarjeta-hover ring-2 ring-[var(--linea)] ring-offset-2 ring-offset-bg`
              : `${base} bg-surface text-[var(--linea-nav)] shadow-tarjeta ring-2 ring-[var(--linea)] ring-offset-2 ring-offset-bg`
          }
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
          className={`${base} respiracion-nodo bg-[var(--linea-fondo)] text-[var(--linea-contraste)] shadow-tarjeta-hover ring-2 ring-[var(--linea)] ring-offset-2 ring-offset-bg`}
        >
          {contenido}
        </span>
      );
    case "enConstruccion":
      /* Relleno plano, sin trazo (Fase 4). El punteado de la versión anterior
         era ruido de forma sobre un elemento que ya dice su estado por color:
         con 13 de 16 unidades en construcción, ese trazo repetido 13 veces
         era lo que más pesaba visualmente en la pantalla, justo lo contrario
         de lo que un estado recesivo debería hacer. El color solo ya alcanza
         — el disco no compite con el título en gris de al lado ni con la
         ausencia de interacción, que son las otras dos señales de "esto no se
         puede abrir todavía".

         `bg-surface-alt` (ink-100) medía 1,07:1 contra `--color-bg` (ink-50):
         prácticamente invisible, se borraba. Sube a `bg-border` (ink-200,
         que es el mismo tono que ya usa `--color-border`) para conservar la
         continuidad visual del recorrido sin desaparecer del todo — sigue
         siendo el disco más tenue del camino, solo que legible. Sin sombra,
         lo que está en obra no despega (MASTER.md §2.5). */
      return <span className={`${base} bg-border`} />;
  }
}
