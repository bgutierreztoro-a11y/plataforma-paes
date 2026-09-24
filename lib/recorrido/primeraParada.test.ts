import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { primeraParada, type ContextoParada, type RespuestasBienvenida } from "./primeraParada.ts";
import { moduloDePartida, type UnidadDag } from "./unidadesDag.ts";

const P1 = ["me_cuestan", "mas_o_menos", "me_va_bien", null] as const;
const P2 = ["entender_base", "practicar_prueba", "encontrar_errores", null] as const;
const P3 = ["si", "no", null] as const;

function contexto(cambios: Partial<ContextoParada> = {}): ContextoParada {
  return {
    unidadOrigen: "porcentaje",
    moduloPartida: "enteros-y-racionales",
    advanceVisible: true,
    tieneBanco: () => true,
    leccionBase: (m) => `${m}-base`,
    ...cambios,
  };
}

/* Todas las combinaciones de respuestas, con y sin origen, con Advance prendido y apagado. */
function todas() {
  const casos: { r: RespuestasBienvenida; ctx: ContextoParada }[] = [];
  for (const p1 of P1)
    for (const p2 of P2)
      for (const p3 of P3)
        for (const unidadOrigen of ["porcentaje", null])
          for (const advanceVisible of [true, false])
            casos.push({ r: { p1, p2, p3 }, ctx: contexto({ unidadOrigen, advanceVisible }) });
  return casos;
}

const esAdvance = (tipo: string) => tipo === "descarte" || tipo === "errores";

describe("primeraParada: reglas que valen para todas las combinaciones", () => {
  it("'Me cuestan harto' siempre lleva a una lección de base y nunca ofrece Advance", () => {
    for (const { r, ctx } of todas().filter((c) => c.r.p1 === "me_cuestan")) {
      const pp = primeraParada(r, ctx);
      assert.equal(pp.recomendada.tipo, "leccion");
      assert.ok(![pp.recomendada, ...pp.alternativas].some((p) => esAdvance(p.tipo)));
    }
  });

  it("con Advance apagado, ninguna parada ni alternativa es de Advance", () => {
    for (const { r, ctx } of todas().filter((c) => !c.ctx.advanceVisible)) {
      const pp = primeraParada(r, ctx);
      assert.ok(![pp.recomendada, ...pp.alternativas].some((p) => esAdvance(p.tipo)), JSON.stringify(r));
    }
  });

  it("si dijo que no sigue con porcentaje, nada lo lleva a porcentaje", () => {
    for (const { r, ctx } of todas().filter((c) => c.r.p3 === "no")) {
      const pp = primeraParada(r, ctx);
      assert.ok(![pp.recomendada, ...pp.alternativas].some((p) => p.modulo === "porcentaje"));
    }
  });

  it("las alternativas no repiten la recomendada ni se repiten entre sí", () => {
    for (const { r, ctx } of todas()) {
      const pp = primeraParada(r, ctx);
      const destinos = [pp.recomendada, ...pp.alternativas].map((p) => p.destino);
      assert.equal(new Set(destinos).size, destinos.length);
      assert.ok(pp.alternativas.length >= 1 && pp.alternativas.length <= 2);
    }
  });
});

describe("primeraParada: la tabla de §5, con origen porcentaje (p3 sí) y Advance prendido", () => {
  const ctx = contexto();
  const caso = (p1: RespuestasBienvenida["p1"], p2: RespuestasBienvenida["p2"]) =>
    primeraParada({ p1, p2, p3: "si" }, ctx);
  const destinos = (pp: ReturnType<typeof caso>) => [pp.recomendada, ...pp.alternativas].map((p) => p.destino);

  it("me cuestan, cualquiera: lección de base · diagnóstico · cómo funciona", () => {
    for (const p2 of P2) {
      assert.deepEqual(destinos(caso("me_cuestan", p2)), ["/leccion/porcentaje-base", "/diagnostico", "/como-funciona"]);
    }
  });
  it("más o menos + entender: lección de base · diagnóstico · cómo funciona", () => {
    assert.deepEqual(destinos(caso("mas_o_menos", "entender_base")), ["/leccion/porcentaje-base", "/diagnostico", "/como-funciona"]);
  });
  it("más o menos + practicar: diagnóstico · lección de base · cómo funciona", () => {
    assert.deepEqual(destinos(caso("mas_o_menos", "practicar_prueba")), ["/diagnostico", "/leccion/porcentaje-base", "/como-funciona"]);
  });
  it("más o menos + errores: descarte de origen · lección de base · diagnóstico", () => {
    assert.deepEqual(destinos(caso("mas_o_menos", "encontrar_errores")), ["/advance/descarte/porcentaje", "/leccion/porcentaje-base", "/diagnostico"]);
  });
  it("me va bien + entender: lección de base · descarte · diagnóstico", () => {
    assert.deepEqual(destinos(caso("me_va_bien", "entender_base")), ["/leccion/porcentaje-base", "/advance/descarte/porcentaje", "/diagnostico"]);
  });
  it("me va bien + practicar: descarte de origen · diagnóstico · lección de base", () => {
    assert.deepEqual(destinos(caso("me_va_bien", "practicar_prueba")), ["/advance/descarte/porcentaje", "/diagnostico", "/leccion/porcentaje-base"]);
  });
  it("me va bien + errores: descarte de origen · tus errores · diagnóstico", () => {
    assert.deepEqual(destinos(caso("me_va_bien", "encontrar_errores")), ["/advance/descarte/porcentaje", "/advance/errores", "/diagnostico"]);
  });
  it("saltó, con origen: lección de base del origen · cómo funciona", () => {
    assert.deepEqual(destinos(caso(null, null)), ["/leccion/porcentaje-base", "/como-funciona"]);
    assert.deepEqual(destinos(caso("me_va_bien", null)), ["/leccion/porcentaje-base", "/como-funciona"]);
  });
});

describe("primeraParada: sin origen (puerta B)", () => {
  const ctx = contexto({ unidadOrigen: null });
  it("lo que era descarte de origen cae a diagnóstico", () => {
    for (const p of [
      primeraParada({ p1: "mas_o_menos", p2: "encontrar_errores", p3: null }, ctx),
      primeraParada({ p1: "me_va_bien", p2: "practicar_prueba", p3: null }, ctx),
      primeraParada({ p1: "me_va_bien", p2: "encontrar_errores", p3: null }, ctx),
    ]) {
      assert.equal(p.recomendada.destino, "/diagnostico");
    }
  });
  it("la lección de base es de la primera estación de la Línea 01", () => {
    assert.equal(primeraParada({ p1: "me_cuestan", p2: null, p3: null }, ctx).recomendada.destino, "/leccion/enteros-y-racionales-base");
  });
  it("saltó, sin origen: diagnóstico", () => {
    assert.equal(primeraParada({ p1: null, p2: null, p3: null }, ctx).recomendada.destino, "/diagnostico");
  });
});

describe("primeraParada: motivo", () => {
  it("solo los textos firmados; practicar con descarte y errores sin origen quedan sin motivo", () => {
    const ctx = contexto();
    assert.equal(primeraParada({ p1: "me_cuestan", p2: null, p3: "si" }, ctx).motivo, "me_cuestan");
    assert.equal(primeraParada({ p1: "me_va_bien", p2: "encontrar_errores", p3: "si" }, ctx).motivo, "encontrar_errores_descarte");
    assert.equal(primeraParada({ p1: "me_va_bien", p2: "practicar_prueba", p3: "si" }, ctx).motivo, null);
    assert.equal(primeraParada({ p1: "me_va_bien", p2: "encontrar_errores", p3: null }, contexto({ unidadOrigen: null })).motivo, null);
    assert.equal(primeraParada({ p1: null, p2: null, p3: null }, ctx).motivo, null);
  });
});

describe("moduloDePartida sobre el DAG real", () => {
  it("es enteros-y-racionales, la única estación de Números sin prerrequisitos (medido 2026-09-24)", () => {
    const dag = JSON.parse(readFileSync(path.join(process.cwd(), "content", "diagnostico", "dag-m1.json"), "utf8")) as {
      unidades: UnidadDag[];
    };
    assert.equal(moduloDePartida(dag.unidades), "enteros-y-racionales");
  });
});
