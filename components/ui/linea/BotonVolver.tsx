import Link from "next/link";

/**
 * Sobre qué fondo se monta la tira. No es un estilo alternativo: cada fondo pide
 * su propia tinta, su propio acuse y su propio anillo de foco, y los cinco
 * valores del tono oscuro son invisibles o ilegibles sobre papel.
 */
type Tono = "sobre-placa" | "sobre-papel";

const CLASES_POR_TONO: Record<Tono, string> = {
  "sobre-placa":
    "min-h-[38px] border-b border-white/12 text-[var(--retorno-tinta)] hover:text-inverse active:bg-white/7 focus-visible:outline-white",
  "sobre-papel":
    "min-h-11 text-[var(--linea-nav)] underline-offset-4 hover:underline focus-visible:outline-strong",
};

interface BotonVolverProps {
  /** A dónde vuelve. Es un `href` real, no un `history.back()`. */
  destino: string;
  etiqueta: string;
  tono?: Tono;
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
 * **Los 38px de alto son de `sobre-placa`, no del componente.** Es menos que los
 * 44 del objetivo táctil y es deliberado: ahí la tira ocupa el ancho completo de
 * la pantalla, así que el área real es una franja de 38×390 y no un cuadrado de
 * 38. La regla de los 44 protege contra blancos difíciles de acertar, no contra
 * franjas. `sobre-papel` **sí** va en `min-h-11` (44px), porque ahí la tira es
 * una fila dentro de la columna de contenido y no una banda a sangre: deja de
 * haber franja que acertar y la regla vuelve a aplicar.
 *
 * En reposo `sobre-placa` va en `--retorno-tinta` y no en blanco: la flecha tiene
 * que estar disponible sin competirle al nombre del eje, que es lo que la
 * pantalla viene a decir. Al tocarla sube a blanco —el recorrido de color es el
 * acuse—.
 *
 * `sobre-papel` no reescala ese recorrido: toma **los mismos tokens que
 * `Boton variante="texto"` ya usa** (`./Boton.tsx`), que es el rol "salida de
 * baja jerarquía sobre superficie clara" y ya está medido. Texto en
 * `--linea-nav` —nunca `--linea` crudo: la 02 (#FFB600) como texto no pasa
 * contraste y ese mapa la baja a tinta, ver ./colores.ts— y subrayado al pasar
 * por encima en vez de un cambio de tinta. Sin borde y sin fondo de `active`: el
 * borde al 12% de blanco separa la tira del cuerpo dentro de la placa, y sobre
 * papel no hay banda que cerrar.
 *
 * El anillo de foco lleva offset **negativo** en los dos tonos: con offset
 * positivo el anillo se dibuja fuera de la tira, contra el borde de la placa, y
 * se corta. Mismo criterio que `NavInferior`, que también vive pegada a un
 * borde. Lo que cambia con el tono es el color del anillo, no su geometría.
 *
 * La etiqueta va en `cuerpo-s` y no en `titulo-s`: el nombre del eje está justo
 * debajo y es lo que la pantalla declara; el retorno acompaña, no compite.
 */
export function BotonVolver({
  destino,
  etiqueta,
  tono = "sobre-placa",
  className = "",
}: BotonVolverProps) {
  return (
    <Link
      href={destino}
      className={`flex w-full items-center gap-1.5 px-4 motion-safe:transition-colors motion-safe:duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 ${CLASES_POR_TONO[tono]} ${className}`.trim()}
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
