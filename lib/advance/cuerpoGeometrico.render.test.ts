import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { ComponentType, ReactNode } from "react";
import type { FiguraCuerpoGeometrico, FiguraItem } from "./descarte.ts";
import { ANCHO_CARRIL } from "./lienzoGeometrico.ts";

/* Smoke test de render del cuerpo geométrico, montado por FiguraDeItem y por
   SolucionDescarte con react-dom/server (mismo cargador TSX que
   lienzoGeometrico.render.test.ts). Se afirma el contrato: role="img" con
   <title> y <desc>, viewBox del ancho del carril de la ubicación, letra de 12,
   ocultas punteadas y más delgadas que las visibles, ids únicos con varias
   figuras en la pantalla, y ocultas false sin punteado. Datos inventados. */

register(new URL("./pruebas/cargadorTsx.mjs", import.meta.url));

let render: (...figuras: FiguraItem[]) => string;
let renderSolucion: (solucion: string, figura?: FiguraItem) => string;

before(async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement, Fragment } = await import("react");
  const { FiguraDeItem } = (await import("../../components/advance/FiguraDeItem.tsx")) as { FiguraDeItem: ComponentType<{ figura: FiguraItem }> };
  const { SolucionDescarte } = (await import("../../components/advance/SolucionDescarte.tsx")) as { SolucionDescarte: ComponentType<{ solucion: string; figura?: FiguraItem }> };
  render = (...figuras) => renderToStaticMarkup(createElement(Fragment, null, ...figuras.map((figura, i): ReactNode => createElement(FiguraDeItem, { key: i, figura }))));
  renderSolucion = (solucion, figura) => renderToStaticMarkup(createElement(SolucionDescarte, { solucion, figura }));
});

const CAJA: FiguraCuerpoGeometrico = {
  tipo: "cuerpo-geometrico",
  piezas: [{ cuerpo: "paralelepipedo", largo: 10, alto: 6, ancho: 4 }],
  cotas: [
    { desde: { x: 0, y: 0, z: 0 }, hasta: { x: 10, y: 0, z: 0 }, rotulo: "10 cm" },
    { desde: { x: 0, y: 0, z: 0 }, hasta: { x: 0, y: 6, z: 0 }, rotulo: "6 cm" },
  ],
  descripcion: "Paralelepípedo de 10 cm por 6 cm por 4 cm, datos de prueba.",
};

describe("CuerpoGeometrico: contrato de render", () => {
  it("role img con <title> generado y <desc> igual a la descripcion", () => {
    const html = render(CAJA);
    assert.match(html, /role="img"/);
    assert.match(html, /<title id="[^"]+">Cuerpo geométrico<\/title>/);
    assert.ok(html.includes("<desc id=") && html.includes(CAJA.descripcion));
    assert.match(html, /data-cuerpo-geometrico="enunciado"/);
  });

  it("el viewBox mide el carril del enunciado y la letra es de 12", () => {
    const html = render(CAJA);
    assert.match(html, new RegExp(`viewBox="0 0 ${ANCHO_CARRIL.enunciado} `));
    assert.match(html, /font-size="12"/);
  });

  it("las ocultas van punteadas y más delgadas que las visibles", () => {
    const html = render(CAJA);
    const grupo = (nombre: string) => html.match(new RegExp(`<g [^>]*data-elemento="${nombre}"[^>]*>`))?.[0] ?? "";
    const ocultas = grupo("ocultas");
    const visibles = grupo("visibles");
    assert.match(ocultas, /stroke-dasharray=/);
    assert.doesNotMatch(visibles, /stroke-dasharray=/);
    const ancho = (g: string) => Number(g.match(/stroke-width="([\d.]+)"/)?.[1]);
    assert.ok(ancho(ocultas) < ancho(visibles));
  });

  it("con ocultas false no hay grupo punteado", () => {
    assert.doesNotMatch(render({ ...CAJA, ocultas: false as const }), /data-elemento="ocultas"/);
  });

  it("dos figuras en la misma pantalla no comparten ids y aria-labelledby apunta a ids que existen", () => {
    const html = render(CAJA, CAJA);
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const refs = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].flatMap((m) => m[1].split(" "));
    assert.equal(refs.length, 4);
    for (const r of refs) assert.ok(ids.includes(r), r);
  });

  it("un cilindro dibuja tapas, llaves y rótulos", () => {
    const html = render({
      tipo: "cuerpo-geometrico",
      piezas: [{ cuerpo: "cilindro", radio: 3, altura: 8 }],
      cotas: [
        { pieza: 0, medida: "diametro", rotulo: "6 cm" },
        { pieza: 0, medida: "altura", rotulo: "8 cm" },
      ],
      descripcion: "Cilindro de 6 cm de diámetro y 8 cm de altura, datos de prueba.",
    });
    assert.match(html, / A [\d.]+ [\d.]+ 0 0 0 /);
    assert.match(html, /data-elemento="llaves"/);
    assert.equal((html.match(/data-rotulo="cota"/g) ?? []).length, 2);
  });
});

describe("SolucionDescarte: el cuerpo como figura de la solución", () => {
  it("va en la tarjeta con el carril de la solución (330) y antes del texto", () => {
    const html = renderSolucion("Solución de prueba.", CAJA);
    assert.match(html, /data-cuerpo-geometrico="solucion"/);
    assert.match(html, new RegExp(`viewBox="0 0 ${ANCHO_CARRIL.solucion} `));
    assert.ok(html.indexOf("<svg") < html.indexOf("Solución de prueba."));
  });
});
