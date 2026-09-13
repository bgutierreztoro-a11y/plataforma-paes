import {
  RESERVA_COTA_INFERIOR,
  SEPARACION_RELATIVA,
  VIEW_BOX_SEMEJANZA,
  escalaAnidada,
  escalaLadoALado,
  escalarPoligono,
  extension,
  type DatosSemejanzaAnidada,
  type DatosSemejanzaLadoALado,
} from "@/lib/semejanza";
import type { Poligono } from "@/lib/transformacionesIsometricas";
import type { DatosSemejanza } from "@/lib/tipos";

/**
 * Dos figuras semejantes con TODAS sus cotas rotuladas.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ RESTRICCIÓN DE CONTENIDO, heredada de figuras y cuerpos.                 │
 * │ Solo las cotas rotuladas son autoritativas: ningún ítem puede pedir      │
 * │ comparar longitudes leyéndolas del dibujo. Las dos figuras se dibujan a │
 * │ una misma escala para que la razón se vea, pero lo que se mide está en   │
 * │ los rótulos, y una cota puede ser una letra ("x") cuando es la incógnita.│
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * `ladoALado`: la original a la izquierda y su imagen por k a la derecha,
 * apoyadas en la misma línea. `anidada`: dos triángulos rectángulos que
 * comparten el vértice del extremo (configuración sombra/poste), con el rayo
 * común en trazo discontinuo. Significado nunca solo por color: la imagen se
 * distingue por el trazo discontinuo y por sus rótulos.
 */

const { ancho: ANCHO, alto: ALTO, margen: MARGEN } = VIEW_BOX_SEMEJANZA;
const AREA_ANCHO = ANCHO - MARGEN * 2;
const AREA_ALTO = ALTO - MARGEN * 2;

interface Pixel {
  x: number;
  y: number;
}

function Cota({ en, dx, dy, anclaje, destacada, children }: { en: Pixel; dx: number; dy: number; anclaje: "start" | "middle" | "end"; destacada?: boolean; children: string }) {
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

const centroide = (ps: Pixel[]): Pixel => ({
  x: ps.reduce((s, p) => s + p.x, 0) / ps.length,
  y: ps.reduce((s, p) => s + p.y, 0) / ps.length,
});

/** Desplazamiento unitario desde el centro de la figura hacia un punto, en píxeles. */
function haciaAfuera(desde: Pixel, punto: Pixel, largo: number): { dx: number; dy: number } {
  const dx = punto.x - desde.x;
  const dy = punto.y - desde.y;
  const norma = Math.hypot(dx, dy) || 1;
  return { dx: (dx / norma) * largo, dy: (dy / norma) * largo };
}

function FiguraPlana({
  puntos,
  cotas,
  rotulos,
  imagen,
}: {
  puntos: Pixel[];
  cotas: string[];
  rotulos?: string[];
  imagen: boolean;
}) {
  const c = centroide(puntos);
  return (
    <g>
      <polygon
        points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="var(--color-accent-suave)"
        fillOpacity={imagen ? 0.25 : 0.55}
        stroke={imagen ? "var(--color-accent-fuerte)" : "var(--color-ink)"}
        strokeWidth="2"
        strokeDasharray={imagen ? "6 4" : undefined}
        strokeLinejoin="round"
      />
      {puntos.map((p, i) => {
        const q = puntos[(i + 1) % puntos.length];
        const medio = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
        const { dx, dy } = haciaAfuera(c, medio, 13);
        const anclaje = dx > 3 ? "start" : dx < -3 ? "end" : "middle";
        return (
          <Cota key={`c${i}`} en={medio} dx={dx} dy={dy} anclaje={anclaje} destacada={imagen}>
            {cotas[i]}
          </Cota>
        );
      })}
      {rotulos?.map((r, i) => {
        const { dx, dy } = haciaAfuera(c, puntos[i], 12);
        return (
          <text
            key={`r${i}`}
            x={puntos[i].x + dx}
            y={puntos[i].y + dy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-sans)"
            fontSize="10"
            fontWeight="600"
            fill={imagen ? "var(--color-accent-fuerte)" : "var(--color-ink)"}
          >
            {r}
          </text>
        );
      })}
    </g>
  );
}

function aPixeles(fig: Poligono, escala: number, offsetX: number, baseY: number, minX: number, minY: number): Pixel[] {
  return fig.map(([x, y]) => ({ x: offsetX + (x - minX) * escala, y: baseY - (y - minY) * escala }));
}

function LadoALado({ original, k, imagen }: DatosSemejanzaLadoALado) {
  const figA = original.vertices;
  const figB = escalarPoligono(figA, k);
  const escala = escalaLadoALado(figA, k);
  const a = extension(figA);
  const b = extension(figB);
  const separacion = (a.ancho + b.ancho) * SEPARACION_RELATIVA * escala;
  const anchoTotal = (a.ancho + b.ancho) * escala + separacion;
  const altoTotal = Math.max(a.alto, b.alto) * escala;
  const offsetX = MARGEN + (AREA_ANCHO - anchoTotal) / 2;
  const baseY = MARGEN + (AREA_ALTO + altoTotal) / 2;
  const minX = (fig: Poligono) => Math.min(...fig.map((p) => p[0]));
  const minY = (fig: Poligono) => Math.min(...fig.map((p) => p[1]));
  const puntosA = aPixeles(figA, escala, offsetX, baseY, minX(figA), minY(figA));
  const puntosB = aPixeles(figB, escala, offsetX + a.ancho * escala + separacion, baseY, minX(figB), minY(figB));
  const cotasA = original.cotas.join(", ");
  const cotasB = imagen.cotas.join(", ");
  const etiqueta = `Dos figuras semejantes de razón ${k}: la original, con lados ${cotasA}, y su imagen, con lados ${cotasB}, dibujadas una junto a otra a la misma escala.`;
  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      <FiguraPlana puntos={puntosA} cotas={original.cotas} rotulos={original.rotulos} imagen={false} />
      <FiguraPlana puntos={puntosB} cotas={imagen.cotas} rotulos={imagen.rotulos} imagen />
    </svg>
  );
}

function Anidada({ grande, chica }: DatosSemejanzaAnidada) {
  const escala = escalaAnidada(grande);
  const anchoTotal = grande.horizontal * escala;
  const altoTotal = grande.vertical * escala;
  const x0 = MARGEN + (AREA_ANCHO - anchoTotal) / 2;
  const suelo = MARGEN + (AREA_ALTO - RESERVA_COTA_INFERIOR + altoTotal) / 2;
  const px = (x: number, y: number): Pixel => ({ x: x0 + x * escala, y: suelo - y * escala });

  const pieGrande = px(0, 0);
  const cimaGrande = px(0, grande.vertical);
  const extremo = px(grande.horizontal, 0);
  const pieChica = px(grande.horizontal - chica.horizontal, 0);
  const cimaChica = px(grande.horizontal - chica.horizontal, chica.vertical);
  const marcador = 8;

  const medio = (p: Pixel, q: Pixel): Pixel => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const etiqueta = `Dos triángulos rectángulos semejantes apoyados en el mismo suelo y con el mismo vértice en el extremo: el grande, de altura ${grande.etiquetaVertical} y base ${grande.etiquetaHorizontal}, y el chico, de altura ${chica.etiquetaVertical} y base ${chica.etiquetaHorizontal}. El rayo que va de la cima del grande al extremo pasa por la cima del chico.`;

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      {/* Triángulo grande: contorno continuo, sin relleno. */}
      <polygon
        points={`${pieGrande.x},${pieGrande.y} ${extremo.x},${extremo.y} ${cimaGrande.x},${cimaGrande.y}`}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Triángulo chico: relleno y trazo discontinuo, es la "imagen" reducida. */}
      <polygon
        points={`${pieChica.x},${pieChica.y} ${extremo.x},${extremo.y} ${cimaChica.x},${cimaChica.y}`}
        fill="var(--color-accent-suave)"
        fillOpacity={0.55}
        stroke="var(--color-accent-fuerte)"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinejoin="round"
      />
      {/* Marcadores de ángulo recto en los dos pies. */}
      <path
        d={`M ${pieGrande.x + marcador} ${pieGrande.y} L ${pieGrande.x + marcador} ${pieGrande.y - marcador} L ${pieGrande.x} ${pieGrande.y - marcador}`}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.2"
      />
      <path
        d={`M ${pieChica.x + marcador} ${pieChica.y} L ${pieChica.x + marcador} ${pieChica.y - marcador} L ${pieChica.x} ${pieChica.y - marcador}`}
        fill="none"
        stroke="var(--color-accent-fuerte)"
        strokeWidth="1.2"
      />
      {/* Cotas verticales. */}
      <Cota en={medio(pieGrande, cimaGrande)} dx={-8} dy={0} anclaje="end">
        {grande.etiquetaVertical}
      </Cota>
      <Cota en={medio(pieChica, cimaChica)} dx={-7} dy={0} anclaje="end" destacada>
        {chica.etiquetaVertical}
      </Cota>
      {/* Cota horizontal chica, justo bajo el suelo; la grande con su línea de cota más abajo. */}
      <Cota en={medio(pieChica, extremo)} dx={0} dy={12} anclaje="middle" destacada>
        {chica.etiquetaHorizontal}
      </Cota>
      <path
        d={`M ${pieGrande.x} ${suelo + 22} L ${extremo.x} ${suelo + 22} M ${pieGrande.x} ${suelo + 18} L ${pieGrande.x} ${suelo + 26} M ${extremo.x} ${suelo + 18} L ${extremo.x} ${suelo + 26}`}
        fill="none"
        stroke="var(--color-ink-suave)"
        strokeWidth="1"
      />
      <Cota en={{ x: (pieGrande.x + extremo.x) / 2, y: suelo + 22 }} dx={0} dy={10} anclaje="middle">
        {grande.etiquetaHorizontal}
      </Cota>
    </svg>
  );
}

export function IlustracionSemejanza(datos: DatosSemejanza) {
  if (datos.disposicion === "anidada") return <Anidada {...(datos as DatosSemejanzaAnidada)} />;
  return <LadoALado {...(datos as DatosSemejanzaLadoALado)} />;
}

