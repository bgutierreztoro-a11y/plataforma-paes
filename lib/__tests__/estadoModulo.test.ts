/**
 * Contrato de `estadoDelModulo`.
 *
 * El caso que justifica este archivo es el de "2 de 3": un módulo con 3
 * lecciones declaradas, 2 archivos en disco y ambos publicables. Todas las
 * lecciones *resueltas* están listas, así que un `every(publicable)` sin
 * denominador respondería `completo` y el camino anunciaría terminado un
 * módulo al que le falta un tercio. La comparación contra `declaradas` es lo
 * único que lo impide, y es lo que estos tests fijan.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { estadoDelModulo } from "../estadoModulo.ts";

const publicable = { publicable: true };
const enBorrador = { publicable: false };

describe("estadoDelModulo", () => {
  test("3 declaradas, 2 en disco, ambas publicables → en-preparacion", () => {
    // El caso que un every() sin denominador daría por completo.
    assert.equal(estadoDelModulo(3, [publicable, publicable]), "en-preparacion");
  });

  test("3 declaradas, 1 en disco y publicable → en-preparacion", () => {
    assert.equal(estadoDelModulo(3, [publicable]), "en-preparacion");
  });

  test("3 declaradas, 3 en disco y las 3 publicables → completo", () => {
    assert.equal(
      estadoDelModulo(3, [publicable, publicable, publicable]),
      "completo",
    );
  });

  test("3 declaradas, 3 en disco, una sin publicar → en-preparacion", () => {
    assert.equal(
      estadoDelModulo(3, [publicable, publicable, enBorrador]),
      "en-preparacion",
    );
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
    assert.equal(estadoDelModulo(2, [publicable, publicable]), "completo");
  });

  test("más archivos que declarados nunca es completo", () => {
    // No debería ocurrir —verificarRegistroDeTemas() exige que todo archivo lo
    // reclame un tema—, pero si ocurriera, anunciar el módulo como terminado
    // sería la peor respuesta: hay contenido que nadie declaró.
    assert.equal(
      estadoDelModulo(2, [publicable, publicable, publicable]),
      "en-preparacion",
    );
  });
});
