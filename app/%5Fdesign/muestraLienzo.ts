import type { FiguraLienzoGeometrico, ItemAdvance, PuntoLienzo, SegmentoLienzo } from "@/lib/advance/descarte";
import { protegerExpresiones } from "@/lib/advance/protegerExpresiones";

/**
 * Muestras del lienzo geométrico para la galería /_design. Datos INVENTADOS,
 * nunca de un banco ni de material de terceros. Todas pasan el validador
 * (reglas 28 a 39) en su ubicación; las coordenadas que salen de un cálculo
 * (un triángulo por sus lados, un ángulo por su medida) se calculan acá para
 * que el rótulo calce con lo dibujado.
 */

type Muestra = { id: string; rotulo: string; figura: FiguraLienzoGeometrico };

const rad = (g: number) => (g * Math.PI) / 180;

/** Triángulo por sus tres lados: base sobre el eje x desde el origen; `izq` es el lado que sale del origen. */
function verticesPorLados(base: number, izq: number, der: number): PuntoLienzo[] {
  const x = (base * base + izq * izq - der * der) / (2 * base);
  return [
    { nombre: "P", x: 0, y: 0, oculto: true },
    { nombre: "Q", x: base, y: 0, oculto: true },
    { nombre: "R", x, y: Math.sqrt(izq * izq - x * x), oculto: true },
  ];
}

const triangulo = (base: number, izq: number, der: number, descripcion: string): FiguraLienzoGeometrico => ({
  tipo: "lienzo-geometrico",
  ventana: { xMin: -1.2, xMax: 11.2, yMin: -1.2, yMax: 5.8 },
  puntos: verticesPorLados(base, izq, der),
  poligonos: [{ vertices: ["P", "Q", "R"] }],
  segmentos: [
    { desde: "P", hasta: "Q", rotulo: `${base} cm` },
    { desde: "P", hasta: "R", rotulo: `${izq} cm` },
    { desde: "Q", hasta: "R", rotulo: `${der} cm` },
  ],
  descripcion,
});

/* Ángulos de 60° en A y 40° en B: C sale por el teorema del seno sobre AB = 10. */
const ladoAC = (10 * Math.sin(rad(40))) / Math.sin(rad(80));

/* El caso de densidad máxima: 24 puntos, 24 segmentos, 10 formas y 20 rótulos, los topes del enunciado. */
function densidadMaxima(): FiguraLienzoGeometrico {
  const xs = [0, 4, 8, 12, 16];
  const abajo = xs.map((x, i) => ({ nombre: `B${i}`, x, y: 0, oculto: i !== 0 && i !== 4 }));
  const arriba = xs.map((x, i) => ({ nombre: `T${i}`, x, y: 8, oculto: i !== 0 && i !== 4 }));
  const centros = [2, 5, 8, 11, 14].flatMap((x, i) => [
    { nombre: `C${i}`, x, y: 2, oculto: true },
    { nombre: `D${i}`, x, y: 6, oculto: true },
  ]);
  const medios: PuntoLienzo[] = [
    { nombre: "L", x: 0, y: 4, oculto: true },
    { nombre: "M1", x: 4, y: 4, oculto: true },
    { nombre: "M2", x: 8, y: 4, oculto: true },
    { nombre: "R", x: 16, y: 4, oculto: true },
  ];
  const tramo = (a: string, b: string, extra: Partial<SegmentoLienzo> = {}): SegmentoLienzo => ({ desde: a, hasta: b, ...extra });
  const segmentos: SegmentoLienzo[] = [
    ...[0, 1, 2, 3].map((i) => tramo(`B${i}`, `B${i + 1}`, { rotulo: "4 m" })),
    ...[0, 1, 2, 3].map((i) => tramo(`T${i}`, `T${i + 1}`, { rotulo: "4 m" })),
    tramo("B0", "L"),
    tramo("L", "T0"),
    tramo("B4", "R"),
    tramo("R", "T4"),
    ...["L-M1", "M1-M2", "M2-R", "B1-T1", "B2-T2", "B3-T3", "B0-M1", "M1-T0", "B4-M2", "M2-T4", "B1-M2", "M2-T1"].map((par) => {
      const [a, b] = par.split("-");
      return tramo(a, b, { trazo: "punteado" });
    }),
  ];
  return {
    tipo: "lienzo-geometrico",
    ventana: { xMin: -2, xMax: 18, yMin: -2, yMax: 10 },
    puntos: [...abajo, ...arriba, ...centros, ...medios],
    segmentos,
    circunferencias: centros.map((c) => ({ centro: c.nombre, radio: 1.1 })),
    textos: centros.slice(0, 8).map((c, i) => ({ texto: "ABCDEFGH"[i], x: c.x, y: c.y })),
    descripcion: "Rectángulo de 16 m por 8 m con tramos de 4 m rotulados, líneas auxiliares y diez círculos, ocho de ellos con una letra.",
  };
}

export const LIENZOS_MUESTRA: Muestra[] = [
  {
    id: "triangulo-rectangulo",
    rotulo: "Triángulo rectángulo con los catetos rotulados, marca de ángulo recto y la hipotenusa x",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -2, xMax: 17, yMin: -2, yMax: 10 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 15, y: 0 },
        { nombre: "C", x: 0, y: 8 },
      ],
      poligonos: [{ vertices: ["A", "B", "C"] }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "15 cm" },
        { desde: "A", hasta: "C", rotulo: "8 cm" },
        { desde: "B", hasta: "C", rotulo: "x" },
      ],
      angulos: [{ vertice: "A", desde: "B", hasta: "C", marca: "recto" }],
      descripcion: "Triángulo ABC con ángulo recto en A; los catetos miden 15 cm y 8 cm y la hipotenusa se llama x.",
    },
  },
  {
    id: "compuesto-l",
    rotulo: "Polígono compuesto en L con un lado sin rótulo",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1.6, xMax: 10.6, yMin: -1.4, yMax: 8.2 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 9, y: 0 },
        { nombre: "C", x: 9, y: 3 },
        { nombre: "D", x: 4, y: 3 },
        { nombre: "E", x: 4, y: 7 },
        { nombre: "F", x: 0, y: 7 },
      ],
      poligonos: [{ vertices: ["A", "B", "C", "D", "E", "F"] }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "9 m" },
        { desde: "B", hasta: "C", rotulo: "3 m" },
        { desde: "C", hasta: "D", rotulo: "5 m" },
        { desde: "D", hasta: "E", rotulo: "4 m" },
        { desde: "F", hasta: "A", rotulo: "7 m" },
      ],
      angulos: [{ vertice: "A", desde: "B", hasta: "F", marca: "recto" }],
      descripcion: "Polígono en L de vértices A a F; todos los lados rotulados menos EF, el de arriba.",
    },
  },
  {
    id: "rectangulo-menos-semicirculos",
    rotulo: "Rectángulo menos dos semicírculos, sombreado",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1.5, xMax: 11.5, yMin: -1.5, yMax: 5.5 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 10, y: 0 },
        { nombre: "C", x: 10, y: 4 },
        { nombre: "D", x: 0, y: 4 },
        { nombre: "O", x: 0, y: 2, oculto: true },
        { nombre: "P", x: 10, y: 2, oculto: true },
      ],
      poligonos: [{ id: "rectangulo", vertices: ["A", "B", "C", "D"] }],
      arcos: [
        { id: "izquierdo", clase: "sector", centro: "O", radio: 2, desde: -90, hasta: 90 },
        { id: "derecho", clase: "sector", centro: "P", radio: 2, desde: 90, hasta: 270 },
      ],
      regiones: [{ formas: ["rectangulo"], huecos: ["izquierdo", "derecho"] }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "10 cm" },
        { desde: "B", hasta: "C", rotulo: "4 cm" },
      ],
      descripcion: "Rectángulo ABCD de 10 cm por 4 cm con dos semicírculos quitados en los lados cortos; la parte que queda está sombreada.",
    },
  },
  {
    id: "cuadrado-menos-cuartos",
    rotulo: "Cuadrado menos cuatro cuartos de círculo, trama de puntos",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -3, xMax: 11, yMin: -1.2, yMax: 9.2 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 8, y: 0 },
        { nombre: "C", x: 8, y: 8 },
        { nombre: "D", x: 0, y: 8 },
        { nombre: "R", x: 3 * Math.cos(rad(45)), y: 3 * Math.sin(rad(45)), oculto: true },
      ],
      poligonos: [{ id: "cuadrado", vertices: ["A", "B", "C", "D"] }],
      arcos: [
        { id: "q1", clase: "sector", centro: "A", radio: 3, desde: 0, hasta: 90 },
        { id: "q2", clase: "sector", centro: "B", radio: 3, desde: 90, hasta: 180 },
        { id: "q3", clase: "sector", centro: "C", radio: 3, desde: 180, hasta: 270 },
        { id: "q4", clase: "sector", centro: "D", radio: 3, desde: 270, hasta: 360 },
      ],
      regiones: [{ formas: ["cuadrado"], huecos: ["q1", "q2", "q3", "q4"], estilo: "punteado" }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "8 cm" },
        { desde: "A", hasta: "R", trazo: "punteado", rotulo: "3 cm", lado: "interior" },
      ],
      descripcion: "Cuadrado ABCD de 8 cm con un cuarto de círculo de 3 cm de radio quitado en cada esquina; el resto está sombreado.",
    },
  },
  {
    id: "trapecio-altura",
    rotulo: "Trapecio con la altura punteada y su ángulo recto",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1.5, xMax: 13.5, yMin: -1.5, yMax: 6.5 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 12, y: 0 },
        { nombre: "C", x: 9, y: 5 },
        { nombre: "D", x: 3, y: 5 },
        { nombre: "H", x: 3, y: 0, oculto: true },
      ],
      poligonos: [{ vertices: ["A", "B", "C", "D"] }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "12 cm" },
        { desde: "D", hasta: "C", rotulo: "6 cm" },
        { desde: "D", hasta: "H", trazo: "punteado", rotulo: "5 cm", lado: "interior" },
      ],
      angulos: [{ vertice: "H", desde: "B", hasta: "D", marca: "recto" }],
      descripcion: "Trapecio ABCD de bases 12 cm y 6 cm; la altura DH, punteada, mide 5 cm.",
    },
  },
  {
    id: "cuadricula",
    rotulo: "Figura en cuadrícula de paso 1, sombreada y sin rótulos",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: 0, xMax: 10, yMin: 0, yMax: 6 },
      cuadricula: { paso: 1 },
      puntos: [
        { nombre: "P1", x: 1, y: 1, oculto: true },
        { nombre: "P2", x: 6, y: 1, oculto: true },
        { nombre: "P3", x: 6, y: 3, oculto: true },
        { nombre: "P4", x: 4, y: 5, oculto: true },
        { nombre: "P5", x: 1, y: 5, oculto: true },
      ],
      poligonos: [{ id: "figura", vertices: ["P1", "P2", "P3", "P4", "P5"] }],
      regiones: [{ formas: ["figura"] }],
      descripcion: "Pentágono sombreado dibujado sobre una cuadrícula de 10 por 6 cuadros, con vértices en los cruces.",
    },
  },
  {
    id: "angulos",
    rotulo: "Ángulos con arco: dos en grados y el tercero, x",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1.5, xMax: 11.5, yMin: -1.5, yMax: 7 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 10, y: 0 },
        { nombre: "C", x: ladoAC * Math.cos(rad(60)), y: ladoAC * Math.sin(rad(60)) },
      ],
      poligonos: [{ vertices: ["A", "B", "C"] }],
      angulos: [
        { vertice: "A", desde: "B", hasta: "C", marca: "arco", rotulo: "60°" },
        { vertice: "B", desde: "C", hasta: "A", marca: "arco", rotulo: "40°" },
        { vertice: "C", desde: "A", hasta: "B", marca: "arco", rotulo: "x" },
      ],
      descripcion: "Triángulo ABC con un ángulo de 60° en A, uno de 40° en B y el ángulo x en C.",
    },
  },
  {
    id: "igualdad-paralelismo",
    rotulo: "Paralelogramo con marcas de igualdad y de paralelismo",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1.5, xMax: 11.5, yMin: -1.5, yMax: 5.5 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 8, y: 0 },
        { nombre: "C", x: 10, y: 4 },
        { nombre: "D", x: 2, y: 4 },
      ],
      poligonos: [{ vertices: ["A", "B", "C", "D"] }],
      segmentos: [
        { desde: "A", hasta: "B", igualdad: 1, paralelismo: 1 },
        { desde: "D", hasta: "C", igualdad: 1, paralelismo: 1 },
        { desde: "A", hasta: "D", igualdad: 2, paralelismo: 2 },
        { desde: "B", hasta: "C", igualdad: 2, paralelismo: 2 },
      ],
      descripcion: "Paralelogramo ABCD: AB y DC con una raya y una flecha, AD y BC con dos rayas y dos flechas.",
    },
  },
  {
    id: "suelo-muro-cota",
    rotulo: "Escalera apoyada: suelo y muro achurados, cota con llave sobre el suelo",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -4, xMax: 12, yMin: -2, yMax: 10 },
      puntos: [
        { nombre: "S1", x: -1.5, y: 0, oculto: true },
        { nombre: "S2", x: 9, y: 0, oculto: true },
        { nombre: "M", x: 0, y: 9.5, oculto: true },
        { nombre: "O", x: 0, y: 0, oculto: true },
        { nombre: "A", x: 6, y: 0, oculto: true },
        { nombre: "B", x: 0, y: 8, oculto: true },
      ],
      segmentos: [
        { desde: "S1", hasta: "S2", achurado: true },
        { desde: "O", hasta: "M", achurado: true },
        { desde: "A", hasta: "B", rotulo: "10 m" },
        { desde: "O", hasta: "A", rotulo: "6 m", cota: true },
        { desde: "O", hasta: "B", rotulo: "h" },
      ],
      angulos: [{ vertice: "O", desde: "A", hasta: "B", marca: "recto" }],
      descripcion: "Escalera de 10 m apoyada en un muro vertical; su pie está a 6 m del muro y la altura que alcanza es h.",
    },
  },
  {
    id: "textos-dos-estilos",
    rotulo: "Tres circunferencias concéntricas: texto en cada región y dos tramas",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -5, xMax: 5, yMin: -3.5, yMax: 3.5 },
      puntos: [{ nombre: "O", x: 0, y: 0, oculto: true }],
      circunferencias: [
        { id: "c1", centro: "O", radio: 1 },
        { id: "c2", centro: "O", radio: 2 },
        { id: "c3", centro: "O", radio: 3 },
      ],
      regiones: [
        { formas: ["c1"], estilo: "punteado" },
        { formas: ["c3"], huecos: ["c2"], estilo: "rayado" },
      ],
      textos: [
        { texto: "A", x: 0, y: 0 },
        { texto: "B", x: 0, y: 1.5 },
        { texto: "C", x: 0, y: 2.5 },
      ],
      descripcion: "Tres circunferencias con el mismo centro: el círculo A con trama de puntos, el anillo B sin trama y el anillo C rayado.",
    },
  },
  {
    id: "punto-flecha",
    rotulo: "Cuadrícula con dos puntos marcados y una flecha de P a Q",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: 0, xMax: 10, yMin: 0, yMax: 6 },
      cuadricula: { paso: 1 },
      puntos: [
        { nombre: "P", x: 2, y: 2, marca: true, ubicacion: "so" },
        { nombre: "Q", x: 7, y: 4, marca: true, ubicacion: "ne" },
      ],
      segmentos: [{ desde: "P", hasta: "Q", flecha: true }],
      descripcion: "Cuadrícula de 10 por 6 con el punto P marcado en un cruce y una flecha que llega al punto Q.",
    },
  },
  {
    id: "no-a-escala",
    rotulo: "Figura fuera de escala: aEscala false y la nota fija",
    figura: {
      tipo: "lienzo-geometrico",
      aEscala: false,
      ventana: { xMin: -1.5, xMax: 9.5, yMin: -1.5, yMax: 6.5 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 8, y: 0 },
        { nombre: "C", x: 4, y: 5 },
      ],
      poligonos: [{ vertices: ["A", "B", "C"] }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "4 cm" },
        { desde: "A", hasta: "C", rotulo: "7 cm", igualdad: 1 },
        { desde: "B", hasta: "C", rotulo: "7 cm", igualdad: 1 },
      ],
      descripcion: "Triángulo isósceles ABC de lados 7 cm, 7 cm y 4 cm, dibujado fuera de escala.",
    },
  },
  {
    id: "red-cubo",
    rotulo: "Red plana de un cubo, sin campos nuevos (13l)",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1.5, xMax: 9.5, yMin: -1, yMax: 7 },
      puntos: [
        ...[0, 2, 4, 6, 8].flatMap((x) => [
          { nombre: `a${x}`, x, y: 2, oculto: true },
          { nombre: `b${x}`, x, y: 4, oculto: true },
        ]),
        { nombre: "c2", x: 2, y: 0, oculto: true },
        { nombre: "c4", x: 4, y: 0, oculto: true },
        { nombre: "d2", x: 2, y: 6, oculto: true },
        { nombre: "d4", x: 4, y: 6, oculto: true },
      ],
      poligonos: [
        { vertices: ["a0", "a2", "b2", "b0"] },
        { vertices: ["a2", "a4", "b4", "b2"] },
        { vertices: ["a4", "a6", "b6", "b4"] },
        { vertices: ["a6", "a8", "b8", "b6"] },
        { vertices: ["c2", "c4", "a4", "a2"] },
        { vertices: ["b2", "b4", "d4", "d2"] },
      ],
      segmentos: [{ desde: "b4", hasta: "b8", rotulo: "4 cm", cota: true }],
      descripcion: "Red de un cubo de 2 cm de arista: cuatro cuadrados en fila y uno arriba y otro abajo del segundo; una llave marca 4 cm sobre dos caras.",
    },
  },
  {
    id: "triangulos-semejantes",
    rotulo: "Par de triángulos semejantes con ángulos iguales marcados, sin campos nuevos (13l)",
    figura: {
      tipo: "lienzo-geometrico",
      ventana: { xMin: -1, xMax: 14.5, yMin: -1.5, yMax: 6 },
      puntos: [
        { nombre: "A", x: 0, y: 0 },
        { nombre: "B", x: 4, y: 0 },
        { nombre: "C", x: 1, y: 3 },
        { nombre: "D", x: 7.5, y: 0 },
        { nombre: "E", x: 13.5, y: 0 },
        { nombre: "F", x: 9, y: 4.5 },
      ],
      poligonos: [{ vertices: ["A", "B", "C"] }, { vertices: ["D", "E", "F"] }],
      segmentos: [
        { desde: "A", hasta: "B", rotulo: "4 cm" },
        { desde: "D", hasta: "E", rotulo: "6 cm" },
      ],
      angulos: [
        { vertice: "A", desde: "B", hasta: "C", marca: "arco", rotulo: "α" },
        { vertice: "D", desde: "E", hasta: "F", marca: "arco", rotulo: "α" },
      ],
      descripcion: "Triángulos ABC y DEF con el mismo ángulo α en A y en D; AB mide 4 cm y DE mide 6 cm.",
    },
  },
  {
    id: "densidad-maxima",
    rotulo: "Densidad máxima del inventario: 24 puntos, 24 segmentos, 10 formas y 20 rótulos",
    figura: densidadMaxima(),
  },
];

/* Alternativa en los topes de la alternativa: 12 puntos, 12 segmentos, 5 formas y 10 rótulos en el panel de 316 px. */
export const LIENZO_ALTERNATIVA_DENSA: FiguraLienzoGeometrico = {
  tipo: "lienzo-geometrico",
  ventana: { xMin: -1.5, xMax: 11.5, yMin: -1.5, yMax: 6.5 },
  puntos: [
    { nombre: "A", x: 0, y: 0 },
    { nombre: "E", x: 5, y: 0 },
    { nombre: "B", x: 10, y: 0 },
    { nombre: "C", x: 10, y: 5 },
    { nombre: "F", x: 5, y: 5 },
    { nombre: "D", x: 0, y: 5 },
    { nombre: "O1", x: 2.5, y: 2.5, oculto: true },
    { nombre: "O2", x: 7.5, y: 2.5, oculto: true },
    { nombre: "G", x: 0, y: 2.5, oculto: true },
    { nombre: "I", x: 5, y: 2.5, oculto: true },
    { nombre: "H", x: 10, y: 2.5, oculto: true },
    { nombre: "K", x: 2.5, y: 0.5, oculto: true },
  ],
  poligonos: [{ vertices: ["A", "E", "F", "D"] }, { vertices: ["E", "B", "C", "F"] }],
  circunferencias: [
    { centro: "O1", radio: 2 },
    { centro: "O2", radio: 2 },
  ],
  arcos: [{ clase: "sector", centro: "B", radio: 1.5, desde: 90, hasta: 180 }],
  segmentos: [
    { desde: "A", hasta: "E", rotulo: "5 cm" },
    { desde: "E", hasta: "B", rotulo: "5 cm" },
    { desde: "B", hasta: "C", rotulo: "5 cm" },
    { desde: "C", hasta: "F" },
    { desde: "F", hasta: "D" },
    { desde: "D", hasta: "A" },
    { desde: "E", hasta: "F", trazo: "punteado" },
    { desde: "G", hasta: "I", trazo: "punteado" },
    { desde: "I", hasta: "H", trazo: "punteado" },
    { desde: "O1", hasta: "K", trazo: "punteado" },
    { desde: "A", hasta: "O1", trazo: "punteado" },
    { desde: "O2", hasta: "C", trazo: "punteado" },
  ],
  textos: [{ texto: "R", x: 7.5, y: 3.6 }],
  descripcion: "Rectángulo de 10 cm por 5 cm partido en dos cuadrados, un círculo en cada uno y un cuarto de círculo en B.",
};

/* Figura de la solución (figuraSolucion): la altura trazada, con la respuesta a la vista. El texto pasa por
   protegerExpresiones, como en itemParaCliente. */
export const SOLUCION_LIENZO_MUESTRA: { solucion: string; figura: FiguraLienzoGeometrico } = {
  solucion: protegerExpresiones("MUESTRA. Se traza la altura desde C: en un triángulo isósceles cae en el punto medio de la base, así que AH = 6 cm. En el triángulo AHC, h = √(10² − 6²) = √64 = 8 cm, y el área es la mitad de 12 · 8, o sea, 48 cm²."),
  figura: {
    tipo: "lienzo-geometrico",
    ventana: { xMin: -1.5, xMax: 13.5, yMin: -1.5, yMax: 9.5 },
    puntos: [
      { nombre: "A", x: 0, y: 0 },
      { nombre: "B", x: 12, y: 0 },
      { nombre: "C", x: 6, y: 8 },
      { nombre: "H", x: 6, y: 0 },
    ],
    poligonos: [{ vertices: ["A", "B", "C"] }],
    segmentos: [
      { desde: "A", hasta: "C", rotulo: "10 cm" },
      { desde: "B", hasta: "C", rotulo: "10 cm" },
      { desde: "A", hasta: "H", rotulo: "6 cm" },
      { desde: "C", hasta: "H", trazo: "punteado", rotulo: "8 cm", lado: "interior" },
    ],
    angulos: [{ vertice: "H", desde: "B", hasta: "C", marca: "recto" }],
    descripcion: "Triángulo isósceles ABC con la altura CH trazada: AH mide 6 cm y la altura, 8 cm.",
  },
};

const FEEDBACK = "MUESTRA. Explica por qué esta alternativa no puede ser, con el procedimiento errado que la produce.";

/* Ítem de MUESTRA con cuatro alternativas lienzo, todas con la misma ventana (misma escala). */
export const MUESTRA_LIENZO_ALTERNATIVAS: ItemAdvance = {
  id: "adv-muestra-lienzo-001",
  unidadId: "muestra",
  moduloId: "muestra",
  habilidad: "representar",
  dificultad: "media",
  tiempoReferenciaSeg: 120,
  enunciado: "MUESTRA. ¿En cuál de los siguientes triángulos se cumple el teorema de Pitágoras?",
  alternativas: [
    { clave: "A", claveOriginal: "A", texto: "", figura: triangulo(6, 4, 5, "Triángulo de lados 6 cm, 4 cm y 5 cm."), esCorrecta: false, errorCatalogado: "suma-lados-en-vez-de-cuadrados", feedbackDescarte: FEEDBACK },
    { clave: "B", claveOriginal: "B", texto: "", figura: triangulo(10, 6, 8, "Triángulo de lados 10 cm, 6 cm y 8 cm."), esCorrecta: true, feedbackDescarteIncorrecto: "MUESTRA. Era la correcta: 6² + 8² = 36 + 64 = 100 = 10²." },
    { clave: "C", claveOriginal: "C", texto: "", figura: triangulo(7, 5, 6, "Triángulo de lados 7 cm, 5 cm y 6 cm."), esCorrecta: false, errorCatalogado: null, feedbackDescarte: FEEDBACK },
    { clave: "D", claveOriginal: "D", texto: "", figura: triangulo(6, 3, 4, "Triángulo de lados 6 cm, 3 cm y 4 cm."), esCorrecta: false, errorCatalogado: "asume-trio-pitagorico", feedbackDescarte: FEEDBACK },
  ],
  solucion: "MUESTRA. Solo en B la suma de los cuadrados de los lados menores es el cuadrado del mayor: 36 + 64 = 100.",
};
