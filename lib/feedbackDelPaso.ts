import type { Bloque } from "./tipos.ts";

/**
 * Cuántos paneles de feedback puede llegar a abrir un paso, y de qué clase.
 *
 * Existe para una sola decisión (Fase 5): si el feedback de un paso puede vivir
 * en la zona anclada al fondo del viewport o tiene que quedarse inline junto a
 * su pregunta. Un panel anclado abajo solo puede representar UN feedback a la
 * vez; en un paso con tres ejercicios independientes, anclarlo obliga a elegir
 * cuál se muestra y rompe la relación pregunta→respuesta que el estudiante
 * necesita para leerlo.
 *
 * Es una función pura sobre la forma del contenido, no sobre el DOM: la
 * decisión tiene que ser la misma en el servidor y en el cliente, y tiene que
 * poder verificarse contra el corpus real sin abrir el navegador (que es lo que
 * hace `feedbackDelPaso.test.ts`).
 *
 * **La cuenta no es "cuántos bloques evaluables hay".** `BloqueNumerica` abre
 * un panel POR CAMPO (ver `BloqueNumerica.tsx`, el `role="status"` va dentro del
 * `campos.map`), así que un solo bloque de dos campos son dos paneles. Contar
 * bloques y no paneles daría "simple" a un paso que en pantalla muestra dos
 * recuadros de feedback a la vez.
 */

/** Un panel que dicta correcto/incorrecto sobre lo que el estudiante respondió. */
export type ClaseFeedback = "veredicto" | "acuse";

export interface PuntoFeedback {
  /** Índice del bloque dentro del paso, para poder señalarlo en un reporte. */
  indiceBloque: number;
  tipoBloque: Bloque["tipo"];
  clase: ClaseFeedback;
}

/**
 * Los paneles que abre un bloque al revelarse, en orden.
 *
 * `veredicto` es el panel que contesta "¿la tuve bien?" —selección, numérica,
 * verdadero/falso, pregunta—. `acuse` es el que solo confirma que se registró
 * algo, sin evaluarlo: predicción y respuesta abierta siempre dicen lo mismo
 * pase lo que pase, y por eso no compiten por la atención del mismo modo.
 *
 * `interactivoSlider` NO aparece acá aunque sus micropreguntas tengan feedback:
 * ese feedback vive dentro del gráfico (`SecuenciaMicropreguntas.tsx`), pegado a
 * la micropregunta que lo produce, y no es un panel del paso. Sacarlo de ahí lo
 * separaría del objeto que explica.
 */
export function puntosDeFeedback(bloques: readonly Bloque[]): PuntoFeedback[] {
  const puntos: PuntoFeedback[] = [];

  bloques.forEach((bloque, indiceBloque) => {
    switch (bloque.tipo) {
      case "seleccion":
      case "verdaderoFalso":
      case "pregunta":
        puntos.push({ indiceBloque, tipoBloque: bloque.tipo, clase: "veredicto" });
        break;
      case "numerica":
        /* Un panel por campo: ver la nota del encabezado. Un bloque sin campos
           no debería existir (el validador lo rechaza), pero si llegara, no
           abre ningún panel y no hay nada que contar. */
        for (let i = 0; i < bloque.campos.length; i++) {
          puntos.push({ indiceBloque, tipoBloque: bloque.tipo, clase: "veredicto" });
        }
        break;
      case "prediccion":
      case "abierta":
        puntos.push({ indiceBloque, tipoBloque: bloque.tipo, clase: "acuse" });
        break;
      /* texto, pistas, visualizacion e interactivoSlider no abren panel de
         paso. Se listan para que el `switch` sea exhaustivo y un bloque nuevo
         no caiga en el silencio de un `default`. */
      case "texto":
      case "pistas":
      case "visualizacion":
      case "interactivoSlider":
        break;
    }
  });

  return puntos;
}

/**
 * Un paso es "simple" cuando como mucho puede haber UN panel de veredicto
 * abierto en pantalla. Solo esos pueden usar la zona anclada.
 *
 * Los `acuse` no cuentan para el límite: no evalúan nada, así que dos de ellos
 * —o uno junto a un veredicto— no crean la ambigüedad de "¿a cuál pregunta
 * corresponde este resultado?" que la regla evita. Lo que sí hacen es quedarse
 * inline: la zona anclada es para el veredicto.
 */
export function esPasoSimple(bloques: readonly Bloque[]): boolean {
  return puntosDeFeedback(bloques).filter((p) => p.clase === "veredicto").length <= 1;
}
