import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  arcoParabola,
  bezierParabola,
  cerosDe,
  coeficientesRecta,
  escalaDe,
  formatoMarca,
  interceptoY,
  marcasDeEje,
  puntoDeArco,
  recortarArco,
  segmentoRectaEnVentana,
  ventanaAutomatica,
  verticeDe,
  type Ventana,
} from "./planoFuncion.ts";
import type { CurvaFuncion } from "./descarte.ts";

const f = (a: number, b: number, c: number, x: number) => a * x * x + b * x + c;
const TOL = 1e-9;
const T = Array.from({ length: 200 }, (_, i) => i / 199);

describe("bezierParabola / arcoParabola: Bézier cuadrática exacta", () => {
  const casos: [number, number, number, number, number][] = [
    [1, 0, 0, -2, 2],
    [1, -4, 3, 0, 4],
    [-1, 2, 5, -3, 1],
    [-2, 0, 8, -1, 4],
    [25, -10, 1, -0.3, 0.9],
    [0.25, 1, -3, -8, 2],
    [-0.1, 0.5, 2, 0, 12],
    [3, 7, -2, 1, 6],
    [0.5, -3, 1, 3, 3.5],
    [-4, 0, 0, -0.5, 0.25],
  ];
  for (const [a, b, c, x0, x1] of casos) {
    it(`a=${a} b=${b} c=${c} en [${x0}, ${x1}]: 200 valores de t coinciden con f(x) a 1e-9`, () => {
      const arco = bezierParabola(a, b, c, x0, x1);
      assert.equal(arco.c.x, (x0 + x1) / 2);
      let peor = 0;
      for (const t of T) {
        const p = puntoDeArco(arco, t);
        peor = Math.max(peor, Math.abs(p.y - f(a, b, c, p.x)));
      }
      assert.ok(peor <= TOL, `error máximo ${peor}`);
      assert.equal(puntoDeArco(arco, 0).x, x0);
      assert.equal(puntoDeArco(arco, 1).x, x1);
    });
  }

  it("el path es M x0 y0 Q xc yc x1 y1 en unidades", () => {
    assert.equal(arcoParabola(1, 0, 0, -2, 2), "M -2 4 Q 0 -4 2 4");
    assert.equal(arcoParabola(1, -4, 3, 0, 4), "M 0 3 Q 2 -5 4 3");
  });
});

describe("recortarArco: De Casteljau en los bordes de la ventana", () => {
  const dentro = (arco: ReturnType<typeof bezierParabola>, v: Ventana) => {
    for (const t of T) {
      const p = puntoDeArco(arco, t);
      assert.ok(p.x >= v.xMin - TOL && p.x <= v.xMax + TOL, `x=${p.x} fuera`);
      assert.ok(p.y >= v.yMin - TOL && p.y <= v.yMax + TOL, `y=${p.y} fuera`);
    }
  };
  const sigueLaCurva = (arco: ReturnType<typeof bezierParabola>, a: number, b: number, c: number) => {
    for (const t of T) {
      const p = puntoDeArco(arco, t);
      assert.ok(Math.abs(p.y - f(a, b, c, p.x)) <= TOL, "el corte deformó la curva");
    }
  };

  it("parábola hacia abajo que se sale por arriba (vértice) y por abajo a los dos lados queda en dos tramos exactos", () => {
    const [a, b, c] = [-1, 0, 5];
    const arco = bezierParabola(a, b, c, -6, 6);
    const v: Ventana = { xMin: -4, xMax: 4, yMin: -3, yMax: 3 };
    const tramos = recortarArco(arco, v);
    assert.equal(tramos.length, 2);
    for (const tr of tramos) {
      dentro(tr, v);
      sigueLaCurva(tr, a, b, c);
    }
    /* Extremos exactamente en los bordes: y = −3 en x = ±√8, y = 3 en x = ±√2. */
    assert.ok(Math.abs(tramos[0].p0.x - -Math.sqrt(8)) <= TOL);
    assert.ok(Math.abs(tramos[0].p0.y - -3) <= TOL);
    assert.ok(Math.abs(tramos[0].p2.x - -Math.sqrt(2)) <= TOL);
    assert.ok(Math.abs(tramos[0].p2.y - 3) <= TOL);
    assert.ok(Math.abs(tramos[1].p0.x - Math.sqrt(2)) <= TOL);
    assert.ok(Math.abs(tramos[1].p2.x - Math.sqrt(8)) <= TOL);
  });

  it("parábola hacia arriba que se sale por arriba en los dos lados deja solo el cuenco", () => {
    const [a, b, c] = [1, 0, -2];
    const arco = bezierParabola(a, b, c, -6, 6);
    const v: Ventana = { xMin: -4, xMax: 4, yMin: -3, yMax: 3 };
    const tramos = recortarArco(arco, v);
    assert.equal(tramos.length, 1);
    dentro(tramos[0], v);
    sigueLaCurva(tramos[0], a, b, c);
    assert.ok(Math.abs(tramos[0].p0.x - -Math.sqrt(5)) <= TOL);
    assert.ok(Math.abs(tramos[0].p2.x - Math.sqrt(5)) <= TOL);
    assert.ok(Math.abs(tramos[0].p0.y - 3) <= TOL && Math.abs(tramos[0].p2.y - 3) <= TOL);
  });

  it("parábola hacia abajo que se sale por abajo queda en un tramo con el vértice", () => {
    const [a, b, c] = [-1, 2, 3];
    const arco = bezierParabola(a, b, c, -3, 5);
    const v: Ventana = { xMin: -3, xMax: 5, yMin: -1, yMax: 5 };
    const tramos = recortarArco(arco, v);
    assert.equal(tramos.length, 1);
    dentro(tramos[0], v);
    sigueLaCurva(tramos[0], a, b, c);
    assert.ok(Math.abs(tramos[0].p0.y - -1) <= TOL);
    assert.ok(Math.abs(tramos[0].p2.y - -1) <= TOL);
  });

  it("arco totalmente dentro vuelve igual; totalmente fuera vuelve vacío", () => {
    const arco = bezierParabola(1, 0, 0, -1, 1);
    assert.deepEqual(recortarArco(arco, { xMin: -2, xMax: 2, yMin: -1, yMax: 2 }), [arco]);
    assert.deepEqual(recortarArco(arco, { xMin: -2, xMax: 2, yMin: 5, yMax: 9 }), []);
    assert.deepEqual(recortarArco(arco, { xMin: 3, xMax: 4, yMin: -1, yMax: 2 }), []);
  });
});

describe("marcasDeEje: números redondos de Heckbert", () => {
  it("(0, 100) da paso 20", () => {
    assert.deepEqual(marcasDeEje(0, 100), { paso: 20, marcas: [0, 20, 40, 60, 80, 100] });
  });
  it("(8.1, 14.1) con objetivo 4 da 5, 10, 15", () => {
    assert.deepEqual(marcasDeEje(8.1, 14.1, 4).marcas, [5, 10, 15]);
  });
  it("(-18, 6) da enteros redondos", () => {
    const { paso, marcas } = marcasDeEje(-18, 6);
    assert.equal(paso, 10);
    assert.deepEqual(marcas, [-20, -10, 0, 10]);
  });
  it("entre 4 y 8 marcas con paso 1, 2 o 5 por potencia de 10 en rangos típicos", () => {
    const rangos: [number, number][] = [
      [1, 10],
      [0, 40],
      [-3.5, 3.5],
      [-1, 1],
      [0, 0.8],
      [-40, 5],
      [-12.5, 60],
      [2, 3],
    ];
    for (const [min, max] of rangos) {
      const { paso, marcas } = marcasDeEje(min, max);
      const mantisa = paso / 10 ** Math.floor(Math.log10(paso));
      assert.ok([1, 2, 5].some((m) => Math.abs(mantisa - m) < 1e-9), `paso ${paso} en [${min}, ${max}]`);
      assert.ok(marcas.length >= 4 && marcas.length <= 8, `${marcas.length} marcas en [${min}, ${max}]: ${marcas}`);
    }
  });
  it("las marcas no arrastran ruido decimal", () => {
    assert.deepEqual(marcasDeEje(0, 0.8).marcas, [0, 0.2, 0.4, 0.6, 0.8]);
  });
});

describe("formatoMarca", () => {
  it("usa los decimales del paso, coma decimal y signo menos Unicode", () => {
    assert.equal(formatoMarca(2, 1), "2");
    assert.equal(formatoMarca(-2, 1), "−2");
    assert.equal(formatoMarca(0.25, 0.25), "0,25");
    assert.equal(formatoMarca(1.5, 0.5), "1,5");
    assert.equal(formatoMarca(-0, 1), "0");
    assert.equal(formatoMarca(1000, 500), "1.000");
  });
});

describe("ventanaAutomatica", () => {
  const contiene = (v: Ventana, x: number, y: number) =>
    x >= v.xMin && x <= v.xMax && y >= v.yMin && y <= v.yMax;
  const redonda = (v: Ventana) => {
    for (const k of ["xMin", "xMax", "yMin", "yMax"] as const) {
      const n = v[k];
      assert.equal(n, Number(n.toFixed(6)), `${k} = ${n} no es redondo`);
    }
    assert.ok(v.xMin < v.xMax && v.yMin < v.yMax);
  };

  it("parábola alta (hasta y = 40) contiene vértice, ceros e intercepto y el origen", () => {
    const cu: CurvaFuncion = { clase: "parabola", a: -1, b: 12, c: 4 };
    const v = ventanaAutomatica([cu]);
    redonda(v);
    const vert = verticeDe(-1, 12, 4);
    assert.equal(vert.y, 40);
    assert.ok(contiene(v, vert.x, vert.y));
    for (const x of cerosDe(-1, 12, 4)) assert.ok(contiene(v, x, 0));
    assert.ok(contiene(v, 0, 4));
    assert.ok(contiene(v, 0, 0));
    assert.ok(v.yMax >= 40 && v.yMax <= 60, `yMax ${v.yMax}`);
  });

  it("parábola chata (a = 0,25) no queda en una franja degenerada", () => {
    const v = ventanaAutomatica([{ clase: "parabola", a: 0.25, b: 0, c: -1 }]);
    redonda(v);
    assert.ok(v.xMax - v.xMin >= 4);
    assert.ok(contiene(v, 2, 0) && contiene(v, -2, 0) && contiene(v, 0, -1));
  });

  it("vértice negativo profundo", () => {
    const v = ventanaAutomatica([{ clase: "parabola", a: 1, b: 0, c: -36 }]);
    redonda(v);
    assert.ok(contiene(v, 0, -36) && contiene(v, 6, 0) && contiene(v, -6, 0));
    assert.ok(v.yMin <= -36 && v.yMin >= -50, `yMin ${v.yMin}`);
  });

  it("dos curvas de escalas distintas: la ventana cubre las dos", () => {
    const v = ventanaAutomatica([
      { clase: "parabola", a: 4, b: 0, c: 0, rotulo: "f" },
      { clase: "parabola", a: 0.25, b: 0, c: 0, rotulo: "g" },
    ]);
    redonda(v);
    assert.ok(contiene(v, 0, 0));
    assert.ok(contiene(v, 2, 1) && contiene(v, -2, 1), "los brazos de la chata");
    assert.ok(contiene(v, 0.5, 1), "los brazos de la estrecha");
  });

  it("sin ceros reales la parábola igual tiene ancho; el origen a más de una holgura queda fuera", () => {
    const v = ventanaAutomatica([{ clase: "parabola", a: 1, b: 0, c: 4 }]);
    redonda(v);
    assert.ok(v.xMax - v.xMin >= 4);
    assert.ok(contiene(v, 0, 4) && contiene(v, 2, 8) && contiene(v, -2, 8));
    assert.ok(v.yMin > 0, `yMin ${v.yMin}`);
  });

  it("cero doble: la parábola igual tiene ancho e incluye el origen", () => {
    const v = ventanaAutomatica([{ clase: "parabola", a: 1, b: 0, c: 0 }]);
    redonda(v);
    assert.ok(contiene(v, 1, 1) && contiene(v, -1, 1) && contiene(v, 0, 0));
  });

  it("todo punto y segmento declarado queda dentro por construcción (propiedad que el validador no comprueba)", () => {
    const curvas: CurvaFuncion[] = [
      { clase: "parabola", a: 1, b: -4, c: 3, desde: -1, hasta: 5, rotulo: "f" },
      { clase: "recta", por: [{ x: 0, y: -1 }, { x: 4, y: 3 }], rotulo: "g" },
      { clase: "recta-vertical", x: 7, rotulo: "v" },
    ];
    const puntos = [
      { x: 100, y: 9960 },
      { x: -3, y: -12.5 },
    ];
    const segmentos = [{ desde: { x: 2, y: 0 }, hasta: { x: 2, y: -1 } }];
    const v = ventanaAutomatica(curvas, puntos, segmentos, [7, 2]);
    redonda(v);
    for (const p of puntos) assert.ok(contiene(v, p.x, p.y));
    for (const s of segmentos) assert.ok(contiene(v, s.desde.x, s.desde.y) && contiene(v, s.hasta.x, s.hasta.y));
    assert.ok(contiene(v, -1, f(1, -4, 3, -1)) && contiene(v, 5, f(1, -4, 3, 5)), "extremos de arco");
    assert.ok(v.xMin <= 7 && v.xMax >= 7, "recta vertical");
  });

  it("con desde y hasta solo cuenta lo dibujado, y el origen lejano queda fuera", () => {
    const v = ventanaAutomatica([{ clase: "parabola", a: 1, b: -40, c: 399, desde: 15, hasta: 25 }]);
    redonda(v);
    assert.ok(v.xMin > 0 && v.xMin <= 15, `xMin ${v.xMin}`);
    assert.ok(contiene(v, 15, 24) && contiene(v, 25, 24) && contiene(v, 20, -1) && contiene(v, 19, 0) && contiene(v, 21, 0));
    assert.ok(v.yMax < 399, "el intercepto (0, 399) no se dibuja y no entra");
  });

  it("sin desde ni hasta el intercepto con el eje y entra aunque quede lejos", () => {
    const v = ventanaAutomatica([{ clase: "parabola", a: 1, b: -40, c: 399 }]);
    assert.ok(v.xMin <= 0 && v.yMax >= 399);
  });

  it("es determinista", () => {
    const cu: CurvaFuncion = { clase: "parabola", a: -0.5, b: 3, c: 1 };
    assert.deepEqual(ventanaAutomatica([cu]), ventanaAutomatica([cu]));
  });
});

describe("escalaDe: escalas independientes en x e y", () => {
  it("mapea los bordes de la ventana al rectángulo interior", () => {
    const e = escalaDe({ xMin: -2, xMax: 6, yMin: 0, yMax: 40 }, 320, 240, { izq: 40, der: 10, sup: 10, inf: 30 });
    assert.equal(e.xAPixel(-2), 40);
    assert.equal(e.xAPixel(6), 310);
    assert.equal(e.yAPixel(40), 10);
    assert.equal(e.yAPixel(0), 210);
    assert.equal(e.escalaX, 270 / 8);
    assert.equal(e.escalaY, 200 / 40);
    assert.notEqual(e.escalaX, e.escalaY);
    assert.deepEqual(e.aPixel({ x: 2, y: 20 }), { x: 175, y: 110 });
  });
  it("acepta un margen único", () => {
    const e = escalaDe({ xMin: 0, xMax: 10, yMin: 0, yMax: 10 }, 120, 120, 10);
    assert.equal(e.escalaX, 10);
    assert.equal(e.escalaY, 10);
  });
});

describe("verticeDe, cerosDe, interceptoY, rectas", () => {
  it("vértice y ceros de x² − 4x + 3", () => {
    assert.deepEqual(verticeDe(1, -4, 3), { x: 2, y: -1 });
    assert.deepEqual(cerosDe(1, -4, 3), [1, 3]);
    assert.deepEqual(interceptoY(1, -4, 3), { x: 0, y: 3 });
  });
  it("cero doble y sin ceros, con tolerancia declarada", () => {
    assert.deepEqual(cerosDe(1, -4, 4), [2]);
    assert.deepEqual(cerosDe(1, 0, 1), []);
    assert.deepEqual(cerosDe(1, 0, -1e-12, 1e-9), [0]);
  });
  it("a negativo ordena las raíces de menor a mayor", () => {
    assert.deepEqual(cerosDe(-1, 0, 4), [-2, 2]);
  });
  it("coeficientesRecta desde dos puntos", () => {
    assert.deepEqual(coeficientesRecta({ clase: "recta", por: [{ x: 0, y: -1 }, { x: 4, y: 3 }] }), { m: 1, b: -1 });
    assert.deepEqual(coeficientesRecta({ clase: "recta", m: 2, b: 5 }), { m: 2, b: 5 });
  });
  it("segmentoRectaEnVentana recorta a la ventana y a [desde, hasta]", () => {
    const v: Ventana = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
    assert.deepEqual(segmentoRectaEnVentana(2, 0, v), [
      { x: -2.5, y: -5 },
      { x: 2.5, y: 5 },
    ]);
    assert.deepEqual(segmentoRectaEnVentana(0, 3, v, 0, 2), [
      { x: 0, y: 3 },
      { x: 2, y: 3 },
    ]);
    assert.equal(segmentoRectaEnVentana(0, 9, v), null);
    assert.equal(segmentoRectaEnVentana(1, 0, v, 6, 8), null);
  });
});
