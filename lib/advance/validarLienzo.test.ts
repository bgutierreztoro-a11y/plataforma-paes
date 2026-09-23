import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validarDatosBancoAdvance } from "../../scripts/validar-contenido.mjs";

/* Reglas (28) a (39): figura lienzo-geometrico. Datos inventados; cada regla
   con un caso que la rompe y uno que pasa. Se valida en memoria, sin
   unidadDelDirectorio ni catálogo, como en validarBanco.test.ts. */

const FEEDBACK = "Feedback de descarte con más de cuarenta caracteres, sin celebración.";

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

const TRIANGULO = {
  tipo: "lienzo-geometrico",
  ventana: { xMin: -1, xMax: 9, yMin: -1, yMax: 7 },
  puntos: [
    { nombre: "A", x: 0, y: 0 },
    { nombre: "B", x: 8, y: 0 },
    { nombre: "C", x: 0, y: 6 },
  ],
  poligonos: [{ id: "t", vertices: ["A", "B", "C"] }],
  segmentos: [
    { desde: "A", hasta: "B", rotulo: "8 cm" },
    { desde: "A", hasta: "C", rotulo: "6 cm" },
  ],
  angulos: [{ vertice: "A", desde: "B", hasta: "C", marca: "recto" }],
  descripcion: "Triángulo rectángulo ABC con catetos de 8 cm y 6 cm, datos de prueba.",
};

const con = (cambios: Record<string, unknown>) => validarDatosBancoAdvance(banco(item({ figura: { ...TRIANGULO, ...cambios } })));
const soloFigura = (errores: string[]) => errores.filter((e) => e.startsWith("items[0].figura"));
const valida = (cambios: Record<string, unknown> = {}) => assert.deepEqual(con(cambios), []);

describe("lienzo-geometrico: forma, regla (28)", () => {
  it("el triángulo base pasa", () => valida());

  it("ventana invertida, clave sobrante, vocabularios fuera y radio no positivo fallan", () => {
    const errores = soloFigura(
      con({
        ventana: { xMin: 5, xMax: 1, yMin: 0, yMax: 7 },
        extra: 1,
        puntos: [{ nombre: "A", x: 0, y: 0, ubicacion: "norte" }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: 0, y: 6 }],
        segmentos: [{ desde: "A", hasta: "B", trazo: "discontinuo", igualdad: 4 }],
        circunferencias: [{ centro: "A", radio: 0 }],
      }),
    );
    assert.deepEqual(errores, [
      'items[0].figura: clave "extra" no admitida por el schema',
      "items[0].figura.ventana: xMin (5) debe ser menor que xMax (1)",
      "items[0].figura.puntos[0].ubicacion: debe ser uno de: n, ne, e, se, s, so, o, no",
      "items[0].figura.segmentos[0].trazo: debe ser uno de: continuo, punteado",
      "items[0].figura.segmentos[0].igualdad: debe ser uno de: 1, 2, 3",
      "items[0].figura.circunferencias[0].radio: debe ser un número mayor que 0",
    ]);
  });

  it("markdown o LaTeX en un rótulo fallan; Unicode pasa", () => {
    assert.deepEqual(soloFigura(con({ segmentos: [{ desde: "A", hasta: "B", rotulo: "$8$ cm" }] })), [
      'items[0].figura.segmentos[0].rotulo: "$8$ cm" va en texto plano con Unicode (√, π, ², °), sin markdown ni LaTeX',
    ]);
    valida({ segmentos: [{ desde: "A", hasta: "B", rotulo: "8 cm" }, { desde: "B", hasta: "C", rotulo: "10 cm" }] });
  });

  it("un arco de vuelta completa y aEscala true fallan", () => {
    const errores = soloFigura(con({ aEscala: true, arcos: [{ clase: "arco", centro: "A", radio: 1, desde: 0, hasta: 360 }] }));
    assert.deepEqual(errores, [
      "items[0].figura.arcos[0]: desde (0) y hasta (360) dan una vuelta completa; para eso va una circunferencia",
      "items[0].figura.aEscala: solo se declara para apagarla (false); a escala es el valor por defecto",
    ]);
  });
});

describe("lienzo-geometrico: nombres únicos y referencias, regla (29)", () => {
  it("nombre repetido, referencia a un punto que no existe, segmento degenerado y polígono de dos vértices fallan", () => {
    const errores = soloFigura(
      con({
        puntos: [...TRIANGULO.puntos, { nombre: "A", x: 1, y: 1 }],
        segmentos: [{ desde: "A", hasta: "Z" }, { desde: "B", hasta: "B" }],
        poligonos: [{ vertices: ["A", "B", "A"] }],
      }),
    );
    assert.deepEqual(errores, [
      'items[0].figura.puntos[3].nombre: "A" repetido',
      'items[0].figura.segmentos[0].hasta: "Z" no es un punto de la figura',
      'items[0].figura.segmentos[1]: une "B" consigo mismo',
      "items[0].figura.poligonos[0].vertices: un polígono tiene al menos 3 vértices distintos",
    ]);
  });

  it("ids repetidos entre formas fallan; ids distintos pasan", () => {
    const errores = soloFigura(con({ circunferencias: [{ id: "t", centro: "A", radio: 0.5 }] }));
    assert.deepEqual(errores, ['items[0].figura.circunferencias[0].id: "t" repetido (ya en poligonos[0])']);
    valida({ circunferencias: [{ id: "c", centro: "A", radio: 0.5 }] });
  });
});

describe("lienzo-geometrico: todo dentro de la ventana, regla (30)", () => {
  it("un punto, una circunferencia y un texto fuera fallan nombrados", () => {
    const errores = soloFigura(
      con({ puntos: [...TRIANGULO.puntos, { nombre: "D", x: 10, y: 0, oculto: true }], circunferencias: [{ centro: "B", radio: 2 }], textos: [{ texto: "R", x: 3, y: 8 }] }),
    );
    assert.deepEqual(errores, [
      "items[0].figura: el punto D (10, 0) queda fuera de la ventana",
      "items[0].figura: circunferencias[0] (centro B, radio 2) queda fuera de la ventana",
      "items[0].figura: el texto «R» (3, 8) queda fuera de la ventana",
    ]);
  });

  it("lo mismo dentro de la ventana pasa", () => valida({ circunferencias: [{ centro: "B", radio: 0.8 }], textos: [{ texto: "R", x: 2, y: 2 }] }));
});

describe("lienzo-geometrico: a escala, regla (31)", () => {
  it("un rótulo que no calza falla y nombra rótulo, pedido y dibujado", () => {
    assert.deepEqual(soloFigura(con({ segmentos: [{ desde: "A", hasta: "B", rotulo: "9 cm" }] })), [
      'items[0].figura.segmentos[0] AB: el rótulo "9 cm" pide 9 y el dibujo mide 8 (más de 1 %); corrige las coordenadas o declara aEscala false',
    ]);
  });

  it("con aEscala false el mismo rótulo pasa", () => valida({ aEscala: false, segmentos: [{ desde: "A", hasta: "B", rotulo: "9 cm" }] }));

  it("grados que no calzan y marcas de igualdad sobre segmentos distintos fallan", () => {
    const errores = soloFigura(
      con({
        angulos: [{ vertice: "B", desde: "A", hasta: "C", marca: "arco", rotulo: "45°" }],
        segmentos: [{ desde: "A", hasta: "B", igualdad: 1 }, { desde: "A", hasta: "C", igualdad: 1 }],
      }),
    );
    assert.equal(errores.length, 2);
    assert.match(errores[0], /^items\[0\]\.figura\.angulos\[0\] en B: el rótulo "45°" pide 45° y el dibujo mide 36\.87°/);
    assert.match(errores[1], /llevan la misma marca de igualdad y miden de 6 a 8/);
  });

  it("un rótulo con letras no se verifica", () => valida({ segmentos: [{ desde: "A", hasta: "B", rotulo: "a" }] }));
});

describe("lienzo-geometrico: marcas que valen siempre, regla (32)", () => {
  it("una marca de ángulo recto en un ángulo agudo falla aunque aEscala sea false", () => {
    assert.deepEqual(soloFigura(con({ aEscala: false, angulos: [{ vertice: "B", desde: "A", hasta: "C", marca: "recto" }] })), [
      "items[0].figura.angulos[0] en B: la marca de ángulo recto va en un ángulo de 36.87°; solo va donde el ángulo mide 90° ± 0,5°, a escala o no",
    ]);
  });

  it("marcas de paralelismo sobre segmentos que no son paralelos fallan; sobre paralelos pasan", () => {
    const errores = soloFigura(con({ segmentos: [{ desde: "A", hasta: "B", paralelismo: 1 }, { desde: "A", hasta: "C", paralelismo: 1 }] }));
    assert.deepEqual(errores, ["items[0].figura: segmentos[0] AB y segmentos[1] AC llevan la misma marca de paralelismo y se desvían 90° (más de 0,5°)"]);
    valida({
      puntos: [...TRIANGULO.puntos, { nombre: "D", x: 8, y: 6, oculto: true }],
      segmentos: [{ desde: "A", hasta: "B", paralelismo: 2 }, { desde: "C", hasta: "D", paralelismo: 2, trazo: "punteado" }],
    });
  });
});

describe("lienzo-geometrico: rótulos que no chocan, regla (33)", () => {
  it("dos puntos casi encima fallan nombrando los rótulos", () => {
    const errores = soloFigura(con({ puntos: [...TRIANGULO.puntos, { nombre: "D", x: 0.15, y: -0.1 }] }));
    assert.ok(errores.includes("items[0].figura: los rótulos «A» y «D» se pisan (enunciado, letra de 12 px); mueve uno con \"ubicacion\" o \"lado\", o amplía la ventana"), errores.join("\n"));
  });

  it("un rótulo que se sale del lienzo falla; con aire en la ventana pasa", () => {
    assert.ok(soloFigura(con({ ventana: { xMin: 0, xMax: 9, yMin: -1, yMax: 7 } })).includes("items[0].figura: el rótulo «6 cm» se sale del lienzo (enunciado); amplía la ventana hacia ese lado"));
    valida();
  });

  it("un rótulo que tapa un vértice falla nombrando el vértice; sobre un centro oculto que no se dibuja, no", () => {
    valida({ puntos: [...TRIANGULO.puntos, { nombre: "O", x: 3, y: 2, oculto: true }], circunferencias: [{ centro: "O", radio: 1 }], textos: [{ texto: "R", x: 3, y: 2 }] });
    const puntos = [...TRIANGULO.puntos, { nombre: "D", x: 4, y: -0.35, oculto: true }];
    const errores = soloFigura(con({ puntos, segmentos: [...TRIANGULO.segmentos, { desde: "C", hasta: "D", trazo: "punteado" }] }));
    assert.ok(errores.includes("items[0].figura: el rótulo «8 cm» tapa el vértice D (enunciado); muévelo con \"ubicacion\" o \"lado\""), errores.join("\n"));
  });
});

describe("lienzo-geometrico: alto renderizado, regla (34)", () => {
  it("una ventana alta y angosta pasa de 320 px y falla; la misma, más ancha, pasa", () => {
    const alta = { ventana: { xMin: -1, xMax: 9, yMin: -1, yMax: 11 } };
    assert.deepEqual(soloFigura(con(alta)), ["items[0].figura: la figura mide 422 px de alto en el carril de 358 px (enunciado) y el tope es 320; ensancha la ventana en x o recórtala en y"]);
    valida({ ventana: { xMin: -1, xMax: 15, yMin: -1, yMax: 11 } });
  });
});

describe("lienzo-geometrico: topes, regla (35)", () => {
  const muchos = (n: number) => Array.from({ length: n }, (_, i) => ({ nombre: `P${i}`, x: i % 5, y: Math.floor(i / 5), oculto: true }));
  it("25 puntos fallan en el enunciado; 24 pasan", () => {
    assert.deepEqual(soloFigura(con({ puntos: [...TRIANGULO.puntos, ...muchos(22)] })), ["items[0].figura: 25 puntos y el tope en enunciado es 24"]);
    valida({ puntos: [...TRIANGULO.puntos, ...muchos(21)] });
  });
});

describe("lienzo-geometrico: regiones, regla (36)", () => {
  it("un id que no existe y un arco abierto como forma fallan; un sector pasa", () => {
    const errores = soloFigura(con({ arcos: [{ id: "a", clase: "arco", centro: "A", radio: 1, desde: 0, hasta: 90 }], regiones: [{ formas: ["t", "zz"], huecos: ["a"] }] }));
    assert.deepEqual(errores, [
      'items[0].figura.regiones[0].formas[1]: "zz" no es el id de un polígono, una circunferencia o un sector de la figura',
      'items[0].figura.regiones[0].huecos[0]: "a" es un arco abierto; una región se arma con polígonos, circunferencias o sectores',
    ]);
    valida({ arcos: [{ id: "s", clase: "sector", centro: "A", radio: 1, desde: 0, hasta: 90 }], regiones: [{ formas: ["t"], huecos: ["s"], estilo: "punteado" }] });
  });
});

describe("lienzo-geometrico: descripcion, regla (37)", () => {
  it("corta falla; de 30 o más pasa", () => {
    assert.deepEqual(soloFigura(con({ descripcion: "Un triángulo." })), ["items[0].figura.descripcion: demasiado corta (<30 caracteres)"]);
    valida({ descripcion: "Triángulo rectángulo de prueba, catetos de 8 y 6." });
  });
});

describe("lienzo-geometrico: cuadrícula legible, regla (38)", () => {
  it("un paso que deja celdas de menos de 8 px falla; uno de 1 pasa", () => {
    assert.deepEqual(soloFigura(con({ cuadricula: { paso: 0.2 } })), ["items[0].figura.cuadricula: celdas de 6.36 px en el carril de 358 px (enunciado); el mínimo es 8, agranda el paso"]);
    assert.deepEqual(soloFigura(con({ cuadricula: { paso: 0 } })), ["items[0].figura.cuadricula.paso: debe ser mayor que 0"]);
    valida({ cuadricula: { paso: 1 } });
  });
});

describe("lienzo-geometrico: cota con rótulo, regla (39)", () => {
  it("una cota sin rótulo falla; con rótulo pasa", () => {
    assert.deepEqual(soloFigura(con({ segmentos: [{ desde: "A", hasta: "B", cota: true }] })), ["items[0].figura.segmentos[0]: una cota lleva rótulo (la medida que marca la llave)"]);
    valida({ segmentos: [{ desde: "A", hasta: "B", cota: true, rotulo: "8 cm" }, { desde: "A", hasta: "C", rotulo: "6 cm" }] });
  });
});

describe("lienzo-geometrico en alternativas: carril y topes de la alternativa (reglas 25, 26 y 35)", () => {
  const figuraAlt = (dx: number) => ({ ...TRIANGULO, puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: dx, y: 6 }], segmentos: [], angulos: [], descripcion: `Triángulo de prueba con el vértice C corrido ${dx}.` });
  it("cuatro lienzos con descripcion y texto vacío pasan", () => {
    const alts = [0, 2, 4, 6].map((dx) => ({ texto: "", figura: figuraAlt(dx) }));
    assert.deepEqual(validarDatosBancoAdvance(banco(item({}, alts))), []);
  });

  it("13 puntos pasan en el enunciado y fallan en una alternativa", () => {
    const trece = { ...figuraAlt(0), puntos: [...figuraAlt(0).puntos, ...Array.from({ length: 10 }, (_, i) => ({ nombre: `Q${i}`, x: i % 5, y: 1 + Math.floor(i / 5), oculto: true }))] };
    assert.deepEqual(validarDatosBancoAdvance(banco(item({ figura: trece }))), []);
    const alts = [trece, figuraAlt(2), figuraAlt(4), figuraAlt(6)].map((figura) => ({ texto: "", figura }));
    assert.deepEqual(validarDatosBancoAdvance(banco(item({}, alts))), ["items[0].A.figura: 13 puntos y el tope en alternativa es 12"]);
  });
});

describe("figuraSolucion: cualquier tipo, medida en la ubicación solución, regla (40)", () => {
  const conSolucion = (figuraSolucion: unknown) => validarDatosBancoAdvance(banco(item({ figuraSolucion })));
  it("un lienzo con la altura trazada y un diagrama de cajón pasan", () => {
    const conAltura = { ...TRIANGULO, puntos: [...TRIANGULO.puntos, { nombre: "H", x: 2.88, y: 3.84, oculto: true }], segmentos: [...TRIANGULO.segmentos, { desde: "A", hasta: "H", trazo: "punteado", rotulo: "h" }] };
    assert.deepEqual(conSolucion(conAltura), []);
    const cajon = { tipo: "diagrama-cajon", orientacion: "horizontal", eje: { min: 0, max: 40, paso: 5 }, cajas: [{ minimo: 4, q1: 10, mediana: 15, q3: 24, maximo: 35 }], descripcion: "Diagrama de cajón de prueba para la solución." };
    assert.deepEqual(conSolucion(cajon), []);
  });

  it("se valida con las reglas de su tipo, en el carril de la solución, y el error nombra el campo", () => {
    assert.deepEqual(conSolucion({ tipo: "pictograma" }).map((e) => e.split(":")[0]), ["items[0].figuraSolucion.tipo"]);
    const errores = conSolucion({ ...TRIANGULO, puntos: [...TRIANGULO.puntos, { nombre: "D", x: 0.15, y: -0.1 }] });
    assert.ok(errores.some((e) => e.startsWith("items[0].figuraSolucion: los rótulos «A» y «D» se pisan (solucion, letra de 12 px)")), errores.join("\n"));
  });

  it("sin figuraSolucion el ítem pasa igual y la clave sobrante sigue fallando", () => {
    assert.deepEqual(validarDatosBancoAdvance(banco(item())), []);
    assert.deepEqual(validarDatosBancoAdvance(banco(item({ figuraSolucionn: TRIANGULO }))), ['items[0]: clave "figuraSolucionn" no admitida por el schema']);
  });
});
