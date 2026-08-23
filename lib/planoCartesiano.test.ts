import test from "node:test";
import assert from "node:assert/strict";
import {
  DOMINIO,
  cerosParabola,
  puntosParabola,
  verticeParabola,
  xAPixel,
  yAPixel,
} from "./planoCartesiano.ts";

/* Los rangos de slider que el bloque le da a la parábola. Varios tests barren
   este cubo completo, que es la única forma honesta de afirmar "el vértice
   siempre queda dentro del plano con estos rangos". */
const VALORES_A = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
const VALORES_B = [-3, -2, -1, 0, 1, 2, 3];
const VALORES_C = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

// ---------- verticeParabola ----------

test("el vértice de y = x² - 4x + 3 es (2, -1)", () => {
  assert.deepEqual(verticeParabola(1, -4, 3), { x: 2, y: -1 });
});

test("con a < 0 el vértice es el punto más alto", () => {
  // y = -2x² + 4x + 1 → x_v = 1, y_v = 3
  assert.deepEqual(verticeParabola(-2, 4, 1), { x: 1, y: 3 });
});

test("b = 0 deja el vértice sobre el eje y, en c", () => {
  assert.deepEqual(verticeParabola(0.5, 0, -4), { x: 0, y: -4 });
});

test("ningún resultado es -0: el rótulo diría '(-0, ...)'", () => {
  /* `-b / (2a)` con b = 0 da -0, y `(-0).toLocaleString('es-CL')` devuelve
     "-0". Se comprueba con Object.is, porque -0 === 0 es verdadero y un
     assert.equal no lo distinguiría. */
  assert.ok(Object.is(verticeParabola(0.5, 0, -4)!.x, 0));
  assert.ok(Object.is(verticeParabola(-2, 0, 0)!.y, 0));
  assert.ok(Object.is(cerosParabola(1, 0, 0)[0], 0));
  assert.ok(Object.is(cerosParabola(0, 2, 0)[0], 0));
});

test("con a = 0 no hay vértice: devuelve null", () => {
  assert.equal(verticeParabola(0, 3, 2), null);
  assert.equal(verticeParabola(0, 0, 0), null);
});

test("con los rangos del bloque el vértice nunca se sale del plano", () => {
  for (const a of VALORES_A) {
    if (a === 0) continue;
    for (const b of VALORES_B) {
      for (const c of VALORES_C) {
        const v = verticeParabola(a, b, c);
        assert.ok(v !== null);
        assert.ok(
          Math.abs(v.x) <= DOMINIO.max,
          `x_v fuera del plano con a=${a} b=${b} c=${c}: ${v.x}`,
        );
        assert.ok(
          Math.abs(v.y) <= DOMINIO.max,
          `y_v fuera del plano con a=${a} b=${b} c=${c}: ${v.y}`,
        );
      }
    }
  }
});

// ---------- cerosParabola ----------

test("discriminante positivo: dos ceros, ordenados de menor a mayor", () => {
  assert.deepEqual(cerosParabola(1, -4, 3), [1, 3]);
});

test("con a < 0 los ceros salen igual de menor a mayor", () => {
  // -x² + 4x - 3 = 0 → x = 1 y x = 3, mismas raíces que el caso anterior.
  assert.deepEqual(cerosParabola(-1, 4, -3), [1, 3]);
});

test("discriminante cero: un solo cero, el del vértice", () => {
  assert.deepEqual(cerosParabola(1, -2, 1), [1]);
  assert.deepEqual(cerosParabola(1, -2, 1), [verticeParabola(1, -2, 1)!.x]);
});

test("discriminante negativo: ningún cero", () => {
  assert.deepEqual(cerosParabola(1, 0, 5), []);
  assert.deepEqual(cerosParabola(-1, 0, -5), []);
});

test("con a = 0 cae a la recta y = bx + c", () => {
  assert.deepEqual(cerosParabola(0, 2, -6), [3]);
  assert.deepEqual(cerosParabola(0, -1, 4), [4]);
});

test("con a = 0 y b = 0 no hay cero que marcar", () => {
  // y = c constante: o no corta nunca, o es todo el eje. Ni un caso ni el otro
  // se dibuja como punto.
  assert.deepEqual(cerosParabola(0, 0, 3), []);
  assert.deepEqual(cerosParabola(0, 0, 0), []);
});

test("con los rangos del bloque los ceros nunca se salen del plano", () => {
  for (const a of VALORES_A) {
    for (const b of VALORES_B) {
      for (const c of VALORES_C) {
        for (const cero of cerosParabola(a, b, c)) {
          assert.ok(
            Math.abs(cero) <= DOMINIO.max,
            `cero fuera del plano con a=${a} b=${b} c=${c}: ${cero}`,
          );
        }
      }
    }
  }
});

// ---------- puntosParabola ----------

test("la poligonal empieza y termina en los bordes exactos del dominio", () => {
  const puntos = puntosParabola(1, 0, 0).split(" ");
  const [primeroX] = puntos[0].split(",");
  const [ultimoX] = puntos[puntos.length - 1].split(",");
  assert.equal(primeroX, xAPixel(DOMINIO.min).toFixed(2));
  assert.equal(ultimoX, xAPixel(DOMINIO.max).toFixed(2));
});

test("cada punto de la poligonal está sobre la curva", () => {
  const a = 0.5;
  const b = -2;
  const c = -3;
  for (const par of puntosParabola(a, b, c).split(" ")) {
    const [px, py] = par.split(",").map(Number);
    /* Se invierte xAPixel para recuperar la x y se comprueba que la y pintada
       es la que le toca. La tolerancia es la del redondeo a dos decimales de
       píxel que hace `puntosParabola`, no un margen de "más o menos". */
    const x = DOMINIO.min + ((px - xAPixel(DOMINIO.min)) * (DOMINIO.max - DOMINIO.min)) /
      (xAPixel(DOMINIO.max) - xAPixel(DOMINIO.min));
    assert.ok(Math.abs(py - yAPixel(a * x * x + b * x + c)) < 0.02, `${par}`);
  }
});

test("con a = 0 la poligonal es una recta: los tres puntos de una muestra son colineales", () => {
  const puntos = puntosParabola(0, 1.5, -2).split(" ").map((p) => p.split(",").map(Number));
  const [x1, y1] = puntos[0];
  const [x2, y2] = puntos[Math.floor(puntos.length / 2)];
  const [x3, y3] = puntos[puntos.length - 1];
  const area = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
  assert.ok(Math.abs(area) < 0.5, `no son colineales: área ${area}`);
});

test("emite los puntos que se salen del plano en vez de recortarlos", () => {
  /* Recortar es trabajo del clipPath. y = 2x² en x = 10 vale 200, muy fuera del
     viewBox: el último punto tiene que reflejarlo. */
  const puntos = puntosParabola(2, 0, 0).split(" ");
  const [, ultimoY] = puntos[puntos.length - 1].split(",").map(Number);
  assert.equal(ultimoY.toFixed(2), yAPixel(200).toFixed(2));
  assert.ok(ultimoY < 0, "el punto debería quedar por encima del borde superior");
});
