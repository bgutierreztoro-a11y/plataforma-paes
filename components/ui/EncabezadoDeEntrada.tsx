import type { ReactNode } from "react";

/**
 * El encabezado de las pantallas de entrada y salida: rótulo, título y una línea
 * que sitúa.
 *
 * Es el trío que estas pantallas ya venían escribiendo cada una a su manera —
 * unas con rótulo y otras sin él, unas con el rótulo en `text-sm` y otras en
 * `text-xs`, y varias con el título solo y colgando. Un título huérfano obliga a
 * leerlo entero para saber dónde estás; el rótulo lo resuelve antes, de un
 * vistazo.
 *
 * **No es `TituloDePantalla`** (`navegacion/EncabezadoPantalla.tsx`), aunque el
 * trío se parezca. Aquel es la etiqueta compacta de las franjas fijas de /camino
 * y /tema: 16–18px, truncada a una línea, pensada para convivir con un contador
 * al lado. Este es un encabezado display para pantallas de una sola cosa, donde
 * el título es lo que la pantalla es. Compartirlos habría obligado a uno de los
 * dos a ceder el tamaño, que es justo lo que los distingue.
 *
 * El rótulo va en `text-etiqueta uppercase`, la única receta de versalitas del
 * sistema desde la Fase E. Antes usaba `text-eyebrow`, que era una de cuatro
 * recetas distintas para el mismo gesto y ya se declaraba obsoleto en
 * globals.css.
 *
 * **El color es `text-primary` y no `text-secondary`.** Este encabezado se monta
 * sobre el fondo de página —`PantallaCentrada`, no una tarjeta—, y ahí el gris
 * de rótulo da 4,42:1 y no llega a AA (`docs/deuda-contraste-etiquetas.md` §1).
 * Es el mismo par que ya eligió `leccion/HeaderLeccion.tsx:35-37` por el mismo
 * motivo. Ningún token se recalibra para esto.
 */
/**
 * `portada` sube un escalón de la escala. Es para el primer título que ve alguien
 * que llega: a 30px competía de igual a igual con el h1 de cualquier pantalla
 * interna, y la portada no es una pantalla interna más.
 *
 * Sin `leading-tight tracking-tight` a mano en ninguno de los dos — desde la
 * escala tipográfica de globals.css el interlineado y el tracking ya vienen en el
 * token del tamaño.
 */
const CLASES_TITULO = {
  base: "text-3xl",
  portada: "text-4xl lg:text-5xl",
} as const;

const CLASES_SUBTITULO = {
  base: "text-base leading-relaxed",
  portada: "text-lg",
} as const;

export function EncabezadoDeEntrada({
  rotulo,
  titulo,
  children,
  escala = "base",
  className = "",
}: {
  /** Dónde estás. Opcional solo donde no hay contexto que dar (404, error). */
  rotulo?: string;
  titulo: ReactNode;
  /** La línea que sitúa. `ReactNode` porque varias necesitan un nombre en
   *  negrita o un enlace adentro, no solo texto plano. */
  children?: ReactNode;
  escala?: keyof typeof CLASES_TITULO;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {rotulo && (
        <p className="text-etiqueta uppercase text-primary">
          {rotulo}
        </p>
      )}
      {/* `h1` y no un nivel configurable: estas pantallas son de una sola cosa,
          así que su título ES el encabezado del documento. La portada era la
          excepción y era un error — no tenía ningún h1. */}
      <h1 className={`${CLASES_TITULO[escala]} font-semibold text-ink`}>{titulo}</h1>
      {children && (
        <p className={`mx-auto max-w-md ${CLASES_SUBTITULO[escala]} text-ink-suave`}>
          {children}
        </p>
      )}
    </div>
  );
}
