import test from "node:test";
import assert from "node:assert/strict";
import {
  CELDA_MINIMA_PX,
  areaConSigno,
  celdaEnPantalla,
  componer,
  distancia,
  esPuntoEntero,
  figurasDeEscena,
  motivoRechazoDatosTransformacion,
  motivoRechazoTransformacion,
  rangoEscena,
  ponderarVector,
  reflejar,
  restarVectores,
  rotar,
  sumarVectores,
  trasladar,
  vectorEntre,
  type Poligono,
  type Punto,
  type Transformacion,
} from "./transformacionesIsometricas.ts";

/* Tres polígonos fijos, ninguno simétrico, para que una transformación que
   deforme se note: un triángulo escaleno, un cuadrilátero irregular y un
   pentágono con un vértice fuera de los ejes. */
const TRIANGULO: Poligono = [[1, 1], [5, 2], [2, 4]];
const CUADRILATERO: Poligono = [[-3, -1], [2, -2], [3, 3], [-1, 2]];
const PENTAGONO: Poligono = [[0, 0], [4, 1], [5, 4], [2, 6], [-2, 3]];
const FIGURAS = [TRIANGULO, CUADRILATERO, PENTAGONO];

const ROTACIONES: Transformacion[] = [
  { tipo: "rotacion", grados: 90, sentido: "antihorario" },
  { tipo: "rotacion", grados: 90, sentido: "horario" },
  { tipo: "rotacion", grados: 180, sentido: "antihorario" },
  { tipo: "rotacion", grados: 270, sentido: "horario", centro: [2, -1] },
];
const REFLEXIONES: Transformacion[] = [
  { tipo: "reflexion", eje: "x" },
  { tipo: "reflexion", eje: "y" },
  { tipo: "reflexion", eje: "origen" },
  { tipo: "reflexion", eje: { vertical: 3 } },
  { tipo: "reflexion", eje: { horizontal: -2 } },
];
const TRASLACIONES: Transformacion[] = [{ tipo: "traslacion", vector: [3, -4] }];
const TODAS = [...ROTACIONES, ...REFLEXIONES, ...TRASLACIONES];

function ladosDe(fig: Poligono): number[] {
  return fig.map((p, i) => distancia(p, fig[(i + 1) % fig.length]));
}

// ---------- vectores ----------

test("sumar, restar y ponderar operan componente a componente", () => {
  assert.deepEqual(sumarVectores([3, -2], [-1, 5]), [2, 3]);
  assert.deepEqual(restarVectores([3, -2], [-1, 5]), [4, -7]);
  assert.deepEqual(ponderarVector(3, [2, -1]), [6, -3]);
  assert.deepEqual(ponderarVector(-2, [2, -1]), [-4, 2]);
});

test("vectorEntre(A, B) es B menos A, y trasladar A por él llega a B", () => {
  const a: Punto = [-2, 5];
  const b: Punto = [4, 1];
  const v = vectorEntre(a, b);
  assert.deepEqual(v, [6, -4]);
  assert.deepEqual(trasladar([a], v), [b]);
  // El vector contrario es el que lleva de B a A: A menos B, no B menos A.
  assert.deepEqual(vectorEntre(b, a), ponderarVector(-1, v));
});

test("el mismo desplazamiento desde distintos orígenes da el mismo vector", () => {
  const v: Punto = [2, -3];
  for (const origen of [[0, 0], [5, 5], [-4, 1]] as Punto[]) {
    const destino = sumarVectores(origen, v);
    assert.deepEqual(vectorEntre(origen, destino), v);
  }
});

test("distancia entre puntos: tríos pitagóricos exactos y simetría", () => {
  assert.equal(distancia([0, 0], [3, 4]), 5);
  assert.equal(distancia([1, 2], [6, 14]), 13);
  assert.equal(distancia([-2, -3], [6, 12]), 17);
  assert.equal(distancia([4, 1], [-2, -7]), distancia([-2, -7], [4, 1]));
});

// ---------- identidades ----------

test("rotar 90 grados cuatro veces es la identidad, en los dos sentidos y con centro", () => {
  for (const fig of FIGURAS) {
    for (const sentido of ["antihorario", "horario"] as const) {
      for (const centro of [undefined, [3, -2] as Punto]) {
        let actual = fig;
        for (let i = 0; i < 4; i++) actual = rotar(actual, { grados: 90, sentido, centro });
        assert.deepEqual(actual, fig);
      }
    }
  }
});

test("reflejar dos veces respecto del mismo eje es la identidad", () => {
  for (const fig of FIGURAS) {
    for (const r of REFLEXIONES) {
      if (r.tipo !== "reflexion") continue;
      assert.deepEqual(reflejar(reflejar(fig, r), r), fig);
    }
  }
});

test("reflejar en el eje x y luego en el eje y equivale a rotar 180 grados", () => {
  for (const fig of FIGURAS) {
    const dosReflexiones = reflejar(reflejar(fig, { eje: "x" }), { eje: "y" });
    assert.deepEqual(dosReflexiones, rotar(fig, { grados: 180, sentido: "antihorario" }));
    assert.deepEqual(dosReflexiones, reflejar(fig, { eje: "origen" }));
  }
});

test("horario y antihorario son inversas, y 180 grados no distingue sentido", () => {
  for (const fig of FIGURAS) {
    for (const grados of [90, 180, 270] as const) {
      const ida = rotar(fig, { grados, sentido: "antihorario" });
      assert.deepEqual(rotar(ida, { grados, sentido: "horario" }), fig);
    }
    assert.deepEqual(
      rotar(fig, { grados: 180, sentido: "horario" }),
      rotar(fig, { grados: 180, sentido: "antihorario" }),
    );
    // 270 antihorario es 90 horario.
    assert.deepEqual(
      rotar(fig, { grados: 270, sentido: "antihorario" }),
      rotar(fig, { grados: 90, sentido: "horario" }),
    );
  }
});

test("las reglas de coordenadas de la rotación en torno al origen", () => {
  assert.deepEqual(rotar([[3, 1]], { grados: 90, sentido: "antihorario" }), [[-1, 3]]);
  assert.deepEqual(rotar([[3, 1]], { grados: 90, sentido: "horario" }), [[1, -3]]);
  assert.deepEqual(rotar([[3, 1]], { grados: 180, sentido: "antihorario" }), [[-3, -1]]);
  assert.deepEqual(rotar([[3, 1]], { grados: 270, sentido: "antihorario" }), [[1, -3]]);
});

test("rotar en torno a otro centro deja fijo al centro", () => {
  const centro: Punto = [2, -1];
  assert.deepEqual(rotar([centro], { grados: 90, sentido: "horario", centro }), [centro]);
  assert.deepEqual(rotar([[4, -1]], { grados: 90, sentido: "antihorario", centro }), [[2, 1]]);
});

test("las reglas de coordenadas de la reflexión", () => {
  assert.deepEqual(reflejar([[3, -2]], { eje: "x" }), [[3, 2]]);
  assert.deepEqual(reflejar([[3, -2]], { eje: "y" }), [[-3, -2]]);
  assert.deepEqual(reflejar([[3, -2]], { eje: "origen" }), [[-3, 2]]);
  assert.deepEqual(reflejar([[3, -2]], { eje: { vertical: 1 } }), [[-1, -2]]);
  assert.deepEqual(reflejar([[3, -2]], { eje: { horizontal: 2 } }), [[3, 6]]);
  // Un punto sobre el eje queda fijo.
  assert.deepEqual(reflejar([[1, 7]], { eje: { vertical: 1 } }), [[1, 7]]);
});

// ---------- propiedades de isometría ----------

test("entradas enteras dan salidas enteras bajo cada transformación", () => {
  for (const fig of FIGURAS) {
    for (const t of TODAS) {
      for (const p of componer(fig, [t])) assert.ok(esPuntoEntero(p), `${JSON.stringify(t)} da ${p}`);
    }
  }
});

test("cada transformación conserva las distancias entre vértices", () => {
  for (const fig of FIGURAS) {
    for (const t of TODAS) {
      const imagen = componer(fig, [t]);
      assert.deepEqual(ladosDe(imagen), ladosDe(fig), JSON.stringify(t));
      // También la diagonal, que no es un lado: la figura no se cizalla.
      assert.equal(distancia(imagen[0], imagen[2]), distancia(fig[0], fig[2]));
    }
  }
});

test("cada transformación conserva el área; la reflexión invierte la orientación", () => {
  for (const fig of FIGURAS) {
    const area = areaConSigno(fig);
    for (const t of TODAS) {
      const areaImagen = areaConSigno(componer(fig, [t]));
      assert.equal(Math.abs(areaImagen), Math.abs(area), JSON.stringify(t));
      const invierte = t.tipo === "reflexion" && t.eje !== "origen";
      assert.equal(Math.sign(areaImagen), invierte ? -Math.sign(area) : Math.sign(area), JSON.stringify(t));
    }
  }
});

test("componer respeta el orden: trasladar y luego reflejar no es reflejar y luego trasladar", () => {
  const fig = TRIANGULO;
  const t: Transformacion = { tipo: "traslacion", vector: [4, 0] };
  const r: Transformacion = { tipo: "reflexion", eje: "y" };
  const trasladaYRefleja = componer(fig, [t, r]);
  const reflejaYTraslada = componer(fig, [r, t]);
  assert.deepEqual(trasladaYRefleja, reflejar(trasladar(fig, [4, 0]), { eje: "y" }));
  assert.deepEqual(reflejaYTraslada, trasladar(reflejar(fig, { eje: "y" }), [4, 0]));
  assert.notDeepEqual(trasladaYRefleja, reflejaYTraslada);
  // La composición vacía es la identidad.
  assert.deepEqual(componer(fig, []), fig);
});

test("dos traslaciones seguidas equivalen a trasladar por la suma de los vectores", () => {
  for (const fig of FIGURAS) {
    const compuesta = componer(fig, [
      { tipo: "traslacion", vector: [3, -1] },
      { tipo: "traslacion", vector: [-5, 4] },
    ]);
    assert.deepEqual(compuesta, trasladar(fig, sumarVectores([3, -1], [-5, 4])));
  }
});

// ---------- contrato de contenido ----------

test("motivoRechazoTransformacion acepta lo válido y nombra lo inválido", () => {
  for (const t of TODAS) assert.equal(motivoRechazoTransformacion(t), null, JSON.stringify(t));
  assert.match(motivoRechazoTransformacion({ tipo: "rotacion", grados: 45, sentido: "horario" })!, /90, 180 o 270/);
  assert.match(motivoRechazoTransformacion({ tipo: "rotacion", grados: 90, sentido: "reloj" })!, /sentido/);
  assert.match(motivoRechazoTransformacion({ tipo: "traslacion", vector: [1.5, 2] })!, /enteros/);
  assert.match(motivoRechazoTransformacion({ tipo: "reflexion", eje: "diagonal" })!, /eje/);
  assert.match(motivoRechazoTransformacion({ tipo: "reflexion", eje: { vertical: 2, horizontal: 1 } })!, /eje/);
  assert.match(motivoRechazoTransformacion({ tipo: "escala" })!, /tipo/);
  assert.match(motivoRechazoTransformacion(null)!, /objeto/);
});

// ---------- contrato del bloque { tipo: "transformacion" } ----------

test("motivoRechazoDatosTransformacion acepta una escena legible y devuelve sus figuras", () => {
  const datos = {
    tipo: "transformacion" as const,
    figura: [[1, 1], [4, 1], [2, 3]] as Punto[],
    transformaciones: [{ tipo: "rotacion", grados: 90, sentido: "horario" }] as Transformacion[],
  };
  assert.equal(motivoRechazoDatosTransformacion(datos), null);
  const figuras = figurasDeEscena(datos);
  assert.equal(figuras.length, 2);
  assert.deepEqual(figuras[1], rotar(datos.figura, { grados: 90, sentido: "horario" }));
});

test("la escena se rechaza cuando una imagen se sale del plano o las celdas quedan ilegibles", () => {
  assert.match(
    motivoRechazoDatosTransformacion({
      tipo: "transformacion",
      figura: [[9, 9]],
      transformaciones: [{ tipo: "traslacion", vector: [3, 0] }],
    })!,
    /se sale/,
  );
  // De (−10, −10) a (10, 10) con margen 1 son 22 celdas: justo en el límite, se acepta.
  assert.equal(
    motivoRechazoDatosTransformacion({
      tipo: "transformacion",
      figura: [[-10, -10], [10, 10]],
      transformaciones: [],
    }),
    null,
  );
  assert.ok(celdaEnPantalla(rangoEscena([[-10, -10], [10, 10]])) >= CELDA_MINIMA_PX);
});

test("la escena se rechaza por forma: puntos no enteros, rótulos de más, trazo desconocido", () => {
  const base = { tipo: "transformacion", figura: [[1, 1], [3, 1], [2, 2]], transformaciones: [] };
  assert.match(motivoRechazoDatosTransformacion({ ...base, figura: [[1.5, 1]] })!, /enteros/);
  assert.match(motivoRechazoDatosTransformacion({ ...base, rotulos: ["A", "B"] })!, /rotulos/);
  assert.match(motivoRechazoDatosTransformacion({ ...base, trazo: "lineas" })!, /trazo/);
  assert.match(motivoRechazoDatosTransformacion({ ...base, figura: [[1, 1], [1, 1], [2, 2]] })!, /repetidos/);
  assert.match(motivoRechazoDatosTransformacion({ ...base, transformaciones: [{ tipo: "rotacion", grados: 45, sentido: "horario" }] })!, /transformaciones\[0\]/);
  assert.match(motivoRechazoDatosTransformacion({ tipo: "semejanza" })!, /tipo/);
});

test("rangoEscena es cuadrado, contiene el origen y deja el margen pedido", () => {
  const rango = rangoEscena([[2, 3], [6, 3], [4, 5]]);
  assert.equal(rango.xMax - rango.xMin, rango.yMax - rango.yMin);
  assert.ok(rango.xMin <= 0 && rango.yMin <= 0);
  assert.ok(rango.xMax >= 7 && rango.yMax >= 6);
  for (const r of [rangoEscena([[-3, 8]]), rangoEscena([[7, -2], [1, 1]])]) {
    assert.equal(r.xMax - r.xMin, r.yMax - r.yMin);
  }
});
