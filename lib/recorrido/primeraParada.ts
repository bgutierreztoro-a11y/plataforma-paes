import type { RespuestaP1, RespuestaP2, RespuestaP3, TipoParada } from "../eventos.ts";

/* La tabla de docs/recorrido-entrada.md §5. Pura: lo que depende del disco o del entorno llega en el contexto. */

export interface RespuestasBienvenida {
  p1: RespuestaP1 | null;
  p2: RespuestaP2 | null;
  p3: RespuestaP3 | null;
}

export interface ContextoParada {
  /** Módulo de la cookie fobos_origen; null en la puerta B. */
  unidadOrigen: string | null;
  /** Primera estación de la Línea 01 sin prerrequisitos (moduloDePartida). */
  moduloPartida: string;
  advanceVisible: boolean;
  tieneBanco: (modulo: string) => boolean;
  /** Id de la primera lección del módulo, o null si todavía no tiene. */
  leccionBase: (modulo: string) => string | null;
}

export interface Parada {
  tipo: TipoParada;
  destino: string;
  modulo: string | null;
}

export type MotivoParada = "me_cuestan" | "entender_base" | "practicar_diagnostico" | "encontrar_errores_descarte";

/** Textos firmados de §4. Las combinaciones sin texto firmado van sin motivo. */
export const TEXTO_MOTIVO: Readonly<Record<MotivoParada, string>> = {
  me_cuestan: "Porque dijiste que te cuestan: conviene partir por la base.",
  entender_base: "Porque quieres entender desde la base.",
  practicar_diagnostico: "Porque quieres practicar como en la prueba: el diagnóstico te dice por dónde partir.",
  encontrar_errores_descarte: "Porque quieres encontrar tus errores: el descarte los va anotando.",
};

export interface PrimeraParada {
  recomendada: Parada;
  alternativas: Parada[];
  motivo: MotivoParada | null;
}

const DIAGNOSTICO: Parada = { tipo: "diagnostico", destino: "/diagnostico", modulo: null };
const COMO_FUNCIONA: Parada = { tipo: "como_funciona", destino: "/como-funciona", modulo: null };

export function primeraParada(r: RespuestasBienvenida, ctx: ContextoParada): PrimeraParada {
  /* "La unidad es la de origen si respondió Sí" (§5); saltar la pregunta 3 no descarta el origen, decir que no sí. */
  const origen = ctx.unidadOrigen && r.p3 !== "no" ? ctx.unidadOrigen : null;
  const unidad = origen ?? ctx.moduloPartida;

  const leccion = (modulo: string): Parada => {
    const id = ctx.leccionBase(modulo);
    return id ? { tipo: "leccion", destino: `/leccion/${id}`, modulo } : DIAGNOSTICO;
  };
  /* Toda parada de Advance cae a Diagnóstico si Advance no está visible o la unidad no tiene banco. */
  const descarte = (modulo: string | null): Parada =>
    modulo && ctx.advanceVisible && ctx.tieneBanco(modulo)
      ? { tipo: "descarte", destino: `/advance/descarte/${modulo}`, modulo }
      : DIAGNOSTICO;
  const errores: Parada = ctx.advanceVisible
    ? { tipo: "errores", destino: "/advance/errores", modulo: null }
    : DIAGNOSTICO;

  /* Si una caída a Diagnóstico repite paradas, se rellena hasta la cantidad de la tabla con paradas sin Advance. */
  const con = (recomendada: Parada, alternativas: Parada[], motivo: MotivoParada | null): PrimeraParada => {
    const vistos = new Set([recomendada.destino]);
    const unicas = alternativas.filter((a) => !vistos.has(a.destino) && vistos.add(a.destino));
    for (const relleno of [leccion(unidad), DIAGNOSTICO, COMO_FUNCIONA]) {
      if (unicas.length >= alternativas.length) break;
      if (!vistos.has(relleno.destino) && vistos.add(relleno.destino)) unicas.push(relleno);
    }
    return { recomendada, alternativas: unicas, motivo };
  };

  /* La regla que manda sobre todas: "Me cuestan harto" siempre lleva a una lección de base, nunca a Advance. */
  if (r.p1 === "me_cuestan") return con(leccion(unidad), [DIAGNOSTICO, COMO_FUNCIONA], "me_cuestan");

  if (r.p1 === null || r.p2 === null) {
    return con(origen ? leccion(origen) : DIAGNOSTICO, [COMO_FUNCIONA], null);
  }

  const motivoDescarte = (p: Parada): MotivoParada | null =>
    p.tipo === "descarte" ? "encontrar_errores_descarte" : null;

  if (r.p1 === "mas_o_menos") {
    switch (r.p2) {
      case "entender_base":
        return con(leccion(unidad), [DIAGNOSTICO, COMO_FUNCIONA], "entender_base");
      case "practicar_prueba":
        return con(DIAGNOSTICO, [leccion(unidad), COMO_FUNCIONA], "practicar_diagnostico");
      case "encontrar_errores": {
        const p = descarte(origen);
        return con(p, [leccion(unidad), DIAGNOSTICO], motivoDescarte(p));
      }
    }
  }

  switch (r.p2) {
    case "entender_base":
      return con(leccion(unidad), [descarte(unidad), DIAGNOSTICO], "entender_base");
    case "practicar_prueba": {
      const p = descarte(origen);
      return con(p, [DIAGNOSTICO, leccion(unidad)], p.tipo === "diagnostico" ? "practicar_diagnostico" : null);
    }
    case "encontrar_errores": {
      const p = descarte(origen);
      return con(p, [errores, DIAGNOSTICO], motivoDescarte(p));
    }
  }
}
