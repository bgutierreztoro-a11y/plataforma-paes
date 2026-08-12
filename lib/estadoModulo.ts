/**
 * En qué punto de producción está un módulo del temario.
 *
 * Se **deriva del disco** en build time, no se declara a mano en
 * `lib/modulos.ts`: un campo manual sería una segunda fuente de verdad que
 * deriva de la real, que es justo el fallo que `verificarRegistroDeTemas()`
 * existe para impedir.
 *
 * - `completo`: las 3 lecciones declaradas existen y las 3 son publicables.
 * - `en-preparacion`: hay al menos una en disco, pero no están todas listas.
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
 * Se comparan las dos cantidades y no solo se pregunta `every(publicable)`:
 * un módulo a medio escribir —2 de 3 archivos, ambos publicables— tiene todas
 * sus lecciones *resueltas* publicables y aun así no está completo. Sin el
 * denominador, `every()` sobre un array corto respondería que sí, y el módulo
 * se anunciaría terminado con un tercio sin escribir.
 */
export function estadoDelModulo(
  declaradas: number,
  resueltas: readonly { publicable: boolean }[],
): EstadoModulo {
  if (resueltas.length === 0) return "sin-contenido";
  const todasListas =
    resueltas.length === declaradas && resueltas.every((l) => l.publicable);
  return todasListas ? "completo" : "en-preparacion";
}
