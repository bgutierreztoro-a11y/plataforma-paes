import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { figuraParaCliente, itemParaCliente, type ItemEnDisco } from "./banco.ts";
import type { FiguraItem } from "./descarte.ts";

/* `itemParaCliente` es el único punto por el que un ítem del banco llega al
   cliente. La figura viaja íntegra: acá se afirma que ningún campo de los tres
   tipos se pierde en el sanitizado, ni cambia de valor. */

const FEEDBACK = "Feedback de descarte con más de cuarenta caracteres, sin celebración.";

function itemCon(figura: FiguraItem): ItemEnDisco {
  return {
    id: "adv-prueba-001",
    unidadId: "prueba",
    moduloId: "prueba",
    habilidad: "representar",
    dificultad: "media",
    tiempoReferenciaSeg: 120,
    enunciado: "Enunciado con 2 + 3.",
    solucion: "Solución.",
    figura,
    alternativas: [
      { clave: "A", texto: "a", esCorrecta: false, errorCatalogado: "falla-uno", feedbackDescarte: FEEDBACK },
      { clave: "B", texto: "b", esCorrecta: false, errorCatalogado: null, sinErrorCatalogado: { motivo: "m", nota: "n" }, feedbackDescarte: FEEDBACK },
      { clave: "C", texto: "c", esCorrecta: true, feedbackDescarteIncorrecto: FEEDBACK },
      { clave: "D", texto: "d", esCorrecta: false, errorCatalogado: "falla-dos", feedbackDescarte: FEEDBACK },
    ],
  };
}

const ISOMETRIAS: FiguraItem = {
  plano: { xMin: -4, xMax: 6, yMin: -3, yMax: 5 },
  descripcion: "Triángulo ABC y el vector v que va de (1, 1) a (4, 3), datos del ítem.",
  elementos: [
    { tipo: "punto", nombre: "A", x: -3, y: -1 },
    { tipo: "vector", etiqueta: "v", desde: [1, 1], hasta: [4, 3] },
  ],
};

const PLANO_FUNCION: FiguraItem = {
  tipo: "plano-funcion",
  ventana: { xMin: -2, xMax: 6, yMin: -5, yMax: 10 },
  curvas: [
    { clase: "parabola", a: 1, b: -4, c: 3, desde: -1, hasta: 5, rotulo: "f", trazo: "solido" },
    { clase: "recta", por: [{ x: 0, y: -1 }, { x: 4, y: 3 }], rotulo: "g", trazo: "segmentado" },
    { clase: "recta-vertical", x: 5, rotulo: "v", trazo: "punteado" },
  ],
  puntos: [{ x: 1, y: 0, rotulo: "A", estilo: "hueco", mostrarCoordenadas: true }],
  segmentos: [{ desde: { x: 2, y: 0 }, hasta: { x: 2, y: -1 }, rotulo: "h" }],
  ejeSimetria: { x: 2, rotulo: "x = 2" },
  regiones: [
    { clase: "entre-curva-y-eje", curva: 0, desde: 1, hasta: 3 },
    { clase: "franja-x", desde: 1, hasta: 3 },
  ],
  etiquetaEjeX: "tiempo (s)",
  etiquetaEjeY: "altura (m)",
  descripcion: "Parábola f con dos ceros, recta g que la corta y recta vertical v, datos del ítem.",
};

const TABLA: FiguraItem = {
  tipo: "tabla-valores",
  encabezados: ["x", "f(x)", "g(x)"],
  filas: [
    [-1, 8, "no definida"],
    [0, 3, 0.5],
  ],
  descripcion: "Tabla de valores de f y g para x entre -1 y 0, datos del ítem.",
};

const CAJON: FiguraItem = {
  tipo: "diagrama-cajon",
  orientacion: "horizontal",
  eje: { min: 0, max: 40, paso: 5, etiqueta: "minutos", grilla: true },
  cajas: [
    { nombre: "Grupo A", minimo: 3, q1: 11, mediana: 11, q3: 24.5, maximo: 38, rotulos: true },
    { nombre: "Grupo B", minimo: 6, q1: 14, mediana: 19, q3: 27, maximo: 33 },
  ],
  descripcion: "Dos diagramas de cajón horizontales de prueba, grupo A y grupo B.",
};

describe("itemParaCliente: la figura viaja íntegra", () => {
  for (const [nombre, figura] of [
    ["plano de isometrías (sin tipo)", ISOMETRIAS],
    ["plano-funcion con todos los campos", PLANO_FUNCION],
    ["tabla-valores", TABLA],
    ["diagrama-cajon sin texto con operadores", CAJON],
  ] as const) {
    it(nombre, () => {
      const cliente = itemParaCliente(itemCon(figura));
      assert.deepEqual(cliente.figura, figura);
      assert.deepEqual(Object.keys(cliente.figura ?? {}).sort(), Object.keys(figura).sort());
    });
  }

  it("sin figura no aparece la clave", () => {
    const sinFigura = itemCon(TABLA);
    delete sinFigura.figura;
    const cliente = itemParaCliente(sinFigura);
    assert.equal("figura" in cliente, false);
  });

  it("alternativas gráficas: la figura de cada alternativa viaja por figuraParaCliente; sin figura no aparece la clave", () => {
    const conFiguras = itemCon(TABLA);
    conFiguras.alternativas = conFiguras.alternativas.map((a, i) => ({
      ...a,
      texto: "",
      figura: { ...(CAJON as Extract<FiguraItem, { tipo: "diagrama-cajon" }>), cajas: [{ nombre: `A + ${i}`, minimo: 3, q1: 11, mediana: 11, q3: 24.5, maximo: 38 }] },
    }));
    const cliente = itemParaCliente(conFiguras);
    cliente.alternativas.forEach((a, i) => {
      assert.equal(a.texto, "");
      assert.deepEqual(a.figura, figuraParaCliente(conFiguras.alternativas[i].figura as FiguraItem));
      assert.equal(a.figura?.tipo === "diagrama-cajon" && a.figura.cajas[0].nombre, `A${NBSP}+${NBSP}${i}`);
    });
    for (const a of itemParaCliente(itemCon(TABLA)).alternativas) assert.equal("figura" in a, false);
  });

  it("sinErrorCatalogado no viaja y errorCatalogado null se conserva", () => {
    const cliente = itemParaCliente(itemCon(TABLA));
    const b = cliente.alternativas[1];
    assert.equal("sinErrorCatalogado" in b, false);
    assert.equal(b.esCorrecta === false && b.errorCatalogado, null);
  });
});

/* Las figuras de datos son la excepción: su texto pasa por protegerExpresiones
   (espacio duro dentro de cada expresión) y sus números viajan intactos. */
const NBSP = " ";

describe("figuraParaCliente: el texto de las figuras de datos se protege, los números no cambian", () => {
  it("tabla-datos: titulo, columnas, celdas de texto y filaTotal", () => {
    const figura: FiguraItem = {
      tipo: "tabla-datos",
      titulo: "Datos con n = 40",
      columnas: ["Intervalo", "f"],
      filas: [["10 − 20", 4], ["20 − 30", "?"]],
      filaTotal: ["Total", 40],
    };
    assert.deepEqual(figuraParaCliente(figura), {
      tipo: "tabla-datos",
      titulo: `Datos con n${NBSP}= 40`,
      columnas: ["Intervalo", "f"],
      filas: [[`10${NBSP}−${NBSP}20`, 4], [`20${NBSP}−${NBSP}30`, "?"]],
      filaTotal: ["Total", 40],
    });
  });

  it("grafico-barras y grafico-lineas: categorías, nombres de serie y etiquetas de eje; min, max, paso y valores intactos", () => {
    const barras: FiguraItem = {
      tipo: "grafico-barras",
      categorias: ["A + B", "C"],
      series: [{ nombre: "n = 1", valores: [2.5, -3] }, { nombre: "S", valores: [0, 1] }],
      ejeX: { etiqueta: "x = 2" },
      ejeY: { etiqueta: "y + 1", min: -4, max: 4, paso: 2 },
      mostrarValores: true,
    };
    assert.deepEqual(figuraParaCliente(barras), {
      tipo: "grafico-barras",
      categorias: [`A${NBSP}+${NBSP}B`, "C"],
      series: [{ nombre: `n${NBSP}= 1`, valores: [2.5, -3] }, { nombre: "S", valores: [0, 1] }],
      ejeX: { etiqueta: `x${NBSP}= 2` },
      ejeY: { etiqueta: `y${NBSP}+${NBSP}1`, min: -4, max: 4, paso: 2 },
      mostrarValores: true,
    });
    const lineas: FiguraItem = { tipo: "grafico-lineas", categorias: ["1", "2"], series: [{ valores: [1, 2] }], ejeX: { etiqueta: "x" }, ejeY: { etiqueta: "y" } };
    assert.deepEqual(figuraParaCliente(lineas), lineas);
  });

  it("histograma: solo las etiquetas de eje; intervalos y frecuencias intactos", () => {
    const figura: FiguraItem = {
      tipo: "histograma",
      intervalos: [{ desde: 0, hasta: 10 }],
      frecuencias: [3],
      ejeX: { etiqueta: "Edad (n = 3)" },
      ejeY: { etiqueta: "f" },
      poligono: true,
    };
    assert.deepEqual(figuraParaCliente(figura), { ...figura, ejeX: { etiqueta: `Edad (n${NBSP}= 3)` } });
  });

  it("grafico-circular: etiquetas de sector; valores y modo intactos", () => {
    const figura: FiguraItem = { tipo: "grafico-circular", sectores: [{ etiqueta: "A − B", valor: 3 }, { etiqueta: "C", valor: 1 }], modoEtiqueta: "angulo" };
    assert.deepEqual(figuraParaCliente(figura), { tipo: "grafico-circular", sectores: [{ etiqueta: `A${NBSP}−${NBSP}B`, valor: 3 }, { etiqueta: "C", valor: 1 }], modoEtiqueta: "angulo" });
  });

  it("diagrama-cajon: nombres de caja y unidad del eje; los cinco números, el eje y la descripción intactos", () => {
    const figura: FiguraItem = {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 0, max: 50, paso: 10, etiqueta: "t (n = 9)", grilla: true },
      cajas: [
        { nombre: "A + B", minimo: 4, q1: 12, mediana: 12, q3: 30.5, maximo: 47, rotulos: true },
        { nombre: "C", minimo: 1, q1: 9, mediana: 20, q3: 26, maximo: 38 },
      ],
      descripcion: "Dos diagramas de cajón verticales con datos de prueba, A + B y C.",
    };
    assert.deepEqual(figuraParaCliente(figura), {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 0, max: 50, paso: 10, etiqueta: `t (n${NBSP}= 9)`, grilla: true },
      cajas: [
        { nombre: `A${NBSP}+${NBSP}B`, minimo: 4, q1: 12, mediana: 12, q3: 30.5, maximo: 47, rotulos: true },
        { nombre: "C", minimo: 1, q1: 9, mediana: 20, q3: 26, maximo: 38 },
      ],
      descripcion: "Dos diagramas de cajón verticales con datos de prueba, A + B y C.",
    });
    /* Sin nombre ni etiqueta no aparece ninguna clave nueva. */
    const sola: FiguraItem = { tipo: "diagrama-cajon", orientacion: "horizontal", eje: { min: 0, max: 10, paso: 2 }, cajas: [{ minimo: 1, q1: 2, mediana: 5, q3: 7, maximo: 9 }], descripcion: "Un diagrama de cajón horizontal de prueba." };
    assert.deepEqual(figuraParaCliente(sola), sola);
  });

  it("las tres figuras anteriores siguen viajando tal cual, aunque tengan texto con operadores", () => {
    const tabla: FiguraItem = { ...TABLA, encabezados: ["x", "f(x) − g(x)"] } as FiguraItem;
    for (const figura of [ISOMETRIAS, PLANO_FUNCION, tabla]) {
      assert.equal(figuraParaCliente(figura), figura);
    }
  });
});
