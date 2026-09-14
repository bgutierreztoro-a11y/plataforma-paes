import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { cargarDocumento, cargarSegunRegistro, documentosPublicados, enlacesLegales } from "./cargar.ts";
import { DOCUMENTOS_LEGALES } from "./documentos.ts";

// Medido 2026-09-14: content/legal/terminos.md existe (borrador), privacidad.md no.
// Los tests afirman propiedades, no el estado del disco de hoy.

test("un documento cuyo archivo no existe devuelve null y no lanza", () => {
  const ausente = DOCUMENTOS_LEGALES.find((d) => d.slug === "privacidad")!;
  assert.equal(ausente.archivo, "content/legal/privacidad.md");
  assert.doesNotThrow(() => cargarDocumento("privacidad"));
  assert.equal(cargarDocumento("privacidad"), null);
});

test("publicado false devuelve null aunque el archivo exista", () => {
  const terminos = DOCUMENTOS_LEGALES.find((d) => d.slug === "terminos")!;
  // El archivo del borrador tiene que estar: si no, el test no prueba nada.
  assert.ok(existsSync(path.join(process.cwd(), terminos.archivo)));
  const borrador = { ...terminos, publicado: false };
  assert.equal(cargarSegunRegistro(borrador), null);
  // Y el mismo registro con el gate abierto sí carga: el null era del gate.
  const firmado = { ...terminos, publicado: true };
  assert.notEqual(cargarSegunRegistro(firmado), null);
});

test("documentosPublicados solo lista slugs publicados con archivo presente y no vacío", () => {
  for (const d of documentosPublicados()) {
    assert.equal(d.publicado, true);
    const cargado = cargarDocumento(d.slug);
    assert.notEqual(cargado, null);
    assert.ok(cargado!.cuerpo.trim().length > 0);
  }
  assert.ok(!documentosPublicados().some((d) => d.slug === "privacidad"));
});

test("el enlace a /privacidad no pasa por el gate: siempre está, una sola vez", () => {
  const hrefs = enlacesLegales().map((e) => e.href);
  assert.equal(hrefs.filter((h) => h === "/privacidad").length, 1);
});
