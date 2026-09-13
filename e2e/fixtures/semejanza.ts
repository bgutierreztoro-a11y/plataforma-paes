import type { BloqueVisualizacion } from "@/lib/tipos";

/**
 * Datos de prueba para `/vista-previa/semejanza`. NO son contenido de
 * lección: números neutros, cotas que dicen la medida y nada más, y una
 * escena por disposición que el componente sabe dibujar.
 */

const bloque = (descripcion: string, datos: Record<string, unknown>): BloqueVisualizacion => ({
  tipo: "visualizacion",
  variante: "grafico",
  descripcion,
  datos,
});

export const SEMEJANZAS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Lado a lado · triángulos, k = 2",
    bloque: bloque("Triángulo de lados 3, 4 y 5 y su imagen de lados 6, 8 y 10, a la misma escala.", {
      tipo: "semejanza",
      disposicion: "ladoALado",
      original: { vertices: [[0, 0], [4, 0], [0, 3]], cotas: ["4", "5", "3"], rotulos: ["A", "B", "C"] },
      k: 2,
      imagen: { cotas: ["8", "10", "6"], rotulos: ["A'", "B'", "C'"] },
    }),
  },
  {
    titulo: "Lado a lado · cuadrilátero, k = 3/2, con incógnita",
    bloque: bloque("Trapecio de lados 7, 5, 4 y 4 y su imagen por 3/2, con un lado de la imagen rotulado x.", {
      tipo: "semejanza",
      disposicion: "ladoALado",
      original: { vertices: [[0, 0], [7, 0], [4, 4], [0, 4]], cotas: ["7", "5", "4", "4"] },
      k: 1.5,
      imagen: { cotas: ["10,5", "x", "6", "6"] },
    }),
  },
  {
    titulo: "Lado a lado · cuadrados, k = 3",
    bloque: bloque("Cuadrado de lado 2 y cuadrado de lado 6: el área se multiplica por 9.", {
      tipo: "semejanza",
      disposicion: "ladoALado",
      original: { vertices: [[0, 0], [2, 0], [2, 2], [0, 2]], cotas: ["2", "2", "2", "2"] },
      k: 3,
      imagen: { cotas: ["6", "6", "6", "6"] },
    }),
  },
  {
    titulo: "Anidada · sombra y poste",
    bloque: bloque("Poste de altura h con sombra de 12 y persona de altura 3 con sombra de 4, con el rayo común.", {
      tipo: "semejanza",
      disposicion: "anidada",
      grande: { horizontal: 12, vertical: 9, etiquetaHorizontal: "12", etiquetaVertical: "h" },
      chica: { horizontal: 4, vertical: 3, etiquetaHorizontal: "4", etiquetaVertical: "3" },
    }),
  },
];

/**
 * ⚠️ ESTOS DOS CASOS ESTÁN MAL A PROPÓSITO. NO LOS "ARREGLES".
 * Prueban que el bloque degrada al texto: una pareja anidada que no es
 * semejante de verdad, y una figura con una cota de menos.
 */
export const SEMEJANZAS_RECHAZADAS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Rechazado · anidada no semejante",
    bloque: bloque("Persona de 2 con sombra de 4 frente a un poste de 9 con sombra de 12: 2/4 no es 9/12.", {
      tipo: "semejanza",
      disposicion: "anidada",
      grande: { horizontal: 12, vertical: 9, etiquetaHorizontal: "12", etiquetaVertical: "9" },
      chica: { horizontal: 4, vertical: 2, etiquetaHorizontal: "4", etiquetaVertical: "2" },
    }),
  },
  {
    titulo: "Rechazado · cota faltante",
    bloque: bloque("Triángulo con solo dos cotas: todas las cotas van rotuladas.", {
      tipo: "semejanza",
      disposicion: "ladoALado",
      original: { vertices: [[0, 0], [4, 0], [0, 3]], cotas: ["4", "5"] },
      k: 2,
      imagen: { cotas: ["8", "10", "6"] },
    }),
  },
];
