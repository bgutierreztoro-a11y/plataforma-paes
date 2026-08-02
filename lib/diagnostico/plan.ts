/**
 * Del estado final del diagnóstico al plan que ve el alumno.
 *
 * Este archivo no toca creencias: las lee. Traduce el log-odds de cada unidad a
 * un estado del camino, elige por dónde conviene empezar y estima una banda de
 * puntaje. La regla de qué se le puede NOMBRAR al alumno vive en `motor.ts`
 * (`errorNombrable`) y acá solo se transporta.
 */

import {
  AMPLITUD_BANDA_PUNTAJE,
  MIN_ITEMS,
  PUNTAJE_MAX,
  PUNTAJE_MIN,
  UMBRAL_P_DOMINADA,
} from "./constantes.ts";
import { descendientes, type Dag } from "./dag.ts";
import {
  causaDeUnidad,
  errorNombrable,
  probabilidad,
  type EstadoDiagnostico,
} from "./motor.ts";
import type { CausaDiagnosticada, Eje } from "./tipos.ts";

/**
 * Cómo se pinta una unidad en el camino.
 *
 * `atenuada` es **visual y nada más**: la unidad se ve apagada porque hay algo
 * antes sin dominar, pero el alumno igual puede entrar. Bloquear contenido por
 * puntaje está en la lista negra del MOS y no se construye.
 */
export type EstadoUnidadPlan = "dominada-inferida" | "disponible" | "atenuada";

export type UnidadDelPlan = {
  unidadId: string;
  nombre: string;
  eje: Eje;
  /** Probabilidad de dominio inferida, en [0, 1]. */
  p: number;
  estado: EstadoUnidadPlan;
  causa: CausaDiagnosticada | null;
  /** Id del error, solo si la causa es `error-confirmado`. Si no, `null`. */
  errorNombrable: string | null;
};

export type BandaPuntaje = {
  min: number;
  max: number;
};

export type PlanDiagnostico = {
  unidades: UnidadDelPlan[];
  /** Por dónde conviene empezar, o `null` si no hay ninguna disponible. */
  raizRecomendada: string | null;
  bandaPuntaje: BandaPuntaje;
  /**
   * El alumno no mostró ninguna brecha: respondió lo suficiente, todo salió
   * dominado y no falló nada. Es una salida propia, no un diagnóstico corto:
   * la UI felicita y da camino libre en vez de seguir preguntando.
   */
  sinBrechas: boolean;
};

/**
 * Banda de puntaje estimada a partir de la proporción de unidades dominadas.
 *
 * **Placeholder honesto:** una recta de `PUNTAJE_MIN` a `PUNTAJE_MAX` con
 * ±`AMPLITUD_BANDA_PUNTAJE` de ancho. No hay ninguna evidencia de que el
 * puntaje sea lineal en la proporción de unidades dominadas, y una fórmula más
 * elaborada solo escondería que el dato de base no existe.
 *
 * TODO: recalibrar con datos de corte DEMRE oficiales.
 */
export function estimarBanda(proporcionDominadas: number): BandaPuntaje {
  const proporcion = Math.min(1, Math.max(0, proporcionDominadas));
  const centro = Math.round(PUNTAJE_MIN + proporcion * (PUNTAJE_MAX - PUNTAJE_MIN));
  return {
    min: Math.max(PUNTAJE_MIN, centro - AMPLITUD_BANDA_PUNTAJE),
    max: Math.min(PUNTAJE_MAX, centro + AMPLITUD_BANDA_PUNTAJE),
  };
}

/** Arma el plan completo a partir del estado final del diagnóstico. */
export function generarPlan(estado: EstadoDiagnostico, dag: Dag): PlanDiagnostico {
  const p = new Map<string, number>();
  for (const [id, unidad] of estado.unidades) {
    p.set(id, probabilidad(unidad.logOdds));
  }

  const dominada = (id: string): boolean => p.get(id)! >= UMBRAL_P_DOMINADA;

  const unidades: UnidadDelPlan[] = dag.unidades.map((unidad) => {
    const estadoUnidad = estado.unidades.get(unidad.id)!;
    return {
      unidadId: unidad.id,
      nombre: unidad.nombre,
      eje: unidad.eje,
      p: p.get(unidad.id)!,
      estado: estadoDeUnidad(unidad.id, unidad.prerrequisitos, dominada),
      causa: causaDeUnidad(estadoUnidad),
      errorNombrable: errorNombrable(estadoUnidad),
    };
  });

  const proporcionDominadas =
    unidades.filter((u) => u.estado === "dominada-inferida").length / unidades.length;

  return {
    unidades,
    raizRecomendada: elegirRaiz(unidades, dag),
    bandaPuntaje: estimarBanda(proporcionDominadas),
    sinBrechas:
      estado.itemsVistos >= MIN_ITEMS &&
      unidades.every((u) => u.p >= UMBRAL_P_DOMINADA) &&
      [...estado.unidades.values()].every((u) => u.fallos.length === 0),
  };
}

function estadoDeUnidad(
  id: string,
  prerrequisitos: string[],
  dominada: (id: string) => boolean,
): EstadoUnidadPlan {
  if (dominada(id)) return "dominada-inferida";
  return prerrequisitos.every(dominada) ? "disponible" : "atenuada";
}

/**
 * Entre las unidades `disponible`, la que más descendientes desbloquea en el
 * DAG. Empate: la del eje con más unidades débiles, porque ahí el mismo
 * esfuerzo rinde más. Empate perfecto: orden de declaración del DAG.
 */
function elegirRaiz(unidades: UnidadDelPlan[], dag: Dag): string | null {
  const candidatas = unidades.filter((u) => u.estado === "disponible");
  if (candidatas.length === 0) return null;

  const debilesPorEje = new Map<Eje, number>();
  for (const unidad of unidades) {
    if (unidad.p >= UMBRAL_P_DOMINADA) continue;
    debilesPorEje.set(unidad.eje, (debilesPorEje.get(unidad.eje) ?? 0) + 1);
  }

  const mejor = candidatas.reduce((actualMejor, actual) => {
    const desbloqueaActual = descendientes(dag, actual.unidadId).size;
    const desbloqueaMejor = descendientes(dag, actualMejor.unidadId).size;
    if (desbloqueaActual !== desbloqueaMejor) {
      return desbloqueaActual > desbloqueaMejor ? actual : actualMejor;
    }
    const debilesActual = debilesPorEje.get(actual.eje) ?? 0;
    const debilesMejor = debilesPorEje.get(actualMejor.eje) ?? 0;
    return debilesActual > debilesMejor ? actual : actualMejor;
  });

  return mejor.unidadId;
}
