import type { RespuestaP1, RespuestaP2, RespuestaP3, TipoParada } from "../eventos.ts";

/* Textos firmados de docs/recorrido-entrada.md §4 (Bienvenida, Así funciona Fobos, Primera parada). */

export interface Opcion<T extends string> {
  id: T;
  texto: string;
}

export const PREGUNTA_1 = {
  texto: "¿Cómo te llevas con las matemáticas?",
  opciones: [
    { id: "me_cuestan", texto: "Me cuestan harto" },
    { id: "mas_o_menos", texto: "Más o menos" },
    { id: "me_va_bien", texto: "Me va bien" },
  ] satisfies Opcion<RespuestaP1>[],
};

export const PREGUNTA_2 = {
  texto: "¿Qué quieres hacer primero?",
  opciones: [
    { id: "entender_base", texto: "Entender desde la base" },
    { id: "practicar_prueba", texto: "Practicar como en la prueba" },
    { id: "encontrar_errores", texto: "Encontrar mis errores" },
  ] satisfies Opcion<RespuestaP2>[],
};

/** Solo puerta A. `unidad` es la de la página pública ("porcentaje"). */
export function pregunta3(unidad: string) {
  return {
    texto: `Llegaste por la trampa de ${unidad}. ¿Sigues con ${unidad}?`,
    opciones: [
      { id: "si", texto: `Sí, sigamos con ${unidad}` },
      { id: "no", texto: "No, prefiero ver otra cosa" },
    ] satisfies Opcion<RespuestaP3>[],
  };
}

export const TEXTOS_BIENVENIDA = {
  saltar: "Saltar",
  explorar: "Prefiero explorar por mi cuenta",
  terminaTuBienvenida: "Termina tu bienvenida",
} as const;

export const ASI_FUNCIONA = {
  titulo: "Así funciona Fobos",
  intro: "La PAES M1 tiene 4 ejes. En Fobos son 4 líneas de metro y cada unidad es una estación. Son 16.",
  bloques: [
    { nombre: "Lecciones.", texto: "Aprendes cada estación desde la base. Primero descubres el patrón, después viene la regla." },
    { nombre: "Diagnóstico.", texto: "Te dice en qué estaciones estás firme y en cuáles no. No es una nota." },
    { nombre: "Advance.", texto: "Practicas como en la prueba: descartas alternativas y Fobos anota en qué error caes." },
  ],
  boton: "Ver mi primera parada",
} as const;

export const TEXTOS_PARADA = {
  rotulo: "Tu primera parada",
  boton: "Ir a mi primera parada",
  oSiPrefieres: "O si prefieres:",
  pie: "Puedes ir a cualquier parte cuando quieras. Esto es solo un punto de partida.",
} as const;

const FECHA = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", timeZone: "America/Santiago" });

/**
 * Arriba de la primera pregunta. La prueba termina el día de su `vigencia_hasta`; la cortesía
 * vale hasta el día anterior, porque su `vigencia_hasta` es exclusiva a las 00:00 de Chile.
 * Sin texto firmado para compra ni para quien no tiene acceso: no se muestra nada.
 */
export function encabezadoAcceso(
  acceso: { origen: "prueba" | "cortesia" | "compra"; vigencia_hasta: Date | null } | null,
): string | null {
  if (!acceso?.vigencia_hasta) return null;
  if (acceso.origen === "prueba") {
    return `Listo. Tu prueba de 7 días empezó hoy y termina el ${FECHA.format(acceso.vigencia_hasta)}. Tienes todo Fobos, Advance incluido.`;
  }
  if (acceso.origen === "cortesia") {
    const ultimoDia = new Date(acceso.vigencia_hasta.getTime() - 1);
    return `Listo. Tienes todo Fobos, Advance incluido, hasta el ${FECHA.format(ultimoDia)}.`;
  }
  return null;
}

export const ETIQUETA_PARADA: Readonly<Record<TipoParada, string>> = {
  leccion: "Lección",
  diagnostico: "Diagnóstico",
  descarte: "Descarte en Advance",
  errores: "Tus errores",
  como_funciona: "Cómo funciona Fobos",
};

/** Nombres de §5 para las alternativas de la tarjeta. */
export const ETIQUETA_ALTERNATIVA: Readonly<Record<TipoParada, string>> = {
  ...ETIQUETA_PARADA,
  leccion: "Lección de base",
};
