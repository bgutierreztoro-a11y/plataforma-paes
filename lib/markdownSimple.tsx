import type { ReactNode } from "react";
import { marcaDelBloque, type MarcaDeBloque } from "./trazoDestacado";

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
/**
 * Número puro: solo dígitos, con signo y decimales opcionales. Se usa para
 * decidir si una celda va en monoespaciada. "x < 5" o "5 kg" no califican —
 * llevan texto, y el texto se lee mejor en la tipografía base.
 */
export function esNumeroPuro(valor: string | number): boolean {
  if (typeof valor === "number") return true;
  return /^[-−+]?\d+([.,]\d+)?$/.test(valor.trim());
}

export function conEnfasis(linea: string, marca?: MarcaDeBloque): ReactNode[] {
  // La negrita va primero en la alternancia: si no, "**x**" se partiría como
  // cursiva y dejaría asteriscos sueltos en pantalla.
  const partes = linea.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter((p) => p !== "");
  return partes.map((parte, i) => {
    const negrita = /^\*\*([^*]+)\*\*$/.exec(parte);
    if (negrita) {
      // El trazo se gasta en la primera negrita que coincide con el término
      // elegido para el bloque; las demás siguen siendo negrita pelada.
      const esLaMarca = marca !== undefined && !marca.usado && negrita[1].trim() === marca.termino;
      if (esLaMarca) marca.usado = true;
      return (
        <strong key={i} className={esLaMarca ? "trazo-destacado" : undefined}>
          {conEnfasis(negrita[1], marca)}
        </strong>
      );
    }
    const cursiva = /^\*([^*]+)\*$/.exec(parte);
    if (cursiva) return <em key={i}>{conEnfasis(cursiva[1], marca)}</em>;
    // Símbolos y expresiones sueltas: en mono, como el resto de la notación.
    // No recurre: dentro de código las marcas son texto literal.
    const codigo = /^`([^`]+)`$/.exec(parte);
    if (codigo)
      return (
        <code
          key={i}
          className="rounded-control bg-accent-suave px-1.5 py-0.5 font-mono text-[0.95em]"
        >
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
    <div key={key} className="my-4 overflow-x-auto rounded-panel border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {encabezado.map((c, i) => (
              <th
                key={i}
                className="border-b border-border bg-accent-suave px-3.5 py-2.5 text-left align-top font-medium text-ink"
              >
                {conEnfasis(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cuerpo.map((fila, i) => (
            <tr key={i}>
              {fila.map((c, j) => (
                <td
                  key={j}
                  className={`border-b border-border px-3.5 py-2.5 align-top leading-relaxed ${
                    esNumeroPuro(c) ? "font-mono tabular-nums" : ""
                  }`}
                >
                  {conEnfasis(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * `corpus` es el texto completo de la lección, y solo sirve para el criterio de
 * repetición del trazo de destacador (ver `marcaDelBloque`). Es opcional: sin
 * él el texto se renderiza igual que antes de la Fase D, con toda la negrita
 * como negrita. Lo pasa `PasoLeccion`, que es quien tiene la lección entera.
 */
export function TextoEnriquecido({
  contenido,
  corpus,
}: {
  contenido: string;
  corpus?: string;
}) {
  const bloques = contenido.split(/\n\n+/);
  return (
    <>
      {bloques.map((bloque, i) => {
        const lineas = bloque.split("\n").filter((l) => l.trim() !== "");
        if (lineas.length > 0 && lineas.every((l) => l.trim().startsWith("|"))) {
          return renderTabla(lineas, i);
        }
        // Una marca por bloque, compartida por todas sus líneas: el objeto se
        // crea acá y `conEnfasis` la marca como usada en cuanto la gasta.
        const termino = marcaDelBloque(bloque, corpus);
        const marca: MarcaDeBloque | undefined = termino
          ? { termino, usado: false }
          : undefined;
        if (lineas.length > 0 && lineas.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="my-3 list-disc space-y-1.5 pl-5 leading-relaxed">
              {lineas.map((l, j) => (
                <li key={j}>{conEnfasis(l.trim().slice(2), marca)}</li>
              ))}
            </ul>
          );
        }
        // Cita: la idea clave del paso. Se destaca con filete de acento en vez
        // de más negrita, que a esta altura del texto ya no jerarquiza nada.
        // Y por lo mismo tampoco lleva trazo: el bloque entero ya es el
        // destaque, y marcar una palabra adentro duplicaría el gesto sobre la
        // misma frase. Por eso esta rama no pasa `marca`.
        if (lineas.length > 0 && lineas.every((l) => l.trim().startsWith(">"))) {
          return (
            <blockquote
              key={i}
              className="my-5 rounded-r-panel border-l-4 border-accent bg-accent-suave/60 py-3 pl-4 pr-4 leading-relaxed text-ink"
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
                {conEnfasis(l, marca)}
                {j < lineas.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
