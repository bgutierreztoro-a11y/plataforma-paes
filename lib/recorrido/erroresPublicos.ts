import type { ResultadoErrorPublico } from "../eventos.ts";
import type { ClaveAlternativa } from "../tipos.ts";

/* Lista blanca de la página pública del error (docs/recorrido-entrada.md, ADR-01).
   Los textos son los firmados por Benja en §4: viven acá, no en content/. */

export interface CasoRespuesta {
  titulo: string;
  parrafos: readonly string[];
}

export interface ErrorPublico {
  unidadId: string;
  errorId: string;
  itemId: string;
  /** Rótulo del encabezado: "Porcentaje · 1 pregunta · sin cuenta". */
  etiquetaUnidad: string;
  /** Para el cierre: "En porcentaje hay N más como este." */
  unidadEnFrase: string;
  /** Letra de la alternativa del error del video. */
  tentadora: ClaveAlternativa;
  casos: Readonly<Record<ClaveAlternativa, CasoRespuesta>>;
  /** Se agrega al texto de cualquier alternativa que no sea la tentadora ni la correcta. */
  lineaTrasOtra: string;
}

const OTRO_ERROR = "Esa alternativa viene de otro error, distinto al del video.";

export const ERRORES_PUBLICOS: readonly ErrorPublico[] = [
  {
    unidadId: "porcentaje",
    errorId: "deshace-porcentaje-con-mismo-porcentaje",
    itemId: "adv-porcentaje-019",
    etiquetaUnidad: "Porcentaje",
    unidadEnFrase: "porcentaje",
    tentadora: "A",
    casos: {
      A: {
        titulo: "Elegiste la alternativa más tentadora.",
        parrafos: [
          "Le quitaste el 34% a $23.450. Suena lógico: subió 34%, le bajas 34% y vuelves. Pero el alza se calculó sobre el precio antiguo, que era más barato. El 34% de $23.450 es más plata, así que bajas de más y llegas a $15.477, por debajo del precio real.",
          "Lo que sí funciona: subir 34% es multiplicar por 1,34. Para volver, divides por 1,34.",
          "$23.450 ÷ 1,34 = $17.500. Compruébalo: $17.500 × 1,34 = $23.450.",
        ],
      },
      B: {
        titulo: OTRO_ERROR,
        parrafos: [
          "$7.973 es el 34% de $23.450. La cuenta está bien, pero te preguntan cuánto costaba antes, no cuánto es el 34%.",
        ],
      },
      C: {
        titulo: "Bien, no caíste.",
        parrafos: [
          "La trampa estaba en la A: quitarle el 34% a $23.450. Así llegas a $15.477, más barato que el precio real, porque el 34% de $23.450 es más plata que el 34% del precio antiguo.",
          "La forma segura es dividir por 1,34: $23.450 ÷ 1,34 = $17.500.",
        ],
      },
      D: {
        titulo: OTRO_ERROR,
        parrafos: ["Restaste 34 pesos. El alza fue el 34% del precio, que son miles de pesos."],
      },
    },
    lineaTrasOtra:
      "La trampa del video estaba en la A: bajarle el 34% al precio nuevo. La correcta es la C: $23.450 ÷ 1,34 = $17.500.",
  },
];

export function errorPublico(unidadId: string, errorId: string): ErrorPublico | undefined {
  return ERRORES_PUBLICOS.find((e) => e.unidadId === unidadId && e.errorId === errorId);
}

export function resultadoDe(
  entrada: Pick<ErrorPublico, "tentadora">,
  elegida: ClaveAlternativa,
  correcta: ClaveAlternativa,
): ResultadoErrorPublico {
  if (elegida === correcta) return "correcta";
  if (elegida === entrada.tentadora) return "tentadora";
  return "otra";
}

export function textoDeRespuesta(
  entrada: Pick<ErrorPublico, "tentadora" | "casos" | "lineaTrasOtra">,
  elegida: ClaveAlternativa,
  correcta: ClaveAlternativa,
): CasoRespuesta {
  const caso = entrada.casos[elegida];
  if (resultadoDe(entrada, elegida, correcta) !== "otra") return caso;
  return { titulo: caso.titulo, parrafos: [...caso.parrafos, entrada.lineaTrasOtra] };
}
