import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { seleccionarSesion } from "./seleccion.ts";
import type { ItemAdvance } from "./descarte.ts";

const item = (n: number): ItemAdvance => ({
  id: `adv-prueba-${n}`,
  unidadId: "prueba",
  moduloId: "prueba",
  habilidad: "resolver",
  dificultad: "media",
  tiempoReferenciaSeg: 120,
  enunciado: `Enunciado ${n}`,
  alternativas: [
    { clave: "A", claveOriginal: "A", texto: "a", esCorrecta: true, feedbackDescarteIncorrecto: "fdi" },
    { clave: "B", claveOriginal: "B", texto: "b", esCorrecta: false, errorCatalogado: "error-1", feedbackDescarte: "fd" },
    { clave: "C", claveOriginal: "C", texto: "c", esCorrecta: false, errorCatalogado: "error-2", feedbackDescarte: "fd" },
    { clave: "D", claveOriginal: "D", texto: "d", esCorrecta: false, errorCatalogado: "error-3", feedbackDescarte: "fd" },
  ],
  solucion: "s",
});

const BANCO = [1, 2, 3, 4, 5, 6, 7].map(item);

/* Generador determinista: devuelve siempre 0, así Fisher-Yates intercambia cada
   posición con la 0 y el resultado es predecible. */
const siempreCero = () => 0;

describe("seleccionarSesion", () => {
  it("n = min(n, items.length), sin repetir ids", () => {
    for (const n of [0, 1, 5, 7, 12]) {
      const sesion = seleccionarSesion(BANCO, n);
      assert.equal(sesion.length, Math.min(n, BANCO.length));
      assert.equal(new Set(sesion.map((i) => i.id)).size, sesion.length);
    }
  });

  it("no muta el banco ni sus ítems", () => {
    const copia = structuredClone(BANCO);
    seleccionarSesion(BANCO, 5);
    seleccionarSesion(BANCO, 5, siempreCero);
    assert.deepEqual(BANCO, copia);
  });

  it("con el generador inyectado la selección es determinista", () => {
    const a = seleccionarSesion(BANCO, 3, siempreCero).map((i) => i.id);
    const b = seleccionarSesion(BANCO, 3, siempreCero).map((i) => i.id);
    assert.deepEqual(a, b);
    assert.deepEqual(a, ["adv-prueba-2", "adv-prueba-3", "adv-prueba-4"]);
  });

  it("las alternativas se mezclan: letra visible A–D por posición, claveOriginal conserva la del JSON", () => {
    const [primero] = seleccionarSesion(BANCO, 1, siempreCero);
    assert.deepEqual(primero.alternativas.map((a) => a.clave), ["A", "B", "C", "D"]);
    assert.deepEqual(primero.alternativas.map((a) => a.claveOriginal), ["B", "C", "D", "A"]);
    const correcta = primero.alternativas.find((a) => a.esCorrecta);
    assert.ok(correcta);
    assert.equal(correcta.claveOriginal, "A");
    assert.equal(correcta.clave, "D");
    assert.equal(correcta.texto, "a");
  });

  it("con Math.random: cada ítem sigue teniendo A–D visibles, una correcta y las cuatro claves originales", () => {
    for (let vuelta = 0; vuelta < 20; vuelta++) {
      for (const it of seleccionarSesion(BANCO, 5)) {
        assert.deepEqual(it.alternativas.map((a) => a.clave), ["A", "B", "C", "D"]);
        assert.deepEqual([...it.alternativas.map((a) => a.claveOriginal)].sort(), ["A", "B", "C", "D"]);
        assert.equal(it.alternativas.filter((a) => a.esCorrecta).length, 1);
        for (const a of it.alternativas) {
          const original = BANCO.find((b) => b.id === it.id)!.alternativas.find((o) => o.clave === a.claveOriginal)!;
          assert.equal(a.texto, original.texto);
          assert.equal(a.esCorrecta, original.esCorrecta);
        }
      }
    }
  });
});
