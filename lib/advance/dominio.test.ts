import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PARAMETROS_BKT,
  SEPARACION_MINIMA_MS,
  UMBRAL_CIERRE,
  actualizarPL,
  aplicarObservacion,
  estadoDeErrores,
  estadoSinDatos,
  observacionesDeItem,
  type DistractorResuelto,
  type EstadoDeError,
  type ItemResuelto,
} from "./dominio.ts";

/* Instantes falsos. Nada de este archivo lee el reloj: la regla de 24 horas se
   prueba moviendo estas constantes. Medido el 2026-09-12 con PARAMETROS_BKT:
   desde p(L0)=0,30 dos aciertos dejan 0,896 (< 0,95) y tres 0,973 (>= 0,95).
   Por eso los casos de cierre usan tres aciertos; los asserts afirman la
   relación con UMBRAL_CIERRE, no el decimal. */
const DIA_1 = 1_700_000_000_000;
const UN_MINUTO = 60 * 1000;
const DIA_3 = DIA_1 + 2 * SEPARACION_MINIMA_MS;
const DIA_5 = DIA_3 + 2 * SEPARACION_MINIMA_MS;

/* Ítem estándar: correcta C; A → falla-1, B → falla-2, D → falla-3. */
const DISTRACTORES: DistractorResuelto[] = [
  { claveOriginal: "A", errorId: "falla-1" },
  { claveOriginal: "B", errorId: "falla-2" },
  { claveOriginal: "D", errorId: "falla-3" },
];

function item(
  ordenDescartes: string[],
  descarteFatal: string | null,
  enMs: number,
  distractores: DistractorResuelto[] = DISTRACTORES,
): ItemResuelto {
  return { itemId: `adv-prueba-${enMs}`, distractores, ordenDescartes, descarteFatal, enMs };
}

/* Ítem cerrado confirmando: acierto en los tres errores. */
const completo = (enMs: number) => item(["A", "B", "D"], null, enMs);
/* Ítem con fatal al primer toque: fracaso en los tres errores. */
const fatalInmediato = (enMs: number) => item(["C"], "C", enMs);

function estadoDe(estados: EstadoDeError[], errorId: string): EstadoDeError {
  const estado = estados.find((e) => e.errorId === errorId);
  assert.ok(estado, `falta el estado de ${errorId}`);
  return estado;
}

describe("actualizarPL", () => {
  it("un acierto sube p(L) y un fracaso lo baja, respecto de p(L0)", () => {
    const { pL0 } = PARAMETROS_BKT;
    assert.ok(actualizarPL(pL0, "acierto") > pL0);
    assert.ok(actualizarPL(pL0, "fracaso") < pL0);
  });

  it("se mantiene en (0, 1) tras cualquier observación", () => {
    for (const pL of [0.001, 0.3, 0.5, 0.95, 0.999]) {
      for (const obs of ["acierto", "fracaso"] as const) {
        const nuevo = actualizarPL(pL, obs);
        assert.ok(nuevo > 0 && nuevo < 1, `${obs} desde ${pL} dio ${nuevo}`);
      }
    }
  });
});

describe("observacionesDeItem (D5)", () => {
  it("sin fatal: tres aciertos y cero fracasos", () => {
    const { aciertos, fracasos } = observacionesDeItem(completo(DIA_1));
    assert.deepEqual(aciertos, ["falla-1", "falla-2", "falla-3"]);
    assert.deepEqual(fracasos, []);
  });

  it("fatal tras un descarte correcto: ese error acierta, los dos en pie fracasan, ninguno recibe ambos", () => {
    const { aciertos, fracasos } = observacionesDeItem(item(["A", "C"], "C", DIA_1));
    assert.deepEqual(aciertos, ["falla-1"]);
    assert.deepEqual(fracasos, ["falla-2", "falla-3"]);
    assert.equal(aciertos.filter((e) => fracasos.includes(e)).length, 0);
  });

  it("fatal al primer toque: cero aciertos y tres fracasos", () => {
    const { aciertos, fracasos } = observacionesDeItem(fatalInmediato(DIA_1));
    assert.deepEqual(aciertos, []);
    assert.deepEqual(fracasos, ["falla-1", "falla-2", "falla-3"]);
  });

  it("los aciertos siguen el orden de orden_descartes, no el de las alternativas", () => {
    const { aciertos } = observacionesDeItem(item(["D", "A", "B"], null, DIA_1));
    assert.deepEqual(aciertos, ["falla-3", "falla-1", "falla-2"]);
  });

  it("mismo error en dos distractores, uno descartado y otro en pie al fatal: acierto, no fracaso (decisión 3)", () => {
    const repetido = [
      { claveOriginal: "A", errorId: "falla-1" },
      { claveOriginal: "B", errorId: "falla-1" },
      { claveOriginal: "D", errorId: "falla-3" },
    ];
    const { aciertos, fracasos } = observacionesDeItem(item(["A", "C"], "C", DIA_1, repetido));
    assert.deepEqual(aciertos, ["falla-1"]);
    assert.deepEqual(fracasos, ["falla-3"]);
  });

  it("distractor con errorId null: descartado no acierta, en pie al fatal no fracasa", () => {
    const conNull = [
      { claveOriginal: "A", errorId: "falla-1" },
      { claveOriginal: "B", errorId: null },
      { claveOriginal: "D", errorId: "falla-3" },
    ];
    /* B descartado antes del fatal: no hay error que acertar. */
    const descartado = observacionesDeItem(item(["B", "A", "C"], "C", DIA_1, conNull));
    assert.deepEqual(descartado.aciertos, ["falla-1"]);
    assert.deepEqual(descartado.fracasos, ["falla-3"]);
    /* B en pie al fatal: no hay error que fracasar. */
    const enPie = observacionesDeItem(item(["A", "C"], "C", DIA_1, conNull));
    assert.deepEqual(enPie.aciertos, ["falla-1"]);
    assert.deepEqual(enPie.fracasos, ["falla-3"]);
  });
});

describe("estadoDeErrores: distractor sin error", () => {
  it("un errorId null nunca crea estado BKT: ni null ni cadena vacía entre los estados", () => {
    const conNull = [
      { claveOriginal: "A", errorId: "falla-1" },
      { claveOriginal: "B", errorId: null },
      { claveOriginal: "D", errorId: "falla-3" },
    ];
    const estados = estadoDeErrores(
      ["falla-1", "falla-3"],
      [item(["B", "A", "D"], null, DIA_1, conNull), item(["A", "C"], "C", DIA_3, conNull)],
    );
    assert.deepEqual(
      estados.map((e) => e.errorId).sort(),
      ["falla-1", "falla-3"],
    );
    assert.ok(estados.every((e) => e.errorId !== "" && e.errorId !== null));
  });
});

describe("aplicarObservacion", () => {
  it("no muta el estado recibido", () => {
    const inicial = estadoSinDatos("falla-1");
    const copia = { ...inicial };
    aplicarObservacion(inicial, "acierto", DIA_1);
    assert.deepEqual(inicial, copia);
  });

  it("un fracaso desde observación no es recaída", () => {
    const enObservacion = aplicarObservacion(estadoSinDatos("falla-1"), "acierto", DIA_1);
    const abierto = aplicarObservacion(enObservacion, "fracaso", DIA_1);
    assert.equal(abierto.fase, "abierto");
    assert.equal(abierto.recaidas, 0);
    assert.equal(abierto.primerAciertoMs, DIA_1);
  });
});

describe("estadoDeErrores: fases", () => {
  it("un error del catálogo sin intentos es sin-datos, no abierto, con p(L) = p(L0)", () => {
    const estados = estadoDeErrores(["falla-1", "falla-9"], [completo(DIA_1)]);
    const sinIntentos = estadoDe(estados, "falla-9");
    assert.equal(sinIntentos.fase, "sin-datos");
    assert.equal(sinIntentos.pL, PARAMETROS_BKT.pL0);
    assert.equal(sinIntentos.ultimoIntentoMs, null);
    assert.equal(estadoDe(estados, "falla-1").fase, "observacion");
  });

  it("sin ítems, todos los errores del catálogo son sin-datos", () => {
    const estados = estadoDeErrores(["falla-1", "falla-2", "falla-3"], []);
    assert.equal(estados.length, 3);
    assert.ok(estados.every((e) => e.fase === "sin-datos"));
  });

  it("tres aciertos en la misma sesión no cierran, aunque p(L) supere el umbral", () => {
    const estados = estadoDeErrores(["falla-1"], [completo(DIA_1), completo(DIA_1), completo(DIA_1)]);
    const e = estadoDe(estados, "falla-1");
    assert.equal(e.aciertos, 3);
    assert.ok(e.pL >= UMBRAL_CIERRE, `p(L) = ${e.pL} debía superar el umbral para que el caso pruebe algo`);
    assert.equal(e.fase, "observacion");
  });

  it("aciertos en dos instantes separados por 24 h o más, con p(L) sobre el umbral, cierran", () => {
    const estados = estadoDeErrores(["falla-1"], [completo(DIA_1), completo(DIA_1), completo(DIA_3)]);
    const e = estadoDe(estados, "falla-1");
    assert.ok(e.pL >= UMBRAL_CIERRE);
    assert.equal(e.fase, "cerrado");
    assert.equal(e.recaidas, 0);
  });

  it("dos instantes separados por menos de 24 h no cierran", () => {
    const casiUnDia = DIA_1 + SEPARACION_MINIMA_MS - UN_MINUTO;
    const estados = estadoDeErrores(["falla-1"], [completo(DIA_1), completo(DIA_1), completo(casiUnDia)]);
    const e = estadoDe(estados, "falla-1");
    assert.ok(e.pL >= UMBRAL_CIERRE);
    assert.equal(e.fase, "observacion");
  });

  it("un fracaso deja el error abierto", () => {
    const estados = estadoDeErrores(["falla-2"], [item(["A", "C"], "C", DIA_1)]);
    assert.equal(estadoDe(estados, "falla-2").fase, "abierto");
  });
});

describe("estadoDeErrores: recaída (decisión 2)", () => {
  const cerrado = [completo(DIA_1), completo(DIA_1), completo(DIA_3)];

  it("un error cerrado que recibe fracaso vuelve a abierto, marca la recaída y reinicia el ciclo", () => {
    const estados = estadoDeErrores(["falla-1"], [...cerrado, fatalInmediato(DIA_5)]);
    const e = estadoDe(estados, "falla-1");
    assert.equal(e.fase, "abierto");
    assert.equal(e.recaidas, 1);
    assert.equal(e.primerAciertoMs, null);
    assert.equal(e.ultimoIntentoMs, DIA_5);
  });

  it("un acierto inmediato tras la recaída no recierra, aunque p(L) vuelva a superar el umbral", () => {
    const estados = estadoDeErrores(["falla-1"], [
      ...cerrado,
      fatalInmediato(DIA_5),
      completo(DIA_5 + UN_MINUTO),
    ]);
    const e = estadoDe(estados, "falla-1");
    assert.ok(e.pL >= UMBRAL_CIERRE, `p(L) = ${e.pL} debía superar el umbral para que el caso pruebe algo`);
    assert.equal(e.fase, "observacion");
    assert.equal(e.primerAciertoMs, DIA_5 + UN_MINUTO);
  });

  it("tras la recaída, dos aciertos nuevos separados por 24 h o más vuelven a cerrar; la marca se conserva", () => {
    const estados = estadoDeErrores(["falla-1"], [
      ...cerrado,
      fatalInmediato(DIA_5),
      completo(DIA_5 + UN_MINUTO),
      completo(DIA_5 + UN_MINUTO + SEPARACION_MINIMA_MS),
    ]);
    const e = estadoDe(estados, "falla-1");
    assert.equal(e.fase, "cerrado");
    assert.equal(e.recaidas, 1);
  });
});

describe("estadoDeErrores: orden (decisión 1, Op1)", () => {
  it("a igual instante, acierto y fracaso del mismo error se aplican acierto primero, fracaso después", () => {
    const acertado = item(["A", "B", "D"], null, DIA_1);
    const fallado = item(["B", "C"], "C", DIA_1);
    const esperado = aplicarObservacion(
      aplicarObservacion(estadoSinDatos("falla-1"), "acierto", DIA_1),
      "fracaso",
      DIA_1,
    );
    for (const items of [[acertado, fallado], [fallado, acertado]]) {
      const e = estadoDe(estadoDeErrores(["falla-1"], items), "falla-1");
      assert.equal(e.pL, esperado.pL);
      assert.equal(e.fase, "abierto");
    }
  });

  it("entre instantes distintos manda la cronología, no el orden de la lista", () => {
    const antes = item(["B", "C"], "C", DIA_1);
    const despues = completo(DIA_3);
    const esperado = aplicarObservacion(
      aplicarObservacion(estadoSinDatos("falla-1"), "fracaso", DIA_1),
      "acierto",
      DIA_3,
    );
    const e = estadoDe(estadoDeErrores(["falla-1"], [despues, antes]), "falla-1");
    assert.equal(e.pL, esperado.pL);
    assert.equal(e.fase, "observacion");
  });

  it("el orden del ítem no cambia el p(L) de ningún error: cada uno recibe una sola observación por ítem", () => {
    const [primero] = estadoDeErrores(["falla-2"], [item(["A", "B", "C"], "C", DIA_1)]);
    const [segundo] = estadoDeErrores(["falla-2"], [item(["B", "A", "C"], "C", DIA_1)]);
    assert.equal(primero.pL, segundo.pL);
    assert.equal(primero.aciertos, 1);
    assert.equal(primero.fracasos, 0);
  });
});
