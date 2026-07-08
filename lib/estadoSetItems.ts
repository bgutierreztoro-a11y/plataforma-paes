export interface RespuestaRegistrada {
  itemId: string;
  correcta: boolean;
}

export interface EstadoSetItems {
  indiceActual: number;
  respuestas: RespuestaRegistrada[];
}

export type AccionSetItems =
  | { type: "REGISTRAR"; itemId: string; correcta: boolean }
  | { type: "SIGUIENTE" };

export const estadoInicialSetItems: EstadoSetItems = { indiceActual: 0, respuestas: [] };

export function reducerSetItems(estado: EstadoSetItems, accion: AccionSetItems): EstadoSetItems {
  switch (accion.type) {
    case "REGISTRAR":
      return {
        ...estado,
        respuestas: [...estado.respuestas, { itemId: accion.itemId, correcta: accion.correcta }],
      };
    case "SIGUIENTE":
      return { ...estado, indiceActual: estado.indiceActual + 1 };
  }
}
