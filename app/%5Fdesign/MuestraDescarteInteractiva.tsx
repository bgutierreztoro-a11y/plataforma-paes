"use client";

import { EjecutorDescarte } from "@/components/advance/EjecutorDescarte";
import { ResultadoDescarte } from "@/components/advance/ResultadoDescarte";
import { CATALOGO_MUESTRA, MUESTRA_DESCARTE } from "./muestraDescarte";

/**
 * El ejecutor con la muestra, para el clic real en la galería. Sin callbacks a
 * propósito: acá no se emite ningún evento, ni en desarrollo ni en producción.
 * Al cerrar, `ResultadoDescarte` con el catálogo de muestra y sin ruta de
 * "Otra sesión", que solo existe en la ruta real.
 */
export function MuestraDescarteInteractiva() {
  return (
    <EjecutorDescarte
      items={MUESTRA_DESCARTE}
      unidadId="muestra"
      renderFinal={(registros) => (
        <ResultadoDescarte registros={registros} catalogo={CATALOGO_MUESTRA} />
      )}
    />
  );
}
