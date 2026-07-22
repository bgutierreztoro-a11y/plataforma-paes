import type { BloqueVisualizacion as BloqueVisualizacionTipo } from "@/lib/tipos";

interface DatosTabla {
  columnas: string[];
  filas: (string | number)[][];
}

/* Diagrama por etapas: cada paso es un estado con dos lados y la acción que
   lleva de uno al siguiente. Se usa para la secuencia de balanzas de la
   Lección 3, pero no menciona balanzas: sirve para cualquier proceso de dos
   lados que se transforma paso a paso. */
interface PasoDiagrama {
  izquierda: string;
  derecha: string;
  accion?: string;
}

interface DatosPasos {
  pasos: PasoDiagrama[];
}

function esDatosTabla(datos: unknown): datos is DatosTabla {
  return (
    typeof datos === "object" &&
    datos !== null &&
    Array.isArray((datos as DatosTabla).columnas) &&
    Array.isArray((datos as DatosTabla).filas)
  );
}

function esDatosPasos(datos: unknown): datos is DatosPasos {
  const pasos = (datos as DatosPasos | null)?.pasos;
  return (
    Array.isArray(pasos) &&
    pasos.length > 0 &&
    pasos.every((p) => typeof p?.izquierda === "string" && typeof p?.derecha === "string")
  );
}

export function BloqueVisualizacion({ bloque }: { bloque: BloqueVisualizacionTipo }) {
  if (bloque.variante === "tabla" && esDatosTabla(bloque.datos)) {
    const { columnas, filas } = bloque.datos;
    return (
      <div className="overflow-x-auto rounded-tarjeta border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columnas.map((c, i) => (
                <th key={i} className="border-b border-border bg-accent-suave px-3 py-2 text-left font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i}>
                {fila.map((c, j) => (
                  <td key={j} className="border-b border-border px-3 py-2 font-mono tabular-nums">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (bloque.variante === "diagrama" && esDatosPasos(bloque.datos)) {
    return (
      <figure className="space-y-3">
        <figcaption className="solo-lector">{bloque.descripcion}</figcaption>
        {bloque.datos.pasos.map((paso, i) => (
          <div key={i} className="space-y-2">
            {i > 0 && paso.accion && (
              <p className="px-1 text-center text-sm text-ink-suave">↓ {paso.accion}</p>
            )}
            <div className="flex items-stretch gap-2 rounded-tarjeta border border-border bg-surface p-3">
              <p className="flex flex-1 items-center justify-center rounded-tarjeta bg-accent-suave px-3 py-3 text-center text-sm text-ink">
                {paso.izquierda}
              </p>
              <span
                aria-hidden="true"
                className="flex items-center px-1 font-mono text-xl text-ink-suave"
              >
                =
              </span>
              <p className="flex flex-1 items-center justify-center rounded-tarjeta bg-accent-suave px-3 py-3 text-center text-sm text-ink">
                {paso.derecha}
              </p>
            </div>
            {i === 0 && paso.accion && (
              <p className="px-1 text-center text-sm text-ink-suave">{paso.accion}</p>
            )}
          </div>
        ))}
      </figure>
    );
  }

  // Sin datos de tabla, la descripción ES el contenido que lee el estudiante
  // (y el texto alternativo de la figura). Se presenta como figura descrita,
  // no como recuadro punteado de "falta algo".
  return (
    <figure className="rounded-tarjeta border border-border bg-surface p-4">
      <figcaption className="mb-1.5 text-sm font-medium text-ink-tenue">Figura</figcaption>
      <p className="text-sm leading-relaxed text-ink-suave">{bloque.descripcion}</p>
    </figure>
  );
}
