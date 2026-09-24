import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validarDatosBancoAdvance } from "../../scripts/validar-contenido.mjs";

/* Reglas (41) a (50): figura cuerpo-geometrico. Datos inventados; cada regla
   con el ejemplo inválido de la PARADA (mensaje exacto) y un caso que pasa. Se
   valida en memoria, como en validarLienzo.test.ts. */

const FEEDBACK = "Feedback de descarte con más de cuarenta caracteres, sin celebración.";
const DESCRIPCION = "Cuerpo de prueba con datos inventados para el validador.";

function item(extra: Record<string, unknown> = {}, alternativas?: Record<string, unknown>[]) {
  const alts = [
    { clave: "A", texto: "texto A", esCorrecta: false, errorCatalogado: "falla-uno", feedbackDescarte: FEEDBACK },
    { clave: "B", texto: "texto B", esCorrecta: false, errorCatalogado: "falla-dos", feedbackDescarte: FEEDBACK },
    { clave: "C", texto: "texto C", esCorrecta: true, feedbackDescarteIncorrecto: FEEDBACK },
    { clave: "D", texto: "texto D", esCorrecta: false, errorCatalogado: "falla-tres", feedbackDescarte: FEEDBACK },
  ].map((a, i) => ({ ...a, ...(alternativas?.[i] ?? {}) }));
  return {
    id: "adv-prueba-001",
    unidadId: "prueba",
    moduloId: "prueba",
    habilidad: "resolver",
    dificultad: "media",
    tiempoReferenciaSeg: 120,
    enunciado: "Enunciado 1.",
    alternativas: alts,
    solucion: "Solución 1.",
    proveniencia: { fuenteOrigen: "propia" },
    ...extra,
  };
}

const banco = (it: ReturnType<typeof item>) => ({
  tipo: "banco-advance",
  unidadId: "prueba",
  moduloId: "prueba",
  titulo: "Unidad de prueba",
  items: [it],
  proveniencia: { fuentesAnalisis: ["temario DEMRE M1"], declaracionOriginalidad: "Banco de prueba en memoria, sin material externo." },
});

const P = (x: number, y: number, z: number) => ({ x, y, z });
const CAJA = {
  tipo: "cuerpo-geometrico",
  piezas: [{ cuerpo: "paralelepipedo", largo: 10, alto: 6, ancho: 4 }],
  cotas: [
    { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm" },
    { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "6 cm" },
    { desde: P(10, 0, 0), hasta: P(10, 0, 4), rotulo: "4 cm" },
  ],
  descripcion: DESCRIPCION,
};
const PILA = {
  tipo: "cuerpo-geometrico",
  piezas: [
    { cuerpo: "cilindro", radio: 10, altura: 8 },
    { cuerpo: "cilindro", radio: 7.5, altura: 8 },
  ],
  cotas: [
    { pieza: 1, medida: "diametro", rotulo: "15 cm" },
    { pieza: 0, medida: "diametro", lado: "abajo", rotulo: "20 cm" },
    { pieza: 0, medida: "altura", rotulo: "8 cm" },
  ],
  descripcion: DESCRIPCION,
};

const conFigura = (figura: Record<string, unknown>) => validarDatosBancoAdvance(banco(item({ figura })));
const soloFigura = (errores: string[]) => errores.filter((e) => e.startsWith("items[0].figura"));
const con = (cambios: Record<string, unknown>, base: Record<string, unknown> = CAJA) => soloFigura(conFigura({ ...base, ...cambios }));

describe("cuerpo-geometrico: figuras válidas", () => {
  it("una caja con tres cotas y una pila de cilindros con tres cotas pasan", () => {
    assert.deepEqual(conFigura(CAJA), []);
    assert.deepEqual(conFigura(PILA), []);
  });

  it("sin cotas, con ocultas false y un cubo solo, pasa", () => {
    assert.deepEqual(conFigura({ tipo: "cuerpo-geometrico", piezas: [{ cuerpo: "cubo", arista: 5 }], ocultas: false, descripcion: DESCRIPCION }), []);
  });

  it("en figuraSolucion se valida en el carril de la solución y pasa", () => {
    assert.deepEqual(validarDatosBancoAdvance(banco(item({ figuraSolucion: CAJA }))), []);
  });
});

describe("cuerpo-geometrico: forma, regla (41)", () => {
  it("un cuerpo fuera del vocabulario falla", () => {
    const errores = con({ piezas: [{ cuerpo: "cono", radio: 2, altura: 5 }], cotas: undefined });
    assert.deepEqual(errores, ["items[0].figura.piezas[0].cuerpo: debe ser uno de: paralelepipedo, cubo, cilindro"]);
  });

  it("medidas de 0, claves de más, lado fuera del vocabulario, llave true y rótulo con LaTeX fallan", () => {
    const errores = con({
      piezas: [{ cuerpo: "paralelepipedo", largo: 0, alto: 6, ancho: 4, color: "rojo" }],
      cotas: [{ desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "$10$", lado: "arriba", llave: true }],
    });
    assert.ok(errores.includes("items[0].figura.piezas[0].largo: debe ser un número mayor que 0"));
    assert.ok(errores.some((e) => e.startsWith("items[0].figura.piezas[0]") && e.includes("color")));
    assert.ok(errores.includes("items[0].figura.cotas[0].lado: debe ser uno de: exterior, interior"));
    assert.ok(errores.includes("items[0].figura.cotas[0].llave: solo se declara para quitarla (false); por defecto la cota va con llave"));
    assert.ok(errores.includes('items[0].figura.cotas[0].rotulo: "$10$" va en texto plano con Unicode (√, π, ², °), sin markdown ni LaTeX'));
  });

  it("ocultas true falla: solo se declara para apagarlas", () => {
    assert.deepEqual(con({ ocultas: true }), ["items[0].figura.ocultas: solo se declara para apagarlas (false); por defecto se dibujan"]);
  });

  it("una cota que no es de arista ni de cilindro falla, y la descripcion corta también", () => {
    const errores = con({ cotas: [{ rotulo: "5 cm" }], descripcion: "corta" });
    assert.ok(errores.includes("items[0].figura.cotas[0]: una cota es { desde, hasta, rotulo } (de arista) o { pieza, medida, rotulo } (de cilindro)"));
    assert.ok(errores.includes("items[0].figura.descripcion: demasiado corta (<30 caracteres)"));
  });
});

describe("cuerpo-geometrico: una sola familia, regla (42)", () => {
  it("cajas y cilindros juntos fallan", () => {
    const errores = con({ piezas: [{ cuerpo: "cubo", arista: 3 }, { cuerpo: "cilindro", radio: 1, altura: 3, x: 6 }], cotas: undefined });
    assert.deepEqual(errores, ["items[0].figura.piezas: mezcla cajas y cilindros; una figura lleva solo cajas o solo cilindros"]);
  });

  it("juntas con una sola caja falla", () => {
    assert.deepEqual(con({ juntas: true }), ["items[0].figura.juntas: solo va con dos o más cajas"]);
  });
});

describe("cuerpo-geometrico: cajas, regla (43)", () => {
  it("dos cajas que se cruzan fallan con su volumen común", () => {
    const errores = con({
      piezas: [
        { cuerpo: "paralelepipedo", largo: 4, alto: 2, ancho: 2 },
        { cuerpo: "cubo", arista: 2, en: P(3, 0, 0) },
      ],
      cotas: undefined,
    });
    assert.deepEqual(errores, ["items[0].figura: piezas[0] y piezas[1] se cruzan (volumen común 4); las cajas se tocan por una cara o van separadas"]);
  });

  it("dos cajas separadas por menos de 12 px fallan; bien separadas, pasan", () => {
    const juntas = (x: number) => con({ piezas: [{ cuerpo: "cubo", arista: 2 }, { cuerpo: "cubo", arista: 2, en: P(x, 0, 0) }], cotas: undefined });
    assert.ok(juntas(2.1).some((e) => e.includes("dos cuerpos separados quedan a")));
    assert.deepEqual(juntas(4), []);
  });
});

describe("cuerpo-geometrico: cilindros, regla (44)", () => {
  it("un cilindro más ancho encima de otro falla", () => {
    const errores = con({ piezas: [{ cuerpo: "cilindro", radio: 2, altura: 3 }, { cuerpo: "cilindro", radio: 3, altura: 1 }], cotas: undefined }, PILA);
    assert.deepEqual(errores, ["items[0].figura.piezas[1]: radio 3 sobre un cilindro de radio 2; en una pila cada cilindro es más angosto que el de abajo"]);
  });
});

describe("cuerpo-geometrico: cotas, regla (45)", () => {
  it("una cota sobre una arista oculta falla", () => {
    const errores = con({ cotas: [{ desde: P(0, 0, 4), hasta: P(10, 0, 4), rotulo: "10 cm" }] });
    assert.deepEqual(errores, ["items[0].figura.cotas[0]: el tramo va por una arista oculta; una cota va sobre una arista que se ve"]);
  });

  it("una cota de cilindro en una figura de cajas y una pieza que no existe fallan", () => {
    assert.deepEqual(con({ cotas: [{ pieza: 0, medida: "radio", rotulo: "3 cm" }] }), ["items[0].figura.cotas[0]: es de cilindro y la figura es de cajas"]);
    assert.deepEqual(con({ cotas: [{ pieza: 5, medida: "altura", rotulo: "8 cm" }] }, PILA), ["items[0].figura.cotas[0]: pieza 5 no existe"]);
  });
});

describe("cuerpo-geometrico: rótulos coherentes, regla (46)", () => {
  it("el rótulo mayor sobre el tramo más corto falla", () => {
    const errores = con({
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "4 cm" },
        { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "9 cm" },
      ],
    });
    assert.deepEqual(errores, ["items[0].figura: «9 cm» es mayor que «4 cm» y su tramo se dibuja más corto (6 contra 10); ajusta las medidas del dibujo"]);
  });
});

describe("cuerpo-geometrico: legibilidad, regla (47)", () => {
  it("una caja de 8 × 8 × 1 falla por razón", () => {
    const errores = con({ piezas: [{ cuerpo: "paralelepipedo", largo: 8, alto: 8, ancho: 1 }], cotas: undefined });
    assert.deepEqual(errores, ["items[0].figura.piezas[0]: la medida mayor (8) es 8 veces la menor (1) y el tope es 4"]);
  });

  it("un cilindro de altura 10 veces el radio falla", () => {
    const errores = con({ piezas: [{ cuerpo: "cilindro", radio: 1, altura: 10 }], cotas: undefined }, PILA);
    assert.deepEqual(errores, ["items[0].figura.piezas[0]: altura sobre radio = 10, fuera de 0,25 a 8"]);
  });
});

describe("cuerpo-geometrico: choques, regla (48)", () => {
  it("sola, la cota de alto en la arista de adelante a la derecha deja la llave sobre la arista de profundidad", () => {
    /* Con una sola cota la escala sube (s ≈ 30 px) y el rótulo cabe entre las dos verticales; la llave no. */
    assert.deepEqual(con({ cotas: [{ desde: P(10, 0, 0), hasta: P(10, 6, 0), rotulo: "6 cm" }] }), [
      "items[0].figura: la llave de «6 cm» corta un trazo del cuerpo (enunciado); cambia el lado, quítala con llave false o pon la cota en otra arista",
    ]);
  });

  it("con las otras tres cotas, el rótulo de esa misma cota pisa la arista de atrás", () => {
    const errores = con({ cotas: [...CAJA.cotas, { desde: P(10, 0, 0), hasta: P(10, 6, 0), rotulo: "6 cm" }] });
    assert.ok(errores.includes("items[0].figura: el rótulo «6 cm» pisa un trazo del cuerpo (enunciado, letra de 12 px); cambia el lado o pon la cota en otra arista"));
  });

  it("con ocultas false, un rótulo sobre una arista oculta ya no choca", () => {
    /* La cota del alto de adelante a la izquierda, hacia adentro y sin llave, cae sobre la oculta vertical de atrás. */
    const figura = {
      piezas: [{ cuerpo: "paralelepipedo", largo: 4, alto: 4, ancho: 1 }],
      cotas: [{ desde: P(0, 0, 0), hasta: P(0, 4, 0), rotulo: "4 cm", lado: "interior", llave: false }],
    };
    assert.deepEqual(con(figura), ["items[0].figura: el rótulo «4 cm» pisa un trazo del cuerpo (enunciado, letra de 12 px); cambia el lado o pon la cota en otra arista"]);
    assert.deepEqual(con({ ...figura, ocultas: false }), []);
  });
});

describe("cuerpo-geometrico: topes, regla (49)", () => {
  it("13 piezas fallan", () => {
    const piezas = Array.from({ length: 13 }, (_, i) => ({ cuerpo: "cubo", arista: 1, en: P(i, 0, 0) }));
    assert.deepEqual(con({ piezas, cotas: undefined }), ["items[0].figura: 13 piezas y el tope es 12"]);
  });
});

describe("cuerpo-geometrico: no va en una alternativa, regla (50)", () => {
  it("una alternativa con cuerpo falla, aunque las cuatro lo traigan", () => {
    const alts = ["A", "B", "C", "D"].map(() => ({ figura: CAJA }));
    const errores = validarDatosBancoAdvance(banco(item({}, alts))).filter((e) => e.includes("cuerpo-geometrico no va en una alternativa"));
    assert.deepEqual(errores, ["A", "B", "C", "D"].map((c) => `items[0].${c}.figura: cuerpo-geometrico no va en una alternativa`));
  });
});
