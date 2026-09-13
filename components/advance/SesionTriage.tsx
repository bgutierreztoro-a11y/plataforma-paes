"use client";

import { useState } from "react";
import { EjecutorTriage } from "@/components/advance/EjecutorTriage";
import { ResultadoTriage } from "@/components/advance/ResultadoTriage";
import type { CopyDeError } from "@/lib/advance/copyDeError";
import type { ItemAdvance } from "@/lib/advance/descarte";
import { cuerpoSesionTriage, type CuerpoSesionTriage, type FasesPorError } from "@/lib/advance/triage";
import { registrarEvento } from "@/lib/eventos";

interface SesionTriageProps {
  items: ItemAdvance[];
  unidadId: string;
  /* Nombre técnico DEMRE de la unidad, lo único que ve el estudiante. */
  titulo: string;
  /* Fase de cada error del catálogo al abrir la sesión, calculada en el
     servidor desde advance_descartes y proyectada sin p(L) (D10). */
  fases: FasesPorError;
  /* Id local del catálogo → titulo + apoyo, resuelto en el servidor. */
  catalogo: Record<string, CopyDeError>;
  /* La ruta de esta misma sesión, para "Otra sesión". */
  ruta: string;
}

/**
 * Envío de la sesión terminada a POST /api/advance/triage. Sin esperar, sin
 * estado, sin nada en pantalla: si la red falla o el servidor responde
 * distinto de 204, el estudiante no se entera y la pantalla final se muestra
 * igual. `keepalive` deja que la petición sobreviva a "Otra sesión". Mismo
 * patrón que `SesionDescarte`.
 */
function enviarSesion(cuerpo: CuerpoSesionTriage): void {
  void fetch("/api/advance/triage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
    keepalive: true,
  }).catch(() => {});
}

/**
 * La isla de cliente de /advance/triage/[unidadId]: monta el ejecutor con los
 * ítems ya seleccionados en el servidor y cierra con `ResultadoTriage`.
 * Existe por lo mismo que `SesionDescarte`: `renderFinal` es una función y no
 * cruza la frontera servidor → cliente.
 *
 * Es el único lugar que cablea el ejecutor a `registrarEvento` (§8) y a la
 * persistencia (D15); la galería lo monta sin callbacks y no emite nada.
 *
 * `sesionId` nace en el inicializador de estado y no en el cuerpo del
 * componente: si se regenerara en cada render, un reenvío no chocaría con el
 * UNIQUE de la tabla y duplicaría filas. `randomUUID` solo existe en contexto
 * seguro; si falta, la sesión no se envía y la UI sigue igual.
 */
export function SesionTriage({ items, unidadId, titulo, fases, catalogo, ruta }: SesionTriageProps) {
  const [sesionId] = useState<string | null>(() => globalThis.crypto?.randomUUID?.() ?? null);

  return (
    <EjecutorTriage
      items={items}
      titulo={titulo}
      alDecidir={(props) => registrarEvento({ nombre: "advance_triage_decision", props })}
      alCerrarSesion={
        sesionId ? (registros) => enviarSesion(cuerpoSesionTriage(sesionId, unidadId, registros)) : undefined
      }
      renderFinal={(registros) => (
        <ResultadoTriage
          registros={registros}
          items={items}
          fases={fases}
          catalogo={catalogo}
          unidadId={unidadId}
          rutaOtraSesion={ruta}
        />
      )}
    />
  );
}
