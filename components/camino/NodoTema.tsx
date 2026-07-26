"use client";

import Link from "next/link";
import { IconoCorrecto } from "@/components/ui/Icono";
import type { EstadoNodo } from "@/lib/estadoNodo";

/** Copy reutilizado de la grilla que este camino reemplaza: ya estaba escrito y
 *  ya era honesto sobre por qué una lección todavía no abre. */
export const COPY_EN_PREPARACION =
  "En preparación. Se abre después de la revisión matemática y de originalidad.";

const ETIQUETA: Record<EstadoNodo, string> = {
  completado: "Completado",
  porRepasar: "Por repasar",
  disponible: "Empezar",
  enConstruccion: "En preparación",
};

/**
 * El punto sobre la recta. Los cuatro estados se distinguen por forma **y**
 * color, nunca por color solo (MASTER.md §2.1), y cada uno lleva texto: un nodo
 * que solo cambia de tono no comunica nada a quien no distingue esos tonos.
 *
 * El bloqueado NO lleva candado. Un candado promete que existe algo detrás y
 * que se puede abrir cumpliendo un requisito; acá el contenido todavía no está
 * escrito, así que el candado mentiría. Contorno punteado = "en obra".
 */
function Punto({ estado }: { estado: EstadoNodo }) {
  const base =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors";
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
    case "disponible":
      return (
        <span className={`${base} relative bg-accent text-white ring-2 ring-accent ring-offset-2 ring-offset-bg`}>
          {/* El pulso es decorativo: se apaga con prefers-reduced-motion y el
              estado sigue legible por el anillo y por la etiqueta. */}
          <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping motion-reduce:hidden" />
          <span className="relative h-3 w-3 rounded-full bg-white" />
        </span>
      );
    case "enConstruccion":
      return (
        <span className={`${base} border-2 border-dashed border-border-fuerte bg-bg`} />
      );
  }
}

export interface NodoTemaProps {
  id: string;
  nombre: string;
  objetivo: string;
  estado: EstadoNodo;
  /** Índice dentro del eje al que pertenece, para el rótulo del eje. */
  ejeNombre: string;
}

export function NodoTema({ id, nombre, objetivo, estado, ejeNombre }: NodoTemaProps) {
  const navegable = estado !== "enConstruccion";

  const contenido = (
    <>
      <Punto estado={estado} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wide text-ink-tenue">
          {ejeNombre}
        </span>
        <span className="block text-base font-semibold leading-snug text-ink">{nombre}</span>
        {/* La línea del tema, en lenguaje del estudiante. En "en construcción"
            se dice la verdad sobre por qué no abre, en vez de repetir una
            promesa que todavía no se puede cumplir. */}
        <span className="mt-0.5 block text-sm leading-snug text-ink-suave">
          {estado === "enConstruccion" ? COPY_EN_PREPARACION : objetivo}
        </span>
        <span
          className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            estado === "completado"
              ? "bg-success-suave text-success"
              : estado === "porRepasar"
                ? "bg-attention-suave text-attention-fuerte"
                : estado === "disponible"
                  ? "bg-accent-suave text-accent-fuerte"
                  : "bg-bg text-ink-suave ring-1 ring-inset ring-border"
          }`}
        >
          {ETIQUETA[estado]}
        </span>
      </span>
    </>
  );

  // min-h-11 y el punto de 44px cumplen el área táctil mínima (MASTER.md §5).
  const clases =
    "flex min-h-11 w-full items-start gap-4 rounded-tarjeta bg-surface/90 p-3 text-left shadow-tarjeta backdrop-blur-[2px]";

  if (!navegable) {
    return (
      <div className={`${clases} cursor-default`} aria-disabled="true">
        {contenido}
      </div>
    );
  }

  return (
    <Link
      href={`/tema/${id}`}
      className={`${clases} motion-safe:transition-shadow hover:shadow-tarjeta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {contenido}
    </Link>
  );
}
