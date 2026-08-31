import type { ClaveAlternativa } from "@/lib/tipos";

export interface RespuestaRegistrada {
  itemId: string;
  correcta: boolean;
  /* Tiempo de resolución en ms (mismo valor que el evento item_respuesta);
     alimenta el resumen de ritmo en las pantallas finales. */
  tiempoMs: number;
  /* Qué alternativa marcó, no solo si acertó.
     `correcta` colapsa tres distractores en un único `false`, y cada uno
     representa un error distinto: `errorCatalogado` cuelga de la alternativa
     (lib/tipos.ts:29), no del ítem. Sin la clave, la pantalla de resultado no
     puede decir QUÉ falló, solo cuánto. Requerida y no opcional a propósito:
     hay un solo sitio de dispatch y un opcional dejaría pasar en silencio a un
     llamador futuro que la olvide. */
  claveElegida: ClaveAlternativa;
}

export interface EstadoSetItems {
  indiceActual: number;
  respuestas: RespuestaRegistrada[];
}

export type AccionSetItems =
  | {
      type: "REGISTRAR";
      itemId: string;
      correcta: boolean;
      tiempoMs: number;
      claveElegida: ClaveAlternativa;
    }
  | { type: "SIGUIENTE" };

export const estadoInicialSetItems: EstadoSetItems = { indiceActual: 0, respuestas: [] };

export function reducerSetItems(estado: EstadoSetItems, accion: AccionSetItems): EstadoSetItems {
  switch (accion.type) {
    case "REGISTRAR":
      return {
        ...estado,
        respuestas: [
          ...estado.respuestas,
          {
            itemId: accion.itemId,
            correcta: accion.correcta,
            tiempoMs: accion.tiempoMs,
            claveElegida: accion.claveElegida,
          },
        ],
      };
    case "SIGUIENTE":
      return { ...estado, indiceActual: estado.indiceActual + 1 };
  }
}
