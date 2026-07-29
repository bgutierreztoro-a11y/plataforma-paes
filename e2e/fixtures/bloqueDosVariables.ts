import type { BloqueInteractivoSlider } from "@/lib/tipos";

/**
 * Fixture de prueba para la variante `dosVariables` del bloque interactivo.
 * No es contenido de lección: ninguna lección publicada declara todavía este
 * bloque (hoy `content/` solo tiene `unaVariable`, en `lineal-pendiente-e-intercepto`).
 *
 * Vive en `e2e/` a propósito y no en `content/lecciones/`: es dato de prueba
 * para verificar el componente, no material pedagógico con proveniencia ni
 * revisión matemática. Lo usa `app/_preview/slider-dos-variables/page.tsx`
 * para poder ver y capturar el bloque sin escribir una lección real.
 */
export const FIXTURE_BLOQUE_DOS_VARIABLES: BloqueInteractivoSlider = {
  tipo: "interactivoSlider",
  variante: "dosVariables",
  variables: [
    { nombre: "pendiente (m)", min: -5, max: 5, valorInicial: 1, editable: true },
    { nombre: "intercepto (b)", min: -8, max: 8, valorInicial: 2, editable: true },
  ],
  instruccion: "Antes de mover nada: predice, después comprueba.",
  secuenciaMicropreguntas: [
    {
      id: "fixture-mp-1",
      enunciado: "Si subes la pendiente, ¿qué le pasa al intercepto?",
      feedbackPorPrediccion: [
        {
          prediccion: "También sube",
          mensaje:
            "Mueve solo la pendiente y mira el punto donde la recta cruza el eje vertical: no se mueve. El intercepto depende del otro control, no de este.",
        },
        {
          prediccion: "También baja",
          mensaje:
            "Mueve solo la pendiente y mira el punto donde la recta cruza el eje vertical: se queda fijo. El intercepto depende del otro control, no de este.",
        },
      ],
    },
    {
      id: "fixture-mp-2",
      enunciado: "Si el intercepto es negativo, ¿por dónde cruza la recta el eje vertical?",
      feedbackPorPrediccion: [
        {
          prediccion: "Por arriba del cero",
          mensaje:
            "Mueve el intercepto a un valor negativo y mira dónde cruza la recta el eje vertical: queda bajo el cero, no sobre él.",
        },
      ],
    },
  ],
};
