import test from "node:test";
import assert from "node:assert/strict";
import {
  registrarOcurrenciaDeError,
  reiniciarOcurrenciasDeError,
  rotuloDeError,
} from "./progresoSesion.ts";

/* El contador vive en memoria de módulo, así que los tests comparten estado:
   cada uno parte limpio a mano. Es el mismo motivo por el que existe
   `reiniciarOcurrenciasDeError` — la sesión real nunca lo llama. */

const OLVIDA_MITAD = "Olvida el factor 1/2 en una fórmula de área que lo incluye.";
const SUMA_LADOS = "Trata el teorema de Pitágoras como una operación lineal entre los lados.";

test("la ocurrencia devuelve el total acumulado, incluyéndose a sí misma", () => {
  reiniciarOcurrenciasDeError();
  assert.equal(registrarOcurrenciaDeError(OLVIDA_MITAD), 1);
  assert.equal(registrarOcurrenciaDeError(OLVIDA_MITAD), 2);
  assert.equal(registrarOcurrenciaDeError(OLVIDA_MITAD), 3);
});

test("dos errores distintos llevan cuentas independientes", () => {
  reiniciarOcurrenciasDeError();
  registrarOcurrenciaDeError(OLVIDA_MITAD);
  registrarOcurrenciaDeError(OLVIDA_MITAD);
  assert.equal(registrarOcurrenciaDeError(SUMA_LADOS), 1);
  assert.equal(registrarOcurrenciaDeError(OLVIDA_MITAD), 3);
});

/* La propiedad que sostiene la decisión de clave del módulo: el contador NO se
   parte por archivo. El mismo error, encontrado en dos lecciones distintas de un
   módulo, es una sola cuenta — que es lo que "te ha pasado N veces" significa
   para el estudiante. Lo que lo hace correcto es que `docs/reglas-modulo.md §5`
   obliga a copiar la descripción literalmente entre archivos del módulo. */
test("el mismo error en dos archivos distintos sigue siendo una sola cuenta", () => {
  reiniciarOcurrenciasDeError();
  registrarOcurrenciaDeError(OLVIDA_MITAD); // en figuras-borde-y-superficie
  assert.equal(registrarOcurrenciaDeError(OLVIDA_MITAD), 2); // en cierre-figuras-geometricas
});

test("el conteo empieza de cero en cada sesión", () => {
  reiniciarOcurrenciasDeError();
  registrarOcurrenciaDeError(OLVIDA_MITAD);
  reiniciarOcurrenciasDeError();
  assert.equal(registrarOcurrenciaDeError(OLVIDA_MITAD), 1);
});

// ---------- el rótulo que se muestra ----------

/* La regla de copy honesto: con una sola ocurrencia no se afirma nada sobre el
   pasado, porque el contador no lo conoce. Recién desde la segunda hay un hecho
   de esta misma sesión que nombrar. */
test("la primera vez el rótulo no nombra ningún conteo", () => {
  assert.equal(rotuloDeError("error-7", 1), "Error 07");
});

test("desde la segunda vez el rótulo nombra el conteo", () => {
  assert.equal(rotuloDeError("error-7", 2), "Error 07 · te ha pasado 2 veces");
  assert.equal(rotuloDeError("error-12", 5), "Error 12 · te ha pasado 5 veces");
});

test("el id se rellena a dos dígitos y conserva los de tres", () => {
  assert.equal(rotuloDeError("error-1", 1), "Error 01");
  assert.equal(rotuloDeError("error-104", 1), "Error 104");
});

/* Los ids de `content/errores/` llevan la unidad por delante. No siguen la forma
   `error-N`, así que se muestran tal cual en vez de forzarlos a un número que no
   tienen. */
test("un id que no es `error-N` se muestra sin transformar", () => {
  assert.equal(
    rotuloDeError("ecuaciones-inecuaciones/error-4", 3),
    "ecuaciones-inecuaciones/error-4 · te ha pasado 3 veces",
  );
});
