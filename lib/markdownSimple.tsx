import type { ReactNode } from "react";

/**
 * Subconjunto mínimo de Markdown usado por el contenido (párrafos, negrita,
 * cursiva, citas con "> ", listas con "- ", tablas con "|"), a mano y sin
 * dependencias — el schema documenta explícitamente que "puede incluir tablas
 * simples inline".
 */
/**
 * Marcas en línea: negrita, cursiva y código. Es recursivo porque las marcas
 * se anidan en el contenido real (p. ej. una negrita que contiene `=`); sin
 * recursión, los delimitadores interiores se imprimirían literales. Termina
 * siempre: cada nivel entrega al siguiente el texto ya sin sus delimitadores.
 */
function conEnfasis(linea: string): ReactNode[] {
  // La negrita va primero en la alternancia: si no, "**x**" se partiría como
  // cursiva y dejaría asteriscos sueltos en pantalla.
  const partes = linea.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter((p) => p !== "");
  return partes.map((parte, i) => {
    const negrita = /^\*\*([^*]+)\*\*$/.exec(parte);
    if (negrita) return <strong key={i}>{conEnfasis(negrita[1])}</strong>;
    const cursiva = /^\*([^*]+)\*$/.exec(parte);
    if (cursiva) return <em key={i}>{conEnfasis(cursiva[1])}</em>;
    // Símbolos y expresiones sueltas: en mono, como el resto de la notación.
    // No recurre: dentro de código las marcas son texto literal.
    const codigo = /^`([^`]+)`$/.exec(parte);
    if (codigo)
      return (
        <code key={i} className="rounded bg-accent-suave px-1 py-0.5 font-mono text-[0.95em]">
          {codigo[1]}
        </code>
      );
    return <span key={i}>{parte}</span>;
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
            <ul key={i} className="my-3 list-disc space-y-1.5 pl-5 leading-relaxed">
              {lineas.map((l, j) => (
                <li key={j}>{conEnfasis(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        // Cita: la idea clave del paso. Se destaca con filete de acento en vez
        // de más negrita, que a esta altura del texto ya no jerarquiza nada.
        if (lineas.length > 0 && lineas.every((l) => l.trim().startsWith(">"))) {
          return (
            <blockquote
              key={i}
              className="my-4 rounded-r-tarjeta border-l-4 border-accent bg-accent-suave/60 py-3 pl-4 pr-4 leading-relaxed text-ink"
            >
              {lineas.map((l, j) => (
                <span key={j} className="block">
                  {conEnfasis(l.trim().replace(/^>\s?/, ""))}
                </span>
              ))}
            </blockquote>
          );
        }
        return (
          <p key={i} className="my-3 leading-relaxed">
            {lineas.map((l, j) => (
              <span key={j}>
                {conEnfasis(l)}
                {j < lineas.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
