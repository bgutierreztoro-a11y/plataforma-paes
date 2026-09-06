import type { ReactNode } from "react";
import { estiloDeLinea, type LineaId } from "./colores";

interface PlacaLineaProps {
  linea: LineaId;
  titulo: string;
  subtitulo: string;
  /** La tira de retorno, si esta pantalla tiene a dónde volver. Va arriba,
   *  dentro de la placa. Sin ella la placa se rinde igual que siempre. */
  volver?: ReactNode;
  className?: string;
}

/* Las cantidades que la placa puede llegar a decir, escritas en palabras. Llega
   hasta doce porque el eje más largo tiene seis estaciones y la red entera
   dieciséis; por encima de la tabla cae a cifra, que es feo pero no falso.

   El 1 es "una" y no "uno": concuerda con "estación". */
const CANTIDADES = [
  "cero",
  "una",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
  "once",
  "doce",
] as const;

/**
 * El subtítulo de la placa: `"Línea 01, tres estaciones"`.
 *
 * Vive acá, junto al componente, y no dentro de él: la placa no sabe qué se
 * cuenta —mismo contrato que `subtitulo` en `RielEstaciones`—, pero la frase es
 * de la placa y no de la ruta que la monta, así que sus dos call sites la
 * comparten en vez de repetir la plantilla.
 *
 * **Sin punto medio y sin versalitas.** El separador `·` obligaba a leer dos
 * datos como si fueran un código de señalética; en voz alta no se dice. La
 * cantidad va en palabra por lo mismo: es una frase, no una ficha.
 *
 * El cero a la izquierda ya viene en `LineaId` ("01"), que es donde vive el
 * nombre de la línea. Acá no se formatea ningún número.
 */
export function subtituloDePlaca(linea: LineaId, estaciones: number): string {
  const cantidad = CANTIDADES[estaciones] ?? String(estaciones);
  return `Línea ${linea}, ${cantidad} ${estaciones === 1 ? "estación" : "estaciones"}`;
}

/**
 * El cartel que dice en qué línea estás: barra de tinta con el disco del color
 * del eje, el número, el título y, debajo, la frase que dice qué línea es y
 * cuántas estaciones tiene.
 *
 * Es también **el lugar donde se instala la línea**. Al llevar
 * `estiloDeLinea()` en su propio nodo, cualquier cosa que se anide dentro de la
 * placa hereda `--linea` sin recibir props. Para teñir una pantalla entera, el
 * mismo `estiloDeLinea()` va en el contenedor de la pantalla.
 *
 * El disco muestra el dígito y no "01": el cero a la izquierda pertenece al
 * nombre del token, no a la señalética.
 *
 * **El disco se pinta con `--linea` y no con `--linea-fondo`**, aunque lleve un
 * dígito encima. Acá el color no es fondo de texto sino identidad de línea, y
 * tiene que ser el color exacto del eje: si se oscureciera, el disco dejaría de
 * coincidir con las barras y las estaciones de la misma pantalla, que es
 * justamente lo que la placa viene a declarar. El dígito no lo pide tampoco —va
 * `aria-hidden` y es redundante con el subtítulo, que dice "Línea 03" al lado—,
 * y el disco vive sobre la barra de tinta, no sobre superficie clara. El caso
 * inverso, donde el color sí es fondo de texto, es Boton y el chip de
 * Alternativa; ver ./colores.ts.
 *
 * **La tira de retorno va dentro y no encima.** `volver` se rinde como primera
 * fila de la propia placa, a sangre contra sus bordes, y por eso el relleno de
 * la cabecera bajó al hijo: la banda sigue siendo una sola pieza.
 *
 * **El subtítulo es cuerpo, no etiqueta.** Iba en `text-etiqueta uppercase`
 * —10px, +12% de tracking, versalitas—, que es el rótulo del sistema: "TU RED",
 * "ACIERTOS". Esto no rotula nada; es una frase que se lee de corrido bajo el
 * nombre del eje, y en versalitas se leía como un código de andén. `cuerpo-xs`
 * en peso 500 la deja secundaria sin volverla señalética.
 *
 * Valor sin especificar en el sistema: el diámetro del disco. 36px es lo que lo
 * deja leer a la par de un título de 23px; confirmar contra Figma cuando el
 * archivo esté disponible.
 */
export function PlacaLinea({
  linea,
  titulo,
  subtitulo,
  volver,
  className = "",
}: PlacaLineaProps) {
  return (
    <div style={estiloDeLinea(linea)} className={`bg-primary ${className}`.trim()}>
      {volver}
      {/* El relleno vive acá y no en el padre: la tira de retorno va a sangre
          contra los bordes de la placa y pone el suyo propio. */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--linea)] text-titulo-m text-[var(--linea-contraste)]"
        >
          {Number(linea)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-titulo-l text-inverse">{titulo}</span>
          <span className="mt-px block truncate text-cuerpo-xs font-medium text-muted-inverse">
            {subtitulo}
          </span>
        </span>
      </div>
    </div>
  );
}
