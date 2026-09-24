import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validarDatosBancoAdvance } from "../../scripts/validar-contenido.mjs";
import { choquesDeCuerpo } from "./cuerpoGeometrico.ts";
/* La galería del cuerpo geométrico (app/%5Fdesign/muestraCuerpo.ts): cada
   muestra pasa el validador en su ubicación, y ninguna de cuerpo tiene choques.
   El directorio se llama literalmente %5Fdesign: tsc lo resuelve así para los
   tipos, y node lo carga desde la URL, donde el % va como %25. */
type Galeria = typeof import("../../app/%5Fdesign/muestraCuerpo.ts");
const { CUERPOS_MUESTRA, REDES_CUERPO_MUESTRA, SOLUCION_CUERPO_MUESTRA } = (await import(new URL("../../app/%255Fdesign/muestraCuerpo.ts", import.meta.url).href)) as Galeria;

const FEEDBACK = "Feedback de descarte con más de cuarenta caracteres, sin celebración.";

function banco(extra: Record<string, unknown>) {
  const alternativas = [
    { clave: "A", texto: "texto A", esCorrecta: false, errorCatalogado: "falla-uno", feedbackDescarte: FEEDBACK },
    { clave: "B", texto: "texto B", esCorrecta: false, errorCatalogado: "falla-dos", feedbackDescarte: FEEDBACK },
    { clave: "C", texto: "texto C", esCorrecta: true, feedbackDescarteIncorrecto: FEEDBACK },
    { clave: "D", texto: "texto D", esCorrecta: false, errorCatalogado: "falla-tres", feedbackDescarte: FEEDBACK },
  ];
  return {
    tipo: "banco-advance",
    unidadId: "prueba",
    moduloId: "prueba",
    titulo: "Unidad de prueba",
    items: [
      {
        id: "adv-prueba-001",
        unidadId: "prueba",
        moduloId: "prueba",
        habilidad: "resolver",
        dificultad: "media",
        tiempoReferenciaSeg: 120,
        enunciado: "Enunciado 1.",
        alternativas,
        solucion: "Solución 1.",
        proveniencia: { fuenteOrigen: "propia" },
        ...extra,
      },
    ],
    proveniencia: { fuentesAnalisis: ["temario DEMRE M1"], declaracionOriginalidad: "Banco de prueba en memoria, sin material externo." },
  };
}

describe("galería del cuerpo geométrico", () => {
  it("hay una muestra por cuerpo, compuestos, bordes de guarda, dos redes y una solución", () => {
    /* Medido el 2026-09-24: 15 cuerpos, 2 redes, 1 solución. El assert afirma que están los casos, no el número. */
    const ids = CUERPOS_MUESTRA.map((m) => m.id);
    for (const id of ["paralelepipedo", "cubo", "cilindro-diametro", "ocultas-compuesto", "cajas-con-juntas", "apilado-cilindros", "limite-arista-visible", "limite-arista-acotada", "limite-razon", "limite-cilindro-bajo", "limite-cilindro-alto"]) {
      assert.ok(ids.includes(id), id);
    }
    assert.equal(REDES_CUERPO_MUESTRA.length, 2);
    assert.equal(CUERPOS_MUESTRA.find((m) => m.id === "cajas-con-juntas")?.figura.ocultas, false);
    assert.equal(CUERPOS_MUESTRA.find((m) => m.id === "ocultas-compuesto")?.figura.ocultas, undefined);
  });

  for (const { id, figura } of [...CUERPOS_MUESTRA, ...REDES_CUERPO_MUESTRA]) {
    it(`${id}: pasa el validador en el enunciado`, () => {
      assert.deepEqual(validarDatosBancoAdvance(banco({ figura })), []);
    });
  }

  it("la figura de la solución pasa el validador en el carril de la solución", () => {
    assert.deepEqual(validarDatosBancoAdvance(banco({ figuraSolucion: SOLUCION_CUERPO_MUESTRA.figura })), []);
  });

  it("ninguna muestra de cuerpo tiene choques de rótulos ni de llaves", () => {
    for (const { id, figura } of CUERPOS_MUESTRA) assert.deepEqual(choquesDeCuerpo(figura), [], id);
    assert.deepEqual(choquesDeCuerpo(SOLUCION_CUERPO_MUESTRA.figura, "solucion"), []);
  });
});
