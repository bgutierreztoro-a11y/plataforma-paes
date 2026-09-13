import type { ItemAdvance } from "./descarte.ts";
import type { EstadoDeError, FaseError } from "./dominio.ts";
import { seleccionarSesion } from "./seleccion.ts";

/**
 * Motor del triage de 20 segundos (docs/fobos-advance.md §6.5, F5a). Puro:
 * sin React, sin reloj propio, sin disco. Quien lo monta le pasa los instantes
 * (D4) y decide qué hacer con los registros.
 *
 * Se muestra un ítem, 20 segundos, tres decisiones: la resuelvo, la dejo, la
 * marco y sigo. No se resuelve nada. Si el tiempo se acaba sin tocar, se
 * registra `sin-decision` con `ms = LIMITE_MS` y no se convierte en "dejo"
 * (D16).
 *
 * El veredicto (D17) se calcula en runtime contra el historial propio, es
 * decir contra la fase de cada error del catálogo que `dominio.ts` deriva de
 * `advance_descartes`, y nunca se guarda: la tabla `advance_triage` conserva
 * la decisión y el tiempo, nada más. Sin datos suficientes el veredicto es
 * `sin-veredicto`; nunca se inventa uno.
 *
 * "Recaída" en D17: `dominio.ts` no tiene una fase de recaída. La recaída es
 * `recaidas >= 1` y deja la fase en `abierto`, así que "abierto o en recaída"
 * es, en código, `fase === "abierto"`.
 */

/* ---------- tipos ---------- */

export type Decision = "resuelvo" | "dejo" | "marco" | "sin-decision";

export type Veredicto = "lectura-buena" | "lectura-a-revisar" | "punto-regalado" | "sin-veredicto";

export const DECISIONES: readonly Decision[] = ["resuelvo", "dejo", "marco", "sin-decision"];

/** Ítems por sesión: el banco piloto entero, mezclado. Tope al tamaño del banco. */
export const ITEMS_POR_TRIAGE = 20;

/** Los 20 segundos, en ms. Es también el `ms` que se registra al agotarse (D16). */
export const LIMITE_MS = 20_000;

/** Lo que se registra por ítem, exacto de D15. */
export interface RegistroTriage {
  itemId: string;
  decision: Decision;
  ms: number;
}

/**
 * La fase de cada error del catálogo, por id local, y nada más: es la
 * proyección de `EstadoDeError[]` que cruza la frontera servidor → cliente.
 * Sin p(L) (D10) ni contadores. Un id ausente se trata como `sin-datos`.
 */
export type FasesPorError = Readonly<Record<string, FaseError>>;

/* ---------- selección ---------- */

/**
 * Los ítems de una sesión de triage: `ITEMS_POR_TRIAGE` al azar del banco,
 * sin repetir, con las alternativas mezcladas. Misma mecánica que la sesión
 * de descarte (`seleccionarSesion`), que ya conserva `claveOriginal` y cae a
 * lib/mezclar.ts cuando `aleatorio` es `Math.random`. `aleatorio` se inyecta
 * para testear; en la ruta es `Math.random`.
 */
export function seleccionarItems(
  items: ItemAdvance[],
  aleatorio: () => number = Math.random,
): ItemAdvance[] {
  return seleccionarSesion(items, ITEMS_POR_TRIAGE, aleatorio);
}

/* ---------- fases ---------- */

export function fasesDe(estados: readonly EstadoDeError[]): FasesPorError {
  const fases: Record<string, FaseError> = {};
  for (const estado of estados) fases[estado.errorId] = estado.fase;
  return fases;
}

/* ---------- registros ---------- */

export function registroDecision(
  item: ItemAdvance,
  decision: Exclude<Decision, "sin-decision">,
  inicioMs: number,
  enMs: number,
): RegistroTriage {
  return { itemId: item.id, decision, ms: Math.round(enMs - inicioMs) };
}

/** Se agotaron los 20 s sin tocar. `ms` es el límite, no el instante real (D16). */
export function registroSinDecision(item: ItemAdvance): RegistroTriage {
  return { itemId: item.id, decision: "sin-decision", ms: LIMITE_MS };
}

/* ---------- veredicto (D17) ---------- */

function fasesDelItem(item: ItemAdvance, fases: FasesPorError): FaseError[] {
  return item.alternativas.flatMap((a) =>
    a.esCorrecta ? [] : [fases[a.errorCatalogado] ?? "sin-datos"],
  );
}

/**
 * Orden de evaluación, escrito así para que cada rama sea un test:
 * 1. `marco` no se evalúa: es una decisión de administración, no de lectura.
 * 2. `sin-decision` tampoco: no hubo lectura que juzgar.
 * 3. `resuelvo` con un error abierto entre los distractores: basta un dato
 *    firme para decir que la lectura fue mala, aunque el resto no tenga datos.
 * 4. `dejo` con los tres errores cerrados: regaló un punto.
 * 5. Algún distractor sin datos: no se puede decir "lectura buena" sobre lo
 *    que no se sabe.
 * 6. Lo demás es lectura buena.
 */
export function veredicto(decision: Decision, item: ItemAdvance, fases: FasesPorError): Veredicto {
  if (decision === "marco" || decision === "sin-decision") return "sin-veredicto";
  const delItem = fasesDelItem(item, fases);
  if (delItem.length === 0) return "sin-veredicto";
  if (decision === "resuelvo" && delItem.includes("abierto")) return "lectura-a-revisar";
  if (decision === "dejo" && delItem.every((f) => f === "cerrado")) return "punto-regalado";
  if (delItem.includes("sin-datos")) return "sin-veredicto";
  return "lectura-buena";
}

/** Ids de error abiertos entre los distractores del ítem, en el orden de las alternativas. */
export function erroresAbiertosDe(item: ItemAdvance, fases: FasesPorError): string[] {
  return item.alternativas.flatMap((a) =>
    !a.esCorrecta && fases[a.errorCatalogado] === "abierto" ? [a.errorCatalogado] : [],
  );
}

/* ---------- resumen (D18) ---------- */

export interface FilaResumenTriage {
  itemId: string;
  decision: Decision;
  ms: number;
  veredicto: Veredicto;
  /* Vacío salvo en `lectura-a-revisar`, donde trae al menos uno. */
  erroresAbiertos: string[];
}

export interface ResumenTriage {
  total: number;
  conVeredicto: number;
  filas: FilaResumenTriage[];
}

/**
 * Una fila por registro, en el orden de la sesión. Un registro cuyo ítem no
 * esté en `items` se omite: sin el ítem no hay distractores que evaluar.
 */
export function resumenTriage(
  registros: readonly RegistroTriage[],
  items: readonly ItemAdvance[],
  fases: FasesPorError,
): ResumenTriage {
  const porId = new Map(items.map((item) => [item.id, item]));
  const filas: FilaResumenTriage[] = [];
  for (const r of registros) {
    const item = porId.get(r.itemId);
    if (!item) continue;
    const v = veredicto(r.decision, item, fases);
    filas.push({
      itemId: r.itemId,
      decision: r.decision,
      ms: r.ms,
      veredicto: v,
      erroresAbiertos: v === "lectura-a-revisar" ? erroresAbiertosDe(item, fases) : [],
    });
  }
  return {
    total: filas.length,
    conVeredicto: filas.filter((f) => f.veredicto !== "sin-veredicto").length,
    filas,
  };
}

/* ---------- payload de evento (§8) ---------- */

export interface PayloadTriageDecision {
  item_id: string;
  decision: Decision;
  ms: number;
}

export function payloadTriageDecision(registro: RegistroTriage): PayloadTriageDecision {
  return { item_id: registro.itemId, decision: registro.decision, ms: registro.ms };
}
