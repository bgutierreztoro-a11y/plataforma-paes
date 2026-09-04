import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { estiloDeLinea, type LineaId } from "./colores";

type Variante = "linea" | "neutro" | "secundario" | "deshabilitado" | "texto";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  /* Solo para `linea` y `texto`: instala el color del eje en el propio control.
     Si se omite, hereda el `--linea` que haya puesto la pantalla más arriba, que
     es el caso normal dentro de un eje. */
  linea?: LineaId;
  /* La caja se ajusta a su contenido en vez de ocupar el ancho completo. Ver la
     nota de `variantes()`. */
  anchoAuto?: boolean;
}

/**
 * El botón de la dirección "Línea": ancho completo, 14px de padding vertical,
 * radio de 2px y el texto en `titulo-s` centrado. Sin sombra y sin canto: la
 * jerarquía la da el color de la caja, no el volumen.
 *
 * - `linea`: la acción principal dentro de un eje. Toma el color de la línea.
 * - `neutro`: la acción principal fuera de un eje. Tinta sólida.
 * - `secundario`: alterna. Superficie de tarjeta y borde hairline.
 * - `deshabilitado`: superficie hundida y texto tenue.
 * - `texto`: sin caja, para salidas y acciones de baja jerarquía. No lleva el
 *   relleno de la caja: es texto en `--linea-nav` que se subraya al pasar por
 *   encima. `--linea-nav` y no `--linea` porque acá el color es texto sobre
 *   superficie clara, y la 02 (#FFB600) no pasa contraste ahí (cae a tinta).
 *
 * `deshabilitado` es una variante y además pone el atributo `disabled`: un botón
 * que se ve apagado y sigue respondiendo al clic es peor que cualquiera de las
 * dos cosas por separado.
 *
 * El fondo de `linea` sale de `--linea-fondo` y el texto de `--linea-contraste`,
 * ninguno de una clase fija: los dos son contraste medido. Sobre la línea 02
 * (#FFB600) el texto claro da 1,64:1 y va en tinta; el verde de la 03 (#00843D)
 * daba 4,48:1 con texto claro —dos centésimas bajo AA— y `--linea-fondo` lo
 * oscurece a #007034, que da 5,81:1. Ver el cálculo completo en ./colores.ts.
 *
 * `CLASES_CAJA` es lo que separa a las cuatro variantes con relleno de `texto`:
 * el bloque de ancho completo, el radio, el padding y el centrado. `texto` no
 * los toma —es un enlace de interfaz, no una caja— y por eso vive fuera de
 * `CLASES_BASE`.
 */
const CAJA = "rounded-sm px-4 py-3.5 text-center text-titulo-s";

/* `anchoAuto` existe para la fila de acciones del paso, donde el secundario es un
   ghost angosto y el primario se queda con el resto del ancho: un botón `w-full`
   dentro de un flex sin `flex-1` reclama el 100% del contenedor y no encoge. Al
   primario no le hace falta —`flex-1` fija la base en 0 y gana sobre `width`—,
   pero al ghost sí. `texto` no toma caja y no lo usa. */
function variantes(caja: string): Record<Variante, string> {
  return {
    linea: `${caja} bg-[var(--linea-fondo)] text-[var(--linea-contraste)]`,
    neutro: `${caja} bg-primary text-inverse`,
    secundario: `${caja} bg-card text-primary border border-hairline hover:border-strong`,
    deshabilitado: `${caja} bg-sunken text-muted cursor-not-allowed`,
    texto:
      "text-titulo-s text-[var(--linea-nav)] underline-offset-4 hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed",
  };
}

const CLASES_VARIANTE = variantes(`block w-full ${CAJA}`);
const CLASES_VARIANTE_AUTO = variantes(`inline-block w-auto ${CAJA}`);

const CLASES_BASE =
  "select-none motion-safe:transition-colors motion-safe:duration-[120ms] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong";

function clases(variante: Variante, anchoAuto: boolean, className: string) {
  const tabla = anchoAuto ? CLASES_VARIANTE_AUTO : CLASES_VARIANTE;
  return [CLASES_BASE, tabla[variante], className].filter(Boolean).join(" ");
}

export function Boton({
  variante = "neutro",
  linea,
  anchoAuto = false,
  className = "",
  style,
  disabled,
  ...props
}: BotonProps) {
  return (
    <button
      disabled={disabled ?? variante === "deshabilitado"}
      style={linea ? { ...estiloDeLinea(linea), ...style } : style}
      className={clases(variante, anchoAuto, className)}
      {...props}
    />
  );
}

interface EnlaceBotonProps {
  href: string;
  variante?: Variante;
  linea?: LineaId;
  className?: string;
  style?: CSSProperties;
  /* Opcional: dispara analítica antes de navegar. `Link` navega en cliente y no
     espera a este handler, así que no lo bloquea ni lo retrasa. */
  onClick?: () => void;
  children: ReactNode;
}

/**
 * Mismo estilo que `Boton`, pero como enlace de navegación: nunca un `<button>`
 * anidado en un `<a>`. Es el CTA de las tarjetas del camino.
 */
export function EnlaceBoton({
  href,
  variante = "neutro",
  linea,
  className = "",
  style,
  onClick,
  children,
}: EnlaceBotonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={linea ? { ...estiloDeLinea(linea), ...style } : style}
      className={clases(variante, false, className)}
    >
      {children}
    </Link>
  );
}
