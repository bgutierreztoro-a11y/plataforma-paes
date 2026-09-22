import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { FiguraDiagramaCajon } from "./descarte.ts";
import { ANCHO, anchoTexto, choqueDeMarcas, choquesDeRotulos, geometriaCajon, marcasCajon, valoresRotulados } from "./diagramaCajon.ts";

/* Motor del diagrama de cajón. Datos inventados. Lo que se afirma son
   relaciones (orden, contención, simetría), no píxeles: los números exactos
   de la geometría pueden cambiar con un margen sin que nada se rompa. */

const base = (cambios: Partial<FiguraDiagramaCajon> = {}): FiguraDiagramaCajon => ({
  tipo: "diagrama-cajon",
  orientacion: "horizontal",
  eje: { min: 0, max: 40, paso: 5, etiqueta: "minutos", grilla: true },
  cajas: [{ minimo: 6, q1: 11, mediana: 14.5, q3: 21, maximo: 33, rotulos: true }],
  descripcion: "Un diagrama de cajón de prueba con datos inventados.",
  ...cambios,
});

const TRES = [
  { nombre: "Grupo A", minimo: 4, q1: 12, mediana: 12, q3: 26, maximo: 37, rotulos: true },
  { nombre: "Grupo B", minimo: 9, q1: 15, mediana: 21, q3: 28, maximo: 34, rotulos: true },
  { nombre: "Grupo C", minimo: 1, q1: 7, mediana: 18, q3: 23, maximo: 39, rotulos: true },
];

describe("marcasCajon", () => {
  it("va de min a max con el paso declarado, sin ruido de coma flotante", () => {
    assert.deepEqual(marcasCajon({ min: 0, max: 40, paso: 10 }), [0, 10, 20, 30, 40]);
    assert.deepEqual(marcasCajon({ min: 0, max: 2.5, paso: 0.5 }), [0, 0.5, 1, 1.5, 2, 2.5]);
    assert.deepEqual(marcasCajon({ min: -10, max: 40, paso: 10 }), [-10, 0, 10, 20, 30, 40]);
  });
});

describe("valoresRotulados: cada valor distinto una sola vez", () => {
  it("cinco valores distintos dan cinco rótulos, en orden, con la mediana marcada", () => {
    const r = valoresRotulados({ minimo: 6, q1: 11, mediana: 14.5, q3: 21, maximo: 33 });
    assert.deepEqual(r.map((x) => x.valor), [6, 11, 14.5, 21, 33]);
    assert.deepEqual(r.map((x) => x.deCaja), [false, true, true, true, false]);
    assert.deepEqual(r.filter((x) => x.esMediana).map((x) => x.valor), [14.5]);
  });

  it("q1 igual a la mediana comparte rótulo: cuatro rótulos, el compartido es de la mediana", () => {
    const r = valoresRotulados({ minimo: 4, q1: 12, mediana: 12, q3: 26, maximo: 37 });
    assert.equal(r.length, 4);
    assert.deepEqual(r.find((x) => x.valor === 12), { valor: 12, deCaja: true, esMediana: true });
  });

  it("un mínimo igual a q1 va con los de la caja, no abajo", () => {
    const r = valoresRotulados({ minimo: 11, q1: 11, mediana: 14, q3: 21, maximo: 33 });
    assert.equal(r.length, 4);
    assert.equal(r.find((x) => x.valor === 11)?.deCaja, true);
  });
});

describe("geometriaCajon: todo cae dentro del lienzo", () => {
  for (const orientacion of ["horizontal", "vertical"] as const) {
    it(`${orientacion}: rótulos, cajas y eje dentro de ${ANCHO} de ancho y del alto calculado`, () => {
      const g = geometriaCajon(base({ orientacion, cajas: TRES }));
      assert.equal(g.ancho, ANCHO);
      for (const r of g.rotulos) {
        const ancho = anchoTexto(r.texto);
        const izq = r.ancla === "middle" ? r.x - ancho / 2 : r.x;
        assert.ok(izq >= 0 && izq + ancho <= g.ancho, `rótulo ${r.texto} en x ${r.x}`);
        assert.ok(r.y > 0 && r.y < g.alto, `rótulo ${r.texto} en y ${r.y}`);
      }
      for (const v of [0, 40]) {
        const p = g.aPos(v);
        assert.ok(p >= 0 && p <= (orientacion === "horizontal" ? g.ancho : g.alto));
      }
      assert.equal(g.rotulos.length, 4 + 5 + 5);
    });
  }

  it("horizontal: el eje crece a la derecha y las filas bajan en el orden del JSON", () => {
    const g = geometriaCajon(base({ cajas: TRES }));
    assert.ok(g.aPos(0) < g.aPos(40));
    assert.equal(g.aPos(0), g.inicio);
    assert.equal(g.aPos(40), g.fin);
    const centros = g.cajas.map((c) => c.centro);
    assert.deepEqual([...centros].sort((a, b) => a - b), centros);
    assert.ok(centros[centros.length - 1] < g.lineaEje);
  });

  it("horizontal: con nombres el eje empieza después del nombre más largo", () => {
    const sin = geometriaCajon(base());
    const con = geometriaCajon(base({ cajas: TRES }));
    assert.ok(con.inicio > sin.inicio);
    assert.ok(con.inicio >= anchoTexto("Grupo A"));
  });

  it("vertical: el eje crece hacia arriba y los carriles van de izquierda a derecha sin montarse", () => {
    const g = geometriaCajon(base({ orientacion: "vertical", cajas: TRES }));
    assert.ok(g.aPos(0) > g.aPos(40));
    const bordes = g.cajas.map((c) => [c.centro - c.carril / 2, c.centro + c.carril / 2]);
    for (let i = 1; i < bordes.length; i++) assert.ok(bordes[i][0] >= bordes[i - 1][1] - 1e-9);
    assert.ok(bordes[0][0] >= g.lineaEje - 1e-9);
    assert.ok(bordes[bordes.length - 1][1] <= g.ancho);
  });
});

describe("choques", () => {
  it("sin rótulos no hay choques de rótulos, aunque los valores estén pegados", () => {
    const pegados = [{ minimo: 14, q1: 14.1, mediana: 14.2, q3: 14.3, maximo: 14.4 }];
    assert.deepEqual(choquesDeRotulos(base({ cajas: pegados })), []);
  });

  it("dos valores pegados chocan en horizontal y en vertical; separados no", () => {
    const pegados = [{ minimo: 6, q1: 14, mediana: 14.5, q3: 21, maximo: 33, rotulos: true }];
    for (const orientacion of ["horizontal", "vertical"] as const) {
      assert.deepEqual(choquesDeRotulos(base({ orientacion, cajas: pegados })), [{ caja: 0, valores: [14, 14.5], motivo: "se-pisan" }]);
      assert.deepEqual(choquesDeRotulos(base({ orientacion })), []);
    }
  });

  it("el choque no depende del orden de declaración de las cajas", () => {
    const pegada = { nombre: "Z", minimo: 6, q1: 14, mediana: 14.5, q3: 21, maximo: 33, rotulos: true };
    const a = choquesDeRotulos(base({ cajas: [TRES[0], pegada] }));
    const b = choquesDeRotulos(base({ cajas: [pegada, TRES[0]] }));
    assert.deepEqual(a.map((c) => c.valores), b.map((c) => c.valores));
    assert.equal(a.length, 1);
  });

  it("marcas del eje: miles de a mil se pisan a lo ancho, de a dos mil no", () => {
    assert.deepEqual(choqueDeMarcas(base({ eje: { min: 10000, max: 20000, paso: 1000 }, cajas: [{ minimo: 11000, q1: 12000, mediana: 14000, q3: 16000, maximo: 19000 }] })), [10000, 11000]);
    assert.equal(choqueDeMarcas(base({ eje: { min: 10000, max: 20000, paso: 2000 }, cajas: [{ minimo: 11000, q1: 12000, mediana: 14000, q3: 16000, maximo: 19000 }] })), null);
  });
});
