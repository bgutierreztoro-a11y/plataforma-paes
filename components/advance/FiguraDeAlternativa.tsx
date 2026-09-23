import { FiguraDeItem } from "@/components/advance/FiguraDeItem";
import { DiagramaCajon } from "@/components/advance/figuras/DiagramaCajon";
import { LienzoGeometrico } from "@/components/advance/figuras/LienzoGeometrico";
import type { FiguraItem } from "@/lib/advance/descarte";

interface FiguraDeAlternativaProps {
  figura: FiguraItem;
  /* Descartada (bien o por error): el gráfico se atenúa y lleva la diagonal. */
  tachada?: boolean;
}

/**
 * La figura de una alternativa gráfica (item-advance.schema.json,
 * figuraAlternativa; reglas 25 y 26), en descarte y en triage.
 *
 * Va en su propia fila, a ancho completo bajo la letra: al lado de la letra el
 * gráfico perdería unos 40 px y la letra del SVG bajaría de los 9,5 px que
 * tienen las figuras del enunciado a 390 px. Panel en --color-bg, el fondo
 * para el que están calibrados los halos de los rótulos.
 *
 * Nombre accesible (16b): si la figura trae descripcion, el SVG queda
 * aria-hidden y la descripción va en sr-only dentro del botón, así que el
 * lector la lee una vez, junto con el estado. Las figuras de datos sin
 * descripcion exigen texto (regla 26) y conservan su aria-label.
 *
 * El diagrama de cajón se monta directo con contexto "alternativa": su viewBox
 * es más angosto (280) para que la letra no baje de 12 px en el carril de la
 * alternativa, y el validador lo mide con ese mismo ancho. El lienzo
 * geométrico también va con contexto "alternativa": su viewBox es el panel de
 * 316 px y el validador lo mide ahí. Las demás figuras pasan por FiguraDeItem
 * sin cambios.
 *
 * Descartada (16e): sin opacity, igual que el texto tachado. Se atenúa a gris
 * (la tinta sigue en tinta, así que el contraste de los números no baja) y
 * lleva una diagonal en tinta sobre el gráfico. El estado lo anuncia el texto
 * de la alternativa, no la diagonal.
 */
export function FiguraDeAlternativa({ figura, tachada = false }: FiguraDeAlternativaProps) {
  const descripcion = "descripcion" in figura ? figura.descripcion : undefined;
  return (
    <span className="relative block basis-full" data-alternativa-figura data-tachada={tachada ? "" : undefined}>
      <span aria-hidden={descripcion ? true : undefined} className={`block rounded-sm bg-[var(--color-bg)] p-1 ${tachada ? "grayscale" : ""}`.trim()}>
        {figura.tipo === "diagrama-cajon" ? (
          <DiagramaCajon figura={figura} contexto="alternativa" />
        ) : figura.tipo === "lienzo-geometrico" ? (
          <LienzoGeometrico figura={figura} contexto="alternativa" />
        ) : (
          <FiguraDeItem figura={figura} />
        )}
      </span>
      {tachada && (
        <svg
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          data-marca-descarte
        >
          <line x1="3" y1="97" x2="97" y2="3" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {descripcion && <span className="sr-only">{descripcion}</span>}
    </span>
  );
}
