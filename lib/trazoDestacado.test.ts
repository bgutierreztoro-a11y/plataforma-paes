import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  corpusDeLeccion,
  esTerminoDestacable,
  marcaDelBloque,
  vecesQueAparece,
} from "./trazoDestacado.ts";

/**
 * Los cinco criterios del trazo de destacador (Fase D).
 *
 * Cada test afirma una **propiedad** de la regla, no un número de la corrida de
 * hoy: qué clase de negrita nunca puede llevar trazo, y qué clase sí. Los
 * recuentos medidos sobre `content/` viven en el comentario de
 * `lib/trazoDestacado.ts` con su fecha, no en un assert — el corpus crece y un
 * assert sobre "160" se rompería sin que nada esté mal.
 *
 * La razón de que esto exista: la regla es heurística, y una heurística sin
 * tests es una opinión. Lo que se vigila acá es que las prohibiciones duras de
 * la fase —nunca sobre matemática, nunca más de uno por bloque— sean
 * propiedades del código y no una intención del comentario.
 */

describe("esTerminoDestacable: la forma del término", () => {
  test("un término corto y sin matemática califica", () => {
    for (const t of ["vértice", "discriminante", "punto más alto", "producto nulo"]) {
      assert.equal(esTerminoDestacable(t), true, t);
    }
  });

  test("la notación matemática nunca califica", () => {
    for (const t of ["√200", "3⁻²", "(a + b)²", "ⁿ√a", "7d ≥ 56", "2⁷", "0,25 / 1024", "50%"]) {
      assert.equal(esTerminoDestacable(t), false, t);
    }
  });

  test("una variable algebraica suelta nunca califica", () => {
    // Es el mismo criterio "no es matemática": una letra sin operador al lado
    // no la puede ver el regex, así que la ve el largo.
    for (const t of ["a", "b", "n", "r", "t", "x", "es", "no", "un"]) {
      assert.equal(esTerminoDestacable(t), false, t);
    }
  });

  test("una frase nunca califica: ni por largo ni por puntuación", () => {
    for (const t of [
      "Vuelve a leer lo que escribiste ahí.",
      "3a + 4b se puede escribir como 7ab",
      "Ejercicio.",
      "Parte 1.",
      "¿y medio escalón?",
      "Forma más simple:",
    ]) {
      assert.equal(esTerminoDestacable(t), false, t);
    }
  });

  test("el límite es cuatro palabras", () => {
    assert.equal(esTerminoDestacable("uno dos tres cuatro"), true);
    assert.equal(esTerminoDestacable("uno dos tres cuatro cinco"), false);
  });
});

describe("vecesQueAparece: el criterio de repetición", () => {
  test("no distingue mayúsculas", () => {
    assert.equal(vecesQueAparece("Ceros y más ceros", "ceros"), 2);
  });

  test("respeta la frontera de palabra", () => {
    // "red" no está dentro de "pared" ni de "redes".
    assert.equal(vecesQueAparece("una pared con redes", "red"), 0);
    assert.equal(vecesQueAparece("la red y otra red", "red"), 2);
  });

  test("la frontera trata bien los acentos y la ñ", () => {
    // Con el `\b` de JavaScript, que es ASCII, la tilde contaría como
    // separador y "área" aparecería dentro de "subárea".
    assert.equal(vecesQueAparece("la subárea del patio", "área"), 0);
    assert.equal(vecesQueAparece("el área y su área", "área"), 2);
    assert.equal(vecesQueAparece("la montaña", "aña"), 0);
  });

  test("cuenta apariciones con negrita y sin ella, una vez quitados los asteriscos", () => {
    const corpus = corpusDeLeccion({ a: "el **vértice** de la parábola", b: "ese vértice" });
    assert.equal(vecesQueAparece(corpus, "vértice"), 2);
  });
});

describe("marcaDelBloque: qué se lleva el trazo", () => {
  const corpus = corpusDeLeccion({
    uno: "El **vértice** es el punto más alto.",
    dos: "Ese vértice se encuentra derivando.",
    tres: "El **discriminante** decide.",
  });

  test("elige el término que se repite", () => {
    assert.equal(marcaDelBloque("El **vértice** es el punto.", corpus), "vértice");
  });

  test("descarta el término que aparece una sola vez", () => {
    // "discriminante" está en el corpus una vez sola.
    assert.equal(marcaDelBloque("El **discriminante** decide.", corpus), undefined);
  });

  test("elige el primero que califica, saltándose los que no", () => {
    const bloque = "Con **√200** y **n** llegamos al **vértice**.";
    assert.equal(marcaDelBloque(bloque, corpus), "vértice");
  });

  test("sin corpus no hay trazo", () => {
    // Es lo que deja tablas, citas y cualquier llamador sin lección a mano
    // renderizando exactamente igual que antes de la fase.
    assert.equal(marcaDelBloque("El **vértice** es el punto.", undefined), undefined);
  });

  test("un bloque sin negrita no produce marca", () => {
    assert.equal(marcaDelBloque("Un párrafo sin ninguna marca.", corpus), undefined);
  });

  test("devuelve un solo término aunque el bloque tenga muchos válidos", () => {
    const c = corpusDeLeccion({ a: "vértice vértice máximo máximo mínimo mínimo" });
    const bloque = "El **vértice**, el **máximo** y el **mínimo**.";
    assert.equal(marcaDelBloque(bloque, c), "vértice");
  });
});

describe("corpusDeLeccion", () => {
  test("recorre el objeto entero y saca los asteriscos", () => {
    const corpus = corpusDeLeccion({
      pasos: [{ bloques: [{ contenido: "**área** del patio" }] }],
      itemsPAES: [{ alternativas: [{ texto: "el área" }] }],
    });
    assert.equal(corpus.includes("*"), false);
    assert.equal(vecesQueAparece(corpus, "área"), 2);
  });

  test("no revienta con nulos ni con números", () => {
    assert.equal(typeof corpusDeLeccion({ a: null, b: 3, c: [null, "hola"] }), "string");
    assert.equal(corpusDeLeccion(undefined), "");
  });
});
