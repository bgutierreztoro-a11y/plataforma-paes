import Link from "next/link";

interface BotonVolverProps {
  /** A dónde vuelve. Es un `href` real, no un `history.back()`. */
  destino: string;
  etiqueta: string;
  className?: string;
}

/**
 * El retorno de una pantalla de profundidad: una tira con chevron y etiqueta,
 * pegada arriba dentro de la placa de cabecera.
 *
 * **Es un `<a>`, nunca un `<button onClick={router.back()}>`.** La diferencia no
 * es de estilo: un enlace real se abre en pestaña nueva, se copia, se enfoca con
 * teclado y dice a dónde va antes de que lo toquen. `back()` además miente
 * cuando se llegó por URL directa —el destino sería lo que haya en el historial,
 * o nada—, y a /linea/[ejeId] se llega también desde afuera.
 *
 * Vive dentro de la placa y no encima: la cabecera es una sola pieza de
 * señalética a sangre, y una tira flotante sobre ella la partiría en dos. El
 * borde inferior al 12% de blanco es lo que la separa del cuerpo sin cortar la
 * banda.
 *
 * 38px de alto mínimo. Es menos que los 44 del objetivo táctil y es deliberado:
 * la tira ocupa el ancho completo de la pantalla, así que el área real es una
 * franja de 38×390 y no un cuadrado de 38. La regla de los 44 protege contra
 * blancos difíciles de acertar, no contra franjas.
 *
 * En reposo va en `--retorno-tinta` y no en blanco: la flecha tiene que estar
 * disponible sin competirle al nombre del eje, que es lo que la pantalla viene a
 * decir. Al tocarla sube a blanco —el recorrido de color es el acuse—.
 *
 * El anillo de foco lleva offset **negativo**: con offset positivo el anillo se
 * dibuja fuera de la tira, contra el borde de la placa, y se corta. Mismo
 * criterio que `NavInferior`, que también vive pegada a un borde.
 *
 * La etiqueta va en `cuerpo-s` y no en `titulo-s`: el nombre del eje está justo
 * debajo y es lo que la pantalla declara; el retorno acompaña, no compite.
 */
export function BotonVolver({ destino, etiqueta, className = "" }: BotonVolverProps) {
  return (
    <Link
      href={destino}
      className={`flex min-h-[38px] w-full items-center gap-1.5 border-b border-white/12 px-4 text-[var(--retorno-tinta)] motion-safe:transition-colors motion-safe:duration-[120ms] hover:text-inverse active:bg-white/7 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${className}`.trim()}
    >
      {/* Decorativo: la etiqueta de al lado ya dice a dónde va. */}
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M8.25 2.5 4.25 6.5l4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-cuerpo-s">{etiqueta}</span>
    </Link>
  );
}
