import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * El catálogo canónico de errores de un módulo, leído de
 * `content/errores/<moduloId>.json`.
 *
 * Es la fuente única del catálogo desde la migración a canónico único: el array
 * `catalogoErrores` embebido en cada archivo de contenido queda como legado
 * mientras la migración avanza, y `lib/sanitizar.ts` lo usa solo de respaldo.
 *
 * POR QUÉ EXISTE. `catalogoDe()` en `lib/sanitizar.ts` construía el Map
 * únicamente desde `contenido.catalogoErrores`, así que un archivo sin catálogo
 * embebido no resolvía nada y la Capa 2 del feedback quedaba muda sin avisar.
 * Eran 266 de los 864 portadores de `errorCatalogado` del repo, el módulo
 * Porcentaje completo entre ellos.
 *
 * FORMA DE LOS IDS. El artefacto guarda ids con prefijo de unidad
 * (`"porcentaje/error-7"`), que es lo que exige la regla 6e de
 * `scripts/validar-contenido.mjs` para los ítems de diagnóstico. Las referencias
 * dentro de lecciones y cierres son locales (`"error-7"`), y así se quedan: el
 * prefijo se quita acá, al construir el Map, así que la clave de búsqueda es el
 * id pelado y `errorCatalogado` nunca cambia de forma en el contenido.
 *
 * Eso último no es cosmético. `rotuloDeError` en `lib/progresoSesion.ts` hace
 * `/^error-(\d+)$/.exec(...)` sobre el valor de `errorCatalogado` para rotular
 * "Error 07" en pantalla, y cae a mostrar el id crudo si no calza. Si la forma
 * prefijada llegara hasta ahí, el estudiante leería "porcentaje/error-7".
 *
 * SOLO SERVIDOR. Este módulo lee disco. Nada que corra en el cliente puede
 * importarlo con un import de valor.
 */
export function catalogoDelModulo(moduloId: string | undefined): Map<string, string> {
  const catalogo = new Map<string, string>();
  if (!moduloId) return catalogo;

  /* Sin caché a propósito, igual que `lib/contenido.ts`, que relee cada archivo
     en cada llamada: son 16 entradas como máximo, y cachear haría que editar un
     catálogo en desarrollo no se viera hasta reiniciar. */
  const ruta = path.join(process.cwd(), "content", "errores", `${moduloId}.json`);
  if (!existsSync(ruta)) return catalogo;

  const data = JSON.parse(readFileSync(ruta, "utf8")) as {
    unidad?: string;
    errores?: { id?: unknown; descripcion?: unknown }[];
  };

  const prefijo = `${moduloId}/`;
  for (const entrada of data.errores ?? []) {
    if (typeof entrada?.id !== "string" || typeof entrada?.descripcion !== "string") continue;
    const local = entrada.id.startsWith(prefijo) ? entrada.id.slice(prefijo.length) : entrada.id;
    catalogo.set(local, entrada.descripcion);
  }
  return catalogo;
}
