"use client";

import { useReducer, type ReactNode } from "react";
import { ItemPAES } from "@/components/ItemPAES";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { CascaronAnclado } from "@/components/ui/ZonaAnclada";
import { estadoInicialSetItems, reducerSetItems, type RespuestaRegistrada } from "@/lib/estadoSetItems";
import type { RespuestaLocal } from "@/lib/progresoLocal";
import type { ItemCliente } from "@/lib/sanitizar";

interface EjecutorSetItemsProps {
  items: ItemCliente[];
  mostrarFeedback: boolean;
  /* Requeridas y sin default: los tres llamadores (diagnóstico, cierre y la
     fase de ítems PAES de una lección) son contextos distintos y confundirlos
     rompería en silencio la comparación pre/post del MOS §6. */
  contexto: RespuestaLocal["contexto"];
  contextoId: string;
  renderFinal: (respuestas: RespuestaRegistrada[]) => ReactNode;
  /* Ancla el CTA y el feedback al fondo del viewport (Fase 5). Opt-in y no por
     defecto: el cascarón ocupa `100dvh` y asume el modo foco de /leccion/[id],
     donde no hay barra de navegación inferior. /diagnostico y /cierre sí la
     montan —y encima anteponen su banner de demostración—, así que ahí el
     cascarón dejaba la zona anclada 37px por debajo del borde del viewport,
     medido. Esas dos rutas se quedan con el layout de siempre hasta que
     alguien las mida y las migre a propósito. */
  anclarAcciones?: boolean;
  /* Va dentro de la región que scrollea, no encima del cascarón: cualquier
     cosa apilada por fuera le suma alto a los 100dvh y rompe el anclaje. */
  encabezado?: ReactNode;
}

export function EjecutorSetItems({
  items,
  mostrarFeedback,
  contexto,
  contextoId,
  renderFinal,
  anclarAcciones = false,
  encabezado,
}: EjecutorSetItemsProps) {
  const [estado, dispatch] = useReducer(reducerSetItems, estadoInicialSetItems);

  if (estado.indiceActual >= items.length) {
    return <>{renderFinal(estado.respuestas)}</>;
  }

  const item = items[estado.indiceActual];
  const esUltimo = estado.indiceActual === items.length - 1;

  const contenido = (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      {encabezado}
      <div className="mb-8">
        <BarraProgreso
          pasoActual={estado.indiceActual}
          total={items.length}
          sustantivo="Pregunta"
        />
      </div>
      <ItemPAES
        key={item.id}
        item={item}
        mostrarFeedback={mostrarFeedback}
        contexto={contexto}
        contextoId={contextoId}
        etiquetaSiguiente={esUltimo ? "Ver resultado" : "Siguiente pregunta"}
        onSiguiente={(correcta, tiempoMs) => {
          dispatch({ type: "REGISTRAR", itemId: item.id, correcta, tiempoMs });
          dispatch({ type: "SIGUIENTE" });
        }}
      />
    </div>
  );

  if (!anclarAcciones) return contenido;

  /* Un ítem por pantalla: `EjecutorSetItems` monta uno solo a la vez, así que
     nunca hay dos veredictos compitiendo y siempre puede anclar. Las acciones
     las aporta el propio ItemPAES —"Revisar respuesta" antes de comprobar, el
     pie después—, por eso `acciones` va vacío acá: son estados distintos del
     mismo control y decidirlos afuera obligaría a levantar `revelado`. */
  return (
    <CascaronAnclado acciones={null} anclarFeedback modoFoco>
      {contenido}
    </CascaronAnclado>
  );
}
