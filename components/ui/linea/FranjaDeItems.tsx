export type ResultadoDeItem = "correcto" | "incorrecto" | "pendiente";

interface FranjaDeItemsProps {
  /* Un elemento por ítem, en el orden en que se rindieron. */
  resultados: ResultadoDeItem[];
  className?: string;
}

/**
 * El resultado ítem por ítem, en una sola línea.
 *
 * Sin semáforo verde/rojo, por la misma regla que `Alternativa.tsx`: lo que
 * salió bien se pinta con el color del eje y lo que salió mal se hunde y se
 * bordea en tinta. La señal del fallo es **la forma**, no el color — borde de
 * 1,5px sobre superficie hundida da 15,14:1 y se distingue igual en las cuatro
 * líneas, incluida la 02, cuyo amarillo mide 1,76:1 contra la tarjeta y como
 * relleno no llegaría a marcar nada por sí solo.
 *
 * Cada barra es un `<li>` con su texto para lector de pantalla: la franja
 * completa como una sola imagen obligaría a leer ocho veredictos en una frase.
 *
 * **`pendiente` se pinta igual que `incorrecto`, y es a propósito.** La casilla
 * hueca es el estado en que nace la franja: así se ve entera en el anuncio
 * previo, antes de responder nada, y así se queda la que se falló. Lo que se
 * llena es el acierto. Las dos pantallas no conviven —el anuncio es todo
 * `pendiente` y el resultado no tiene ninguno—, así que dentro de una misma
 * franja el hueco nunca es ambiguo. Para el lector de pantalla sí se distinguen,
 * que es donde la distinción importa.
 */
const TEXTO: Record<ResultadoDeItem, string> = {
  correcto: "correcta",
  incorrecto: "incorrecta",
  pendiente: "sin responder",
};

export function FranjaDeItems({ resultados, className = "" }: FranjaDeItemsProps) {
  return (
    <ol className={`flex gap-[5px] ${className}`.trim()}>
      {resultados.map((resultado, i) => (
        <li
          key={i}
          className={`h-7 flex-1 rounded-sm ${
            resultado === "correcto"
              ? "bg-[var(--linea)]"
              : "border-[1.5px] border-strong bg-sunken"
          }`}
        >
          <span className="sr-only">
            Pregunta {i + 1}: {TEXTO[resultado]}
          </span>
        </li>
      ))}
    </ol>
  );
}
