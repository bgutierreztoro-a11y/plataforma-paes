"use client";

import { useReducer, type ReactNode } from "react";
import { ItemPAES } from "@/components/ItemPAES";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { estadoInicialSetItems, reducerSetItems, type RespuestaRegistrada } from "@/lib/estadoSetItems";
import type { ItemCliente } from "@/lib/sanitizar";

interface EjecutorSetItemsProps {
  items: ItemCliente[];
  mostrarFeedback: boolean;
  renderFinal: (respuestas: RespuestaRegistrada[]) => ReactNode;
}

export function EjecutorSetItems({ items, mostrarFeedback, renderFinal }: EjecutorSetItemsProps) {
  const [estado, dispatch] = useReducer(reducerSetItems, estadoInicialSetItems);

  if (estado.indiceActual >= items.length) {
    return <>{renderFinal(estado.respuestas)}</>;
  }

  const item = items[estado.indiceActual];
  const esUltimo = estado.indiceActual === items.length - 1;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
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
        etiquetaSiguiente={esUltimo ? "Ver resultado" : "Siguiente pregunta"}
        onSiguiente={(correcta, tiempoMs) => {
          dispatch({ type: "REGISTRAR", itemId: item.id, correcta, tiempoMs });
          dispatch({ type: "SIGUIENTE" });
        }}
      />
    </div>
  );
}
