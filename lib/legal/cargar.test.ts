import test from "node:test";
import assert from "node:assert/strict";
import { cargarDocumento, documentosPublicados } from "./cargar.ts";
import { DOCUMENTOS_LEGALES } from "./documentos.ts";

// Medido 2026-09-14: content/legal/terminos.md existe, privacidad.md no.
// El test afirma la propiedad (ausente ⇒ null, nunca lanza), no el estado del
// disco de hoy: el documento ausente se busca de verdad en el registro.
test("un documento cuyo archivo no existe devuelve null y no lanza", () => {
  const ausente = DOCUMENTOS_LEGALES.find((d) => d.slug === "privacidad")!;
  assert.equal(ausente.archivo, "content/legal/privacidad.md");
  assert.doesNotThrow(() => cargarDocumento("privacidad"));
  assert.equal(cargarDocumento("privacidad"), null);
});

test("documentosPublicados solo lista slugs con archivo presente y no vacío", () => {
  for (const d of documentosPublicados()) {
    const cargado = cargarDocumento(d.slug);
    assert.notEqual(cargado, null);
    assert.ok(cargado!.cuerpo.trim().length > 0);
  }
  assert.ok(!documentosPublicados().some((d) => d.slug === "privacidad"));
});
