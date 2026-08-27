import test from "node:test";
import assert from "node:assert/strict";
import { escalarPuntosAViewBox, type Punto } from "./figurasGeometricas.ts";
import {
  ARISTA_MINIMA_PX,
  ARISTAS_ACOTADAS,
  ARISTAS_OCULTAS,
  CARAS_VISIBLES,
  FACTOR_PROFUNDIDAD,
  RAZON_CILINDRO_MAX,
  RAZON_CILINDRO_MIN,
  RAZON_MAXIMA,
  SILUETA,
  aristaMasCortaEnPantalla,
  calcularCilindroEnViewBox,
  motivoRechazoCilindro,
  motivoRechazoParalelepipedo,
  proyectarCaballera,
  razonAristas,
  verticesDesarrolloCilindro,
  verticesDesarrolloParalelepipedo,
  verticesParalelepipedo,
} from "./cuerposGeometricos.ts";

const VIEW_BOX = { ancho: 240, alto: 200, margen: 28 };

/** Área de un polígono por la fórmula del zapato (shoelace), en valor absoluto. */
function area(puntos: Punto[]): number {
  let acumulado = 0;
  for (let i = 0; i < puntos.length; i++) {
    const a = puntos[i];
    const b = puntos[(i + 1) % puntos.length];
    acumulado += a.x * b.y - b.x * a.y;
  }
  return Math.abs(acumulado) / 2;
}

const vector = (a: Punto, b: Punto) => ({ x: b.x - a.x, y: b.y - a.y });
const cruz = (u: Punto, v: Punto) => u.x * v.y - u.y * v.x;
const largo = (a: Punto, b: Punto) => Math.hypot(b.x - a.x, b.y - a.y);

// ---------- proyectarCaballera ----------

test("la caballera no toca lo que está en el plano frontal (z = 0)", () => {
  assert.deepEqual(proyectarCaballera({ x: 3, y: 7, z: 0 }), { x: 3, y: 7 });
});

test("la profundidad se dibuja a la mitad de su largo real, a 45 grados", () => {
  const p = proyectarCaballera({ x: 0, y: 0, z: 10 });
  // A 45° el desplazamiento es igual en x y en y, y su módulo es k·z.
  assert.ok(Math.abs(p.x - p.y) < 1e-12, `no está a 45°: ${p.x} vs ${p.y}`);
  assert.ok(
    Math.abs(Math.hypot(p.x, p.y) - FACTOR_PROFUNDIDAD * 10) < 1e-12,
    `escorzo incorrecto: ${Math.hypot(p.x, p.y)}`,
  );
});

// ---------- verticesParalelepipedo ----------

test("medidas no positivas lanzan error explícito", () => {
  assert.throws(() => verticesParalelepipedo(0, 4, 5), /positivos/);
  assert.throws(() => verticesParalelepipedo(3, -1, 5), /positivos/);
  assert.throws(() => verticesParalelepipedo(3, 4, 0), /positivos/);
});

test("las aristas paralelas en el espacio siguen paralelas tras proyectar y escalar", () => {
  // Es la propiedad que define una proyección paralela y la que hace que el
  // dibujo se lea como un cuerpo: si se rompiera, las caras dejarían de ser
  // paralelogramos y el sólido se vería como una perspectiva cónica.
  const v = escalarPuntosAViewBox(verticesParalelepipedo(8, 5, 6), VIEW_BOX);
  const familias = [
    [[0, 1], [3, 2], [4, 5], [7, 6]], // dirección del largo
    [[0, 3], [1, 2], [4, 7], [5, 6]], // dirección del alto
    [[0, 4], [1, 5], [2, 6], [3, 7]], // dirección de la profundidad
  ];
  for (const familia of familias) {
    const [i0, j0] = familia[0];
    const referencia = vector(v[i0], v[j0]);
    for (const [i, j] of familia.slice(1)) {
      const otro = vector(v[i], v[j]);
      assert.ok(
        Math.abs(cruz(referencia, otro)) < 1e-9,
        `aristas ${i}-${j} y ${i0}-${j0} no quedaron paralelas: cruz = ${cruz(referencia, otro)}`,
      );
    }
  }
});

test("la cara frontal conserva la razón real largo:alto", () => {
  // Es la propiedad que justifica elegir caballera sobre isométrica: el
  // estudiante lee largo × alto sobre un rectángulo de verdad. Si se rompe,
  // la decisión de diseño cae completa.
  const v = escalarPuntosAViewBox(verticesParalelepipedo(9, 4, 6), VIEW_BOX);
  const anchoFrontal = largo(v[0], v[1]);
  const altoFrontal = largo(v[0], v[3]);
  assert.ok(
    Math.abs(anchoFrontal / altoFrontal - 9 / 6) < 1e-9,
    `razón esperada 9/6, obtenida ${anchoFrontal / altoFrontal}`,
  );
});

test("la cara frontal sigue siendo un rectángulo (sus lados son perpendiculares)", () => {
  const v = escalarPuntosAViewBox(verticesParalelepipedo(9, 4, 6), VIEW_BOX);
  const u = vector(v[0], v[1]);
  const w = vector(v[0], v[3]);
  assert.ok(Math.abs(u.x * w.x + u.y * w.y) < 1e-9, "la cara frontal se cizalló");
});

test("las 3 caras visibles teselan la silueta: sus áreas suman la del contorno", () => {
  // Sin solapes ni huecos. Si una cara estuviera mal armada o el orden de
  // vértices fuera otro, la suma no daría el área del hexágono.
  const v = escalarPuntosAViewBox(verticesParalelepipedo(8, 5, 6), VIEW_BOX);
  const sumaCaras = Object.values(CARAS_VISIBLES)
    .map((indices) => area(indices.map((i) => v[i])))
    .reduce((a, b) => a + b, 0);
  const siluetaArea = area(SILUETA.map((i) => v[i]));
  assert.ok(
    Math.abs(sumaCaras - siluetaArea) < 1e-6,
    `caras ${sumaCaras} vs silueta ${siluetaArea}`,
  );
});

test("los 8 vértices caen dentro del área útil del viewBox", () => {
  for (const p of escalarPuntosAViewBox(verticesParalelepipedo(8, 5, 6), VIEW_BOX)) {
    assert.ok(p.x >= VIEW_BOX.margen - 1e-9 && p.x <= VIEW_BOX.ancho - VIEW_BOX.margen + 1e-9);
    assert.ok(p.y >= VIEW_BOX.margen - 1e-9 && p.y <= VIEW_BOX.alto - VIEW_BOX.margen + 1e-9);
  }
});

test("las 3 aristas acotadas son una por dimensión, visibles y perpendiculares entre sí", () => {
  assert.deepEqual(
    ARISTAS_ACOTADAS.map((a) => a.dimension),
    ["largo", "alto", "ancho"],
  );

  // Ninguna puede ser una arista oculta: una cota sobre una arista punteada le
  // pide al estudiante que mida algo que el dibujo declara que no se ve.
  const ocultas = new Set(ARISTAS_OCULTAS.map(([a, b]) => [a, b].sort().join("-")));
  for (const { desde, hasta } of ARISTAS_ACOTADAS) {
    assert.ok(
      !ocultas.has([desde, hasta].sort().join("-")),
      `la arista ${desde}-${hasta} está en ARISTAS_OCULTAS y no puede llevar cota`,
    );
  }

  // Y los tres vértices que tocan tienen que estar en la silueta, no adentro.
  const enSilueta = new Set<number>(SILUETA);
  for (const { desde, hasta } of ARISTAS_ACOTADAS) {
    assert.ok(enSilueta.has(desde) && enSilueta.has(hasta), `${desde}-${hasta} toca un vértice interior`);
  }

  // Una por dimensión: sin escalar al viewBox, sus largos proyectados son
  // exactamente largo, alto y k·ancho — la tercera escorzada, que es justo lo
  // que hace que el dibujo no esté a escala en profundidad.
  const v = verticesParalelepipedo(8, 5, 6);
  assert.deepEqual(
    ARISTAS_ACOTADAS.map(({ desde, hasta }) => Number(largo(v[desde], v[hasta]).toFixed(9))),
    [8, 6, FACTOR_PROFUNDIDAD * 5],
  );
});

// ---------- aristaMasCortaEnPantalla y las guardas de legibilidad ----------

/*
 * Estos tests verifican la PROPIEDAD, no el decimal.
 *
 * Los valores medidos el 2026-08-26 con MARGEN = 28, barriendo todos los
 * repartos posibles de la razón entre los tres ejes, quedan acá como
 * referencia y no como assert:
 *
 *   razon | peor arista mas corta
 *   ------|----------------------
 *     1.0 |   53.2 px
 *     2.0 |   30.6 px
 *     4.0 |   16.5 px
 *     5.0 |   13.4 px   <- bajo el umbral de 14
 *    10.0 |    7.0 px
 *    20.0 |    3.5 px
 *
 * Un cambio legítimo de MARGEN, TAMANO o ALTO movería esos decimales sin que
 * nada esté mal. Congelarlos entrenaría a ignorar el test cuando falle.
 */

test("una caja de proporciones sanas supera el umbral de legibilidad", () => {
  assert.ok(aristaMasCortaEnPantalla(20, 10, 15, VIEW_BOX) >= ARISTA_MINIMA_PX);
});

test("una caja de razón 20 no supera el umbral de legibilidad", () => {
  assert.ok(aristaMasCortaEnPantalla(200, 10, 160, VIEW_BOX) < ARISTA_MINIMA_PX);
});

test("achatar una dimensión solo puede acortar la arista más corta (monotonía)", () => {
  let anterior = Infinity;
  for (const ancho of [10, 8, 6, 4, 2, 1, 0.5]) {
    const actual = aristaMasCortaEnPantalla(10, ancho, 10, VIEW_BOX);
    assert.ok(actual <= anterior + 1e-9, `subió al achatar a ancho=${ancho}: ${actual} > ${anterior}`);
    anterior = actual;
  }
});

test("la razón sola no basta como guarda: dos cajas de razón 10 dan resultados muy distintos", () => {
  // Es la razón de existir de la guarda en píxeles. La arista de profundidad
  // (el segundo argumento, `ancho`) carga el escorzo k ADEMÁS de la escala del
  // viewBox, así que colapsa mucho antes que las otras dos cuando es la chica.
  // La razón no ve esa asimetría: las dos cajas de acá tienen razón 10.
  assert.equal(razonAristas(100, 100, 10), razonAristas(100, 10, 100));
  const profundidadGrande = aristaMasCortaEnPantalla(100, 100, 10, VIEW_BOX);
  const profundidadChica = aristaMasCortaEnPantalla(100, 10, 100, VIEW_BOX);
  assert.ok(
    profundidadGrande > profundidadChica * 1.5,
    `se esperaba que la profundidad chica colapsara mucho más: ${profundidadChica} vs ${profundidadGrande}`,
  );
});

test("razonAristas vale 1 en un cubo y es simétrica en sus argumentos", () => {
  assert.equal(razonAristas(7, 7, 7), 1);
  assert.equal(razonAristas(2, 8, 4), razonAristas(8, 4, 2));
});

test("motivoRechazoParalelepipedo acepta lo sano y rechaza cada patología por su nombre", () => {
  assert.equal(motivoRechazoParalelepipedo(20, 10, 15, VIEW_BOX), null);
  assert.match(motivoRechazoParalelepipedo(0, 10, 15, VIEW_BOX) ?? "", /positivos/);
  assert.match(motivoRechazoParalelepipedo(100, 10, 100, VIEW_BOX) ?? "", /alargada/);
  assert.match(motivoRechazoParalelepipedo(200, 10, 160, VIEW_BOX) ?? "", /alargada|arista más corta/);
});

test("la banda de razón es coherente con el umbral en píxeles en su propio límite", () => {
  // En el peor reparto posible, una caja que pasa la banda de razón tiene que
  // seguir siendo legible. Si esta propiedad se rompiera, la guarda secundaria
  // estaría dando falsos permisos.
  const enElLimite = aristaMasCortaEnPantalla(10 * RAZON_MAXIMA, 10, 10 * RAZON_MAXIMA, VIEW_BOX);
  assert.ok(
    enElLimite >= ARISTA_MINIMA_PX,
    `en razón ${RAZON_MAXIMA} la arista más corta cayó a ${enElLimite} px`,
  );
});

// ---------- cilindro ----------

test("las tapas del cilindro son elipses escorzadas, no círculos", () => {
  const c = calcularCilindroEnViewBox(10, 20, VIEW_BOX);
  assert.ok(Math.abs(c.ry / c.rx - FACTOR_PROFUNDIDAD) < 1e-9, `ry/rx = ${c.ry / c.rx}`);
});

test("el cilindro cabe en el área útil, tapas incluidas", () => {
  const c = calcularCilindroEnViewBox(10, 20, VIEW_BOX);
  assert.ok(c.centroSuperior.y - c.ry >= VIEW_BOX.margen - 1e-9);
  assert.ok(c.centroInferior.y + c.ry <= VIEW_BOX.alto - VIEW_BOX.margen + 1e-9);
  assert.ok(c.centroSuperior.x - c.rx >= VIEW_BOX.margen - 1e-9);
  assert.ok(c.centroSuperior.x + c.rx <= VIEW_BOX.ancho - VIEW_BOX.margen + 1e-9);
});

test("las dos tapas comparten eje vertical y la superior queda arriba", () => {
  const c = calcularCilindroEnViewBox(10, 20, VIEW_BOX);
  assert.equal(c.centroSuperior.x, c.centroInferior.x);
  assert.ok(c.centroSuperior.y < c.centroInferior.y);
});

test("calcularCilindroEnViewBox lanza ante medidas no positivas", () => {
  assert.throws(() => calcularCilindroEnViewBox(0, 20, VIEW_BOX), /positivos/);
  assert.throws(() => calcularCilindroEnViewBox(10, -1, VIEW_BOX), /positivos/);
});

test("motivoRechazoCilindro acepta dentro de la banda y rechaza fuera, por los dos lados", () => {
  assert.equal(motivoRechazoCilindro(10, 20), null);
  assert.equal(motivoRechazoCilindro(10, 10 * RAZON_CILINDRO_MIN), null);
  assert.equal(motivoRechazoCilindro(10, 10 * RAZON_CILINDRO_MAX), null);
  assert.match(motivoRechazoCilindro(10, 10 * RAZON_CILINDRO_MIN * 0.5) ?? "", /chato/);
  assert.match(motivoRechazoCilindro(10, 10 * RAZON_CILINDRO_MAX * 2) ?? "", /esbelto/);
  assert.match(motivoRechazoCilindro(-1, 20) ?? "", /positivos/);
});

// ---------- desarrollos planos (redes) ----------

test("la red del paralelepípedo suma exactamente el área de superficie", () => {
  const [a, b, c] = [8, 5, 6]; // largo, ancho, alto
  const caras = verticesDesarrolloParalelepipedo(a, b, c);
  assert.equal(caras.length, 6);
  const suma = caras.reduce((acc, cara) => acc + area(cara.puntos), 0);
  const superficie = 2 * (a * b + a * c + b * c);
  assert.ok(Math.abs(suma - superficie) < 1e-9, `red ${suma} vs 2(ab+ac+bc) ${superficie}`);
});

test("la red del paralelepípedo trae las 6 caras nombradas, en pares iguales", () => {
  const caras = verticesDesarrolloParalelepipedo(8, 5, 6);
  assert.deepEqual(
    caras.map((c) => c.nombre).sort(),
    ["atrás", "base", "derecha", "frente", "izquierda", "tapa"],
  );
  const porNombre = new Map(caras.map((c) => [c.nombre, area(c.puntos)]));
  for (const [uno, otro] of [
    ["frente", "atrás"],
    ["izquierda", "derecha"],
    ["base", "tapa"],
  ]) {
    assert.ok(
      Math.abs(porNombre.get(uno)! - porNombre.get(otro)!) < 1e-9,
      `${uno} y ${otro} deberían tener la misma área`,
    );
  }
});

test("las caras de la red no se solapan: su área total es la de su unión", () => {
  // La cruz es un polígono cóncavo, así que se compara contra la suma de las
  // celdas de la grilla que ocupa, no contra su bounding box.
  const [a, b, c] = [8, 5, 6];
  const caras = verticesDesarrolloParalelepipedo(a, b, c);
  const suma = caras.reduce((acc, cara) => acc + area(cara.puntos), 0);
  const bounding =
    Math.max(...caras.flatMap((f) => f.puntos.map((p) => p.x))) *
    Math.max(...caras.flatMap((f) => f.puntos.map((p) => p.y)));
  assert.ok(suma < bounding, "la red no puede llenar su bounding box: es una cruz");
  assert.ok(suma > 0);
});

test("la red del cilindro: manto de 2πr por h más dos tapas de radio r", () => {
  const [radio, altura] = [7, 12];
  const d = verticesDesarrolloCilindro(radio, altura);
  const anchoManto = d.manto[1].x - d.manto[0].x;
  const altoManto = d.manto[2].y - d.manto[1].y;
  assert.ok(Math.abs(anchoManto - 2 * Math.PI * radio) < 1e-9, `ancho del manto: ${anchoManto}`);
  assert.ok(Math.abs(altoManto - altura) < 1e-9, `alto del manto: ${altoManto}`);
  assert.equal(d.tapaSuperior.radio, radio);
  assert.equal(d.tapaInferior.radio, radio);
});

test("la red del cilindro suma exactamente 2πr² + 2πrh", () => {
  const [radio, altura] = [7, 12];
  const d = verticesDesarrolloCilindro(radio, altura);
  const suma = area(d.manto) + 2 * Math.PI * radio * radio;
  const superficie = 2 * Math.PI * radio * radio + 2 * Math.PI * radio * altura;
  assert.ok(Math.abs(suma - superficie) < 1e-9, `red ${suma} vs 2πr²+2πrh ${superficie}`);
});

test("las tapas del cilindro quedan tangentes al manto, sin solaparlo", () => {
  const [radio, altura] = [7, 12];
  const d = verticesDesarrolloCilindro(radio, altura);
  const bordeInferior = d.manto[0].y;
  const bordeSuperior = d.manto[2].y;
  assert.ok(Math.abs(d.tapaInferior.centro.y + radio - bordeInferior) < 1e-9);
  assert.ok(Math.abs(d.tapaSuperior.centro.y - radio - bordeSuperior) < 1e-9);
  // Centradas sobre el manto.
  const medioManto = (d.manto[0].x + d.manto[1].x) / 2;
  assert.ok(Math.abs(d.tapaInferior.centro.x - medioManto) < 1e-9);
});

test("las redes lanzan ante medidas no positivas", () => {
  assert.throws(() => verticesDesarrolloParalelepipedo(0, 5, 6), /positivos/);
  assert.throws(() => verticesDesarrolloCilindro(7, 0), /positivos/);
});
