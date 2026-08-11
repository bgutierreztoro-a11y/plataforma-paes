import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variante = "primario" | "secundario" | "texto";
type Tamano = "sm" | "md" | "lg";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  anchoCompleto?: boolean;
}

/**
 * Las tres jerarquías de acción de MASTER.md §3.1. La distancia entre ellas
 * tiene que leerse sin comparar: en una pantalla con dos botones, cuál es el
 * principal se responde de un vistazo o el diseño falló.
 *
 * - `primario`: relleno. Una sola acción principal por pantalla.
 * - `secundario`: superficie propia y borde neutro. Alterna, no compite.
 *   Lleva `bg-surface` y no `transparent` porque un botón transparente sobre
 *   una superficie con textura parece un hueco, no un control.
 * - `texto`: sin caja. Para salidas y acciones de baja jerarquía.
 *
 * El botón deshabilitado no es "el mismo botón, apagado": en `primario` el
 * fondo pierde el índigo por completo y queda una superficie inerte. Si
 * conservara el tono de acción, el ojo lo seguiría leyendo como el camino a
 * seguir y el estudiante insistiría en tocarlo.
 */
const CLASES_VARIANTE: Record<Variante, string> = {
  primario:
    "bg-accent text-white border-b-[3px] border-b-accent-fuerte hover:bg-accent-fuerte hover:border-b-accent-fuerte motion-safe:active:translate-y-[2px] motion-safe:active:border-b-[1px] disabled:bg-border disabled:text-ink-tenue disabled:border-b-border disabled:translate-y-0",
  secundario:
    "bg-surface text-accent border border-border-fuerte border-b-[3px] border-b-border-fuerte hover:bg-accent-suave hover:border-accent-borde motion-safe:active:translate-y-[2px] motion-safe:active:border-b disabled:text-ink-tenue disabled:border-border",
  texto:
    "bg-transparent text-accent underline-offset-4 hover:underline hover:text-accent-fuerte disabled:text-ink-tenue disabled:no-underline",
};

/**
 * El borde inferior grueso es lo que le da cuerpo al botón: en reposo se ve el
 * canto, al presionar el botón baja 2px y el canto se reduce a 1px, así que la
 * cara superior termina donde estaba la base. Es la misma distancia recorrida
 * que en un botón físico, y por eso se siente como uno.
 *
 * El padding vertical ya compensa ese canto, así que las tres alturas son las
 * de la escala y no la escala más 3px.
 *
 * Cuidado con `sm`: 36px de alto queda bajo los 44px de objetivo táctil que
 * exige MASTER.md §5. Sirve para acciones densas y secundarias en escritorio,
 * nunca para la acción principal de una pantalla en móvil.
 */
const CLASES_TAMANO: Record<Tamano, string> = {
  sm: "min-h-9 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-2.5 text-base",
  lg: "min-h-13 px-6 py-3 text-base",
};

/**
 * `motion-safe` apaga de una vez el color, el borde y el desplazamiento cuando
 * el sistema pide menos movimiento; el botón sigue cambiando de estado, solo
 * que sin recorrido.
 *
 * `min-w-11` no está por simetría con `min-h`: es lo que le da objetivo táctil
 * a un botón de una sola palabra corta.
 */
const CLASES_BASE =
  "inline-flex min-w-11 items-center justify-center gap-2 rounded-full font-medium select-none motion-safe:transition-[background-color,border-color,transform,box-shadow] motion-safe:duration-[120ms] motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed";

function clases(
  variante: Variante,
  tamano: Tamano,
  anchoCompleto: boolean,
  className: string,
) {
  return [
    CLASES_BASE,
    CLASES_TAMANO[tamano],
    CLASES_VARIANTE[variante],
    anchoCompleto ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Boton({
  variante = "primario",
  tamano = "md",
  anchoCompleto = false,
  className = "",
  ...props
}: BotonProps) {
  return (
    <button
      className={clases(variante, tamano, anchoCompleto, className)}
      {...props}
    />
  );
}

/** Mismo estilo que Boton, pero como enlace de navegación (nunca un <button> anidado en <a>). */
export function EnlaceBoton({
  href,
  variante = "primario",
  tamano = "md",
  anchoCompleto = false,
  className = "",
  children,
  onClick,
}: {
  href: string;
  variante?: Variante;
  tamano?: Tamano;
  anchoCompleto?: boolean;
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
      className={clases(variante, tamano, anchoCompleto, className)}
    >
      {children}
    </Link>
  );
}
