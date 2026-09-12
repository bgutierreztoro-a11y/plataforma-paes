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
  /* Proyección de `catalogoCompletoDelModulo` (F4b): una sola lectura de disco
     para las dos vistas del catálogo, y la firma de esta se queda como está para
     que `SesionDescarte`, `ResultadoDescarte` y `lib/sanitizar.ts` no cambien. */
  const catalogo = new Map<string, string>();
  for (const [local, entrada] of catalogoCompletoDelModulo(moduloId)) {
    catalogo.set(local, entrada.descripcion);
  }
  return catalogo;
}

/** La pantalla de repaso de un error (F4b): tres textos para el estudiante, en este orden. */
export interface RepasoDeError {
  camino: string;
  correcto: string;
  ejemplo: string;
}

/**
 * Una entrada del catálogo canónico, completa. `descripcion` es la ficha de
 * autor (siempre está); `titulo`, `apoyo` y `repaso` son el copy para el
 * estudiante que introdujo F4b y hoy solo tiene porcentaje: por eso son
 * opcionales, y quien los muestra decide a qué cae cuando faltan.
 */
export interface EntradaError {
  /** Id local (`error-7`), la misma clave del Map; sin prefijo de unidad, por lo mismo que en `catalogoDelModulo`. */
  id: string;
  descripcion: string;
  titulo?: string;
  apoyo?: string;
  repaso?: RepasoDeError;
}

const CAMPOS_REPASO = ["camino", "correcto", "ejemplo"] as const;

function esTexto(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Las entradas completas del catálogo canónico del módulo, por id local.
 *
 * Misma ruta, mismo recorte de prefijo y misma tolerancia que
 * `catalogoDelModulo`: una entrada sin `id` o `descripcion` de texto se omite,
 * y un `titulo`, `apoyo` o `repaso` malformado se deja fuera de la entrada en
 * vez de reventar la pantalla. Quien detecta lo malformado es
 * `validarDatosCatalogoErrores` en `npm run validar`, no el runtime.
 *
 * SOLO SERVIDOR, como todo este módulo.
 */
export function catalogoCompletoDelModulo(moduloId: string | undefined): Map<string, EntradaError> {
  const catalogo = new Map<string, EntradaError>();
  if (!moduloId) return catalogo;

  /* Sin caché a propósito, igual que `lib/contenido.ts`, que relee cada archivo
     en cada llamada: son 16 entradas como máximo, y cachear haría que editar un
     catálogo en desarrollo no se viera hasta reiniciar. */
  const ruta = path.join(process.cwd(), "content", "errores", `${moduloId}.json`);
  if (!existsSync(ruta)) return catalogo;

  const data = JSON.parse(readFileSync(ruta, "utf8")) as {
    unidad?: string;
    errores?: {
      id?: unknown;
      descripcion?: unknown;
      titulo?: unknown;
      apoyo?: unknown;
      repaso?: unknown;
    }[];
  };

  const prefijo = `${moduloId}/`;
  for (const cruda of data.errores ?? []) {
    if (typeof cruda?.id !== "string" || typeof cruda?.descripcion !== "string") continue;
    const local = cruda.id.startsWith(prefijo) ? cruda.id.slice(prefijo.length) : cruda.id;
    const entrada: EntradaError = { id: local, descripcion: cruda.descripcion };
    if (esTexto(cruda.titulo)) entrada.titulo = cruda.titulo;
    if (esTexto(cruda.apoyo)) entrada.apoyo = cruda.apoyo;
    const repaso = repasoDe(cruda.repaso);
    if (repaso) entrada.repaso = repaso;
    catalogo.set(local, entrada);
  }
  return catalogo;
}

/** `repaso` solo si es un objeto con los tres textos; cualquier otra forma se omite entera. */
function repasoDe(v: unknown): RepasoDeError | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const r = v as Record<string, unknown>;
  if (!CAMPOS_REPASO.every((campo) => esTexto(r[campo]))) return undefined;
  return { camino: r.camino as string, correcto: r.correcto as string, ejemplo: r.ejemplo as string };
}
