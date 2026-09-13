import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { EntradaError } from "../catalogoErrores.ts";
import { copyDeError, copyDelCatalogo } from "./copyDeError.ts";

/* Tres entradas, las mismas formas que en pantallaErrores.test.ts: copy
   completo (F4b), solo descripcion (un catálogo que todavía no lo tiene) y
   titulo sin apoyo. */
const COMPLETA: EntradaError = { id: "falla-1", descripcion: "Descripción del error uno.", titulo: "Título uno", apoyo: "Apoyo uno." };
const SIN_COPY: EntradaError = { id: "falla-3", descripcion: "Descripción del error tres." };
const SIN_APOYO: EntradaError = { id: "falla-4", descripcion: "Descripción del error cuatro.", titulo: "Título cuatro" };

describe("copyDeError", () => {
  it("con titulo y apoyo, muestra los dos y no la descripcion", () => {
    assert.deepEqual(copyDeError(COMPLETA), { titulo: "Título uno", apoyo: "Apoyo uno." });
  });

  it("sin titulo cae a descripcion y sin apoyo", () => {
    const copy = copyDeError(SIN_COPY);
    assert.equal(copy.titulo, SIN_COPY.descripcion);
    assert.equal("apoyo" in copy, false);
  });

  it("con titulo y sin apoyo, la clave apoyo queda ausente, no vacía", () => {
    const copy = copyDeError(SIN_APOYO);
    assert.equal(copy.titulo, "Título cuatro");
    assert.equal("apoyo" in copy, false);
  });
});

describe("copyDelCatalogo", () => {
  it("conserva las claves del catálogo y proyecta cada entrada", () => {
    const catalogo = new Map<string, EntradaError>([
      ["falla-1", COMPLETA],
      ["falla-3", SIN_COPY],
      ["falla-4", SIN_APOYO],
    ]);
    const copy = copyDelCatalogo(catalogo);
    assert.deepEqual(Object.keys(copy), [...catalogo.keys()]);
    assert.deepEqual(copy["falla-3"], { titulo: SIN_COPY.descripcion });
  });

  it("con un catálogo vacío devuelve un Record vacío", () => {
    assert.deepEqual(copyDelCatalogo(new Map()), {});
  });
});
