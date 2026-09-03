import { Boton } from "@/components/ui/linea/Boton";
import type { ErrorVivo } from "@/lib/erroresVivos";

interface ListaErroresVivosProps {
  filas: ErrorVivo[];
}

/* Copia literal del subtítulo de la pantalla 10 del HTML de referencia. La
   segunda frase —la regla de extinción— es copy, no lógica: nada la implementa
   todavía (`docs/deuda-errores-vivos.md`). */
const SUBTITULO =
  "No son preguntas falladas: son las confusiones detrás. Se apagan al resolverlas bien dos veces seguidas.";

/**
 * La pantalla 10 ("Errores"), presentacional: recibe las filas ya agregadas y
 * ordenadas por `erroresVivosDeSesion`. El island `ErroresVivos` la envuelve
 * con la lectura del estado de sesión; `/_design` la monta directo con fixtures.
 *
 * Cada fila es solo título + "N veces". El chip con el id del error y el
 * fragmento "· línea 0N" del HTML de referencia se omiten a propósito: el conteo
 * de sesión no guarda ni el id (local al archivo) ni el eje. Ver
 * `docs/deuda-errores-vivos.md`.
 *
 * Sin filas, el estado vacío honesto reemplaza el titular por completo y no
 * renderiza ni la lista ni el CTA: una caja de "0 errores vivos" con botón
 * prometería un análisis que no existe.
 */
export function ListaErroresVivos({ filas }: ListaErroresVivosProps) {
  return (
    <section className="flex flex-1 flex-col">
      <p className="text-etiqueta uppercase text-secondary">Repaso dirigido</p>

      {filas.length === 0 ? (
        <>
          <h1 className="mt-1.5 text-display-m text-primary">Sin errores en esta sesión</h1>
          <p className="mt-3 max-w-prose text-cuerpo-m text-secondary">
            Acá aparecen las confusiones detrás de las preguntas que fallas
            —cuando el material las tiene catalogadas— con las veces que caíste en
            cada una. La lista es de esta sesión: al recargar, parte de cero.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-1.5 text-display-m text-primary">
            {filas.length === 1 ? "1 error vivo" : `${filas.length} errores vivos`}
          </h1>
          <p className="mt-3 max-w-prose text-cuerpo-s text-secondary">{SUBTITULO}</p>

          <ul className="mt-4 divide-y divide-hairline">
            {filas.map((fila) => (
              <li key={fila.titulo} className="py-3">
                <p className="text-cuerpo-m text-primary">{fila.titulo}</p>
                <p className="mt-1 text-cuerpo-s text-secondary">
                  <span className="num">{fila.veces}</span>{" "}
                  {fila.veces === 1 ? "vez" : "veces"}
                </p>
              </li>
            ))}
          </ul>

          {/* Deshabilitado: no hay ruta de repaso dirigido todavía
              (`docs/deuda-errores-vivos.md`). */}
          <div className="mt-auto pt-6">
            <Boton variante="deshabilitado">Repasar</Boton>
          </div>
        </>
      )}
    </section>
  );
}
