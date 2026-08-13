/**
 * Contrato de `estadoDelModulo`.
 *
 * El caso que justifica este archivo es el de "2 de 3": un módulo con 3
 * lecciones declaradas y 2 archivos en disco. La comparación contra
 * `declaradas` es lo único que impide anunciar como terminado un módulo al que
 * le falta un tercio, y es lo que estos tests fijan.
 *
 * Desde que se eliminó el sistema de `estado` (2026-08-12) el criterio es
 * puramente de conteo: un archivo que existe y valida es contenido terminado,
 * porque ya no hay borradores en `content/`. Los tests de abajo fijan esa
 * invariante nueva —el contenido de los elementos es irrelevante— además de
 * la del denominador, que no cambió.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { estadoDelModulo } from "../estadoModulo.ts";

/** Marcador de "hay un archivo acá". Su forma no importa: ver el último test. */
const enDisco = {};

describe("estadoDelModulo", () => {
  test("3 declaradas, 2 en disco → en-preparacion", () => {
    // El caso que un every() sin denominador daría por completo.
    assert.equal(estadoDelModulo(3, [enDisco, enDisco]), "en-preparacion");
  });

  test("3 declaradas, 1 en disco → en-preparacion", () => {
    assert.equal(estadoDelModulo(3, [enDisco]), "en-preparacion");
  });

  test("3 declaradas, 3 en disco → completo", () => {
    assert.equal(estadoDelModulo(3, [enDisco, enDisco, enDisco]), "completo");
  });

  test("3 declaradas, ninguna en disco → sin-contenido", () => {
    assert.equal(estadoDelModulo(3, []), "sin-contenido");
  });

  test("sin archivos es sin-contenido aunque el módulo no declare nada", () => {
    assert.equal(estadoDelModulo(0, []), "sin-contenido");
  });

  test("2 en disco y 2 declaradas es completo: el denominador es lo declarado, no 3", () => {
    // La regla no está cableada a "3 lecciones por módulo"; compara contra lo
    // que el módulo declara, sea cual sea.
    assert.equal(estadoDelModulo(2, [enDisco, enDisco]), "completo");
  });

  test("más archivos que declarados nunca es completo", () => {
    // No debería ocurrir —verificarRegistroDeTemas() exige que todo archivo lo
    // reclame un tema—, pero si ocurriera, anunciar el módulo como terminado
    // sería la peor respuesta: hay contenido que nadie declaró.
    assert.equal(estadoDelModulo(2, [enDisco, enDisco, enDisco]), "en-preparacion");
  });

  test("solo cuenta cuántos archivos hay, no qué traen adentro", () => {
    /* Reemplaza al antiguo caso "3 en disco, una sin publicar → en-preparacion".
       Ese test fijaba que `estadoDelModulo` mirara un flag `publicable` dentro
       de cada elemento; ese flag ya no existe y con él se fue la única razón
       para que la función inspeccione sus elementos. Lo que queda por fijar es
       lo contrario: que el resultado dependa SOLO del conteo, para que nadie
       vuelva a colar un criterio de madurez acá dentro. */
    const tresCualesquiera = [{ publicable: false }, "loQueSea", null];
    assert.equal(estadoDelModulo(3, tresCualesquiera), "completo");
  });
});
