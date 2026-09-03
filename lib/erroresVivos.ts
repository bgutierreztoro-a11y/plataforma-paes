/**
 * Los "errores vivos" de la sesión para la pantalla 10 (`/errores`): cada error
 * catalogado en el que se cayó en esta pestaña, con su conteo, del más repetido
 * al menos.
 *
 * Trabaja **solo con el estado de la sesión** —la instantánea que entrega
 * `lib/progresoSesion.ts:ocurrenciasDeErrorDeSesion()`, que vive en memoria de
 * módulo y arranca vacía en cada carga—. No lee `localStorage` ni ninguna otra
 * fuente persistida.
 *
 * Por eso una fila lleva `titulo` y `veces`, y nada más:
 * - **Sin id.** El conteo de sesión se cuña por la descripción resuelta, no por
 *   el id del catálogo, que es local al archivo
 *   (`docs/deuda-catalogo-errores-crossfile.md`). No hay un número de dos
 *   dígitos estable que poner en el chip de la referencia.
 * - **Sin línea/eje.** El error se cuenta suelto, sin su lección de origen, así
 *   que no hay de dónde derivar "línea 0N".
 * Ambos huecos están registrados en `docs/deuda-errores-vivos.md`.
 *
 * `agruparErroresDelCierre` (`lib/erroresDelCierre.ts`) **no se reutiliza**:
 * opera sobre una única corrida de cierre (`items` + `respuestas` del reducer de
 * `estadoSetItems`), devuelve `numerosDeItem` de esa corrida —no un conteo de
 * sesión que cruza lecciones y cierres— y necesita datos que esta pantalla no
 * recibe.
 */

export interface ErrorVivo {
  /** El texto del error, tal como lo copia el catálogo del módulo. */
  titulo: string;
  /** Veces que cayó en él en esta sesión. Siempre >= 1. */
  veces: number;
}

/**
 * Ordena los errores de la sesión de más a menos repetidos. A igualdad de
 * `veces` conserva el orden de entrada —que es el orden en que aparecieron por
 * primera vez, tal como lo entrega el getter— apoyándose en que `Array.sort` es
 * estable (garantizado desde ES2019). Descarta entradas sin texto o con conteo
 * bajo cero por si la fuente alguna vez las trae; hoy no puede.
 */
export function erroresVivosDeSesion(
  ocurrencias: { descripcion: string; veces: number }[],
): ErrorVivo[] {
  return ocurrencias
    .filter((o) => o.veces >= 1 && o.descripcion.trim() !== "")
    .map((o) => ({ titulo: o.descripcion, veces: o.veces }))
    .sort((a, b) => b.veces - a.veces);
}
