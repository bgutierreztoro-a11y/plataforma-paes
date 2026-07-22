import type { BloqueVisualizacion as BloqueVisualizacionTipo } from "@/lib/tipos";

interface DatosTabla {
  columnas: string[];
  filas: (string | number)[][];
}

function esDatosTabla(datos: unknown): datos is DatosTabla {
  return (
    typeof datos === "object" &&
    datos !== null &&
    Array.isArray((datos as DatosTabla).columnas) &&
    Array.isArray((datos as DatosTabla).filas)
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
