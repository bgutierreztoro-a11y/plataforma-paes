import type { DatosCuadriculaEspacioMuestral } from "@/lib/tipos";
import { CUADRICULA, LIENZO, Rotulo, TRAMA_DIAGONAL, TRAZO_ACENTO, TRAZO_INK, Tramas } from "./graficosComunes";

/**
 * Cuadrícula del espacio muestral de dos experimentos: una fila por resultado
 * del primero, una columna por resultado del segundo, y en cada celda el par
 * (o el texto que el contenido declare, por ejemplo la suma). Las celdas del
 * evento van con trama diagonal y trazo de acento, nunca solo color, y el
 * contador "marcadas de total" se escribe abajo desde `datos`: el componente
 * no cuenta nada, el contrato de lib/probabilidad.ts ya comprobó que coincide.
 *
 * Misma restricción de contenido que el árbol: lo que se lee es lo que está
 * escrito (los ejes, el texto de las celdas y el contador).
 */

/** Ancho estimado de un carácter a 9 px, mismo criterio que la leyenda de graficosComunes. */
const PX_POR_CARACTER = 5.6;
const ARRIBA = 32;
const DER = 8;
const CELDA_MAX = 42;
const ZONA_CONTADOR = 24;

function textoDeCelda(datos: DatosCuadriculaEspacioMuestral, i: number, j: number): string {
  if (datos.celdas) return datos.celdas[i][j];
  const a = datos.filas[i];
  const b = datos.columnas[j];
  return a.length <= 2 && b.length <= 2 ? `(${a}, ${b})` : "";
}

export function CuadriculaEspacioMuestral(datos: DatosCuadriculaEspacioMuestral) {
  const { filas, columnas, rotuloFilas, rotuloColumnas, contador, rotuloEvento } = datos;
  const marcadas = datos.marcadas ?? [];
  const marcadasSet = new Set(marcadas.map(([f, c]) => `${f},${c}`));
  // El margen izquierdo se ajusta al rótulo de fila más largo (y al título del eje, si lo hay).
  const anchoRotulosFila = Math.max(...filas.map((f) => f.length)) * PX_POR_CARACTER + 10;
  const x0 = (rotuloFilas ? 16 : 4) + anchoRotulosFila;
  const celda = Math.min(CELDA_MAX, (LIENZO.ancho - x0 - DER) / columnas.length);
  const anchoRejilla = celda * columnas.length;
  const altoRejilla = celda * filas.length;
  const y0 = ARRIBA;
  const hayLeyenda = contador !== undefined || (marcadas.length > 0 && rotuloEvento !== undefined);
  const alto = y0 + altoRejilla + (hayLeyenda ? ZONA_CONTADOR : 8);

  const lecturaMarcadas = marcadas.length
    ? ` Celdas marcadas${rotuloEvento ? ` (${rotuloEvento})` : ""}: ${marcadas.map(([f, c]) => `(${filas[f]}, ${columnas[c]})`).join(", ")}.`
    : "";
  const lecturaContador = contador ? ` ${contador.marcadas} de ${contador.total}.` : "";
  const etiqueta = `Cuadrícula de ${filas.length} por ${columnas.length} pares. Filas${rotuloFilas ? ` (${rotuloFilas})` : ""}: ${filas.join(", ")}. Columnas${rotuloColumnas ? ` (${rotuloColumnas})` : ""}: ${columnas.join(", ")}.${lecturaMarcadas}${lecturaContador}`;

  return (
    <svg viewBox={`0 0 ${LIENZO.ancho} ${alto}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      <Tramas />
      {rotuloColumnas && (
        <Rotulo x={x0 + anchoRejilla / 2} y={9} tamano={9} suave>
          {rotuloColumnas}
        </Rotulo>
      )}
      {rotuloFilas && (
        <g transform={`rotate(-90 9 ${y0 + altoRejilla / 2})`}>
          <Rotulo x={9} y={y0 + altoRejilla / 2} tamano={9} suave>
            {rotuloFilas}
          </Rotulo>
        </g>
      )}
      {columnas.map((c, j) => (
        <Rotulo key={`c${j}`} x={x0 + celda * (j + 0.5)} y={y0 - 9} tamano={9} fuerte>
          {c}
        </Rotulo>
      ))}
      {filas.map((f, i) => (
        <Rotulo key={`f${i}`} x={x0 - 5} y={y0 + celda * (i + 0.5)} anclaje="end" tamano={9} fuerte>
          {f}
        </Rotulo>
      ))}

      {filas.map((_, i) =>
        columnas.map((__, j) => {
          const marcada = marcadasSet.has(`${i},${j}`);
          const texto = textoDeCelda(datos, i, j);
          return (
            <g key={`${i}-${j}`}>
              <rect
                x={x0 + celda * j}
                y={y0 + celda * i}
                width={celda}
                height={celda}
                fill={marcada ? `url(#${TRAMA_DIAGONAL})` : "var(--color-card)"}
                stroke={CUADRICULA}
                strokeWidth="1"
              />
              {marcada && (
                <rect
                  x={x0 + celda * j + 1}
                  y={y0 + celda * i + 1}
                  width={celda - 2}
                  height={celda - 2}
                  fill="none"
                  stroke={TRAZO_ACENTO}
                  strokeWidth="1.5"
                />
              )}
              {texto && (
                <Rotulo x={x0 + celda * (j + 0.5)} y={y0 + celda * (i + 0.5)} tamano={8} numero fuerte={marcada} halo={marcada}>
                  {texto}
                </Rotulo>
              )}
            </g>
          );
        }),
      )}
      <rect x={x0} y={y0} width={anchoRejilla} height={altoRejilla} fill="none" stroke={TRAZO_INK} strokeWidth="1.2" />

      {hayLeyenda && (
        <g>
          <rect x={x0} y={alto - 15} width="11" height="10" fill={`url(#${TRAMA_DIAGONAL})`} stroke={TRAZO_ACENTO} strokeWidth="1.2" />
          <Rotulo x={x0 + 15} y={alto - 10} anclaje="start" tamano={9}>
            {`${rotuloEvento ?? "Marcadas"}${contador ? `: ${contador.marcadas} de ${contador.total}` : ""}`}
          </Rotulo>
        </g>
      )}
    </svg>
  );
}
