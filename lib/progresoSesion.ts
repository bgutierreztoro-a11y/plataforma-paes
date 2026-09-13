/* Estado de la sesión actual, SOLO en memoria de módulo (cliente). Sobrevive a
   la navegación client-side y muere al recargar la página.

   El comentario anterior decía que MOS §7.5 prohibía localStorage. Eso dejó de
   ser cierto el 2026-07-23: la enmienda de esa sección autoriza persistir
   desempeño pedagógico bajo una única clave versionada, y esa capa vive ahora
   en lib/progresoLocal.ts. El avance por lección se mudó allá.

   Lo que queda acá es lo que corresponde que muera con la pestaña: el resultado
   del diagnóstico se usa para la comparación pre/post dentro de una misma
   sesión (MOS §6) y no necesita sobrevivir a un reload. */

/* Resultado del diagnóstico de esta misma sesión, para la comparación
   pre/post del cierre (MOS §6). null si no se rindió en esta sesión. */

interface ResultadoSet {
  aciertos: number;
  total: number;
}

let resultadoDiagnostico: ResultadoSet | null = null;

export function guardarResultadoDiagnostico(resultado: ResultadoSet) {
  resultadoDiagnostico = resultado;
}

export function obtenerResultadoDiagnostico(): ResultadoSet | null {
  return resultadoDiagnostico;
}

/* Cuántas veces cayó el estudiante en cada error catalogado durante ESTA sesión.
   Alimenta el "te ha pasado N veces" del banner de error (TarjetaError).

   **Vive acá y no en progresoLocal.ts a propósito.** Persistirlo entre sesiones
   exigiría guardar el error junto a la respuesta, y hoy `RespuestaLocal.valor`
   solo guarda la clave elegida (A–D): reconstruir el error desde ahí obliga a
   cargar el catálogo de la lección de origen, que es server-only. Mientras eso
   no exista, el conteo muere con la pestaña — y el copy lo respeta: la frase
   solo aparece a partir de la segunda vez, así que nunca se afirma una memoria
   más larga que la que hay. Subcontar es conservador; sobreprometerle a un
   menor de edad que la plataforma "lleva la cuenta" no lo sería.

   ## Por qué la clave es la descripción y no el id

   Los ids del catálogo (`deshace-porcentaje-con-mismo-porcentaje`) son **locales al archivo**: el mismo id
   nombra errores distintos en dos lecciones (ver
   `docs/deuda-catalogo-errores-crossfile.md`). Contar por id exigiría un espacio
   de nombres por archivo, y el dato que lo daría —`contextoId`— hoy llega como
   la constante `"cierre"` para los once cierres (`components/Cierre.tsx:55`),
   así que fusionaría cierres distintos en un solo contador.

   La descripción resuelta no tiene ese problema: es el texto del catálogo, y
   `docs/reglas-modulo.md §5` obliga a copiarlo literalmente entre las lecciones
   de un módulo. Dos textos iguales SON el mismo error, en cualquier archivo —
   que es justo lo que hace que el conteo signifique algo para el estudiante:
   cuenta el mecanismo, no la pregunta. */
const ocurrenciasPorError = new Map<string, number>();

/** Suma una ocurrencia y devuelve el total de la sesión, ya incluyéndola. */
export function registrarOcurrenciaDeError(descripcionError: string): number {
  const total = (ocurrenciasPorError.get(descripcionError) ?? 0) + 1;
  ocurrenciasPorError.set(descripcionError, total);
  return total;
}

/** Solo para los tests: la sesión real nunca se reinicia a mano. */
export function reiniciarOcurrenciasDeError() {
  ocurrenciasPorError.clear();
}

/**
 * Instantánea de los errores de ESTA sesión: `{ descripcion, veces }` por cada
 * error catalogado en el que se cayó, en el orden en que aparecieron por primera
 * vez. Solo lectura — no expone el `Map`.
 *
 * La usa la pantalla 10 (`/errores`) para armar la lista de "errores vivos".
 * Devuelve `[]` tras un reload, y eso es lo correcto: el conteo vive en memoria
 * de módulo y no sobrevive (ver la nota de `ocurrenciasPorError`). La pantalla
 * pinta ese vacío como estado honesto, no lo rellena.
 */
export function ocurrenciasDeErrorDeSesion(): { descripcion: string; veces: number }[] {
  return [...ocurrenciasPorError].map(([descripcion, veces]) => ({ descripcion, veces }));
}

/**
 * El rótulo en versalitas del banner de error: `deshace-porcentaje-con-mismo-porcentaje`
 * + 3 → `Deshace porcentaje con mismo porcentaje, te ha pasado 3 veces`. Va en
 * minúsculas salvo la inicial; el `uppercase` lo pone `TarjetaError`.
 *
 * **El conteo solo se nombra a partir de la segunda vez.** Con una sola
 * ocurrencia el rótulo es la referencia a secas: decir "te ha pasado 1 vez" no
 * agrega información y convierte un dato en una etiqueta. Y el conteo es de la
 * sesión, así que puede quedar por debajo del real — nunca por encima: ver la
 * nota de `ocurrenciasPorError`, acá arriba.
 *
 * Desde la migración a slugs (2026-09-13, `docs/analisis/mapa-migracion-ids.json`)
 * el id ya no es un número: es un slug descriptivo, único en toda la plataforma.
 * La referencia es el `titulo` del catálogo cuando la pantalla lo tiene (hoy
 * solo porcentaje) y, si no, el slug humanizado: inicial en mayúscula y guiones
 * como espacios. Antes era "Error 07"; el rótulo sigue siendo una referencia
 * para volver a encontrar el error, pegada a su descripción en la misma tarjeta.
 */
export function rotuloDeError(errorCatalogado: string, ocurrencias: number, titulo?: string): string {
  const referencia = titulo?.trim() ? titulo.trim() : humanizarSlug(errorCatalogado);
  return ocurrencias >= 2 ? `${referencia}, te ha pasado ${ocurrencias} veces` : referencia;
}

/** `suma-denominadores` → `Suma denominadores`. Un id que no sea slug se devuelve tal cual. */
export function humanizarSlug(slug: string): string {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return slug;
  const texto = slug.replace(/-/g, " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
