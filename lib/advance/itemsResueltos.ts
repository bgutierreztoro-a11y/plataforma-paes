import type { FilaAdvanceDescarte } from "../datos/advanceDescartes.ts";
import type { ItemAdvance } from "./descarte.ts";
import type { DistractorResuelto, ItemResuelto } from "./dominio.ts";

/**
 * Cruce de las filas de `advance_descartes` con el banco de su unidad, para
 * entregarle a `lib/advance/dominio.ts` los `ItemResuelto` que espera. Puro:
 * sin SQL, sin disco, sin React. Es el único módulo que conoce a la vez la
 * forma de la fila y la del banco; `dominio.ts` no sabe del banco y
 * `lib/datos/` no sabe de errores. El import de la fila es solo de tipo y no
 * arrastra `lib/datos/db.ts`.
 *
 * Los errores de cada distractor salen del banco (`errorCatalogado`), nunca de
 * `errores_identificados`: dominio.ts deriva aciertos y fracasos de una sola
 * fuente (decisión D5) y la columna solo guarda los aciertos.
 *
 * Una fila cuyo `item_id` ya no está en el banco (ítem retirado) se descarta:
 * sin sus distractores no hay forma de saber qué error tocó cada descarte.
 *
 * Un `errorCatalogado` que no esté en el catálogo de la unidad se conserva tal
 * cual: acá no se sabe del catálogo, y dominio.ts lo devuelve como estado
 * propio. Omitirlo de la pantalla es decisión de presentación (D12).
 */
export function itemsResueltosDe(
  filas: readonly FilaAdvanceDescarte[],
  items: readonly ItemAdvance[],
): ItemResuelto[] {
  const distractoresPorItem = new Map<string, readonly DistractorResuelto[]>();
  for (const item of items) {
    distractoresPorItem.set(
      item.id,
      item.alternativas.flatMap((a) =>
        a.esCorrecta ? [] : [{ claveOriginal: a.claveOriginal, errorId: a.errorCatalogado }],
      ),
    );
  }

  const resueltos: ItemResuelto[] = [];
  for (const fila of filas) {
    const distractores = distractoresPorItem.get(fila.item_id);
    if (!distractores) continue;
    resueltos.push({
      itemId: fila.item_id,
      distractores,
      ordenDescartes: fila.orden_descartes,
      descarteFatal: fila.descarte_fatal,
      enMs: fila.creado_en.getTime(),
    });
  }
  return resueltos;
}
