interface TarjetaErrorProps {
  /* La clave del catálogo de errores, en mayúsculas y con tracking abierto:
     es una referencia, no una frase. */
  clave: string;
  /* Qué se hizo mal, en una línea. */
  diagnostico: string;
  /* Por qué pasa y cómo se ve la próxima vez.
     **Opcional, y hoy nadie se lo pasa desde el flujo real.** El desarrollo
     numérico que corrige el error no existe como campo de contenido: el schema
     define `catalogoErrores` como `{id, descripcion}` y cerrado. Ver
     `docs/deuda-banner-error-desarrollo.md`. La tarjeta sale con dos párrafos
     mientras tanto, que es una unidad completa por sí sola — no un hueco. */
  detalle?: string;
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
 * la tinta oscura el rojo y el azul se apagan.
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
      {detalle && <p className="mt-1.5 text-cuerpo-s text-muted-inverse">{detalle}</p>}
    </div>
  );
}
