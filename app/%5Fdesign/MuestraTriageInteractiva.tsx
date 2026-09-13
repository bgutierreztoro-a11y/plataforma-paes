"use client";

import { EjecutorTriage } from "@/components/advance/EjecutorTriage";
import { ResultadoTriage } from "@/components/advance/ResultadoTriage";
import { COPY_MUESTRA, FASES_MUESTRA, MUESTRA_DESCARTE } from "./muestraDescarte";

/**
 * El ejecutor del triage con la muestra, para el clic real en la galería. Sin
 * callbacks a propósito: acá no se emite ningún evento ni se escribe nada. El
 * reloj corre de verdad: sin tocar, cada ítem cierra a los 20 s como
 * `sin-decision`. Al cerrar, `ResultadoTriage` con las fases y el catálogo de
 * muestra y sin ruta de "Otra sesión", que solo existe en la ruta real.
 */
export function MuestraTriageInteractiva() {
  return (
    <EjecutorTriage
      items={MUESTRA_DESCARTE}
      renderFinal={(registros) => (
        <ResultadoTriage
          registros={registros}
          items={MUESTRA_DESCARTE}
          fases={FASES_MUESTRA}
          catalogo={COPY_MUESTRA}
          unidadId="muestra"
        />
      )}
    />
  );
}
