/**
 * Estado de un nodo del camino, derivado del progreso guardado en el
 * dispositivo. Módulo puro: recibe el progreso ya leído, no toca localStorage.
 * Eso lo hace testeable y evita que cada nodo dispare su propia lectura.
 */
import type { TemaDelCamino, LeccionDelTema } from "./camino";
import { alcanzaDominio } from "./umbrales";
import type { ProgresoLocal } from "./datos/progreso";

export type EstadoNodo =
  | "completado"
  | "porRepasar"
  | "enCurso"
  | "disponible"
  | "enConstruccion";

/** Lo que hace falta saber del historial de intentos para pintar el camino,
 *  recorrido una sola vez en vez de una por nodo. */
export interface ResumenRespuestas {
  /** contextoId → aciertos al primer intento. */
  aciertos: Map<string, number>;
  /** contextoId → ids de ítem distintos respondidos, para saber si un set
   *  (diagnóstico, cierre) se rindió entero y no solo se abrió. */
  itemsRespondidos: Map<string, Set<string>>;
}

export function resumirRespuestas(progreso: ProgresoLocal | null): ResumenRespuestas {
  const primeros = new Map<string, Map<string, boolean>>();
  const itemsRespondidos = new Map<string, Set<string>>();

  for (const r of progreso?.respuestas ?? []) {
    if (!itemsRespondidos.has(r.contextoId)) itemsRespondidos.set(r.contextoId, new Set());
    itemsRespondidos.get(r.contextoId)!.add(r.itemId);

    if (r.intento !== 1) continue;
    if (!primeros.has(r.contextoId)) primeros.set(r.contextoId, new Map());
    const porItem = primeros.get(r.contextoId)!;
    // Un ítem puede aparecer más de una vez con intento 1 si el estudiante
    // rehizo la lección entera. Gana el primero registrado.
    if (!porItem.has(r.itemId)) porItem.set(r.itemId, r.correcta);
  }

  const aciertos = new Map<string, number>();
  for (const [contextoId, porItem] of primeros) {
    let n = 0;
    for (const correcta of porItem.values()) if (correcta) n++;
    aciertos.set(contextoId, n);
  }
  return { aciertos, itemsRespondidos };
}

/** Cuántas de las lecciones **declaradas** del tema quedaron completadas, y
 *  cuántas hay en total. Es el avance que se muestra en el nodo. */
export function avanceDeTema(
  tema: TemaDelCamino,
  progreso: ProgresoLocal | null,
): { hechas: number; total: number } {
  const completadas = new Set(
    (progreso?.lecciones ?? []).filter((l) => l.completada).map((l) => l.leccionId),
  );
  return {
    hechas: tema.lecciones.filter((l) => completadas.has(l.id)).length,
    total: tema.lecciones.length,
  };
}

/**
 * Reglas, en este orden:
 *
 * 1. Ninguna lección abierta → **en construcción**.
 * 2. Alguna lección hecha quedó bajo el umbral → **por repasar**. Va antes que
 *    "completado" a propósito: una deuda pedagógica pendiente pesa más que
 *    haber recorrido todo el material.
 * 3. **Completado** exige las tres cosas: que *todas* las lecciones declaradas
 *    en `lib/temas.ts` estén publicables, que todas estén completadas, y que el
 *    cierre del tema —si lo tiene— se haya rendido entero.
 * 4. Hay avance pero no alcanza para completar → **en curso**.
 * 5. Si no → **disponible**.
 *
 * El paso 3 es el que impide celebrar de más. Filtrar por "publicable" antes de
 * evaluar —como hacía la primera versión— hacía que un tema con una lección
 * abierta y otra en borrador se diera por terminado al hacer la primera: el
 * estudiante veía "Tema completado" tras 1 de 2 lecciones. Son 16 celebraciones
 * en todo el curso y son idempotentes, así que gastar una en falso significa
 * que el estudiante nunca vería la de verdad cuando la lección que falta se
 * publique.
 *
 * Una lección sin ítems PAES no aporta evidencia de dominio y se omite del paso
 * 2 en vez de arrastrar el nodo a "por repasar": ausencia de datos no es
 * evidencia de flaqueza. Regla general — nunca inventar progreso.
 */
export function estadoDeNodo(
  tema: TemaDelCamino,
  progreso: ProgresoLocal | null,
  resumen: ResumenRespuestas,
): EstadoNodo {
  const declaradas = tema.lecciones;
  const abiertas = declaradas.filter((l) => l.publicable);
  if (abiertas.length === 0) return "enConstruccion";

  const completadas = new Set(
    (progreso?.lecciones ?? []).filter((l) => l.completada).map((l) => l.leccionId),
  );
  const hechas = abiertas.filter((l) => completadas.has(l.id));

  const flojas = hechas.filter(
    (l) =>
      l.totalItemsPAES > 0 &&
      !alcanzaDominio(resumen.aciertos.get(l.id) ?? 0, l.totalItemsPAES),
  );
  if (flojas.length > 0) return "porRepasar";

  const cierreRendido =
    !tema.cierreId ||
    (tema.cierrePublicable &&
      (resumen.itemsRespondidos.get("cierre")?.size ?? 0) >= tema.cierreTotalItems);

  const completo =
    declaradas.every((l) => l.publicable) &&
    declaradas.every((l) => completadas.has(l.id)) &&
    cierreRendido;
  if (completo) return "completado";

  return hechas.length > 0 ? "enCurso" : "disponible";
}

/**
 * Estado de una **lección** dentro de su tema. Mismas cinco etiquetas que el
 * nodo de tema, un nivel más abajo: el camino de temas y el camino de lecciones
 * hablan el mismo vocabulario visual, así que también tienen que hablar el
 * mismo vocabulario de estados.
 *
 * El orden de las reglas es el de `estadoDeNodo` y por las mismas razones:
 * "por repasar" va antes que "completado" porque una deuda pedagógica pendiente
 * pesa más que haber recorrido el material, y una lección sin ítems PAES no
 * aporta evidencia de dominio, así que no se arrastra a ámbar por falta de
 * datos.
 *
 * "En curso" acá significa algo más fino que en el tema: hay un paso empezado
 * dentro de la lección. Es el dato que ya guarda `pasoActual`, sin inventar
 * ninguno nuevo.
 */
export function estadoDeLeccion(
  leccion: LeccionDelTema,
  progreso: ProgresoLocal | null,
  resumen: ResumenRespuestas,
): EstadoNodo {
  if (!leccion.publicable) return "enConstruccion";

  const guardada = (progreso?.lecciones ?? []).find((l) => l.leccionId === leccion.id);

  if (guardada?.completada) {
    const flojo =
      leccion.totalItemsPAES > 0 &&
      !alcanzaDominio(resumen.aciertos.get(leccion.id) ?? 0, leccion.totalItemsPAES);
    return flojo ? "porRepasar" : "completado";
  }

  return (guardada?.pasoActual ?? 0) > 0 ? "enCurso" : "disponible";
}

/**
 * Estado del **cierre** del tema, que no es una lección: es `tipo: "cierre"`,
 * vive en su propia ruta y su evidencia de término es haber respondido todos
 * sus ítems, no un flag `completada`.
 *
 * Por eso no reusa `estadoDeLeccion`: "abrí el cierre" no es "rendí el cierre",
 * y la única forma de distinguirlo es contar ítems distintos respondidos contra
 * el total que trae el contenido. Es el mismo criterio que ya aplica
 * `estadoDeNodo` para decidir si un tema está completo.
 *
 * **Nunca devuelve "en construcción", aunque el cierre no sea publicable.** Un
 * cierre en `revision` está escrito y es navegable: el producto ya decidió
 * (2026-07-25, docs/pendientes.md) que se puede entrar avisando antes que es
 * una demostración. "En construcción" significa que el contenido no existe
 * todavía (MASTER.md §3.2) y acá sí existe, así que pintarlo así mentiría y
 * además le quitaría al estudiante un acceso que hoy tiene. Que sea
 * demostración se comunica aparte, con su propio chip.
 */
export function estadoDelCierre(
  tema: TemaDelCamino,
  resumen: ResumenRespuestas,
): EstadoNodo {
  const respondidos = resumen.itemsRespondidos.get("cierre")?.size ?? 0;
  if (tema.cierreTotalItems > 0 && respondidos >= tema.cierreTotalItems) return "completado";
  return respondidos > 0 ? "enCurso" : "disponible";
}

/** Cuántos temas del temario están completados. Denominador: `TOTAL_TEMAS`. */
export function temasCompletados(
  temas: TemaDelCamino[],
  progreso: ProgresoLocal | null,
): number {
  const resumen = resumirRespuestas(progreso);
  return temas.filter((t) => estadoDeNodo(t, progreso, resumen) === "completado").length;
}
