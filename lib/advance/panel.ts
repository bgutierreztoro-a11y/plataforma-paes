import type { Habilidad } from "../tipos.ts";

/**
 * Panel 2×2 (docs/fobos-advance.md §6.2): cruce de acierto con tiempo, usando
 * el `tiempoReferenciaSeg` de cada ítem. Puro: sin React, sin acceso a datos,
 * sin reloj. Quien llama arma un `IntentoClasico` por intento; acá no hay SQL.
 *
 * REQUIERE MODO CLÁSICO. Con descarte, "correcto" no tiene definición limpia y
 * el cuadrante de error conceptual queda vacío por diseño (§4 F4, 4.1, decisión
 * del 2026-09-12). Por eso este módulo no tiene llamador en producción: ninguna
 * tabla de hoy produce un `IntentoClasico`. Solo lo monta la galería `/_design`
 * con datos de muestra, mismo precedente que `listarTriageDeUsuario` y
 * `estadoAdvance` (sin consumidor hasta que exista lo que los alimenta).
 *
 * REGLA DE HONESTIDAD (§6.2): no clasificar con menos de 3 intentos en la
 * habilidad. Un ítem lento no hace a nadie frágil. Con menos, el panel es
 * `sin-clasificar` y no expone conteos parciales: si los expusiera, una
 * pantalla podría mostrarlos igual y la regla quedaría en el papel.
 *
 * LO QUE §6.2 NO DEFINE, elegido por lo más simple y SIN CALIBRAR:
 * - Frontera: `tiempoMs <= tiempoReferenciaSeg * 1000` es "dentro del tiempo".
 *   Justo en la referencia cuenta como dentro.
 * - Dominante de la habilidad: el cuadrante con más intentos. En empate gana el
 *   peor, en el orden de `CUADRANTES` (bloqueo, error conceptual, frágil,
 *   dominado): nunca se declara dominio que los datos no sostengan.
 * Los dos se calibran con datos reales del modo clásico cuando exista.
 */

/** Del peor al mejor. El orden es parte del contrato: sostiene el desempate. */
export const CUADRANTES = ["bloqueo", "error-conceptual", "fragil", "dominado"] as const;

export type Cuadrante = (typeof CUADRANTES)[number];

/** §6.2: mínimo de intentos en la habilidad para clasificar. */
export const MINIMO_INTENTOS = 3;

/** Un intento del modo clásico: una alternativa elegida, con el tiempo que tomó. */
export interface IntentoClasico {
  correcto: boolean;
  tiempoMs: number;
  /** Del ítem, no de la sesión: cada ítem trae el suyo (§5.2, §11.4). */
  tiempoReferenciaSeg: number;
}

export interface IntentoConHabilidad extends IntentoClasico {
  habilidad: Habilidad;
}

export function cuadranteDeIntento(intento: IntentoClasico): Cuadrante {
  /* SIN CALIBRAR: la igualdad cuenta como dentro del tiempo. */
  const dentroDelTiempo = intento.tiempoMs <= intento.tiempoReferenciaSeg * 1000;
  if (intento.correcto) return dentroDelTiempo ? "dominado" : "fragil";
  return dentroDelTiempo ? "error-conceptual" : "bloqueo";
}

export type PanelDeHabilidad =
  | { estado: "sin-clasificar"; intentos: number }
  | {
      estado: "clasificado";
      intentos: number;
      /** Los cuatro cuadrantes siempre presentes; suman `intentos`. */
      porCuadrante: Record<Cuadrante, number>;
      dominante: Cuadrante;
    };

export function panelDeHabilidad(intentos: readonly IntentoClasico[]): PanelDeHabilidad {
  if (intentos.length < MINIMO_INTENTOS) return { estado: "sin-clasificar", intentos: intentos.length };

  const porCuadrante: Record<Cuadrante, number> = { bloqueo: 0, "error-conceptual": 0, fragil: 0, dominado: 0 };
  for (const intento of intentos) porCuadrante[cuadranteDeIntento(intento)] += 1;

  /* SIN CALIBRAR: `CUADRANTES` va del peor al mejor y `>` conserva el primero
     en empate, así que el peor gana. */
  let dominante: Cuadrante = CUADRANTES[0];
  for (const cuadrante of CUADRANTES) {
    if (porCuadrante[cuadrante] > porCuadrante[dominante]) dominante = cuadrante;
  }

  return { estado: "clasificado", intentos: intentos.length, porCuadrante, dominante };
}

const HABILIDADES: readonly Habilidad[] = ["resolver", "modelar", "representar", "argumentar"];

/** Un panel por habilidad, las cuatro siempre: sin intentos, `sin-clasificar` con 0. */
export function panelPorHabilidad(
  intentos: readonly IntentoConHabilidad[],
): Record<Habilidad, PanelDeHabilidad> {
  const porHabilidad = new Map<Habilidad, IntentoClasico[]>(HABILIDADES.map((h) => [h, []]));
  for (const intento of intentos) porHabilidad.get(intento.habilidad)?.push(intento);
  return Object.fromEntries(
    HABILIDADES.map((h) => [h, panelDeHabilidad(porHabilidad.get(h) ?? [])]),
  ) as Record<Habilidad, PanelDeHabilidad>;
}
