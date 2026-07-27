"use client";

import Link from "next/link";
import { IconoCorrecto } from "@/components/ui/Icono";
import { retrasoDeEntrada } from "@/lib/geometriaCamino";
import type { EstadoNodo } from "@/lib/estadoNodo";

/** Copy reutilizado de la grilla que este camino reemplaza: ya estaba escrito y
 *  ya era honesto sobre por qué una lección todavía no abre. */
export const COPY_EN_PREPARACION =
  "En preparación. Se abre después de la revisión matemática y de originalidad.";

const ETIQUETA: Record<EstadoNodo, string> = {
  completado: "Completado",
  porRepasar: "Por repasar",
  enCurso: "En curso",
  disponible: "Empezar",
  enConstruccion: "En preparación",
};

/**
 * El punto sobre la recta. Los estados se distinguen por forma **y** color,
 * nunca por color solo (MASTER.md §2.1), y cada uno lleva texto: un nodo que
 * solo cambia de tono no comunica nada a quien no distingue esos tonos.
 *
 * El de "en construcción" NO lleva candado. Un candado promete que existe algo
 * detrás y que se puede abrir cumpliendo un requisito; acá el contenido todavía
 * no está escrito, así que mentiría. Contorno punteado = "en obra".
 *
 * `meta` lo agranda y le pone un segundo contorno. Se reserva al cierre de un
 * tema: es el último punto del trazo y el único que termina algo, así que tiene
 * que leerse distinto sin cambiar de vocabulario. Un punto más grande y con
 * doble anillo es "la meta"; un color nuevo habría sido un estado nuevo.
 */
export function PuntoNodo({ estado, meta = false }: { estado: EstadoNodo; meta?: boolean }) {
  /* La transición cubre color, sombra y escala, no solo color. Cuando el
     estudiante vuelve de terminar una lección, el nodo se repinta con el estado
     nuevo al hidratar; sin transición ese cambio es un salto y no se alcanza a
     ver. Con ella el nodo se mueve hacia su estado nuevo (`--dur-slow`, 360ms).

     Límite conocido: es una transición al pintar el estado nuevo, no una
     animación que conozca el anterior. No hay evento de navegación entre la
     lección y el camino que permita lo segundo. */
  const base = `flex ${meta ? "h-14 w-14" : "h-11 w-11"} shrink-0 items-center justify-center rounded-full shadow-tarjeta motion-safe:transition-[background-color,box-shadow,transform] motion-safe:duration-[360ms] motion-reduce:transition-none${
    meta ? " outline outline-2 outline-offset-[6px] outline-border-fuerte" : ""
  }`;
  switch (estado) {
    case "completado":
      return (
        <span className={`${base} bg-success text-white`}>
          <IconoCorrecto className="text-white" />
        </span>
      );
    case "porRepasar":
      return (
        <span
          className={`${base} bg-surface ring-2 ring-attention-fuerte ring-offset-2 ring-offset-bg`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-attention-fuerte" />
        </span>
      );
    case "enCurso":
      // Mismo anillo de acento que "disponible" pero sin respiración: hay algo
      // empezado, así que no hace falta llamar la atención para arrancar.
      return (
        <span className={`${base} bg-surface ring-2 ring-accent ring-offset-2 ring-offset-bg`}>
          <span className="h-3 w-3 rounded-full bg-accent" />
        </span>
      );
    case "disponible":
      /* Respiración continua, no parpadeo: es el único nodo que dice "acá se
         empieza". La animación es decorativa —se apaga con
         prefers-reduced-motion— y el estado sigue legible por el anillo, por el
         relleno y por la etiqueta, nunca solo por el movimiento. */
      return (
        <span
          className={`${base} respiracion-nodo bg-accent text-white ring-2 ring-accent ring-offset-2 ring-offset-bg`}
        >
          <span className="h-3 w-3 rounded-full bg-white" />
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

export interface NodoTemaProps {
  id: string;
  nombre: string;
  objetivo: string;
  estado: EstadoNodo;
  /** Nombre del eje al que pertenece, para el rótulo superior. */
  ejeNombre: string;
  /** Lecciones completadas sobre las declaradas en el tema. Es la diferencia
   *  visible entre "voy en la mitad" y "terminé", que el estado por sí solo no
   *  alcanza a distinguir. */
  avance: { hechas: number; total: number };
}

/** El texto del nodo, sin el punto. En escritorio el punto va exactamente sobre
 *  la recta y la etiqueta se ancla al lado, así que se posicionan por separado;
 *  en móvil van juntos en una fila. */
export function EtiquetaNodo({
  nombre,
  objetivo,
  estado,
  ejeNombre,
  avance,
}: Omit<NodoTemaProps, "id">) {
  const claseChip =
    estado === "completado"
      ? "bg-success-suave text-success"
      : estado === "porRepasar"
        ? "bg-attention-suave text-attention-fuerte"
        : estado === "disponible" || estado === "enCurso"
          ? "bg-accent-suave text-accent-fuerte"
          : "bg-bg text-ink-suave ring-1 ring-inset ring-border";

  /* El conteo solo aparece cuando dice algo que la etiqueta no dice: en
     construcción no hay nada que contar, y en completado sería redundante. */
  const mostrarAvance =
    avance.total > 1 && estado !== "enConstruccion" && estado !== "completado";

  return (
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-medium uppercase tracking-wide text-ink-tenue">
        {ejeNombre}
      </span>
      <span className="block text-base font-semibold leading-snug text-ink">{nombre}</span>
      {/* La línea del tema, en lenguaje del estudiante. En "en construcción" se
          dice la verdad sobre por qué no abre, en vez de repetir una promesa
          que todavía no se puede cumplir. */}
      <span className="mt-0.5 block text-sm leading-snug text-ink-suave">
        {estado === "enConstruccion" ? COPY_EN_PREPARACION : objetivo}
      </span>
      {mostrarAvance && (
        <span className="mt-1 block text-xs text-ink-tenue">
          <span className="font-mono tabular-nums">{avance.hechas}</span> de{" "}
          <span className="font-mono tabular-nums">{avance.total}</span> lecciones
        </span>
      )}
      <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${claseChip}`}>
        {ETIQUETA[estado]}
      </span>
    </span>
  );
}

/**
 * Canaleta del punto: ancho fijo de 44px con el punto centrado.
 *
 * El punto va **fuera** de la tarjeta, no dentro. Adentro quedaba tapando el
 * trazo: la tarjeta es opaca y lo cubría por completo, así que los nodos se
 * veían sueltos aunque hubiera una recta dibujada detrás. Con el punto en su
 * propia columna, la recta corre por la canaleta y los une de verdad.
 *
 * El ancho es fijo (y no el del punto) para que el nodo de meta, que mide 56px,
 * desborde parejo a los dos lados y su centro caiga en la misma vertical que
 * todos los demás. Si la canaleta creciera con él, el trazo se doblaría.
 */
export function CanaletaPunto({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative z-10 flex w-11 shrink-0 justify-center">{children}</span>
  );
}

/**
 * Envoltorio de un nodo completo (canaleta + tarjeta) con su entrada escalonada.
 *
 * El retraso sale del índice **en el camino**, no del orden del DOM: en móvil la
 * lista se invierte con `flex-col-reverse`, así que calcularlo por posición en
 * pantalla haría que la secuencia bajara desde arriba en vez de subir desde el
 * origen. `retrasoDeEntrada` es la única fuente de ese número.
 */
export function FilaNodo({
  indice,
  children,
}: {
  indice: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="entra-nodo flex items-start gap-4"
      style={{ animationDelay: `${retrasoDeEntrada(indice)}ms` }}
    >
      {children}
    </div>
  );
}

/** La tarjeta del nodo, al lado de la canaleta. El punto es decorativo y el
 *  destino clickeable es esta tarjeta — mismo criterio que /camino en
 *  escritorio, donde el punto vive sobre la recta y la etiqueta es el enlace. */
export function TarjetaNodo({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  // min-h-11 cumple el área táctil mínima (MASTER.md §5).
  const clases =
    "flex min-h-11 min-w-0 flex-1 items-start gap-4 rounded-tarjeta bg-surface/90 p-3 text-left shadow-tarjeta backdrop-blur-[2px]";
  if (!href) {
    return (
      <div className={`${clases} cursor-default`} aria-disabled="true">
        {children}
      </div>
    );
  }
  /* Hover y tap suben la tarjeta un 4% con 120ms (`--dur-fast`, MASTER.md §2.6):
     el tiempo del micro-feedback, no el de una transición de estado. `active`
     además del `hover` para que el dedo reciba la misma respuesta que el mouse
     — en un teléfono no existe hover y sin eso el toque no confirma nada. */
  return (
    <Link
      href={href}
      className={`${clases} origin-left motion-safe:transition-[box-shadow,transform] motion-safe:duration-[120ms] motion-reduce:transition-none hover:shadow-tarjeta-hover hover:motion-safe:scale-[1.04] active:motion-safe:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {children}
    </Link>
  );
}

export function NodoTema({
  id,
  nombre,
  objetivo,
  estado,
  ejeNombre,
  avance,
  indice,
}: NodoTemaProps & { indice: number }) {
  const navegable = estado !== "enConstruccion";
  return (
    <FilaNodo indice={indice}>
      <CanaletaPunto>
        <PuntoNodo estado={estado} />
      </CanaletaPunto>
      <TarjetaNodo href={navegable ? `/tema/${id}` : undefined}>
        <EtiquetaNodo
          nombre={nombre}
          objetivo={objetivo}
          estado={estado}
          ejeNombre={ejeNombre}
          avance={avance}
        />
      </TarjetaNodo>
    </FilaNodo>
  );
}
