import {
  ARISTAS_ACOTADAS,
  ARISTAS_OCULTAS,
  CARAS_VISIBLES,
  calcularCilindroEnViewBox,
  verticesDesarrolloCilindro,
  verticesDesarrolloParalelepipedo,
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

/**
 * El cuerpo armado, o su red desplegada. Es una variante del mismo componente
 * y no un componente aparte porque los MISMOS números alimentan los dos
 * dibujos: separarlos duplicaría la lógica de etiquetas y validación y dejaría
 * que las dos versiones divergieran. Mismo criterio que `DatosTriangulo`, que
 * ya sostiene dos modos en un solo tipo.
 *
 * Ojo: la red es una figura PLANA. No pasa por la caballera — va directo a
 * `escalarPuntosAViewBox`, sin escorzo. La restricción de la cabecera sobre
 * comparar aristas a ojo aplica a `solido`, que es donde hay escorzo.
 */
export type VistaCuerpo = "solido" | "desarrollo";

export const VISTAS_VALIDAS = ["solido", "desarrollo"] as const;

export interface DatosParalelepipedo {
  cuerpo: "paralelepipedo";
  largo: number;
  ancho: number;
  alto: number;
  etiquetaLargo: string;
  etiquetaAncho: string;
  etiquetaAlto: string;
  enfasis: EnfasisCuerpo;
  vista?: VistaCuerpo;
}

export interface DatosCubo {
  cuerpo: "cubo";
  arista: number;
  etiquetaArista: string;
  enfasis: EnfasisCuerpo;
  vista?: VistaCuerpo;
}

export interface DatosCilindro {
  cuerpo: "cilindro";
  radio: number;
  altura: number;
  etiquetaRadio: string;
  etiquetaAltura: string;
  enfasis: EnfasisCuerpo;
  vista?: VistaCuerpo;
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

/* Las 3 parejas de caras opuestas de la red. Con énfasis en superficie cada
   pareja comparte relleno, para que la red se lea como "tres pares iguales" —
   que es exactamente 2(ab + bc + ac) hecho dibujo. */
const PAREJA_DE_CARA: Record<string, number> = {
  frente: 0,
  atrás: 0,
  izquierda: 1,
  derecha: 1,
  base: 2,
  tapa: 2,
};
const OPACIDAD_PAREJA = [0.9, 0.6, 0.38];

/**
 * Escala varios polígonos a la vez, con una sola pasada: se aplanan todos los
 * puntos, se escalan juntos —para que compartan factor y encuadre— y se
 * reagrupan. Escalar cada cara por su cuenta las desalinearía y la red dejaría
 * de cerrar.
 */
function escalarGrupos(grupos: Punto[][]): Punto[][] {
  const planos = escalarPuntosAViewBox(grupos.flat(), VIEW_BOX);
  const salida: Punto[][] = [];
  let i = 0;
  for (const g of grupos) {
    salida.push(planos.slice(i, i + g.length));
    i += g.length;
  }
  return salida;
}

/**
 * Red del paralelepípedo, en cruz. Las 6 caras suman el área de superficie, y
 * ese es todo el punto del dibujo: desarmar la caja es lo que hace visible de
 * dónde sale 2(ab + bc + ac).
 *
 * Las cotas van una por dimensión, sobre las caras donde cada una se lee sin
 * ambigüedad: el largo y el alto sobre la cara del frente, el ancho sobre la
 * de la izquierda.
 */
function CajaDesarrollo({
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
  const caras = verticesDesarrolloParalelepipedo(largo, ancho, alto);
  const escaladas = escalarGrupos(caras.map((c) => c.puntos));
  const porNombre = new Map(caras.map((c, i) => [c.nombre, escaladas[i]]));
  const frente = porNombre.get("frente")!;
  const izquierda = porNombre.get("izquierda")!;

  // Los vértices de cada rectángulo salen en orden [abajo-izq, abajo-der,
  // arriba-der, arriba-izq] en datos; tras invertir el eje y, el índice 0 queda
  // abajo-izquierda en pantalla y el 3 arriba-izquierda.
  const cotas: { en: Punto; dx: number; dy: number; anclaje: "start" | "middle" | "end"; texto: string }[] = [
    { en: medio(frente[0], frente[1]), dx: 0, dy: 14, anclaje: "middle", texto: etiquetas[0] },
    { en: medio(frente[0], frente[3]), dx: 7, dy: 0, anclaje: "start", texto: etiquetas[1] },
    { en: medio(izquierda[0], izquierda[1]), dx: 0, dy: 14, anclaje: "middle", texto: etiquetas[2] },
  ];

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      {caras.map((cara, i) => (
        <polygon
          key={cara.nombre}
          points={puntos(escaladas[i])}
          fill="var(--color-accent-suave)"
          fillOpacity={
            enfasis === "superficie" ? OPACIDAD_PAREJA[PAREJA_DE_CARA[cara.nombre]] : 0.55
          }
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}
      {cotas.map((c, i) => (
        <Etiqueta key={i} en={c.en} dx={c.dx} dy={c.dy} anclaje={c.anclaje}>
          {c.texto}
        </Etiqueta>
      ))}
    </svg>
  );
}

/**
 * Red del cilindro: el manto desenrollado es un rectángulo cuyo ancho es la
 * circunferencia 2πr, más las dos tapas tangentes a sus bordes. Que ese ancho
 * sea 2πr y no otra cosa ES el descubrimiento del área de superficie de un
 * cilindro, así que la cota del manto dice la circunferencia, no el radio.
 */
function CilindroDesarrollo({
  radio,
  altura,
  etiquetaRadio,
  etiquetaAltura,
  enfasis,
}: DatosCilindro) {
  const d = verticesDesarrolloCilindro(radio, altura);
  // Se escala junto con los cuatro extremos de cada tapa, para que las tapas
  // entren en el encuadre y compartan el factor con el manto.
  const extremos = (c: { centro: Punto; radio: number }): Punto[] => [
    { x: c.centro.x - c.radio, y: c.centro.y },
    { x: c.centro.x + c.radio, y: c.centro.y },
    { x: c.centro.x, y: c.centro.y - c.radio },
    { x: c.centro.x, y: c.centro.y + c.radio },
  ];
  const [manto, inf, sup] = escalarGrupos([
    [...d.manto],
    extremos(d.tapaInferior),
    extremos(d.tapaSuperior),
  ]);
  const radioEscalado = (inf[1].x - inf[0].x) / 2;
  const centroInf = { x: (inf[0].x + inf[1].x) / 2, y: (inf[2].y + inf[3].y) / 2 };
  const centroSup = { x: (sup[0].x + sup[1].x) / 2, y: (sup[2].y + sup[3].y) / 2 };
  const opacidadTapa = enfasis === "superficie" ? 0.9 : 0.55;

  return (
    <svg viewBox={`0 0 ${TAMANO} ${ALTO}`} className="h-auto w-full" aria-hidden="true">
      {[centroInf, centroSup].map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={radioEscalado}
          fill="var(--color-accent-suave)"
          fillOpacity={opacidadTapa}
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
      ))}
      <polygon
        points={puntos(manto)}
        fill="var(--color-accent-suave)"
        fillOpacity={enfasis === "superficie" ? 0.45 : 0.55}
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* El ancho del manto es la circunferencia. Se rotula como tal. */}
      <Etiqueta en={medio(manto[0], manto[1])} dx={0} dy={14} anclaje="middle" destacada>
        {`2π · ${etiquetaRadio}`}
      </Etiqueta>
      <Etiqueta en={medio(manto[0], manto[3])} dx={-7} dy={0} anclaje="end">
        {etiquetaAltura}
      </Etiqueta>
      {/* El radio, sobre la tapa superior. */}
      <path
        d={`M ${centroSup.x} ${centroSup.y} L ${centroSup.x + radioEscalado} ${centroSup.y}`}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Etiqueta
        en={{ x: centroSup.x + radioEscalado / 2, y: centroSup.y }}
        dx={0}
        dy={-8}
        anclaje="middle"
      >
        {etiquetaRadio}
      </Etiqueta>
    </svg>
  );
}

export function IlustracionCuerpoGeometrico(datos: DatosCuerpoGeometrico) {
  const desarrollo = datos.vista === "desarrollo";
  switch (datos.cuerpo) {
    case "paralelepipedo": {
      const props = {
        largo: datos.largo,
        ancho: datos.ancho,
        alto: datos.alto,
        etiquetas: [datos.etiquetaLargo, datos.etiquetaAlto, datos.etiquetaAncho] as [
          string,
          string,
          string,
        ],
        enfasis: datos.enfasis,
      };
      return desarrollo ? <CajaDesarrollo {...props} /> : <Caja {...props} />;
    }
    case "cubo": {
      const props = {
        largo: datos.arista,
        ancho: datos.arista,
        alto: datos.arista,
        etiquetas: [datos.etiquetaArista, datos.etiquetaArista, datos.etiquetaArista] as [
          string,
          string,
          string,
        ],
        enfasis: datos.enfasis,
      };
      return desarrollo ? <CajaDesarrollo {...props} /> : <Caja {...props} />;
    }
    case "cilindro":
      return desarrollo ? <CilindroDesarrollo {...datos} /> : <Cilindro {...datos} />;
  }
}
