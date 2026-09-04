import Link from "next/link";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";

interface HeaderLeccionProps {
  pasoActual: number;
  total: number;
  /* El tema al que pertenece la lección. Es el destino de "Salir": se resuelve
     por dato desde el servidor (app/leccion/[id]/page.tsx → RunnerLeccion), no
     con history.back(), que devuelve a donde el navegador venga —una recarga, un
     enlace pegado— y no a la estación de la lección. */
  temaId: string;
}

/**
 * El único chrome del runner, ahora la barra de la maqueta:
 * `[Salir] [barra de progreso] [n/N]`, en una sola fila de 44px
 * (`docs/referencia/B-linea-interfaz-completa.html:244`).
 *
 * Reemplaza a la franja anterior —ícono de salida, "Paso N · tipo" y una línea
 * de progreso de 3px pegada al borde inferior—. Tres cosas cambian y valen el
 * comentario:
 *
 * 1. **La salida vuelve a ser una palabra.** El ícono solo decía "salir" a quien
 *    lo buscaba, y el destino vivía en el `aria-label`. La maqueta lo escribe, y
 *    escrito no necesita que nadie lo interprete. Conserva el objetivo táctil de
 *    44px aunque el texto mida 10px.
 * 2. **Se va "Paso N · tipo".** El contador `n/N` dice la posición, y el tipo del
 *    paso ("descubrimiento", "practica") es vocabulario de quien escribe el
 *    contenido, no del estudiante. La maqueta no lo trae.
 * 3. **La barra es la del sistema** (`ui/linea/BarraProgreso`), la misma que /tu
 *    y las bandas de eje: 6px, pista hundida y relleno en `--linea`. La franja de
 *    3px propia de este archivo desaparece; no había motivo para que el runner
 *    tuviera su propio dibujo de progreso.
 *
 * Los dos rótulos van en `--text-primary` y no en el `--ink2` de la maqueta:
 * sobre el fondo de página ese gris da 4,42:1 y no llega a AA. Ver
 * docs/deuda-contraste-etiquetas.md.
 */
export function HeaderLeccion({ pasoActual, total, temaId }: HeaderLeccionProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-bg">
      {/* h-11 exacto: es el alto que `PasoLeccion` usa para calcular su offset
          de `sticky` en escritorio. Si cambia acá, cambia allá. */}
      <div className="mx-auto flex h-11 max-w-5xl items-center gap-2.5 px-3">
        {/* `-ml-1` compensa el aire interno del área táctil, para que el texto
            arranque ópticamente alineado con el contenido de abajo. */}
        <Link
          href={`/tema/${temaId}`}
          className="-ml-1 inline-flex min-h-11 shrink-0 items-center px-1 text-etiqueta uppercase text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
        >
          Salir
        </Link>

        <BarraProgreso
          className="flex-1"
          valor={pasoActual + 1}
          total={total}
          etiqueta={`Paso ${pasoActual + 1} de ${total}`}
        />

        {/* `aria-hidden` porque la barra de al lado ya anuncia "Paso N de M": sin
            esto, un lector de pantalla lee el mismo dato dos veces seguidas. */}
        <span aria-hidden="true" className="num shrink-0 text-etiqueta text-primary">
          {pasoActual + 1}/{total}
        </span>
      </div>
    </header>
  );
}
