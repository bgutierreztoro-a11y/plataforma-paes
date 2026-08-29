import type { ButtonHTMLAttributes } from "react";
import { estiloDeLinea, type LineaId } from "./colores";

type Variante = "linea" | "neutro" | "secundario" | "deshabilitado";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  /* Solo para `linea`: instala el color del eje en el propio botón. Si se
     omite, hereda el `--linea` que haya puesto la pantalla más arriba, que es
     el caso normal dentro de un eje. */
  linea?: LineaId;
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
 *
 * `deshabilitado` es una variante y además pone el atributo `disabled`: un botón
 * que se ve apagado y sigue respondiendo al clic es peor que cualquiera de las
 * dos cosas por separado.
 *
 * El texto sobre el color de línea sale de `--linea-contraste` y no de una clase
 * fija. Sobre la línea 02 (#FFB600) el texto claro da 1.6:1 y es ilegible; ver
 * el cálculo completo en ./colores.ts.
 */
const CLASES_VARIANTE: Record<Variante, string> = {
  linea: "bg-[var(--linea)] text-[var(--linea-contraste)]",
  neutro: "bg-primary text-inverse",
  secundario: "bg-card text-primary border border-hairline hover:border-strong",
  deshabilitado: "bg-sunken text-muted cursor-not-allowed",
};

const CLASES_BASE =
  "block w-full rounded-sm px-4 py-3.5 text-center text-titulo-s select-none motion-safe:transition-colors motion-safe:duration-[120ms] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong";

export function Boton({
  variante = "neutro",
  linea,
  className = "",
  style,
  disabled,
  ...props
}: BotonProps) {
  return (
    <button
      disabled={disabled ?? variante === "deshabilitado"}
      style={linea ? { ...estiloDeLinea(linea), ...style } : style}
      className={[CLASES_BASE, CLASES_VARIANTE[variante], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
