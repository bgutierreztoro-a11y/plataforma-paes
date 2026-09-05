interface BarraProgresoProps {
  valor: number;
  total: number;
  /* Nombre accesible. Sin él la barra queda como decoración y el avance tiene
     que estar dicho en texto al lado. */
  etiqueta?: string;
  className?: string;
}

/**
 * El avance dentro de una línea: 6px de alto, pista hundida, relleno del color
 * del eje, extremos redondos.
 *
 * Es una barra continua y no la segmentada del sistema anterior. La segmentada
 * respondía "¿en cuál paso voy?"; ésta responde "¿cuánto llevo de la línea?",
 * que es una pregunta de recorrido y no de posición — la posición la marcan las
 * estaciones.
 *
 * `valor` se recorta al rango: un progreso fuera de rango es un bug de quien
 * llama, y dibujar un relleno que se sale de la pista solo lo esconde.
 *
 * **El avance se desliza (Fase A).** `--dur-avance` (400ms) y `ease-out`: la
 * curva se declara y no se hereda, porque el default de `transition-*` de
 * Tailwind es `cubic-bezier(.4,0,.2,1)` —arranca lento y frena— y eso hace que
 * el tramo nuevo parezca dudar antes de salir. `ease-out` sale de inmediato y
 * frena al llegar, que es la lectura correcta: el paso ya se dio.
 */
export function BarraProgreso({
  valor,
  total,
  etiqueta,
  className = "",
}: BarraProgresoProps) {
  const seguro = Math.min(Math.max(valor, 0), total);
  const porcentaje = total > 0 ? (seguro / total) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={seguro}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={etiqueta}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-sunken ${className}`.trim()}
    >
      <div
        className="h-full rounded-full bg-[var(--linea)] motion-safe:transition-[width] motion-safe:duration-[var(--dur-avance)] motion-safe:ease-out motion-reduce:transition-none"
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}
