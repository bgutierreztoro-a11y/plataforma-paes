"use client";

import { EjecutorDescarte } from "@/components/advance/EjecutorDescarte";
import { ResultadoDescarte } from "@/components/advance/ResultadoDescarte";
import type { ItemAdvance } from "@/lib/advance/descarte";

interface SesionDescarteProps {
  items: ItemAdvance[];
  unidadId: string;
  /* Id local del catálogo → descripción, resuelto en el servidor. */
  catalogo: Record<string, string>;
  /* La ruta de esta misma sesión, para "Otra sesión". */
  ruta: string;
}

/**
 * La isla de cliente de /advance/descarte/[unidadId]: monta el ejecutor con
 * los ítems ya seleccionados en el servidor y cierra con `ResultadoDescarte`.
 * Existe porque `renderFinal` es una función y no puede cruzar la frontera
 * servidor → cliente como prop.
 */
export function SesionDescarte({ items, unidadId, catalogo, ruta }: SesionDescarteProps) {
  return (
    <EjecutorDescarte
      items={items}
      unidadId={unidadId}
      renderFinal={(registros) => (
        <ResultadoDescarte registros={registros} catalogo={catalogo} rutaOtraSesion={ruta} />
      )}
    />
  );
}
