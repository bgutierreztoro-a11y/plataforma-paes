import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import type { TarjetaDeError } from "@/lib/advance/pantallaErrores";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * Un error del estudiante en la pantalla /advance/errores (§6.3): la fase en
 * palabras (D8), la descripción del catálogo (nunca el id) y, si volvió a
 * aparecer, la marca de recaída como texto y no solo como color (D11).
 *
 * Se llama TarjetaEstadoError y no TarjetaError porque ese nombre ya lo tiene
 * `components/ui/linea/TarjetaError.tsx`, la superficie oscura que muestra un
 * error recién cometido. Esta es lo contrario: una tarjeta clara de la
 * dirección Línea, porque acá hay una lista y una única superficie oscura por
 * pantalla es la regla de aquella.
 *
 * Nada tocable adentro, así que no aplica el mínimo táctil de 44 px, y sin
 * transiciones: `prefers-reduced-motion` se cumple por ausencia.
 *
 * La etiqueta de fase va en `--linea-nav`, el rol "texto sobre superficie
 * clara" que ya está medido sobre `bg-card` (colores.ts); la 02 cae a tinta
 * por ese mismo mapa.
 */
export function TarjetaEstadoError({ tarjeta }: { tarjeta: TarjetaDeError }) {
  const { errores } = TEXTOS_ADVANCE;
  return (
    <li
      className={`${TARJETA_LINEA} p-4`}
      data-fase={tarjeta.fase}
      data-error-id={tarjeta.errorId}
      data-recaida={tarjeta.recaida ? "" : undefined}
    >
      <p className="text-etiqueta uppercase text-[var(--linea-nav)]">{errores.fase[tarjeta.fase]}</p>
      <p className="mt-2 text-cuerpo-m text-primary">{tarjeta.descripcion}</p>
      {tarjeta.recaida && <p className="mt-1.5 text-cuerpo-s text-primary">{errores.recaida}</p>}
    </li>
  );
}
