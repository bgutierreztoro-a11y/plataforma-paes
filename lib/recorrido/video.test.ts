import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { valorCookieOrigen } from "./origen.ts";
import { CLAVE_ESTADO_VIDEO, leerIdVideo, videoDeLaVisita } from "./video.ts";

const PAGINA = "https://fobos.cl/error/porcentaje/deshace-porcentaje-con-mismo-porcentaje";

describe("leerIdVideo", () => {
  it("acepta lo que calza con ^v\\d{3}-[a-z0-9-]+$", () => {
    for (const crudo of ["v001-deshace-porcentaje", "v123-a", "v001--doble"]) {
      assert.equal(leerIdVideo(crudo), crudo);
    }
  });

  it("rechaza cualquier otra cosa, incluido texto con datos personales", () => {
    for (const crudo of [
      "tu@correo.cl",
      "Juan Pérez",
      "v001 deshace porcentaje",
      "V001-deshace-porcentaje",
      "v1-deshace",
      "v001",
      "v001-",
      "v001-juan.perez@gmail.com",
      "",
      `v001-${"a".repeat(60)}`,
      undefined,
      null,
      42,
      ["v001-deshace-porcentaje"],
    ]) {
      assert.equal(leerIdVideo(crudo), null, `debió rechazar ${JSON.stringify(crudo)}`);
    }
  });
});

describe("videoDeLaVisita", () => {
  it("toma el utm_content válido y deja la dirección sin parámetros", () => {
    const r = videoDeLaVisita(null, `${PAGINA}?utm_source=instagram&utm_medium=bio&utm_content=v001-deshace-porcentaje`);
    assert.equal(r.video, "v001-deshace-porcentaje");
    assert.equal(r.urlLimpia, "/error/porcentaje/deshace-porcentaje-con-mismo-porcentaje");
  });

  it("al recargar, sin parámetros, recupera el video de history.state", () => {
    const r = videoDeLaVisita({ [CLAVE_ESTADO_VIDEO]: "v001-deshace-porcentaje" }, PAGINA);
    assert.equal(r.video, "v001-deshace-porcentaje");
    assert.equal(r.urlLimpia, null);
  });

  it("un utm_content con correo no llega al video, a la dirección ni a la cookie", () => {
    const correo = "juan.perez@gmail.com";
    for (const [estado, href] of [
      [null, `${PAGINA}?utm_content=${encodeURIComponent(correo)}`],
      [null, `${PAGINA}?utm_content=v001-${encodeURIComponent(correo)}&email=${encodeURIComponent(correo)}`],
      [{ [CLAVE_ESTADO_VIDEO]: correo }, PAGINA],
    ] as const) {
      const { video, urlLimpia } = videoDeLaVisita(estado, href);
      assert.equal(video, null);
      const cookie = valorCookieOrigen({ unidadId: "porcentaje", errorId: "deshace-porcentaje-con-mismo-porcentaje", video });
      for (const salida of [String(urlLimpia), cookie]) {
        assert.ok(!salida.includes("@") && !salida.includes("juan"), `se filtró: ${salida}`);
      }
    }
  });
});
