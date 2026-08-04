import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
// El validador es un módulo ESM de texto plano (scripts/validar-contenido.mjs);
// se reutiliza en vez de duplicar reglas. El shim de tipos vive en
// lib/validar-contenido.d.ts.
import { validarDatos } from "../scripts/validar-contenido.mjs";
import { ContenidoInvalidoError } from "./errores";
import { TIPOS_BLOQUE_VALIDOS } from "./tipos";
import {
  IDS_LECCION,
  IDS_CIERRE,
  idsDeLeccionesEnOrden,
  temaDeLeccion,
  todosLosTemas,
} from "./modulos";
import type { CierreId } from "./modulos";
import type {
  Contenido,
  Estado,
  Leccion,
  DiagnosticoContenido,
  CierreContenido,
} from "./tipos";

/**
 * El validador de scripts/validar-contenido.mjs no chequea la forma interna
 * de cada bloque (el `oneOf` del schema) — solo estructura superficial. Esta
 * es la única pieza que falta para que un `tipo` de bloque inválido no rompa
 * el render silenciosamente.
 */
function verificarFormaBloques(data: unknown, origen: string): void {
  if (
    typeof data !== "object" ||
    data === null ||
    (data as { tipo?: string }).tipo !== "leccion"
  ) {
    return;
  }
  const pasos = (data as { pasos?: unknown }).pasos;
  if (!Array.isArray(pasos)) return;
  pasos.forEach((paso, i) => {
    const bloques = (paso as { bloques?: unknown })?.bloques;
    if (!Array.isArray(bloques)) return;
    bloques.forEach((bloque, j) => {
      const tipo = (bloque as { tipo?: string })?.tipo;
      if (!tipo || !(TIPOS_BLOQUE_VALIDOS as readonly string[]).includes(tipo)) {
        throw new ContenidoInvalidoError(
          `${origen}: pasos[${i}].bloques[${j}] tiene un tipo de bloque inválido: ${JSON.stringify(tipo)}`,
        );
      }
    });
  });
}

function cargarYValidar<T extends Contenido>(rutaAbsoluta: string): T {
  if (!existsSync(rutaAbsoluta)) {
    throw new ContenidoInvalidoError(`No existe el archivo de contenido: ${rutaAbsoluta}`);
  }
  const crudo = readFileSync(rutaAbsoluta, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(crudo);
  } catch (e) {
    throw new ContenidoInvalidoError(`JSON inválido en ${rutaAbsoluta}: ${(e as Error).message}`);
  }
  const errores = validarDatos(data);
  if (errores.length > 0) {
    throw new ContenidoInvalidoError(
      `Contenido inválido en ${rutaAbsoluta}:\n${errores.map((e) => ` - ${e}`).join("\n")}`,
    );
  }
  verificarFormaBloques(data, rutaAbsoluta);
  return data as T;
}

/**
 * Ids de los archivos de lección que existen en disco, sin validar su
 * contenido. Los que empiezan con `_` son plantillas y no cuentan.
 *
 * Se separa de `idsDeLecciones()` porque el barrido de temas necesita comparar
 * contra los **archivos**, no contra los archivos válidos: si no, una lección
 * con un error de contenido se reportaría como "declarada en lib/modulos.ts pero
 * inexistente", que es un diagnóstico falso y manda a buscar al lugar
 * equivocado.
 */
function idsEnDisco(): string[] {
  const dir = path.join(process.cwd(), "content", "lecciones");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""));
}

/** Análogo a `idsEnDisco()`, para `content/cierres/`. */
function idsEnDiscoCierres(): string[] {
  const dir = path.join(process.cwd(), "content", "cierres");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""));
}

/**
 * Solo devuelve ids de lecciones que el runner puede efectivamente pintar
 * (pasan cargarYValidar completo, incluida la forma de bloques). Una lección
 * con contenido inválido queda excluida de las rutas estáticas — y por lo
 * tanto cae en el 404 normal — en vez de tumbar el build completo.
 */
export function idsDeLecciones(): string[] {
  return idsEnDisco().filter((id) => {
    try {
      obtenerLeccion(id);
      return true;
    } catch (e) {
      console.warn(
        `idsDeLecciones: se excluye "${id}" de las rutas de lección (contenido inválido): ${(e as Error).message}`,
      );
      return false;
    }
  });
}

export function obtenerLeccion(id: string): Leccion {
  const ruta = path.join(process.cwd(), "content", "lecciones", `${id}.json`);
  return cargarYValidar<Leccion>(ruta);
}

/**
 * Lección de demostración: se conserva en el repo para pruebas internas, pero
 * queda fuera del alcance del estudiante — no aparece en el camino ni es
 * navegable. Retirarla por id (y no borrar el archivo) es una decisión de
 * producto, no una limitación del schema.
 */
const ID_DEMO = "l0-demo";

/**
 * `true` si el contenido puede mostrarse a un estudiante. La fuente de verdad es
 * el `estado` del propio JSON: el schema declara "Solo 'publicable' puede
 * mostrarse a estudiantes" (content/schema/leccion.schema.json).
 *
 * Pide solo `estado` (el campo que comparte todo `ContenidoBase`) en vez de una
 * `Leccion` completa: lección, diagnóstico y cierre se preguntan lo mismo, y así
 * la comparación con "publicable" vive en un único lugar.
 */
export function esPublicable(contenido: { estado: Estado }): boolean {
  return contenido.estado === "publicable";
}

/**
 * Cruza el registro de temas (`lib/modulos.ts`, estático) contra los archivos que
 * existen en disco. Es la mitad de la garantía que TypeScript no puede dar: el
 * compilador impide escribir un id que no esté en `IDS_LECCION`, pero no sabe
 * si ese archivo existe ni si alguien lo dejó huérfano.
 *
 * Se verifica en las dos direcciones porque los dos errores son igual de
 * silenciosos: un id declarado que no existe pinta un nodo hacia un 404, y una
 * lección real que ningún tema reclama simplemente desaparece del camino sin
 * que nada falle.
 *
 * Lanza en vez de advertir: esto corre al construir el camino, así que una
 * desincronización rompe el build en lugar de publicar un temario con hoyos.
 */
export function verificarRegistroDeTemas(): void {
  const enDisco = new Set(idsEnDisco());
  const declarados = new Set<string>(IDS_LECCION);
  const problemas: string[] = [];

  for (const id of declarados) {
    if (!enDisco.has(id)) {
      problemas.push(`"${id}" está en IDS_LECCION pero no existe content/lecciones/${id}.json`);
    }
  }
  for (const id of enDisco) {
    if (!declarados.has(id)) {
      problemas.push(`content/lecciones/${id}.json existe pero no está en IDS_LECCION`);
    }
  }

  // La demo se conserva en el repo para pruebas internas y por decisión de
  // producto queda fuera del alcance del estudiante, así que es la única
  // lección que legítimamente no pertenece a ningún tema.
  for (const id of enDisco) {
    if (id === ID_DEMO) continue;
    if (!temaDeLeccion(id)) {
      problemas.push(`"${id}" no está asignada a ningún tema en lib/modulos.ts`);
    }
  }

  const asignaciones = new Map<string, string[]>();
  for (const tema of todosLosTemas()) {
    for (const id of tema.lecciones) {
      asignaciones.set(id, [...(asignaciones.get(id) ?? []), tema.id]);
    }
  }
  for (const [id, temas] of asignaciones) {
    if (temas.length > 1) {
      problemas.push(`"${id}" está asignada a más de un tema: ${temas.join(", ")}`);
    }
  }

  // Mismas tres comprobaciones que arriba, para content/cierres/.
  const cierresEnDisco = new Set(idsEnDiscoCierres());
  const cierresDeclarados = new Map<string, string[]>();
  for (const tema of todosLosTemas()) {
    const cierreId = "cierreId" in tema ? tema.cierreId : undefined;
    if (!cierreId) continue;
    cierresDeclarados.set(cierreId, [...(cierresDeclarados.get(cierreId) ?? []), tema.id]);
  }

  for (const cierreId of cierresDeclarados.keys()) {
    if (!cierresEnDisco.has(cierreId)) {
      problemas.push(
        `"${cierreId}" está declarado como cierreId pero no existe content/cierres/${cierreId}.json`,
      );
    }
  }
  for (const id of cierresEnDisco) {
    if (!cierresDeclarados.has(id)) {
      problemas.push(`content/cierres/${id}.json existe pero ningún tema lo declara como cierreId`);
    }
  }
  for (const [cierreId, temas] of cierresDeclarados) {
    if (temas.length > 1) {
      problemas.push(`"${cierreId}" está declarado como cierreId de más de un tema: ${temas.join(", ")}`);
    }
  }

  if (problemas.length > 0) {
    throw new ContenidoInvalidoError(
      `lib/modulos.ts no calza con content/lecciones/:\n${problemas.map((p) => ` - ${p}`).join("\n")}`,
    );
  }
}

/**
 * Ids del camino del estudiante en orden de temario (eje → tema → posición
 * dentro del tema), excluida la demo. Incluye a propósito lecciones aún no
 * publicables: el camino las muestra como "En preparación" en vez de ocultarlas,
 * para que el curso se lea como en construcción y no como abandonado.
 *
 * El orden lo da `lib/modulos.ts`, no el nombre del id ni un sort alfabético.
 * El id ya no lleva prefijo numérico (`l1-`, `l2-`, `l3-`): desde la Enmienda 2
 * (mos-v2.md §13) el formato es `{modulo}-{slug}`, y `ecuaciones-lineales`
 * pertenece a otro módulo que las otras dos lecciones de este tema, así que un
 * número global nunca significó nada. Además el sort se caía en `l10`.
 *
 * Se filtra contra `idsDeLecciones()` para no perder la propiedad de que una
 * lección con contenido inválido queda fuera del camino sin tumbar el build.
 */
export function idsDelCamino(): string[] {
  verificarRegistroDeTemas();
  const validas = new Set(idsDeLecciones());
  return idsDeLeccionesEnOrden().filter((id) => id !== ID_DEMO && validas.has(id));
}

/**
 * Ids efectivamente navegables: solo las publicables del camino. Alimenta
 * `generateStaticParams`; con `dynamicParams = false`, cualquier otro id —la
 * demo o una lección en borrador/revisión— cae en el 404 normal.
 */
export function idsPublicables(): string[] {
  return idsDelCamino().filter((id) => esPublicable(obtenerLeccion(id)));
}

/**
 * `true` solo con `PREVIEW_MOSTRAR_BORRADORES=true` (Preview env de Vercel,
 * nunca Production). Reconstruye el bypass de `02457f2`, perdido en un
 * refactor posterior: deja ver contenido en borrador para demostración sin
 * tocar `estado`, que sigue siendo la única fuente de verdad de qué está
 * realmente revisado. `RunnerLeccion` es responsable de mostrar el banner
 * de demostración cuando la lección no es publicable.
 */
export function previewMuestraBorradores(): boolean {
  return process.env.PREVIEW_MOSTRAR_BORRADORES === "true";
}

/**
 * Como `idsPublicables()`, pero incluye borradores si el preview está
 * activo. Es lo único que debe alimentar `generateStaticParams` de
 * `/leccion/[id]`: así la ruta existe en Preview aunque `estado` no sea
 * `"publicable"`, sin relajar el contrato en Production.
 */
export function idsPublicablesOPreview(): string[] {
  return previewMuestraBorradores() ? idsDelCamino() : idsPublicables();
}

export function obtenerDiagnostico(): DiagnosticoContenido {
  return cargarYValidar<DiagnosticoContenido>(
    path.join(process.cwd(), "content", "diagnostico.json"),
  );
}

export function obtenerCierre(id: CierreId): CierreContenido {
  const ruta = path.join(process.cwd(), "content", "cierres", `${id}.json`);
  return cargarYValidar<CierreContenido>(ruta);
}

/**
 * Ids de cierre que existen en disco y pasan la validación completa. Mismo
 * criterio que `idsDeLecciones()`: un cierre con contenido inválido queda
 * excluido en vez de tumbar el build.
 */
export function idsDeCierres(): CierreId[] {
  return idsEnDiscoCierres().filter((id): id is CierreId => {
    if (!(IDS_CIERRE as readonly string[]).includes(id)) return false;
    try {
      obtenerCierre(id as CierreId);
      return true;
    } catch (e) {
      console.warn(
        `idsDeCierres: se excluye "${id}" (contenido inválido): ${(e as Error).message}`,
      );
      return false;
    }
  });
}
