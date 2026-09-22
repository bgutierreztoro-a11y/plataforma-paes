import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { ComponentType } from "react";
import type { AlternativaAdvance, EstadoAlternativa, ItemAdvance } from "./descarte.ts";

/* Smoke test de render de las alternativas gráficas (reglas 25 y 26) en
   descarte (AlternativaDescartable) y triage (ItemTriage), con react-dom/server
   y el cargador TSX de figurasDatos.render.test.ts. Datos inventados. */

register(new URL("./pruebas/cargadorTsx.mjs", import.meta.url));

type PropsAlternativa = { alternativa: AlternativaAdvance; estado: EstadoAlternativa; rotuloError?: string; deshabilitada?: boolean };
let alternativa: (props: PropsAlternativa) => string;
let triage: (item: ItemAdvance) => string;

before(async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { AlternativaDescartable } = (await import("../../components/advance/AlternativaDescartable.tsx")) as { AlternativaDescartable: ComponentType<PropsAlternativa> };
  const { ItemTriage } = (await import("../../components/advance/ItemTriage.tsx")) as {
    ItemTriage: ComponentType<{ item: ItemAdvance; indice: number; total: number; segundos: number }>;
  };
  alternativa = (props) => renderToStaticMarkup(createElement(AlternativaDescartable, props));
  triage = (item) => renderToStaticMarkup(createElement(ItemTriage, { item, indice: 1, total: 20, segundos: 12 }));
});

const DESCRIPCION = "Cajón de prueba con mínimo 3, primer cuartil 7,5, mediana 12,5, tercer cuartil 17,5 y máximo 23.";
const FIGURA = {
  tipo: "diagrama-cajon" as const,
  orientacion: "horizontal" as const,
  eje: { min: 0, max: 25, paso: 5 },
  cajas: [{ minimo: 3, q1: 7.5, mediana: 12.5, q3: 17.5, maximo: 23, rotulos: true }],
  descripcion: DESCRIPCION,
};
const GRAFICA: AlternativaAdvance = { clave: "A", claveOriginal: "C", texto: "", figura: FIGURA, esCorrecta: false, errorCatalogado: "falla-uno", feedbackDescarte: "Feedback de descarte de prueba, con más de cuarenta caracteres." };
const DE_TEXTO: AlternativaAdvance = { ...GRAFICA, texto: "12,5", figura: undefined };

/** Lo que un lector de pantalla recibe como nombre: el texto del botón sin lo que está en aria-hidden. */
function nombreAccesible(html: string): string {
  let s = html;
  let previo = "";
  while (s !== previo) {
    previo = s;
    s = s.replace(/<(\w+)[^>]*aria-hidden="true"[^>]*>(?:(?!<\1[\s>])[\s\S])*?<\/\1>/, "");
  }
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

describe("alternativa gráfica en descarte", () => {
  it("intacta: botón con la figura en su fila, SVG oculto y descripción como nombre accesible", () => {
    const html = alternativa({ alternativa: GRAFICA, estado: "intacta" });
    assert.match(html, /^<button type="button"/);
    assert.match(html, /data-alternativa-figura/);
    assert.match(html, /<span aria-hidden="true" class="block rounded-sm bg-\[var\(--color-bg\)\] p-1"><svg[^>]*data-diagrama-cajon/);
    assert.equal(nombreAccesible(html), DESCRIPCION);
    assert.doesNotMatch(html, /data-marca-descarte/);
  });

  it("descartada con acierto: gris, diagonal y el estado anunciado por texto", () => {
    const html = alternativa({ alternativa: GRAFICA, estado: "descartada-correcta", rotuloError: "Falla uno" });
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /class="block rounded-sm bg-\[var\(--color-bg\)\] p-1 grayscale"/);
    assert.match(html, /data-marca-descarte/);
    assert.match(nombreAccesible(html), new RegExp(`^${DESCRIPCION.replace(/[.,]/g, ".")} Descartada: Falla uno Feedback de descarte`));
  });

  it("la alternativa de texto no cambia: sin figura, sin sr-only y con el texto como nombre", () => {
    const html = alternativa({ alternativa: DE_TEXTO, estado: "intacta" });
    assert.doesNotMatch(html, /data-alternativa-figura|sr-only/);
    assert.equal(nombreAccesible(html), "12,5");
  });
});

describe("alternativa gráfica en triage", () => {
  it("las cuatro alternativas muestran su figura y ninguna es un botón", () => {
    const item: ItemAdvance = {
      id: "adv-prueba-001",
      unidadId: "prueba",
      moduloId: "prueba",
      habilidad: "representar",
      dificultad: "media",
      tiempoReferenciaSeg: 120,
      enunciado: "Enunciado de prueba.",
      alternativas: (["A", "B", "C", "D"] as const).map((clave, i) => ({ ...GRAFICA, clave, claveOriginal: clave, figura: { ...FIGURA, cajas: [{ ...FIGURA.cajas[0], maximo: 20 + i }] } })),
      solucion: "Solución de prueba.",
    };
    const html = triage(item);
    assert.equal((html.match(/data-alternativa-figura/g) ?? []).length, 4);
    assert.equal((html.match(/data-diagrama-cajon/g) ?? []).length, 4);
    assert.doesNotMatch(html.slice(html.indexOf('aria-label="Alternativas"'), html.indexOf('aria-label="Decisión"')), /<button/);
  });
});
