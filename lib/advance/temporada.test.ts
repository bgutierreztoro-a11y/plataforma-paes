import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { estadoTemporada, type Vigencia } from "./temporada.ts";

/* Instantes falsos, en ms. AHORA es un lunes cualquiera; no hay reloj. */
const DIA_MS = 24 * 60 * 60 * 1000;
const AHORA = Date.UTC(2026, 8, 14, 12, 0, 0);

const vigencia = (desdeDias: number, hastaDias: number | null): Vigencia => ({
  vigencia_desde: new Date(AHORA + desdeDias * DIA_MS),
  vigencia_hasta: hastaDias === null ? null : new Date(AHORA + hastaDias * DIA_MS),
});

describe("estadoTemporada", () => {
  it("sin filas es sin-acceso: nunca contrató", () => {
    assert.equal(estadoTemporada([], AHORA), "sin-acceso");
  });

  it("una vigencia que ya empezó y no terminó es activo", () => {
    assert.equal(estadoTemporada([vigencia(-10, 60)], AHORA), "activo");
  });

  it("vigencia_hasta nula es acceso perpetuo: activo", () => {
    assert.equal(estadoTemporada([vigencia(-10, null)], AHORA), "activo");
  });

  it("una vigencia que ya terminó es temporada-terminada, no sin-acceso", () => {
    assert.equal(estadoTemporada([vigencia(-100, -1)], AHORA), "temporada-terminada");
  });

  it("una vigencia que todavía no empieza es sin-acceso: no hay temporada que haya terminado", () => {
    assert.equal(estadoTemporada([vigencia(5, 60)], AHORA), "sin-acceso");
  });

  it("activo gana a terminada: una cortesía vencida y una compra vigente dan activo", () => {
    assert.equal(estadoTemporada([vigencia(-100, -1), vigencia(-1, 90)], AHORA), "activo");
    assert.equal(estadoTemporada([vigencia(-1, 90), vigencia(-100, -1)], AHORA), "activo");
  });

  it("terminada gana a futura: una temporada vencida y otra por empezar dan temporada-terminada", () => {
    assert.equal(estadoTemporada([vigencia(-100, -1), vigencia(5, 60)], AHORA), "temporada-terminada");
  });

  it("los bordes siguen a tieneAcceso(): desde <= ahora entra, hasta <= ahora ya terminó", () => {
    assert.equal(estadoTemporada([vigencia(0, 60)], AHORA), "activo");
    assert.equal(estadoTemporada([vigencia(-10, 0)], AHORA), "temporada-terminada");
  });
});
