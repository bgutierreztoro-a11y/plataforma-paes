/**
 * Cobertura de `CATALOGO` en `lib/descripcionesLecciones.tsx`.
 *
 * Reemplaza la garantía que daba `Record<LeccionId, ...>` cuando el registro
 * declaraba solo las lecciones escritas. Desde que declara las 48 del temario
 * (16 módulos × 3) teniendo 9 en disco, un `Record` total exigiría copy de
 * interfaz para 39 lecciones inexistentes; el contrato se mide ahora contra la
 * realidad: **toda lección con archivo en disco necesita entrada propia**. Las
 * planeadas caen legítimamente en `RESPALDO`.
 *
 * Se lee el `.tsx` como texto en vez de importarlo porque Node no resuelve la
 * extensión `.tsx` ("Unknown file extension") — el archivo trae JSX y el alias
 * `@/`, ninguno de los dos soportado por el type stripping del runtime. Es la
 * misma razón por la que `motor.test.ts` importa con rutas relativas y `.ts`
 * explícito.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const RAIZ = path.join(import.meta.dirname, "..", "..");

/** Ids con archivo en `content/lecciones/`. Los que empiezan con `_` son
 *  plantillas, igual que en `idsEnDisco()` de lib/contenido.ts. */
function leccionesEnDisco(): string[] {
  return readdirSync(path.join(RAIZ, "content", "lecciones"))
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

/** Claves de primer nivel del objeto `CATALOGO`, leídas del fuente. */
function clavesDelCatalogo(): string[] {
  const fuente = readFileSync(path.join(RAIZ, "lib", "descripcionesLecciones.tsx"), "utf8");
  const inicio = fuente.indexOf("const CATALOGO");
  assert.notEqual(inicio, -1, "no se encontró `const CATALOGO` en descripcionesLecciones.tsx");
  const fin = fuente.indexOf("\n};", inicio);
  assert.notEqual(fin, -1, "no se encontró el cierre del objeto CATALOGO");

  const cuerpo = fuente.slice(inicio, fin);
  // Entradas de primer nivel: exactamente dos espacios de sangría, `"id": {`.
  return [...cuerpo.matchAll(/^ {2}"([a-z0-9-]+)":\s*\{/gm)].map((m) => m[1]).sort();
}

describe("descripcionesLecciones: cobertura del catálogo", () => {
  test("toda lección con archivo en disco tiene entrada en CATALOGO", () => {
    const claves = new Set(clavesDelCatalogo());
    const faltantes = leccionesEnDisco().filter((id) => !claves.has(id));

    assert.deepEqual(
      faltantes,
      [],
      `estas lecciones existen en content/lecciones/ pero caerían en RESPALDO: ${faltantes.join(", ")}`,
    );
  });

  test("CATALOGO no declara entradas para lecciones sin archivo", () => {
    const enDisco = new Set(leccionesEnDisco());
    const sobrantes = clavesDelCatalogo().filter((id) => !enDisco.has(id));

    assert.deepEqual(
      sobrantes,
      [],
      `estas entradas de CATALOGO no tienen archivo en content/lecciones/: ${sobrantes.join(", ")}`,
    );
  });

  test("el catálogo cubre exactamente las 11 lecciones que hoy existen", () => {
    // Ancla el número para que agregar contenido nuevo sin su copy de interfaz
    // se note acá y no en producción, donde el fallback es silencioso.
    assert.equal(leccionesEnDisco().length, 11);
    assert.equal(clavesDelCatalogo().length, 11);
  });
});
