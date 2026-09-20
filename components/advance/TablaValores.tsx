import type { FiguraTablaValores } from "@/lib/advance/descarte";

/**
 * Tabla de valores para la figura `tabla-valores` de un ítem Advance
 * (item-advance.schema.json, figuraTablaValores). Es una <table> real con
 * encabezados de columna y de fila: la tabla ES su propio texto alternativo,
 * no una imagen de una tabla. `descripcion` va como <caption> solo para
 * lector de pantalla, porque el enunciado ya dice de qué es la tabla.
 *
 * Números con tabular-nums, formato es-CL y signo menos Unicode. A 390 px la
 * tabla entra completa o scrollea dentro de su propio contenedor; nunca
 * empuja el ancho de la página.
 */

const num = (v: number) => v.toLocaleString("es-CL", { maximumFractionDigits: 3 }).replace(/^-/, "−");

const celda = (c: string | number) => (typeof c === "number" ? num(c) : c);

const CELDA = "border border-hairline px-3 py-1.5 text-center text-cuerpo-s num";

export function TablaValores({ figura }: { figura: FiguraTablaValores }) {
  const { encabezados, filas, descripcion } = figura;
  return (
    <div className="max-w-full overflow-x-auto" data-tabla-valores>
      <table className="mx-auto border-collapse text-primary">
        <caption className="sr-only">{descripcion}</caption>
        <thead>
          <tr>
            {encabezados.map((h, j) => (
              <th key={j} scope="col" className={`${CELDA} bg-sunken font-semibold`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className={`${CELDA} font-semibold`}>
                    {celda(c)}
                  </th>
                ) : (
                  <td key={j} className={CELDA}>
                    {celda(c)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
