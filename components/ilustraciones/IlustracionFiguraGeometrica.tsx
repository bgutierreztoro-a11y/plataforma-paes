import {
  calcularCirculoEnViewBox,
  escalarPuntosAViewBox,
  verticesParalelogramo,
  verticesTriangulo,
  verticesTrianguloRectangulo,
  verticesTrapecio,
} from "@/lib/figurasGeometricas";

export interface DatosTrianguloPitagoras {
  figura: "trianguloPitagoras";
  catetoA: number;
  catetoB: number;
  etiquetaCatetoA: string;
  etiquetaCatetoB: string;
  etiquetaHipotenusa: string;
}

/**
 * Triángulo genérico (no necesariamente rectángulo): base + altura para
 * ítems de área, o los 3 lados para ítems de perímetro. `etiquetaAltura`
 * decide el modo — si viene, se dibuja la altura punteada (modo área); si
 * no, se etiquetan los 3 lados (modo perímetro). Ver validación en
 * `BloqueVisualizacion.esDatosFiguraGeometrica`: los dos modos no se mezclan.
 */
export interface DatosTriangulo {
  figura: "triangulo";
  base: number;
  altura: number;
  desplazamientoApice?: number;
  etiquetaBase: string;
  etiquetaAltura?: string;
  etiquetaLadoIzquierdo?: string;
  etiquetaLadoDerecho?: string;
}

export interface DatosParalelogramo {
  figura: "paralelogramo";
  base: number;
  altura: number;
  desplazamiento?: number;
  etiquetaBase: string;
  etiquetaAltura?: string;
  etiquetaLado?: string;
}

export interface DatosTrapecio {
  figura: "trapecio";
  baseMayor: number;
  baseMenor: number;
  altura: number;
  desplazamientoIzquierdo?: number;
  etiquetaBaseMayor: string;
  etiquetaBaseMenor: string;
  etiquetaAltura?: string;
  etiquetaLadoIzquierdo?: string;
  etiquetaLadoDerecho?: string;
}

export interface DatosCirculo {
  figura: "circulo";
  radio: number;
  etiquetaRadio?: string;
  etiquetaDiametro?: string;
  etiquetaCircunferencia?: string;
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

/* Línea punteada de altura: pie de la altura = proyección del ápice/lado
   superior sobre la línea de la base. Como la base siempre queda horizontal
   tras escalar (ambos extremos comparten y de pantalla), el pie comparte la
   x del punto que se proyecta y la y del punto de la base. */
function Triangulo({
  base,
  altura,
  desplazamientoApice,
  etiquetaBase,
  etiquetaAltura,
  etiquetaLadoIzquierdo,
  etiquetaLadoDerecho,
}: DatosTriangulo) {
  const [origen, extremoBase, apice] = escalarPuntosAViewBox(
    verticesTriangulo(base, altura, desplazamientoApice),
    { ancho: TAMANO, alto: ALTO, margen: MARGEN },
  );

  const medioBase = { x: (origen.x + extremoBase.x) / 2, y: (origen.y + extremoBase.y) / 2 };
  const medioLadoIzquierdo = { x: (origen.x + apice.x) / 2, y: (origen.y + apice.y) / 2 };
  const medioLadoDerecho = { x: (extremoBase.x + apice.x) / 2, y: (extremoBase.y + apice.y) / 2 };
  const pieAltura = { x: apice.x, y: origen.y };

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      <polygon
        points={`${origen.x},${origen.y} ${extremoBase.x},${extremoBase.y} ${apice.x},${apice.y}`}
        fill="var(--color-accent-suave)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {etiquetaAltura && (
        <path
          d={`M ${apice.x} ${apice.y} L ${pieAltura.x} ${pieAltura.y}`}
          fill="none"
          stroke="var(--color-ink-suave)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
      <text
        x={medioBase.x}
        y={medioBase.y + 16}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fill="var(--color-ink)"
      >
        {etiquetaBase}
      </text>
      {etiquetaAltura && (
        <text
          x={pieAltura.x + 8}
          y={(apice.y + pieAltura.y) / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaAltura}
        </text>
      )}
      {etiquetaLadoIzquierdo && (
        <text
          x={medioLadoIzquierdo.x - 8}
          y={medioLadoIzquierdo.y}
          textAnchor="end"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaLadoIzquierdo}
        </text>
      )}
      {etiquetaLadoDerecho && (
        <text
          x={medioLadoDerecho.x + 8}
          y={medioLadoDerecho.y}
          textAnchor="start"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaLadoDerecho}
        </text>
      )}
    </svg>
  );
}

function Paralelogramo({
  base,
  altura,
  desplazamiento,
  etiquetaBase,
  etiquetaAltura,
  etiquetaLado,
}: DatosParalelogramo) {
  const [origen, extremoBase, superiorDerecho, superiorIzquierdo] = escalarPuntosAViewBox(
    verticesParalelogramo(base, altura, desplazamiento),
    { ancho: TAMANO, alto: ALTO, margen: MARGEN },
  );

  const medioBase = { x: (origen.x + extremoBase.x) / 2, y: (origen.y + extremoBase.y) / 2 };
  const medioLado = { x: (origen.x + superiorIzquierdo.x) / 2, y: (origen.y + superiorIzquierdo.y) / 2 };
  const pieAltura = { x: superiorIzquierdo.x, y: origen.y };

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      <polygon
        points={`${origen.x},${origen.y} ${extremoBase.x},${extremoBase.y} ${superiorDerecho.x},${superiorDerecho.y} ${superiorIzquierdo.x},${superiorIzquierdo.y}`}
        fill="var(--color-accent-suave)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {etiquetaAltura && (
        <path
          d={`M ${superiorIzquierdo.x} ${superiorIzquierdo.y} L ${pieAltura.x} ${pieAltura.y}`}
          fill="none"
          stroke="var(--color-ink-suave)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
      <text
        x={medioBase.x}
        y={medioBase.y + 16}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fill="var(--color-ink)"
      >
        {etiquetaBase}
      </text>
      {etiquetaAltura && (
        <text
          x={pieAltura.x + 8}
          y={(superiorIzquierdo.y + pieAltura.y) / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaAltura}
        </text>
      )}
      {etiquetaLado && (
        <text
          x={medioLado.x - 8}
          y={medioLado.y}
          textAnchor="end"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaLado}
        </text>
      )}
    </svg>
  );
}

function Trapecio({
  baseMayor,
  baseMenor,
  altura,
  desplazamientoIzquierdo,
  etiquetaBaseMayor,
  etiquetaBaseMenor,
  etiquetaAltura,
  etiquetaLadoIzquierdo,
  etiquetaLadoDerecho,
}: DatosTrapecio) {
  const [origen, extremoBase, superiorDerecho, superiorIzquierdo] = escalarPuntosAViewBox(
    verticesTrapecio(baseMayor, baseMenor, altura, desplazamientoIzquierdo),
    { ancho: TAMANO, alto: ALTO, margen: MARGEN },
  );

  const medioBaseMayor = { x: (origen.x + extremoBase.x) / 2, y: (origen.y + extremoBase.y) / 2 };
  const medioBaseMenor = {
    x: (superiorIzquierdo.x + superiorDerecho.x) / 2,
    y: (superiorIzquierdo.y + superiorDerecho.y) / 2,
  };
  const medioLadoIzquierdo = { x: (origen.x + superiorIzquierdo.x) / 2, y: (origen.y + superiorIzquierdo.y) / 2 };
  const medioLadoDerecho = {
    x: (extremoBase.x + superiorDerecho.x) / 2,
    y: (extremoBase.y + superiorDerecho.y) / 2,
  };
  const pieAltura = { x: superiorIzquierdo.x, y: origen.y };

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      <polygon
        points={`${origen.x},${origen.y} ${extremoBase.x},${extremoBase.y} ${superiorDerecho.x},${superiorDerecho.y} ${superiorIzquierdo.x},${superiorIzquierdo.y}`}
        fill="var(--color-accent-suave)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {etiquetaAltura && (
        <path
          d={`M ${superiorIzquierdo.x} ${superiorIzquierdo.y} L ${pieAltura.x} ${pieAltura.y}`}
          fill="none"
          stroke="var(--color-ink-suave)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
      <text
        x={medioBaseMayor.x}
        y={medioBaseMayor.y + 16}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fill="var(--color-ink)"
      >
        {etiquetaBaseMayor}
      </text>
      <text
        x={medioBaseMenor.x}
        y={medioBaseMenor.y - 8}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="11"
        fill="var(--color-ink)"
      >
        {etiquetaBaseMenor}
      </text>
      {etiquetaAltura && (
        <text
          x={pieAltura.x + 8}
          y={(superiorIzquierdo.y + pieAltura.y) / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaAltura}
        </text>
      )}
      {etiquetaLadoIzquierdo && (
        <text
          x={medioLadoIzquierdo.x - 8}
          y={medioLadoIzquierdo.y}
          textAnchor="end"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaLadoIzquierdo}
        </text>
      )}
      {etiquetaLadoDerecho && (
        <text
          x={medioLadoDerecho.x + 8}
          y={medioLadoDerecho.y}
          textAnchor="start"
          dominantBaseline="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaLadoDerecho}
        </text>
      )}
    </svg>
  );
}

function Circulo({ radio, etiquetaRadio, etiquetaDiametro, etiquetaCircunferencia }: DatosCirculo) {
  const { centro, radioEscalado } = calcularCirculoEnViewBox(radio, {
    ancho: TAMANO,
    alto: ALTO,
    margen: MARGEN,
  });

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      <circle
        cx={centro.x}
        cy={centro.y}
        r={radioEscalado}
        fill="var(--color-accent-suave)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      {etiquetaDiametro && (
        <path
          d={`M ${centro.x - radioEscalado} ${centro.y} L ${centro.x + radioEscalado} ${centro.y}`}
          fill="none"
          stroke="var(--color-ink-suave)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
      {etiquetaRadio && (
        <path
          d={`M ${centro.x} ${centro.y} L ${centro.x} ${centro.y - radioEscalado}`}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
      )}
      {etiquetaDiametro && (
        <text
          x={centro.x}
          y={centro.y + 14}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaDiametro}
        </text>
      )}
      {etiquetaRadio && (
        <text
          x={centro.x + 6}
          y={centro.y - radioEscalado / 2}
          textAnchor="start"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fill="var(--color-ink)"
        >
          {etiquetaRadio}
        </text>
      )}
      {etiquetaCircunferencia && (
        <text
          x={centro.x}
          y={centro.y - radioEscalado - 8}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="600"
          fill="var(--color-accent-fuerte)"
        >
          {etiquetaCircunferencia}
        </text>
      )}
    </svg>
  );
}

export function IlustracionFiguraGeometrica(datos: DatosFiguraGeometrica) {
  switch (datos.figura) {
    case "trianguloPitagoras":
      return <TrianguloPitagoras {...datos} />;
    case "triangulo":
      return <Triangulo {...datos} />;
    case "paralelogramo":
      return <Paralelogramo {...datos} />;
    case "trapecio":
      return <Trapecio {...datos} />;
    case "circulo":
      return <Circulo {...datos} />;
  }
}
