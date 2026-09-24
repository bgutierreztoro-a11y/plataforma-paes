import type { Coordenada3D, FiguraCuerpoGeometrico, FiguraLienzoGeometrico, PiezaCuerpo } from "@/lib/advance/descarte";

/**
 * Muestras del cuerpo geométrico para la galería /_design. Datos INVENTADOS,
 * nunca de un banco ni de material de terceros: algunas tienen la forma de
 * una figura DEMRE del inventario (docs/analisis/material-referencia/
 * figuras-cuerpos-geometricos.md), con otras medidas. Todas pasan el
 * validador (reglas 41 a 50) en su ubicación; las dos redes van en
 * lienzo-geometrico y pasan sus reglas (28 a 39). Solo importa tipos: los
 * tests la cargan sin el cargador de TSX.
 */

type Muestra = { id: string; rotulo: string; figura: FiguraCuerpoGeometrico };
type MuestraRed = { id: string; rotulo: string; figura: FiguraLienzoGeometrico };

const P = (x: number, y: number, z: number): Coordenada3D => ({ x, y, z });
const caja = (largo: number, alto: number, ancho: number, en?: Coordenada3D): PiezaCuerpo => ({ cuerpo: "paralelepipedo", largo, alto, ancho, ...(en ? { en } : {}) });
const cubo = (arista: number, en: Coordenada3D): PiezaCuerpo => ({ cuerpo: "cubo", arista, en });

/* U de tres cajas (forma de 2026 regular n.º 47, otras medidas): columna
   izquierda de 2 × 6, piso de 6 × 2, columna derecha de 2 × 4, fondo 2. */
const U_PIEZAS: PiezaCuerpo[] = [caja(2, 6, 2), caja(6, 2, 2, P(2, 0, 0)), caja(2, 4, 2, P(8, 0, 0))];

/* La misma U dividida en sus 8 cubos de 2 cm: 3 en la columna izquierda, 3 en el piso, 2 en la derecha. */
const U_CUBOS: PiezaCuerpo[] = [
  ...[0, 2, 4].map((y) => cubo(2, P(0, y, 0))),
  ...[2, 4, 6].map((x) => cubo(2, P(x, 0, 0))),
  ...[0, 2].map((y) => cubo(2, P(8, y, 0))),
];

export const CUERPOS_MUESTRA: Muestra[] = [
  {
    id: "paralelepipedo",
    rotulo: "Paralelepípedo con sus tres cotas; las tres ocultas del vértice de atrás, punteadas",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [caja(10, 6, 4)],
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm" },
        { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "6 cm" },
        { desde: P(10, 0, 0), hasta: P(10, 0, 4), rotulo: "4 cm" },
      ],
      descripcion: "Paralelepípedo de 10 cm de largo, 6 cm de alto y 4 cm de fondo.",
    },
  },
  {
    id: "cubo",
    rotulo: "Cubo con una cota de arista",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [{ cuerpo: "cubo", arista: 5 }],
      cotas: [{ desde: P(0, 0, 0), hasta: P(5, 0, 0), rotulo: "5 cm" }],
      descripcion: "Cubo de 5 cm de arista, apoyado en una de sus caras.",
    },
  },
  {
    id: "cilindro-diametro",
    rotulo: "Cilindro con el diámetro sobre la tapa y la altura a la izquierda; el arco de atrás de la base, punteado",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [{ cuerpo: "cilindro", radio: 3, altura: 8 }],
      cotas: [
        { pieza: 0, medida: "diametro", rotulo: "6 cm" },
        { pieza: 0, medida: "altura", rotulo: "8 cm" },
      ],
      descripcion: "Cilindro recto de 6 cm de diámetro y 8 cm de altura.",
    },
  },
  {
    id: "cilindro-radio",
    rotulo: "Cilindro con el radio sobre la tapa y la altura a la derecha",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [{ cuerpo: "cilindro", radio: 4, altura: 6 }],
      cotas: [
        { pieza: 0, medida: "radio", rotulo: "4 cm" },
        { pieza: 0, medida: "altura", lado: "derecha", rotulo: "6 cm" },
      ],
      descripcion: "Cilindro recto de 4 cm de radio y 6 cm de altura.",
    },
  },
  {
    id: "ocultas-compuesto",
    rotulo: "U de tres cajas sin juntas, con seis cotas y las ocultas de atrás, algunas tapadas en parte",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: U_PIEZAS,
      cotas: [
        { desde: P(0, 0, 0), hasta: P(10, 0, 0), rotulo: "10 cm" },
        { desde: P(0, 0, 0), hasta: P(0, 6, 0), rotulo: "6 cm" },
        { desde: P(0, 6, 2), hasta: P(2, 6, 2), rotulo: "2 cm" },
        { desde: P(2, 2, 0), hasta: P(8, 2, 0), rotulo: "6 cm" },
        { desde: P(10, 0, 2), hasta: P(10, 4, 2), rotulo: "4 cm" },
        { desde: P(10, 0, 0), hasta: P(10, 0, 2), rotulo: "2 cm" },
      ],
      descripcion: "Cuerpo en forma de U de 10 cm de largo y 2 cm de fondo: una columna de 6 cm de alto a la izquierda, un piso de 2 cm y una columna de 4 cm a la derecha.",
    },
  },
  {
    id: "apilado-cilindros",
    rotulo: "Dos cilindros coaxiales, el de arriba más angosto: diámetro arriba, diámetro abajo y altura",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [
        { cuerpo: "cilindro", radio: 5, altura: 4 },
        { cuerpo: "cilindro", radio: 3.5, altura: 4 },
      ],
      cotas: [
        { pieza: 1, medida: "diametro", rotulo: "7 cm" },
        { pieza: 0, medida: "diametro", lado: "abajo", rotulo: "10 cm" },
        { pieza: 0, medida: "altura", rotulo: "4 cm" },
      ],
      descripcion: "Pieza de dos cilindros coaxiales de 4 cm de altura cada uno: el de abajo de 10 cm de diámetro y el de arriba de 7 cm.",
    },
  },
  {
    id: "apilado-chato",
    rotulo: "Cilindro chato encima: el arco de atrás de la tapa de abajo se ve entero",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [
        { cuerpo: "cilindro", radio: 5, altura: 5 },
        { cuerpo: "cilindro", radio: 3, altura: 0.8 },
      ],
      descripcion: "Cilindro de 10 cm de diámetro con un cilindro chato y más angosto encima, coaxial.",
    },
  },
  {
    id: "cajas-con-juntas",
    rotulo: "Seis bloques con juntas, sin ocultas (ocultas false), cota sin llave",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [0, 3].flatMap((y) => [0, 3, 6].map((x) => caja(3, 3, 1, P(x, y, 0)))),
      juntas: true,
      ocultas: false,
      cotas: [{ desde: P(0, 0, 0), hasta: P(3, 0, 0), rotulo: "20 cm", llave: false }],
      descripcion: "Muro de seis bloques iguales en dos filas de tres; cada bloque mide 20 cm de ancho.",
    },
  },
  {
    id: "separados",
    rotulo: "Dos cilindros separados, lado a lado, sin cotas ni ocultas",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [
        { cuerpo: "cilindro", radio: 1.5, altura: 6 },
        { cuerpo: "cilindro", radio: 4, altura: 2, x: 9 },
      ],
      ocultas: false,
      descripcion: "Dos cilindros lado a lado: uno alto y angosto, y otro bajo y ancho.",
    },
  },
  {
    id: "cota-sin-llave",
    rotulo: "Cota con llave en el largo y sin llave en la profundidad",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [caja(8, 5, 3)],
      cotas: [
        { desde: P(0, 0, 0), hasta: P(8, 0, 0), rotulo: "8 cm" },
        { desde: P(8, 0, 0), hasta: P(8, 0, 3), rotulo: "3 cm", llave: false },
      ],
      descripcion: "Paralelepípedo de 8 cm de largo, 5 cm de alto y 3 cm de fondo.",
    },
  },
  {
    id: "limite-arista-visible",
    rotulo: "Borde de la guarda de 12 px: la profundidad de la caja chica mide 12,4 px en el enunciado",
    figura: {
      tipo: "cuerpo-geometrico",
      /* Medido el 2026-09-24: 0,5 · 0,95 · s = 12,44 px en 358. */
      piezas: [caja(12, 3, 3), caja(1.9, 1.9, 0.95, P(0, 3, 0))],
      descripcion: "Caja larga con una caja chica apoyada en su extremo izquierdo.",
    },
  },
  {
    id: "limite-arista-acotada",
    rotulo: "Borde de la guarda de 24 px: la arista acotada del cubo mide 24,5 px en el enunciado",
    figura: {
      tipo: "cuerpo-geometrico",
      /* Medido el 2026-09-24: 1,06 · s = 24,49 px en 358. */
      piezas: [caja(12, 3, 3), cubo(1.06, P(0, 3, 0))],
      cotas: [{ desde: P(0, 3, 0), hasta: P(0, 4.06, 0), rotulo: "2 cm" }],
      descripcion: "Caja larga con un cubo de 2 cm de arista apoyado en su extremo izquierdo.",
    },
  },
  {
    id: "limite-razon",
    rotulo: "Borde de la razón 4: caja de 4 × 1 × 1 con la profundidad acotada",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [caja(4, 1, 1)],
      cotas: [
        { desde: P(0, 0, 0), hasta: P(4, 0, 0), rotulo: "4 m" },
        { desde: P(4, 0, 0), hasta: P(4, 0, 1), rotulo: "1 m" },
      ],
      descripcion: "Paralelepípedo de 4 m de largo, 1 m de alto y 1 m de fondo.",
    },
  },
  {
    id: "limite-cilindro-bajo",
    rotulo: "Borde bajo: altura igual a 0,25 del radio, con la altura acotada",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [{ cuerpo: "cilindro", radio: 4, altura: 1 }],
      cotas: [
        { pieza: 0, medida: "diametro", rotulo: "8 cm" },
        { pieza: 0, medida: "altura", rotulo: "1 cm" },
      ],
      descripcion: "Cilindro chato de 8 cm de diámetro y 1 cm de altura.",
    },
  },
  {
    id: "limite-cilindro-alto",
    rotulo: "Borde alto: altura igual a 8 radios, con el diámetro sobre la tapa",
    figura: {
      tipo: "cuerpo-geometrico",
      piezas: [{ cuerpo: "cilindro", radio: 1, altura: 8 }],
      cotas: [
        { pieza: 0, medida: "diametro", rotulo: "2 cm" },
        { pieza: 0, medida: "altura", rotulo: "8 cm" },
      ],
      descripcion: "Cilindro alto y angosto de 2 cm de diámetro y 8 cm de altura.",
    },
  },
];

/* Redes sobre el lienzo (D6): la cruz de un cubo de 3 cm y la red de un cilindro de 2 cm de radio. */
export const REDES_CUERPO_MUESTRA: MuestraRed[] = [
  {
    id: "red-cubo-lienzo",
    rotulo: "Red de un cubo en lienzo-geometrico: cuatro cuadrados en fila, uno arriba del segundo y otro abajo del tercero",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1, xMax: 13, yMin: -4.5, yMax: 6.5 },
      puntos: [
        ...[0, 3, 6, 9, 12].flatMap((x, i) => [
          { nombre: `A${i}`, x, y: 0, oculto: true },
          { nombre: `B${i}`, x, y: 3, oculto: true },
        ]),
        { nombre: "C1", x: 3, y: 6, oculto: true },
        { nombre: "C2", x: 6, y: 6, oculto: true },
        { nombre: "D2", x: 6, y: -3, oculto: true },
        { nombre: "D3", x: 9, y: -3, oculto: true },
      ],
      poligonos: [
        { vertices: ["A0", "A1", "B1", "B0"] },
        { vertices: ["A1", "A2", "B2", "B1"] },
        { vertices: ["A2", "A3", "B3", "B2"] },
        { vertices: ["A3", "A4", "B4", "B3"] },
        { vertices: ["B1", "B2", "C2", "C1"] },
        { vertices: ["D2", "D3", "A3", "A2"] },
      ],
      segmentos: [{ desde: "B0", hasta: "B3", rotulo: "9 cm", cota: true, lado: "interior" }],
      descripcion: "Red de un cubo de 3 cm de arista: cuatro cuadrados en fila, uno arriba del segundo y otro abajo del tercero; una llave marca 9 cm sobre tres caras.",
    },
  },
  {
    id: "red-cilindro-lienzo",
    rotulo: "Red de un cilindro en lienzo-geometrico: el manto y dos tapas tangentes en lados opuestos",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1, xMax: 13.6, yMin: -5, yMax: 7 },
      puntos: [
        { nombre: "M1", x: 0, y: 0, oculto: true },
        { nombre: "M2", x: 4 * Math.PI, y: 0, oculto: true },
        { nombre: "M3", x: 4 * Math.PI, y: 2, oculto: true },
        { nombre: "M4", x: 0, y: 2, oculto: true },
        { nombre: "O1", x: 2, y: 4, oculto: true },
        { nombre: "R1", x: 4, y: 4, oculto: true },
        { nombre: "O2", x: 4 * Math.PI - 2, y: -2, oculto: true },
      ],
      poligonos: [{ vertices: ["M1", "M2", "M3", "M4"] }],
      circunferencias: [
        { centro: "O1", radio: 2 },
        { centro: "O2", radio: 2 },
      ],
      segmentos: [
        { desde: "M4", hasta: "M3", rotulo: "4π cm", cota: true },
        { desde: "M1", hasta: "M4", rotulo: "2 cm" },
        { desde: "O1", hasta: "R1", rotulo: "2 cm", trazo: "punteado", lado: "interior" },
      ],
      descripcion: "Red de un cilindro de 2 cm de radio y 2 cm de altura: un rectángulo de 4π cm por 2 cm y dos círculos tangentes a sus lados largos, en extremos opuestos.",
    },
  },
];

/* Figura de la solución: la U de la muestra 5 dividida en sus 8 cubos (muestra la respuesta; solo va con la solución). */
export const SOLUCION_CUERPO_MUESTRA: { solucion: string; figura: FiguraCuerpoGeometrico } = {
  solucion: "MUESTRA. La U se arma con cubos de 2 cm: 3 en la columna izquierda, 3 en el piso y 2 en la columna derecha, 8 en total.",
  figura: {
    tipo: "cuerpo-geometrico",
    piezas: U_CUBOS,
    juntas: true,
    descripcion: "La misma U dividida en 8 cubos de 2 cm de arista, con las uniones dibujadas.",
  },
};
