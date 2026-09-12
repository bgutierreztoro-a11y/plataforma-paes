"use client";

import { useState } from "react";
import { EjecutorDescarte } from "@/components/advance/EjecutorDescarte";
import { ResultadoDescarte } from "@/components/advance/ResultadoDescarte";
import { cuerpoSesionDescarte, type CuerpoSesionDescarte, type ItemAdvance } from "@/lib/advance/descarte";
import { registrarEvento } from "@/lib/eventos";

interface SesionDescarteProps {
  items: ItemAdvance[];
  unidadId: string;
  /* Nombre técnico DEMRE de la unidad, lo único que ve el estudiante. */
  titulo: string;
  /* Id local del catálogo → descripción, resuelto en el servidor. */
  catalogo: Record<string, string>;
  /* La ruta de esta misma sesión, para "Otra sesión". */
  ruta: string;
}

/**
 * Envío de la sesión terminada a POST /api/advance/sesion (F3). Sin esperar,
 * sin estado, sin nada en pantalla: si la red falla o el servidor responde
 * distinto de 204, el estudiante no se entera y la pantalla final se muestra
 * igual. `keepalive` deja que la petición sobreviva si toca "Otra sesión" al
 * instante, que es una navegación completa; el cuerpo pesa alrededor de 1 KB.
 */
function enviarSesion(cuerpo: CuerpoSesionDescarte): void {
  void fetch("/api/advance/sesion", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
    keepalive: true,
  }).catch(() => {});
}

/**
 * La isla de cliente de /advance/descarte/[unidadId]: monta el ejecutor con
 * los ítems ya seleccionados en el servidor y cierra con `ResultadoDescarte`.
 * Existe porque `renderFinal` es una función y no puede cruzar la frontera
 * servidor → cliente como prop.
 *
 * También es el único lugar que cablea el ejecutor a `registrarEvento`
 * (docs/fobos-advance.md §8) y a la persistencia (registro F3): el ejecutor
 * solo entrega payloads y registros, y la galería lo monta sin callbacks, así
 * que /_design nunca emite analítica ni escribe en la base.
 *
 * `sesionId` nace en el inicializador de estado y no en el cuerpo del
 * componente: si se regenerara en cada render, un reenvío no chocaría con el
 * UNIQUE de la tabla y duplicaría filas. Se calcula en el servidor y otra vez al
 * hidratar, con valores distintos, pero nunca se renderiza, así que no hay
 * desajuste; el que vale es el del cliente. `randomUUID` solo existe en
 * contexto seguro (https o localhost): si falta, la sesión no se envía y la UI
 * sigue igual.
 */
export function SesionDescarte({ items, unidadId, titulo, catalogo, ruta }: SesionDescarteProps) {
  const [sesionId] = useState<string | null>(() => globalThis.crypto?.randomUUID?.() ?? null);

  return (
    <EjecutorDescarte
      items={items}
      unidadId={unidadId}
      titulo={titulo}
      alIniciar={(props) => registrarEvento({ nombre: "advance_descarte_inicio", props })}
      alDescartar={(props) => registrarEvento({ nombre: "advance_descarte_alternativa", props })}
      alFatal={(props) => registrarEvento({ nombre: "advance_descarte_fatal", props })}
      alTerminar={(props) => registrarEvento({ nombre: "advance_descarte_fin", props })}
      alCerrarSesion={
        sesionId
          ? (registros) => enviarSesion(cuerpoSesionDescarte(sesionId, unidadId, registros))
          : undefined
      }
      renderFinal={(registros) => (
        <ResultadoDescarte registros={registros} catalogo={catalogo} rutaOtraSesion={ruta} />
      )}
    />
  );
}
