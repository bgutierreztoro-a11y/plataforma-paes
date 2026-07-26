export interface EstadoRunner {
  pasoActual: number;
}

export type AccionRunner =
  | { type: "IR_SIGUIENTE" }
  | { type: "IR_ANTERIOR" }
  /* Repasar la lección desde el principio. El progreso ya guardado no se toca:
     `completada` es monótona y el detalle de intentos es histórico, así que
     rehacerla sin cuenta ni castigo es exactamente lo que ofrece la pantalla
     de cierre cuando el desempeño quedó bajo el umbral. */
  | { type: "REINICIAR" };

export const estadoInicialRunner: EstadoRunner = { pasoActual: 0 };

export function reducerRunner(estado: EstadoRunner, accion: AccionRunner): EstadoRunner {
  switch (accion.type) {
    case "IR_SIGUIENTE":
      return { pasoActual: Math.min(estado.pasoActual + 1, 9) };
    case "IR_ANTERIOR":
      return { pasoActual: Math.max(estado.pasoActual - 1, 0) };
    case "REINICIAR":
      return estadoInicialRunner;
  }
}
