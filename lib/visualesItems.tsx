import type { ReactNode } from "react";
import { PlanoItem } from "@/components/grafico/PlanoItem";
import { IlustracionTransformacion } from "@/components/ilustraciones/IlustracionTransformacion";
import { IlustracionSemejanza } from "@/components/ilustraciones/IlustracionSemejanza";
import type { DatosSemejanza, DatosTransformacion } from "@/lib/tipos";

/* Apoyo visual por ítem (capa de UI, no de contenido): plano cartesiano para
   ítems cuyo enunciado entrega puntos concretos. Solo se agrega donde el
   gráfico AYUDA a razonar sin regalar la respuesta pedida — nunca en ítems
   donde ver el gráfico ES la respuesta (ej. "¿qué relación tienen estas
   rectas?"). Los puntos deben ser EXACTAMENTE los del enunciado.

   Para los módulos de Geometría (transformaciones isométricas y semejanza) la
   regla se concreta así: la figura se dibuja cuando ES el estímulo del
   enunciado (identificar qué transformación lleva F a F', razonar sobre una
   distancia, armar una proporción con las cotas a la vista) y NUNCA cuando el
   gráfico permite leer la respuesta numérica pedida (pedir las coordenadas de
   A' y dibujar A'). En esos casos la escena va con `mostrarImagen: false`, y
   en semejanza la incógnita se rotula con una letra. Las claves son los ids de
   ítem, así que llevan el prefijo del módulo para no chocar entre lecciones. */

interface EntradaRecta {
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

type EntradaVisual =
  | EntradaRecta
  | { transformacion: DatosTransformacion }
  | { semejanza: DatosSemejanza };

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

  /* ---- transformaciones isométricas: la figura es el estímulo ---- */

  /* Distancia entre P(−2, −7) y Q(6, 8): ver los puntos ayuda a armar el
     triángulo rectángulo; la distancia igual hay que calcularla. */
  "isometrias-l1-item-2": {
    transformacion: {
      tipo: "transformacion",
      figura: [[-2, -7], [6, 8]],
      rotulos: ["P", "Q"],
      transformaciones: [],
      trazo: "puntos",
    },
  },
  /* Rotación de 90° antihorario del triángulo ABC: se dibuja la figura y el
     centro, nunca la imagen, que es lo que se pregunta. */
  "isometrias-l2-item-2": {
    transformacion: {
      tipo: "transformacion",
      figura: [[1, 2], [4, 2], [1, 5]],
      transformaciones: [{ tipo: "rotacion", grados: 90, sentido: "antihorario" }],
      mostrarImagen: false,
    },
  },
  /* Identificar la transformación que lleva F a F': las dos figuras son el
     estímulo; la respuesta es cuál regla, no una coordenada. */
  "isometrias-l3-item-2": {
    transformacion: {
      tipo: "transformacion",
      figura: [[1, 1], [4, 1], [4, 3], [1, 2]],
      rotulos: ["A", "B", "C", "D"],
      transformaciones: [{ tipo: "reflexion", eje: "y" }],
    },
  },
  /* Reflexión de una figura respecto del eje x: solo la original y el eje. */
  "cierre-isometrias-3": {
    transformacion: {
      tipo: "transformacion",
      figura: [[2, 2], [6, 2], [2, 5]],
      transformaciones: [{ tipo: "reflexion", eje: "x" }],
      mostrarImagen: false,
    },
  },
  /* Identificar la transformación: figura e imagen, ambas dibujadas. */
  "cierre-isometrias-5": {
    transformacion: {
      tipo: "transformacion",
      figura: [[1, 1], [3, 1], [3, 4]],
      transformaciones: [{ tipo: "rotacion", grados: 180, sentido: "antihorario" }],
    },
  },

  /* ---- semejanza: todas las cotas rotuladas, la incógnita es una letra ---- */

  /* Trapecio rectángulo (lados 7, 5, 4 y 4, el 5 sale del trío 3-4-5) y su
     imagen por 3/2; el lado pedido va rotulado x. */
  "semejanza-l1-item-2": {
    semejanza: {
      tipo: "semejanza",
      disposicion: "ladoALado",
      original: { vertices: [[0, 0], [7, 0], [4, 4], [0, 4]], cotas: ["7 cm", "5 cm", "4 cm", "4 cm"] },
      k: 1.5,
      imagen: { cotas: ["10,5 cm", "x", "6 cm", "6 cm"] },
    },
  },
  /* Dos cuadrados lado a lado, 3 cm y 9 cm: se pregunta por los factores de
     perímetro y área, no por una cota. */
  "cierre-semejanza-3": {
    semejanza: {
      tipo: "semejanza",
      disposicion: "ladoALado",
      original: { vertices: [[0, 0], [3, 0], [3, 3], [0, 3]], cotas: ["3 cm", "3 cm", "3 cm", "3 cm"] },
      k: 3,
      imagen: { cotas: ["9 cm", "9 cm", "9 cm", "9 cm"] },
    },
  },
  /* Sombra y altura: el poste, el niño y el rayo común. */
  "cierre-semejanza-7": {
    semejanza: {
      tipo: "semejanza",
      disposicion: "anidada",
      grande: { horizontal: 9, vertical: 6.75, etiquetaHorizontal: "9 m", etiquetaVertical: "h" },
      chica: { horizontal: 1.8, vertical: 1.35, etiquetaHorizontal: "1,8 m", etiquetaVertical: "1,35 m" },
    },
  },
};

/**
 * `textoTentativo` es el texto de la alternativa que el estudiante tiene
 * marcada y todavía no comprobó. Con él, el gráfico de una recta muestra SU
 * recta anclada al primer punto del enunciado, para que vea con sus ojos si
 * pasa por el segundo. Sin él (nada marcado, o ya comprobado) se dibuja la
 * recta real del enunciado. Las escenas de geometría no previsualizan: son
 * estáticas.
 */
export function visualDeItem(itemId: string, textoTentativo?: string | null): ReactNode | null {
  const entrada = VISUALES[itemId];
  if (!entrada) return null;

  if ("transformacion" in entrada) return <IlustracionTransformacion {...entrada.transformacion} />;
  if ("semejanza" in entrada) return <IlustracionSemejanza {...entrada.semejanza} />;

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
    .filter(([, v]) => "pendientePorTexto" in v && v.pendientePorTexto && v.anclaTentativa)
    .map(([id]) => id);
}
