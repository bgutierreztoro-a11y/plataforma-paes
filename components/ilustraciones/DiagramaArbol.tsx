import type { DatosDiagramaArbol, RamaArbolDatos } from "@/lib/tipos";
import { LIENZO, Rotulo, TRAZO_ACENTO, TRAZO_INK } from "./graficosComunes";

/**
 * Diagrama de árbol horizontal, raíz a la izquierda, una columna por etapa.
 * Cada rama lleva su probabilidad escrita tal como viene en `datos` (nada se
 * calcula acá: el contrato de lib/probabilidad.ts ya comprobó que las
 * hermanas suman 1 y que la probabilidad del camino es el producto), y cada
 * hoja lleva su resultado y, si viene, la probabilidad del camino a la
 * derecha. Los caminos en `resaltar` van con trazo grueso y acento, y su hoja
 * en negrita: nunca solo el color.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ RESTRICCIÓN DE CONTENIDO, heredada de los gráficos de datos. Solo los    │
 * │ valores rotulados son autoritativos: ningún ítem ni bloque puede pedir   │
 * │ leer una probabilidad de rama o de camino que no esté escrita.           │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

const IZQ = 18;
const COLUMNA = 96;
const ALTO_FILA = 26;
const ARRIBA = 26;
const ABAJO = 8;
/** Ancho estimado de un carácter a 9 px, mismo criterio que la leyenda de graficosComunes. */
const PX_POR_CARACTER = 5.6;

interface Nodo {
  x: number;
  y: number;
  rama: RamaArbolDatos;
  padre: Nodo | null;
  resaltado: boolean;
  esHoja: boolean;
}

/**
 * Ubica cada nodo: las hojas ocupan filas consecutivas en orden de lectura y
 * cada nodo interno se centra entre sus hijos. `resaltado` sube desde las
 * hojas de `resaltar` hasta la raíz por el camino que las produce.
 */
function distribuir(ramas: readonly RamaArbolDatos[], resaltar: ReadonlySet<string>): { nodos: Nodo[]; hojas: number; yRaiz: number } {
  const nodos: Nodo[] = [];
  let fila = 0;
  const colocar = (rama: RamaArbolDatos, etapa: number, padre: Nodo | null): Nodo => {
    const hijos = rama.ramas ?? [];
    const nodo: Nodo = { x: IZQ + COLUMNA * etapa, y: 0, rama, padre, resaltado: false, esHoja: hijos.length === 0 };
    if (nodo.esHoja) {
      nodo.y = ARRIBA + ALTO_FILA * (fila + 0.5);
      fila += 1;
      nodo.resaltado = rama.id !== undefined && resaltar.has(rama.id);
    } else {
      const colocados = hijos.map((h) => colocar(h, etapa + 1, nodo));
      nodo.y = colocados.reduce((s, h) => s + h.y, 0) / colocados.length;
      nodo.resaltado = colocados.some((h) => h.resaltado);
    }
    nodos.push(nodo);
    return nodo;
  };
  const primeras = ramas.map((r) => colocar(r, 1, null));
  const yRaiz = primeras.reduce((s, n) => s + n.y, 0) / primeras.length;
  return { nodos, hojas: fila, yRaiz };
}

function anchoDe(texto: string): number {
  return texto.length * PX_POR_CARACTER + 6;
}

/** Texto con un fondo del color de la tarjeta, para que el trazo que pasa por debajo no lo atraviese. */
function RotuloConFondo({
  x,
  y,
  texto,
  anclaje = "middle",
  tamano = 9,
  fuerte = false,
  suave = false,
  acento = false,
  numero = false,
}: {
  x: number;
  y: number;
  texto: string;
  anclaje?: "start" | "middle" | "end";
  tamano?: number;
  fuerte?: boolean;
  suave?: boolean;
  acento?: boolean;
  numero?: boolean;
}) {
  const ancho = anchoDe(texto);
  const x0 = anclaje === "middle" ? x - ancho / 2 : anclaje === "start" ? x - 3 : x - ancho + 3;
  return (
    <g>
      <rect x={x0} y={y - tamano * 0.62} width={ancho} height={tamano * 1.25} fill="var(--color-card)" />
      <Rotulo x={x} y={y} anclaje={anclaje} tamano={tamano} fuerte={fuerte} suave={suave} acento={acento} numero={numero}>
        {texto}
      </Rotulo>
    </g>
  );
}

function describirCaminos(ramas: readonly RamaArbolDatos[], prefijo: string[] = []): string[] {
  return ramas.flatMap((r) => {
    const paso = `${r.resultado} (${r.probabilidad})`;
    const camino = [...prefijo, paso];
    if (r.ramas && r.ramas.length > 0) return describirCaminos(r.ramas, camino);
    return [`${camino.join(" y luego ")}${r.probabilidadCamino ? `, probabilidad del camino ${r.probabilidadCamino}` : ""}`];
  });
}

export function DiagramaArbol(datos: DatosDiagramaArbol) {
  const { etapas, ramas, raiz } = datos;
  const resaltar = new Set(datos.resaltar ?? []);
  const { nodos, hojas, yRaiz } = distribuir(ramas, resaltar);

  const hojasNodos = nodos.filter((n) => n.esHoja);
  const anchoHoja = Math.max(
    ...hojasNodos.map(
      (n) => anchoDe(n.rama.resultado) / 2 + (n.rama.probabilidadCamino ? 6 + anchoDe(`= ${n.rama.probabilidadCamino}`) : 0),
    ),
  );
  const ancho = Math.max(LIENZO.ancho, IZQ + COLUMNA * etapas.length + anchoHoja + 6);
  const alto = ARRIBA + ALTO_FILA * hojas + ABAJO;

  const caminos = describirCaminos(ramas);
  const etiqueta = `Diagrama de árbol de ${etapas.length} ${etapas.length === 1 ? "etapa" : "etapas"} (${etapas.join(", ")})${raiz ? `, desde ${raiz}` : ""}. Caminos: ${caminos.join("; ")}.${resaltar.size ? ` Caminos resaltados: ${[...resaltar].join(", ")}.` : ""}`;

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      {etapas.map((nombre, k) => (
        <Rotulo key={nombre} x={IZQ + COLUMNA * (k + 1)} y={10} tamano={9} suave>
          {nombre}
        </Rotulo>
      ))}

      {/* Ramas primero, rótulos encima. */}
      {nodos.map((n, i) => {
        const desde = n.padre ?? { x: IZQ, y: yRaiz };
        return (
          <line
            key={`r${i}`}
            x1={desde.x}
            y1={desde.y}
            x2={n.x}
            y2={n.y}
            stroke={n.resaltado ? TRAZO_ACENTO : TRAZO_INK}
            strokeWidth={n.resaltado ? 2.5 : 1.2}
            strokeLinecap="round"
          />
        );
      })}

      <circle cx={IZQ} cy={yRaiz} r={3} fill={TRAZO_INK} />
      {raiz && (
        <Rotulo x={IZQ} y={yRaiz - 11} tamano={9} suave>
          {raiz}
        </Rotulo>
      )}

      {/* Probabilidades de las ramas: sobre la línea si la rama sube o va
          recta, bajo la línea si baja, o sea siempre alejándose del padre, para
          que las de dos hermanas no se junten en el medio. Todas antes que los
          rótulos de los nodos, que van encima. */}
      {nodos.map((n, i) => {
        const desde = n.padre ?? { x: IZQ, y: yRaiz };
        const xm = (desde.x + n.x) / 2;
        const ym = (desde.y + n.y) / 2;
        const yProb = ym + (n.y > desde.y ? 8 : -8);
        return (
          <RotuloConFondo key={`p${i}`} x={xm} y={yProb} texto={n.rama.probabilidad} tamano={9} numero acento={n.resaltado} fuerte={n.resaltado} />
        );
      })}

      {nodos.map((n, i) => (
        <g key={`n${i}`}>
          <RotuloConFondo x={n.x} y={n.y} texto={n.rama.resultado} tamano={10} fuerte={n.resaltado} acento={n.resaltado} />
          {n.esHoja && n.rama.probabilidadCamino && (
            <Rotulo
              x={n.x + anchoDe(n.rama.resultado) / 2 + 4}
              y={n.y}
              anclaje="start"
              tamano={9}
              numero
              fuerte={n.resaltado}
              acento={n.resaltado}
              suave={!n.resaltado}
            >
              {`= ${n.rama.probabilidadCamino}`}
            </Rotulo>
          )}
        </g>
      ))}
    </svg>
  );
}
