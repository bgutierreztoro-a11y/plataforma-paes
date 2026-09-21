import type { FiguraTablaDatos } from "@/lib/advance/descarte";
import { captionTablaDatos, num } from "@/lib/advance/figurasDatos";

/**
 * Tabla de datos para la figura `tabla-datos` de un ítem Advance
 * (item-advance.schema.json, figuraTablaDatos): frecuencias, doble entrada,
 * intervalos como texto. Es una <table> real: la tabla es su propio texto
 * alternativo. La primera columna es encabezado de fila (doble entrada);
 * `filaTotal` va en <tfoot>. Una celda "?" es la incógnita del ítem y se
 * muestra tal cual, marcada con data-incognita para la galería y los tests.
 *
 * Mismo trazo que TablaValores: números con tabular-nums, formato es-CL y
 * signo menos Unicode; a 380 px entra o scrollea dentro de su contenedor.
 */

const celda = (c: string | number) => (typeof c === "number" ? num(c) : c);

const CELDA = "border border-hairline px-3 py-1.5 text-center text-cuerpo-s num";

function Celdas({ fila, encabezadoDeFila }: { fila: (string | number)[]; encabezadoDeFila: boolean }) {
  return fila.map((c, j) =>
    j === 0 && encabezadoDeFila ? (
      <th key={j} scope="row" className={`${CELDA} font-semibold`} data-incognita={c === "?" ? "" : undefined}>
        {celda(c)}
      </th>
    ) : (
      <td key={j} className={CELDA} data-incognita={c === "?" ? "" : undefined}>
        {celda(c)}
      </td>
    ),
  );
}

export function TablaDatos({ figura }: { figura: FiguraTablaDatos }) {
  const { columnas, filas, filaTotal, titulo } = figura;
  return (
    <div className="max-w-full overflow-x-auto" data-tabla-datos>
      <table className="mx-auto border-collapse text-primary">
        <caption className={titulo ? "pb-2 text-cuerpo-s font-semibold" : "sr-only"}>{captionTablaDatos(figura)}</caption>
        <thead>
          <tr>
            {columnas.map((h, j) => (
              <th key={j} scope="col" className={`${CELDA} bg-sunken font-semibold`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              <Celdas fila={fila} encabezadoDeFila />
            </tr>
          ))}
        </tbody>
        {filaTotal && (
          <tfoot>
            <tr className="font-semibold">
              <Celdas fila={filaTotal} encabezadoDeFila />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
