import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { leerIdVideo } from "./video.ts";

describe("leerIdVideo", () => {
  it("acepta el formato de la convención de links", () => {
    assert.equal(leerIdVideo("v001-deshace-porcentaje"), "v001-deshace-porcentaje");
    assert.equal(leerIdVideo("v123-a"), "v123-a");
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
      "v001--doble",
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
