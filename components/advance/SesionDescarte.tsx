"use client";

import { EjecutorDescarte } from "@/components/advance/EjecutorDescarte";
import { ResultadoDescarte } from "@/components/advance/ResultadoDescarte";
import type { ItemAdvance } from "@/lib/advance/descarte";
import { registrarEvento } from "@/lib/eventos";

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
 *
 * También es el único lugar que cablea el ejecutor a `registrarEvento`
 * (docs/fobos-advance.md §8): el ejecutor solo entrega payloads, y la galería
 * lo monta sin callbacks, así que /_design nunca emite analítica.
 */
export function SesionDescarte({ items, unidadId, catalogo, ruta }: SesionDescarteProps) {
  return (
    <EjecutorDescarte
      items={items}
      unidadId={unidadId}
      alIniciar={(props) => registrarEvento({ nombre: "advance_descarte_inicio", props })}
      alDescartar={(props) => registrarEvento({ nombre: "advance_descarte_alternativa", props })}
      alFatal={(props) => registrarEvento({ nombre: "advance_descarte_fatal", props })}
      alTerminar={(props) => registrarEvento({ nombre: "advance_descarte_fin", props })}
      renderFinal={(registros) => (
        <ResultadoDescarte registros={registros} catalogo={catalogo} rutaOtraSesion={ruta} />
      )}
    />
  );
}
