import type { ReactNode } from "react";
import { PlanoItem } from "@/components/grafico/PlanoItem";

/* Apoyo visual por ítem (capa de UI, no de contenido): plano cartesiano para
   ítems cuyo enunciado entrega puntos concretos. Solo se agrega donde el
   gráfico AYUDA a razonar sin regalar la respuesta pedida — nunca en ítems
   donde ver el gráfico ES la respuesta (ej. "¿qué relación tienen estas
   rectas?"). Los puntos deben ser EXACTAMENTE los del enunciado. */

interface EntradaVisual {
  puntos: [number, number][];
  /**
   * Previsualización en vivo: qué recta dibujar mientras el estudiante
   * considera una alternativa, antes de comprobar.
   *
   * `pendientePorTexto` mapea el texto EXACTO de cada alternativa al valor
   * numérico que representa. Se declara a mano acá, en la capa de UI, en vez de
   * parsear el texto: el contenido usa decimal chileno ("0,33") y podría usar
   * fracciones o unidades, y un parser que adivine mal dibujaría una recta que
   * no es la que el estudiante eligió — peor que no dibujar ninguna. El texto es
   * la clave estable porque `mezclarAlternativas` reasigna las claves A–D en
   * cada montaje. Un texto ausente del mapa simplemente no previsualiza.
   */
  pendientePorTexto?: Record<string, number>;
  /** Punto del enunciado al que se ancla la recta tentativa. */
  anclaTentativa?: [number, number];
}

const VISUALES: Record<string, EntradaVisual> = {
  /* "Una recta pasa por los puntos (1, 2) y (3, 8)" — pide la pendiente */
  "diag-5": {
    puntos: [
      [1, 2],
      [3, 8],
    ],
    pendientePorTexto: { "3": 3, "6": 6, "0,33": 1 / 3, "5": 5 },
    anclaTentativa: [1, 2],
  },
  /* "Una recta pasa por los puntos (2, 3) y (5, 12)" — pide la pendiente */
  "cierre-5": {
    puntos: [
      [2, 3],
      [5, 12],
    ],
    pendientePorTexto: { "3": 3, "9": 9, "0,33": 1 / 3, "10": 10 },
    anclaTentativa: [2, 3],
  },
};

/**
 * `textoTentativo` es el texto de la alternativa que el estudiante tiene
 * marcada y todavía no comprobó. Con él, el gráfico muestra SU recta anclada al
 * primer punto del enunciado, para que vea con sus ojos si pasa por el segundo.
 * Sin él (nada marcado, o ya comprobado) se dibuja la recta real del enunciado.
 */
export function visualDeItem(itemId: string, textoTentativo?: string | null): ReactNode | null {
  const entrada = VISUALES[itemId];
  if (!entrada) return null;

  const m =
    textoTentativo && entrada.pendientePorTexto
      ? entrada.pendientePorTexto[textoTentativo]
      : undefined;
  const tentativa =
    m !== undefined && entrada.anclaTentativa ? { m, desde: entrada.anclaTentativa } : null;

  return <PlanoItem puntos={entrada.puntos} rectaTentativa={tentativa} />;
}

/** Ids de ítems que hoy tienen previsualización en vivo. Para reportería. */
export function itemsConPrevisualizacion(): string[] {
  return Object.entries(VISUALES)
    .filter(([, v]) => v.pendientePorTexto && v.anclaTentativa)
    .map(([id]) => id);
}
