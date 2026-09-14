import test from "node:test";
import assert from "node:assert/strict";
import { esHrefPermitido, parsearInline, parsearMarkdownLegal, slugDeTitulo } from "./markdownLegal.ts";

test("un enlace javascript: no se convierte en enlace: queda como texto literal", () => {
  const nodos = parsearInline("Haz clic [acá](javascript:alert(1)) ahora");
  assert.ok(!nodos.some((n) => n.tipo === "enlace"));
  // La fuente queda visible completa: nada se pierde ni se reinterpreta.
  assert.equal(nodos.map((n) => (n.tipo === "texto" ? n.texto : "")).join(""), "Haz clic [acá](javascript:alert(1)) ahora");
});

test("solo https: y mailto: pasan la lista blanca", () => {
  assert.equal(esHrefPermitido("https://ejemplo.cl/x"), true);
  assert.equal(esHrefPermitido("mailto:hola@ejemplo.cl"), true);
  assert.equal(esHrefPermitido("http://ejemplo.cl"), false);
  assert.equal(esHrefPermitido("javascript:alert(1)"), false);
  assert.equal(esHrefPermitido("data:text/html,x"), false);
  assert.equal(esHrefPermitido("/relativa"), false);
  assert.equal(esHrefPermitido(" JAVASCRIPT:x"), false);
});

test("el HTML crudo del markdown es texto, no nodos", () => {
  const [p] = parsearMarkdownLegal("<script>alert(1)</script> y <b>x</b>");
  assert.equal(p.tipo, "parrafo");
  assert.ok(p.tipo === "parrafo" && p.hijos.every((n) => n.tipo === "texto"));
});

test("cubre la forma real del archivo: h1, h2 con id, cita agrupada, regla, listas, código", () => {
  const md = [
    "# Título — [Nombre]",
    "",
    "> **BORRADOR.** Campos `[ ]`.",
    "> Segunda línea de la misma cita.",
    "",
    "---",
    "",
    "## 1. Identificación del proveedor",
    "",
    "Párrafo con **negrita** y *cursiva*.",
    "",
    "- uno",
    "- dos",
    "",
    "1. primero",
    "2. segundo",
  ].join("\n");
  const b = parsearMarkdownLegal(md);
  assert.deepEqual(
    b.map((x) => x.tipo),
    ["h1", "cita", "regla", "h2", "parrafo", "lista", "lista"],
  );
  assert.equal(b[1].tipo === "cita" && b[1].parrafos.length, 1);
  assert.equal(b[3].tipo === "h2" && b[3].id, "1-identificacion-del-proveedor");
  assert.equal(b[5].tipo === "lista" && b[5].ordenada, false);
  assert.equal(b[6].tipo === "lista" && b[6].ordenada, true);
});

test("ids de h2 repetidos se desambiguan", () => {
  const b = parsearMarkdownLegal("## Definiciones\n\n## Definiciones");
  assert.deepEqual(b.map((x) => x.tipo === "h2" && x.id), ["definiciones", "definiciones-2"]);
});

test("slug: sin acentos, sin signos, conserva el número de cláusula", () => {
  assert.equal(slugDeTitulo("3. Menores de edad y capacidad"), "3-menores-de-edad-y-capacidad");
});
