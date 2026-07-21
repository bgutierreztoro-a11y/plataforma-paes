export interface RespuestaRegistrada {
  itemId: string;
  correcta: boolean;
  /* Tiempo de resolución en ms (mismo valor que el evento item_respuesta);
     alimenta el resumen de ritmo en las pantallas finales. */
  tiempoMs: number;
}

export interface EstadoSetItems {
  indiceActual: number;
  respuestas: RespuestaRegistrada[];
}

export type AccionSetItems =
  | { type: "REGISTRAR"; itemId: string; correcta: boolean; tiempoMs: number }
  | { type: "SIGUIENTE" };

export const estadoInicialSetItems: EstadoSetItems = { indiceActual: 0, respuestas: [] };

export function reducerSetItems(estado: EstadoSetItems, accion: AccionSetItems): EstadoSetItems {
  switch (accion.type) {
    case "REGISTRAR":
      return {
        ...estado,
        respuestas: [
          ...estado.respuestas,
          { itemId: accion.itemId, correcta: accion.correcta, tiempoMs: accion.tiempoMs },
        ],
      };
    case "SIGUIENTE":
      return { ...estado, indiceActual: estado.indiceActual + 1 };
  }
}
