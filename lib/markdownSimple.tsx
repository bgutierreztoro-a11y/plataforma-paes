import type { ReactNode } from "react";

/**
 * Subconjunto mínimo de Markdown usado por el contenido (párrafos, negrita,
 * listas con "- ", tablas con "|"), a mano y sin dependencias — el schema
 * documenta explícitamente que "puede incluir tablas simples inline".
 */
function conNegrita(linea: string): ReactNode[] {
  const partes = linea.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
  return partes.map((parte, i) => {
    const match = /^\*\*([^*]+)\*\*$/.exec(parte);
    return match ? <strong key={i}>{match[1]}</strong> : <span key={i}>{parte}</span>;
  });
}

function renderTabla(lineas: string[], key: number): ReactNode {
  const filas = lineas
    .filter((l) => !/^\|[\s-:|]+\|$/.test(l.trim()))
    .map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim()),
    );
  const [encabezado, ...cuerpo] = filas;
  return (
    <div key={key} className="overflow-x-auto">
      <table className="my-2 w-full border-collapse text-sm">
        <thead>
          <tr>
            {encabezado.map((c, i) => (
              <th key={i} className="border-b border-border px-3 py-1.5 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cuerpo.map((fila, i) => (
            <tr key={i}>
              {fila.map((c, j) => (
                <td key={j} className="border-b border-border px-3 py-1.5 font-mono tabular-nums">
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

export function TextoEnriquecido({ contenido }: { contenido: string }) {
  const bloques = contenido.split(/\n\n+/);
  return (
    <>
      {bloques.map((bloque, i) => {
        const lineas = bloque.split("\n").filter((l) => l.trim() !== "");
        if (lineas.length > 0 && lineas.every((l) => l.trim().startsWith("|"))) {
          return renderTabla(lineas, i);
        }
        if (lineas.length > 0 && lineas.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5">
              {lineas.map((l, j) => (
                <li key={j}>{conNegrita(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-2 leading-relaxed">
            {lineas.map((l, j) => (
              <span key={j}>
                {conNegrita(l)}
                {j < lineas.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
