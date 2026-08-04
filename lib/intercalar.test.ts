import test from "node:test";
import assert from "node:assert/strict";
import {
  intercalarPorClave,
  esSatisfacible,
  hayConsecutivosIguales,
} from "./intercalar.ts";

const clave = (s: string) => s.split("-")[0];

test("la propiedad se cumple: no quedan dos consecutivos de la misma clave", () => {
  const items = ["a-1", "a-2", "a-3", "b-1", "b-2", "c-1", "c-2", "d-1"];
  const orden = intercalarPorClave(items, clave);
  assert.equal(hayConsecutivosIguales(orden, clave), false);
});

test("no pierde, no duplica y no muta la entrada", () => {
  const items = ["a-1", "a-2", "a-3", "b-1", "b-2", "c-1", "c-2", "d-1"];
  const copia = [...items];
  const orden = intercalarPorClave(items, clave);
  assert.deepEqual([...orden].sort(), [...items].sort());
  assert.deepEqual(items, copia);
});

test("es determinista: dos corridas dan exactamente el mismo orden", () => {
  const items = ["a-1", "b-1", "a-2", "c-1", "a-3", "b-2", "d-1", "c-2"];
  assert.deepEqual(intercalarPorClave(items, clave), intercalarPorClave(items, clave));
});

test("insatisfacible: devuelve el orden original intacto", () => {
  /* 3 de 4 son "a": con ceil(4/2)=2 puestos no adyacentes, dos "a" quedan
     juntas sí o sí. Un orden a medio intercalar sería peor que el del autor. */
  const items = ["a-1", "a-2", "a-3", "b-1"];
  assert.equal(esSatisfacible(items, clave), false);
  assert.deepEqual(intercalarPorClave(items, clave), items);
});

test("el borde exacto de satisfacibilidad se intercala, no cae al fallback", () => {
  const items = ["a-1", "b-1", "a-2", "c-1", "a-3", "d-1"]; // 3 "a" de 6, ceil(6/2)=3
  assert.equal(esSatisfacible(items, clave), true);
  assert.equal(hayConsecutivosIguales(intercalarPorClave(items, clave), clave), false);
});

test("una sola clave nunca es satisfacible con 2 o más elementos", () => {
  /* Con dos elementos de la misma clave quedan adyacentes por definición:
     ceil(2/2) = 1 puesto no adyacente para 2 apariciones. */
  assert.equal(esSatisfacible(["a-1"], clave), true);
  assert.equal(esSatisfacible(["a-1", "a-2"], clave), false);
  assert.equal(esSatisfacible(["a-1", "a-2", "a-3"], clave), false);
  assert.deepEqual(intercalarPorClave(["a-1", "a-2", "a-3"], clave), ["a-1", "a-2", "a-3"]);
});

test("casos degenerados: vacío, uno y dos elementos", () => {
  assert.deepEqual(intercalarPorClave([], clave), []);
  assert.deepEqual(intercalarPorClave(["a-1"], clave), ["a-1"]);
  assert.deepEqual(intercalarPorClave(["a-1", "a-2"], clave), ["a-1", "a-2"]);
});

test("el reparto real del cierre publicable sí es intercalable por habilidad", () => {
  /* content/cierres/cierre-ecuaciones-lineales.json: resolver x3, modelar x3,
     representar x1, argumentar x1. El máximo (3) no supera ceil(8/2)=4.
     Esto prueba la ARITMÉTICA del reparto, no que `habilidad` sea la
     estrategia de resolución correcta para agrupar — no lo es. Ver
     lib/intercalar.ts y docs/pendientes.md. */
  const cierre = [
    { id: "cierre-ecuaciones-1", habilidad: "resolver" },
    { id: "cierre-inecuaciones-1", habilidad: "resolver" },
    { id: "cierre-inecuaciones-2", habilidad: "representar" },
    { id: "cierre-ecuaciones-4", habilidad: "modelar" },
    { id: "cierre-ecuaciones-5", habilidad: "resolver" },
    { id: "cierre-inecuaciones-3", habilidad: "modelar" },
    { id: "cierre-inecuaciones-4", habilidad: "argumentar" },
    { id: "cierre-ecuaciones-8", habilidad: "modelar" },
  ];
  const porHabilidad = (i: (typeof cierre)[number]) => i.habilidad;
  assert.equal(esSatisfacible(cierre, porHabilidad), true);
  const orden = intercalarPorClave(cierre, porHabilidad);
  assert.equal(hayConsecutivosIguales(orden, porHabilidad), false);
  assert.equal(orden.length, 8);
});
