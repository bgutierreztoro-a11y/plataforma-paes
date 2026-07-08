import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variante = "primario" | "secundario";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const CLASES_VARIANTE: Record<Variante, string> = {
  primario:
    "bg-accent text-white hover:bg-accent-fuerte disabled:bg-border disabled:text-ink-suave",
  secundario:
    "bg-transparent text-accent border border-accent hover:bg-accent-suave disabled:border-border disabled:text-ink-suave",
};

const CLASES_BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-tarjeta px-5 py-2.5 text-base font-medium motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed";

export function Boton({ variante = "primario", className = "", ...props }: BotonProps) {
  return (
    <button className={`${CLASES_BASE} ${CLASES_VARIANTE[variante]} ${className}`} {...props} />
  );
}

/** Mismo estilo que Boton, pero como enlace de navegación (nunca un <button> anidado en <a>). */
export function EnlaceBoton({
  href,
  variante = "primario",
  className = "",
  children,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${CLASES_BASE} ${CLASES_VARIANTE[variante]} ${className}`}>
      {children}
    </Link>
  );
}
