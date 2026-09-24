import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { explorar, inicioBienvenida, responder, saltar, terminada, validarEnvio } from "./flujoBienvenida.ts";

describe("flujo de la bienvenida", () => {
  it("puerta A tiene 3 preguntas y la B 2", () => {
    assert.deepEqual(inicioBienvenida(true).preguntas, ["p1", "p2", "p3"]);
    assert.deepEqual(inicioBienvenida(false).preguntas, ["p1", "p2"]);
  });

  it("responder las tres deja las tres respuestas y no marca saltada", () => {
    let e = inicioBienvenida(true);
    e = responder(e, "me_va_bien");
    e = responder(e, "encontrar_errores");
    e = responder(e, "si");
    assert.ok(terminada(e));
    assert.deepEqual([e.p1, e.p2, e.p3, e.saltada], ["me_va_bien", "encontrar_errores", "si", false]);
  });

  for (const conOrigen of [true, false]) {
    const total = conOrigen ? 3 : 2;
    for (let cual = 0; cual < total; cual++) {
      it(`"Saltar" funciona en la pregunta ${cual + 1} de ${total}`, () => {
        let e = inicioBienvenida(conOrigen);
        const valores = ["mas_o_menos", "practicar_prueba", "no"] as const;
        for (let i = 0; i < total; i++) e = i === cual ? saltar(e) : responder(e, valores[i]);
        assert.ok(terminada(e));
        assert.equal(e.saltada, true);
        assert.equal(e[e.preguntas[cual]], null);
        for (let i = 0; i < total; i++) if (i !== cual) assert.equal(e[e.preguntas[i]], valores[i]);
      });
    }
  }

  it("explorar por su cuenta termina sin respuestas y marca saltada", () => {
    const e = explorar(responder(inicioBienvenida(true), "me_cuestan"));
    assert.ok(terminada(e));
    assert.deepEqual([e.p1, e.p2, e.p3, e.saltada], [null, null, null, true]);
  });
});

describe("validarEnvio", () => {
  it("acepta valores cerrados y null", () => {
    assert.deepEqual(validarEnvio({ p1: "me_cuestan", p2: null, p3: "si", saltada: true }), {
      p1: "me_cuestan",
      p2: null,
      p3: "si",
      saltada: true,
    });
  });

  it("rechaza texto libre, claves de más y tipos equivocados", () => {
    for (const crudo of [
      null,
      [],
      "texto",
      { p1: "me gusta", p2: null, p3: null, saltada: false },
      { p1: null, p2: null, p3: null, saltada: false, nombre: "Juan" },
      { p1: null, p2: null, p3: null, saltada: "no" },
      { p1: null, p2: null, saltada: false },
    ]) {
      assert.equal(validarEnvio(crudo), null, JSON.stringify(crudo));
    }
  });
});
