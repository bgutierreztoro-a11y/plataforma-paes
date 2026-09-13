import test from "node:test";
import assert from "node:assert/strict";
import { validarDatos } from "../scripts/validar-contenido.mjs";
import {
  CERO,
  UNO,
  aDecimal,
  aPorcentaje,
  aTexto,
  comparar,
  complemento,
  contar,
  distintosEnValor,
  enOrdenCreciente,
  espacioDadoDoble,
  espacioProducto,
  frac,
  fraccionDesdeTexto,
  frecuenciaRelativa,
  hojasDelArbol,
  igual,
  interseccionIndependientes,
  laplace,
  mcd,
  motivoRechazoDatosProbabilidad,
  multiplicar,
  probAlMenosUno,
  probDesdeTabla,
  probEvento,
  probSecuencia,
  probUnionDesdeTabla,
  ramasArbol,
  ramasDesdeComposicion,
  restar,
  simplificar,
  sumar,
  sumarTodas,
  tablaDobleEntrada,
  union,
  unionExcluyentes,
} from "./probabilidad.ts";

// ---------- racionales ----------

test("simplificar reduce y normaliza el signo; frac rechaza denominador nulo y no enteros", () => {
  assert.deepEqual(simplificar({ num: 3, den: 6 }), { num: 1, den: 2 });
  assert.deepEqual(simplificar({ num: 4, den: -10 }), { num: -2, den: 5 });
  assert.deepEqual(frac(0, 7), { num: 0, den: 1 });
  assert.deepEqual(frac(12, 4), { num: 3, den: 1 });
  assert.equal(mcd(36, 24), 12);
  assert.equal(mcd(0, 5), 5);
  assert.throws(() => frac(1, 0), /denominador nulo/);
  assert.throws(() => frac(1.5, 2), /enteros/);
});

test("igual y comparar van por producto cruzado; aDecimal y aPorcentaje solo muestran", () => {
  assert.ok(igual(frac(3, 6), frac(1, 2)));
  assert.ok(!igual(frac(1, 3), frac(3, 10)));
  assert.equal(comparar(frac(1, 3), frac(3, 10)), 1);
  assert.equal(comparar(frac(3, 10), frac(1, 3)), -1);
  assert.equal(comparar(frac(2, 8), frac(1, 4)), 0);
  assert.equal(aDecimal(frac(3, 8)), 0.375);
  assert.equal(aPorcentaje(frac(3, 8)), 37.5);
  assert.equal(aTexto(frac(6, 16)), "3/8");
  assert.equal(aTexto(UNO), "1");
  assert.equal(aTexto(CERO), "0");
});

test("sumar, restar y multiplicar devuelven fracciones irreducibles", () => {
  assert.deepEqual(sumar(frac(1, 6), frac(1, 3)), { num: 1, den: 2 });
  assert.deepEqual(restar(frac(5, 6), frac(1, 3)), { num: 1, den: 2 });
  assert.deepEqual(multiplicar(frac(3, 8), frac(2, 7)), { num: 3, den: 28 });
  assert.deepEqual(sumarTodas([frac(1, 4), frac(1, 4), frac(1, 2)]), { num: 1, den: 1 });
});

test("fraccionDesdeTexto lee fracción, decimal con coma o punto, y porcentaje", () => {
  assert.deepEqual(fraccionDesdeTexto("3/8"), { num: 3, den: 8 });
  assert.deepEqual(fraccionDesdeTexto("6/16"), { num: 3, den: 8 });
  assert.deepEqual(fraccionDesdeTexto("0,375"), { num: 3, den: 8 });
  assert.deepEqual(fraccionDesdeTexto("0.25"), { num: 1, den: 4 });
  assert.deepEqual(fraccionDesdeTexto("25 %"), { num: 1, den: 4 });
  assert.deepEqual(fraccionDesdeTexto("12,5%"), { num: 1, den: 8 });
  assert.deepEqual(fraccionDesdeTexto("1"), { num: 1, den: 1 });
  assert.deepEqual(fraccionDesdeTexto("0"), { num: 0, den: 1 });
  assert.equal(fraccionDesdeTexto("3 de 8"), null);
  assert.equal(fraccionDesdeTexto("1/0"), null);
  assert.equal(fraccionDesdeTexto(""), null);
});

// ---------- Laplace y complemento ----------

test("laplace sobre una partición del espacio suma exactamente 1", () => {
  const espacio = espacioDadoDoble();
  assert.equal(espacio.length, 36);
  // Partición por la suma de los dos dados: 2, 3, ..., 12.
  const porSuma = Array.from({ length: 11 }, (_, k) => probEvento(espacio, ([a, b]) => a + b === k + 2));
  assert.ok(igual(sumarTodas(porSuma), UNO));
  assert.deepEqual(porSuma[5], { num: 1, den: 6 }); // suma 7
  assert.deepEqual(laplace(6, 36), { num: 1, den: 6 });
  assert.throws(() => laplace(7, 6), /entre 0 y 6/);
  assert.throws(() => laplace(1, 0), /positivos/);
});

test("complemento(complemento(p)) = p y probAlMenosUno es el complemento de ninguno", () => {
  for (const p of [frac(3, 8), frac(1, 6), CERO, UNO, frac(5, 12)]) {
    assert.ok(igual(complemento(complemento(p)), p), aTexto(p));
  }
  assert.deepEqual(complemento(frac(3, 8)), { num: 5, den: 8 });
  assert.deepEqual(probAlMenosUno(frac(9, 16)), { num: 7, den: 16 });
  assert.throws(() => complemento(frac(5, 4)), /entre 0 y 1/);
});

// ---------- espacio producto y regla aditiva ----------

test("espacioProducto enumera todos los pares en orden y contar cuenta", () => {
  const pares = espacioProducto(["cara", "sello"], [1, 2, 3]);
  assert.equal(pares.length, 6);
  assert.deepEqual(pares[0], ["cara", 1]);
  assert.deepEqual(pares[5], ["sello", 3]);
  assert.equal(contar(pares, ([lado, n]) => lado === "cara" && n > 1), 2);
});

test("union desde la fórmula coincide con probEvento por enumeración en tres casos no excluyentes", () => {
  const dados = espacioDadoDoble();
  const casos: [(p: [number, number]) => boolean, (p: [number, number]) => boolean][] = [
    // suma par / al menos un 6
    [([a, b]) => (a + b) % 2 === 0, ([a, b]) => a === 6 || b === 6],
    // primero mayor que 4 / segundo mayor que 4
    [([a]) => a > 4, ([, b]) => b > 4],
    // suma 7 o 11 / algún dado muestra 5
    [([a, b]) => a + b === 7 || a + b === 11, ([a, b]) => a === 5 || b === 5],
  ];
  for (const [A, B] of casos) {
    const pA = probEvento(dados, A);
    const pB = probEvento(dados, B);
    const pAB = probEvento(dados, (p) => A(p) && B(p));
    assert.notDeepEqual(pAB, CERO, "el caso debe ser no excluyente");
    const porFormula = union(pA, pB, pAB);
    const porEnumeracion = probEvento(dados, (p) => A(p) || B(p));
    assert.ok(igual(porFormula, porEnumeracion), `${aTexto(porFormula)} ≠ ${aTexto(porEnumeracion)}`);
    // Sumar sin restar la intersección se pasa exactamente en P(A y B).
    assert.ok(igual(restar(sumar(pA, pB), porEnumeracion), pAB));
  }
});

test("unionExcluyentes = union con pAB = 0, y rechaza sumas mayores que 1", () => {
  const dados = espacioDadoDoble();
  const pA = probEvento(dados, ([a, b]) => a + b === 7);
  const pB = probEvento(dados, ([a, b]) => a + b === 11);
  assert.ok(igual(unionExcluyentes(pA, pB), union(pA, pB, CERO)));
  assert.deepEqual(unionExcluyentes(pA, pB), { num: 2, den: 9 });
  assert.throws(() => unionExcluyentes(frac(3, 4), frac(1, 2)), /supera 1/);
});

// ---------- regla multiplicativa ----------

test("interseccionIndependientes coincide con probEvento sobre espacioProducto en tres casos", () => {
  const casos: { A: readonly string[]; B: readonly number[]; enA: (a: string) => boolean; enB: (b: number) => boolean }[] = [
    { A: ["cara", "sello"], B: [1, 2, 3, 4, 5, 6], enA: (a) => a === "cara", enB: (b) => b >= 5 },
    { A: ["rojo", "verde", "amarillo"], B: [0, 1, 2, 3], enA: (a) => a !== "rojo", enB: (b) => b === 0 },
    { A: ["a", "b", "c", "d", "e"], B: [1, 2, 3], enA: (a) => a < "c", enB: (b) => b !== 2 },
  ];
  for (const { A, B, enA, enB } of casos) {
    const pA = laplace(A.filter(enA).length, A.length);
    const pB = laplace(B.filter(enB).length, B.length);
    const porFormula = interseccionIndependientes(pA, pB);
    const porEnumeracion = probEvento(espacioProducto(A, B), ([a, b]) => enA(a) && enB(b));
    assert.ok(igual(porFormula, porEnumeracion), `${aTexto(porFormula)} ≠ ${aTexto(porEnumeracion)}`);
  }
});

const ARBOLES: [Record<string, number>, number, boolean][] = [
  [{ roja: 3, azul: 5 }, 2, true],
  [{ roja: 3, azul: 5 }, 2, false],
  [{ roja: 2, verde: 3, blanca: 1 }, 3, true],
  [{ roja: 2, verde: 3, blanca: 1 }, 3, false],
];

test("la suma de las probabilidades de todas las ramas es 1 en cuatro árboles (con y sin reposición, 2 y 3 etapas)", () => {
  for (const [composicion, etapas, reposicion] of ARBOLES) {
    const hojas = ramasArbol(composicion, etapas, reposicion);
    assert.ok(igual(sumarTodas(hojas.map((h) => h.prob)), UNO), JSON.stringify([composicion, etapas, reposicion]));
    assert.ok(hojas.every((h) => h.camino.length === etapas));
  }
  // Sin reposición, el denominador de la segunda etapa baja en uno.
  const sin = ramasArbol({ roja: 3, azul: 5 }, 2, false);
  assert.deepEqual(sin.find((h) => h.camino.join("-") === "roja-roja")!.prob, { num: 3, den: 28 }); // 3/8 · 2/7
  const con = ramasArbol({ roja: 3, azul: 5 }, 2, true);
  assert.deepEqual(con.find((h) => h.camino.join("-") === "roja-roja")!.prob, { num: 9, den: 64 }); // 3/8 · 3/8
  // Una clase con un solo objeto desaparece en la segunda etapa sin reposición.
  const agotada = ramasArbol({ roja: 1, azul: 2 }, 2, false);
  assert.equal(agotada.filter((h) => h.camino.join("-") === "roja-roja").length, 0);
  assert.throws(() => ramasArbol({ roja: 1 }, 2, false), /sin reposición/);
});

test("probSecuencia sin reposición: 'una de cada' sumando los dos órdenes coincide con las ramas correspondientes", () => {
  const composicion = { roja: 3, azul: 5 };
  const hojas = ramasArbol(composicion, 2, false);
  const unaDeCada = sumarTodas(hojas.filter((h) => h.camino[0] !== h.camino[1]).map((h) => h.prob));
  const porSecuencias = sumar(probSecuencia(composicion, ["roja", "azul"], false), probSecuencia(composicion, ["azul", "roja"], false));
  assert.ok(igual(unaDeCada, porSecuencias));
  assert.deepEqual(porSecuencias, { num: 15, den: 28 }); // 2 · (3/8 · 5/7)
  // Olvidar el orden simétrico deja la mitad.
  assert.deepEqual(probSecuencia(composicion, ["roja", "azul"], false), { num: 15, den: 56 });
  // Con reposición el segundo factor no cambia.
  assert.deepEqual(probSecuencia(composicion, ["roja", "roja"], true), { num: 9, den: 64 });
  assert.deepEqual(probSecuencia({ roja: 1, azul: 2 }, ["roja", "roja"], false), CERO);
  assert.throws(() => probSecuencia(composicion, ["verde"], false), /no está en la composición/);
});

// ---------- tabla de doble entrada ----------

test("tablaDobleEntrada: los totales cuadran y probDesdeTabla lee celda, fila y columna", () => {
  const tabla = tablaDobleEntrada([
    [6, 9],
    [10, 5],
  ]);
  assert.deepEqual(tabla.totalesFila, [15, 15]);
  assert.deepEqual(tabla.totalesColumna, [16, 14]);
  assert.equal(tabla.total, 30);
  assert.equal(tabla.totalesFila.reduce((s, n) => s + n, 0), tabla.total);
  assert.equal(tabla.totalesColumna.reduce((s, n) => s + n, 0), tabla.total);
  assert.deepEqual(probDesdeTabla(tabla, { fila: 0, columna: 1 }), { num: 3, den: 10 });
  assert.deepEqual(probDesdeTabla(tabla, { fila: 1 }), { num: 1, den: 2 });
  assert.deepEqual(probDesdeTabla(tabla, { columna: 0 }), { num: 8, den: 15 });
  assert.deepEqual(probDesdeTabla(tabla, {}), UNO);
  // P(fila 0 o columna 0) = (15 + 16 − 6) / 30, igual que la fórmula de la unión.
  const pU = probUnionDesdeTabla(tabla, 0, 0);
  assert.deepEqual(pU, { num: 5, den: 6 });
  assert.ok(igual(pU, union(probDesdeTabla(tabla, { fila: 0 }), probDesdeTabla(tabla, { columna: 0 }), probDesdeTabla(tabla, { fila: 0, columna: 0 }))));
  assert.throws(() => tablaDobleEntrada([[1, 2], [3]]), /misma cantidad/);
  assert.throws(() => probDesdeTabla(tabla, { fila: 2 }), /fuera de la tabla/);
});

// ---------- frecuencial y alternativas ----------

test("frecuenciaRelativa es una fracción reducida; distintosEnValor y enOrdenCreciente comparan por valor", () => {
  assert.deepEqual(frecuenciaRelativa(18, 60), { num: 3, den: 10 });
  assert.ok(!distintosEnValor([frac(3, 6), frac(1, 4), frac(1, 2), frac(3, 4)]));
  assert.ok(distintosEnValor([frac(1, 6), frac(1, 4), frac(1, 2), frac(3, 4)]));
  assert.ok(enOrdenCreciente([frac(1, 6), frac(1, 4), frac(1, 2), frac(3, 4)]));
  assert.ok(!enOrdenCreciente([frac(1, 4), frac(1, 6), frac(1, 2)]));
  assert.ok(!enOrdenCreciente([frac(1, 4), frac(2, 8)]));
});

// ---------- contrato de los bloques visuales ----------

const ARBOL = {
  tipo: "diagramaArbol",
  etapas: ["Primera", "Segunda"],
  ramas: [
    {
      resultado: "Roja",
      probabilidad: "3/8",
      ramas: [
        { resultado: "Roja", probabilidad: "2/7", id: "RR", probabilidadCamino: "3/28" },
        { resultado: "Azul", probabilidad: "5/7", id: "RA", probabilidadCamino: "15/56" },
      ],
    },
    {
      resultado: "Azul",
      probabilidad: "5/8",
      ramas: [
        { resultado: "Roja", probabilidad: "3/7", id: "AR", probabilidadCamino: "15/56" },
        { resultado: "Azul", probabilidad: "4/7", id: "AA", probabilidadCamino: "5/14" },
      ],
    },
  ],
  resaltar: ["RA", "AR"],
};

const CUADRICULA = {
  tipo: "cuadriculaEspacioMuestral",
  filas: ["1", "2", "3", "4", "5", "6"],
  columnas: ["1", "2", "3", "4", "5", "6"],
  rotuloFilas: "Primer dado",
  rotuloColumnas: "Segundo dado",
  marcadas: [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0]],
  contador: { marcadas: 6, total: 36 },
  rotuloEvento: "Suma 7",
};

test("motivoRechazoDatosProbabilidad acepta el árbol y la cuadrícula bien formados", () => {
  assert.equal(motivoRechazoDatosProbabilidad(ARBOL), null);
  assert.equal(motivoRechazoDatosProbabilidad(CUADRICULA), null);
  assert.equal(motivoRechazoDatosProbabilidad({ ...CUADRICULA, marcadas: undefined, contador: undefined }), null);
  assert.equal(motivoRechazoDatosProbabilidad({ tipo: "diagramaArbol", etapas: ["Única"], ramas: [{ resultado: "Cara", probabilidad: "1/2" }, { resultado: "Sello", probabilidad: "1/2" }] }), null);
  assert.equal(hojasDelArbol(ARBOL.ramas).length, 4);
});

test("árbol: las ramas hermanas suman exactamente 1, la hoja lleva el producto del camino, y la profundidad es la declarada", () => {
  const hermanasMal = { ...ARBOL, ramas: [{ ...ARBOL.ramas[0], probabilidad: "1/2" }, ARBOL.ramas[1]] };
  assert.match(motivoRechazoDatosProbabilidad(hermanasMal)!, /suman 9\/8, no 1/);
  const productoMal = {
    ...ARBOL,
    ramas: [
      { ...ARBOL.ramas[0], ramas: [{ ...ARBOL.ramas[0].ramas[0], probabilidadCamino: "6/56" }, ARBOL.ramas[0].ramas[1]] },
      ARBOL.ramas[1],
    ],
  };
  assert.equal(motivoRechazoDatosProbabilidad(productoMal), null, "6/56 es 3/28: se compara por valor");
  const productoMal2 = {
    ...ARBOL,
    ramas: [
      { ...ARBOL.ramas[0], ramas: [{ ...ARBOL.ramas[0].ramas[0], probabilidadCamino: "9/64" }, ARBOL.ramas[0].ramas[1]] },
      ARBOL.ramas[1],
    ],
  };
  assert.match(motivoRechazoDatosProbabilidad(productoMal2)!, /no es el producto de las ramas del camino \(3\/28\)/);
  assert.match(motivoRechazoDatosProbabilidad({ ...ARBOL, etapas: ["Una", "Dos", "Tres"] })!, /le faltan ramas/);
  assert.match(motivoRechazoDatosProbabilidad({ ...ARBOL, etapas: ["Una"] })!, /más allá de la etapa 1/);
  assert.match(motivoRechazoDatosProbabilidad({ ...ARBOL, resaltar: ["ZZ"] })!, /no es el id de ninguna hoja/);
  assert.match(motivoRechazoDatosProbabilidad({ ...ARBOL, ramas: [{ ...ARBOL.ramas[0], probabilidad: "tres octavos" }, ARBOL.ramas[1]] })!, /no es una probabilidad/);
  assert.match(motivoRechazoDatosProbabilidad({ tipo: "diagramaArbol", etapas: [], ramas: [] })!, /etapas debe tener/);
  assert.match(motivoRechazoDatosProbabilidad({ tipo: "histograma" })!, /tipo debe ser uno de/);
});

test("cuadrícula: celdas marcadas dentro de filas × columnas, sin repetir, y el contador coincide", () => {
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, marcadas: [[0, 6]], contador: undefined })!, /cae fuera/);
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, marcadas: [[0, 1], [0, 1]], contador: undefined })!, /repetida/);
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, contador: { marcadas: 5, total: 36 } })!, /contador.marcadas = 5 pero hay 6/);
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, contador: { marcadas: 6, total: 30 } })!, /contador.total = 30/);
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, filas: ["1"] })!, /entre 2 y 6/);
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, columnas: ["a", "a"] })!, /repetidos/);
  assert.match(motivoRechazoDatosProbabilidad({ ...CUADRICULA, celdas: [["x"]] })!, /celdas debe tener exactamente 6 filas/);
  assert.equal(
    motivoRechazoDatosProbabilidad({ ...CUADRICULA, filas: ["Cara", "Sello"], columnas: ["Cara", "Sello"], marcadas: [[0, 0]], contador: { marcadas: 1, total: 4 }, celdas: [["CC", "CS"], ["SC", "SS"]] }),
    null,
  );
});

test("ramasDesdeComposicion produce un árbol que el contrato acepta, con y sin reposición, mientras quepa en 12 hojas", () => {
  const dibujables: [Record<string, number>, number, boolean][] = [
    [{ roja: 3, azul: 5 }, 2, true],
    [{ roja: 3, azul: 5 }, 2, false],
    [{ roja: 2, azul: 4 }, 3, true],
    [{ roja: 2, azul: 4 }, 3, false],
    [{ roja: 2, verde: 3, blanca: 1 }, 2, false],
  ];
  for (const [composicion, etapas, reposicion] of dibujables) {
    const ramas = ramasDesdeComposicion(composicion, etapas, reposicion);
    const datos = { tipo: "diagramaArbol", etapas: Array.from({ length: etapas }, (_, i) => `Etapa ${i + 1}`), ramas };
    assert.equal(motivoRechazoDatosProbabilidad(datos), null, JSON.stringify([composicion, etapas, reposicion]));
    const hojas = hojasDelArbol(ramas);
    assert.ok(igual(sumarTodas(hojas.map((h) => fraccionDesdeTexto(h.probabilidadCamino!)!)), UNO));
  }
  // Tres clases en tres etapas son 27 hojas: el contrato lo rechaza por legibilidad, aunque las ramas sean correctas.
  const grande = ramasDesdeComposicion({ roja: 2, verde: 3, blanca: 1 }, 3, true);
  assert.match(motivoRechazoDatosProbabilidad({ tipo: "diagramaArbol", etapas: ["1", "2", "3"], ramas: grande })!, /27 hojas/);
  const sin = ramasDesdeComposicion({ roja: 3, azul: 5 }, 2, false, { roja: "Roja", azul: "Azul" });
  assert.equal(sin[0].resultado, "Roja");
  assert.equal(sin[0].ramas![0].probabilidad, "2/7");
  assert.equal(sin[0].ramas![0].id, "roja-roja");
  assert.equal(sin[0].ramas![0].probabilidadCamino, "3/28");
});

// ---------- el validador de contenido usa el mismo contrato ----------

test("npm run validar rechaza un árbol cuyas ramas hermanas no suman 1 y una cuadrícula con el contador mal", () => {
  const pasos = [
    "curiosidad", "problema", "pensar", "pistas", "descubrimiento",
    "generalizacion", "practica", "aplicacion", "reflexion", "consolidacion",
  ].map((tipo) => ({ tipo, titulo: tipo, bloques: [{ tipo: "texto", contenido: "x" }] }));
  const arbolMalo = { ...ARBOL, ramas: [{ ...ARBOL.ramas[0], probabilidad: "1/2" }, ARBOL.ramas[1]] };
  pasos[4].bloques.push({ tipo: "visualizacion", variante: "diagrama", descripcion: "d", datos: arbolMalo } as never);
  pasos[5].bloques.push({ tipo: "visualizacion", variante: "grafico", descripcion: "d", datos: { ...CUADRICULA, contador: { marcadas: 5, total: 36 } } } as never);
  const errores = validarDatos({ tipo: "leccion", pasos });
  assert.ok(errores.some((e) => /pasos\[4\]\.bloques\[1\]\.datos \(diagramaArbol\): ramas: las ramas hermanas suman 9\/8, no 1/.test(e)), errores.join("\n"));
  assert.ok(errores.some((e) => /pasos\[5\]\.bloques\[1\]\.datos \(cuadriculaEspacioMuestral\): contador\.marcadas = 5/.test(e)), errores.join("\n"));

  pasos[4].bloques[1] = { tipo: "visualizacion", variante: "diagrama", descripcion: "d", datos: ARBOL } as never;
  pasos[5].bloques[1] = { tipo: "visualizacion", variante: "grafico", descripcion: "d", datos: CUADRICULA } as never;
  assert.ok(!validarDatos({ tipo: "leccion", pasos }).some((e) => e.includes("diagramaArbol") || e.includes("cuadriculaEspacioMuestral")));
});
