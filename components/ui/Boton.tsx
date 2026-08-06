import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variante = "primario" | "secundario" | "terciario";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

/**
 * Las tres jerarquías de acción de MASTER.md §3.1. La distancia entre ellas
 * tiene que leerse sin comparar: en una pantalla con dos botones, cuál es el
 * principal se responde de un vistazo o el diseño falló.
 *
 * - `primario`: relleno, elevado. Una sola acción principal por pantalla.
 * - `secundario`: superficie propia y borde neutro. Alterna, no compite.
 *   Lleva `bg-surface` y no `transparent` porque muchas pantallas van sobre el
 *   papel milimetrado, y un botón transparente dejaba ver la cuadrícula por
 *   debajo: parecía un hueco, no un control.
 * - `terciario`: solo texto. Para salidas y acciones de baja jerarquía que hoy
 *   están escritas a mano como enlaces subrayados en tres archivos distintos.
 */
const CLASES_VARIANTE: Record<Variante, string> = {
  primario:
    "bg-accent text-white shadow-nivel-1 hover:bg-accent-fuerte hover:shadow-tarjeta motion-safe:hover:-translate-y-px active:translate-y-0 active:shadow-nivel-1 disabled:bg-border disabled:text-ink-suave disabled:shadow-none disabled:translate-y-0",
  secundario:
    "border border-border-fuerte bg-surface text-accent shadow-nivel-1 hover:border-accent hover:bg-accent-suave motion-safe:hover:-translate-y-px active:translate-y-0 active:shadow-none disabled:border-border disabled:bg-surface disabled:text-ink-suave disabled:shadow-none disabled:translate-y-0",
  terciario:
    "bg-transparent text-ink-suave hover:bg-accent-suave hover:text-accent-fuerte disabled:text-ink-tenue",
};

/**
 * El "lift": en reposo el botón apoya, al pasar el cursor sube 1px y su sombra
 * se abre, al presionar vuelve a bajar (MASTER.md §2.5 y §3.1). Es la
 * microinteracción que separa un control de un rectángulo de color, y el único
 * movimiento del sistema que no explica un cambio de estado sino que confirma
 * que algo es tocable — por eso dura 150ms y no se ve si no se busca.
 *
 * La transición nombra sus propiedades en vez de usar `transition-colors`
 * porque ahora también viajan la sombra y el desplazamiento. `motion-safe`
 * apaga las tres de una vez cuando el sistema pide menos movimiento; el
 * `-translate-y-px` va con ese prefijo para que el botón no se mueva nunca en
 * ese modo, aunque sí siga cambiando de color.
 */
const CLASES_BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-tarjeta px-5 py-2.5 text-base font-semibold motion-safe:transition-[background-color,border-color,box-shadow,transform] motion-safe:duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed";

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
  onClick,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: React.ReactNode;
  /* Opcional: dispara analítica antes de navegar (ver `NodoCamino.onAbrir`).
   *  `Link` navega en cliente y no espera a este handler, así que no retrasa
   *  ni puede bloquear la navegación. */
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${CLASES_BASE} ${CLASES_VARIANTE[variante]} ${className}`}
    >
      {children}
    </Link>
  );
}
