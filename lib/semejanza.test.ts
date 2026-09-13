import test from "node:test";
import assert from "node:assert/strict";
import {
  area,
  escalarPoligono,
  factores,
  fraccion,
  ladosHomologos,
  mismaFraccion,
  perimetro,
  razon,
  sonSemejantesPorLados,
  valorDe,
} from "./semejanza.ts";
import type { Poligono } from "./transformacionesIsometricas.ts";

const TRIANGULO_345: Poligono = [[0, 0], [4, 0], [0, 3]];
const TRAPECIO: Poligono = [[0, 0], [6, 0], [4, 2], [1, 2]];

// ---------- fracciones y razón ----------

test("fraccion reduce y normaliza el signo del denominador", () => {
  assert.deepEqual(fraccion(6, 4), { numerador: 3, denominador: 2 });
  assert.deepEqual(fraccion(3, -6), { numerador: -1, denominador: 2 });
  assert.deepEqual(fraccion(7.5, 5), { numerador: 3, denominador: 2 });
  assert.deepEqual(fraccion(0.25, 1), { numerador: 1, denominador: 4 });
  assert.throws(() => fraccion(1, 0), /denominador nulo/);
});

test("mismaFraccion compara por producto cruzado, no por decimales", () => {
  assert.ok(mismaFraccion(fraccion(6, 4), fraccion(9, 6)));
  assert.ok(mismaFraccion(fraccion(2, 3), fraccion(10, 15)));
  assert.ok(!mismaFraccion(fraccion(2, 3), fraccion(3, 2)));
});

test("razon es imagen sobre original, y k y 1/k quedan invertidas", () => {
  const k = razon(6, 4);
  const inversa = razon(4, 6);
  assert.deepEqual(k, { numerador: 3, denominador: 2 });
  assert.deepEqual(inversa, { numerador: 2, denominador: 3 });
  assert.ok(!mismaFraccion(k, inversa));
  assert.equal(valorDe(k) * valorDe(inversa), 1);
  assert.throws(() => razon(0, 4), /positivos/);
});

// ---------- factores ----------

test("el perímetro escala por k y el área por k al cuadrado", () => {
  for (const [k, areaEsperada] of [
    [2, 4],
    [3, 9],
    [1 / 2, 1 / 4],
    [3 / 2, 9 / 4],
  ] as const) {
    const f = factores(k);
    assert.equal(f.perimetro, k);
    assert.equal(f.area, areaEsperada);
  }
  assert.throws(() => factores(-1), /positivo/);
});

test("escalarPoligono confirma los factores sobre figuras reales", () => {
  for (const fig of [TRIANGULO_345, TRAPECIO]) {
    for (const k of [2, 3, 1 / 2, 3 / 2]) {
      const imagen = escalarPoligono(fig, k);
      assert.ok(Math.abs(perimetro(imagen) - k * perimetro(fig)) < 1e-9, `perímetro con k = ${k}`);
      assert.ok(Math.abs(area(imagen) - k * k * area(fig)) < 1e-9, `área con k = ${k}`);
    }
  }
});

test("escalarPoligono desde otro centro deja fijo al centro y conserva la forma", () => {
  const centro = [4, 0] as const;
  const imagen = escalarPoligono(TRIANGULO_345, 2, [centro[0], centro[1]]);
  assert.deepEqual(imagen[1], [4, 0]);
  assert.deepEqual(imagen, [[-4, 0], [4, 0], [-4, 6]]);
  assert.equal(area(imagen), 4 * area(TRIANGULO_345));
});

test("con k entero y vértices enteros la imagen es entera", () => {
  for (const p of escalarPoligono(TRAPECIO, 3)) {
    assert.ok(Number.isInteger(p[0]) && Number.isInteger(p[1]));
  }
});

// ---------- lados homólogos y criterio LLL ----------

test("ladosHomologos empareja mayor con mayor y menor con menor", () => {
  assert.deepEqual(ladosHomologos([5, 3, 4], [8, 10, 6]), [
    [3, 6],
    [4, 8],
    [5, 10],
  ]);
  assert.throws(() => ladosHomologos([3, 4, 5], [6, 8]), /distinto número de lados/);
});

test("3-4-5, 6-8-10 y 9-12-15 son semejantes entre sí con razones 2, 3 y 3/2", () => {
  assert.deepEqual(sonSemejantesPorLados([3, 4, 5], [6, 8, 10]), { numerador: 2, denominador: 1 });
  assert.deepEqual(sonSemejantesPorLados([3, 4, 5], [9, 12, 15]), { numerador: 3, denominador: 1 });
  assert.deepEqual(sonSemejantesPorLados([6, 8, 10], [9, 12, 15]), { numerador: 3, denominador: 2 });
  // En el otro sentido la razón se invierte.
  assert.deepEqual(sonSemejantesPorLados([9, 12, 15], [6, 8, 10]), { numerador: 2, denominador: 3 });
  // El orden en que vengan los lados no importa: se emparejan por tamaño.
  assert.deepEqual(sonSemejantesPorLados([5, 3, 4], [8, 10, 6]), { numerador: 2, denominador: 1 });
});

test("sumar una constante a cada lado no conserva la forma: 3-4-5 y 6-7-8 no son semejantes", () => {
  assert.equal(sonSemejantesPorLados([3, 4, 5], [6, 7, 8]), null);
  assert.equal(sonSemejantesPorLados([3, 4, 5], [4, 5, 6]), null);
  // Y un triángulo con dos razones iguales y una distinta tampoco pasa.
  assert.equal(sonSemejantesPorLados([3, 4, 5], [6, 8, 11]), null);
});

test("el criterio acepta lados decimales de contenido sin tolerancia flotante", () => {
  assert.deepEqual(sonSemejantesPorLados([3, 4, 5], [4.5, 6, 7.5]), { numerador: 3, denominador: 2 });
  assert.equal(sonSemejantesPorLados([3, 4, 5], [4.5, 6, 7.6]), null);
  assert.throws(() => sonSemejantesPorLados([3, 4, 0], [6, 8, 10]), /positivos/);
});
