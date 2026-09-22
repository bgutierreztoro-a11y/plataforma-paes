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

/* Regla (10): figura declarativa. Se prueba con un ítem que lleva la figura
   completa y válida, variando un solo campo por caso. */
const FIGURA_VALIDA = {
  plano: { xMin: -4, xMax: 6, yMin: -3, yMax: 5 },
  descripcion: "Triángulo ABC y el vector v que va de (1, 1) a (4, 3), datos del ítem.",
  elementos: [
    { tipo: "punto", nombre: "A", x: -3, y: -1 },
    { tipo: "punto", nombre: "B", x: 0, y: -2 },
    { tipo: "punto", nombre: "C", x: -1, y: 2 },
    { tipo: "poligono", vertices: ["A", "B", "C"] },
    { tipo: "vector", etiqueta: "v", desde: [1, 1], hasta: [4, 3] },
    { tipo: "centro", etiqueta: "O", x: 0, y: 0 },
    { tipo: "recta", etiqueta: "L", forma: "x=c", c: 1 },
  ],
};

function conFigura(figura: unknown) {
  /* Por variable y no como literal: `item` no declara figura, y el chequeo de
     propiedades sobrantes solo corre sobre literales. */
  const conLaFigura = { ...item(1, TRES), figura };
  return banco(conLaFigura);
}
/** Errores de la figura del primer ítem. */
const deLaFigura = (errores: string[]) => errores.filter((e) => e.startsWith("items[0].figura"));

describe("figura: regla (10)", () => {
  it("una figura completa y válida pasa, y sin figura también", () => {
    assert.deepEqual(validar(conFigura(FIGURA_VALIDA)), []);
    assert.deepEqual(validar(banco(item(1, TRES))), []);
  });

  it("vértice de poligono que no existe como punto falla nombrando el vértice", () => {
    const figura = {
      ...FIGURA_VALIDA,
      elementos: FIGURA_VALIDA.elementos.map((el) =>
        el.tipo === "poligono" ? { ...el, vertices: ["A", "B", "Z"] } : el,
      ),
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]\.figura\.elementos\[3\]: vértice "Z" no existe como punto/);
  });

  it("punto, vector y centro fuera del plano fallan, cada uno con sus coordenadas", () => {
    const figura = {
      ...FIGURA_VALIDA,
      elementos: [
        { tipo: "punto", nombre: "A", x: 7, y: 0 },
        { tipo: "vector", etiqueta: "v", desde: [0, 0], hasta: [2, 9] },
        { tipo: "centro", etiqueta: "O", x: -5, y: 0 },
      ],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.equal(errores.length, 3);
    assert.match(errores[0], /elementos\[0\]: punto "A" \(7, 0\) fuera del plano/);
    assert.match(errores[1], /elementos\[1\]: vector "v" con hasta \(2, 9\) fuera del plano/);
    assert.match(errores[2], /elementos\[2\]: centro "O" \(-5, 0\) fuera del plano/);
  });

  it("nombre de punto repetido falla en el segundo punto", () => {
    const figura = {
      ...FIGURA_VALIDA,
      elementos: [
        { tipo: "punto", nombre: "A", x: 0, y: 0 },
        { tipo: "punto", nombre: "A", x: 1, y: 1 },
      ],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]\.figura\.elementos\[1\]: nombre de punto "A" repetido/);
  });

  it("figura sin descripcion falla, y con descripcion corta también", () => {
    const errores = deLaFigura(validar(conFigura({ ...FIGURA_VALIDA, descripcion: undefined })));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]\.figura\.descripcion: falta/);

    const corta = deLaFigura(validar(conFigura({ ...FIGURA_VALIDA, descripcion: "Un triángulo." })));
    assert.equal(corta.length, 1);
    assert.match(corta[0], /descripcion: demasiado corta \(<30 caracteres\)/);
  });

  it("plano con xMin >= xMax o yMin >= yMax falla", () => {
    const errores = deLaFigura(validar(conFigura({ ...FIGURA_VALIDA, plano: { xMin: 3, xMax: 3, yMin: 2, yMax: -1 } })));
    assert.deepEqual(errores, [
      "items[0].figura.plano: xMin (3) debe ser menor que xMax (3)",
      "items[0].figura.plano: yMin (2) debe ser menor que yMax (-1)",
    ]);
  });

  it("recta x=c sin c, y=x con c, y tipo fuera del vocabulario fallan", () => {
    const figura = {
      ...FIGURA_VALIDA,
      elementos: [
        { tipo: "recta", etiqueta: "L", forma: "x=c" },
        { tipo: "recta", etiqueta: "M", forma: "y=x", c: 2 },
        { tipo: "circulo", etiqueta: "K" },
      ],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.equal(errores.length, 3);
    assert.match(errores[0], /elementos\[0\]: con forma x=c es obligatorio c entero/);
    assert.match(errores[1], /elementos\[1\]: con forma y=x no va c/);
    assert.match(errores[2], /elementos\[2\]: tipo debe ser uno de: punto, poligono, recta, vector, centro/);
  });
});

/* Regla (11): figura plano-funcion. Se distingue del plano de isometrías por
   `tipo`. Una figura completa y válida, variando un campo por caso. */
const DESCRIPCION = "Parábola que abre hacia arriba con dos ceros y una recta que la corta, datos del ítem.";
const PLANO_FUNCION_VALIDO = {
  tipo: "plano-funcion",
  ventana: { xMin: -2, xMax: 6, yMin: -5, yMax: 10 },
  curvas: [
    { clase: "parabola", a: 1, b: -4, c: 3, rotulo: "f" },
    { clase: "recta", m: 1, b: -1, rotulo: "g", trazo: "segmentado" },
  ],
  puntos: [
    { x: 1, y: 0, rotulo: "A" },
    { x: 3, y: 0, rotulo: "B", estilo: "hueco", mostrarCoordenadas: true },
  ],
  segmentos: [{ desde: { x: 2, y: 0 }, hasta: { x: 2, y: -1 }, rotulo: "h" }],
  ejeSimetria: { x: 2, rotulo: "x = 2" },
  regiones: [
    { clase: "entre-curva-y-eje", curva: 0, desde: 1, hasta: 3 },
    { clase: "franja-x", desde: 1, hasta: 3 },
  ],
  etiquetaEjeX: "tiempo (s)",
  etiquetaEjeY: "altura (m)",
  descripcion: DESCRIPCION,
};

describe("figura plano-funcion: regla (11)", () => {
  it("una figura completa pasa, y también sin ventana ni opcionales", () => {
    assert.deepEqual(validar(conFigura(PLANO_FUNCION_VALIDO)), []);
    const minima = { tipo: "plano-funcion", curvas: [{ clase: "parabola", a: -0.5, b: 0, c: 4 }], descripcion: DESCRIPCION };
    assert.deepEqual(validar(conFigura(minima)), []);
  });

  it("tipo desconocido falla nombrando los ocho tipos y la ausencia", () => {
    const errores = deLaFigura(validar(conFigura({ tipo: "pictograma", descripcion: DESCRIPCION })));
    assert.deepEqual(errores, [
      'items[0].figura.tipo: debe ser uno de: plano-funcion, tabla-valores, tabla-datos, grafico-barras, histograma, grafico-lineas, grafico-circular, diagrama-cajon, o ausente para el plano de isometrías (recibido: "pictograma")',
    ]);
  });

  it("a = 0 en una parábola falla", () => {
    const figura = { ...PLANO_FUNCION_VALIDO, curvas: [{ clase: "parabola", a: 0, b: 1, c: 1 }], regiones: undefined };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, ["items[0].figura.curvas[0]: a debe ser distinto de 0 (con a = 0 no es una parábola)"]);
  });

  it("recta con m, b y por a la vez falla; por con x iguales falla", () => {
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      regiones: undefined,
      curvas: [
        { clase: "recta", m: 1, b: 0, por: [{ x: 0, y: 0 }, { x: 1, y: 1 }], rotulo: "g" },
        { clase: "recta", por: [{ x: 2, y: 0 }, { x: 2, y: 5 }], rotulo: "k" },
      ],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      "items[0].figura.curvas[0]: recta con m y b o con por, nunca ambas",
      "items[0].figura.curvas[1].por: los dos puntos deben tener x distinto (recta vertical: usa clase recta-vertical)",
    ]);
  });

  it("más de 3 curvas, 6 puntos, 4 segmentos o 2 regiones falla", () => {
    const curva = (i: number) => ({ clase: "recta", m: i, b: 0, rotulo: `r${i}` });
    const punto = (i: number) => ({ x: i * 0.5, y: 0 });
    const segmento = (i: number) => ({ desde: { x: 0, y: i }, hasta: { x: 1, y: i } });
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      curvas: [1, 2, 3, 4].map(curva),
      puntos: [1, 2, 3, 4, 5, 6, 7].map(punto),
      segmentos: [1, 2, 3, 4, 5].map(segmento),
      regiones: [1, 2, 3].map(() => ({ clase: "franja-x", desde: 0, hasta: 1 })),
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      "items[0].figura.curvas: se esperan entre 1 y 3 curvas (recibido: 4)",
      "items[0].figura.puntos: se esperan hasta 6 puntos",
      "items[0].figura.segmentos: se esperan hasta 4 segmentos",
      "items[0].figura.regiones: se esperan hasta 2 regiones",
    ]);
  });

  it("rótulo repetido entre una curva y un punto falla en el segundo", () => {
    const figura = { ...PLANO_FUNCION_VALIDO, puntos: [{ x: 1, y: 0, rotulo: "f" }] };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, ['items[0].figura.puntos[0].rotulo: "f" repetido dentro de la figura (ya en items[0].figura.curvas[0])']);
  });

  it("dos curvas sin rótulo fallan una por una", () => {
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      regiones: undefined,
      curvas: [
        { clase: "parabola", a: 1, b: -4, c: 3 },
        { clase: "recta", m: 1, b: -1 },
      ],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      "items[0].figura.curvas[0]: con 2 o más curvas cada una lleva rotulo (no se distinguen solo por color)",
      "items[0].figura.curvas[1]: con 2 o más curvas cada una lleva rotulo (no se distinguen solo por color)",
    ]);
  });

  it("desde >= hasta falla en curva y en región; ventana degenerada falla", () => {
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      ventana: { xMin: 2, xMax: 2, yMin: 3, yMax: 1 },
      curvas: [{ clase: "parabola", a: 1, b: 0, c: 0, desde: 3, hasta: 1 }],
      puntos: undefined,
      segmentos: undefined,
      ejeSimetria: undefined,
      regiones: [{ clase: "franja-x", desde: 5, hasta: 5 }],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      "items[0].figura.ventana: xMin (2) debe ser menor que xMax (2)",
      "items[0].figura.ventana: yMin (3) debe ser menor que yMax (1)",
      "items[0].figura.curvas[0]: desde (3) debe ser menor que hasta (1)",
      "items[0].figura.regiones[0]: desde (5) debe ser menor que hasta (5)",
    ]);
  });

  it("con ventana declarada, punto, extremo de segmento, extremo de arco, vértice y eje fuera fallan", () => {
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      ventana: { xMin: 0, xMax: 4, yMin: 0, yMax: 4 },
      curvas: [
        { clase: "parabola", a: 1, b: -4, c: 3, desde: -1, hasta: 3, rotulo: "f" },
        { clase: "recta-vertical", x: 9, rotulo: "v" },
      ],
      puntos: [{ x: 5, y: 1 }],
      segmentos: [{ desde: { x: 1, y: 1 }, hasta: { x: 1, y: 7 } }],
      ejeSimetria: { x: -3 },
      regiones: undefined,
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      "items[0].figura.curvas[0]: extremo desde (-1, 8) fuera de la ventana",
      "items[0].figura.curvas[0]: vértice (2, -1) fuera de la ventana",
      "items[0].figura.curvas[1]: recta-vertical x = 9 fuera de la ventana",
      "items[0].figura.puntos[0]: punto (5, 1) fuera de la ventana",
      "items[0].figura.segmentos[0]: extremo hasta (1, 7) fuera de la ventana",
      "items[0].figura.ejeSimetria: x = -3 fuera de la ventana",
    ]);
  });

  it("sin ventana no se comprueba contención: la automática los contiene por construcción", () => {
    const figura = {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 1, b: 0, c: -40 }],
      puntos: [{ x: 100, y: 9960 }],
      descripcion: DESCRIPCION,
    };
    assert.deepEqual(validar(conFigura(figura)), []);
  });

  it("región que apunta a una curva inexistente o a una recta-vertical falla", () => {
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      curvas: [
        { clase: "parabola", a: 1, b: -4, c: 3, rotulo: "f" },
        { clase: "recta-vertical", x: 2, rotulo: "v" },
      ],
      regiones: [
        { clase: "entre-curva-y-eje", curva: 2, desde: 1, hasta: 3 },
        { clase: "entre-curva-y-eje", curva: 1, desde: 1, hasta: 3 },
      ],
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      "items[0].figura.regiones[0].curva: debe ser el índice de una curva existente (0 a 1)",
      "items[0].figura.regiones[1].curva: una recta-vertical no encierra región con el eje x",
    ]);
  });

  it("estilo, trazo y clase fuera del vocabulario, y clave sobrante, fallan", () => {
    const figura = {
      ...PLANO_FUNCION_VALIDO,
      regiones: undefined,
      curvas: [{ clase: "parabola", a: 1, b: 0, c: 0, trazo: "grueso", color: "rojo" }],
      puntos: [{ x: 0, y: 0, estilo: "cruz" }],
      segmentos: undefined,
    };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      'items[0].figura.curvas[0]: clave "color" no admitida por el schema',
      "items[0].figura.curvas[0].trazo: debe ser uno de: solido, segmentado, punteado",
      "items[0].figura.puntos[0].estilo: debe ser uno de: relleno, hueco",
    ]);
    const sinClase = deLaFigura(validar(conFigura({ ...PLANO_FUNCION_VALIDO, regiones: undefined, curvas: [{ clase: "circulo" }] })));
    assert.deepEqual(sinClase, ['items[0].figura.curvas[0]: clase debe ser una de: parabola, recta, recta-vertical (recibido: "circulo")']);
  });

  it("descripcion ausente o corta falla", () => {
    const errores = deLaFigura(validar(conFigura({ ...PLANO_FUNCION_VALIDO, descripcion: undefined })));
    assert.match(errores[0], /^items\[0\]\.figura\.descripcion: falta/);
    const corta = deLaFigura(validar(conFigura({ ...PLANO_FUNCION_VALIDO, descripcion: "Una parábola." })));
    assert.deepEqual(corta, ["items[0].figura.descripcion: demasiado corta (<30 caracteres)"]);
  });
});

/* Regla (12): figura tabla-valores. */
const TABLA_VALIDA = {
  tipo: "tabla-valores",
  encabezados: ["x", "f(x)"],
  filas: [
    [-1, 8],
    [0, 3],
    [1, 0],
    [2, -1],
  ],
  descripcion: "Tabla de valores de la función f para x entre -1 y 2, datos del ítem.",
};

describe("figura tabla-valores: regla (12)", () => {
  it("una tabla válida pasa", () => {
    assert.deepEqual(validar(conFigura(TABLA_VALIDA)), []);
  });

  it("fila con largo distinto a encabezados falla nombrando ambos largos", () => {
    const errores = deLaFigura(validar(conFigura({ ...TABLA_VALIDA, filas: [[0, 3], [1]] })));
    assert.deepEqual(errores, ["items[0].figura.filas[1]: tiene 1 celdas y encabezados tiene 2"]);
  });

  it("más de 6 columnas o 8 filas falla", () => {
    const encabezados = ["a", "b", "c", "d", "e", "f", "g"];
    const filas = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => encabezados.map(() => 1));
    const errores = deLaFigura(validar(conFigura({ ...TABLA_VALIDA, encabezados, filas })));
    assert.deepEqual(errores, [
      "items[0].figura.encabezados: se esperan entre 1 y 6 encabezados",
      "items[0].figura.filas: se esperan entre 1 y 8 filas",
    ]);
  });

  it("encabezado vacío o repetido y celda no textual ni numérica fallan", () => {
    const errores = deLaFigura(validar(conFigura({ ...TABLA_VALIDA, encabezados: ["x", "x", ""], filas: [[1, 2, null]] })));
    assert.deepEqual(errores, [
      'items[0].figura.encabezados[1]: "x" repetido',
      "items[0].figura.encabezados[2]: texto no vacío",
      "items[0].figura.filas[0][2]: cada celda es texto o número finito",
    ]);
  });

  it("clave sobrante y descripcion corta fallan", () => {
    const errores = deLaFigura(validar(conFigura({ ...TABLA_VALIDA, titulo: "Tabla", descripcion: "Tabla." })));
    assert.deepEqual(errores, [
      'items[0].figura: clave "titulo" no admitida por el schema',
      "items[0].figura.descripcion: demasiado corta (<30 caracteres)",
    ]);
  });
});

/* Reglas (13) a (17): figuras de datos. Un caso válido por tipo y un caso por
   cada regla rota, con datos abstractos (categorías A, B, C). */
const EJE_X = { etiqueta: "Categoría" };
const EJE_Y = { etiqueta: "Frecuencia" };

const TABLA_DATOS_VALIDA = {
  tipo: "tabla-datos",
  titulo: "Frecuencias",
  columnas: ["Intervalo", "f", "F"],
  filas: [
    ["[0, 10[", 4, 4],
    ["[10, 20[", "?", 11],
    ["[20, 30[", 9, 20],
  ],
  filaTotal: ["Total", 20, ""],
};

describe("figura tabla-datos: regla (13)", () => {
  it("una tabla válida pasa, con y sin titulo y filaTotal", () => {
    assert.deepEqual(validar(conFigura(TABLA_DATOS_VALIDA)), []);
    assert.deepEqual(validar(conFigura({ tipo: "tabla-datos", columnas: ["A", "B"], filas: [[1, 2]] })), []);
  });

  it("fila o filaTotal con largo distinto a columnas falla nombrando ambos largos", () => {
    const errores = deLaFigura(validar(conFigura({ ...TABLA_DATOS_VALIDA, filas: [["a", 1]], filaTotal: ["Total", 1, 2, 3] })));
    assert.deepEqual(errores, [
      "items[0].figura.filas[0]: tiene 2 celdas y columnas tiene 3",
      "items[0].figura.filaTotal: tiene 4 celdas y columnas tiene 3",
    ]);
  });

  it("columna vacía, celda no textual ni numérica, titulo vacío y clave sobrante fallan", () => {
    const figura = { ...TABLA_DATOS_VALIDA, titulo: " ", columnas: ["", "f", "F"], filas: [[null, 1, 2]], filaTotal: undefined, descripcion: "x" };
    const errores = deLaFigura(validar(conFigura(figura)));
    assert.deepEqual(errores, [
      'items[0].figura: clave "descripcion" no admitida por el schema',
      "items[0].figura.titulo: si está, es texto no vacío",
      "items[0].figura.columnas[0]: texto no vacío",
      "items[0].figura.filas[0][0]: cada celda es texto o número finito",
    ]);
  });

  it("menos de 2 o más de 6 columnas, y más de 10 filas, fallan", () => {
    const una = deLaFigura(validar(conFigura({ tipo: "tabla-datos", columnas: ["A"], filas: [[1]] })));
    assert.deepEqual(una, ["items[0].figura.columnas: se esperan entre 2 y 6 columnas"]);
    const columnas = ["a", "b", "c", "d", "e", "f", "g"];
    const filas = Array.from({ length: 11 }, () => columnas.map(() => 1));
    const muchas = deLaFigura(validar(conFigura({ tipo: "tabla-datos", columnas, filas })));
    assert.deepEqual(muchas, ["items[0].figura.columnas: se esperan entre 2 y 6 columnas", "items[0].figura.filas: se esperan entre 1 y 10 filas"]);
  });
});

const BARRAS_VALIDO = {
  tipo: "grafico-barras",
  categorias: ["A", "B", "C"],
  series: [
    { nombre: "Serie 1", valores: [4, 7, 2] },
    { nombre: "Serie 2", valores: [3, 5, 6] },
  ],
  ejeX: EJE_X,
  ejeY: { etiqueta: "Frecuencia", min: 0, max: 8, paso: 2 },
  mostrarValores: true,
};

describe("figura grafico-barras: regla (14)", () => {
  it("un gráfico válido pasa, con una serie sin nombre también", () => {
    assert.deepEqual(validar(conFigura(BARRAS_VALIDO)), []);
    assert.deepEqual(validar(conFigura({ tipo: "grafico-barras", categorias: ["A", "B"], series: [{ valores: [1, 2] }], ejeX: EJE_X, ejeY: EJE_Y })), []);
  });

  it("serie con largo distinto a categorias falla nombrando ambos largos", () => {
    const figura = { ...BARRAS_VALIDO, series: [{ nombre: "S", valores: [1, 2] }] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), ["items[0].figura.series[0].valores: tiene 2 valores y categorias tiene 3"]);
  });

  it("con 2 o más series, la que no tiene nombre falla; nombre repetido falla", () => {
    const sinNombre = { ...BARRAS_VALIDO, series: [{ nombre: "S", valores: [1, 2, 3] }, { valores: [1, 2, 3] }] };
    assert.deepEqual(deLaFigura(validar(conFigura(sinNombre))), ["items[0].figura.series[1]: con 2 o más series cada una lleva nombre (no se distinguen solo por color)"]);
    const repetido = { ...BARRAS_VALIDO, series: [{ nombre: "S", valores: [1, 2, 3] }, { nombre: "S", valores: [1, 2, 3] }] };
    assert.deepEqual(deLaFigura(validar(conFigura(repetido))), ['items[0].figura.series[1].nombre: "S" repetido (ya en items[0].figura.series[0])']);
  });

  it("más de 3 series o más de 8 categorías fallan", () => {
    const categorias = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const serie = (i: number) => ({ nombre: `S${i}`, valores: categorias.map(() => i) });
    const errores = deLaFigura(validar(conFigura({ ...BARRAS_VALIDO, categorias, series: [1, 2, 3, 4].map(serie) })));
    assert.deepEqual(errores, ["items[0].figura.categorias: se esperan entre 1 y 8 categorías", "items[0].figura.series: se esperan entre 1 y 3 series"]);
  });

  it("valor no finito, ejeY con min >= max o paso <= 0, y mostrarValores no booleano fallan", () => {
    const figura = { ...BARRAS_VALIDO, series: [{ nombre: "S", valores: [1, "2", 3] }], ejeY: { etiqueta: "y", min: 5, max: 5, paso: 0 }, mostrarValores: "sí" };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), [
      "items[0].figura.series[0].valores[1]: debe ser número finito",
      "items[0].figura.ejeY: min (5) debe ser menor que max (5)",
      "items[0].figura.ejeY.paso: debe ser mayor que 0 (recibido: 0)",
      "items[0].figura.mostrarValores: debe ser booleano",
    ]);
  });

  it("eje sin etiqueta o con clave sobrante falla", () => {
    const figura = { ...BARRAS_VALIDO, ejeX: { etiqueta: "" }, ejeY: { etiqueta: "y", titulo: "z" } };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), [
      "items[0].figura.ejeX.etiqueta: texto no vacío",
      'items[0].figura.ejeY: clave "titulo" no admitida por el schema',
    ]);
  });
});

const HISTOGRAMA_VALIDO = {
  tipo: "histograma",
  intervalos: [
    { desde: 0, hasta: 10 },
    { desde: 10, hasta: 20 },
    { desde: 20, hasta: 30 },
  ],
  frecuencias: [4, 0, 9],
  ejeX: { etiqueta: "Valor" },
  ejeY: EJE_Y,
  poligono: true,
};

describe("figura histograma: regla (15)", () => {
  it("un histograma válido pasa, y sin poligono también", () => {
    assert.deepEqual(validar(conFigura(HISTOGRAMA_VALIDO)), []);
    assert.deepEqual(validar(conFigura({ ...HISTOGRAMA_VALIDO, poligono: undefined })), []);
  });

  it("intervalos no contiguos fallan nombrando el hasta anterior", () => {
    const figura = { ...HISTOGRAMA_VALIDO, intervalos: [{ desde: 0, hasta: 10 }, { desde: 12, hasta: 20 }, { desde: 20, hasta: 30 }] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), [
      "items[0].figura.intervalos[1]: desde (12) debe ser igual al hasta del intervalo anterior (10); los intervalos son contiguos",
    ]);
  });

  it("intervalo no creciente falla", () => {
    const figura = { ...HISTOGRAMA_VALIDO, intervalos: [{ desde: 0, hasta: 10 }, { desde: 10, hasta: 10 }, { desde: 10, hasta: 30 }] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), ["items[0].figura.intervalos[1]: desde (10) debe ser menor que hasta (10)"]);
  });

  it("frecuencias con largo distinto a intervalos falla nombrando ambos largos", () => {
    const figura = { ...HISTOGRAMA_VALIDO, frecuencias: [4, 7] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), ["items[0].figura.frecuencias: tiene 2 valores e intervalos tiene 3"]);
  });

  it("frecuencia negativa o no finita falla", () => {
    const figura = { ...HISTOGRAMA_VALIDO, frecuencias: [4, -1, "9"] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), [
      "items[0].figura.frecuencias[1]: debe ser mayor o igual a 0 (recibido: -1)",
      "items[0].figura.frecuencias[2]: debe ser número finito",
    ]);
  });

  it("más de 10 intervalos, poligono no booleano y clave sobrante en un intervalo fallan", () => {
    const intervalos = Array.from({ length: 11 }, (_, i) => ({ desde: i, hasta: i + 1 }));
    const muchos = deLaFigura(validar(conFigura({ ...HISTOGRAMA_VALIDO, intervalos, frecuencias: intervalos.map(() => 1) })));
    assert.deepEqual(muchos, ["items[0].figura.intervalos: se esperan entre 1 y 10 intervalos"]);
    const figura = { ...HISTOGRAMA_VALIDO, intervalos: [{ desde: 0, hasta: 10, marca: 5 }], frecuencias: [1], poligono: 1 };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), [
      'items[0].figura.intervalos[0]: clave "marca" no admitida por el schema',
      "items[0].figura.poligono: debe ser booleano",
    ]);
  });
});

const LINEAS_VALIDO = {
  tipo: "grafico-lineas",
  categorias: ["10", "20", "30", "40"],
  series: [
    { nombre: "Serie 1", valores: [4, 11, 20, 20] },
    { nombre: "Serie 2", valores: [2, 6, 13, 20] },
  ],
  ejeX: { etiqueta: "Borde superior" },
  ejeY: { etiqueta: "Frecuencia acumulada" },
};

describe("figura grafico-lineas: regla (16)", () => {
  it("un gráfico válido pasa, con una serie sin nombre también", () => {
    assert.deepEqual(validar(conFigura(LINEAS_VALIDO)), []);
    assert.deepEqual(validar(conFigura({ ...LINEAS_VALIDO, series: [{ valores: [1, 2, 3, 4] }] })), []);
  });

  it("serie con largo distinto a categorias falla", () => {
    const figura = { ...LINEAS_VALIDO, series: [{ nombre: "S", valores: [1, 2, 3] }] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), ["items[0].figura.series[0].valores: tiene 3 valores y categorias tiene 4"]);
  });

  it("con 2 o más series, la que no tiene nombre falla", () => {
    const figura = { ...LINEAS_VALIDO, series: [{ nombre: "S", valores: [1, 2, 3, 4] }, { valores: [1, 2, 3, 4] }] };
    assert.deepEqual(deLaFigura(validar(conFigura(figura))), ["items[0].figura.series[1]: con 2 o más series cada una lleva nombre (no se distinguen solo por color)"]);
  });

  it("una sola categoría, más de 10 categorías y mostrarValores (solo de barras) fallan", () => {
    const una = deLaFigura(validar(conFigura({ ...LINEAS_VALIDO, categorias: ["A"], series: [{ valores: [1] }] })));
    assert.deepEqual(una, ["items[0].figura.categorias: se esperan entre 2 y 10 categorías"]);
    const categorias = Array.from({ length: 11 }, (_, i) => `${i}`);
    const muchas = deLaFigura(validar(conFigura({ ...LINEAS_VALIDO, categorias, series: [{ valores: categorias.map(() => 1) }], mostrarValores: true })));
    assert.deepEqual(muchas, [
      'items[0].figura: clave "mostrarValores" no admitida por el schema',
      "items[0].figura.categorias: se esperan entre 2 y 10 categorías",
    ]);
  });
});

const CIRCULAR_VALIDO = {
  tipo: "grafico-circular",
  sectores: [
    { etiqueta: "A", valor: 12 },
    { etiqueta: "B", valor: 6 },
    { etiqueta: "C", valor: 6 },
  ],
  modoEtiqueta: "porcentaje",
};

describe("figura grafico-circular: regla (17)", () => {
  it("un gráfico válido pasa en los cuatro modos", () => {
    for (const modoEtiqueta of ["porcentaje", "valor", "angulo", "ninguno"]) {
      assert.deepEqual(validar(conFigura({ ...CIRCULAR_VALIDO, modoEtiqueta })), [], modoEtiqueta);
    }
  });

  it("en modo porcentaje, un sector con más de 1 decimal falla nombrando el sector", () => {
    const sectores = [{ etiqueta: "A", valor: 1 }, { etiqueta: "B", valor: 1 }, { etiqueta: "C", valor: 1 }];
    const errores = deLaFigura(validar(conFigura({ ...CIRCULAR_VALIDO, sectores })));
    assert.deepEqual(errores, [
      'items[0].figura.sectores[0]: "A" da 33.3333% en modo porcentaje, y cada valor calculado tiene como máximo 1 decimal exacto',
      'items[0].figura.sectores[1]: "B" da 33.3333% en modo porcentaje, y cada valor calculado tiene como máximo 1 decimal exacto',
      'items[0].figura.sectores[2]: "C" da 33.3333% en modo porcentaje, y cada valor calculado tiene como máximo 1 decimal exacto',
    ]);
    /* 12,5 % es un decimal exacto: pasa. */
    assert.deepEqual(validar(conFigura({ ...CIRCULAR_VALIDO, sectores: [{ etiqueta: "A", valor: 1 }, { etiqueta: "B", valor: 7 }] })), []);
  });

  it("en modo angulo, un sector con más de 1 decimal falla; en valor y ninguno no se comprueba", () => {
    const sectores = [{ etiqueta: "A", valor: 1 }, { etiqueta: "B", valor: 2 }, { etiqueta: "C", valor: 4 }];
    const errores = deLaFigura(validar(conFigura({ ...CIRCULAR_VALIDO, sectores, modoEtiqueta: "angulo" })));
    assert.deepEqual(
      errores.map((e) => e.replace(/da [0-9.]+°/, "da N°")),
      [
        'items[0].figura.sectores[0]: "A" da N° en modo angulo, y cada valor calculado tiene como máximo 1 decimal exacto',
        'items[0].figura.sectores[1]: "B" da N° en modo angulo, y cada valor calculado tiene como máximo 1 decimal exacto',
        'items[0].figura.sectores[2]: "C" da N° en modo angulo, y cada valor calculado tiene como máximo 1 decimal exacto',
      ],
    );
    assert.deepEqual(validar(conFigura({ ...CIRCULAR_VALIDO, sectores, modoEtiqueta: "valor" })), []);
    assert.deepEqual(validar(conFigura({ ...CIRCULAR_VALIDO, sectores, modoEtiqueta: "ninguno" })), []);
  });

  it("valor 0 o negativo falla y suspende el chequeo de decimales", () => {
    const sectores = [{ etiqueta: "A", valor: 0 }, { etiqueta: "B", valor: -2 }, { etiqueta: "C", valor: 1 }];
    assert.deepEqual(deLaFigura(validar(conFigura({ ...CIRCULAR_VALIDO, sectores }))), [
      "items[0].figura.sectores[0].valor: debe ser un número mayor que 0 (recibido: 0)",
      "items[0].figura.sectores[1].valor: debe ser un número mayor que 0 (recibido: -2)",
    ]);
  });

  it("modo fuera del vocabulario, un solo sector, etiqueta vacía y clave sobrante fallan", () => {
    const modo = deLaFigura(validar(conFigura({ ...CIRCULAR_VALIDO, modoEtiqueta: "fraccion" })));
    assert.deepEqual(modo, ["items[0].figura.modoEtiqueta: debe ser uno de: porcentaje, valor, angulo, ninguno"]);
    const uno = deLaFigura(validar(conFigura({ ...CIRCULAR_VALIDO, sectores: [{ etiqueta: "A", valor: 1 }] })));
    assert.deepEqual(uno, ["items[0].figura.sectores: se esperan entre 2 y 8 sectores"]);
    const sectores = [{ etiqueta: "", valor: 1, color: "rojo" }, { etiqueta: "B", valor: 1 }];
    assert.deepEqual(deLaFigura(validar(conFigura({ ...CIRCULAR_VALIDO, sectores, modoEtiqueta: "valor" }))), [
      'items[0].figura.sectores[0]: clave "color" no admitida por el schema',
      "items[0].figura.sectores[0].etiqueta: texto no vacío",
    ]);
  });
});

/* Reglas (18) a (24): diagrama de cajón. Datos inventados; cada regla con un
   caso que la rompe y uno que pasa. */
const CAJA = { minimo: 6, q1: 11, mediana: 14.5, q3: 21, maximo: 33 };
const CAJON_VALIDO = {
  tipo: "diagrama-cajon",
  orientacion: "horizontal",
  eje: { min: 0, max: 40, paso: 5, etiqueta: "minutos", grilla: true },
  cajas: [{ ...CAJA, rotulos: true }],
  descripcion: "Un diagrama de cajón horizontal de tiempos en minutos, datos de prueba.",
};
const cajon = (cambios: Record<string, unknown>) => conFigura({ ...CAJON_VALIDO, ...cambios });

describe("figura diagrama-cajon: forma, regla (18)", () => {
  it("un cajón válido pasa en las dos orientaciones, con y sin etiqueta, grilla ni rótulos", () => {
    assert.deepEqual(validar(conFigura(CAJON_VALIDO)), []);
    assert.deepEqual(validar(cajon({ orientacion: "vertical" })), []);
    assert.deepEqual(validar(cajon({ eje: { min: 0, max: 40, paso: 5 }, cajas: [CAJA] })), []);
  });

  it("orientación fuera del vocabulario, eje sin ventana y descripción corta fallan", () => {
    const errores = deLaFigura(validar(cajon({ orientacion: "diagonal", eje: { min: 0, max: 40 }, descripcion: "corta" })));
    assert.deepEqual(errores, [
      "items[0].figura.orientacion: debe ser una de: horizontal, vertical",
      "items[0].figura.descripcion: demasiado corta (<30 caracteres)",
      "items[0].figura.eje: paso deben ser números finitos (la ventana del eje es obligatoria)",
    ]);
  });

  it("cero o seis cajas fallan; con cinco pasa", () => {
    const con = (n: number) => Array.from({ length: n }, (_, i) => ({ ...CAJA, nombre: `G${i + 1}` }));
    assert.deepEqual(deLaFigura(validar(cajon({ cajas: [] }))), ["items[0].figura.cajas: se esperan entre 1 y 5 cajas"]);
    assert.deepEqual(deLaFigura(validar(cajon({ cajas: con(6) }))), ["items[0].figura.cajas: se esperan entre 1 y 5 cajas"]);
    assert.deepEqual(validar(cajon({ cajas: con(5) })), []);
  });

  it("un número no finito, rotulos no booleano, grilla no booleana, nombre largo y clave sobrante fallan", () => {
    const errores = deLaFigura(
      validar(
        cajon({
          eje: { min: 0, max: 40, paso: 5, grilla: "si" },
          cajas: [{ ...CAJA, q3: "21", rotulos: 1, nombre: "Nombre demasiado largo", media: 15 }],
        }),
      ),
    );
    assert.deepEqual(errores, [
      "items[0].figura.eje.grilla: debe ser booleano",
      'items[0].figura.cajas[0]: clave "media" no admitida por el schema',
      "items[0].figura.cajas[0]: q3 deben ser números finitos",
      "items[0].figura.cajas[0].rotulos: debe ser booleano",
      'items[0].figura.cajas[0].nombre: "Nombre demasiado largo" tiene 22 caracteres y el tope es 14',
    ]);
  });
});

describe("figura diagrama-cajon: orden de los cinco números, regla (19)", () => {
  it("q1 mayor que la mediana falla nombrando los dos; q1 igual a la mediana pasa", () => {
    assert.deepEqual(deLaFigura(validar(cajon({ cajas: [{ ...CAJA, q1: 16 }] }))), [
      "items[0].figura.cajas[0]: q1 (16) debe ser menor o igual que mediana (14.5); el orden es minimo ≤ q1 ≤ mediana ≤ q3 ≤ maximo",
    ]);
    assert.deepEqual(validar(cajon({ cajas: [{ ...CAJA, q1: 14.5, rotulos: true }] })), []);
  });

  it("máximo menor que q3 y mínimo mayor que q1 fallan cada uno", () => {
    const errores = deLaFigura(validar(cajon({ cajas: [{ ...CAJA, minimo: 12, maximo: 20 }] })));
    assert.deepEqual(errores, [
      "items[0].figura.cajas[0]: minimo (12) debe ser menor o igual que q1 (11); el orden es minimo ≤ q1 ≤ mediana ≤ q3 ≤ maximo",
      "items[0].figura.cajas[0]: q3 (21) debe ser menor o igual que maximo (20); el orden es minimo ≤ q1 ≤ mediana ≤ q3 ≤ maximo",
    ]);
  });
});

describe("figura diagrama-cajon: todo dentro de la ventana, regla (20)", () => {
  it("un mínimo bajo eje.min y un máximo sobre eje.max fallan; en el borde pasan", () => {
    const errores = deLaFigura(validar(cajon({ cajas: [{ ...CAJA, minimo: -2, maximo: 41 }] })));
    assert.deepEqual(errores, [
      "items[0].figura.cajas[0].minimo: -2 queda fuera del eje [0, 40]",
      "items[0].figura.cajas[0].maximo: 41 queda fuera del eje [0, 40]",
    ]);
    assert.deepEqual(validar(cajon({ cajas: [{ ...CAJA, minimo: 0, maximo: 40 }] })), []);
  });
});

describe("figura diagrama-cajon: paso que divide el rango, regla (21)", () => {
  it("paso que no divide, paso 0 y min >= max fallan; un paso decimal que divide pasa", () => {
    assert.deepEqual(deLaFigura(validar(cajon({ eje: { min: 0, max: 40, paso: 3 } }))), [
      "items[0].figura.eje.paso: 3 no divide el rango 40 − 0 = 40 en partes enteras (quedan 13.3333)",
    ]);
    assert.deepEqual(deLaFigura(validar(cajon({ eje: { min: 0, max: 40, paso: 0 } }))), [
      "items[0].figura.eje.paso: debe ser mayor que 0 (recibido: 0)",
    ]);
    assert.deepEqual(deLaFigura(validar(cajon({ eje: { min: 40, max: 40, paso: 5 } }))), [
      "items[0].figura.eje: min (40) debe ser menor que max (40)",
    ]);
    const decimal = { cajas: [{ minimo: 0.2, q1: 0.8, mediana: 1.1, q3: 1.6, maximo: 2.4 }], eje: { min: 0, max: 2.5, paso: 0.5 } };
    assert.deepEqual(validar(cajon(decimal)), []);
  });
});

describe("figura diagrama-cajon: tope de marcas, regla (22)", () => {
  it("12 marcas fallan con el tope; 11 pasan", () => {
    assert.deepEqual(deLaFigura(validar(cajon({ eje: { min: 0, max: 44, paso: 4 }, cajas: [CAJA] }))), [
      "items[0].figura.eje: 12 marcas y el tope es 11 (el mismo del histograma); agranda el paso",
    ]);
    assert.deepEqual(validar(cajon({ eje: { min: 0, max: 40, paso: 4 }, cajas: [CAJA] })), []);
  });

});

describe("figura diagrama-cajon: marcas según el número más largo, regla (27)", () => {
  const caja = { minimo: 1100, q1: 1300, mediana: 1450, q3: 1600, maximo: 1900 };

  it("11 marcas de 4 cifras en horizontal no caben; con paso 200 (6 marcas) pasa", () => {
    const errores = deLaFigura(validar(cajon({ eje: { min: 1000, max: 2000, paso: 100 }, cajas: [caja] })));
    assert.deepEqual(errores, ["items[0].figura.eje: 11 marcas y con números de 5 caracteres caben 9 en este eje (enunciado, letra de 12 px); agranda el paso"]);
    assert.deepEqual(validar(cajon({ eje: { min: 1000, max: 2000, paso: 200 }, cajas: [caja] })), []);
  });

  it("en vertical el límite es la letra de alto: 11 marcas de 4 cifras pasan", () => {
    assert.deepEqual(validar(cajon({ orientacion: "vertical", eje: { min: 1000, max: 2000, paso: 100 }, cajas: [caja] })), []);
  });

  it("el mismo eje cabe en el enunciado y no en una alternativa, que es más angosta", () => {
    const eje = { min: 1000, max: 2000, paso: 125 };
    assert.deepEqual(validar(cajon({ eje, cajas: [caja] })), []);
    const alternativas = [0, 1, 2, 3].map((i) => ({ texto: "", figura: { ...CAJON_VALIDO, eje, cajas: [{ ...caja, maximo: 1900 + 10 * i }] } }));
    const base = item(1, TRES);
    const conAlternativas = { ...base, alternativas: base.alternativas.map((a, i) => ({ ...a, ...alternativas[i] })) };
    const errores = validar(banco(conAlternativas as unknown as ReturnType<typeof item>));
    assert.deepEqual(errores, ["A", "B", "C", "D"].map((c) => `items[0].${c}.figura.eje: 9 marcas y con números de 5 caracteres caben 8 en este eje (alternativa, letra de 12 px); agranda el paso`));
  });

  it("números más largos dejan menos marcas: 6 cifras con 11 marcas no caben, con 6 sí", () => {
    const grande = { minimo: 110000, q1: 130000, mediana: 145000, q3: 160000, maximo: 190000 };
    const errores = deLaFigura(validar(cajon({ eje: { min: 100000, max: 200000, paso: 10000 }, cajas: [grande] })));
    assert.equal(errores.length, 1);
    assert.match(errores[0], /^items\[0\]\.figura\.eje: 11 marcas y con números de 7 caracteres caben \d+ en este eje/);
    assert.deepEqual(validar(cajon({ eje: { min: 100000, max: 200000, paso: 20000 }, cajas: [grande] })), []);
  });
});

describe("figura diagrama-cajon: nombres, regla (23)", () => {
  it("con dos cajas, la que no tiene nombre falla y un nombre repetido falla; con nombres distintos pasa", () => {
    const sinNombre = deLaFigura(validar(cajon({ cajas: [{ ...CAJA, nombre: "A" }, CAJA] })));
    assert.deepEqual(sinNombre, ["items[0].figura.cajas[1]: con 2 o más cajas cada una lleva nombre (no se distinguen solo por posición ni por color)"]);
    const repetido = deLaFigura(validar(cajon({ cajas: [{ ...CAJA, nombre: "A" }, { ...CAJA, nombre: "A" }] })));
    assert.deepEqual(repetido, ['items[0].figura.cajas[1].nombre: "A" repetido (ya en items[0].figura.cajas[0])']);
    assert.deepEqual(validar(cajon({ cajas: [{ ...CAJA, nombre: "A" }, { ...CAJA, nombre: "B" }] })), []);
  });

  it("en vertical, un nombre que no cabe bajo su caja falla; uno corto pasa", () => {
    const cinco = (nombre: (i: number) => string) => Array.from({ length: 5 }, (_, i) => ({ ...CAJA, nombre: nombre(i) }));
    const errores = deLaFigura(validar(cajon({ orientacion: "vertical", cajas: cinco((i) => `Grupo largo ${i}`) })));
    assert.deepEqual(errores, [0, 1, 2, 3, 4].map((i) => `items[0].figura.cajas[${i}].nombre: "Grupo largo ${i}" no cabe bajo su caja en vertical (enunciado); acórtalo o usa orientación horizontal`));
    assert.deepEqual(validar(cajon({ orientacion: "vertical", cajas: cinco((i) => `G${i}`) })), []);
    /* En horizontal los nombres tienen columna propia: el largo pasa. */
    assert.deepEqual(validar(cajon({ cajas: cinco((i) => `Grupo largo ${i}`) })), []);
  });

  it("con una sola caja el nombre es opcional", () => {
    assert.deepEqual(validar(cajon({ cajas: [CAJA] })), []);
    assert.deepEqual(validar(cajon({ cajas: [{ ...CAJA, nombre: "Único" }] })), []);
  });
});

describe("figura diagrama-cajon: separación de rótulos, regla (24)", () => {
  it("dos valores distintos que se pisan fallan con el mensaje que sugiere quitar rotulos; sin rotulos pasa", () => {
    const juntos = { ...CAJA, q1: 14, rotulos: true };
    assert.deepEqual(deLaFigura(validar(cajon({ cajas: [juntos] }))), [
      'items[0].figura.cajas[0]: los rótulos de 14 y 14,5 se pisan en la figura; quita "rotulos" de esta caja o separa los valores',
    ]);
    assert.deepEqual(validar(cajon({ cajas: [{ ...juntos, rotulos: false }] })), []);
  });

  it("valores iguales comparten rótulo y no chocan: q1 igual a la mediana pasa con rotulos", () => {
    assert.deepEqual(validar(cajon({ cajas: [{ minimo: 6, q1: 14, mediana: 14, q3: 21, maximo: 33, rotulos: true }] })), []);
  });

  it("en vertical, dos valores a menos de una letra de alto fallan", () => {
    const vertical = { orientacion: "vertical", eje: { min: 0, max: 100, paso: 10 }, cajas: [{ minimo: 10, q1: 30, mediana: 32, q3: 60, maximo: 90, rotulos: true }] };
    assert.deepEqual(deLaFigura(validar(cajon(vertical))), [
      'items[0].figura.cajas[0]: los rótulos de 30 y 32 se pisan en la figura; quita "rotulos" de esta caja o separa los valores',
    ]);
    const separados = { ...vertical, cajas: [{ minimo: 10, q1: 30, mediana: 45, q3: 60, maximo: 90, rotulos: true }] };
    assert.deepEqual(validar(cajon(separados)), []);
  });

  it("en vertical con cuatro cajas, un rótulo que no cabe en su carril falla; con cifras cortas pasa", () => {
    const caja = { minimo: 10, q1: 30, mediana: 50, q3: 70, maximo: 95, rotulos: true };
    const eje = { min: 0, max: 100, paso: 20 };
    const cortas = ["A", "B", "C", "D"].map((nombre) => ({ ...caja, nombre }));
    assert.deepEqual(validar(cajon({ orientacion: "vertical", eje, cajas: cortas })), []);
    const largas = cortas.map((c) => ({ ...c, minimo: 10.25 }));
    assert.deepEqual(
      deLaFigura(validar(cajon({ orientacion: "vertical", eje, cajas: largas }))),
      [0, 1, 2, 3].map((i) => `items[0].figura.cajas[${i}]: el rótulo de 10,25 se sale de su lugar en la figura; quita "rotulos" de esta caja`),
    );
  });
});

/* Reglas (25) y (26): alternativas con figura. Cajones de prueba con datos
   inventados; cada regla con un caso que la rompe y uno que pasa. */
const cajonDeAlternativa = (mediana: number) => ({
  tipo: "diagrama-cajon",
  orientacion: "horizontal",
  eje: { min: 0, max: 40, paso: 5 },
  cajas: [{ minimo: 4, q1: 10, mediana, q3: 24, maximo: 35 }],
  descripcion: `Diagrama de cajón de prueba con mediana ${mediana}.`,
});

/** El ítem 1 con cambios por alternativa, en el orden A, B, C (correcta), D. */
function conAlternativas(cambios: Record<string, unknown>[]) {
  const base = item(1, TRES);
  const alternativas = base.alternativas.map((a, i) => ({ ...a, ...cambios[i] }));
  return banco({ ...base, alternativas } as unknown as ReturnType<typeof item>);
}
const graficas = (texto = ""): Record<string, unknown>[] => [12, 15, 18, 21].map((m) => ({ texto, figura: cajonDeAlternativa(m) }));

describe("alternativas con figura: las cuatro o ninguna, regla (25)", () => {
  it("cuatro alternativas con cajón pasan, con texto vacío o con texto; ninguna también", () => {
    assert.deepEqual(validar(conAlternativas(graficas())), []);
    assert.deepEqual(validar(conAlternativas(graficas("Cajón"))), []);
    assert.deepEqual(validar(conAlternativas([{}, {}, {}, {}])), []);
  });

  it("tres de cuatro con figura falla nombrando el conteo", () => {
    const cambios = graficas("Cajón");
    cambios[3] = {};
    assert.deepEqual(validar(conAlternativas(cambios)), ["items[0]: 3 de 4 alternativas llevan figura; van las cuatro o ninguna"]);
  });

  it("la figura de una alternativa se valida con las reglas de su tipo", () => {
    const cambios = graficas();
    cambios[1] = { texto: "", figura: { ...cajonDeAlternativa(15), cajas: [{ minimo: 4, q1: 16, mediana: 15, q3: 24, maximo: 35 }] } };
    assert.deepEqual(validar(conAlternativas(cambios)), [
      "items[0].B.figura.cajas[0]: q1 (16) debe ser menor o igual que mediana (15); el orden es minimo ≤ q1 ≤ mediana ≤ q3 ≤ maximo",
    ]);
  });
});

describe("alternativas con figura: texto vacío y nombre accesible, regla (26)", () => {
  it("texto vacío sin figura falla como antes", () => {
    assert.deepEqual(validar(conAlternativas([{ texto: "" }, {}, {}, {}])), ["items[0].A: falta texto"]);
    assert.deepEqual(validar(conAlternativas([{ texto: "   " }, {}, {}, {}])), ["items[0].A: falta texto"]);
  });

  it("texto vacío con una figura sin descripcion falla; con texto pasa", () => {
    const barras = { tipo: "grafico-barras", categorias: ["A", "B"], series: [{ valores: [3, 5] }], ejeX: { etiqueta: "x" }, ejeY: { etiqueta: "f" } };
    const sinTexto = [0, 1, 2, 3].map(() => ({ texto: "", figura: barras }));
    const errores = validar(conAlternativas(sinTexto));
    assert.deepEqual(errores, ["A", "B", "C", "D"].map((c) => `items[0].${c}: texto vacío exige una figura con descripcion, que es el nombre accesible del botón; grafico-barras no la trae, así que esta alternativa lleva texto`));
    const conTexto = ["Uno", "Dos", "Tres", "Cuatro"].map((texto) => ({ texto, figura: barras }));
    assert.deepEqual(validar(conAlternativas(conTexto)), []);
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
