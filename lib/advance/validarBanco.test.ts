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

  it("tipo desconocido falla nombrando los dos tipos y la ausencia", () => {
    const errores = deLaFigura(validar(conFigura({ tipo: "histograma", descripcion: DESCRIPCION })));
    assert.deepEqual(errores, [
      'items[0].figura.tipo: debe ser uno de: plano-funcion, tabla-valores, o ausente para el plano de isometrías (recibido: "histograma")',
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
