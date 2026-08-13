/**
 * En qué punto de producción está un módulo del temario.
 *
 * Se **deriva del disco** en build time, no se declara a mano en
 * `lib/modulos.ts`: un campo manual sería una segunda fuente de verdad que
 * deriva de la real, que es justo el fallo que `verificarRegistroDeTemas()`
 * existe para impedir.
 *
 * - `completo`: las 3 lecciones declaradas existen en disco y validan.
 * - `en-preparacion`: hay al menos una en disco, pero faltan archivos.
 * - `sin-contenido`: ninguna tiene archivo todavía. El camino lo muestra
 *   bloqueado ("Pronto") en vez de esconderlo: el temario completo se ve desde
 *   el primer día, con lo construido y lo que falta a la vista.
 *
 * Vive en su propio archivo, sin imports, por dos razones: es lógica pura sin
 * disco, y así `node --test` puede importarlo. `lib/camino.ts` no es
 * importable desde un test porque sus imports internos no llevan extensión
 * —los resuelve el bundler de Next, no el runtime de Node.
 */
export type EstadoModulo = "completo" | "en-preparacion" | "sin-contenido";

/**
 * `declaradas` es cuántas lecciones planea el registro para el módulo;
 * `resueltas`, las que existen en disco y son válidas.
 *
 * Comparar las dos cantidades es todo el criterio desde que se eliminó el
 * sistema de `estado` (2026-08-12): un archivo que existe y valida es contenido
 * terminado, porque ya no hay borradores en `content/`. Lo único que puede
 * faltar es el archivo mismo, y eso es exactamente lo que mide el denominador:
 * un módulo con 2 de 3 archivos escritos no está completo aunque los dos que
 * hay estén perfectos.
 */
export function estadoDelModulo(declaradas: number, resueltas: readonly unknown[]): EstadoModulo {
  if (resueltas.length === 0) return "sin-contenido";
  return resueltas.length === declaradas ? "completo" : "en-preparacion";
}
