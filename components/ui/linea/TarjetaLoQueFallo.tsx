import type { GrupoDeError } from "@/lib/erroresDelCierre";

interface TarjetaLoQueFalloProps {
  grupos: GrupoDeError[];
  className?: string;
}

/**
 * Los errores de esta corrida, agrupados por mecanismo y no por pregunta.
 *
 * Es lo que separa "fallaste 2" de "fallaste dos veces lo mismo": dos ítems bajo
 * el mismo id son un patrón, y ese es el dato que sirve para estudiar.
 *
 * Superficie clara y chip en tinta, a diferencia de `TarjetaError.tsx`, que
 * pinta **un** error sobre la única superficie oscura del sistema con la clave en
 * `--linea-clara`. Acá hay una lista de varios grupos: apilar tarjetas oscuras
 * convertiría el resumen en un muro negro, y el chip en tinta mantiene la
 * jerarquía sin gastar la excepción de la superficie oscura.
 *
 * Habla solo de esta corrida. No dice cuántas veces pasó antes, porque el estado
 * de sesión del que sale (`lib/estadoSetItems.ts`) arranca vacío en cada intento
 * y no hay de dónde sacar esa cuenta sin persistencia.
 *
 * Devuelve `null` sin grupos: pasa de verdad, y no solo en una corrida perfecta.
 * `cierre-v0` —el cierre de `funcion-lineal-y-afin`, al que redirige `/cierre`—
 * no etiqueta ni un distractor, así que ahí no hay nada que agrupar y una caja
 * vacía con título prometería un análisis que no existe.
 */
export function TarjetaLoQueFallo({ grupos, className = "" }: TarjetaLoQueFalloProps) {
  if (grupos.length === 0) return null;

  return (
    <section className={`rounded-sm border border-hairline bg-card p-5 ${className}`.trim()}>
      <h2 className="text-titulo-m text-primary">Lo que falló</h2>

      <ul className="mt-4 flex flex-col gap-4">
        {grupos.map((grupo) => (
          <li key={grupo.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-primary px-2 py-0.5 text-etiqueta uppercase text-inverse">
                {grupo.id}
              </span>
              <span className="text-cuerpo-s text-secondary">
                {grupo.numerosDeItem.length === 1 ? "Pregunta" : "Preguntas"}{" "}
                <span className="num">{grupo.numerosDeItem.join(", ")}</span>
              </span>
            </div>

            {/* Sin descripción se muestran el chip y los números y nada más. El
                id es real —viene del contenido—; el texto falta porque el
                archivo del cierre no trae `catalogoErrores` propio (5 de 11 hoy,
                ver docs/deuda-catalogo-errores-crossfile.md). Inventar una
                glosa acá sería escribir contenido pedagógico desde la vista. */}
            {grupo.descripcion && (
              <p className="mt-1.5 text-cuerpo-m text-secondary">{grupo.descripcion}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
