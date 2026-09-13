import type { BloqueVisualizacion } from "@/lib/tipos";

/**
 * Datos de prueba para `/vista-previa/probabilidad`. NO son contenido de
 * lección: clases genéricas (Roja, Azul, Verde, Gris, Alfa, Beta, Gama) y una
 * escena por cosa que los dos bloques visuales saben dibujar: árbol de dos
 * etapas con y sin reposición (en el segundo se ve bajar el denominador de 8 a
 * 7), árbol con caminos resaltados, árbol de tres etapas con una clase que se
 * agota, árbol de tres ramas por nodo, árbol de una etapa sin probabilidad de
 * camino; cuadrícula de dos dados con la suma en cada celda y el evento
 * marcado, cuadrícula de 2 × 2 con rótulos largos, y cuadrícula sin marcas.
 *
 * Los árboles se generaron con `ramasDesdeComposicion` de lib/probabilidad.ts
 * (salida de `node -e` copiada tal cual): las probabilidades de cada rama y de
 * cada camino son las que produce la composición, no valores escritos a mano.
 */

const bloque = (descripcion: string, datos: Record<string, unknown>): BloqueVisualizacion => ({
  tipo: "visualizacion",
  variante: "diagrama",
  descripcion,
  datos,
});

/** {roja: 3, azul: 5}, dos extracciones sin reposición. */
const ARBOL_SIN_REPOSICION = [
  {
    resultado: "Roja",
    probabilidad: "3/8",
    ramas: [
      { resultado: "Roja", probabilidad: "2/7", id: "roja-roja", probabilidadCamino: "3/28" },
      { resultado: "Azul", probabilidad: "5/7", id: "roja-azul", probabilidadCamino: "15/56" },
    ],
  },
  {
    resultado: "Azul",
    probabilidad: "5/8",
    ramas: [
      { resultado: "Roja", probabilidad: "3/7", id: "azul-roja", probabilidadCamino: "15/56" },
      { resultado: "Azul", probabilidad: "4/7", id: "azul-azul", probabilidadCamino: "5/14" },
    ],
  },
];

/** La misma composición, con reposición: la segunda etapa repite 3/8 y 5/8. */
const ARBOL_CON_REPOSICION = [
  {
    resultado: "Roja",
    probabilidad: "3/8",
    ramas: [
      { resultado: "Roja", probabilidad: "3/8", id: "roja-roja", probabilidadCamino: "9/64" },
      { resultado: "Azul", probabilidad: "5/8", id: "roja-azul", probabilidadCamino: "15/64" },
    ],
  },
  {
    resultado: "Azul",
    probabilidad: "5/8",
    ramas: [
      { resultado: "Roja", probabilidad: "3/8", id: "azul-roja", probabilidadCamino: "15/64" },
      { resultado: "Azul", probabilidad: "5/8", id: "azul-azul", probabilidadCamino: "25/64" },
    ],
  },
];

export const ARBOLES: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Árbol · dos etapas, sin reposición (el denominador baja de 8 a 7)",
    bloque: bloque("Árbol de dos extracciones sin reposición de 3 rojas y 5 azules: 3/8 y 5/8 en la primera etapa; 2/7 y 5/7, o 3/7 y 4/7, en la segunda.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda"],
      ramas: ARBOL_SIN_REPOSICION,
    }),
  },
  {
    titulo: "Árbol · dos etapas, con reposición (la segunda etapa repite)",
    bloque: bloque("Árbol de dos extracciones con reposición de 3 rojas y 5 azules: 3/8 y 5/8 en las dos etapas.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda"],
      ramas: ARBOL_CON_REPOSICION,
    }),
  },
  {
    titulo: "Árbol · caminos resaltados (una de cada color), raíz rotulada",
    bloque: bloque("El mismo árbol sin reposición con los caminos Roja luego Azul y Azul luego Roja resaltados.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda"],
      raiz: "Sorteo",
      ramas: ARBOL_SIN_REPOSICION,
      resaltar: ["roja-azul", "azul-roja"],
    }),
  },
  {
    titulo: "Árbol · tres etapas sin reposición, una clase que se agota",
    bloque: bloque("Tres extracciones sin reposición de 2 verdes y 4 grises: tras dos verdes solo queda gris, con probabilidad 1.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda", "Tercera"],
      ramas: [
        {
          resultado: "Verde",
          probabilidad: "1/3",
          ramas: [
            { resultado: "Verde", probabilidad: "1/5", ramas: [{ resultado: "Gris", probabilidad: "1", id: "verde-verde-gris", probabilidadCamino: "1/15" }] },
            {
              resultado: "Gris",
              probabilidad: "4/5",
              ramas: [
                { resultado: "Verde", probabilidad: "1/4", id: "verde-gris-verde", probabilidadCamino: "1/15" },
                { resultado: "Gris", probabilidad: "3/4", id: "verde-gris-gris", probabilidadCamino: "1/5" },
              ],
            },
          ],
        },
        {
          resultado: "Gris",
          probabilidad: "2/3",
          ramas: [
            {
              resultado: "Verde",
              probabilidad: "2/5",
              ramas: [
                { resultado: "Verde", probabilidad: "1/4", id: "gris-verde-verde", probabilidadCamino: "1/15" },
                { resultado: "Gris", probabilidad: "3/4", id: "gris-verde-gris", probabilidadCamino: "1/5" },
              ],
            },
            {
              resultado: "Gris",
              probabilidad: "3/5",
              ramas: [
                { resultado: "Verde", probabilidad: "1/2", id: "gris-gris-verde", probabilidadCamino: "1/5" },
                { resultado: "Gris", probabilidad: "1/2", id: "gris-gris-gris", probabilidadCamino: "1/5" },
              ],
            },
          ],
        },
      ],
    }),
  },
  {
    titulo: "Árbol · tres ramas por nodo, sin probabilidad de camino",
    bloque: bloque("Dos extracciones sin reposición de 1 Alfa, 2 Beta y 3 Gama; sin probabilidades de camino en las hojas.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda"],
      ramas: [
        {
          resultado: "Alfa",
          probabilidad: "1/6",
          ramas: [
            { resultado: "Beta", probabilidad: "2/5" },
            { resultado: "Gama", probabilidad: "3/5" },
          ],
        },
        {
          resultado: "Beta",
          probabilidad: "1/3",
          ramas: [
            { resultado: "Alfa", probabilidad: "1/5" },
            { resultado: "Beta", probabilidad: "1/5" },
            { resultado: "Gama", probabilidad: "3/5" },
          ],
        },
        {
          resultado: "Gama",
          probabilidad: "1/2",
          ramas: [
            { resultado: "Alfa", probabilidad: "1/5" },
            { resultado: "Beta", probabilidad: "2/5" },
            { resultado: "Gama", probabilidad: "2/5" },
          ],
        },
      ],
    }),
  },
  {
    titulo: "Árbol · una etapa, probabilidades en porcentaje",
    bloque: bloque("Un solo experimento con tres resultados: 50 %, 30 % y 20 %.", {
      tipo: "diagramaArbol",
      etapas: ["Resultado"],
      ramas: [
        { resultado: "Alfa", probabilidad: "50 %" },
        { resultado: "Beta", probabilidad: "30 %" },
        { resultado: "Gama", probabilidad: "20 %" },
      ],
    }),
  },
];

const CARAS = ["1", "2", "3", "4", "5", "6"];
const SUMAS = CARAS.map((a) => CARAS.map((b) => String(Number(a) + Number(b))));

export const CUADRICULAS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Cuadrícula · 6 × 6 con la suma en cada celda, suma 7 marcada",
    bloque: bloque("Cuadrícula de dos dados con la suma en cada celda; las seis celdas de suma 7 van marcadas, 6 de 36.", {
      tipo: "cuadriculaEspacioMuestral",
      filas: CARAS,
      columnas: CARAS,
      rotuloFilas: "Primer dado",
      rotuloColumnas: "Segundo dado",
      celdas: SUMAS,
      marcadas: [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0]],
      contador: { marcadas: 6, total: 36 },
      rotuloEvento: "Suma 7",
    }),
  },
  {
    titulo: "Cuadrícula · 6 × 6 con los pares, sin marcas",
    bloque: bloque("Cuadrícula de dos dados con el par en cada celda y ninguna marcada.", {
      tipo: "cuadriculaEspacioMuestral",
      filas: CARAS,
      columnas: CARAS,
      rotuloFilas: "Primer dado",
      rotuloColumnas: "Segundo dado",
    }),
  },
  {
    titulo: "Cuadrícula · 2 × 3 con rótulos largos y celdas declaradas",
    bloque: bloque("Cuadrícula de dos experimentos con rótulos largos: dos filas y tres columnas, una celda marcada, 1 de 6.", {
      tipo: "cuadriculaEspacioMuestral",
      filas: ["Cara", "Sello"],
      columnas: ["Rojo", "Verde", "Azul"],
      rotuloFilas: "Moneda",
      rotuloColumnas: "Ficha",
      celdas: [
        ["C R", "C V", "C A"],
        ["S R", "S V", "S A"],
      ],
      marcadas: [[0, 2]],
      contador: { marcadas: 1, total: 6 },
      rotuloEvento: "Cara y azul",
    }),
  },
];

/**
 * ⚠️ ESTOS CASOS ESTÁN MAL A PROPÓSITO. NO LOS "ARREGLES".
 * Cada uno viola una guarda de `motivoRechazoDatosProbabilidad` y existe para
 * comprobar que el bloque degrada al `<figure>` de texto en vez de reventar:
 * ramas hermanas que no suman 1, una probabilidad de camino que no es el
 * producto, una celda marcada fuera de la cuadrícula y un contador que no
 * coincide con las marcadas.
 */
export const PROBABILIDAD_RECHAZADOS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Rechazado · ramas hermanas suman 9/8",
    bloque: bloque("Árbol con 1/2 y 5/8 en la primera etapa: las ramas hermanas suman 9/8, no 1.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda"],
      ramas: [{ ...ARBOL_SIN_REPOSICION[0], probabilidad: "1/2" }, ARBOL_SIN_REPOSICION[1]],
    }),
  },
  {
    titulo: "Rechazado · probabilidad de camino que no es el producto",
    bloque: bloque("Árbol sin reposición cuya hoja Roja-Roja declara 9/64 (el valor con reposición) en vez de 3/28.", {
      tipo: "diagramaArbol",
      etapas: ["Primera", "Segunda"],
      ramas: [
        {
          ...ARBOL_SIN_REPOSICION[0],
          ramas: [{ ...ARBOL_SIN_REPOSICION[0].ramas[0], probabilidadCamino: "9/64" }, ARBOL_SIN_REPOSICION[0].ramas[1]],
        },
        ARBOL_SIN_REPOSICION[1],
      ],
    }),
  },
  {
    titulo: "Rechazado · celda marcada fuera de la cuadrícula",
    bloque: bloque("Cuadrícula de 2 × 2 con una marca en la columna 3, que no existe.", {
      tipo: "cuadriculaEspacioMuestral",
      filas: ["Cara", "Sello"],
      columnas: ["Cara", "Sello"],
      marcadas: [[0, 3]],
    }),
  },
  {
    titulo: "Rechazado · contador que no coincide con las marcadas",
    bloque: bloque("Cuadrícula de dos dados con seis celdas marcadas y un contador que declara 5 de 36.", {
      tipo: "cuadriculaEspacioMuestral",
      filas: CARAS,
      columnas: CARAS,
      marcadas: [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0]],
      contador: { marcadas: 5, total: 36 },
    }),
  },
];
