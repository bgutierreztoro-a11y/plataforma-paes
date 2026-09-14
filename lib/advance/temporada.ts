/**
 * Temporada de Fobos Advance (docs/fobos-advance.md §0, modelo comercial, y
 * §4 F3, tarea 3.4). Puro: sin React, sin acceso a datos y sin reloj. El
 * instante entra como parámetro en milisegundos, igual que en dominio.ts.
 *
 * NO HAY TABLA `temporada` (decisión 2026-09-14, registrada en §4 F3). El
 * boceto de §3.4 la dibujaba con `usuario_id, inicio, fin, estado`, y eso es
 * exactamente una fila de `entitlements` (004): producto de Advance,
 * `vigencia_desde` al contratar, `vigencia_hasta` al terminar. Una tabla
 * aparte duplicaría el control de acceso, que por la 004 pasa solo por
 * `lib/datos/entitlements.ts`, y un `estado` guardado quedaría viejo en cuanto
 * pasara `fin`, el mismo motivo por el que no se persiste el veredicto del
 * triage ni la fase de un error. Acá el estado se deriva de las fechas en
 * cada lectura.
 *
 * QUIÉN LO CONSUME. `estadoAdvance()` (lib/advance/acceso.ts), cuando en F3
 * pase de la variable de entorno a Clerk más base (§2.2): leerá las vigencias
 * del producto de Advance con `vigenciasDe` y las traducirá con esta función,
 * sin cambiar su firma. Ese cableado espera 3.1 (Clerk en producción, Benja)
 * y el id del producto de Advance, pendiente de firma en §11; por eso el
 * producto no está escrito en este módulo.
 */
import type { EstadoAdvance } from "./acceso";

/** Lo que este módulo necesita de una fila de `entitlements`. */
export interface Vigencia {
  vigencia_desde: Date;
  /** NULL es acceso perpetuo, no "fecha desconocida" (004). */
  vigencia_hasta: Date | null;
}

/**
 * Estado de la temporada a partir de todas las vigencias del estudiante para
 * el producto de Advance. Mismos bordes que `tieneAcceso()`: una vigencia
 * cuenta desde `vigencia_desde` inclusive y hasta `vigencia_hasta` exclusive.
 *
 * Orden de decisión: una vigente da `activo`, aunque otra haya vencido; sin
 * vigente, una vencida da `temporada-terminada`; sin ninguna de las dos
 * (nunca contrató, o solo tiene una que todavía no empieza), `sin-acceso`.
 */
export function estadoTemporada(
  vigencias: readonly Vigencia[],
  ahoraMs: number,
): EstadoAdvance {
  let terminada = false;
  for (const v of vigencias) {
    const desde = v.vigencia_desde.getTime();
    const hasta = v.vigencia_hasta === null ? null : v.vigencia_hasta.getTime();
    if (desde > ahoraMs) continue;
    if (hasta === null || hasta > ahoraMs) return "activo";
    terminada = true;
  }
  return terminada ? "temporada-terminada" : "sin-acceso";
}
