import { FiguraDeItem } from "@/components/advance/FiguraDeItem";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import type { FiguraItem } from "@/lib/advance/descarte";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { TextoEnriquecido } from "@/lib/markdownSimple";

/**
 * La solución que muestra el descarte fatal (§6.1), el único lugar del
 * producto donde se ve la solución de un ítem Advance.
 *
 * No va en `PanelFeedback`: ese panel envuelve a sus hijos en un `<p>` y
 * `TextoEnriquecido` emite párrafos. Misma tarjeta y el mismo rótulo en
 * versalitas, armados a mano sobre `TARJETA_LINEA`.
 *
 * `figura` es la figura de la solución (`figuraSolucion`, regla 40): una
 * construcción auxiliar dibujada, que puede mostrar la respuesta. Va antes del
 * texto, bajo el rótulo, y se monta con contexto "solucion": el lienzo usa el
 * interior de esta tarjeta, 330 px a 390, para que su letra siga en 12 px.
 */
export function SolucionDescarte({ solucion, figura }: { solucion: string; figura?: FiguraItem }) {
  const { descarte } = TEXTOS_ADVANCE;
  return (
    <div role="status" className={`${TARJETA_LINEA} px-[13px] py-3`} data-solucion>
      <p className="text-etiqueta uppercase text-secondary">{descarte.solucion}</p>
      {figura && (
        <div className="mt-2" data-figura-solucion>
          <FiguraDeItem figura={figura} contexto="solucion" />
        </div>
      )}
      <div className="mt-1.5 text-sm leading-relaxed text-primary">
        <TextoEnriquecido contenido={solucion} />
      </div>
    </div>
  );
}
