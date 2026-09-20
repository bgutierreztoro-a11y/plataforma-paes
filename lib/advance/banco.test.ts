import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { itemParaCliente, type ItemEnDisco } from "./banco.ts";
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

describe("itemParaCliente: la figura viaja íntegra", () => {
  for (const [nombre, figura] of [
    ["plano de isometrías (sin tipo)", ISOMETRIAS],
    ["plano-funcion con todos los campos", PLANO_FUNCION],
    ["tabla-valores", TABLA],
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

  it("sinErrorCatalogado no viaja y errorCatalogado null se conserva", () => {
    const cliente = itemParaCliente(itemCon(TABLA));
    const b = cliente.alternativas[1];
    assert.equal("sinErrorCatalogado" in b, false);
    assert.equal(b.esCorrecta === false && b.errorCatalogado, null);
  });
});
