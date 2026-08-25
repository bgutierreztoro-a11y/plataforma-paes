import { escalarPuntosAViewBox, verticesTrianguloRectangulo } from "@/lib/figurasGeometricas";

export interface DatosTrianguloPitagoras {
  figura: "trianguloPitagoras";
  catetoA: number;
  catetoB: number;
  etiquetaCatetoA: string;
  etiquetaCatetoB: string;
  etiquetaHipotenusa: string;
}

// Stubs para L2: mismo discriminador `figura`, sin campos propios todavía.
// Existen para que el union type esté completo desde ahora — implementarlos
// es trabajo de L2, no de esta lección.
export interface DatosTriangulo {
  figura: "triangulo";
}
export interface DatosParalelogramo {
  figura: "paralelogramo";
}
export interface DatosTrapecio {
  figura: "trapecio";
}
export interface DatosCirculo {
  figura: "circulo";
}

export type DatosFiguraGeometrica =
  | DatosTrianguloPitagoras
  | DatosTriangulo
  | DatosParalelogramo
  | DatosTrapecio
  | DatosCirculo;

export const FIGURAS_GEOMETRICAS_VALIDAS = [
  "trianguloPitagoras",
  "triangulo",
  "paralelogramo",
  "trapecio",
  "circulo",
] as const;

const TAMANO = 240;
const ALTO = 200;
const MARGEN = 28;

/* El marcador de ángulo recto es el corner de un cuadrado pequeño sobre los
   dos lados que salen del vértice recto, en espacio de pantalla — así no
   importa la orientación final tras escalar/invertir el eje y. */
function TrianguloPitagoras({
  catetoA,
  catetoB,
  etiquetaCatetoA,
  etiquetaCatetoB,
  etiquetaHipotenusa,
}: DatosTrianguloPitagoras) {
  const [origen, extremoA, extremoB] = escalarPuntosAViewBox(
    verticesTrianguloRectangulo(catetoA, catetoB),
    { ancho: TAMANO, alto: ALTO, margen: MARGEN },
  );

  const LADO_MARCADOR = 12;
  const dirA = { x: extremoA.x - origen.x, y: extremoA.y - origen.y };
  const largoA = Math.hypot(dirA.x, dirA.y) || 1;
  const dirB = { x: extremoB.x - origen.x, y: extremoB.y - origen.y };
  const largoB = Math.hypot(dirB.x, dirB.y) || 1;
  const puntoA = {
    x: origen.x + (dirA.x / largoA) * LADO_MARCADOR,
    y: origen.y + (dirA.y / largoA) * LADO_MARCADOR,
  };
  const puntoB = {
    x: origen.x + (dirB.x / largoB) * LADO_MARCADOR,
    y: origen.y + (dirB.y / largoB) * LADO_MARCADOR,
  };
  const puntoDiagonal = { x: puntoA.x + (puntoB.x - origen.x), y: puntoA.y + (puntoB.y - origen.y) };

  const medioCatetoA = { x: (origen.x + extremoA.x) / 2, y: (origen.y + extremoA.y) / 2 };
  const medioCatetoB = { x: (origen.x + extremoB.x) / 2, y: (origen.y + extremoB.y) / 2 };
  const medioHipotenusa = { x: (extremoA.x + extremoB.x) / 2, y: (extremoA.y + extremoB.y) / 2 };

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      <polygon
        points={`${origen.x},${origen.y} ${extremoA.x},${extremoA.y} ${extremoB.x},${extremoB.y}`}
        fill="var(--color-accent-suave)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={`M ${puntoA.x} ${puntoA.y} L ${puntoDiagonal.x} ${puntoDiagonal.y} L ${puntoB.x} ${puntoB.y}`}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
      <text
        x={medioCatetoA.x}
        y={medioCatetoA.y + 16}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fill="var(--color-ink)"
      >
        {etiquetaCatetoA}
      </text>
      <text
        x={medioCatetoB.x - 10}
        y={medioCatetoB.y}
        textAnchor="end"
        dominantBaseline="middle"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fill="var(--color-ink)"
      >
        {etiquetaCatetoB}
      </text>
      <text
        x={medioHipotenusa.x + 10}
        y={medioHipotenusa.y - 6}
        textAnchor="start"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fontWeight="600"
        fill="var(--color-accent-fuerte)"
      >
        {etiquetaHipotenusa}
      </text>
    </svg>
  );
}

export function IlustracionFiguraGeometrica(datos: DatosFiguraGeometrica) {
  switch (datos.figura) {
    case "trianguloPitagoras":
      return <TrianguloPitagoras {...datos} />;
    case "triangulo":
    case "paralelogramo":
    case "trapecio":
    case "circulo":
      throw new Error(
        `IlustracionFiguraGeometrica: figura "${datos.figura}" no implementada todavía (pendiente L2)`,
      );
  }
}
