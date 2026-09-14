import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CUADRANTES,
  MINIMO_INTENTOS,
  cuadranteDeIntento,
  panelDeHabilidad,
  panelPorHabilidad,
  type IntentoClasico,
  type IntentoConHabilidad,
} from "./panel.ts";

/* Un intento del modo clásico: referencia de 120 s (dificultad media). */
function intento(correcto: boolean, tiempoSeg: number, tiempoReferenciaSeg = 120): IntentoClasico {
  return { correcto, tiempoMs: tiempoSeg * 1000, tiempoReferenciaSeg };
}

describe("cuadranteDeIntento (§6.2)", () => {
  it("correcto dentro del tiempo es dominado", () => {
    assert.equal(cuadranteDeIntento(intento(true, 60)), "dominado");
  });

  it("correcto sobre el tiempo es fragil", () => {
    assert.equal(cuadranteDeIntento(intento(true, 180)), "fragil");
  });

  it("incorrecto dentro del tiempo es error-conceptual", () => {
    assert.equal(cuadranteDeIntento(intento(false, 30)), "error-conceptual");
  });

  it("incorrecto sobre el tiempo es bloqueo", () => {
    assert.equal(cuadranteDeIntento(intento(false, 200)), "bloqueo");
  });

  it("la referencia es por ítem: el mismo tiempo cae en cuadrantes distintos según tiempoReferenciaSeg", () => {
    assert.equal(cuadranteDeIntento(intento(true, 100, 80)), "fragil");
    assert.equal(cuadranteDeIntento(intento(true, 100, 160)), "dominado");
  });

  it("justo en la referencia cuenta como dentro del tiempo (frontera sin calibrar)", () => {
    assert.equal(cuadranteDeIntento(intento(true, 120)), "dominado");
    assert.equal(cuadranteDeIntento(intento(false, 120)), "error-conceptual");
  });

  it("un milisegundo sobre la referencia ya es sobre el tiempo", () => {
    assert.equal(cuadranteDeIntento({ correcto: true, tiempoMs: 120_001, tiempoReferenciaSeg: 120 }), "fragil");
  });
});

describe("panelDeHabilidad: regla de honestidad (§6.2)", () => {
  it("sin intentos no clasifica", () => {
    assert.deepEqual(panelDeHabilidad([]), { estado: "sin-clasificar", intentos: 0 });
  });

  it("con menos de MINIMO_INTENTOS no clasifica, aunque todos sean lentos: un ítem lento no hace a nadie frágil", () => {
    const lentos = Array.from({ length: MINIMO_INTENTOS - 1 }, () => intento(true, 300));
    assert.deepEqual(panelDeHabilidad(lentos), { estado: "sin-clasificar", intentos: MINIMO_INTENTOS - 1 });
  });

  it("con exactamente MINIMO_INTENTOS clasifica", () => {
    const panel = panelDeHabilidad([intento(true, 60), intento(true, 70), intento(true, 80)]);
    assert.equal(panel.estado, "clasificado");
    assert.equal(panel.intentos, 3);
  });
});

describe("panelDeHabilidad: conteo y dominante", () => {
  it("cuenta cada intento en su cuadrante y los cuatro cuadrantes están siempre presentes", () => {
    const panel = panelDeHabilidad([
      intento(true, 60), // dominado
      intento(true, 200), // fragil
      intento(true, 190), // fragil
      intento(false, 20), // error-conceptual
      intento(false, 400), // bloqueo
    ]);
    assert.equal(panel.estado, "clasificado");
    if (panel.estado !== "clasificado") return;
    assert.deepEqual(panel.porCuadrante, { dominado: 1, fragil: 2, "error-conceptual": 1, bloqueo: 1 });
    assert.equal(panel.dominante, "fragil");
    assert.equal(
      Object.values(panel.porCuadrante).reduce((a, b) => a + b, 0),
      panel.intentos,
    );
  });

  it("el dominante es el cuadrante con más intentos", () => {
    const panel = panelDeHabilidad([intento(false, 10), intento(false, 15), intento(true, 60)]);
    assert.equal(panel.estado === "clasificado" && panel.dominante, "error-conceptual");
  });

  it("en empate gana el peor cuadrante, en el orden de CUADRANTES (desempate sin calibrar)", () => {
    /* 1 dominado, 1 fragil, 1 error-conceptual: empate triple. */
    const triple = panelDeHabilidad([intento(true, 60), intento(true, 200), intento(false, 20)]);
    assert.equal(triple.estado === "clasificado" && triple.dominante, "error-conceptual");

    /* 2 dominado, 2 bloqueo. */
    const doble = panelDeHabilidad([intento(true, 60), intento(true, 61), intento(false, 300), intento(false, 301)]);
    assert.equal(doble.estado === "clasificado" && doble.dominante, "bloqueo");
  });

  it("CUADRANTES va del peor al mejor, que es lo que sostiene el desempate", () => {
    assert.deepEqual(CUADRANTES, ["bloqueo", "error-conceptual", "fragil", "dominado"]);
  });

  it("no muta los intentos recibidos", () => {
    const intentos = [intento(true, 60), intento(true, 200), intento(false, 20)];
    const copia = structuredClone(intentos);
    panelDeHabilidad(intentos);
    assert.deepEqual(intentos, copia);
  });
});

describe("panelPorHabilidad", () => {
  const con = (habilidad: IntentoConHabilidad["habilidad"], correcto: boolean, tiempoSeg: number): IntentoConHabilidad => ({
    habilidad,
    ...intento(correcto, tiempoSeg),
  });

  it("agrupa por habilidad y devuelve las cuatro siempre, sin datos como sin-clasificar", () => {
    const panel = panelPorHabilidad([
      con("resolver", true, 60),
      con("resolver", true, 200),
      con("resolver", false, 20),
      con("modelar", true, 60),
    ]);
    assert.deepEqual(Object.keys(panel), ["resolver", "modelar", "representar", "argumentar"]);
    assert.equal(panel.resolver.estado, "clasificado");
    assert.deepEqual(panel.modelar, { estado: "sin-clasificar", intentos: 1 });
    assert.deepEqual(panel.representar, { estado: "sin-clasificar", intentos: 0 });
    assert.deepEqual(panel.argumentar, { estado: "sin-clasificar", intentos: 0 });
  });

  it("el mínimo de intentos es por habilidad, no global: seis intentos repartidos de a dos no clasifican nada", () => {
    const panel = panelPorHabilidad([
      con("resolver", true, 60),
      con("resolver", true, 60),
      con("modelar", true, 60),
      con("modelar", true, 60),
      con("representar", true, 60),
      con("representar", true, 60),
    ]);
    for (const p of Object.values(panel)) assert.equal(p.estado, "sin-clasificar");
  });
});
