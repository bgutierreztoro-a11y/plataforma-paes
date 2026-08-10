import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { puntosDeFeedback, esPasoSimple } from "./feedbackDelPaso.ts";
import type { Bloque } from "./tipos.ts";

/**
 * La detección de "paso simple" decide qué mecanismo de UI ve el estudiante:
 * feedback anclado al fondo o feedback inline. Si se equivoca, la misma lección
 * muestra dos tratamientos distintos sin motivo aparente, y eso no lo detecta
 * ningún test de pantalla — se ve raro, no se cae.
 *
 * Por eso se verifica acá, contra la forma del contenido, y además se corre
 * sobre el corpus real (`scripts/reporte-feedback-pasos.mjs`).
 *
 * Corre con `node --test`, igual que geometriaCamino.test.ts.
 */

const texto = (): Bloque => ({ tipo: "texto", contenido: "algo" });

const seleccion = (): Bloque => ({
  tipo: "seleccion",
  enunciado: "¿cuál?",
  opciones: [{ id: "a", texto: "a", esCorrecta: true, feedback: "sí" }],
});

const vf = (): Bloque => ({
  tipo: "verdaderoFalso",
  enunciado: "¿verdadero?",
  respuestaCorrecta: true,
  feedbackVerdadero: "sí",
  feedbackFalso: "no",
});

const numerica = (cantidadCampos: number): Bloque => ({
  tipo: "numerica",
  enunciado: "calcula",
  campos: Array.from({ length: cantidadCampos }, (_, i) => ({
    id: `c${i}`,
    etiqueta: `campo ${i}`,
    respuestaCorrecta: i,
  })),
  feedbackPorDefecto: "revisa",
});

const prediccion = (): Bloque => ({
  tipo: "prediccion",
  enunciado: "¿qué crees?",
  tipoRespuesta: "numero",
});

const abierta = (): Bloque => ({ tipo: "abierta", enunciado: "explica" });

describe("puntosDeFeedback", () => {
  test("los bloques que no evalúan no abren panel", () => {
    assert.deepEqual(puntosDeFeedback([texto()]), []);
  });

  test("numérica abre un panel POR CAMPO, no uno por bloque", () => {
    const puntos = puntosDeFeedback([numerica(2)]);
    assert.equal(puntos.length, 2);
    assert.deepEqual(
      puntos.map((p) => p.indiceBloque),
      [0, 0],
      "los dos paneles salen del mismo bloque",
    );
  });

  test("distingue veredicto de acuse de recibo", () => {
    const puntos = puntosDeFeedback([seleccion(), prediccion(), abierta()]);
    assert.deepEqual(
      puntos.map((p) => p.clase),
      ["veredicto", "acuse", "acuse"],
    );
  });

  test("conserva el orden y el tipo de bloque de origen", () => {
    const puntos = puntosDeFeedback([texto(), vf(), seleccion()]);
    assert.deepEqual(
      puntos.map((p) => [p.indiceBloque, p.tipoBloque]),
      [
        [1, "verdaderoFalso"],
        [2, "seleccion"],
      ],
    );
  });
});

describe("esPasoSimple", () => {
  test("un paso sin nada que evaluar es simple", () => {
    assert.equal(esPasoSimple([texto()]), true);
  });

  test("un solo veredicto es simple", () => {
    assert.equal(esPasoSimple([texto(), seleccion()]), true);
  });

  test("dos veredictos no", () => {
    assert.equal(esPasoSimple([seleccion(), vf()]), false);
  });

  test("una numérica de dos campos tampoco: son dos paneles de un bloque", () => {
    assert.equal(esPasoSimple([numerica(2)]), false);
    assert.equal(esPasoSimple([numerica(1)]), true);
  });

  test("los acuses de recibo no gastan el cupo del veredicto", () => {
    assert.equal(esPasoSimple([prediccion(), seleccion()]), true);
    assert.equal(esPasoSimple([prediccion(), abierta()]), true);
  });
});
