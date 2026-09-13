/**
 * Piezas compartidas por los cuatro gráficos de datos (barras, líneas, circular
 * y cajón): lienzo, tramas, rótulos y el formato chileno de los números.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ RESTRICCIÓN DE CONTENIDO, heredada de figuras, cuerpos y semejanza.      │
 * │ Solo los valores rotulados son autoritativos. Cada barra, cada punto y   │
 * │ cada uno de los cinco valores de un cajón lleva su número escrito, y la  │
 * │ cuadrícula es la de `pasoDeCuadricula`. Ningún ítem ni bloque puede      │
 * │ pedir leer un valor que no esté rotulado ni caiga en una línea declarada.│
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Significado nunca solo por color: la segunda serie va con trama diagonal y
 * trazo discontinuo, los sectores alternan trama y tono, y toda serie tiene
 * su nombre en la leyenda. Los tokens son los del sistema Línea
 * (`--color-ink`, `--color-accent-*`, `--color-grid-fina`).
 */

/** Ancho y alto del lienzo de barras, líneas y circular. El cajón fija su alto por filas. */
export const LIENZO = { ancho: 320, alto: 200 } as const;

export const TRAZO_INK = "var(--color-ink)";
export const TRAZO_SUAVE = "var(--color-ink-suave)";
export const TRAZO_ACENTO = "var(--color-accent-fuerte)";
export const RELLENO_ACENTO = "var(--color-accent-suave)";
export const CUADRICULA = "var(--color-grid-fina)";

/** Ids de las tramas de `<Tramas />`, para usar como `fill="url(#…)"`. */
export const TRAMA_DIAGONAL = "trama-diagonal";
export const TRAMA_PUNTOS = "trama-puntos";
export const TRAMA_CRUZADA = "trama-cruzada";

/**
 * Las tres tramas, una sola vez por SVG. Los ids son globales al documento,
 * así que dos gráficos en la misma página los repiten sin conflicto: son
 * definiciones idénticas y el navegador toma la primera.
 */
export function Tramas() {
  return (
    <defs>
      <pattern id={TRAMA_DIAGONAL} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill={RELLENO_ACENTO} />
        <line x1="0" y1="0" x2="0" y2="6" stroke={TRAZO_ACENTO} strokeWidth="1.5" />
      </pattern>
      <pattern id={TRAMA_PUNTOS} width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="var(--color-card)" />
        <circle cx="3" cy="3" r="1.3" fill={TRAZO_INK} />
      </pattern>
      <pattern id={TRAMA_CRUZADA} width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill={RELLENO_ACENTO} fillOpacity="0.35" />
        <path d="M0 3.5 H7 M3.5 0 V7" stroke={TRAZO_SUAVE} strokeWidth="1" />
      </pattern>
    </defs>
  );
}

/** Coma decimal y punto de miles, como en todo el contenido. Hasta dos decimales. */
export const formatoNumero = (n: number): string =>
  n.toLocaleString("es-CL", { maximumFractionDigits: 2 });

export function Rotulo({
  x,
  y,
  children,
  anclaje = "middle",
  tamano = 10,
  fuerte = false,
  suave = false,
  acento = false,
  numero = false,
  halo = false,
}: {
  x: number;
  y: number;
  children: string;
  anclaje?: "start" | "middle" | "end";
  tamano?: number;
  fuerte?: boolean;
  suave?: boolean;
  acento?: boolean;
  /** Los números van en tabulares (`.num`), los textos no. */
  numero?: boolean;
  /** Borde del color de la tarjeta detrás de las letras, para leer sobre una trama. */
  halo?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anclaje}
      dominantBaseline="middle"
      fontFamily="var(--font-sans)"
      fontSize={tamano}
      fontWeight={fuerte ? 600 : undefined}
      fill={acento ? TRAZO_ACENTO : suave ? TRAZO_SUAVE : TRAZO_INK}
      stroke={halo ? "var(--color-card)" : undefined}
      strokeWidth={halo ? 3 : undefined}
      strokeLinejoin={halo ? "round" : undefined}
      paintOrder={halo ? "stroke" : undefined}
      className={numero ? "num" : undefined}
    >
      {children}
    </text>
  );
}

/**
 * Estilo de cada serie, fijo: la primera sólida y continua, la segunda con
 * trama diagonal y trazo discontinuo. Con una sola serie se usa la primera.
 */
export const ESTILO_SERIE = [
  { relleno: RELLENO_ACENTO, trazo: TRAZO_INK, dasharray: undefined as string | undefined, marcador: "circulo" as const },
  { relleno: `url(#${TRAMA_DIAGONAL})`, trazo: TRAZO_ACENTO, dasharray: "5 3" as string | undefined, marcador: "cuadrado" as const },
];

/** Leyenda de series, en fila, arriba a la derecha del lienzo. */
export function Leyenda({ nombres, x, y }: { nombres: string[]; x: number; y: number }) {
  if (nombres.length < 2) return null;
  /* Ancho estimado de cada entrada (muestra + texto + aire); el inicio de cada
     una es la suma de las anteriores, sin reasignar durante el render. */
  const anchos = nombres.map((nombre) => 16 + nombre.length * 5.4 + 10);
  const inicios = anchos.map((_, i) => x + anchos.slice(0, i).reduce((s, a) => s + a, 0));
  return (
    <g>
      {nombres.map((nombre, i) => {
        const estilo = ESTILO_SERIE[i];
        const inicio = inicios[i];
        return (
          <g key={nombre}>
            <rect x={inicio} y={y - 5} width="11" height="10" fill={estilo.relleno} stroke={estilo.trazo} strokeWidth="1.2" strokeDasharray={estilo.dasharray} />
            <Rotulo x={inicio + 15} y={y} anclaje="start" tamano={9} suave>
              {nombre}
            </Rotulo>
          </g>
        );
      })}
    </g>
  );
}

/** Marca de quiebre en un eje truncado: un zigzag corto que interrumpe la línea del eje. */
export function Quiebre({ x, y, vertical }: { x: number; y: number; vertical: boolean }) {
  const d = vertical
    ? `M ${x} ${y + 6} L ${x - 4} ${y + 3} L ${x + 4} ${y - 3} L ${x} ${y - 6}`
    : `M ${x - 6} ${y} L ${x - 3} ${y - 4} L ${x + 3} ${y + 4} L ${x + 6} ${y}`;
  return (
    <g>
      <path d={d} fill="none" stroke="var(--color-card)" strokeWidth="5" />
      <path d={d} fill="none" stroke={TRAZO_ACENTO} strokeWidth="1.5" />
    </g>
  );
}
