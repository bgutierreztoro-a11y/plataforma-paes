import type { BloqueVisualizacion } from "@/lib/tipos";

/**
 * Datos de prueba para `/vista-previa/estadistica`. NO son contenido de
 * lección: categorías genéricas, números neutros y una escena por elemento
 * visual que los cuatro gráficos de datos saben dibujar: barras simples y
 * agrupadas, barras con eje truncado (el ejemplo engañoso, único caso donde se
 * admite), circular por porcentaje y por ángulo, líneas con una y dos series,
 * y cajón simple, doble y con marca.
 */

const bloque = (descripcion: string, datos: Record<string, unknown>): BloqueVisualizacion => ({
  tipo: "visualizacion",
  variante: "grafico",
  descripcion,
  datos,
});

export const GRAFICOS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Barras · una serie",
    bloque: bloque("Barras de cuatro categorías con valores 12, 7, 20 y 15.", {
      tipo: "graficoBarras",
      categorias: ["Norte", "Centro", "Sur", "Costa"],
      series: [{ nombre: "Unidades", valores: [12, 7, 20, 15] }],
      ejeVertical: "Unidades",
    }),
  },
  {
    titulo: "Barras · dos series agrupadas",
    bloque: bloque("Barras agrupadas de dos series sobre tres categorías.", {
      tipo: "graficoBarras",
      categorias: ["Grupo A", "Grupo B", "Grupo C"],
      series: [
        { nombre: "Primera", valores: [8, 14, 6] },
        { nombre: "Segunda", valores: [11, 9, 13] },
      ],
      ejeVertical: "Cantidad",
    }),
  },
  {
    titulo: "Barras · eje truncado (ejemplo engañoso)",
    bloque: bloque("Barras con valores 48, 50, 52 y 54 sobre un eje que no parte de 0, con quiebre.", {
      tipo: "graficoBarras",
      categorias: ["Uno", "Dos", "Tres", "Cuatro"],
      series: [{ nombre: "Puntos", valores: [48, 50, 52, 54] }],
      ejeVertical: "Puntos",
      ejeTruncado: true,
      ejemploEnganoso: true,
    }),
  },
  {
    titulo: "Barras · los mismos datos desde 0",
    bloque: bloque("Los mismos cuatro valores con el eje desde 0: las barras se parecen.", {
      tipo: "graficoBarras",
      categorias: ["Uno", "Dos", "Tres", "Cuatro"],
      series: [{ nombre: "Puntos", valores: [48, 50, 52, 54] }],
      ejeVertical: "Puntos",
    }),
  },
  {
    titulo: "Circular · porcentajes",
    bloque: bloque("Círculo repartido en 50 %, 25 %, 12,5 % y 12,5 %.", {
      tipo: "graficoCircular",
      rotulo: "porcentaje",
      sectores: [
        { categoria: "Alfa", porcentaje: 50 },
        { categoria: "Beta", porcentaje: 25 },
        { categoria: "Gama", porcentaje: 12.5 },
        { categoria: "Delta", porcentaje: 12.5 },
      ],
    }),
  },
  {
    titulo: "Circular · ángulos, sector chico afuera",
    bloque: bloque("Círculo repartido en 200°, 100°, 42° y 18°; el sector de 18° lleva el rótulo afuera.", {
      tipo: "graficoCircular",
      rotulo: "angulo",
      sectores: [
        { categoria: "Alfa", angulo: 200 },
        { categoria: "Beta", angulo: 100 },
        { categoria: "Gama", angulo: 42 },
        { categoria: "Delta", angulo: 18 },
      ],
    }),
  },
  {
    titulo: "Líneas · una serie",
    bloque: bloque("Una serie sobre seis periodos ordenados.", {
      tipo: "graficoLineas",
      categorias: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
      series: [{ nombre: "Total", valores: [30, 45, 40, 60, 55, 70] }],
      ejeVertical: "Total",
    }),
  },
  {
    titulo: "Líneas · dos series que se cruzan",
    bloque: bloque("Dos series sobre cuatro periodos; se cruzan entre el segundo y el tercero.", {
      tipo: "graficoLineas",
      categorias: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
      series: [
        { nombre: "Primera", valores: [40, 55, 50, 70] },
        { nombre: "Segunda", valores: [60, 50, 65, 45] },
      ],
      ejeVertical: "Cantidad",
    }),
  },
  {
    titulo: "Cajón · uno, con datos crudos",
    bloque: bloque("Un cajón con mínimo 12, Q1 18, mediana 22, Q3 27 y máximo 35.", {
      tipo: "diagramaCajon",
      ejeHorizontal: "Minutos",
      cajones: [{ nombre: "Grupo A", min: 12, q1: 18, mediana: 22, q3: 27, max: 35, datos: [12, 16, 18, 20, 21, 23, 25, 27, 30, 35] }],
    }),
  },
  {
    titulo: "Cajón · dos sobre la misma escala, con marca",
    bloque: bloque("Dos cajones con la misma mediana y distinta dispersión, y una marca en 33.", {
      tipo: "diagramaCajon",
      ejeHorizontal: "Minutos",
      cajones: [
        { nombre: "Grupo A", min: 12, q1: 18, mediana: 22, q3: 27, max: 35 },
        { nombre: "Grupo B largo", min: 19, q1: 21, mediana: 22, q3: 23, max: 26 },
      ],
      marcas: [{ valor: 33, rotulo: "dato" }],
    }),
  },
];

/**
 * ⚠️ ESTOS CASOS ESTÁN MAL A PROPÓSITO. NO LOS "ARREGLES".
 * Cada uno viola una guarda de `motivoRechazoDatosGrafico` y existe para
 * comprobar que el bloque degrada al `<figure>` de texto en vez de reventar:
 * porcentajes que no suman 100, eje truncado sin marcar como ejemplo engañoso,
 * un cajón con Q1 sobre la mediana y otro cuyo resumen no coincide con sus
 * datos crudos.
 */
export const GRAFICOS_RECHAZADOS: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Rechazado · porcentajes suman 90",
    bloque: bloque("Círculo con 60 % y 30 %: los porcentajes suman 90, no 100.", {
      tipo: "graficoCircular",
      rotulo: "porcentaje",
      sectores: [
        { categoria: "Alfa", porcentaje: 60 },
        { categoria: "Beta", porcentaje: 30 },
      ],
    }),
  },
  {
    titulo: "Rechazado · eje truncado sin marcar",
    bloque: bloque("Barras con eje truncado en un bloque que no se declara ejemplo engañoso.", {
      tipo: "graficoBarras",
      categorias: ["Uno", "Dos"],
      series: [{ nombre: "Puntos", valores: [48, 54] }],
      ejeVertical: "Puntos",
      ejeTruncado: true,
    }),
  },
  {
    titulo: "Rechazado · cajón desordenado",
    bloque: bloque("Cajón con Q1 = 25 y mediana = 22: el orden min ≤ Q1 ≤ mediana no se cumple.", {
      tipo: "diagramaCajon",
      ejeHorizontal: "Minutos",
      cajones: [{ nombre: "Grupo A", min: 12, q1: 25, mediana: 22, q3: 27, max: 35 }],
    }),
  },
  {
    titulo: "Rechazado · resumen que no coincide con los datos",
    bloque: bloque("Cajón que declara mediana 24 sobre datos cuya mediana es 22.", {
      tipo: "diagramaCajon",
      ejeHorizontal: "Minutos",
      cajones: [{ nombre: "Grupo A", min: 12, q1: 18, mediana: 24, q3: 27, max: 35, datos: [12, 16, 18, 20, 21, 23, 25, 27, 30, 35] }],
    }),
  },
];
