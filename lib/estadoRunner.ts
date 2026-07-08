export interface EstadoRunner {
  pasoActual: number;
}

export type AccionRunner = { type: "IR_SIGUIENTE" } | { type: "IR_ANTERIOR" };

export const estadoInicialRunner: EstadoRunner = { pasoActual: 0 };

export function reducerRunner(estado: EstadoRunner, accion: AccionRunner): EstadoRunner {
  switch (accion.type) {
    case "IR_SIGUIENTE":
      return { pasoActual: Math.min(estado.pasoActual + 1, 9) };
    case "IR_ANTERIOR":
      return { pasoActual: Math.max(estado.pasoActual - 1, 0) };
  }
}
