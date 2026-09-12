import Link from "next/link";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import type { TarjetaDeError } from "@/lib/advance/pantallaErrores";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * Un error del estudiante en la pantalla /advance/errores (§6.3): la fase en
 * palabras (D8), el título del catálogo (nunca la ficha de autor) y, si volvió
 * a aparecer, la marca de recaída como texto y no solo como color (D11).
 *
 * Se llama TarjetaEstadoError y no TarjetaError porque ese nombre ya lo tiene
 * `components/ui/linea/TarjetaError.tsx`, la superficie oscura que muestra un
 * error recién cometido. Esta es lo contrario: una tarjeta clara de la
 * dirección Línea, porque acá hay una lista y una única superficie oscura por
 * pantalla es la regla de aquella.
 *
 * **Tocable desde F4b**: la tarjeta entera es un `<Link>` hacia
 * `/advance/errores/<unidadId>/<errorId>`, la pantalla de repaso de ese error.
 * El padding vive en el `<Link>` y no en el `<li>` para que el área táctil sea
 * la tarjeta completa (mismo criterio que `TramoAdvance.tsx`), con
 * `min-h-11` para el mínimo de 44px aunque el contenido sea corto. Sin
 * chevron ni icono: la fila entera afordando es suficiente, y en escritorio el
 * borde sube a `border-strong` al pasar el cursor (mismo recurso que
 * `Boton secundario`). Sin transiciones: `prefers-reduced-motion` se cumple
 * por ausencia, no por guard.
 *
 * La etiqueta de fase va en `--linea-nav`, el rol "texto sobre superficie
 * clara" que ya está medido sobre `bg-card` (colores.ts); la 02 cae a tinta
 * por ese mismo mapa.
 */
export function TarjetaEstadoError({ tarjeta }: { tarjeta: TarjetaDeError }) {
  const { errores } = TEXTOS_ADVANCE;
  return (
    <li
      className={`${TARJETA_LINEA} hover:border-strong`}
      data-fase={tarjeta.fase}
      data-error-id={tarjeta.errorId}
      data-recaida={tarjeta.recaida ? "" : undefined}
    >
      <Link
        href={`/advance/errores/${tarjeta.unidadId}/${tarjeta.errorId}`}
        className="block min-h-11 rounded-sm p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
      >
        <p className="text-etiqueta uppercase text-[var(--linea-nav)]">{errores.fase[tarjeta.fase]}</p>
        <p className="mt-2 text-cuerpo-m text-primary">{tarjeta.titulo}</p>
        {tarjeta.apoyo && <p className="mt-1 text-cuerpo-s text-primary">{tarjeta.apoyo}</p>}
        {tarjeta.recaida && <p className="mt-1.5 text-cuerpo-s text-primary">{errores.recaida}</p>}
      </Link>
    </li>
  );
}
