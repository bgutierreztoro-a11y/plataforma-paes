"use client";

import { EjecutorDescarte } from "@/components/advance/EjecutorDescarte";
import { MUESTRA_DESCARTE } from "./muestraDescarte";

/**
 * El ejecutor con la muestra, para el clic real en la galería. Sin callbacks a
 * propósito: acá no se emite ningún evento, ni en desarrollo ni en producción.
 * El cierre de sesión muestra el registro crudo hasta que exista
 * `ResultadoDescarte` (A3), que lo reemplaza.
 */
export function MuestraDescarteInteractiva() {
  return (
    <EjecutorDescarte
      items={MUESTRA_DESCARTE}
      unidadId="muestra"
      renderFinal={(registros) => (
        <pre
          data-registro-final
          className="overflow-x-auto rounded-sm border border-hairline bg-card p-4 text-cuerpo-xs text-primary"
        >
          {JSON.stringify(registros, null, 2)}
        </pre>
      )}
    />
  );
}
