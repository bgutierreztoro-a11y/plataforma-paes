/**
 * Cobertura de `CATALOGO` en `lib/descripcionesLecciones.tsx`.
 *
 * ## Por qué queda un solo test, y en esta dirección
 *
 * Hasta la fase 3H este archivo exigía además la dirección contraria —**toda**
 * lección con archivo en disco tenía que tener entrada propia— y anclaba el
 * número exacto (25). Las dos se retiraron el 2026-09-03, y no porque
 * molestaran: porque `presentacionDeLeccion` **no tiene ningún consumidor de
 * runtime** desde la fase 3G, cuando se borró `CaminoLecciones`, su único
 * llamador. El marco nuevo de la pantalla 04 no muestra descripción por lección.
 *
 * Exigir cobertura total de un módulo que el producto no monta es afirmar un
 * contrato que nadie cumple: obligaría a escribir copy de interfaz para pantallas
 * que no existen, y el rojo del test no señalaría ningún defecto visible.
 *
 * **El tamaño real de lo que se retiró**, medido el 2026-09-03: 34 lecciones en
 * `content/lecciones/` contra 25 claves en `CATALOGO`. Las 9 sin entrada, todas
 * declaradas en `lib/modulos.ts` y por lo tanto publicables:
 *
 *   cuadratica-donde-toca-el-eje, cuadratica-punto-mas-alto,
 *   cuadratica-sube-y-baja, cuerpos-cuanto-cabe-adentro,
 *   cuerpos-desarmar-la-caja, cuerpos-problemas-en-contexto,
 *   figuras-borde-y-superficie, figuras-problemas-con-forma,
 *   figuras-triangulo-no-se-rompe.
 *
 * Quien retome esto tiene dos salidas y ninguna es este test: darle consumidor
 * al módulo y entonces sí exigir cobertura, o borrarlo por muerto. Las dos son
 * decisión de contenido, y están anotadas en `docs/recuento-pantallas-fase-3.md`.
 *
 * ## Lo que sí se sostiene
 *
 * La dirección que queda —el catálogo no declara entradas fantasma— es la que
 * sigue siendo verdad con o sin consumidor: una clave que no corresponde a
 * ninguna lección en disco es un id renombrado o borrado, o sea un error real, y
 * se detecta sin pedirle a nadie que escriba copy. No lleva número fijo: crece y
 * decrece con el contenido.
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
  test("CATALOGO no declara entradas para lecciones sin archivo", () => {
    const enDisco = leccionesEnDisco();
    /* Guarda de no-vacuidad: sin ella, un `readdirSync` que devolviera vacío
       —directorio movido, test corrido desde otra raíz— haría pasar el test
       marcando todas las entradas como sobrantes... y el `deepEqual` de abajo
       fallaría, sí, pero con un mensaje que culpa al catálogo en vez de a la
       lectura. Falla acá y dice qué pasó. */
    assert.ok(enDisco.length > 0, "no se leyó ninguna lección de content/lecciones/");

    const conArchivo = new Set(enDisco);
    const sobrantes = clavesDelCatalogo().filter((id) => !conArchivo.has(id));

    assert.deepEqual(
      sobrantes,
      [],
      `estas entradas de CATALOGO no tienen archivo en content/lecciones/: ${sobrantes.join(", ")}`,
    );
  });
});
