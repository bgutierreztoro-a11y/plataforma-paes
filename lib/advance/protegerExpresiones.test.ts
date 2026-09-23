import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { protegerExpresiones } from "./protegerExpresiones.ts";

const NBSP = "\u00A0";
/* Los esperados se escriben con ⍽ para que el espacio duro se vea en el test. */
const duro = (s: string) => s.replace(/⍽/g, NBSP);

/* Casos firmados en la PARADA del 2026-09-17 (cortes de operador a 390 px) y
   las correcciones de Benja: superíndices, $, √, relaciones, valor absoluto,
   monomios de dos letras, prima y × entre palabras (D5, D6). */
const CASOS: [string, string][] = [
  ["(4 − 2)x = 3.210 − 1.926 = 1.284", "(4⍽−⍽2)x⍽= 3.210⍽−⍽1.926⍽= 1.284"],
  ["x − 47 = 3(y − 47)", "x⍽−⍽47⍽= 3(y⍽−⍽47)"],
  ["2x + 3y = 435 ; 6x + 9y = 1.359", "2x⍽+⍽3y⍽= 435 ; 6x⍽+⍽9y⍽= 1.359"],
  ["x = 2 e y = 3: 12.100 + 32.100 = 44.200", "x⍽= 2 e y⍽= 3: 12.100⍽+⍽32.100⍽= 44.200"],
  ["−5x = 1.249 − 2.664 = −1.415, x = 283.", "−5x⍽= 1.249⍽−⍽2.664⍽= −1.415, x⍽= 283."],
  ["reparte las pilas entre 3 + 4: 1.757 ÷ 7 = 251", "reparte las pilas entre 3⍽+⍽4: 1.757⍽÷⍽7⍽= 251"],
  ["**2x + 3y = 435** y `x − y`", "**2x⍽+⍽3y⍽= 435** y `x⍽−⍽y`"],
  ["x² + 3x = 10", "x²⍽+⍽3x⍽= 10"],
  ["$1.200 + $600 = $1.800", "$1.200⍽+⍽$600⍽= $1.800"],
  ["√16 + 2 = 6", "√16⍽+⍽2⍽= 6"],
  ["2x − 3 ≤ 7", "2x⍽−⍽3⍽≤ 7"],
  ["x ≠ 0", "x⍽≠ 0"],
  ["|x − 3| + 2 < 9 y a > b", "|x⍽−⍽3|⍽+⍽2⍽< 9 y a⍽> b"],
  /* D5: monomios de dos letras y prima. D6: × ÷ · siempre. */
  ["−mn + mn", "−mn⍽+⍽mn"],
  ["4uv + 4v²", "4uv⍽+⍽4v²"],
  ["A′ = (7, −6)", "A′⍽= (7, −6)"],
  ["comensales × porción", "comensales⍽×⍽porción"],
  /* Número y unidad (Unidad 14): la unidad no queda sola en la línea siguiente. */
  ["El lado mide 3√2 cm y el otro 2,5 m.", "El lado mide 3√2⍽cm y el otro 2,5⍽m."],
  ["18 cm² de un lado y 4π cm de arco", "18⍽cm² de un lado y 4π⍽cm de arco"],
  ["(x + 2) cm y 1.250 mm", "(x⍽+⍽2)⍽cm y 1.250⍽mm"],
  ["3 u² y 0,5 km", "3⍽u² y 0,5⍽km"],
];

const SIN_CAMBIO = [
  "Se resta la primera de la segunda − así queda más claro − y se despeja.",
  "Un guion de prosa - como este - no es un operador.",
  "| Recurso | Básico | Completo |\n|---|---|---|\n| Vendas | 2 + 1 | 4 |",
  "Las dos condiciones se resuelven juntas, sin cifras ni signos.",
  "es − dos",
  "de + la",
  /* Sin espacio no hay corte; una palabra que empieza como unidad no es unidad. */
  "12π, √13 y cm² quedan igual",
  "el 5 mide, los 3 metros, 2 unidades y 4 mesas",
];

describe("protegerExpresiones", () => {
  for (const [entrada, esperado] of CASOS) {
    it(`protege «${entrada}»`, () => {
      assert.equal(protegerExpresiones(entrada), duro(esperado));
    });
  }

  it("operador binario: espacio duro a los dos lados; relación: duro antes y normal después", () => {
    const r = protegerExpresiones("(4 − 2)x = 3.210 − 1.926 = 1.284");
    assert.doesNotMatch(r, / [+−·×÷] /);
    assert.doesNotMatch(r, / =/);
    assert.match(r, /\u00A0= /);
  });

  for (const texto of SIN_CAMBIO) {
    it(`no toca «${texto.split("\n")[0]}»`, () => {
      assert.equal(protegerExpresiones(texto), texto);
    });
  }

  it("lista: el marcador queda y el contenido se protege", () => {
    const r = protegerExpresiones("- primera opción: x + y = 5\n- segunda opción: 2x − y = 1");
    assert.equal(r, duro("- primera opción: x⍽+⍽y⍽= 5\n- segunda opción: 2x⍽−⍽y⍽= 1"));
  });

  it("tabla: solo la línea que empieza y termina con | queda intacta; el valor absoluto no es tabla", () => {
    assert.equal(protegerExpresiones("| a + b | 2 |"), "| a + b | 2 |");
    assert.equal(protegerExpresiones("|x − 3| = 5"), duro("|x⍽−⍽3|⍽= 5"));
  });

  it("es idempotente en todos los casos", () => {
    for (const texto of [...CASOS.map(([e]) => e), ...SIN_CAMBIO]) {
      const una = protegerExpresiones(texto);
      assert.equal(protegerExpresiones(una), una);
    }
  });
});
