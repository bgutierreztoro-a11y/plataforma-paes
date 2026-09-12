import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { estadoSinDatos, type EstadoDeError, type FaseError } from "./dominio.ts";
import { ORDEN_FASES, tarjetasDeUnidad } from "./pantallaErrores.ts";

const CATALOGO = new Map([
  ["error-1", "Descripción del error uno."],
  ["error-2", "Descripción del error dos."],
  ["error-3", "Descripción del error tres."],
]);

const T = 1_700_000_000_000;

function estado(errorId: string, fase: FaseError, extra: Partial<EstadoDeError> = {}): EstadoDeError {
  return { ...estadoSinDatos(errorId), fase, ultimoIntentoMs: fase === "sin-datos" ? null : T, ...extra };
}

describe("tarjetasDeUnidad", () => {
  it("traduce las tres fases del dominio a los nombres visibles (D8)", () => {
    const tarjetas = tarjetasDeUnidad(
      [estado("error-1", "abierto"), estado("error-2", "observacion"), estado("error-3", "cerrado")],
      CATALOGO,
    );
    assert.deepEqual(
      tarjetas.map((t) => [t.errorId, t.fase]),
      [
        ["error-1", "por-repasar"],
        ["error-2", "en-estudio"],
        ["error-3", "superado"],
      ],
    );
  });

  it("sin-datos no genera tarjeta (D9); sin ningún intento, la lista queda vacía", () => {
    assert.deepEqual(tarjetasDeUnidad([estado("error-1", "sin-datos")], CATALOGO), []);
    assert.deepEqual(tarjetasDeUnidad([], CATALOGO), []);
  });

  it("copia la descripción del catálogo, nunca el id como texto", () => {
    const [t] = tarjetasDeUnidad([estado("error-2", "abierto")], CATALOGO);
    assert.equal(t.descripcion, "Descripción del error dos.");
  });

  it("un error observado que no está en el catálogo se omite (D12)", () => {
    const tarjetas = tarjetasDeUnidad(
      [estado("error-fantasma", "abierto"), estado("error-1", "abierto")],
      CATALOGO,
    );
    assert.deepEqual(
      tarjetas.map((t) => t.errorId),
      ["error-1"],
    );
  });

  it("recaidas >= 1 marca la recaída; 0 no (D11)", () => {
    const tarjetas = tarjetasDeUnidad(
      [estado("error-1", "abierto", { recaidas: 1 }), estado("error-2", "abierto", { recaidas: 0 })],
      CATALOGO,
    );
    assert.deepEqual(
      tarjetas.map((t) => [t.errorId, t.recaida]),
      [
        ["error-1", true],
        ["error-2", false],
      ],
    );
  });

  it("p(L) no está en el modelo de vista (D10)", () => {
    const [t] = tarjetasDeUnidad([estado("error-1", "abierto", { pL: 0.42 })], CATALOGO);
    assert.ok(!("pL" in t));
    assert.deepEqual(Object.keys(t).sort(), ["descripcion", "errorId", "fase", "recaida", "ultimoIntentoMs"]);
  });

  it("ordena por fase (por repasar, en estudio, superado) y dentro de cada fase por último intento, más reciente arriba", () => {
    const tarjetas = tarjetasDeUnidad(
      [
        estado("error-3", "cerrado"),
        estado("error-1", "abierto", { ultimoIntentoMs: T }),
        estado("error-2", "observacion"),
        estado("error-4", "abierto", { ultimoIntentoMs: T + 1 }),
      ],
      new Map([...CATALOGO, ["error-4", "Descripción del error cuatro."]]),
    );
    assert.deepEqual(
      tarjetas.map((t) => t.errorId),
      ["error-4", "error-1", "error-2", "error-3"],
    );
    assert.deepEqual([...ORDEN_FASES], ["por-repasar", "en-estudio", "superado"]);
  });
});
