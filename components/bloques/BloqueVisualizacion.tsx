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

  return (
    <div className="rounded-tarjeta border border-dashed border-border p-4 text-sm text-ink-suave">
      {bloque.descripcion}
    </div>
  );
}
