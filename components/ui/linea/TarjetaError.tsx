interface TarjetaErrorProps {
  /* La clave del catálogo de errores, en mayúsculas y con tracking abierto:
     es una referencia, no una frase. */
  clave: string;
  /* Qué se hizo mal, en una línea. */
  diagnostico: string;
  /* Por qué pasa y cómo se ve la próxima vez. */
  detalle: string;
  className?: string;
}

/**
 * El error, escrito en negativo.
 *
 * Es la única superficie oscura del sistema y esa excepción es lo que la separa
 * del resto de la pantalla: un error catalogado no es un aviso más, es una pieza
 * de información que el estudiante va a volver a ver.
 *
 * La clave va en el color del eje **aclarado** (`--linea-clara`), no en el color
 * de línea: los cuatro colores de línea están calibrados contra papel, y sobre
 * la tinta oscura el rojo y el azul se apagan. Solo la línea 03 tiene su
 * aclarado definido hoy; las otras tres caen a `--text-inverse` (ver
 * ./colores.ts).
 */
export function TarjetaError({
  clave,
  diagnostico,
  detalle,
  className = "",
}: TarjetaErrorProps) {
  return (
    <div className={`rounded-sm bg-primary p-4 ${className}`.trim()}>
      <p className="text-etiqueta uppercase text-[var(--linea-clara)]">{clave}</p>
      <p className="mt-2 text-titulo-s text-inverse">{diagnostico}</p>
      <p className="mt-1.5 text-cuerpo-s text-muted-inverse">{detalle}</p>
    </div>
  );
}
