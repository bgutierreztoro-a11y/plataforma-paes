import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { ComponentType } from "react";
import type { FiguraDatos, FiguraItem } from "./descarte.ts";

/* Smoke test de render de las cinco figuras de datos: cada componente de
   components/advance/figuras/ se monta con react-dom/server y se afirma lo que
   el contrato promete (role="img" y aria-label desde los datos en los SVG,
   <table> real en la tabla, series distinguibles sin color). Node no compila
   JSX: los .tsx los compila lib/advance/pruebas/cargadorTsx.mjs con el SWC de
   Next, registrado acá antes del import dinámico. */

register(new URL("./pruebas/cargadorTsx.mjs", import.meta.url));

type Componente<F> = ComponentType<{ figura: F }>;
type Render = (figura: FiguraItem) => string;

let render: Render;

before(async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { FiguraDeItem } = (await import("../../components/advance/FiguraDeItem.tsx")) as { FiguraDeItem: Componente<FiguraItem> };
  render = (figura) => renderToStaticMarkup(createElement(FiguraDeItem, { figura }));
});

const EJE_X = { etiqueta: "Categoría" };
const EJE_Y = { etiqueta: "Frecuencia" };

const TABLA: FiguraDatos = {
  tipo: "tabla-datos",
  titulo: "Frecuencias",
  columnas: ["Intervalo", "f", "F"],
  filas: [
    ["[0, 10[", 4, 4],
    ["[10, 20[", "?", 11],
  ],
  filaTotal: ["Total", 11, ""],
};

const BARRAS: FiguraDatos = {
  tipo: "grafico-barras",
  categorias: ["A", "B", "C"],
  series: [
    { nombre: "Serie 1", valores: [4, 7, 2] },
    { nombre: "Serie 2", valores: [3, 5, 6] },
  ],
  ejeX: EJE_X,
  ejeY: EJE_Y,
  mostrarValores: true,
};

const HISTOGRAMA: FiguraDatos = {
  tipo: "histograma",
  intervalos: [
    { desde: 0, hasta: 10 },
    { desde: 10, hasta: 20 },
    { desde: 20, hasta: 30 },
  ],
  frecuencias: [4, 0, 9],
  ejeX: { etiqueta: "Valor" },
  ejeY: EJE_Y,
  poligono: true,
};

const LINEAS: FiguraDatos = {
  tipo: "grafico-lineas",
  categorias: ["10", "20", "30"],
  series: [
    { nombre: "Serie 1", valores: [4, 11, 20] },
    { nombre: "Serie 2", valores: [2, 6, 13] },
    { nombre: "Serie 3", valores: [1, 3, 20] },
  ],
  ejeX: { etiqueta: "Borde superior" },
  ejeY: { etiqueta: "Frecuencia acumulada" },
};

const CIRCULAR: FiguraDatos = {
  tipo: "grafico-circular",
  sectores: [
    { etiqueta: "A", valor: 12 },
    { etiqueta: "B", valor: 6 },
    { etiqueta: "C", valor: 6 },
  ],
  modoEtiqueta: "porcentaje",
};

/** Cuenta las apariciones de un atributo data-elemento. */
const cuenta = (html: string, elemento: string) => (html.match(new RegExp(`data-elemento="${elemento}"`, "g")) ?? []).length;

describe("render de las figuras de datos (smoke)", () => {
  it("tabla-datos: <table> real con caption, encabezados de fila, tfoot y la incógnita marcada", () => {
    const html = render(TABLA);
    assert.match(html, /<table/);
    assert.match(html, /<caption[^>]*>Frecuencias<\/caption>/);
    assert.equal((html.match(/scope="col"/g) ?? []).length, 3);
    assert.equal((html.match(/scope="row"/g) ?? []).length, 3);
    assert.match(html, /<tfoot>/);
    assert.equal((html.match(/data-incognita=""/g) ?? []).length, 1);
    assert.doesNotMatch(html, /role="img"/);
  });

  it("grafico-barras: role img, aria-label desde los datos, una barra por serie y categoría, leyenda y valores", () => {
    const html = render(BARRAS);
    assert.match(html, /<svg[^>]*role="img"/);
    assert.match(html, /aria-label="Gráfico de barras, Frecuencia por Categoría: Serie 1: A 4, B 7, C 2\. Serie 2: A 3, B 5, C 6\."/);
    assert.equal(cuenta(html, "barra"), 6);
    assert.equal(cuenta(html, "categoria"), 3);
    assert.equal(cuenta(html, "leyenda"), 1);
    /* Sin color: la segunda serie va rayada (pattern), la primera sólida. */
    assert.match(html, /<pattern id="r/);
    assert.match(html, /fill="url\(#r/);
    assert.match(html, /viewBox="0 0 320 220"/);
  });

  it("histograma: role img, aria-label intervalo por intervalo, barras pegadas, bordes numerados y polígono", () => {
    const html = render(HISTOGRAMA);
    assert.match(html, /<svg[^>]*role="img"/);
    assert.match(html, /aria-label="Histograma, Frecuencia por Valor: de 0 a 10 4, de 10 a 20 0, de 20 a 30 9\."/);
    assert.equal(cuenta(html, "barra"), 3);
    assert.equal(cuenta(html, "poligono"), 1);
    assert.match(html, />30<\/text>/);
  });

  it("grafico-lineas: role img, tres series con trazo y marcador distintos, un punto por categoría", () => {
    const html = render(LINEAS);
    assert.match(html, /<svg[^>]*role="img"/);
    assert.match(html, /aria-label="Gráfico de líneas, Frecuencia acumulada por Borde superior: Serie 1: /);
    assert.equal(cuenta(html, "serie"), 3);
    assert.equal(cuenta(html, "punto"), 9);
    assert.match(html, /stroke-dasharray="7 4"/);
    assert.match(html, /stroke-dasharray="1.5 4.5"/);
    assert.equal(cuenta(html, "leyenda"), 1);
  });

  it("grafico-circular: role img, un sector y un rótulo por dato, texto del modo", () => {
    const html = render(CIRCULAR);
    assert.match(html, /<svg[^>]*role="img"/);
    assert.match(html, /aria-label="Gráfico circular: A 50 %, B 25 %, C 25 %\."/);
    assert.equal(cuenta(html, "sector"), 3);
    assert.equal(cuenta(html, "rotulo-sector"), 3);
    assert.match(html, /<tspan class="num"> 50 %<\/tspan>/);
    const sinTexto = render({ ...CIRCULAR, modoEtiqueta: "ninguno" } as FiguraDatos);
    assert.match(sinTexto, /aria-label="Gráfico circular: A, B, C\."/);
    assert.doesNotMatch(sinTexto, /%/);
  });

  it("colores solo por tokens: ningún color literal en los cinco", () => {
    for (const figura of [TABLA, BARRAS, HISTOGRAMA, LINEAS, CIRCULAR]) {
      const html = render(figura);
      assert.doesNotMatch(html, /#[0-9a-fA-F]{3,8}\b|rgb\(/, figura.tipo);
    }
  });
});
