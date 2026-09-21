import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { FiguraGraficoBarras, FiguraGraficoCircular, FiguraGraficoLineas, FiguraHistograma } from "./descarte.ts";
import {
  ariaLabelBarras,
  ariaLabelCircular,
  ariaLabelHistograma,
  ariaLabelLineas,
  ejeResuelto,
  marcasDeClase,
  pathSector,
  puntoPolar,
  rotuloMarca,
  sectoresResueltos,
  textoDeSector,
} from "./figurasDatos.ts";

/* Motor de las figuras de datos. Los datos son abstractos (A, B, C): acá se
   afirma la geometría y el texto, no ningún contenido de banco. */

const cerca = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

describe("ejeResuelto", () => {
  it("sin nada declarado: incluye el 0, redondea hacia afuera y las marcas quedan dentro", () => {
    const eje = ejeResuelto([4, 7, 2], { etiqueta: "f" });
    assert.equal(eje.min, 0);
    assert.ok(eje.max >= 7);
    assert.equal(eje.marcas[0], eje.min);
    assert.equal(eje.marcas[eje.marcas.length - 1], eje.max);
    for (let i = 1; i < eje.marcas.length; i++) cerca(eje.marcas[i] - eje.marcas[i - 1], eje.paso);
  });

  it("el dato más alto no toca el borde: sin max declarado queda un paso de aire, con max declarado no", () => {
    const automatico = ejeResuelto([2, 8], { etiqueta: "f" });
    assert.ok(automatico.max > 8, `max ${automatico.max}`);
    assert.equal(automatico.marcas[automatico.marcas.length - 1], automatico.max);
    const conPaso = ejeResuelto([2, 10], { etiqueta: "f", paso: 5 });
    assert.deepEqual(conPaso, { min: 0, max: 15, paso: 5, marcas: [0, 5, 10, 15] });
    assert.equal(ejeResuelto([2, 8], { etiqueta: "f", max: 8 }).max, 8);
  });

  it("con min, max y paso declarados los respeta tal cual", () => {
    assert.deepEqual(ejeResuelto([1, 2], { etiqueta: "f", min: 0, max: 8, paso: 2 }), { min: 0, max: 8, paso: 2, marcas: [0, 2, 4, 6, 8] });
  });

  it("con solo paso, min y max se redondean al paso hacia afuera", () => {
    const eje = ejeResuelto([3, 11], { etiqueta: "f", paso: 5 });
    assert.deepEqual(eje, { min: 0, max: 15, paso: 5, marcas: [0, 5, 10, 15] });
  });

  it("con solo max, el min sale de los datos (0) y las marcas no lo superan", () => {
    const eje = ejeResuelto([4, 7], { etiqueta: "f", max: 7 });
    assert.equal(eje.min, 0);
    assert.equal(eje.max, 7);
    assert.ok(eje.marcas.every((m) => m >= 0 && m <= 7));
  });

  it("valores negativos abren el eje bajo el 0", () => {
    const eje = ejeResuelto([-3, 2], { etiqueta: "f" });
    assert.ok(eje.min <= -3);
    assert.ok(eje.max >= 2);
    assert.ok(eje.marcas.includes(0));
  });

  it("todos los valores en 0 no divide por cero: el eje se abre a [0, 1]", () => {
    const eje = ejeResuelto([0, 0], { etiqueta: "f" });
    assert.equal(eje.min, 0);
    assert.ok(eje.max > 0);
  });

  it("rotuloMarca escribe con los decimales del paso, en es-CL", () => {
    const eje = ejeResuelto([0.3, 1.2], { etiqueta: "f", paso: 0.5 });
    assert.deepEqual(eje.marcas.map((m) => rotuloMarca(m, eje)), ["0,0", "0,5", "1,0", "1,5"]);
  });
});

describe("marcasDeClase", () => {
  it("es el punto medio de cada intervalo", () => {
    assert.deepEqual(marcasDeClase([{ desde: 0, hasta: 10 }, { desde: 10, hasta: 25 }]), [5, 17.5]);
  });
});

describe("sectoresResueltos y pathSector", () => {
  const sectores = [
    { etiqueta: "A", valor: 12 },
    { etiqueta: "B", valor: 6 },
    { etiqueta: "C", valor: 6 },
  ];

  it("reparte 360° y 100 % en el orden del banco, cada sector empieza donde termina el anterior", () => {
    const r = sectoresResueltos(sectores);
    assert.deepEqual(r.map((s) => s.angulo), [180, 90, 90]);
    assert.deepEqual(r.map((s) => s.porcentaje), [50, 25, 25]);
    assert.deepEqual(r.map((s) => [s.inicio, s.fin]), [[0, 180], [180, 270], [270, 360]]);
  });

  it("textoDeSector según el modo: porcentaje con espacio duro, valor, ángulo, nada", () => {
    const [a] = sectoresResueltos([{ etiqueta: "A", valor: 1 }, { etiqueta: "B", valor: 7 }]);
    assert.equal(textoDeSector(a, "porcentaje"), "12,5 %");
    assert.equal(textoDeSector(a, "valor"), "1");
    assert.equal(textoDeSector(a, "angulo"), "45°");
    assert.equal(textoDeSector(a, "ninguno"), null);
  });

  it("puntoPolar: 0° es las 12 en punto, 90° las 3", () => {
    const p0 = puntoPolar(10, 10, 5, 0);
    cerca(p0.x, 10);
    cerca(p0.y, 5);
    const p90 = puntoPolar(10, 10, 5, 90);
    cerca(p90.x, 15);
    cerca(p90.y, 10);
  });

  it("pathSector usa el arco largo pasado 180° y dos mitades para 360°", () => {
    assert.match(pathSector(0, 0, 10, 0, 90), /A 10 10 0 0 1 /);
    assert.match(pathSector(0, 0, 10, 0, 270), /A 10 10 0 1 1 /);
    assert.equal((pathSector(0, 0, 10, 0, 360).match(/A /g) ?? []).length, 2);
  });
});

describe("aria-label generado desde los datos", () => {
  const barras: FiguraGraficoBarras = {
    tipo: "grafico-barras",
    categorias: ["A", "B", "C"],
    series: [{ valores: [4, 7.5, 2] }],
    ejeX: { etiqueta: "Categoría" },
    ejeY: { etiqueta: "Frecuencia" },
  };

  it("barras con una serie: lista categoría y valor", () => {
    assert.equal(ariaLabelBarras(barras), "Gráfico de barras, Frecuencia por Categoría: A 4, B 7,5, C 2.");
  });

  it("barras con dos series: una frase por serie con su nombre", () => {
    const dos: FiguraGraficoBarras = { ...barras, series: [{ nombre: "S1", valores: [1, 2, 3] }, { nombre: "S2", valores: [4, 5, 6] }] };
    assert.equal(ariaLabelBarras(dos), "Gráfico de barras, Frecuencia por Categoría: S1: A 1, B 2, C 3. S2: A 4, B 5, C 6.");
  });

  it("líneas: misma forma con su cabeza", () => {
    const lineas: FiguraGraficoLineas = { ...barras, tipo: "grafico-lineas" };
    assert.equal(ariaLabelLineas(lineas), "Gráfico de líneas, Frecuencia por Categoría: A 4, B 7,5, C 2.");
  });

  it("histograma: intervalo por intervalo", () => {
    const h: FiguraHistograma = {
      tipo: "histograma",
      intervalos: [{ desde: 0, hasta: 10 }, { desde: 10, hasta: 20 }],
      frecuencias: [4, 9],
      ejeX: { etiqueta: "Valor" },
      ejeY: { etiqueta: "Frecuencia" },
    };
    assert.equal(ariaLabelHistograma(h), "Histograma, Frecuencia por Valor: de 0 a 10 4, de 10 a 20 9.");
  });

  it("circular: el texto del modo, y en ninguno solo las etiquetas", () => {
    const c: FiguraGraficoCircular = { tipo: "grafico-circular", sectores: [{ etiqueta: "A", valor: 3 }, { etiqueta: "B", valor: 1 }], modoEtiqueta: "porcentaje" };
    assert.equal(ariaLabelCircular(c), "Gráfico circular: A 75 %, B 25 %.");
    assert.equal(ariaLabelCircular({ ...c, modoEtiqueta: "valor" }), "Gráfico circular: A 3, B 1.");
    assert.equal(ariaLabelCircular({ ...c, modoEtiqueta: "angulo" }), "Gráfico circular: A 270°, B 90°.");
    assert.equal(ariaLabelCircular({ ...c, modoEtiqueta: "ninguno" }), "Gráfico circular: A, B.");
  });
});
