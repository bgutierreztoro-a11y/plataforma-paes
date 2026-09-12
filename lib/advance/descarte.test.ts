import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  estadoInicialItem,
  errorMasFrecuente,
  itemCerrado,
  payloadDescarteAlternativa,
  payloadDescarteFatal,
  payloadDescarteFin,
  payloadDescarteInicio,
  reducerItem,
  cuerpoSesionDescarte,
  registroDe,
  resumenDeSesion,
  validarCuerpoSesion,
  type EstadoItem,
  type ItemAdvance,
  type RegistroItem,
} from "./descarte.ts";

/* Un ítem ya MEZCLADO: la letra visible no coincide con la original en
   ninguna alternativa. La correcta original es la A y se ve como C.
   Visible → original: A→B (error-1), B→D (error-3), C→A (correcta), D→C (error-2). */
const ITEM: ItemAdvance = {
  id: "adv-prueba-001",
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

const T0 = 1000;
const inicial = () => estadoInicialItem(ITEM, T0);
const descartar = (e: EstadoItem, clave: "A" | "B" | "C" | "D", enMs: number) =>
  reducerItem(e, { type: "DESCARTAR", clave, enMs });
const confirmar = (e: EstadoItem, enMs: number) => reducerItem(e, { type: "CONFIRMAR", enMs });

describe("estado inicial", () => {
  it("fase descartando, las cuatro intactas, sin registro", () => {
    const e = inicial();
    assert.equal(e.fase, "descartando");
    assert.deepEqual(e.estados, { A: "intacta", B: "intacta", C: "intacta", D: "intacta" });
    assert.deepEqual(e.ordenDescartes, []);
    assert.deepEqual(e.erroresIdentificados, []);
    assert.equal(e.descarteFatal, null);
    assert.equal(e.tiempoMs, null);
    assert.equal(itemCerrado(e), false);
  });
});

describe("tabla de transiciones", () => {
  it("descartando + DESCARTAR distractor intacta → descartada-correcta, registra claveOriginal y errorCatalogado, sigue descartando", () => {
    const e = descartar(inicial(), "A", T0 + 500);
    assert.equal(e.fase, "descartando");
    assert.equal(e.estados.A, "descartada-correcta");
    assert.deepEqual(e.ordenDescartes, ["B"]);
    assert.deepEqual(e.erroresIdentificados, ["error-1"]);
    assert.equal(e.descarteFatal, null);
    assert.equal(e.tiempoMs, null);
  });

  it("dos distractores descartados → todavía descartando, orden y errores en el orden de los toques", () => {
    const e = descartar(descartar(inicial(), "D", T0 + 100), "A", T0 + 200);
    assert.equal(e.fase, "descartando");
    assert.deepEqual(e.ordenDescartes, ["C", "B"]);
    assert.deepEqual(e.erroresIdentificados, ["error-2", "error-1"]);
    assert.equal(e.estados.C, "intacta");
  });

  it("tres distractores descartados → la correcta pasa a sobreviviente y la fase a confirmar", () => {
    const e = descartar(descartar(descartar(inicial(), "D", T0 + 100), "A", T0 + 200), "B", T0 + 300);
    assert.equal(e.fase, "confirmar");
    assert.equal(e.estados.C, "sobreviviente");
    assert.deepEqual(e.ordenDescartes, ["C", "B", "D"]);
    assert.deepEqual(e.erroresIdentificados, ["error-2", "error-1", "error-3"]);
    assert.equal(e.tiempoMs, null);
    assert.equal(itemCerrado(e), false);
  });

  it("descartando + DESCARTAR la correcta → descartada-por-error, descarteFatal con claveOriginal, cerrado-fatal, tiempoMs", () => {
    const e = descartar(descartar(inicial(), "A", T0 + 100), "C", T0 + 2500);
    assert.equal(e.fase, "cerrado-fatal");
    assert.equal(e.estados.C, "descartada-por-error");
    assert.equal(e.descarteFatal, "A");
    assert.deepEqual(e.ordenDescartes, ["B", "A"]);
    assert.deepEqual(e.erroresIdentificados, ["error-1"]);
    assert.equal(e.tiempoMs, 2500);
    assert.equal(itemCerrado(e), true);
  });

  it("DESCARTAR una ya descartada → mismo objeto de estado (irreversible, sin restaurar)", () => {
    const e1 = descartar(inicial(), "A", T0 + 100);
    const e2 = descartar(e1, "A", T0 + 200);
    assert.equal(e2, e1);
  });

  it("confirmar + DESCARTAR la sobreviviente → mismo objeto", () => {
    const e1 = descartar(descartar(descartar(inicial(), "A", T0 + 1), "B", T0 + 2), "D", T0 + 3);
    assert.equal(e1.fase, "confirmar");
    assert.equal(descartar(e1, "C", T0 + 4), e1);
  });

  it("descartando + CONFIRMAR → mismo objeto (no hay nada que confirmar)", () => {
    const e1 = descartar(inicial(), "A", T0 + 1);
    assert.equal(confirmar(e1, T0 + 2), e1);
  });

  it("confirmar + CONFIRMAR → cerrado-confirmado con tiempoMs", () => {
    const e1 = descartar(descartar(descartar(inicial(), "A", T0 + 1), "B", T0 + 2), "D", T0 + 3);
    const e2 = confirmar(e1, T0 + 4000);
    assert.equal(e2.fase, "cerrado-confirmado");
    assert.equal(e2.tiempoMs, 4000);
    assert.equal(e2.descarteFatal, null);
    assert.equal(e2.estados.C, "sobreviviente");
    assert.equal(itemCerrado(e2), true);
  });

  it("cerrado-fatal + DESCARTAR o CONFIRMAR → mismo objeto", () => {
    const e1 = descartar(inicial(), "C", T0 + 1);
    assert.equal(descartar(e1, "A", T0 + 2), e1);
    assert.equal(confirmar(e1, T0 + 2), e1);
  });

  it("cerrado-confirmado + DESCARTAR o CONFIRMAR → mismo objeto", () => {
    const e1 = confirmar(descartar(descartar(descartar(inicial(), "A", T0 + 1), "B", T0 + 2), "D", T0 + 3), T0 + 4);
    assert.equal(descartar(e1, "C", T0 + 5), e1);
    assert.equal(confirmar(e1, T0 + 5), e1);
  });

  it("DESCARTAR una clave que el ítem no tiene → mismo objeto", () => {
    const e1 = inicial();
    assert.equal(reducerItem(e1, { type: "DESCARTAR", clave: "E" as "A", enMs: T0 + 1 }), e1);
  });

  it("no muta el estado anterior", () => {
    const e1 = inicial();
    const copia = structuredClone(e1);
    descartar(e1, "A", T0 + 1);
    assert.deepEqual(e1, copia);
  });
});

describe("mezcla: el registro guarda la clave original, nunca la visible", () => {
  it("ordenDescartes y descarteFatal usan claveOriginal aunque el toque fue por la visible", () => {
    const e = descartar(descartar(inicial(), "B", T0 + 1), "C", T0 + 2);
    assert.deepEqual(e.ordenDescartes, ["D", "A"]);
    assert.equal(e.descarteFatal, "A");
    assert.notDeepEqual(e.ordenDescartes, ["B", "C"]);
  });

  it("registroDe expone la forma de §6.1 con claves originales", () => {
    const e = confirmar(descartar(descartar(descartar(inicial(), "D", T0 + 1), "B", T0 + 2), "A", T0 + 3), T0 + 900);
    assert.deepEqual(registroDe(e), {
      itemId: "adv-prueba-001",
      ordenDescartes: ["C", "D", "B"],
      erroresIdentificados: ["error-2", "error-3", "error-1"],
      descarteFatal: null,
      tiempoMs: 900,
    } satisfies RegistroItem);
  });
});

describe("resumen de sesión", () => {
  const registros: RegistroItem[] = [
    { itemId: "i1", ordenDescartes: ["B", "C", "D"], erroresIdentificados: ["error-1", "error-2", "error-3"], descarteFatal: null, tiempoMs: 100 },
    { itemId: "i2", ordenDescartes: ["C", "A"], erroresIdentificados: ["error-2"], descarteFatal: "A", tiempoMs: 200 },
    { itemId: "i3", ordenDescartes: ["D", "B", "C"], erroresIdentificados: ["error-3", "error-1", "error-2"], descarteFatal: null, tiempoMs: 300 },
  ];

  it("cuenta ítems, descartes acertados y resultados por ítem", () => {
    const r = resumenDeSesion(registros);
    assert.equal(r.items, 3);
    assert.equal(r.descartesAcertados, 7);
    assert.deepEqual(r.resultados, ["correcto", "incorrecto", "correcto"]);
  });

  it("error más frecuente por conteo", () => {
    assert.equal(resumenDeSesion(registros).errorMasFrecuente, "error-2");
  });

  it("empate: gana el que apareció primero en la sesión", () => {
    const empate: RegistroItem[] = [
      { itemId: "i1", ordenDescartes: ["C", "B"], erroresIdentificados: ["error-7", "error-4"], descarteFatal: "A", tiempoMs: 1 },
      { itemId: "i2", ordenDescartes: ["B", "C"], erroresIdentificados: ["error-4", "error-7"], descarteFatal: "A", tiempoMs: 1 },
    ];
    assert.equal(errorMasFrecuente(empate), "error-7");
  });

  it("sin descartes acertados → null", () => {
    assert.equal(errorMasFrecuente([]), null);
    assert.equal(errorMasFrecuente([{ itemId: "i", ordenDescartes: ["A"], erroresIdentificados: [], descarteFatal: "A", tiempoMs: 1 }]), null);
    assert.deepEqual(resumenDeSesion([]), { items: 0, descartesAcertados: 0, errorMasFrecuente: null, resultados: [] });
  });
});

describe("payloads de eventos (§8)", () => {
  it("inicio", () => {
    assert.deepEqual(payloadDescarteInicio("porcentaje", 5), { unidad_id: "porcentaje", items: 5 });
  });

  it("alternativa: clave original, acertado, posición 1-based y ms desde el inicio del ítem", () => {
    const e0 = inicial();
    assert.deepEqual(payloadDescarteAlternativa(e0, "B", T0 + 350), {
      item_id: "adv-prueba-001",
      clave: "D",
      acertado: true,
      posicion_en_orden: 1,
      ms: 350,
    });
    const e1 = descartar(e0, "B", T0 + 350);
    assert.deepEqual(payloadDescarteAlternativa(e1, "C", T0 + 800), {
      item_id: "adv-prueba-001",
      clave: "A",
      acertado: false,
      posicion_en_orden: 2,
      ms: 800,
    });
  });

  it("alternativa: null cuando la acción no descarta nada", () => {
    const e1 = descartar(inicial(), "A", T0 + 1);
    assert.equal(payloadDescarteAlternativa(e1, "A", T0 + 2), null);
    const fatal = descartar(e1, "C", T0 + 3);
    assert.equal(payloadDescarteAlternativa(fatal, "B", T0 + 4), null);
    const conf = descartar(descartar(e1, "B", T0 + 3), "D", T0 + 4);
    assert.equal(payloadDescarteAlternativa(conf, "C", T0 + 5), null);
  });

  it("fatal: solo en cerrado-fatal, con la clave original de la correcta", () => {
    assert.equal(payloadDescarteFatal(inicial()), null);
    const fatal = descartar(inicial(), "C", T0 + 1);
    assert.deepEqual(payloadDescarteFatal(fatal), { item_id: "adv-prueba-001", clave: "A" });
    const conf = confirmar(descartar(descartar(descartar(inicial(), "A", 1), "B", 2), "D", 3), 4);
    assert.equal(payloadDescarteFatal(conf), null);
  });

  it("fin: aciertos son ítems sin fatal, error_dominante como en el resumen", () => {
    const registros: RegistroItem[] = [
      { itemId: "i1", ordenDescartes: ["B", "C", "D"], erroresIdentificados: ["error-1", "error-2", "error-3"], descarteFatal: null, tiempoMs: 1 },
      { itemId: "i2", ordenDescartes: ["A"], erroresIdentificados: [], descarteFatal: "A", tiempoMs: 1 },
      { itemId: "i3", ordenDescartes: ["B", "A"], erroresIdentificados: ["error-1"], descarteFatal: "A", tiempoMs: 1 },
    ];
    assert.deepEqual(payloadDescarteFin("porcentaje", registros), {
      unidad_id: "porcentaje",
      aciertos: 1,
      total: 3,
      error_dominante: "error-1",
    });
    assert.deepEqual(payloadDescarteFin("porcentaje", []), { unidad_id: "porcentaje", aciertos: 0, total: 0, error_dominante: null });
  });
});

describe("cuerpo de persistencia (F3)", () => {
  const SESION = "6f1c2a4e-9b3d-4c7a-8e21-0f5b6d7c8a91";
  /* Segundo ítem de la sesión: mismo ITEM de prueba con otro id, para que el
     cuerpo no repita itemId. */
  const fatal = () => ({
    ...registroDe(descartar(descartar(inicial(), "B", T0 + 1), "C", T0 + 2)),
    itemId: "adv-prueba-002",
  });
  const confirmado = () =>
    registroDe(confirmar(descartar(descartar(descartar(inicial(), "D", T0 + 1), "B", T0 + 2), "A", T0 + 3), T0 + 900));

  it("el cuerpo conserva sesión y unidad y copia los registros en vez de compartirlos", () => {
    const registros = [confirmado(), fatal()];
    const cuerpo = cuerpoSesionDescarte(SESION, "porcentaje", registros);
    assert.equal(cuerpo.sesionId, SESION);
    assert.equal(cuerpo.unidadId, "porcentaje");
    assert.deepEqual(cuerpo.registros, registros);
    assert.notEqual(cuerpo.registros, registros);
    assert.notEqual(cuerpo.registros[0], registros[0]);
    assert.notEqual(cuerpo.registros[0].ordenDescartes, registros[0].ordenDescartes);
  });

  it("tiempoMs sale entero y es el redondeo del de entrada", () => {
    const conDecimales = { ...confirmado(), tiempoMs: 899.6 };
    const [r] = cuerpoSesionDescarte(SESION, "porcentaje", [conDecimales]).registros;
    assert.ok(Number.isInteger(r.tiempoMs));
    assert.equal(r.tiempoMs, Math.round(conDecimales.tiempoMs));
  });

  it("ida y vuelta: lo que arma el cliente lo acepta el servidor tal cual", () => {
    const cuerpo = cuerpoSesionDescarte(SESION, "porcentaje", [confirmado(), fatal()]);
    const enviado = JSON.parse(JSON.stringify(cuerpo)) as unknown;
    assert.deepEqual(validarCuerpoSesion(enviado), cuerpo);
  });

  it("devuelve un objeto nuevo solo con los campos conocidos", () => {
    const cuerpo = cuerpoSesionDescarte(SESION, "porcentaje", [confirmado()]);
    const conExtras = {
      ...cuerpo,
      usuarioId: "user_intruso",
      registros: [{ ...cuerpo.registros[0], correcta: true }],
    };
    const validado = validarCuerpoSesion(conExtras);
    assert.deepEqual(validado, cuerpo);
    assert.notEqual(validado, conExtras);
  });

  it("rechaza lo que no es un cuerpo", () => {
    for (const entrada of [null, undefined, 3, "x", [], {}]) {
      assert.equal(validarCuerpoSesion(entrada), null, JSON.stringify(entrada));
    }
  });

  it("rechaza sesionId sin forma de uuid y unidadId vacía o larga", () => {
    const base = cuerpoSesionDescarte(SESION, "porcentaje", [confirmado()]);
    assert.equal(validarCuerpoSesion({ ...base, sesionId: "sesion-1" }), null);
    assert.equal(validarCuerpoSesion({ ...base, sesionId: 42 }), null);
    assert.equal(validarCuerpoSesion({ ...base, unidadId: "" }), null);
    assert.equal(validarCuerpoSesion({ ...base, unidadId: "u".repeat(101) }), null);
    assert.notEqual(validarCuerpoSesion({ ...base, unidadId: "u".repeat(100) }), null);
  });

  it("rechaza registros vacíos, no arreglo, demasiados o con itemId repetido", () => {
    const base = cuerpoSesionDescarte(SESION, "porcentaje", [confirmado()]);
    assert.equal(validarCuerpoSesion({ ...base, registros: [] }), null);
    assert.equal(validarCuerpoSesion({ ...base, registros: {} }), null);
    const uno = base.registros[0];
    assert.equal(validarCuerpoSesion({ ...base, registros: [uno, { ...uno }] }), null);
    const muchos = Array.from({ length: 51 }, (_, i) => ({ ...uno, itemId: `i${i}` }));
    assert.equal(validarCuerpoSesion({ ...base, registros: muchos }), null);
    assert.notEqual(validarCuerpoSesion({ ...base, registros: muchos.slice(0, 50) }), null);
  });

  it("rechaza cada campo de registro con tipo o rango equivocado", () => {
    const base = cuerpoSesionDescarte(SESION, "porcentaje", [confirmado()]);
    const uno = base.registros[0];
    const casos: Array<Partial<Record<keyof RegistroItem, unknown>>> = [
      { itemId: "" },
      { itemId: 7 },
      { ordenDescartes: "ABC" },
      { ordenDescartes: ["A", 2] },
      { ordenDescartes: [""] },
      { ordenDescartes: Array.from({ length: 17 }, () => "A") },
      { erroresIdentificados: [null] },
      { descarteFatal: undefined },
      { descarteFatal: 1 },
      { descarteFatal: "" },
      { tiempoMs: -1 },
      { tiempoMs: 1.5 },
      { tiempoMs: "900" },
      { tiempoMs: 2_147_483_648 },
    ];
    for (const caso of casos) {
      assert.equal(validarCuerpoSesion({ ...base, registros: [{ ...uno, ...caso }] }), null, JSON.stringify(caso));
    }
    assert.notEqual(validarCuerpoSesion({ ...base, registros: [{ ...uno, tiempoMs: 2_147_483_647 }] }), null);
    assert.notEqual(validarCuerpoSesion({ ...base, registros: [{ ...uno, erroresIdentificados: [] }] }), null);
  });
});
