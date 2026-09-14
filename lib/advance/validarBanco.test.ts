import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  coberturaErrorCatalogadoBanco,
  validarDatosBancoAdvance,
} from "../../scripts/validar-contenido.mjs";

/* Contrato de errorCatalogado en un banco Advance (item-advance.schema.json,
   reglas (8) y (9) del $comment). Se prueba sobre datos en memoria, llamando
   a validarDatosBancoAdvance sin unidadDelDirectorio, dirContent ni
   erroresCatalogados, para que no entren las reglas que dependen del disco
   (directorio, catálogo del módulo, resolución de ids). Al final, el banco
   real de porcentaje, con el mismo criterio que lib/catalogoErrores.test.ts:
   contra un stub no se sabría si el archivo de verdad cumple. */

const FEEDBACK = "Feedback de descarte con más de cuarenta caracteres, sin celebración.";

type Distractor = Record<string, unknown>;

/** Distractor mapeado a `error`, o declarado sin mapeo si `error` es null. */
function distractor(clave: "A" | "B" | "D", error: string | null, extra: Distractor = {}): Distractor {
  const base: Distractor = { clave, texto: `texto ${clave}`, esCorrecta: false, feedbackDescarte: FEEDBACK };
  if (error === null) {
    return {
      ...base,
      errorCatalogado: null,
      sinErrorCatalogado: { motivo: "valor-plausible-no-derivable", nota: "El valor no sale de ningún paso errado." },
      ...extra,
    };
  }
  return { ...base, errorCatalogado: error, ...extra };
}

const CORRECTA = { clave: "C", texto: "texto C", esCorrecta: true, feedbackDescarteIncorrecto: FEEDBACK };

function item(n: number, errores: [string | null, string | null, string | null], extras: Distractor[] = [{}, {}, {}]) {
  return {
    id: `adv-prueba-${String(n).padStart(3, "0")}`,
    unidadId: "prueba",
    moduloId: "prueba",
    habilidad: "resolver",
    dificultad: "media",
    tiempoReferenciaSeg: 120,
    enunciado: `Enunciado ${n}.`,
    alternativas: [
      distractor("A", errores[0], extras[0]),
      distractor("B", errores[1], extras[1]),
      CORRECTA,
      distractor("D", errores[2], extras[2]),
    ],
    solucion: `Solución ${n}.`,
    proveniencia: { fuenteOrigen: "propia" },
  };
}

function banco(...items: ReturnType<typeof item>[]) {
  return {
    tipo: "banco-advance",
    unidadId: "prueba",
    moduloId: "prueba",
    titulo: "Unidad de prueba",
    items,
    proveniencia: {
      fuentesAnalisis: ["temario DEMRE M1"],
      declaracionOriginalidad: "Banco de prueba en memoria, sin material externo.",
    },
  };
}

const TRES = ["falla-uno", "falla-dos", "falla-tres"] as [string, string, string];
const validar = (b: unknown) => validarDatosBancoAdvance(b);
/** Errores del distractor `clave` del primer ítem, sin el prefijo `items[0].`. */
const delDistractor = (errores: string[], clave: string) =>
  errores.filter((e) => e.startsWith(`items[0].${clave}`));

describe("errorCatalogado: declaración (regla A)", () => {
  it("tres distractores mapeados pasan", () => {
    assert.deepEqual(validar(banco(item(1, TRES))), []);
  });

  it("null + sinErrorCatalogado pasa con cada uno de los cuatro motivos", () => {
    for (const motivo of [
      "valor-plausible-no-derivable",
      "creencia-sobre-un-paso",
      "error-transversal-pendiente",
      "sin-mecanismo-identificado",
    ]) {
      const b = banco(item(1, ["falla-uno", null, "falla-tres"], [{}, { sinErrorCatalogado: { motivo, nota: "Una línea." } }, {}]));
      assert.deepEqual(validar(b), [], motivo);
    }
  });

  it("null sin sinErrorCatalogado falla nombrando la declaración que falta", () => {
    const b = banco(item(1, ["falla-uno", null, "falla-tres"], [{}, { sinErrorCatalogado: undefined }, {}]));
    const errores = delDistractor(validar(b), "B");
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]\.B: errorCatalogado null sin sinErrorCatalogado/);
  });

  it("errorCatalogado con valor y sinErrorCatalogado a la vez falla", () => {
    const b = banco(
      item(1, TRES, [{ sinErrorCatalogado: { motivo: "creencia-sobre-un-paso", nota: "Sobra." } }, {}, {}]),
    );
    const errores = delDistractor(validar(b), "A");
    assert.equal(errores.length, 1);
    assert.match(errores[0], /tiene errorCatalogado "falla-uno" y sinErrorCatalogado a la vez/);
  });

  it("la clave errorCatalogado ausente falla: la ausencia se declara, no se omite", () => {
    const b = banco(item(1, TRES, [{ errorCatalogado: undefined }, {}, {}]));
    const errores = delDistractor(validar(b), "A");
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]\.A: distractor sin la clave errorCatalogado/);
  });

  it("motivo fuera del enum, nota vacía, nota con salto de línea y clave sobrante fallan por campo", () => {
    const casos: [Distractor, RegExp][] = [
      [{ motivo: "porque-si", nota: "x" }, /^items\[0\]\.B\.sinErrorCatalogado\.motivo: debe ser uno de/],
      [{ motivo: "creencia-sobre-un-paso", nota: "  " }, /^items\[0\]\.B\.sinErrorCatalogado\.nota: falta la nota/],
      [{ motivo: "creencia-sobre-un-paso", nota: "dos\nlíneas" }, /^items\[0\]\.B\.sinErrorCatalogado\.nota: es una sola línea/],
      [{ motivo: "creencia-sobre-un-paso", nota: "x", extra: 1 }, /^items\[0\]\.B\.sinErrorCatalogado: clave "extra" no admitida/],
    ];
    for (const [declaracion, esperado] of casos) {
      const b = banco(item(1, ["falla-uno", null, "falla-tres"], [{}, { sinErrorCatalogado: declaracion }, {}]));
      const errores = delDistractor(validar(b), "B");
      assert.equal(errores.length, 1, JSON.stringify(declaracion));
      assert.match(errores[0], esperado);
    }
  });

  it("sinErrorCatalogado que no es objeto falla", () => {
    const b = banco(item(1, ["falla-uno", null, "falla-tres"], [{}, { sinErrorCatalogado: "no" }, {}]));
    assert.match(delDistractor(validar(b), "B")[0], /sinErrorCatalogado: debe ser un objeto/);
  });

  it("feedbackDescarte sigue obligatorio en un distractor con errorCatalogado null", () => {
    const b = banco(item(1, ["falla-uno", null, "falla-tres"], [{}, { feedbackDescarte: undefined }, {}]));
    const errores = delDistractor(validar(b), "B");
    assert.equal(errores.length, 1);
    assert.match(errores[0], /distractor sin feedbackDescarte/);
  });
});

describe("piso por ítem (regla 8)", () => {
  it("un ítem con los tres distractores en null declarado falla aunque cada declaración sea válida", () => {
    const errores = validar(banco(item(1, [null, null, null]), item(2, TRES), item(3, TRES)));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]: 0 de 3 distractores con errorCatalogado; el piso por ítem es 1/);
  });

  it("un ítem con un solo distractor mapeado pasa", () => {
    assert.deepEqual(validar(banco(item(1, ["falla-uno", null, null]), item(2, TRES))), []);
  });
});

describe("piso por banco (regla 9)", () => {
  /* Cinco ítems, quince distractores. Con mapeos 3,2,2,1,1 hay 9/15 = 60 %,
     justo en el piso; con 3,2,1,1,1 hay 8/15 = 53,3 %, debajo. */
  const enElPiso = banco(
    item(1, TRES),
    item(2, ["falla-uno", "falla-dos", null]),
    item(3, ["falla-uno", null, "falla-tres"]),
    item(4, ["falla-uno", null, null]),
    item(5, [null, null, "falla-tres"]),
  );
  const bajoElPiso = banco(
    item(1, TRES),
    item(2, ["falla-uno", "falla-dos", null]),
    item(3, ["falla-uno", null, null]),
    item(4, ["falla-uno", null, null]),
    item(5, [null, null, "falla-tres"]),
  );

  it("exactamente 60 % pasa", () => {
    assert.equal(coberturaErrorCatalogadoBanco(enElPiso).mapeados / coberturaErrorCatalogadoBanco(enElPiso).total, 0.6);
    assert.deepEqual(validar(enElPiso), []);
  });

  it("53,3 % falla con el conteo y el porcentaje en el mensaje", () => {
    const errores = validar(bajoElPiso);
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^cobertura de errorCatalogado 8\/15 \(53\.3%\) bajo el piso del 60% por banco$/);
  });
});

describe("coberturaErrorCatalogadoBanco", () => {
  it("cuenta distractores, mapeados y los declarados por motivo", () => {
    const b = banco(
      item(1, ["falla-uno", null, "falla-tres"], [{}, { sinErrorCatalogado: { motivo: "creencia-sobre-un-paso", nota: "n" } }, {}]),
      item(2, ["falla-uno", null, null]),
    );
    assert.deepEqual(coberturaErrorCatalogadoBanco(b), {
      total: 6,
      mapeados: 3,
      porcentaje: 50,
      porMotivo: { "creencia-sobre-un-paso": 1, "valor-plausible-no-derivable": 2 },
    });
  });

  it("un null sin declarar cuenta como sin-declarar, para que el reporte no lo esconda", () => {
    const b = banco(item(1, ["falla-uno", null, "falla-tres"], [{}, { sinErrorCatalogado: undefined }, {}]));
    assert.deepEqual(coberturaErrorCatalogadoBanco(b).porMotivo, { "sin-declarar": 1 });
  });

  it("banco sin ítems: 0/0 y porcentaje 0, sin dividir por cero", () => {
    assert.deepEqual(coberturaErrorCatalogadoBanco({ items: [] }), { total: 0, mapeados: 0, porcentaje: 0, porMotivo: {} });
  });
});

describe("banco real: content/advance/porcentaje/banco.json", () => {
  const ruta = path.join(process.cwd(), "content", "advance", "porcentaje", "banco.json");
  const data = JSON.parse(readFileSync(ruta, "utf8"));

  it("cumple el contrato y está sobre el piso por banco", () => {
    /* Medido el 2026-09-13: 20 ítems, 60/60 distractores mapeados (100 %).
       El assert afirma la relación con el piso, no el número. */
    assert.deepEqual(validarDatosBancoAdvance(data, "porcentaje", path.join(process.cwd(), "content")), []);
    const { total, mapeados, porcentaje } = coberturaErrorCatalogadoBanco(data);
    assert.ok(total > 0);
    assert.ok(mapeados / total >= 0.6, `cobertura ${porcentaje.toFixed(1)}% bajo el piso`);
  });
});
