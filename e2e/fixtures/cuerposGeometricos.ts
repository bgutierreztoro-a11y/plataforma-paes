import type { BloqueVisualizacion } from "@/lib/tipos";

/**
 * Datos de prueba para `/vista-previa/cuerpos-geometricos`.
 *
 * NO son contenido de lección y no viven en `content/`: existen para poder ver
 * y capturar el componente sin escribir pedagogía, igual que
 * `bloqueDosVariables.ts` y `bloqueParabola.ts`. Los números son deliberadamente
 * neutros y redondos —nada que pueda leerse como un contexto—, y las etiquetas
 * dicen la dimensión, no una magnitud del mundo.
 *
 * Las medidas están dentro de las bandas de `lib/cuerposGeometricos.ts` a
 * propósito: si un fixture cayera fuera, el bloque no se dibujaría y la captura
 * mostraría el `<figure>` de texto en vez del SVG.
 */

const bloque = (descripcion: string, datos: Record<string, unknown>): BloqueVisualizacion => ({
  tipo: "visualizacion",
  variante: "diagrama",
  descripcion,
  datos,
});

export const CUERPOS_SOLIDO: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Paralelepípedo · superficie",
    bloque: bloque(
      "Paralelepípedo en perspectiva, con sus tres caras visibles diferenciadas y las cotas de largo, ancho y alto.",
      {
        cuerpo: "paralelepipedo",
        largo: 12,
        ancho: 6,
        alto: 8,
        etiquetaLargo: "12",
        etiquetaAncho: "6",
        etiquetaAlto: "8",
        enfasis: "superficie",
      },
    ),
  },
  {
    titulo: "Paralelepípedo · volumen",
    bloque: bloque(
      "El mismo paralelepípedo, con relleno uniforme y las tres aristas que se multiplican destacadas.",
      {
        cuerpo: "paralelepipedo",
        largo: 12,
        ancho: 6,
        alto: 8,
        etiquetaLargo: "12",
        etiquetaAncho: "6",
        etiquetaAlto: "8",
        enfasis: "volumen",
      },
    ),
  },
  {
    titulo: "Cubo · superficie",
    bloque: bloque("Cubo en perspectiva, con sus tres caras visibles diferenciadas.", {
      cuerpo: "cubo",
      arista: 10,
      etiquetaArista: "10",
      enfasis: "superficie",
    }),
  },
  {
    titulo: "Cubo · volumen",
    bloque: bloque("El mismo cubo, con las tres aristas iguales destacadas.", {
      cuerpo: "cubo",
      arista: 10,
      etiquetaArista: "10",
      enfasis: "volumen",
    }),
  },
  {
    titulo: "Cilindro · superficie",
    bloque: bloque(
      "Cilindro recto de pie, con la tapa superior destacada y las cotas de radio y altura.",
      {
        cuerpo: "cilindro",
        radio: 5,
        altura: 14,
        etiquetaRadio: "5",
        etiquetaAltura: "14",
        enfasis: "superficie",
      },
    ),
  },
  {
    titulo: "Cilindro · volumen",
    bloque: bloque("El mismo cilindro, con el radio y la altura destacados.", {
      cuerpo: "cilindro",
      radio: 5,
      altura: 14,
      etiquetaRadio: "5",
      etiquetaAltura: "14",
      enfasis: "volumen",
    }),
  },
];

/**
 * Casos que el type guard DEBE rechazar. Se muestran en la vista previa para
 * comprobar a ojo que degradan al `<figure>` de texto en vez de reventar.
 */
export const CUERPOS_FUERA_DE_BANDA: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Rechazado · caja de razón 10",
    bloque: bloque("Caja demasiado alargada: la arista más corta no admitiría su cota.", {
      cuerpo: "paralelepipedo",
      largo: 100,
      ancho: 10,
      alto: 100,
      etiquetaLargo: "100",
      etiquetaAncho: "10",
      etiquetaAlto: "100",
      enfasis: "volumen",
    }),
  },
  {
    titulo: "Rechazado · cilindro demasiado esbelto",
    bloque: bloque("Cilindro con altura/radio = 20: el radio no sería rotulable.", {
      cuerpo: "cilindro",
      radio: 2,
      altura: 40,
      etiquetaRadio: "2",
      etiquetaAltura: "40",
      enfasis: "superficie",
    }),
  },
  {
    titulo: "Rechazado · sin énfasis declarado",
    bloque: bloque("Paralelepípedo sano al que le falta el campo obligatorio enfasis.", {
      cuerpo: "paralelepipedo",
      largo: 12,
      ancho: 6,
      alto: 8,
      etiquetaLargo: "12",
      etiquetaAncho: "6",
      etiquetaAlto: "8",
    }),
  },
];
