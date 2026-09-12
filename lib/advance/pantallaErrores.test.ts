import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { EntradaError } from "../catalogoErrores.ts";
import { estadoSinDatos, type EstadoDeError, type FaseError } from "./dominio.ts";
import { ORDEN_FASES, tarjetasDeUnidad } from "./pantallaErrores.ts";

/* Tres entradas: dos con titulo+apoyo (el copy de F4b) y una solo con
   descripcion (un catálogo que todavía no lo tiene), para ejercitar la caída
   de D12/F4b sin inventar un catálogo real. */
const CATALOGO = new Map<string, EntradaError>([
  ["error-1", { id: "error-1", descripcion: "Descripción del error uno.", titulo: "Título uno", apoyo: "Apoyo uno." }],
  ["error-2", { id: "error-2", descripcion: "Descripción del error dos.", titulo: "Título dos", apoyo: "Apoyo dos." }],
  ["error-3", { id: "error-3", descripcion: "Descripción del error tres." }],
]);

const UNIDAD = "porcentaje";
const T = 1_700_000_000_000;

function estado(errorId: string, fase: FaseError, extra: Partial<EstadoDeError> = {}): EstadoDeError {
  return { ...estadoSinDatos(errorId), fase, ultimoIntentoMs: fase === "sin-datos" ? null : T, ...extra };
}

describe("tarjetasDeUnidad", () => {
  it("traduce las tres fases del dominio a los nombres visibles (D8)", () => {
    const tarjetas = tarjetasDeUnidad(
      UNIDAD,
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
    assert.deepEqual(tarjetasDeUnidad(UNIDAD, [estado("error-1", "sin-datos")], CATALOGO), []);
    assert.deepEqual(tarjetasDeUnidad(UNIDAD, [], CATALOGO), []);
  });

  it("copia titulo y apoyo del catálogo, nunca id ni descripcion cuando hay titulo", () => {
    const [t] = tarjetasDeUnidad(UNIDAD, [estado("error-2", "abierto")], CATALOGO);
    assert.equal(t.titulo, "Título dos");
    assert.equal(t.apoyo, "Apoyo dos.");
  });

  it("un error sin titulo en el catálogo cae a descripcion, sin apoyo (F4b, catálogos sin copy todavía)", () => {
    const [t] = tarjetasDeUnidad(UNIDAD, [estado("error-3", "abierto")], CATALOGO);
    assert.equal(t.titulo, "Descripción del error tres.");
    assert.equal(t.apoyo, undefined);
  });

  it("un error observado que no está en el catálogo se omite (D12)", () => {
    const tarjetas = tarjetasDeUnidad(
      UNIDAD,
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
      UNIDAD,
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
    const [t] = tarjetasDeUnidad(UNIDAD, [estado("error-1", "abierto", { pL: 0.42 })], CATALOGO);
    assert.ok(!("pL" in t));
    assert.deepEqual(Object.keys(t).sort(), ["apoyo", "errorId", "fase", "recaida", "titulo", "ultimoIntentoMs", "unidadId"]);
  });

  it("unidadId viaja en todas las tarjetas, el mismo que se pasó a tarjetasDeUnidad", () => {
    const tarjetas = tarjetasDeUnidad(
      UNIDAD,
      [estado("error-1", "abierto"), estado("error-2", "observacion")],
      CATALOGO,
    );
    for (const t of tarjetas) assert.equal(t.unidadId, UNIDAD);
  });

  it("ordena por fase (por repasar, en estudio, superado) y dentro de cada fase por último intento, más reciente arriba", () => {
    const CATALOGO_4 = new Map(CATALOGO);
    CATALOGO_4.set("error-4", { id: "error-4", descripcion: "Descripción del error cuatro.", titulo: "Título cuatro" });
    const tarjetas = tarjetasDeUnidad(
      UNIDAD,
      [
        estado("error-3", "cerrado"),
        estado("error-1", "abierto", { ultimoIntentoMs: T }),
        estado("error-2", "observacion"),
        estado("error-4", "abierto", { ultimoIntentoMs: T + 1 }),
      ],
      CATALOGO_4,
    );
    assert.deepEqual(
      tarjetas.map((t) => t.errorId),
      ["error-4", "error-1", "error-2", "error-3"],
    );
    assert.deepEqual([...ORDEN_FASES], ["por-repasar", "en-estudio", "superado"]);
  });
});
