import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { TEXTO_MOTIVO } from "./primeraParada.ts";
import {
  ASI_FUNCIONA,
  PREGUNTA_1,
  PREGUNTA_2,
  TEXTOS_BIENVENIDA,
  TEXTOS_PARADA,
  encabezadoAcceso,
  pregunta3,
} from "./textosBienvenida.ts";

describe("encabezado de la bienvenida según el acceso", () => {
  it("prueba: termina el día de su vigencia_hasta, en hora de Chile", () => {
    const hasta = new Date("2026-10-01T15:00:00Z");
    assert.equal(
      encabezadoAcceso({ origen: "prueba", vigencia_hasta: hasta }),
      "Listo. Tu prueba de 7 días empezó hoy y termina el 1 de octubre. Tienes todo Fobos, Advance incluido.",
    );
  });

  it("cortesía del amigo: la vigencia exclusiva 2026-12-01 00:00 de Chile dice 30 de noviembre", () => {
    assert.equal(
      encabezadoAcceso({ origen: "cortesia", vigencia_hasta: new Date("2026-12-01T03:00:00Z") }),
      "Listo. Tienes todo Fobos, Advance incluido, hasta el 30 de noviembre.",
    );
  });

  it("sin texto firmado para compra ni para quien no tiene acceso", () => {
    assert.equal(encabezadoAcceso({ origen: "compra", vigencia_hasta: new Date() }), null);
    assert.equal(encabezadoAcceso(null), null);
  });
});

describe("los textos son los firmados en docs/recorrido-entrada.md §4", () => {
  const plan = readFileSync(path.join(process.cwd(), "docs", "recorrido-entrada.md"), "utf8");
  it("preguntas, opciones y motivos", () => {
    const p3 = pregunta3("porcentaje");
    const textos = [
      PREGUNTA_1.texto,
      ...PREGUNTA_1.opciones.map((o) => o.texto),
      PREGUNTA_2.texto,
      ...PREGUNTA_2.opciones.map((o) => o.texto),
      p3.texto,
      ...p3.opciones.map((o) => o.texto),
      ...Object.values(TEXTO_MOTIVO),
      ...Object.values(TEXTOS_BIENVENIDA),
      ASI_FUNCIONA.titulo,
      ASI_FUNCIONA.intro,
      ASI_FUNCIONA.boton,
      ...ASI_FUNCIONA.bloques.map((b) => `**${b.nombre.replace(/\.$/, "")}.** ${b.texto}`),
      ...Object.values(TEXTOS_PARADA),
    ];
    for (const t of textos) assert.ok(plan.includes(t), `no está en §4: ${t}`);
  });
});
