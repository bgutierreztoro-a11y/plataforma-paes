"use client";

import { useReducer, type ReactNode } from "react";
import { ItemPAES } from "@/components/ItemPAES";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { estadoInicialSetItems, reducerSetItems, type RespuestaRegistrada } from "@/lib/estadoSetItems";
import type { Item } from "@/lib/tipos";

interface EjecutorSetItemsProps {
  items: Item[];
  mostrarFeedback: boolean;
  renderFinal: (respuestas: RespuestaRegistrada[]) => ReactNode;
}

export function EjecutorSetItems({ items, mostrarFeedback, renderFinal }: EjecutorSetItemsProps) {
  const [estado, dispatch] = useReducer(reducerSetItems, estadoInicialSetItems);

  if (estado.indiceActual >= items.length) {
    return <>{renderFinal(estado.respuestas)}</>;
  }

  const item = items[estado.indiceActual];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <BarraProgreso pasoActual={estado.indiceActual} total={items.length} />
      </div>
      <ItemPAES
        key={item.id}
        item={item}
        mostrarFeedback={mostrarFeedback}
        onSiguiente={(correcta) => {
          dispatch({ type: "REGISTRAR", itemId: item.id, correcta });
          dispatch({ type: "SIGUIENTE" });
        }}
      />
    </div>
  );
}
