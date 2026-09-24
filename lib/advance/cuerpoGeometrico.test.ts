import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Coordenada3D, CotaCuerpo, FiguraCuerpoGeometrico, PiezaCuerpo } from "./descarte.ts";
import {
  ALTURA_RADIO_MAX,
  ALTURA_RADIO_MIN,
  ARISTA_ACOTADA_MINIMA,
  ARISTA_VISIBLE_MINIMA,
  FACTOR_PROFUNDIDAD,
  K,
  MARGEN_CUERPO,
  RAZON_MAXIMA,
  cajasDe,
  choquesDeCuerpo,
  geometriaCuerpo,
  pilasDe,
  problemasDeCoherencia,
  problemasDeComposicion,
  problemasDeCotas,
  problemasDeLegibilidad,
  proyectar,
  tapado,
  tramoTapado,
  tramosDeAristas,
  trazosDePilas,
  type TramoArista,
} from "./cuerpoGeometrico.ts";
import { ALTO_MAXIMO, ANCHO_CARRIL } from "./lienzoGeometrico.ts";

/* Motor del cuerpo geométrico (reglas 41 a 50 del schema de Advance). Datos
   inventados. Los asserts afirman propiedades; los números medidos van como
   comentario con fecha. */

const P = (x: number, y: number, z: number): Coordenada3D => ({ x, y, z });
const figura = (piezas: PiezaCuerpo[], extra: Partial<FiguraCuerpoGeometrico> = {}): FiguraCuerpoGeometrico => ({
  tipo: "cuerpo-geometrico",
  piezas,
  descripcion: "Cuerpo de prueba con datos inventados para el motor.",
  ...extra,
});
const caja = (largo: number, alto: number, ancho: number, en?: Coordenada3D): PiezaCuerpo => ({ cuerpo: "paralelepipedo", largo, alto, ancho, ...(en ? { en } : {}) });
const largo = (t: TramoArista) => Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y, t.b.z - t.a.z);
const suma = (ts: TramoArista[]) => ts.reduce((s, t) => s + largo(t), 0);
const cerca = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol;

/* U de tres cajas: columnas de 2 × 6 y 2 × 4, piso de 4 × 2, fondo 2. */
const U = figura([caja(2, 6, 2), caja(4, 2, 2, P(2, 0, 0)), caja(2, 4, 2, P(6, 0, 0))]);
const COTAS_U: CotaCuerpo[] = [
  { desde: P(0, 0, 0), hasta: P(8, 0, 0), rotulo: "8 cm" },
  { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "6 cm" },
  { desde: P(0, 6, 2), hasta: P(2, 6, 2), rotulo: "2 cm" },
  { desde: P(2, 2, 0), hasta: P(6, 2, 0), rotulo: "4 cm" },
  { desde: P(8, 0, 2), hasta: P(8, 4, 2), rotulo: "4 cm" },
  { desde: P(8, 0, 0), hasta: P(8, 0, 2), rotulo: "2 cm" },
];
const pila = (...cil: [number, number][]) => figura(cil.map(([radio, altura]) => ({ cuerpo: "cilindro", radio, altura })));

describe("cuerpoGeometrico: proyección caballera del tier gratis", () => {
  it("proyectar da (x + K·z, y + K·z) con K = 0,5 · cos 45°", () => {
    assert.ok(cerca(K, 0.5 * Math.SQRT1_2, 1e-15));
    assert.ok(cerca(K, 0.3535533905932738, 1e-15));
    const p = proyectar(P(2, 3, 4));
    assert.ok(cerca(p.x, 2 + 4 * K) && cerca(p.y, 3 + 4 * K));
  });
});

describe("cuerpoGeometrico: ocultas en cajas (rayo hacia el observador)", () => {
  it("caja sola: las ocultas son las tres aristas del vértice de atrás, abajo, a la izquierda", () => {
    const tramos = tramosDeAristas(cajasDe(figura([caja(10, 6, 4)])));
    const ocultas = tramos.filter((t) => !t.visible);
    assert.equal(ocultas.length, 3);
    for (const t of ocultas) assert.ok([t.a, t.b].some((p) => p.x === 0 && p.y === 0 && p.z === 4));
    assert.ok(cerca(suma(ocultas), 10 + 6 + 4));
    assert.ok(cerca(suma(tramos.filter((t) => t.visible)), 4 * (10 + 6 + 4) - 20));
  });

  it("cubo: tres ocultas del largo de la arista, ninguna junta", () => {
    const tramos = tramosDeAristas(cajasDe(figura([{ cuerpo: "cubo", arista: 5 }])));
    const ocultas = tramos.filter((t) => !t.visible);
    assert.equal(ocultas.length, 3);
    for (const t of ocultas) assert.ok(cerca(largo(t), 5));
    assert.ok(tramos.every((t) => t.clase === "pliegue"));
  });

  it("U: la arista donde el piso toca la columna derecha queda oculta, tapada por la columna", () => {
    const tramos = tramosDeAristas(cajasDe(U));
    const pisoColumna = tramos.find((t) => t.clase === "pliegue" && t.a.x === 6 && t.b.x === 6 && t.a.y === 2 && t.b.y === 2);
    assert.ok(pisoColumna && !pisoColumna.visible);
    /* Y la del piso contra la columna izquierda se ve: la cara derecha de esa columna mira al observador. */
    const pisoIzquierda = tramos.find((t) => t.clase === "pliegue" && t.a.x === 2 && t.b.x === 2 && t.a.y === 2 && t.b.y === 2);
    assert.ok(pisoIzquierda && pisoIzquierda.visible);
  });

  it("U: las uniones entre cajas son juntas, y cada una sale una sola vez", () => {
    const juntas = tramosDeAristas(cajasDe(U)).filter((t) => t.clase === "junta");
    /* Medido el 2026-09-24: adelante 2 + 2 visibles; atrás y abajo 4 + 4 ocultas. */
    assert.ok(cerca(suma(juntas.filter((t) => t.visible)), 4));
    assert.ok(cerca(suma(juntas.filter((t) => !t.visible)), 8));
  });

  it("U: sin juntas no se dibuja ninguna; con juntas se dibujan solo las visibles", () => {
    assert.equal(geometriaCuerpo(U).juntas.length, 0);
    const con = geometriaCuerpo({ ...U, juntas: true });
    assert.equal(con.juntas.length, 2);
  });

  it("todo tramo oculto tiene algo delante y ninguno visible lo tiene", () => {
    const cajas = cajasDe(U);
    for (const t of tramosDeAristas(cajas)) {
      const medio = P((t.a.x + t.b.x) / 2, (t.a.y + t.b.y) / 2, (t.a.z + t.b.z) / 2);
      assert.equal(tapado(medio, cajas), !t.visible);
    }
  });

  it("dos cajas separadas no se tapan: cada una conserva sus tres ocultas", () => {
    const tramos = tramosDeAristas(cajasDe(figura([caja(2, 2, 2), caja(2, 2, 2, P(4, 0, 0))])));
    assert.ok(cerca(suma(tramos.filter((t) => !t.visible)), 2 * 6));
  });

  it("ocultas: false no dibuja las ocultas ni las cuenta como trazo", () => {
    const con = geometriaCuerpo(figura([caja(10, 6, 4)]));
    const sin = geometriaCuerpo(figura([caja(10, 6, 4)], { ocultas: false }));
    assert.equal(con.ocultas.length, 3);
    assert.equal(sin.ocultas.length, 0);
    assert.ok(sin.segmentos.every((s) => s.clase !== "oculta"));
  });
});

describe("cuerpoGeometrico: ocultas en cilindros (convención del gratis)", () => {
  it("cilindro solo: base con el arco de atrás oculto y el de adelante visible; tapa entera visible", () => {
    const { arcos } = trazosDePilas(pilasDe(pila([3, 8])));
    const base = arcos.filter((a) => a.cy === 0);
    const tapa = arcos.filter((a) => a.cy === 8);
    assert.deepEqual(base.map((a) => [a.desde < Math.PI, a.visible]), [[false, true], [true, false]]);
    assert.ok(tapa.every((a) => a.visible));
  });

  it("pila con el de arriba más angosto: del arco de atrás de la tapa de abajo se oculta un tramo centrado", () => {
    const { arcos } = trazosDePilas(pilasDe(pila([10, 8], [7.5, 8])));
    const atras = arcos.filter((a) => a.cy === 8 && a.radio === 10 && a.desde < Math.PI);
    const oculto = atras.find((a) => !a.visible);
    assert.ok(oculto);
    assert.ok(cerca(oculto.desde + oculto.hasta, Math.PI, 1e-9), "simétrico respecto de la vertical");
    assert.equal(atras.filter((a) => a.visible).length, 2);
    /* Y la base del de arriba: arco de atrás oculto. */
    assert.ok(arcos.some((a) => a.cy === 8 && a.radio === 7.5 && a.desde === 0 && !a.visible));
  });

  it("con el de arriba chato (h < 0,5·(r − ru)) nada del arco de atrás queda tapado", () => {
    /* Corrección al plan: con el de arriba chato asoma el arco entero, no solo el centro. */
    assert.equal(tramoTapado(10, 7.5, 1), 0);
    const { arcos } = trazosDePilas(pilasDe(pila([10, 8], [7.5, 1])));
    assert.ok(arcos.filter((a) => a.cy === 8 && a.radio === 10).every((a) => a.visible));
  });

  it("el tramo tapado nunca pasa del radio de encima, y en su borde las alturas se igualan", () => {
    for (const [r, ru, h] of [[10, 7.5, 8], [10, 3, 0.8], [6, 5, 0.3]]) {
      const u = tramoTapado(r, ru, h);
      assert.ok(u >= 0 && u <= ru);
      if (u > 0 && u < ru) assert.ok(cerca(0.5 * Math.sqrt(r * r - u * u), h + 0.5 * Math.sqrt(ru * ru - u * u), 1e-9));
    }
  });
});

describe("cuerpoGeometrico: escala y tamaño", () => {
  it("el viewBox tiene el ancho del carril y el alto nunca pasa de 320", () => {
    for (const contexto of ["enunciado", "solucion"] as const) {
      for (const f of [figura([{ cuerpo: "cubo", arista: 4 }]), figura([caja(1, 6, 1)]), U, pila([1, 8])]) {
        const g = geometriaCuerpo(f, contexto);
        assert.equal(g.ancho, ANCHO_CARRIL[contexto]);
        assert.ok(g.alto <= ALTO_MAXIMO + 1e-6, `${g.alto}`);
      }
    }
  });

  it("todo cabe dentro del viewBox con su margen y va centrado", () => {
    const g = geometriaCuerpo({ ...U, cotas: COTAS_U });
    assert.ok(g.caja.x0 >= MARGEN_CUERPO - 1e-6 && g.caja.x1 <= g.ancho - MARGEN_CUERPO + 1e-6);
    assert.ok(cerca(g.caja.y0, MARGEN_CUERPO) && cerca(g.caja.y1, g.alto - MARGEN_CUERPO));
    assert.ok(cerca(g.caja.x0, g.ancho - g.caja.x1, 1e-6));
    /* Medido el 2026-09-24: s = 30,04 px por unidad y alto 271,5 en 358; en 330, 26,83 y 249,9. */
  });
});

describe("cuerpoGeometrico: cotas", () => {
  const cotaLargo: CotaCuerpo = { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm" };
  const cotaAlto: CotaCuerpo = { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "6 cm" };

  it("por defecto la cota se aleja del centro: el largo debajo, el alto a la izquierda", () => {
    const g = geometriaCuerpo(figura([caja(10, 6, 4)], { cotas: [cotaLargo, cotaAlto] }));
    const abajo = Math.max(...g.segmentos.map((s) => Math.max(s.a.y, s.b.y)));
    const izquierda = Math.min(...g.segmentos.map((s) => Math.min(s.a.x, s.b.x)));
    assert.ok(g.rotulos[0].caja.y0 > abajo);
    assert.ok(g.rotulos[1].caja.x1 < izquierda);
  });

  it("lado interior la pone del otro lado", () => {
    const afuera = geometriaCuerpo(figura([caja(10, 6, 4)], { cotas: [cotaLargo] }));
    const adentro = geometriaCuerpo(figura([caja(10, 6, 4)], { cotas: [{ ...cotaLargo, lado: "interior" }] }));
    const bordeDe = (g: typeof afuera) => Math.max(...g.segmentos.map((s) => Math.max(s.a.y, s.b.y)));
    assert.ok(afuera.rotulos[0].y > bordeDe(afuera));
    assert.ok(adentro.rotulos[0].y < bordeDe(adentro));
  });

  it("llave false pone el rótulo más cerca del tramo, sin llave", () => {
    const con = geometriaCuerpo(figura([caja(10, 6, 4)], { cotas: [cotaLargo] }));
    const sin = geometriaCuerpo(figura([caja(10, 6, 4)], { cotas: [{ ...cotaLargo, llave: false }] }));
    assert.equal(con.llaves.length, 1);
    assert.equal(sin.llaves.length, 0);
    const distancia = (g: typeof con) => g.rotulos[0].caja.y0 - Math.max(...g.segmentos.map((s) => Math.max(s.a.y, s.b.y)));
    assert.ok(distancia(sin) < distancia(con));
  });

  it("las seis cotas de la U caen del lado en que las pone DEMRE (2026 regular n.º 47)", () => {
    const g = geometriaCuerpo({ ...U, cotas: COTAS_U });
    const [largoTotal, alto, arriba, piso, derecha, fondo] = g.rotulos;
    const centroX = g.ancho / 2;
    assert.ok(largoTotal.y > piso.y && piso.y > arriba.y, "largo abajo, piso al medio, arista de arriba encima");
    assert.ok(alto.x < centroX && derecha.x > centroX, "alto a la izquierda, columna derecha a la derecha");
    assert.ok(fondo.x > largoTotal.x && fondo.y > derecha.y, "profundidad abajo a la derecha");
  });

  it("cilindro: diámetro sobre la tapa o bajo la base, altura a la izquierda, radio sobre la tapa", () => {
    const f = pila([10, 8], [7.5, 8]);
    const g = geometriaCuerpo({
      ...f,
      cotas: [
        { pieza: 1, medida: "diametro", rotulo: "15 cm" },
        { pieza: 0, medida: "diametro", lado: "abajo", rotulo: "20 cm" },
        { pieza: 0, medida: "altura", rotulo: "8 cm" },
      ],
    });
    const ys = g.segmentos.flatMap((s) => [s.a.y, s.b.y]);
    const xs = g.segmentos.flatMap((s) => [s.a.x, s.b.x]);
    assert.ok(g.rotulos[0].caja.y1 < Math.min(...ys), "el diámetro de arriba queda sobre todo el cuerpo");
    assert.ok(g.rotulos[1].caja.y0 > Math.max(...ys), "el de abajo, bajo la base");
    assert.ok(g.rotulos[2].caja.x1 < Math.min(...xs), "la altura, a la izquierda");
    const radio = geometriaCuerpo({ ...pila([3, 8]), cotas: [{ pieza: 0, medida: "radio", rotulo: "3 cm" }] });
    assert.equal(radio.radios.length, 1);
    assert.equal(radio.llaves.length, 0);
  });
});

describe("cuerpoGeometrico: guardas de legibilidad (regla 47)", () => {
  const conProblema = (f: FiguraCuerpoGeometrico, texto: string) => problemasDeLegibilidad(f).some((p) => p.mensaje.includes(texto));

  it(`razón entre medidas: ${RAZON_MAXIMA} pasa y 4,01 no`, () => {
    assert.ok(!conProblema(figura([caja(4, 1, 1)]), "veces la menor"));
    assert.ok(conProblema(figura([caja(4.01, 1, 1)]), "veces la menor"));
  });

  it(`altura sobre radio: ${ALTURA_RADIO_MIN} y ${ALTURA_RADIO_MAX} pasan; 0,24 y 8,01 no`, () => {
    assert.ok(!conProblema(pila([4, 1]), "altura sobre radio"));
    assert.ok(!conProblema(pila([1, 8]), "altura sobre radio"));
    assert.ok(conProblema(pila([4, 0.96]), "altura sobre radio"));
    assert.ok(conProblema(pila([1, 8.01]), "altura sobre radio"));
  });

  /* Busca el ancho de la caja que deja la profundidad (o su cota) en `px` en el enunciado. */
  function anchoPara(px: number, cotas: boolean): number {
    const profundidad = (w: number) => {
      const f = figura([caja(4, 4, w)], cotas ? { cotas: [{ desde: P(4, 0, 0), hasta: P(4, 0, w), rotulo: "1 cm" }] } : {});
      return FACTOR_PROFUNDIDAD * w * geometriaCuerpo(f).s;
    };
    let lo = 0.01;
    let hi = 4;
    for (let k = 0; k < 60; k++) {
      const m = (lo + hi) / 2;
      if (profundidad(m) < px) lo = m;
      else hi = m;
    }
    return hi;
  }

  it(`arista visible: ${ARISTA_VISIBLE_MINIMA} px pasa y 11,9 no`, () => {
    const w = anchoPara(ARISTA_VISIBLE_MINIMA, false);
    assert.ok(!conProblema(figura([caja(4, 4, w)]), "el mínimo es 12"));
    assert.ok(conProblema(figura([caja(4, 4, anchoPara(11.9, false))]), "el mínimo es 12"));
  });

  it(`arista acotada: ${ARISTA_ACOTADA_MINIMA} px pasa y 23,9 no`, () => {
    const cotaEn = (w: number) => figura([caja(4, 4, w)], { cotas: [{ desde: P(4, 0, 0), hasta: P(4, 0, w), rotulo: "1 cm" }] });
    assert.ok(!conProblema(cotaEn(anchoPara(ARISTA_ACOTADA_MINIMA, true)), "el mínimo es 24"));
    assert.ok(conProblema(cotaEn(anchoPara(23.9, true)), "el mínimo es 24"));
  });

  it("tapa: un cilindro muy angosto encima de uno ancho baja de 8 px de alto", () => {
    assert.ok(conProblema(pila([10, 3], [0.3, 1]), "la tapa mide"));
    assert.ok(!conProblema(pila([10, 8], [7.5, 8]), "la tapa mide"));
  });

  it("cuerpos separados: menos de 12 px de aire es error; con aire, no", () => {
    assert.ok(conProblema(figura([caja(2, 2, 2), caja(2, 2, 2, P(2.1, 0, 0))]), "cuerpos separados"));
    assert.ok(!conProblema(figura([caja(2, 2, 2), caja(2, 2, 2, P(4, 0, 0))]), "cuerpos separados"));
    assert.ok(conProblema(figura([{ cuerpo: "cilindro", radio: 2, altura: 4 }, { cuerpo: "cilindro", radio: 2, altura: 4, x: 4.05 }]), "cuerpos separados"));
  });
});

describe("cuerpoGeometrico: composición (reglas 42 a 44)", () => {
  const mensajes = (f: FiguraCuerpoGeometrico) => problemasDeComposicion(f).map((p) => p.mensaje).join(" | ");

  it("mezclar cajas y cilindros es error", () => {
    assert.match(mensajes(figura([{ cuerpo: "cubo", arista: 3 }, { cuerpo: "cilindro", radio: 1, altura: 3, x: 6 }])), /mezcla cajas y cilindros/);
  });

  it("dos cajas que se cruzan dan su volumen común", () => {
    assert.match(mensajes(figura([caja(4, 2, 2), { cuerpo: "cubo", arista: 2, en: P(3, 0, 0) }])), /se cruzan \(volumen común 4\)/);
  });

  it("una caja en el aire es error; apoyada en otra, no", () => {
    assert.match(mensajes(figura([caja(2, 2, 2, P(0, 1, 0))])), /queda en el aire/);
    assert.equal(mensajes(figura([caja(4, 2, 2), caja(2, 2, 2, P(0, 2, 0))])), "");
  });

  it("en una pila, un cilindro más ancho o igual encima es error", () => {
    assert.match(mensajes(pila([2, 3], [3, 1])), /radio 3 sobre un cilindro de radio 2/);
    assert.match(mensajes(pila([2, 3], [2, 1])), /más angosto que el de abajo/);
  });
});

describe("cuerpoGeometrico: cotas que existen y se ven (regla 45)", () => {
  const mensajes = (cotas: CotaCuerpo[], base = figura([caja(10, 6, 4)])) => problemasDeCotas({ ...base, cotas }).map((p) => p.mensaje).join(" | ");

  it("una cota sobre una arista oculta es error", () => {
    assert.match(mensajes([{ desde: P(0, 0, 4), hasta: P(10, 0, 4), rotulo: "10 cm" }]), /arista oculta/);
  });

  it("una cota sobre una junta que no se dibuja es error; con juntas, pasa", () => {
    const dos = figura([caja(2, 2, 2), caja(2, 2, 2, P(2, 0, 0))]);
    const cota: CotaCuerpo = { desde: P(2, 0, 0), hasta: P(2, 2, 0), rotulo: "2 cm" };
    assert.match(mensajes([cota], dos), /junta que no se dibuja/);
    assert.equal(mensajes([cota], { ...dos, juntas: true }), "");
  });

  it("fuera del cuerpo, en diagonal o repetida, es error", () => {
    assert.match(mensajes([{ desde: P(0, 3, 0), hasta: P(10, 3, 0), rotulo: "10 cm" }]), /no va por una arista del cuerpo/);
    assert.match(mensajes([{ desde: P(0, 0, 0), hasta: P(10, 6, 0), rotulo: "x" }]), /no es paralela a un eje/);
    const c: CotaCuerpo = { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm" };
    assert.match(mensajes([c, { ...c, desde: c.hasta, hasta: c.desde }]), /repite el tramo de cotas\[0\]/);
  });

  it("cilindro: radio y diámetro en la misma pieza, y el radio con lado, son error", () => {
    const f = pila([3, 8]);
    assert.match(mensajes([{ pieza: 0, medida: "radio", rotulo: "3 cm" }, { pieza: 0, medida: "diametro", rotulo: "6 cm" }], f), /radio y diámetro en la misma pieza/);
    assert.match(mensajes([{ pieza: 0, medida: "radio", lado: "arriba", rotulo: "3 cm" }], f), /el radio no lleva lado/);
    assert.match(mensajes([{ pieza: 4, medida: "altura", rotulo: "8 cm" }], f), /pieza 4 no existe/);
  });
});

describe("cuerpoGeometrico: rótulos coherentes con el dibujo (regla 46)", () => {
  const mensajes = (f: FiguraCuerpoGeometrico) => problemasDeCoherencia(f).map((p) => p.mensaje).join(" | ");

  it("el rótulo mayor sobre el tramo más corto es error", () => {
    const f = figura([caja(10, 6, 4)], {
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "4 cm" },
        { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "9 cm" },
      ],
    });
    assert.match(mensajes(f), /«9 cm» es mayor que «4 cm» y su tramo se dibuja más corto \(6 contra 10\)/);
  });

  it("rótulos iguales sobre tramos distintos es error; con letras no se compara", () => {
    const iguales = figura([caja(10, 6, 4)], {
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "5 cm" },
        { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "5 cm" },
      ],
    });
    assert.match(mensajes(iguales), /son iguales y sus tramos miden 10 y 6/);
    const letras = figura([caja(10, 6, 4)], {
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "2x" },
        { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "8x" },
      ],
    });
    assert.equal(mensajes(letras), "");
  });
});

describe("cuerpoGeometrico: choques de rótulos y llaves (regla 48)", () => {
  it("la U con las seis cotas donde las pone DEMRE no choca, con ocultas o sin ellas", () => {
    assert.deepEqual(choquesDeCuerpo({ ...U, cotas: COTAS_U }), []);
    assert.deepEqual(choquesDeCuerpo({ ...U, cotas: COTAS_U, ocultas: false }), []);
    assert.deepEqual(choquesDeCuerpo({ ...U, cotas: COTAS_U }, "solucion"), []);
  });

  it("la cota de alto en la arista de adelante a la derecha pisa la cara derecha y choca", () => {
    const choques = choquesDeCuerpo(figura([caja(10, 6, 4)], { cotas: [{ desde: P(10, 0, 0), hasta: P(10, 6, 0), rotulo: "6 cm" }] }));
    assert.ok(choques.some((c) => c.a === "6 cm"));
  });

  it("dos llaves que comparten el vértice de abajo a la derecha no se cuentan como cruzadas", () => {
    const f = figura([caja(10, 6, 4)], {
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm" },
        { desde: P(10, 0, 0), hasta: P(10, 0, 4), rotulo: "4 cm" },
      ],
    });
    assert.deepEqual(choquesDeCuerpo(f), []);
  });

  it("un rótulo sobre una arista oculta choca solo si las ocultas se dibujan", () => {
    /* Solo regla 48 (la razón de esta caja no importa acá): el rótulo del largo
       de adelante, hacia adentro y sin llave, cae sobre la oculta de atrás abajo. */
    const f = figura([caja(10, 6, 1.5)], { cotas: [{ desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm", lado: "interior", llave: false }] });
    assert.deepEqual(choquesDeCuerpo(f), [{ clase: "trazo", a: "10 cm" }]);
    assert.deepEqual(choquesDeCuerpo({ ...f, ocultas: false }), []);
  });

  it("una llave hacia adentro sobre una arista entera pisa las aristas de sus extremos", () => {
    const f = figura([caja(10, 6, 2.5)], { cotas: [{ desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm", lado: "interior" }] });
    assert.ok(choquesDeCuerpo({ ...f, ocultas: false }).some((c) => c.clase === "llave-trazo"));
  });
});
