import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { ComponentType } from "react";
import type { FiguraDiagramaCajon, FiguraItem } from "./descarte.ts";

/* Smoke test de render del diagrama de cajón, montado por FiguraDeItem con
   react-dom/server (mismo cargador TSX que figurasDatos.render.test.ts). Se
   afirma el contrato: role="img" con <title> y <desc>, mediana más gruesa que
   el borde, remate en cada bigote, un rótulo por valor distinto y nombres
   escritos. Datos inventados. */

register(new URL("./pruebas/cargadorTsx.mjs", import.meta.url));

let render: (figura: FiguraItem) => string;

before(async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { FiguraDeItem } = (await import("../../components/advance/FiguraDeItem.tsx")) as { FiguraDeItem: ComponentType<{ figura: FiguraItem }> };
  render = (figura) => renderToStaticMarkup(createElement(FiguraDeItem, { figura }));
});

const UNA: FiguraDiagramaCajon = {
  tipo: "diagrama-cajon",
  orientacion: "horizontal",
  eje: { min: 0, max: 60, paso: 10, etiqueta: "puntos", grilla: true },
  cajas: [{ minimo: 8, q1: 22, mediana: 22, q3: 37, maximo: 55, rotulos: true }],
  descripcion: "Diagrama de cajón de prueba con el primer cuartil igual a la mediana.",
};

const TRES: FiguraDiagramaCajon = {
  tipo: "diagrama-cajon",
  orientacion: "vertical",
  eje: { min: 0, max: 50, paso: 10 },
  cajas: [
    { nombre: "Grupo A", minimo: 6, q1: 14, mediana: 21, q3: 27, maximo: 42 },
    { nombre: "Grupo B", minimo: 11, q1: 19, mediana: 24, q3: 33, maximo: 47 },
    { nombre: "Grupo C", minimo: 3, q1: 9, mediana: 16, q3: 18, maximo: 29 },
  ],
  descripcion: "Tres diagramas de cajón verticales de prueba, grupos A, B y C.",
};

const cuenta = (html: string, patron: RegExp) => (html.match(patron) ?? []).length;

describe("DiagramaCajon: render", () => {
  it("role=img con <title> corto generado y <desc> igual a la descripción, enlazados por aria-labelledby", () => {
    const html = render(UNA);
    assert.match(html, /<svg[^>]*role="img"[^>]*aria-labelledby="([^"]+)-titulo \1-desc"/);
    assert.match(html, /<title id="[^"]+-titulo">Diagrama de cajón<\/title>/);
    assert.ok(html.includes(`>${UNA.descripcion}</desc>`));
    assert.match(render(TRES), /<title[^>]*>Tres diagramas de cajón<\/title>/);
  });

  it("la mediana es más gruesa que el borde de la caja y cada bigote lleva remate", () => {
    const html = render(TRES);
    const grosor = (elemento: string) => Number(html.match(new RegExp(`<[^>]*stroke-width="([0-9.]+)"[^>]*data-elemento="${elemento}"`))?.[1]);
    assert.ok(grosor("mediana") > grosor("rectangulo"), `${grosor("mediana")} vs ${grosor("rectangulo")}`);
    assert.equal(cuenta(html, /data-elemento="remate"/g), 2 * TRES.cajas.length);
    assert.equal(cuenta(html, /data-elemento="mediana"/g), TRES.cajas.length);
  });

  it("q1 igual a la mediana: cuatro rótulos, y el compartido va en negrita", () => {
    const html = render(UNA);
    assert.equal(cuenta(html, /data-rotulo=/g), 4);
    assert.match(html, /font-weight="700" data-rotulo="22"/);
  });

  it("sin rotulos no hay números de valores; los nombres y las marcas del eje sí están", () => {
    const html = render(TRES);
    assert.equal(cuenta(html, /data-rotulo=/g), 0);
    for (const nombre of ["Grupo A", "Grupo B", "Grupo C"]) assert.ok(html.includes(`>${nombre}</text>`), nombre);
    for (const marca of ["0", "10", "20", "30", "40", "50"]) assert.ok(html.includes(`>${marca}</text>`), marca);
    assert.equal(cuenta(html, /data-elemento="grilla"/g), 0);
    assert.equal(cuenta(render(UNA), /data-elemento="grilla"/g), 1);
  });
});
