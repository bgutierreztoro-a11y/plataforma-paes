import { estiloDeLinea, type LineaId } from "./colores";

interface PlacaLineaProps {
  linea: LineaId;
  titulo: string;
  subtitulo: string;
  className?: string;
}

/**
 * El cartel que dice en qué línea estás: barra de tinta con el disco del color
 * del eje, el número, el título y el subtítulo en etiqueta.
 *
 * Es también **el lugar donde se instala la línea**. Al llevar
 * `estiloDeLinea()` en su propio nodo, cualquier cosa que se anide dentro de la
 * placa hereda `--linea` sin recibir props. Para teñir una pantalla entera, el
 * mismo `estiloDeLinea()` va en el contenedor de la pantalla.
 *
 * El disco muestra el dígito y no "01": el cero a la izquierda pertenece al
 * nombre del token, no a la señalética.
 *
 * Valor sin especificar en el sistema: el diámetro del disco. 36px es lo que lo
 * deja leer a la par de un título de 23px; confirmar contra Figma cuando el
 * archivo esté disponible.
 */
export function PlacaLinea({
  linea,
  titulo,
  subtitulo,
  className = "",
}: PlacaLineaProps) {
  return (
    <div
      style={estiloDeLinea(linea)}
      className={`flex items-center gap-3 bg-primary px-4 py-3.5 ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--linea)] text-titulo-m text-[var(--linea-contraste)]"
      >
        {Number(linea)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-titulo-l text-inverse">{titulo}</span>
        <span className="block truncate text-etiqueta uppercase text-muted-inverse">
          {subtitulo}
        </span>
      </span>
    </div>
  );
}
