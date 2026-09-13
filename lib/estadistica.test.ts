import test from "node:test";
import assert from "node:assert/strict";
import { validarDatos } from "../scripts/validar-contenido.mjs";
import {
  angulosDeTabla,
  anguloSector,
  cuartiles,
  cuartilesIncluyendo,
  datoFaltante,
  escalaDeCajon,
  escalaDeValores,
  frecuenciaRelativa,
  media,
  mediaDesdeTabla,
  mediaUnion,
  mediana,
  mismaFraccion,
  motivoRechazoDatosGrafico,
  ordenar,
  pasoDeCuadricula,
  percentil,
  percentilAlternativo,
  porcentajeBajo,
  racional,
  rangoIntercuartil,
  resumenCincoNumeros,
  sumaExacta,
  sumaFrecuenciasRelativas,
  tablaFrecuencias,
  totalDeTabla,
  valorDe,
} from "./estadistica.ts";

// ---------- racionales ----------

test("racional reduce y normaliza el signo; sumaExacta no arrastra error flotante", () => {
  assert.deepEqual(racional(4, 10), { num: 2, den: 5 });
  assert.deepEqual(racional(3, -6), { num: -1, den: 2 });
  assert.throws(() => racional(1, 0), /denominador nulo/);
  assert.throws(() => racional(1.5, 2), /enteros/);
  assert.equal(sumaExacta([33.3, 33.3, 33.4]), 100);
  assert.equal(sumaExacta([0.1, 0.2]), 0.3);
  assert.equal(sumaExacta([12.5, 37.5, 50]), 100);
});

// ---------- tablas de frecuencia ----------

const TABLAS: (number | string)[][] = [
  [3, 3, 5, 5, 5, 8, 8, 8, 8, 10],
  ["rojo", "azul", "rojo", "verde"],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3],
  [...Array(10).fill("a"), ...Array(5).fill("b"), ...Array(7).fill("c"), ...Array(3).fill("d")],
];

test("la suma de las frecuencias relativas es exactamente 1 en cuatro tablas", () => {
  for (const datos of TABLAS) {
    const tabla = tablaFrecuencias(datos);
    assert.equal(totalDeTabla(tabla), datos.length);
    assert.ok(mismaFraccion(sumaFrecuenciasRelativas(tabla), racional(1, 1)), `tabla de n = ${datos.length}`);
    // Y los porcentajes suman 100 exacto.
    assert.equal(sumaExacta(tabla.map((f) => f.porcentaje)), 100);
  }
});

test("tablaFrecuencias reduce las fracciones y ordena: números ascendentes, categorías por aparición", () => {
  const numerica = tablaFrecuencias([8, 3, 8, 5, 3, 5, 8, 5, 8, 10]);
  assert.deepEqual(
    numerica.map((f) => [f.valor, f.fAbs, `${f.fRel.num}/${f.fRel.den}`, f.porcentaje]),
    [
      [3, 2, "1/5", 20],
      [5, 3, "3/10", 30],
      [8, 4, "2/5", 40],
      [10, 1, "1/10", 10],
    ],
  );
  const categorica = tablaFrecuencias(["rojo", "azul", "rojo", "verde"]);
  assert.deepEqual(categorica.map((f) => f.valor), ["rojo", "azul", "verde"]);
  assert.deepEqual(categorica[0].fRel, { num: 1, den: 2 });
  assert.equal(categorica[0].fRelDecimal, 0.5);
  assert.deepEqual(frecuenciaRelativa(7, 25), { num: 7, den: 25 });
  assert.throws(() => tablaFrecuencias([]), /al menos un dato/);
});

// ---------- sectores ----------

test("los ángulos de los sectores suman 360 y anguloSector es exacto", () => {
  assert.deepEqual(anguloSector(3, 8), { exacto: { num: 135, den: 1 }, grados: 135 });
  assert.deepEqual(anguloSector(7, 25).exacto, { num: 504, den: 5 });
  assert.equal(anguloSector(7, 25).grados, 100.8);
  for (const datos of TABLAS) {
    const angulos = angulosDeTabla(tablaFrecuencias(datos));
    assert.equal(sumaExacta(angulos), 360, `tabla de n = ${datos.length}`);
  }
  assert.throws(() => anguloSector(1, 0), /positivo/);
});

// ---------- promedio ----------

test("mediaDesdeTabla coincide con la media de los datos expandidos en tres tablas", () => {
  const casos: number[][] = [
    [3, 3, 5, 5, 5, 8, 8, 8, 8, 10],
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3],
    [12, 15, 15, 15, 20, 20, 25, 30],
  ];
  for (const datos of casos) {
    const tabla = tablaFrecuencias(datos);
    assert.equal(mediaDesdeTabla(tabla), media(datos));
  }
  assert.equal(mediaDesdeTabla(tablaFrecuencias([3, 3, 5, 5, 5, 8, 8, 8, 8, 10])), 6.3);
  // Promediar los valores distintos sin ponderar da otra cosa: (3 + 5 + 8 + 10) / 4.
  assert.notEqual(mediaDesdeTabla(tablaFrecuencias([3, 3, 5, 5, 5, 8, 8, 8, 8, 10])), 6.5);
});

test("mediaUnion pondera por n y no es el promedio de las medias cuando los n difieren", () => {
  const union = mediaUnion([
    { n: 10, media: 6 },
    { n: 30, media: 8 },
  ]);
  assert.equal(union, 7.5);
  assert.notEqual(union, (6 + 8) / 2);
  // Con n iguales sí coincide.
  assert.equal(mediaUnion([{ n: 12, media: 6 }, { n: 12, media: 8 }]), 7);
  assert.throws(() => mediaUnion([]), /positivo/);
});

test("datoFaltante devuelve el dato que completa el promedio objetivo", () => {
  const faltante = datoFaltante(7, [4, 9, 6, 8], 5);
  assert.equal(faltante, 8);
  assert.equal(media([4, 9, 6, 8, faltante]), 7);
  assert.throws(() => datoFaltante(7, [4, 9], 5), /datos conocidos/);
});

// ---------- mediana y cuartiles ----------

test("ordenar no muta y mediana promedia los dos centrales con n par", () => {
  const datos = [7, 1, 5, 3];
  assert.deepEqual(ordenar(datos), [1, 3, 5, 7]);
  assert.deepEqual(datos, [7, 1, 5, 3]);
  assert.equal(mediana([7, 1, 5, 3]), 4);
  assert.equal(mediana([7, 1, 5]), 5);
  assert.throws(() => mediana([]), /al menos un dato/);
});

test("cuartiles con n = 8, 9, 12 y 13, valores conocidos a mano", () => {
  assert.deepEqual(cuartiles([2, 4, 6, 8, 10, 12, 14, 16]), { q1: 5, q2: 9, q3: 13 });
  assert.deepEqual(cuartiles([1, 2, 3, 4, 5, 6, 7, 8, 9]), { q1: 2.5, q2: 5, q3: 7.5 });
  assert.deepEqual(cuartiles([3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]), { q1: 8, q2: 14, q3: 20 });
  assert.deepEqual(cuartiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]), { q1: 3.5, q2: 7, q3: 10.5 });
  // La entrada desordenada da lo mismo.
  assert.deepEqual(cuartiles([16, 2, 14, 4, 12, 6, 10, 8]), { q1: 5, q2: 9, q3: 13 });
  assert.throws(() => cuartiles([1, 2, 3]), /al menos 4/);
});

test("cuartilesIncluyendo coincide con n par y difiere con n impar (oráculo de diseño)", () => {
  assert.deepEqual(cuartilesIncluyendo([2, 4, 6, 8, 10, 12, 14, 16]), cuartiles([2, 4, 6, 8, 10, 12, 14, 16]));
  assert.deepEqual(cuartilesIncluyendo([3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]), { q1: 8, q2: 14, q3: 20 });
  assert.deepEqual(cuartilesIncluyendo([1, 2, 3, 4, 5, 6, 7, 8, 9]), { q1: 3, q2: 5, q3: 7 });
  assert.deepEqual(cuartilesIncluyendo([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]), { q1: 4, q2: 7, q3: 10 });
  assert.notDeepEqual(cuartilesIncluyendo([1, 2, 3, 4, 5, 6, 7, 8, 9]), cuartiles([1, 2, 3, 4, 5, 6, 7, 8, 9]));
});

// ---------- percentiles ----------

test("Q1 = P25, Q2 = P50 y Q3 = P75 con n múltiplo de 4, donde las dos convenciones de cuartil coinciden", () => {
  const casos: number[][] = [
    [2, 4, 6, 8, 10, 12, 14, 16],
    [3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25],
    Array.from({ length: 16 }, (_, i) => 10 + 3 * i),
    Array.from({ length: 20 }, (_, i) => 100 - 4 * i),
  ];
  for (const datos of casos) {
    const q = cuartiles(datos);
    assert.deepEqual(cuartilesIncluyendo(datos), q, `n = ${datos.length}`);
    assert.equal(percentil(datos, 25), q.q1, `P25 con n = ${datos.length}`);
    assert.equal(percentil(datos, 50), q.q2, `P50 con n = ${datos.length}`);
    assert.equal(percentil(datos, 75), q.q3, `P75 con n = ${datos.length}`);
  }
});

test("percentil promedia solo cuando k·n/100 es entero, y en los bordes da mínimo y máximo", () => {
  const datos = Array.from({ length: 16 }, (_, i) => 10 + 3 * i); // 10, 13, …, 55
  // k = 90: p = 14,4 → posición 15 → 52. Sin promedio.
  assert.equal(percentil(datos, 90), 52);
  assert.equal(percentilAlternativo(datos, 90), 52);
  // k = 75: p = 12 → promedio de las posiciones 12 y 13 → (43 + 46) / 2.
  assert.equal(percentil(datos, 75), 44.5);
  assert.equal(percentilAlternativo(datos, 75), 43);
  assert.equal(percentil(datos, 0), 10);
  assert.equal(percentil(datos, 100), 55);
  assert.equal(percentilAlternativo(datos, 0), 10);
  assert.equal(percentilAlternativo(datos, 100), 55);
  assert.throws(() => percentil(datos, 101), /\[0, 100\]/);
});

test("percentil de un dato: el máximo deja al 100 % de los datos bajo o igual a él", () => {
  const datos = [14, 9, 21, 9, 30, 17];
  assert.equal(porcentajeBajo(datos, 30), 100);
  assert.equal(porcentajeBajo(datos, 9), 100 / 3);
  assert.equal(porcentajeBajo(datos, 17), 200 / 3);
  assert.equal(porcentajeBajo(datos, 8), 0);
  assert.equal(percentil(datos, 100), 30);
});

// ---------- resumen de cinco números ----------

test("resumenCincoNumeros ordena aunque la entrada venga desordenada", () => {
  const desordenados = [25, 3, 19, 11, 7, 23, 15, 5, 21, 9, 17, 13];
  assert.deepEqual(resumenCincoNumeros(desordenados), { min: 3, q1: 8, mediana: 14, q3: 20, max: 25 });
  assert.equal(rangoIntercuartil(desordenados), 12);
  assert.equal(valorDe(racional(12, 4)), 3);
});

// ---------- cuadrícula y escalas ----------

test("pasoDeCuadricula elige 1, 2 o 5 por potencia de 10 para dejar entre 3 y 6 líneas", () => {
  assert.equal(pasoDeCuadricula(9), 2);
  assert.equal(pasoDeCuadricula(12), 2);
  assert.equal(pasoDeCuadricula(28), 5);
  assert.equal(pasoDeCuadricula(60), 10);
  assert.equal(pasoDeCuadricula(240), 50);
  assert.equal(pasoDeCuadricula(1000), 200);
  assert.equal(pasoDeCuadricula(5), 1);
});

test("escalaDeValores arranca en 0 salvo truncado, y siempre cubre el máximo con aire", () => {
  assert.deepEqual(escalaDeValores([12, 7, 20]), { min: 0, max: 25, paso: 5 });
  assert.deepEqual(escalaDeValores([48, 50, 52, 54]), { min: 0, max: 60, paso: 10 });
  // Truncada: arranca bajo el mínimo pero por encima de 0, cubre el máximo y
  // la cuadrícula queda legible (a lo más 8 líneas). Medido el 2026-09-13:
  // { min: 47, max: 55, paso: 1 }.
  const truncada = escalaDeValores([48, 50, 52, 54], true);
  assert.ok(truncada.min > 0 && truncada.min < 48);
  assert.ok(truncada.max > 54);
  assert.ok((truncada.max - truncada.min) / truncada.paso <= 8);
  assert.equal((truncada.max - truncada.min) % truncada.paso, 0);
});

test("escalaDeCajon cubre todos los valores, marcas incluidas, con margen", () => {
  const escala = escalaDeCajon({
    tipo: "diagramaCajon",
    ejeHorizontal: "minutos",
    cajones: [{ nombre: "A", min: 12, q1: 18, mediana: 22, q3: 27, max: 35 }],
    marcas: [{ valor: 40, rotulo: "tú" }],
  });
  assert.ok(escala.min < 12 && escala.max > 40);
  assert.equal((escala.max - escala.min) % escala.paso, 0);
});

// ---------- contrato de los bloques visuales ----------

const BARRAS = {
  tipo: "graficoBarras",
  categorias: ["Lunes", "Martes", "Miércoles"],
  series: [{ nombre: "Bicicletas", valores: [12, 7, 20] }],
  ejeVertical: "Bicicletas",
};

const LINEAS = {
  tipo: "graficoLineas",
  categorias: ["Enero", "Febrero", "Marzo", "Abril"],
  series: [
    { nombre: "Sede norte", valores: [40, 55, 50, 70] },
    { nombre: "Sede sur", valores: [30, 35, 45, 40] },
  ],
  ejeVertical: "Inscritos",
};

const CIRCULAR = {
  tipo: "graficoCircular",
  sectores: [
    { categoria: "Bus", porcentaje: 50 },
    { categoria: "A pie", porcentaje: 37.5 },
    { categoria: "Bicicleta", porcentaje: 12.5 },
  ],
  rotulo: "porcentaje",
};

const CAJON = {
  tipo: "diagramaCajon",
  ejeHorizontal: "Minutos",
  cajones: [
    { nombre: "Ruta A", min: 12, q1: 18, mediana: 22, q3: 27, max: 35 },
    { nombre: "Ruta B", min: 15, q1: 20, mediana: 21, q3: 24, max: 30, datos: [15, 18, 20, 20, 21, 21, 23, 24, 24, 30] },
  ],
  marcas: [{ valor: 33, rotulo: "hoy" }],
};

test("motivoRechazoDatosGrafico acepta los cuatro tipos bien formados", () => {
  for (const datos of [BARRAS, LINEAS, CIRCULAR, CAJON]) {
    assert.equal(motivoRechazoDatosGrafico(datos), null, datos.tipo);
  }
  assert.equal(motivoRechazoDatosGrafico({ ...BARRAS, ejeTruncado: true, ejemploEnganoso: true }), null);
});

test("barras y líneas: cada valor es número, una por categoría, y el eje truncado exige el marcado de ejemplo engañoso", () => {
  assert.match(motivoRechazoDatosGrafico({ ...BARRAS, ejeTruncado: true })!, /ejemploEnganoso/);
  assert.match(motivoRechazoDatosGrafico({ ...BARRAS, series: [{ nombre: "B", valores: [12, 7] }] })!, /un número por categoría/);
  assert.match(motivoRechazoDatosGrafico({ ...BARRAS, series: [{ nombre: "B", valores: [12, "7", 20] }] })!, /números/);
  assert.match(motivoRechazoDatosGrafico({ ...LINEAS, series: [] })!, /entre 1 y 2/);
  assert.match(motivoRechazoDatosGrafico({ ...LINEAS, ejeVertical: "" })!, /ejeVertical/);
  assert.match(motivoRechazoDatosGrafico({ ...BARRAS, categorias: ["Solo una"], series: [{ nombre: "B", valores: [1] }] })!, /categorias/);
});

test("circular: los porcentajes suman 100 exacto (o los ángulos 360), sin tolerancia", () => {
  assert.match(
    motivoRechazoDatosGrafico({ ...CIRCULAR, sectores: [{ categoria: "A", porcentaje: 50 }, { categoria: "B", porcentaje: 49.9 }] })!,
    /suman 99.9, no 100/,
  );
  assert.equal(
    motivoRechazoDatosGrafico({
      tipo: "graficoCircular",
      rotulo: "angulo",
      sectores: [{ categoria: "A", angulo: 135 }, { categoria: "B", angulo: 90 }, { categoria: "C", angulo: 135 }],
    }),
    null,
  );
  assert.match(
    motivoRechazoDatosGrafico({ tipo: "graficoCircular", rotulo: "angulo", sectores: [{ categoria: "A", angulo: 200 }, { categoria: "B", angulo: 170 }] })!,
    /suman 370, no 360/,
  );
  assert.match(motivoRechazoDatosGrafico({ ...CIRCULAR, rotulo: "angulo" })!, /angulo debe ser un número positivo/);
  assert.match(motivoRechazoDatosGrafico({ ...CIRCULAR, sectores: [CIRCULAR.sectores[0]] })!, /entre 2 y 6/);
});

test("cajón: orden de los cinco valores y coincidencia con los datos crudos", () => {
  const desordenado = { ...CAJON, cajones: [{ nombre: "A", min: 12, q1: 25, mediana: 22, q3: 27, max: 35 }] };
  assert.match(motivoRechazoDatosGrafico(desordenado)!, /min ≤ q1 ≤ mediana/);
  const mentiroso = {
    ...CAJON,
    cajones: [{ nombre: "B", min: 15, q1: 20, mediana: 22, q3: 24, max: 30, datos: CAJON.cajones[1].datos }],
  };
  assert.match(motivoRechazoDatosGrafico(mentiroso)!, /no coincide con el de los datos/);
  assert.match(motivoRechazoDatosGrafico({ ...CAJON, cajones: [] })!, /entre 1 y 2/);
  assert.match(motivoRechazoDatosGrafico({ ...CAJON, marcas: [{ valor: "33", rotulo: "hoy" }] })!, /marcas\[0\]/);
  assert.match(motivoRechazoDatosGrafico({ tipo: "histograma" })!, /tipo debe ser uno de/);
});

// ---------- el validador de contenido usa el mismo contrato ----------

test("npm run validar rechaza un bloque de datos mal formado con el motivo del contrato", () => {
  const pasos = [
    "curiosidad", "problema", "pensar", "pistas", "descubrimiento",
    "generalizacion", "practica", "aplicacion", "reflexion", "consolidacion",
  ].map((tipo) => ({ tipo, titulo: tipo, bloques: [{ tipo: "texto", contenido: "x" }] }));
  const malo = { ...CIRCULAR, sectores: [{ categoria: "A", porcentaje: 60 }, { categoria: "B", porcentaje: 30 }] };
  pasos[4].bloques.push({ tipo: "visualizacion", variante: "grafico", descripcion: "d", datos: malo } as never);
  const errores = validarDatos({ tipo: "leccion", pasos });
  assert.ok(errores.some((e) => /pasos\[4\]\.bloques\[1\]\.datos \(graficoCircular\): los porcentajes suman 90, no 100/.test(e)), errores.join("\n"));

  pasos[4].bloques[1] = { tipo: "visualizacion", variante: "grafico", descripcion: "d", datos: CIRCULAR } as never;
  assert.ok(!validarDatos({ tipo: "leccion", pasos }).some((e) => e.includes("graficoCircular")));
});
