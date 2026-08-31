import test from "node:test";
import assert from "node:assert/strict";
import { agruparErroresDelCierre } from "./erroresDelCierre.ts";
import type { RespuestaRegistrada } from "./estadoSetItems.ts";
import type { ItemCliente } from "./sanitizar.ts";

/* Cuatro ítems que cubren los casos que de verdad existen en content/cierres/:
   - i1 y i3 comparten `error-5` y ambos traen descripción (cierre CON catálogo).
   - i2 lleva `error-9` sin descripción: el tag existe y el catálogo no lo
     define, que es lo que pasa en los 5 cierres sin `catalogoErrores`.
   - i4 tiene un distractor sin `errorCatalogado`, el caso más común de todos. */
const ITEMS = [
  {
    id: "i1",
    alternativas: [
      { clave: "A", texto: "a", esCorrecta: true },
      {
        clave: "B",
        texto: "b",
        esCorrecta: false,
        errorCatalogado: "error-5",
        descripcionError: "Invirtió el signo al leer la raíz desde el factor.",
      },
    ],
  },
  {
    id: "i2",
    alternativas: [
      { clave: "A", texto: "a", esCorrecta: true },
      { clave: "C", texto: "c", esCorrecta: false, errorCatalogado: "error-9" },
    ],
  },
  {
    id: "i3",
    alternativas: [
      { clave: "A", texto: "a", esCorrecta: true },
      {
        clave: "D",
        texto: "d",
        esCorrecta: false,
        errorCatalogado: "error-5",
        descripcionError: "Invirtió el signo al leer la raíz desde el factor.",
      },
    ],
  },
  {
    id: "i4",
    alternativas: [
      { clave: "A", texto: "a", esCorrecta: true },
      { clave: "B", texto: "b", esCorrecta: false },
    ],
  },
] as unknown as ItemCliente[];

function fallo(itemId: string, claveElegida: string): RespuestaRegistrada {
  return { itemId, correcta: false, tiempoMs: 1000, claveElegida } as RespuestaRegistrada;
}

function acierto(itemId: string): RespuestaRegistrada {
  return { itemId, correcta: true, tiempoMs: 1000, claveElegida: "A" } as RespuestaRegistrada;
}

test("dos ítems con el mismo errorCatalogado caen en un solo grupo", () => {
  const grupos = agruparErroresDelCierre(ITEMS, [fallo("i1", "B"), fallo("i3", "D")]);

  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].id, "error-5");
  /* El número es la posición en el cierre, en base 1: i1 → 1, i3 → 3. Es lo que
     el estudiante ve en la franja, no el índice del array. */
  assert.deepEqual(grupos[0].numerosDeItem, [1, 3]);
});

test("un tag sin entrada en el catálogo da grupo sin descripción, no lo descarta", () => {
  const [grupo] = agruparErroresDelCierre(ITEMS, [fallo("i2", "C")]);

  assert.equal(grupo.id, "error-9");
  assert.equal(grupo.descripcion, undefined);
  assert.deepEqual(grupo.numerosDeItem, [2]);
});

test("un fallo cuyo distractor no está catalogado no entra en ningún grupo", () => {
  assert.deepEqual(agruparErroresDelCierre(ITEMS, [fallo("i4", "B")]), []);
});

test("los aciertos no aportan grupos aunque su alternativa exista", () => {
  assert.deepEqual(agruparErroresDelCierre(ITEMS, [acierto("i1"), acierto("i2")]), []);
});

test("una corrida perfecta devuelve lista vacía", () => {
  assert.deepEqual(agruparErroresDelCierre(ITEMS, []), []);
});

test("los grupos salen en el orden en que el estudiante cometió los errores", () => {
  const grupos = agruparErroresDelCierre(ITEMS, [fallo("i2", "C"), fallo("i1", "B")]);

  assert.deepEqual(
    grupos.map((g) => g.id),
    ["error-9", "error-5"],
  );
});

test("un cierre sin ningún tag —el caso de cierre-v0— no produce grupos", () => {
  const sinTags = [
    {
      id: "v1",
      alternativas: [
        { clave: "A", texto: "a", esCorrecta: true },
        { clave: "B", texto: "b", esCorrecta: false },
      ],
    },
  ] as unknown as ItemCliente[];

  assert.deepEqual(agruparErroresDelCierre(sinTags, [fallo("v1", "B")]), []);
});
