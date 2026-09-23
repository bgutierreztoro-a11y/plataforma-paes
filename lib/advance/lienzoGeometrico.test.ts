import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { FiguraLienzoGeometrico } from "./descarte.ts";
import {
  ALTO_LLAVE,
  ANCHO_CARRIL,
  FILA_NOTA,
  LETRA,
  MARGEN,
  TOPES,
  barridoDe,
  cajaDeArco,
  choquesDeLienzo,
  conteosLienzo,
  escalaLienzo,
  fueraDeVentana,
  geometriaLienzo,
  longitudesComparables,
  parsearGrados,
  parsearLongitud,
  pathArco,
  problemasDeEscala,
  problemasDeMarcas,
  verticesVisibles,
} from "./lienzoGeometrico.ts";

/* Motor del lienzo geométrico. Datos inventados. Se afirman relaciones (el
   rótulo queda afuera, del otro lado, más lejos; el dibujo calza o no calza),
   no píxeles: un cambio legítimo de margen o de separación no rompe nada.
   Medido el 2026-09-23 con MARGEN 20 y SEPARACION 5: en el triángulo base, a
   358 px, la escala es de 31,8 px por unidad y el alto de 294,4 px. */

const base = (cambios: Partial<FiguraLienzoGeometrico> = {}): FiguraLienzoGeometrico => ({
  tipo: "lienzo-geometrico",
  ventana: { xMin: -1, xMax: 9, yMin: -1, yMax: 7 },
  puntos: [
    { nombre: "A", x: 0, y: 0 },
    { nombre: "B", x: 8, y: 0 },
    { nombre: "C", x: 0, y: 6 },
  ],
  poligonos: [{ id: "t", vertices: ["A", "B", "C"] }],
  segmentos: [
    { desde: "A", hasta: "B", rotulo: "8 cm" },
    { desde: "A", hasta: "C", rotulo: "6 cm" },
  ],
  angulos: [{ vertice: "A", desde: "B", hasta: "C", marca: "recto" }],
  descripcion: "Triángulo rectángulo de prueba con catetos rotulados, datos inventados.",
  ...cambios,
});

const rotulo = (fig: FiguraLienzoGeometrico, texto: string, contexto: "enunciado" | "alternativa" = "enunciado") => {
  const r = geometriaLienzo(fig, contexto).rotulos.find((x) => x.texto === texto);
  assert.ok(r, `sin rótulo ${texto}`);
  return r;
};
const punto = (fig: FiguraLienzoGeometrico, nombre: string) => geometriaLienzo(fig).puntos.get(nombre) as { x: number; y: number };

describe("parsearLongitud: las formas firmadas (13d)", () => {
  it("entero, decimal con coma, punto de miles, fracción, raíces y π, con y sin unidad", () => {
    const casos: [string, number, string | null][] = [
      ["7", 7, null],
      ["2,5 m", 2.5, "m"],
      ["1.250 cm", 1250, "cm"],
      ["3/4", 0.75, null],
      ["√13", Math.sqrt(13), null],
      ["3√2 cm", 3 * Math.sqrt(2), "cm"],
      ["12π", 12 * Math.PI, null],
      ["π mm", Math.PI, "mm"],
      ["3π/2 km", (3 * Math.PI) / 2, "km"],
      ["π/4", Math.PI / 4, null],
      ["9 u", 9, "u"],
    ];
    for (const [texto, valor, unidad] of casos) {
      const l = parsearLongitud(texto);
      assert.ok(l, texto);
      assert.ok(Math.abs(l.valor - valor) < 1e-12, texto);
      assert.equal(l.unidad, unidad, texto);
    }
  });

  it("letras que no son unidad, expresiones, áreas y ángulos no son longitudes verificables", () => {
    for (const texto of ["x", "h", "2x + 1", "a cm", "m", "u", "12 cm²", "40°", "√(2)", ""]) assert.equal(parsearLongitud(texto), null, texto);
  });

  it("los grados se leen aparte y con coma", () => {
    assert.equal(parsearGrados("40°"), 40);
    assert.equal(parsearGrados("12,5 °"), 12.5);
    assert.equal(parsearGrados("α"), null);
    assert.equal(parsearGrados("40"), null);
  });

  it("con unidades mezcladas manda la primera física; sin unidad y u se leen en ella", () => {
    assert.deepEqual(longitudesComparables(["1,3 m", "60 cm"]), [1.3, 0.6]);
    assert.deepEqual(longitudesComparables(["5", "3 cm", "x"]), [5, 3, null]);
    assert.deepEqual(longitudesComparables(["4 u", "2"]), [4, 2]);
  });
});

describe("escalaLienzo: una escala para x e y, fijada por el ancho del carril", () => {
  it("el viewBox mide el carril de la ubicación y la letra es de 12", () => {
    assert.equal(LETRA, 12);
    assert.ok(ANCHO_CARRIL.alternativa < ANCHO_CARRIL.solucion && ANCHO_CARRIL.solucion < ANCHO_CARRIL.enunciado);
    for (const contexto of ["enunciado", "alternativa", "solucion"] as const) {
      const e = escalaLienzo(base(), contexto);
      assert.equal(e.ancho, ANCHO_CARRIL[contexto]);
      assert.ok(Math.abs(e.s * 10 + 2 * MARGEN - e.ancho) < 1e-9);
    }
  });

  it("la misma unidad mide lo mismo en x y en y, y el alto crece con la ventana en y", () => {
    const e = escalaLienzo(base());
    const a = e.aPx({ x: 0, y: 0 });
    const b = e.aPx({ x: 3, y: 0 });
    const c = e.aPx({ x: 0, y: 3 });
    assert.ok(Math.abs(b.x - a.x - (a.y - c.y)) < 1e-9);
    assert.ok(escalaLienzo(base({ ventana: { xMin: -1, xMax: 9, yMin: -1, yMax: 9 } })).alto > e.alto);
  });

  it("aEscala false suma la fila de la nota", () => {
    assert.equal(escalaLienzo(base({ aEscala: false })).alto - escalaLienzo(base()).alto, FILA_NOTA);
    assert.notEqual(geometriaLienzo(base({ aEscala: false })).nota, null);
    assert.equal(geometriaLienzo(base()).nota, null);
  });
});

describe("rótulos: hacia afuera de la figura (13b)", () => {
  it("cada vértice del triángulo lleva su nombre más lejos del centro que el vértice", () => {
    const fig = base();
    const g = geometriaLienzo(fig);
    const centro = { x: (punto(fig, "A").x + punto(fig, "B").x + punto(fig, "C").x) / 3, y: (punto(fig, "A").y + punto(fig, "B").y + punto(fig, "C").y) / 3 };
    for (const n of ["A", "B", "C"]) {
      const p = g.puntos.get(n) as { x: number; y: number };
      const r = rotulo(fig, n);
      assert.ok(Math.hypot(r.x - centro.x, r.y - centro.y) > Math.hypot(p.x - centro.x, p.y - centro.y), n);
    }
  });

  it("en la esquina interior de una L el nombre va afuera, no al mayor ángulo libre", () => {
    const L = base({
      ventana: { xMin: -1, xMax: 7, yMin: -1, yMax: 6 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 6, y: 0 },
        { nombre: "C", x: 6, y: 2 },
        { nombre: "D", x: 2, y: 2 },
        { nombre: "E", x: 2, y: 5 },
        { nombre: "F", x: 0, y: 5 },
      ],
      poligonos: [{ vertices: ["A", "B", "C", "D", "E", "F"] }],
      segmentos: [],
      angulos: [],
    });
    const d = punto(L, "D");
    const r = rotulo(L, "D");
    /* Afuera de la L en D es arriba a la derecha: x mayor, y de pantalla menor. */
    assert.ok(r.x > d.x && r.y < d.y);
  });

  it("el rótulo de un lado va del lado de afuera; con lado interior, adentro", () => {
    const fig = base();
    const a = punto(fig, "A");
    const b = punto(fig, "B");
    const c = punto(fig, "C");
    assert.ok(rotulo(fig, "8 cm").y > a.y, "la base rotula abajo");
    const adentro = base({ segmentos: [{ desde: "A", hasta: "B", rotulo: "8 cm", lado: "interior" }] });
    assert.ok(rotulo(adentro, "8 cm").y < a.y, "con lado interior rotula arriba");
    assert.ok(rotulo(fig, "6 cm").x < a.x, "el cateto vertical rotula a la izquierda");
    const hip = base({ segmentos: [{ desde: "B", hasta: "C", rotulo: "10 cm" }] });
    const m = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
    const r = rotulo(hip, "10 cm");
    assert.ok(r.x > m.x && r.y < m.y, "la hipotenusa rotula hacia arriba a la derecha");
  });

  it("en un lado de la L que mira hacia la esquina interior, el rótulo también va afuera", () => {
    const L = base({
      ventana: { xMin: -1, xMax: 7, yMin: -1, yMax: 6 },
      puntos: [
        { nombre: "A", x: 0, y: 0, oculto: true },
        { nombre: "B", x: 6, y: 0, oculto: true },
        { nombre: "C", x: 6, y: 2, oculto: true },
        { nombre: "D", x: 2, y: 2, oculto: true },
        { nombre: "E", x: 2, y: 5, oculto: true },
        { nombre: "F", x: 0, y: 5, oculto: true },
      ],
      poligonos: [{ vertices: ["A", "B", "C", "D", "E", "F"] }],
      segmentos: [{ desde: "C", hasta: "D", rotulo: "4 m" }],
      angulos: [],
    });
    assert.ok(rotulo(L, "4 m").y < punto(L, "C").y, "el lado CD rotula hacia arriba, fuera de la L");
  });

  it("ubicacion manda sobre el cálculo", () => {
    const fig = base({ puntos: [{ nombre: "A", x: 0, y: 0, ubicacion: "n" }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: 0, y: 6 }] });
    const a = punto(fig, "A");
    const r = rotulo(fig, "A");
    assert.ok(Math.abs(r.x - a.x) < 1e-9 && r.y < a.y);
  });

  it("un punto oculto no lleva rótulo y no cuenta como rótulo", () => {
    const fig = base({ puntos: [{ nombre: "A", x: 0, y: 0, oculto: true }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: 0, y: 6 }] });
    assert.equal(geometriaLienzo(fig).rotulos.some((r) => r.texto === "A"), false);
    assert.equal(conteosLienzo(fig).rotulos, conteosLienzo(base()).rotulos - 1);
  });

  it("el rótulo de un ángulo va sobre la bisectriz y, si el ángulo es chico, más lejos del vértice", () => {
    const conAngulo = (y: number) =>
      base({ puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: 8, y }], segmentos: [], poligonos: [{ vertices: ["A", "B", "C"] }], angulos: [{ vertice: "A", desde: "B", hasta: "C", marca: "arco", rotulo: "α" }] });
    const ancho = conAngulo(6);
    const chico = conAngulo(1.5);
    const dist = (fig: FiguraLienzoGeometrico) => {
      const a = punto(fig, "A");
      const r = rotulo(fig, "α");
      return Math.hypot(r.x - a.x, r.y - a.y);
    };
    assert.ok(dist(chico) > dist(ancho));
    /* Sobre la bisectriz: el ángulo entre (rótulo − A) y cada rayo es la mitad del ángulo. */
    const a = punto(ancho, "A");
    const r = rotulo(ancho, "α");
    const ang = (u: { x: number; y: number }, v: { x: number; y: number }) => (Math.acos((u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y))) * 180) / Math.PI;
    const aR = { x: r.x - a.x, y: r.y - a.y };
    const b = punto(ancho, "B");
    const c = punto(ancho, "C");
    assert.ok(Math.abs(ang(aR, { x: b.x - a.x, y: b.y - a.y }) - ang(aR, { x: c.x - a.x, y: c.y - a.y })) < 0.5);
  });

  it("una cota aleja el rótulo del segmento lo que mide la llave, y dibuja la llave", () => {
    const sin = base();
    const con = base({ segmentos: [{ desde: "A", hasta: "B", rotulo: "8 cm", cota: true }, { desde: "A", hasta: "C", rotulo: "6 cm" }] });
    assert.ok(rotulo(con, "8 cm").y - rotulo(sin, "8 cm").y >= ALTO_LLAVE);
    assert.ok(geometriaLienzo(con).segmentos[0].llave);
    assert.equal(geometriaLienzo(sin).segmentos[0].llave, null);
  });

  it("un suelo achurado colineal del mismo lado empuja la cota del segmento que va encima", () => {
    const puntos = [
      { nombre: "P", x: -0.5, y: 0, oculto: true },
      { nombre: "Q", x: 8.5, y: 0, oculto: true },
      { nombre: "A", x: 0, y: 0, oculto: true },
      { nombre: "B", x: 8, y: 0, oculto: true },
      { nombre: "C", x: 8, y: 6, oculto: true },
    ];
    const sinSuelo = base({ puntos, poligonos: [{ vertices: ["A", "B", "C"] }], segmentos: [{ desde: "A", hasta: "B", rotulo: "8 m", cota: true }], angulos: [] });
    const conSuelo = base({ puntos, poligonos: [{ vertices: ["A", "B", "C"] }], segmentos: [{ desde: "P", hasta: "Q", achurado: true }, { desde: "A", hasta: "B", rotulo: "8 m", cota: true }], angulos: [] });
    assert.ok(rotulo(conSuelo, "8 m").y > rotulo(sinSuelo, "8 m").y);
    assert.ok(geometriaLienzo(conSuelo).segmentos[0].achurado);
  });

  it("los textos libres quedan centrados en su coordenada", () => {
    const fig = base({ textos: [{ texto: "R", x: 2, y: 2 }] });
    const p = escalaLienzo(fig).aPx({ x: 2, y: 2 });
    const r = rotulo(fig, "R");
    assert.ok(Math.abs(r.x - p.x) < 1e-9 && Math.abs(r.y - p.y) < 1e-9);
  });
});

describe("choquesDeLienzo (regla 33)", () => {
  it("el triángulo base no tiene choques en el enunciado ni en una alternativa", () => {
    assert.deepEqual(choquesDeLienzo(base()), []);
    assert.deepEqual(choquesDeLienzo(base(), "alternativa"), []);
  });

  it("dos puntos casi encima se pisan y tapan un vértice, y el mensaje los nombra", () => {
    const fig = base({ puntos: [...base().puntos, { nombre: "D", x: 0.2, y: -0.1 }] });
    const choques = choquesDeLienzo(fig);
    assert.ok(choques.some((c) => c.clase === "rotulos" && [c.a, c.b].includes("D")));
  });

  it("un rótulo largo contra el borde de la ventana se sale del lienzo; con aire en la ventana, no", () => {
    const justa = base({ ventana: { xMin: 0, xMax: 9, yMin: -1, yMax: 7 } });
    assert.ok(choquesDeLienzo(justa).some((c) => c.clase === "fuera" && c.a === "6 cm"));
    assert.equal(choquesDeLienzo(base()).some((c) => c.clase === "fuera"), false);
  });
});

describe("verticesVisibles: lo que un rótulo no puede tapar", () => {
  it("vértices de polígono, extremos de segmento, centros de sector, marcados y nombrados sí; un centro oculto de circunferencia no", () => {
    const fig = base({
      puntos: [
        ...base().puntos,
        { nombre: "O", x: 3, y: 2, oculto: true },
        { nombre: "S", x: 6, y: 5, oculto: true },
        { nombre: "M", x: 7, y: 5, oculto: true, marca: true },
        { nombre: "Z", x: 1, y: 1, oculto: true },
      ],
      circunferencias: [{ centro: "O", radio: 1 }],
      arcos: [{ clase: "sector", centro: "S", radio: 0.5, desde: 0, hasta: 90 }],
      segmentos: [{ desde: "A", hasta: "Z", trazo: "punteado" }],
    });
    const v = verticesVisibles(fig);
    for (const n of ["A", "B", "C", "S", "M", "Z"]) assert.ok(v.has(n), n);
    assert.equal(v.has("O"), false);
  });
});

describe("problemasDeEscala (regla 31)", () => {
  it("rótulos que calzan no reclaman; uno 2 % largo sí; con aEscala false nada", () => {
    assert.deepEqual(problemasDeEscala(base()), []);
    const largo = base({ puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8.16, y: 0 }, { nombre: "C", x: 0, y: 6 }] });
    assert.deepEqual(problemasDeEscala(largo).map((p) => p.clase), ["longitud"]);
    assert.deepEqual(problemasDeEscala({ ...largo, aEscala: false }), []);
  });

  it("dentro del 1 % pasa", () => {
    const casi = base({ puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8.05, y: 0 }, { nombre: "C", x: 0, y: 6 }] });
    assert.deepEqual(problemasDeEscala(casi), []);
  });

  it("un rótulo con letras no se verifica", () => {
    assert.deepEqual(problemasDeEscala(base({ segmentos: [{ desde: "A", hasta: "B", rotulo: "x" }] })), []);
  });

  it("en un arco se compara con la longitud del arco; en grados, con el barrido", () => {
    const arco = (rot: string) => base({ puntos: [{ nombre: "O", x: 3, y: 3 }], poligonos: [], segmentos: [], angulos: [], arcos: [{ clase: "sector", centro: "O", radio: 2, desde: 0, hasta: 90, rotulo: rot }] });
    assert.deepEqual(problemasDeEscala(arco("π")), []);
    assert.deepEqual(problemasDeEscala(arco("2π")).map((p) => p.clase), ["arco"]);
    assert.deepEqual(problemasDeEscala(arco("90°")), []);
    assert.deepEqual(problemasDeEscala(arco("80°")).map((p) => p.clase), ["grados"]);
  });

  it("un ángulo rotulado en grados calza con ± 1°", () => {
    const fig = (rot: string) => base({ angulos: [{ vertice: "A", desde: "B", hasta: "C", marca: "arco", rotulo: rot }] });
    assert.deepEqual(problemasDeEscala(fig("90°")), []);
    assert.deepEqual(problemasDeEscala(fig("88°")).map((p) => p.clase), ["grados"]);
  });

  it("segmentos con la misma marca de igualdad miden lo mismo", () => {
    const iguales = base({ segmentos: [{ desde: "A", hasta: "B", igualdad: 2 }, { desde: "A", hasta: "C", igualdad: 2 }] });
    assert.deepEqual(problemasDeEscala(iguales).map((p) => p.clase), ["igualdad"]);
    const cuadrado = base({
      puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 5, y: 0 }, { nombre: "C", x: 5, y: 5 }],
      segmentos: [{ desde: "A", hasta: "B", igualdad: 1 }, { desde: "B", hasta: "C", igualdad: 1 }],
      angulos: [],
    });
    assert.deepEqual(problemasDeEscala(cuadrado), []);
  });
});

describe("problemasDeMarcas (regla 32): valen a escala o no", () => {
  it("la marca de ángulo recto en 90° pasa; en 91°, no, aunque aEscala sea false", () => {
    assert.deepEqual(problemasDeMarcas(base()), []);
    const torcido = base({ aEscala: false, puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: -0.105, y: 6 }] });
    assert.deepEqual(problemasDeMarcas(torcido).map((p) => p.clase), ["recto"]);
  });

  it("paralelas marcadas: 0,3° de desvío pasa, 1° no", () => {
    const par = (dy: number) =>
      base({
        puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: 0, y: 3 }, { nombre: "D", x: 8, y: 3 + dy }],
        poligonos: [],
        angulos: [],
        segmentos: [{ desde: "A", hasta: "B", paralelismo: 1 }, { desde: "C", hasta: "D", paralelismo: 1 }],
      });
    assert.deepEqual(problemasDeMarcas(par(8 * Math.tan((0.3 * Math.PI) / 180))), []);
    assert.deepEqual(problemasDeMarcas(par(8 * Math.tan((1 * Math.PI) / 180))).map((p) => p.clase), ["paralelismo"]);
  });

  it("una marca en un ángulo llano se rechaza", () => {
    const llano = base({ puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: -4, y: 0 }], poligonos: [], segmentos: [], angulos: [{ vertice: "A", desde: "B", hasta: "C", marca: "arco" }] });
    assert.deepEqual(problemasDeMarcas(llano).map((p) => p.clase), ["llano"]);
  });
});

describe("arcos y sectores", () => {
  it("el barrido va de desde a hasta en sentido antihorario", () => {
    assert.equal(barridoDe({ desde: 0, hasta: 90 }), 90);
    assert.equal(barridoDe({ desde: 350, hasta: 10 }), 20);
    assert.equal(barridoDe({ desde: 90, hasta: 0 }), 270);
    assert.equal(barridoDe({ desde: 0, hasta: 360 }), 360);
  });

  it("antihorario en el mundo es sweep-flag 0; más de 180° lleva large-arc 1; el sector cierra en el centro", () => {
    const c = { x: 100, y: 100 };
    assert.match(pathArco({ clase: "arco", radio: 1, desde: 0, hasta: 180 }, c, 50), / 0 0 0 /);
    assert.match(pathArco({ clase: "arco", radio: 1, desde: 0, hasta: 270 }, c, 50), / 0 1 0 /);
    const sector = pathArco({ clase: "sector", radio: 1, desde: 0, hasta: 90 }, c, 50);
    assert.ok(sector.startsWith("M 100 100") && sector.endsWith("Z"));
    /* El cuarto de 0° a 90° sube: su segundo extremo queda arriba del centro en pantalla. */
    assert.match(pathArco({ clase: "arco", radio: 1, desde: 0, hasta: 90 }, c, 50), /100 50$/);
  });

  it("la caja de un arco incluye los extremos de los ejes que cruza; la del sector, el centro", () => {
    const o = { x: 0, y: 0 };
    assert.deepEqual(cajaDeArco({ clase: "arco", centro: "O", radio: 2, desde: 45, hasta: 135 }, o).yMax, 2);
    const s = cajaDeArco({ clase: "sector", centro: "O", radio: 2, desde: 10, hasta: 80 }, o);
    assert.equal(s.xMin, 0);
    assert.equal(s.yMin, 0);
  });
});

describe("fueraDeVentana (regla 30)", () => {
  it("una circunferencia que asoma y un texto fuera se nombran; lo que cabe no", () => {
    const fig = base({ circunferencias: [{ centro: "B", radio: 2 }], textos: [{ texto: "R", x: 12, y: 0 }] });
    const fuera = fueraDeVentana(fig);
    assert.equal(fuera.length, 2);
    assert.ok(fuera[0].startsWith("circunferencias[0]"));
    assert.deepEqual(fueraDeVentana(base()), []);
  });
});

describe("regiones, cuadrícula y conteos", () => {
  it("una región resuelve sus formas y huecos por id y el estilo por defecto es rayado", () => {
    const fig = base({
      puntos: [{ nombre: "A", x: 0, y: 0 }, { nombre: "B", x: 8, y: 0 }, { nombre: "C", x: 8, y: 6 }, { nombre: "D", x: 0, y: 6 }, { nombre: "O", x: 4, y: 3, oculto: true }],
      poligonos: [{ id: "r", vertices: ["A", "B", "C", "D"] }],
      circunferencias: [{ id: "c", centro: "O", radio: 2 }],
      segmentos: [],
      angulos: [],
      regiones: [{ formas: ["r"], huecos: ["c"] }],
    });
    const [reg] = geometriaLienzo(fig).regiones;
    assert.equal(reg.estilo, "rayado");
    assert.equal(reg.formas[0].clase, "path");
    assert.equal(reg.huecos[0].clase, "circulo");
  });

  it("la cuadrícula traza una línea por múltiplo del paso dentro de la ventana", () => {
    const fig = base({ ventana: { xMin: 0, xMax: 4, yMin: 0, yMax: 3 }, puntos: [{ nombre: "A", x: 1, y: 1 }], poligonos: [], segmentos: [], angulos: [], cuadricula: { paso: 1 } });
    assert.equal(geometriaLienzo(fig).cuadricula.length, 5 + 4);
  });

  it("los topes de una alternativa son menores que los del enunciado en todo", () => {
    for (const k of ["puntos", "segmentos", "formas", "rotulos"] as const) {
      assert.ok(TOPES.alternativa[k] < TOPES.enunciado[k]);
      assert.equal(TOPES.solucion[k], TOPES.enunciado[k]);
    }
  });

  it("cuenta puntos, segmentos, formas y rótulos visibles", () => {
    const fig = base({ textos: [{ texto: "R", x: 2, y: 2 }], arcos: [{ clase: "arco", centro: "A", radio: 1, desde: 0, hasta: 90, rotulo: "π/2" }] });
    assert.deepEqual(conteosLienzo(fig), { puntos: 3, segmentos: 2, formas: 2, rotulos: 3 + 2 + 1 + 1 });
  });
});
