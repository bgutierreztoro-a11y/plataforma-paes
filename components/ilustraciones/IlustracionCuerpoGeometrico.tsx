import {
  ARISTAS_ACOTADAS,
  ARISTAS_OCULTAS,
  CARAS_VISIBLES,
  calcularCilindroEnViewBox,
  verticesParalelepipedo,
} from "@/lib/cuerposGeometricos";
import { escalarPuntosAViewBox, type Punto } from "@/lib/figurasGeometricas";

/**
 * Cuerpos geométricos en proyección caballera: paralelepípedos, cubos y
 * cilindros.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ RESTRICCIÓN DE CONTENIDO — no es una nota de estilo.                     │
 * │                                                                          │
 * │ La caballera dibuja la arista de profundidad a la MITAD de su largo real │
 * │ (k = 0.5). El dibujo NO está a escala.                                   │
 * │                                                                          │
 * │ 1. Ningún ítem puede pedir comparar longitudes de aristas leyéndolas del │
 * │    dibujo. Las tres cotas rotuladas son la única fuente de verdad.       │
 * │ 2. Las tres aristas acotadas van SIEMPRE rotuladas en vista "solido".    │
 * │    No hay modo sin cotas.                                                │
 * │                                                                          │
 * │ La regla completa, con su origen y su evidencia numérica, está en        │
 * │ docs/reglas-modulo.md regla 6.                                           │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

/** Qué magnitud está enseñando el dibujo. Cambia el énfasis visual, no la geometría. */
export type EnfasisCuerpo = "superficie" | "volumen";

export interface DatosParalelepipedo {
  cuerpo: "paralelepipedo";
  largo: number;
  ancho: number;
  alto: number;
  etiquetaLargo: string;
  etiquetaAncho: string;
  etiquetaAlto: string;
  enfasis: EnfasisCuerpo;
}

export interface DatosCubo {
  cuerpo: "cubo";
  arista: number;
  etiquetaArista: string;
  enfasis: EnfasisCuerpo;
}

export interface DatosCilindro {
  cuerpo: "cilindro";
  radio: number;
  altura: number;
  etiquetaRadio: string;
  etiquetaAltura: string;
  enfasis: EnfasisCuerpo;
}

export type DatosCuerpoGeometrico = DatosParalelepipedo | DatosCubo | DatosCilindro;

export const CUERPOS_GEOMETRICOS_VALIDOS = ["paralelepipedo", "cubo", "cilindro"] as const;

export const ENFASIS_VALIDOS = ["superficie", "volumen"] as const;

const TAMANO = 240;
const ALTO = 200;
const MARGEN = 28;
const VIEW_BOX = { ancho: TAMANO, alto: ALTO, margen: MARGEN };

/* Con énfasis en superficie las tres caras se distinguen entre sí, porque lo
   que hay que contar son caras. Con énfasis en volumen el sólido se lee como
   un cuerpo macizo y lo que se destaca son las tres aristas que se multiplican. */
const OPACIDAD_CARAS: Record<EnfasisCuerpo, [number, number, number]> = {
  superficie: [0.95, 0.6, 0.4],
  volumen: [0.7, 0.7, 0.7],
};

const medio = (a: Punto, b: Punto): Punto => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const puntos = (ps: Punto[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");

function Etiqueta({
  en,
  dx,
  dy,
  anclaje,
  destacada,
  children,
}: {
  en: Punto;
  dx: number;
  dy: number;
  anclaje: "start" | "middle" | "end";
  destacada?: boolean;
  children: string;
}) {
  return (
    <text
      x={en.x + dx}
      y={en.y + dy}
      textAnchor={anclaje}
      dominantBaseline="middle"
      fontFamily="var(--font-sans)"
      fontSize="11"
      fontWeight={destacada ? "600" : undefined}
      fill={destacada ? "var(--color-accent-fuerte)" : "var(--color-ink)"}
    >
      {children}
    </text>
  );
}

/**
 * Paralelepípedo y cubo comparten renderizador: un cubo es el caso
 * largo = ancho = alto. La única diferencia es que sus tres cotas repiten la
 * misma etiqueta, y eso es deliberado — deja `a × a × a` a la vista y mantiene
 * cierta la regla de que las tres aristas siempre van rotuladas.
 */
function Caja({
  largo,
  ancho,
  alto,
  etiquetas,
  enfasis,
}: {
  largo: number;
  ancho: number;
  alto: number;
  etiquetas: [string, string, string];
  enfasis: EnfasisCuerpo;
}) {
  const v = escalarPuntosAViewBox(verticesParalelepipedo(largo, ancho, alto), VIEW_BOX);
  const opacidades = OPACIDAD_CARAS[enfasis];
  const grosorCota = enfasis === "volumen" ? 3 : 2;

  // Los offsets de cada cota van en espacio de pantalla, igual que en
  // IlustracionFiguraGeometrica: el largo cuelga bajo la base, el alto se
  // apoya a la izquierda, y el ancho sigue la diagonal hacia abajo-derecha.
  const colocacion: { dx: number; dy: number; anclaje: "start" | "middle" | "end" }[] = [
    { dx: 0, dy: 15, anclaje: "middle" },
    { dx: -8, dy: 0, anclaje: "end" },
    { dx: 9, dy: 9, anclaje: "start" },
  ];

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      {[CARAS_VISIBLES.superior, CARAS_VISIBLES.derecha, CARAS_VISIBLES.frontal].map(
        (cara, i) => (
          <polygon
            key={i}
            points={puntos(cara.map((idx) => v[idx]))}
            fill="var(--color-accent-suave)"
            fillOpacity={[opacidades[1], opacidades[2], opacidades[0]][i]}
            stroke="var(--color-ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ),
      )}

      {ARISTAS_OCULTAS.map(([desde, hasta], i) => (
        <path
          key={i}
          d={`M ${v[desde].x} ${v[desde].y} L ${v[hasta].x} ${v[hasta].y}`}
          fill="none"
          stroke="var(--color-ink-suave)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {ARISTAS_ACOTADAS.map(({ desde, hasta }, i) => (
        <path
          key={i}
          d={`M ${v[desde].x} ${v[desde].y} L ${v[hasta].x} ${v[hasta].y}`}
          fill="none"
          stroke={enfasis === "volumen" ? "var(--color-accent-fuerte)" : "var(--color-ink)"}
          strokeWidth={grosorCota}
          strokeLinecap="round"
        />
      ))}

      {ARISTAS_ACOTADAS.map(({ desde, hasta }, i) => (
        <Etiqueta
          key={i}
          en={medio(v[desde], v[hasta])}
          dx={colocacion[i].dx}
          dy={colocacion[i].dy}
          anclaje={colocacion[i].anclaje}
          destacada={enfasis === "volumen"}
        >
          {etiquetas[i]}
        </Etiqueta>
      ))}
    </svg>
  );
}

/**
 * Cilindro recto de pie. Las tapas son elipses escorzadas con el mismo factor
 * k que la caballera, para que el lenguaje visual sea uno solo entre cajas y
 * cilindros. La mitad trasera de la tapa inferior va punteada: es el borde que
 * el cuerpo del cilindro tapa.
 */
function Cilindro({ radio, altura, etiquetaRadio, etiquetaAltura, enfasis }: DatosCilindro) {
  const { centroSuperior, centroInferior, rx, ry } = calcularCilindroEnViewBox(
    radio,
    altura,
    VIEW_BOX,
  );
  const destacar = enfasis === "volumen";

  const izquierda = { x: centroSuperior.x - rx, y: centroSuperior.y };
  const derecha = { x: centroSuperior.x + rx, y: centroSuperior.y };

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      {/* Manto: los dos bordes rectos más la media elipse de abajo que sí se ve. */}
      <path
        d={
          `M ${izquierda.x} ${izquierda.y} L ${izquierda.x} ${centroInferior.y} ` +
          `A ${rx} ${ry} 0 0 0 ${derecha.x} ${centroInferior.y} ` +
          `L ${derecha.x} ${derecha.y} Z`
        }
        fill="var(--color-accent-suave)"
        fillOpacity={destacar ? 0.7 : 0.5}
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Mitad trasera de la tapa inferior: oculta por el cuerpo. */}
      <path
        d={
          `M ${izquierda.x} ${centroInferior.y} ` +
          `A ${rx} ${ry} 0 0 1 ${derecha.x} ${centroInferior.y}`
        }
        fill="none"
        stroke="var(--color-ink-suave)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      <ellipse
        cx={centroSuperior.x}
        cy={centroSuperior.y}
        rx={rx}
        ry={ry}
        fill="var(--color-accent-suave)"
        fillOpacity={enfasis === "superficie" ? 0.95 : 0.7}
        stroke="var(--color-ink)"
        strokeWidth="2"
      />

      {/* El radio, sobre la tapa superior. */}
      <path
        d={`M ${centroSuperior.x} ${centroSuperior.y} L ${derecha.x} ${derecha.y}`}
        fill="none"
        stroke={destacar ? "var(--color-accent-fuerte)" : "var(--color-ink)"}
        strokeWidth={destacar ? 3 : 1.5}
        strokeLinecap="round"
      />
      <Etiqueta en={medio(centroSuperior, derecha)} dx={0} dy={-9} anclaje="middle" destacada={destacar}>
        {etiquetaRadio}
      </Etiqueta>

      {/* La altura, sobre la generatriz izquierda. */}
      <path
        d={`M ${izquierda.x} ${izquierda.y} L ${izquierda.x} ${centroInferior.y}`}
        fill="none"
        stroke={destacar ? "var(--color-accent-fuerte)" : "var(--color-ink)"}
        strokeWidth={destacar ? 3 : 2}
        strokeLinecap="round"
      />
      <Etiqueta
        en={medio(izquierda, { x: izquierda.x, y: centroInferior.y })}
        dx={-8}
        dy={0}
        anclaje="end"
        destacada={destacar}
      >
        {etiquetaAltura}
      </Etiqueta>
    </svg>
  );
}

export function IlustracionCuerpoGeometrico(datos: DatosCuerpoGeometrico) {
  switch (datos.cuerpo) {
    case "paralelepipedo":
      return (
        <Caja
          largo={datos.largo}
          ancho={datos.ancho}
          alto={datos.alto}
          etiquetas={[datos.etiquetaLargo, datos.etiquetaAlto, datos.etiquetaAncho]}
          enfasis={datos.enfasis}
        />
      );
    case "cubo":
      return (
        <Caja
          largo={datos.arista}
          ancho={datos.arista}
          alto={datos.arista}
          etiquetas={[datos.etiquetaArista, datos.etiquetaArista, datos.etiquetaArista]}
          enfasis={datos.enfasis}
        />
      );
    case "cilindro":
      return <Cilindro {...datos} />;
  }
}
