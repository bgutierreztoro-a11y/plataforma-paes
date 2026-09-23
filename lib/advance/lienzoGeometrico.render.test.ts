import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { ComponentType, ReactNode } from "react";
import type { FiguraItem, FiguraLienzoGeometrico } from "./descarte.ts";
import { ANCHO_CARRIL } from "./lienzoGeometrico.ts";

/* Smoke test de render del lienzo geométrico, montado por FiguraDeItem y por
   FiguraDeAlternativa con react-dom/server (mismo cargador TSX que
   diagramaCajon.render.test.ts). Se afirma el contrato: role="img" con <title>
   y <desc>, viewBox del ancho del carril de la ubicación, letra de 12, contorno
   más grueso que los auxiliares punteados, regiones por máscara con ids únicos
   aunque haya varias figuras en la pantalla, y la nota cuando no va a escala.
   Datos inventados. */

register(new URL("./pruebas/cargadorTsx.mjs", import.meta.url));

let render: (...figuras: FiguraItem[]) => string;
let renderAlternativa: (figura: FiguraItem) => string;

before(async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement, Fragment } = await import("react");
  const { FiguraDeItem } = (await import("../../components/advance/FiguraDeItem.tsx")) as { FiguraDeItem: ComponentType<{ figura: FiguraItem }> };
  const { FiguraDeAlternativa } = (await import("../../components/advance/FiguraDeAlternativa.tsx")) as { FiguraDeAlternativa: ComponentType<{ figura: FiguraItem }> };
  render = (...figuras) => renderToStaticMarkup(createElement(Fragment, null, ...figuras.map((figura, i): ReactNode => createElement(FiguraDeItem, { key: i, figura }))));
  renderAlternativa = (figura) => renderToStaticMarkup(createElement(FiguraDeAlternativa, { figura }));
});

const RECTANGULO_CON_HUECO: FiguraLienzoGeometrico = {
  tipo: "lienzo-geometrico",
  ventana: { xMin: -1.5, xMax: 11.5, yMin: -1.5, yMax: 5.5 },
  puntos: [
    { nombre: "A", x: 0, y: 0 },
    { nombre: "B", x: 10, y: 0 },
    { nombre: "C", x: 10, y: 4 },
    { nombre: "D", x: 0, y: 4 },
    { nombre: "O", x: 5, y: 2, oculto: true },
    { nombre: "H", x: 5, y: 0, oculto: true },
  ],
  poligonos: [{ id: "r", vertices: ["A", "B", "C", "D"] }],
  circunferencias: [{ id: "c", centro: "O", radio: 1.5 }],
  regiones: [{ formas: ["r"], huecos: ["c"] }],
  segmentos: [
    { desde: "A", hasta: "B", rotulo: "10 cm" },
    { desde: "O", hasta: "H", trazo: "punteado" },
  ],
  descripcion: "Rectángulo ABCD de 10 cm por 4 cm con un círculo quitado en el centro, datos de prueba.",
};

describe("LienzoGeometrico: contrato de render", () => {
  it("role img con <title> generado y <desc> igual a la descripcion", () => {
    const html = render(RECTANGULO_CON_HUECO);
    assert.match(html, /role="img"/);
    assert.match(html, /<title id="[^"]+">Figura geométrica<\/title>/);
    assert.ok(html.includes(`<desc id=`) && html.includes(RECTANGULO_CON_HUECO.descripcion));
  });

  it("el viewBox mide el carril: 358 en el enunciado, 316 en una alternativa; la letra es de 12", () => {
    assert.match(render(RECTANGULO_CON_HUECO), new RegExp(`viewBox="0 0 ${ANCHO_CARRIL.enunciado} `));
    assert.match(renderAlternativa(RECTANGULO_CON_HUECO), new RegExp(`viewBox="0 0 ${ANCHO_CARRIL.alternativa} `));
    assert.match(render(RECTANGULO_CON_HUECO), /font-size="12"/);
  });

  it("el contorno es más grueso que el auxiliar, que va punteado", () => {
    const html = render(RECTANGULO_CON_HUECO);
    const contorno = Number(html.match(/data-elemento="contorno"[^>]*stroke-width="([\d.]+)"/)?.[1] ?? html.match(/stroke-width="([\d.]+)"[^>]*data-elemento="contorno"/)?.[1]);
    const auxiliar = html.match(/<g data-segmento="1" data-trazo="punteado"><line[^>]*>/)?.[0] ?? "";
    assert.ok(/stroke-dasharray=/.test(auxiliar), auxiliar);
    assert.ok(Number(auxiliar.match(/stroke-width="([\d.]+)"/)?.[1]) < contorno);
  });

  it("dos figuras en la misma pantalla no comparten ids de trama ni de máscara, y cada url apunta a un id que existe", () => {
    const html = render(RECTANGULO_CON_HUECO, RECTANGULO_CON_HUECO);
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const refs = [...html.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
    assert.ok(refs.length >= 4);
    for (const r of refs) assert.ok(ids.includes(r), r);
    assert.equal((html.match(/<mask /g) ?? []).length, 2);
  });

  it("con aEscala false escribe la nota y la suma al <title>", () => {
    const html = render({ ...RECTANGULO_CON_HUECO, aEscala: false as const });
    assert.match(html, /data-elemento="nota"[^>]*>Figura referencial, no está a escala</);
    assert.match(html, /<title[^>]*>Figura geométrica\. Figura referencial, no está a escala<\/title>/);
    assert.doesNotMatch(render(RECTANGULO_CON_HUECO), /data-elemento="nota"/);
  });

  it("en una alternativa con descripcion, el SVG queda aria-hidden y la descripcion va en sr-only", () => {
    const html = renderAlternativa(RECTANGULO_CON_HUECO);
    assert.match(html, /aria-hidden="true"/);
    assert.ok(html.includes(`<span class="sr-only">${RECTANGULO_CON_HUECO.descripcion}</span>`));
  });
});
