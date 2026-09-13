import type { BloqueVisualizacion } from "@/lib/tipos";

/**
 * Datos de prueba para `/vista-previa/transformaciones-isometricas`.
 *
 * NO son contenido de lección y no viven en `content/`: existen para ver y
 * capturar el componente sin escribir pedagogía, igual que
 * `cuerposGeometricos.ts`. Coordenadas enteras neutras, sin contexto, y una
 * escena por elemento visual que el componente sabe dibujar: figura sola,
 * traslación (con y sin imagen), puntos sueltos con el mismo vector, rotación
 * en torno al origen y a otro centro, reflexiones respecto de los ejes, del
 * origen y de una recta, y composición con y sin intermedias.
 */

const bloque = (descripcion: string, datos: Record<string, unknown>): BloqueVisualizacion => ({
  tipo: "visualizacion",
  variante: "grafico",
  descripcion,
  datos,
});

const TRIANGULO = [[1, 1], [4, 1], [2, 3]];
const CUADRILATERO = [[1, 1], [4, 1], [4, 3], [1, 2]];

export const TRANSFORMACIONES: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Figura sola",
    bloque: bloque("Triángulo ABC sobre el plano, sin transformación.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [],
    }),
  },
  {
    titulo: "Traslación con imagen",
    bloque: bloque("Triángulo ABC y su imagen A'B'C' trasladada por el vector (−5, 3), con la flecha de A a A'.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "traslacion", vector: [-5, 3] }],
    }),
  },
  {
    titulo: "Traslación sin imagen",
    bloque: bloque("Triángulo ABC y el vector (−5, 3) dibujado desde el origen; la imagen no se dibuja.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "traslacion", vector: [-5, 3] }],
      mostrarImagen: false,
      rotuloVector: "u",
    }),
  },
  {
    titulo: "Puntos sueltos, mismo vector",
    bloque: bloque("Tres puntos P, Q y R, cada uno trasladado por el mismo vector (3, 4): tres flechas iguales.", {
      tipo: "transformacion",
      figura: [[-4, -3], [1, -2], [-2, 3]],
      rotulos: ["P", "Q", "R"],
      transformaciones: [{ tipo: "traslacion", vector: [3, 4] }],
      trazo: "puntos",
    }),
  },
  {
    titulo: "Rotación 90° antihorario, origen",
    bloque: bloque("Cuadrilátero ABCD y su imagen tras girar 90° en sentido antihorario en torno al origen.", {
      tipo: "transformacion",
      figura: CUADRILATERO,
      transformaciones: [{ tipo: "rotacion", grados: 90, sentido: "antihorario" }],
    }),
  },
  {
    titulo: "Rotación 90° horario, otro centro",
    bloque: bloque("Triángulo ABC girado 90° en sentido horario en torno al punto (2, −1).", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "rotacion", grados: 90, sentido: "horario", centro: [2, -1] }],
    }),
  },
  {
    titulo: "Rotación 180°",
    bloque: bloque("Cuadrilátero ABCD girado 180° en torno al origen.", {
      tipo: "transformacion",
      figura: CUADRILATERO,
      transformaciones: [{ tipo: "rotacion", grados: 180, sentido: "antihorario" }],
    }),
  },
  {
    titulo: "Reflexión eje x",
    bloque: bloque("Triángulo ABC reflejado respecto del eje x.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "reflexion", eje: "x" }],
    }),
  },
  {
    titulo: "Reflexión eje y",
    bloque: bloque("Cuadrilátero ABCD reflejado respecto del eje y.", {
      tipo: "transformacion",
      figura: CUADRILATERO,
      transformaciones: [{ tipo: "reflexion", eje: "y" }],
    }),
  },
  {
    titulo: "Reflexión origen",
    bloque: bloque("Triángulo ABC reflejado respecto del origen.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "reflexion", eje: "origen" }],
    }),
  },
  {
    titulo: "Reflexión recta x = 5",
    bloque: bloque("Triángulo ABC reflejado respecto de la recta vertical x = 5.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "reflexion", eje: { vertical: 5 } }],
    }),
  },
  {
    titulo: "Composición sin intermedias",
    bloque: bloque("Triángulo ABC trasladado por (−5, 0) y luego reflejado respecto del eje x; solo se dibuja la imagen final.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [
        { tipo: "traslacion", vector: [-5, 0] },
        { tipo: "reflexion", eje: "x" },
      ],
    }),
  },
  {
    titulo: "Composición con intermedias",
    bloque: bloque("La misma composición con la figura intermedia A'B'C' en trazo tenue y la final A''B''C''.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [
        { tipo: "traslacion", vector: [-5, 0] },
        { tipo: "reflexion", eje: "x" },
      ],
      mostrarIntermedias: true,
    }),
  },
  {
    titulo: "Segmento y punto",
    bloque: bloque("Un segmento PQ y un punto suelto: las figuras de 1 y 2 vértices no se cierran.", {
      tipo: "transformacion",
      figura: [[-3, 2], [4, -1]],
      rotulos: ["P", "Q"],
      transformaciones: [{ tipo: "rotacion", grados: 90, sentido: "antihorario" }],
    }),
  },
];

/**
 * ⚠️ ESTOS TRES CASOS ESTÁN MAL A PROPÓSITO. NO LOS "ARREGLES".
 *
 * Cada uno viola una guarda de `motivoRechazoDatosTransformacion` y existe
 * para comprobar que el bloque degrada al `<figure>` de texto en vez de
 * reventar la página: una imagen fuera de [−10, 10], un ángulo que no es
 * múltiplo de 90 y una escena tan ancha que las celdas quedan ilegibles.
 */
export const TRANSFORMACIONES_RECHAZADAS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Rechazado · imagen fuera del plano",
    bloque: bloque("Punto en (9, 9) trasladado por (3, 0): la imagen (12, 9) se sale de [−10, 10].", {
      tipo: "transformacion",
      figura: [[9, 9]],
      transformaciones: [{ tipo: "traslacion", vector: [3, 0] }],
    }),
  },
  {
    titulo: "Rechazado · ángulo de 45°",
    bloque: bloque("Rotación de 45°, que no es múltiplo de 90 y daría coordenadas no enteras.", {
      tipo: "transformacion",
      figura: TRIANGULO,
      transformaciones: [{ tipo: "rotacion", grados: 45, sentido: "horario" }],
    }),
  },
  {
    titulo: "Rechazado · vértice no entero",
    bloque: bloque("Figura con un vértice en (1,5; 2): las coordenadas deben ser enteras.", {
      tipo: "transformacion",
      figura: [[1.5, 2], [4, 1], [2, 3]],
      transformaciones: [],
    }),
  },
];
