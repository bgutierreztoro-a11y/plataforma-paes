import type { ReactNode } from "react";
import Link from "next/link";

interface TarjetaProps {
  /* Área visual superior con alto reservado (evita layout shift). */
  ilustracion?: ReactNode;
  titulo: string;
  /* 1–2 líneas máximo; copy de UI, no contenido pedagógico. */
  descripcion?: string;
  /* Metadato corto, ej. "22 min aprox." — se muestra en mono. */
  meta?: string;
  /* Muestra la cinta DEMOSTRACIÓN (contenido no publicable). */
  esDemostracion?: boolean;
  /* Si existe, toda la tarjeta es un enlace con hover/focus propios. */
  href?: string;
  /* Contenido extra bajo la descripción (ej. un CTA). */
  children?: ReactNode;
}

const CLASES_BASE =
  "flex h-full flex-col overflow-hidden rounded-tarjeta border border-border bg-surface shadow-tarjeta";

const CLASES_ENLACE =
  "motion-safe:transition-[border-color,box-shadow] motion-reduce:transition-none hover:border-border-fuerte hover:shadow-tarjeta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function CuerpoTarjeta({
  ilustracion,
  titulo,
  descripcion,
  meta,
  esDemostracion,
  children,
}: Omit<TarjetaProps, "href">) {
  return (
    <>
      {ilustracion && (
        <div className="border-b border-border bg-bg px-6 py-4">{ilustracion}</div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        {descripcion && (
          <p className="text-sm leading-relaxed text-ink-suave">{descripcion}</p>
        )}
        {(meta || esDemostracion) && (
          <div className="mt-auto flex items-center gap-3 pt-3">
            {meta && (
              <span className="font-mono text-xs tabular-nums text-ink-suave">{meta}</span>
            )}
            {esDemostracion && (
              <span className="rounded-lg bg-accent-suave px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-widest text-accent-fuerte">
                Demostración
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </>
  );
}

/** Tarjeta base del sitio: toda tarjeta (lecciones, resultados, avisos)
 *  sale de este componente para mantener un solo lenguaje visual. */
export function Tarjeta({ href, ...props }: TarjetaProps) {
  if (href) {
    return (
      <Link href={href} className={`${CLASES_BASE} ${CLASES_ENLACE}`}>
        <CuerpoTarjeta {...props} />
      </Link>
    );
  }
  return (
    <div className={CLASES_BASE}>
      <CuerpoTarjeta {...props} />
    </div>
  );
}
