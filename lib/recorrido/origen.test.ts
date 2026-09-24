import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { leerCookieOrigen, valorCookieOrigen } from "./origen.ts";
import { leerIdVideo } from "./video.ts";

const UNIDAD = "porcentaje";
const ERROR = "deshace-porcentaje-con-mismo-porcentaje";

describe("cookie fobos_origen", () => {
  it("lo que se escribe se lee igual, con y sin video", () => {
    const video = leerIdVideo("v001-deshace-porcentaje");
    for (const origen of [
      { unidadId: UNIDAD, errorId: ERROR, video },
      { unidadId: UNIDAD, errorId: ERROR, video: null },
    ]) {
      assert.deepEqual(leerCookieOrigen(valorCookieOrigen(origen)), origen);
    }
  });

  it("descarta lo que no nombra una página pública o trae un video fuera de formato", () => {
    for (const valor of [
      undefined,
      "",
      `${UNIDAD}|${ERROR}`,
      `${UNIDAD}|${ERROR}|v001-x|extra`,
      `${UNIDAD}|suma-porcentajes-sucesivos|`,
      `otra-unidad|${ERROR}|`,
      `${UNIDAD}|${ERROR}|tu@correo.cl`,
    ]) {
      assert.equal(leerCookieOrigen(valor), null, `debió descartar ${JSON.stringify(valor)}`);
    }
  });
});
