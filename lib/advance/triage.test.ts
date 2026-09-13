import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ItemAdvance } from "./descarte.ts";
import { estadoSinDatos, type EstadoDeError, type FaseError } from "./dominio.ts";
import {
  ITEMS_POR_TRIAGE,
  cuerpoSesionTriage,
  validarCuerpoTriage,
  LIMITE_MS,
  erroresAbiertosDe,
  fasesDe,
  payloadTriageDecision,
  registroDecision,
  registroSinDecision,
  resumenTriage,
  seleccionarItems,
  veredicto,
  type FasesPorError,
} from "./triage.ts";

/* Un ítem ya mezclado, con tres distractores: error-1, error-3, error-2 en
   ese orden visible. */
function item(id = "adv-prueba-001"): ItemAdvance {
  return {
    id,
    unidadId: "prueba",
    moduloId: "prueba",
    habilidad: "resolver",
    dificultad: "media",
    tiempoReferenciaSeg: 120,
    enunciado: "Enunciado de prueba.",
    alternativas: [
      { clave: "A", claveOriginal: "B", texto: "b", esCorrecta: false, errorCatalogado: "error-1", feedbackDescarte: "fd1" },
      { clave: "B", claveOriginal: "D", texto: "d", esCorrecta: false, errorCatalogado: "error-3", feedbackDescarte: "fd3" },
      { clave: "C", claveOriginal: "A", texto: "a", esCorrecta: true, feedbackDescarteIncorrecto: "fdi" },
      { clave: "D", claveOriginal: "C", texto: "c", esCorrecta: false, errorCatalogado: "error-2", feedbackDescarte: "fd2" },
    ],
    solucion: "Solución de prueba.",
  };
}

const ITEM = item();

const fases = (f1: FaseError, f2: FaseError, f3: FaseError): FasesPorError => ({
  "error-1": f1,
  "error-2": f2,
  "error-3": f3,
});

describe("veredicto (D17)", () => {
  it("marco con los tres cerrados es punto-regalado (F5a2: toma la regla que tenía dejo)", () => {
    assert.equal(veredicto("marco", ITEM, fases("cerrado", "cerrado", "cerrado")), "punto-regalado");
  });

  it("marco con un abierto es lectura-buena: pasar fue una lectura correcta", () => {
    assert.equal(veredicto("marco", ITEM, fases("abierto", "abierto", "abierto")), "lectura-buena");
    assert.equal(veredicto("marco", ITEM, fases("abierto", "cerrado", "observacion")), "lectura-buena");
  });

  it("marco con un sin-datos es sin-veredicto, incluso con los otros dos cerrados", () => {
    assert.equal(veredicto("marco", ITEM, fases("cerrado", "sin-datos", "cerrado")), "sin-veredicto");
  });

  it("sin-decision es siempre sin-veredicto", () => {
    assert.equal(veredicto("sin-decision", ITEM, fases("abierto", "cerrado", "observacion")), "sin-veredicto");
  });

  it("resuelvo con un error abierto es lectura-a-revisar", () => {
    assert.equal(veredicto("resuelvo", ITEM, fases("abierto", "cerrado", "cerrado")), "lectura-a-revisar");
  });

  it("resuelvo con un abierto y otro sin-datos sigue siendo lectura-a-revisar: basta un dato firme", () => {
    assert.equal(veredicto("resuelvo", ITEM, fases("sin-datos", "abierto", "sin-datos")), "lectura-a-revisar");
  });

  it("resuelvo sin ningún abierto y con datos en los tres es lectura-buena", () => {
    assert.equal(veredicto("resuelvo", ITEM, fases("observacion", "cerrado", "cerrado")), "lectura-buena");
    assert.equal(veredicto("resuelvo", ITEM, fases("observacion", "observacion", "observacion")), "lectura-buena");
  });

  it("resuelvo con un sin-datos y ningún abierto es sin-veredicto", () => {
    assert.equal(veredicto("resuelvo", ITEM, fases("sin-datos", "cerrado", "cerrado")), "sin-veredicto");
  });

  it("dejo (sin emisor desde F5a2, filas viejas) con los tres cerrados sigue siendo punto-regalado", () => {
    assert.equal(veredicto("dejo", ITEM, fases("cerrado", "cerrado", "cerrado")), "punto-regalado");
  });

  it("dejo con dos cerrados y uno en observación es lectura-buena", () => {
    assert.equal(veredicto("dejo", ITEM, fases("cerrado", "observacion", "cerrado")), "lectura-buena");
  });

  it("dejo con un abierto es lectura-buena: dejarla fue una lectura correcta", () => {
    assert.equal(veredicto("dejo", ITEM, fases("abierto", "cerrado", "cerrado")), "lectura-buena");
  });

  it("dejo con un sin-datos es sin-veredicto, incluso con los otros dos cerrados", () => {
    assert.equal(veredicto("dejo", ITEM, fases("cerrado", "sin-datos", "cerrado")), "sin-veredicto");
  });

  it("un error ausente del mapa cuenta como sin-datos", () => {
    const sinError2: FasesPorError = { "error-1": "cerrado", "error-3": "cerrado" };
    assert.equal(veredicto("dejo", ITEM, sinError2), "sin-veredicto");
    assert.equal(veredicto("resuelvo", ITEM, sinError2), "sin-veredicto");
    assert.equal(veredicto("resuelvo", ITEM, { "error-3": "abierto" }), "lectura-a-revisar");
  });

  it("un ítem sin distractores no tiene veredicto", () => {
    const soloCorrecta: ItemAdvance = { ...ITEM, alternativas: [ITEM.alternativas[2]] };
    assert.equal(veredicto("resuelvo", soloCorrecta, fases("cerrado", "cerrado", "cerrado")), "sin-veredicto");
  });
});

describe("erroresAbiertosDe", () => {
  it("devuelve los abiertos en el orden de las alternativas", () => {
    assert.deepEqual(erroresAbiertosDe(ITEM, fases("abierto", "abierto", "cerrado")), ["error-1", "error-2"]);
    assert.deepEqual(erroresAbiertosDe(ITEM, fases("cerrado", "sin-datos", "observacion")), []);
  });
});

describe("fasesDe", () => {
  it("proyecta solo errorId → fase, sin p(L) ni contadores", () => {
    const estados: EstadoDeError[] = [
      { ...estadoSinDatos("error-1"), fase: "abierto", pL: 0.42, fracasos: 2, ultimoIntentoMs: 10 },
      estadoSinDatos("error-2"),
    ];
    const f = fasesDe(estados);
    assert.deepEqual(f, { "error-1": "abierto", "error-2": "sin-datos" });
    assert.equal("pL" in f, false);
  });
});

describe("registros", () => {
  it("registroDecision redondea el tiempo desde el inicio", () => {
    assert.deepEqual(registroDecision(ITEM, "resuelvo", 1000.25, 4321.5), {
      itemId: "adv-prueba-001",
      decision: "resuelvo",
      ms: 3321,
    });
  });

  it("registroSinDecision registra el límite, no un instante (D16)", () => {
    assert.deepEqual(registroSinDecision(ITEM), { itemId: "adv-prueba-001", decision: "sin-decision", ms: LIMITE_MS });
    assert.equal(LIMITE_MS, 20_000);
  });

  it("payloadTriageDecision usa las claves de §8", () => {
    assert.deepEqual(payloadTriageDecision({ itemId: "x", decision: "dejo", ms: 7 }), {
      item_id: "x",
      decision: "dejo",
      ms: 7,
    });
  });
});

describe("resumenTriage (D18)", () => {
  it("cuenta el total y los que tienen veredicto, y adjunta los abiertos solo en lectura-a-revisar", () => {
    const items = [item("i-1"), item("i-2"), item("i-3"), item("i-4")];
    const f = fases("abierto", "cerrado", "cerrado");
    const resumen = resumenTriage(
      [
        { itemId: "i-1", decision: "resuelvo", ms: 100 },
        { itemId: "i-2", decision: "dejo", ms: 200 },
        { itemId: "i-3", decision: "marco", ms: 300 },
        { itemId: "i-4", decision: "sin-decision", ms: LIMITE_MS },
      ],
      items,
      f,
    );
    assert.equal(resumen.total, 4);
    assert.equal(resumen.conVeredicto, 3);
    assert.deepEqual(
      resumen.filas.map((x) => [x.itemId, x.veredicto, x.erroresAbiertos]),
      [
        ["i-1", "lectura-a-revisar", ["error-1"]],
        ["i-2", "lectura-buena", []],
        ["i-3", "lectura-buena", []],
        ["i-4", "sin-veredicto", []],
      ],
    );
  });

  it("omite un registro cuyo ítem no está en la sesión", () => {
    const resumen = resumenTriage([{ itemId: "fantasma", decision: "dejo", ms: 1 }], [ITEM], fases("cerrado", "cerrado", "cerrado"));
    assert.equal(resumen.total, 0);
    assert.deepEqual(resumen.filas, []);
  });
});

describe("seleccionarItems", () => {
  const banco = Array.from({ length: 25 }, (_, i) => item(`adv-${String(i + 1).padStart(3, "0")}`));

  it("toma ITEMS_POR_TRIAGE sin repetir y con las alternativas mezcladas", () => {
    const sesion = seleccionarItems(banco);
    assert.equal(sesion.length, ITEMS_POR_TRIAGE);
    assert.equal(new Set(sesion.map((i) => i.id)).size, ITEMS_POR_TRIAGE);
    for (const it of sesion) {
      assert.deepEqual(it.alternativas.map((a) => a.clave), ["A", "B", "C", "D"]);
      assert.deepEqual(new Set(it.alternativas.map((a) => a.claveOriginal)), new Set(["A", "B", "C", "D"]));
    }
  });

  it("con un banco menor al tope devuelve el banco entero", () => {
    assert.equal(seleccionarItems(banco.slice(0, 7)).length, 7);
  });

  it("es determinista con un aleatorio inyectado", () => {
    let n = 0;
    const secuencia = () => ((n += 0.37) % 1);
    n = 0;
    const a = seleccionarItems(banco, secuencia);
    n = 0;
    const b = seleccionarItems(banco, secuencia);
    assert.deepEqual(a, b);
  });
});

describe("cuerpoSesionTriage y validarCuerpoTriage (D15)", () => {
  const SESION = "6f1c2d3e-4a5b-4c6d-8e7f-90a1b2c3d4e5";
  const cuerpo = () => ({
    sesionId: SESION,
    unidadId: "porcentaje",
    registros: [
      { itemId: "adv-porcentaje-001", decision: "resuelvo", ms: 1234 },
      { itemId: "adv-porcentaje-002", decision: "sin-decision", ms: LIMITE_MS },
    ],
  });

  it("cuerpoSesionTriage copia los registros y redondea ms", () => {
    const original = [{ itemId: "x", decision: "dejo" as const, ms: 1234.6 }];
    const c = cuerpoSesionTriage(SESION, "porcentaje", original);
    assert.deepEqual(c, { sesionId: SESION, unidadId: "porcentaje", registros: [{ itemId: "x", decision: "dejo", ms: 1235 }] });
    assert.notEqual(c.registros[0], original[0]);
  });

  it("acepta un cuerpo bien formado y devuelve solo los campos conocidos", () => {
    const entrada = { ...cuerpo(), extra: 1, registros: [{ ...cuerpo().registros[0], sobra: true }] };
    const v = validarCuerpoTriage(entrada);
    assert.deepEqual(v, {
      sesionId: SESION,
      unidadId: "porcentaje",
      registros: [{ itemId: "adv-porcentaje-001", decision: "resuelvo", ms: 1234 }],
    });
  });

  it("rechaza sesionId que no es uuid, unidadId vacío y registros vacíos", () => {
    assert.equal(validarCuerpoTriage({ ...cuerpo(), sesionId: "abc" }), null);
    assert.equal(validarCuerpoTriage({ ...cuerpo(), unidadId: "" }), null);
    assert.equal(validarCuerpoTriage({ ...cuerpo(), registros: [] }), null);
    assert.equal(validarCuerpoTriage(null), null);
    assert.equal(validarCuerpoTriage("texto"), null);
  });

  it("rechaza una decision fuera del alfabeto", () => {
    const c = cuerpo();
    c.registros[0].decision = "quizas";
    assert.equal(validarCuerpoTriage(c), null);
  });

  it("rechaza ms negativo, no entero o fuera de integer", () => {
    for (const ms of [-1, 1.5, 2_147_483_648, "12", null]) {
      const c = cuerpo();
      (c.registros[0] as { ms: unknown }).ms = ms;
      assert.equal(validarCuerpoTriage(c), null, `ms=${String(ms)}`);
    }
  });

  it("rechaza itemId repetido y más de 50 registros", () => {
    const c = cuerpo();
    c.registros[1].itemId = c.registros[0].itemId;
    assert.equal(validarCuerpoTriage(c), null);
    const largo = {
      ...cuerpo(),
      registros: Array.from({ length: 51 }, (_, i) => ({ itemId: `i-${i}`, decision: "marco", ms: 1 })),
    };
    assert.equal(validarCuerpoTriage(largo), null);
  });
});
