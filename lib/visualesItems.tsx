import type { ReactNode } from "react";
import { PlanoItem } from "@/components/grafico/PlanoItem";

/* Apoyo visual por ítem (capa de UI, no de contenido): plano cartesiano para
   ítems cuyo enunciado entrega puntos concretos. Solo se agrega donde el
   gráfico AYUDA a razonar sin regalar la respuesta pedida — nunca en ítems
   donde ver el gráfico ES la respuesta (ej. "¿qué relación tienen estas
   rectas?"). Los puntos deben ser EXACTAMENTE los del enunciado. */

const VISUALES: Record<string, ReactNode> = {
  /* "Una recta pasa por los puntos (1, 2) y (3, 8)" — pide la pendiente */
  "diag-5": (
    <PlanoItem
      puntos={[
        [1, 2],
        [3, 8],
      ]}
    />
  ),
  /* "Una recta pasa por los puntos (2, 3) y (5, 12)" — pide la pendiente */
  "cierre-5": (
    <PlanoItem
      puntos={[
        [2, 3],
        [5, 12],
      ]}
    />
  ),
};

export function visualDeItem(itemId: string): ReactNode | null {
  return VISUALES[itemId] ?? null;
}
