import type { ReactNode } from "react";

type Nivel = "plano" | "elevado" | "flotante";

/**
 * Una superficie que agrupa una unidad real de información.
 *
 * Existe porque el mismo puñado de clases —`rounded-tarjeta border
 * border-border bg-surface … shadow-tarjeta`— estaba copiado literal en cinco
 * archivos y con tres paddings distintos según quién lo escribió. Con la
 * escala de elevación de MASTER.md §2.5 la copia deja de ser solo repetición y
 * pasa a ser una decisión que hay que tomar bien una vez.
 *
 * El componente es dueño de **superficie, borde, radio y elevación**. El
 * tamaño, el padding y la alineación los sigue poniendo quien la usa, por
 * `className`: son decisiones de la pantalla, no de la tarjeta.
 *
 * Los tres niveles son una jerarquía de distancia al papel, no tres estilos:
 * - `plano`: apoyada. Agrupa sin llamar la atención — figuras, tablas,
 *   bloques dentro de una lección que ya vive dentro de otra superficie.
 * - `elevado`: la unidad de información normal. Una tarjeta de verdad.
 * - `flotante`: vive *sobre* el contenido y tapa lo que hay debajo, así que
 *   tiene que separarse de verdad. Un solo uso por pantalla como mucho.
 *
 * Regla de MASTER.md §11 que conviene releer antes de sumar una: la tarjeta se
 * usa cuando hay una unidad de información real. Una caja que solo separa
 * fragmenta.
 */
const CLASES_NIVEL: Record<Nivel, string> = {
  plano: "shadow-none",
  elevado: "shadow-tarjeta",
  flotante: "shadow-flotante",
};

const CLASES_BASE = "rounded-panel border border-border bg-surface";

export function Tarjeta({
  nivel = "elevado",
  as: Elemento = "div",
  className = "",
  children,
}: {
  nivel?: Nivel;
  /* `figure` y `section` cambian el significado del bloque para un lector de
     pantalla, así que la tarjeta no puede imponer siempre un `div`. */
  as?: "div" | "figure" | "section";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Elemento className={`${CLASES_BASE} ${CLASES_NIVEL[nivel]} ${className}`}>
      {children}
    </Elemento>
  );
}
