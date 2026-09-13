import test from "node:test";
import assert from "node:assert/strict";
import {
  registrarOcurrenciaDeError,
  reiniciarOcurrenciasDeError,
  ocurrenciasDeErrorDeSesion,
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

/* El getter que alimenta la pantalla 10: cada error con su conteo, en el orden
   en que aparecieron por primera vez, y vacío tras reiniciar —el estado en que
   queda la sesión después de un reload. */
test("el getter de sesión devuelve cada error con su conteo y se vacía al reiniciar", () => {
  reiniciarOcurrenciasDeError();
  registrarOcurrenciaDeError(OLVIDA_MITAD);
  registrarOcurrenciaDeError(SUMA_LADOS);
  registrarOcurrenciaDeError(OLVIDA_MITAD);
  assert.deepEqual(ocurrenciasDeErrorDeSesion(), [
    { descripcion: OLVIDA_MITAD, veces: 2 },
    { descripcion: SUMA_LADOS, veces: 1 },
  ]);
  reiniciarOcurrenciasDeError();
  assert.deepEqual(ocurrenciasDeErrorDeSesion(), []);
});

// ---------- el rótulo que se muestra ----------

/* La regla de copy honesto: con una sola ocurrencia no se afirma nada sobre el
   pasado, porque el contador no lo conoce. Recién desde la segunda hay un hecho
   de esta misma sesión que nombrar. */
test("la primera vez el rótulo no nombra ningún conteo", () => {
  assert.equal(rotuloDeError("deshace-porcentaje-con-mismo-porcentaje", 1), "Deshace porcentaje con mismo porcentaje");
});

test("desde la segunda vez el rótulo nombra el conteo", () => {
  assert.equal(rotuloDeError("suma-denominadores", 2), "Suma denominadores, te ha pasado 2 veces");
  assert.equal(rotuloDeError("omite-coeficiente-de-posicion", 5), "Omite coeficiente de posicion, te ha pasado 5 veces");
});

/* D4 (2026-09-13): cuando la pantalla tiene el `titulo` del catálogo, ese es el
   rótulo; el slug humanizado es solo la caída para los catálogos sin copy. */
test("con titulo del catálogo, el rótulo es el titulo", () => {
  assert.equal(rotuloDeError("elige-mal-base-del-porcentaje", 1, "Elegir mal la base del porcentaje"), "Elegir mal la base del porcentaje");
  assert.equal(rotuloDeError("elige-mal-base-del-porcentaje", 3, "Elegir mal la base del porcentaje"), "Elegir mal la base del porcentaje, te ha pasado 3 veces");
  assert.equal(rotuloDeError("elige-mal-base-del-porcentaje", 1, "   "), "Elige mal base del porcentaje");
});

/* Los ids de `content/errores/` llevan la unidad por delante. No son un slug
   pelado, así que se muestran tal cual en vez de humanizarlos. */
test("un id con prefijo de unidad se muestra sin transformar", () => {
  assert.equal(
    rotuloDeError("ecuaciones-e-inecuaciones-primer-grado/omite-dividir-por-coeficiente", 3),
    "ecuaciones-e-inecuaciones-primer-grado/omite-dividir-por-coeficiente, te ha pasado 3 veces",
  );
});
