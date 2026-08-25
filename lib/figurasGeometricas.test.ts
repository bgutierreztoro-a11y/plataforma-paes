import test from "node:test";
import assert from "node:assert/strict";
import {
  escalarPuntosAViewBox,
  hipotenusa,
  verticesTrianguloRectangulo,
} from "./figurasGeometricas.ts";

// ---------- verticesTrianguloRectangulo ----------

test("el ángulo recto queda en el origen, con los catetos sobre los ejes", () => {
  assert.deepEqual(verticesTrianguloRectangulo(3, 4), [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 0, y: 4 },
  ]);
});

test("catetoA y catetoB no positivos lanzan error explícito", () => {
  assert.throws(() => verticesTrianguloRectangulo(0, 4), /positivos/);
  assert.throws(() => verticesTrianguloRectangulo(3, 0), /positivos/);
  assert.throws(() => verticesTrianguloRectangulo(-2, 4), /positivos/);
  assert.throws(() => verticesTrianguloRectangulo(3, -1), /positivos/);
});

// ---------- hipotenusa ----------

test("3-4-5 es el caso de referencia", () => {
  assert.equal(hipotenusa(3, 4), 5);
});

test("catetos iguales dan hipotenusa = cateto * raíz de 2", () => {
  assert.ok(Math.abs(hipotenusa(1, 1) - Math.SQRT2) < 1e-12);
});

// ---------- escalarPuntosAViewBox ----------

const VIEW_BOX = { ancho: 240, alto: 200, margen: 28 };

test("los tres vértices quedan dentro del área útil del viewBox (dentro del margen)", () => {
  const vertices = verticesTrianguloRectangulo(3, 4);
  const escalados = escalarPuntosAViewBox(vertices, VIEW_BOX);
  for (const p of escalados) {
    assert.ok(p.x >= VIEW_BOX.margen - 1e-9 && p.x <= VIEW_BOX.ancho - VIEW_BOX.margen + 1e-9, `x fuera de rango: ${p.x}`);
    assert.ok(p.y >= VIEW_BOX.margen - 1e-9 && p.y <= VIEW_BOX.alto - VIEW_BOX.margen + 1e-9, `y fuera de rango: ${p.y}`);
  }
});

test("la escala es uniforme: el ángulo recto se preserva después de reescalar", () => {
  // Con catetos muy distintos (3 y 20) una escala independiente por eje
  // distorsionaría el ángulo — este es el caso donde eso se notaría.
  const [origen, extremoA, extremoB] = escalarPuntosAViewBox(
    verticesTrianguloRectangulo(3, 20),
    VIEW_BOX,
  );
  const vectorA = { x: extremoA.x - origen.x, y: extremoA.y - origen.y };
  const vectorB = { x: extremoB.x - origen.x, y: extremoB.y - origen.y };
  const productoPunto = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
  assert.ok(Math.abs(productoPunto) < 1e-9, `los catetos ya no son perpendiculares: producto punto ${productoPunto}`);
});

test("la razón entre catetos se mantiene tras reescalar (proporción real, no forzada al viewBox)", () => {
  const [origen, extremoA, extremoB] = escalarPuntosAViewBox(
    verticesTrianguloRectangulo(3, 4),
    VIEW_BOX,
  );
  const largoA = Math.hypot(extremoA.x - origen.x, extremoA.y - origen.y);
  const largoB = Math.hypot(extremoB.x - origen.x, extremoB.y - origen.y);
  assert.ok(Math.abs(largoA / largoB - 3 / 4) < 1e-9, `razón esperada 3/4, obtenida ${largoA / largoB}`);
});

test("el eje y se invierte: el vértice con mayor y matemática queda más arriba en el SVG (menor y de pantalla)", () => {
  const [origen, , extremoB] = escalarPuntosAViewBox(verticesTrianguloRectangulo(3, 4), VIEW_BOX);
  assert.ok(extremoB.y < origen.y, `extremoB.y (${extremoB.y}) debería ser menor que origen.y (${origen.y})`);
});

test("un conjunto de puntos con ancho o alto cero (degenerado) no divide por cero", () => {
  const puntos = [{ x: 5, y: 5 }, { x: 5, y: 5 }];
  const escalados = escalarPuntosAViewBox(puntos, VIEW_BOX);
  for (const p of escalados) {
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), `punto no finito: ${JSON.stringify(p)}`);
  }
});
