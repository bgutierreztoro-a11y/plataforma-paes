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
 * Los mismos tres cuerpos y los mismos números, desplegados.
 *
 * Son deliberadamente las mismas medidas que `CUERPOS_SOLIDO`: la vista previa
 * sirve entre otras cosas para comprobar a ojo que el sólido y su red hablan
 * del mismo cuerpo, que es justo lo que un componente único garantiza y dos
 * componentes separados dejarían divergir.
 */
export const CUERPOS_DESARROLLO: { titulo: string; bloque: BloqueVisualizacion }[] = [
  {
    titulo: "Paralelepípedo desplegado · superficie",
    bloque: bloque(
      "Red del paralelepípedo en cruz: seis rectángulos, con las tres parejas de caras opuestas compartiendo relleno.",
      {
        cuerpo: "paralelepipedo",
        largo: 12,
        ancho: 6,
        alto: 8,
        etiquetaLargo: "12",
        etiquetaAncho: "6",
        etiquetaAlto: "8",
        enfasis: "superficie",
        vista: "desarrollo",
      },
    ),
  },
  {
    titulo: "Paralelepípedo desplegado · volumen",
    bloque: bloque("La misma red, con relleno uniforme.", {
      cuerpo: "paralelepipedo",
      largo: 12,
      ancho: 6,
      alto: 8,
      etiquetaLargo: "12",
      etiquetaAncho: "6",
      etiquetaAlto: "8",
      enfasis: "volumen",
      vista: "desarrollo",
    }),
  },
  {
    titulo: "Cubo desplegado · superficie",
    bloque: bloque("Red del cubo en cruz: seis cuadrados iguales.", {
      cuerpo: "cubo",
      arista: 10,
      etiquetaArista: "10",
      enfasis: "superficie",
      vista: "desarrollo",
    }),
  },
  {
    titulo: "Cubo desplegado · volumen",
    bloque: bloque("La misma red del cubo, con relleno uniforme.", {
      cuerpo: "cubo",
      arista: 10,
      etiquetaArista: "10",
      enfasis: "volumen",
      vista: "desarrollo",
    }),
  },
  {
    titulo: "Cilindro desplegado · superficie",
    bloque: bloque(
      "Red del cilindro: el manto desenrollado como rectángulo de ancho 2πr, más las dos tapas circulares.",
      {
        cuerpo: "cilindro",
        radio: 5,
        altura: 14,
        etiquetaRadio: "5",
        etiquetaAltura: "14",
        enfasis: "superficie",
        vista: "desarrollo",
      },
    ),
  },
  {
    titulo: "Cilindro desplegado · volumen",
    bloque: bloque("La misma red del cilindro, con relleno uniforme.", {
      cuerpo: "cilindro",
      radio: 5,
      altura: 14,
      etiquetaRadio: "5",
      etiquetaAltura: "14",
      enfasis: "volumen",
      vista: "desarrollo",
    }),
  },
];

/**
 * ⚠️ ESTOS CUATRO CASOS ESTÁN MAL A PROPÓSITO. NO LOS "ARREGLES".
 *
 * Cada uno viola exactamente una guarda de `esDatosCuerpoGeometrico`, y existen
 * para comprobar que el bloque **degrada al `<figure>` de texto** en vez de
 * reventar la página o dibujarse ilegible:
 *
 * - razón 10          → falla la banda de razón y la de píxeles de la caja
 * - cilindro h/r = 20 → falla `RAZON_CILINDRO_MAX`
 * - sin `enfasis`     → falta un campo obligatorio
 * - `vista` con typo  → un literal que no es "solido" ni "desarrollo"
 *
 * `e2e/cuerpos-geometricos.spec.ts` afirma sobre ellos que no aparece ningún
 * `<svg>`, que sí aparece su `descripcion`, y que la página no lanza
 * (`pageerror`). Corregir las medidas o completar los campos que faltan
 * vaciaría ese test sin que ninguna aserción se ponga roja: el spec seguiría
 * pasando contra cuatro casos que ya no prueban nada.
 *
 * Si alguna guarda cambia y uno de estos deja de ser rechazado, lo correcto es
 * empujarlo más lejos de la banda nueva, no moverlo a `CUERPOS_SOLIDO`.
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
  {
    titulo: "Rechazado · vista con typo",
    bloque: bloque(
      "Cubo sano con vista: 'desplegado', que no es uno de los dos literales válidos.",
      {
        cuerpo: "cubo",
        arista: 10,
        etiquetaArista: "10",
        enfasis: "superficie",
        vista: "desplegado",
      },
    ),
  },
];
