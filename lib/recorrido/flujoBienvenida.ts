import type { RespuestaP1, RespuestaP2, RespuestaP3 } from "../eventos.ts";

/* Las preguntas de la bienvenida, una por pantalla (docs/recorrido-entrada.md §4). La 3 solo en la puerta A. */

export type Pregunta = "p1" | "p2" | "p3";

export interface EnvioBienvenida {
  p1: RespuestaP1 | null;
  p2: RespuestaP2 | null;
  p3: RespuestaP3 | null;
  /** Saltó al menos una pregunta, o eligió "Prefiero explorar por mi cuenta". */
  saltada: boolean;
}

export interface EstadoBienvenida extends EnvioBienvenida {
  preguntas: readonly Pregunta[];
  indice: number;
}

export function inicioBienvenida(conOrigen: boolean): EstadoBienvenida {
  return { preguntas: conOrigen ? ["p1", "p2", "p3"] : ["p1", "p2"], indice: 0, p1: null, p2: null, p3: null, saltada: false };
}

export function terminada(e: EstadoBienvenida): boolean {
  return e.indice >= e.preguntas.length;
}

export function responder<P extends Pregunta>(e: EstadoBienvenida, valor: EnvioBienvenida[P]): EstadoBienvenida {
  if (terminada(e)) return e;
  return { ...e, [e.preguntas[e.indice]]: valor, indice: e.indice + 1 };
}

export function saltar(e: EstadoBienvenida): EstadoBienvenida {
  if (terminada(e)) return e;
  return { ...e, [e.preguntas[e.indice]]: null, indice: e.indice + 1, saltada: true };
}

/** "Prefiero explorar por mi cuenta": termina sin guardar respuestas. */
export function explorar(e: EstadoBienvenida): EstadoBienvenida {
  return { ...e, p1: null, p2: null, p3: null, indice: e.preguntas.length, saltada: true };
}

const VALORES = {
  p1: ["me_cuestan", "mas_o_menos", "me_va_bien"],
  p2: ["entender_base", "practicar_prueba", "encontrar_errores"],
  p3: ["si", "no"],
} as const;

/** El cuerpo de POST /api/recorrido/bienvenida viene del cliente: solo valores cerrados o null. */
export function validarEnvio(crudo: unknown): EnvioBienvenida | null {
  if (!crudo || typeof crudo !== "object" || Array.isArray(crudo)) return null;
  const c = crudo as Record<string, unknown>;
  if (Object.keys(c).some((k) => !["p1", "p2", "p3", "saltada"].includes(k))) return null;
  if (typeof c.saltada !== "boolean") return null;
  for (const p of ["p1", "p2", "p3"] as const) {
    if (c[p] !== null && !(VALORES[p] as readonly unknown[]).includes(c[p])) return null;
  }
  return { p1: c.p1 as RespuestaP1 | null, p2: c.p2 as RespuestaP2 | null, p3: c.p3 as RespuestaP3 | null, saltada: c.saltada };
}
