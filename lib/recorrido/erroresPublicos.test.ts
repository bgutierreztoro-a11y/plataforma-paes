import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { obtenerBanco } from "../advance/banco.ts";
import { catalogoCompletoDelModulo } from "../catalogoErrores.ts";
import type { ClaveAlternativa } from "../tipos.ts";
import { ERRORES_PUBLICOS, errorPublico, resultadoDe, textoDeRespuesta } from "./erroresPublicos.ts";

/* Contra el banco y el catálogo reales: la página lee esos archivos, un stub no diría nada. */
function itemDe(e: (typeof ERRORES_PUBLICOS)[number]) {
  const banco = obtenerBanco(e.unidadId);
  assert.ok(banco, `sin banco para ${e.unidadId}`);
  const item = banco.items.find((i) => i.id === e.itemId);
  assert.ok(item, `sin ${e.itemId} en el banco de ${e.unidadId}`);
  const texto = (clave: ClaveAlternativa) => item.alternativas.find((a) => a.clave === clave)!.texto.replace(/ /g, " ");
  const correcta = item.alternativas.find((a) => a.esCorrecta)!.clave;
  return { banco, item, texto, correcta };
}

describe("ERRORES_PUBLICOS contra el banco y el catálogo", () => {
  for (const e of ERRORES_PUBLICOS) {
    it(`${e.unidadId}/${e.errorId}: la tentadora es la alternativa de ese error`, () => {
      const { banco, item, correcta } = itemDe(e);
      assert.ok(catalogoCompletoDelModulo(banco.moduloId).has(e.errorId));
      const tentadora = item.alternativas.find((a) => a.clave === e.tentadora)!;
      assert.equal(tentadora.esCorrecta, false);
      assert.equal(tentadora.esCorrecta ? null : tentadora.errorCatalogado, e.errorId);
      assert.notEqual(correcta, e.tentadora);
    });

    it(`${e.unidadId}/${e.errorId}: hay un texto por alternativa y ninguna figura que dibujar`, () => {
      const { item } = itemDe(e);
      assert.deepEqual(Object.keys(e.casos).sort(), item.alternativas.map((a) => a.clave).sort());
      assert.equal(item.figura, undefined);
      assert.ok(item.alternativas.every((a) => a.figura === undefined));
    });

    it(`${e.unidadId}/${e.errorId}: las cifras de los textos son las de las alternativas`, () => {
      const { texto, correcta } = itemDe(e);
      const tentadora = texto(e.tentadora);
      const buena = texto(correcta);
      const caso = (c: ClaveAlternativa) => [e.casos[c].titulo, ...e.casos[c].parrafos].join(" ");
      assert.ok(caso(e.tentadora).includes(tentadora) && caso(e.tentadora).includes(buena));
      assert.ok(caso(correcta).includes(tentadora) && caso(correcta).includes(buena));
      assert.ok(e.lineaTrasOtra.includes(`en la ${e.tentadora}`));
      assert.ok(e.lineaTrasOtra.includes(`es la ${correcta}`) && e.lineaTrasOtra.includes(buena));
    });
  }
});

describe("los textos son los firmados en docs/recorrido-entrada.md §4", () => {
  const plan = readFileSync(path.join(process.cwd(), "docs", "recorrido-entrada.md"), "utf8");
  for (const e of ERRORES_PUBLICOS) {
    it(`${e.unidadId}/${e.errorId}`, () => {
      const textos = [e.lineaTrasOtra, ...Object.values(e.casos).flatMap((c) => [c.titulo, ...c.parrafos])];
      for (const t of textos) assert.ok(plan.includes(t), `no está en §4: ${t}`);
    });
  }
});

describe("respuesta por alternativa (adv-porcentaje-019)", () => {
  const e = errorPublico("porcentaje", "deshace-porcentaje-con-mismo-porcentaje")!;
  const correcta: ClaveAlternativa = "C";

  it("A, la tentadora: su texto, sin la línea común", () => {
    assert.equal(resultadoDe(e, "A", correcta), "tentadora");
    const r = textoDeRespuesta(e, "A", correcta);
    assert.equal(r.titulo, "Elegiste la alternativa más tentadora.");
    assert.ok(!r.parrafos.includes(e.lineaTrasOtra));
  });

  it("C, la correcta: su texto, sin la línea común", () => {
    assert.equal(resultadoDe(e, "C", correcta), "correcta");
    const r = textoDeRespuesta(e, "C", correcta);
    assert.equal(r.titulo, "Bien, no caíste.");
    assert.ok(!r.parrafos.includes(e.lineaTrasOtra));
  });

  for (const clave of ["B", "D"] as const) {
    it(`${clave}, otro error: su texto y al final la línea común`, () => {
      assert.equal(resultadoDe(e, clave, correcta), "otra");
      const r = textoDeRespuesta(e, clave, correcta);
      assert.equal(r.titulo, "Esa alternativa viene de otro error, distinto al del video.");
      assert.deepEqual(r.parrafos, [...e.casos[clave].parrafos, e.lineaTrasOtra]);
    });
  }

  it("fuera de la lista no hay página", () => {
    assert.equal(errorPublico("porcentaje", "suma-porcentajes-sucesivos"), undefined);
    assert.equal(errorPublico("proporcionalidad", "deshace-porcentaje-con-mismo-porcentaje"), undefined);
  });
});
