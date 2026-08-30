import Link from "next/link";
import { IconoSalir } from "@/components/ui/Icono";

interface HeaderLeccionProps {
  pasoActual: number;
  total: number;
  /* Tipo del paso ("descubrimiento", "practica"…). Va tal cual: el uppercase lo
     pone el CSS, no el dato. */
  tipo: string;
}

/**
 * El único chrome del runner. Tres zonas de 56px de alto y una línea de progreso
 * pegada al borde inferior.
 *
 * Antes esto eran cuatro cosas apiladas —título de la lección, enlace de salida
 * azul subrayado, fila "Paso N de M / tipo" y una barra de diez segmentos—
 * dentro de una franja blanca. En 390px el andamiaje llegaba antes que la
 * pregunta.
 *
 * Tres decisiones que valen el comentario:
 *
 * 1. **El fondo es `bg-bg`, no `bg-surface`.** Blanco sobre el papel ink-50 se
 *    lee como una tarjeta flotando encima del contenido: un marco dentro de
 *    otro. Con el fondo de la página, el header no es un objeto, es el borde
 *    superior de la pantalla. El `border-b` de 1px es todo lo que lo separa.
 * 2. **La salida no dice a dónde va.** Un "← Salir al camino" en azul subrayado
 *    y a tamaño de cuerpo compite con el CTA de avanzar, que es la acción que la
 *    pantalla sí quiere. El ícono en `ink-suave` se ve cuando se lo busca y
 *    desaparece cuando no; el destino lo da el `aria-label`, que es donde un
 *    lector de pantalla lo necesita.
 * 3. **El progreso es una línea continua, no diez segmentos.** Diez piezas con
 *    separación se leen como diez cosas que hacer; una línea que crece se lee
 *    como una sola que avanza. Esta no comparte nada con
 *    `components/ui/BarraProgreso`, que sigue sirviendo a los sets de ítems: ahí
 *    las preguntas son 2 a 8 unidades discretas y contarlas es justamente el
 *    punto.
 */
export function HeaderLeccion({ pasoActual, total, tipo }: HeaderLeccionProps) {
  const completado = ((pasoActual + 1) / total) * 100;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-3">
        {/* `-ml-1` compensa el aire interno del área táctil: sin eso el ícono
            queda ópticamente más adentro que el texto que empieza abajo. */}
        <Link
          href="/camino"
          aria-label="Salir al camino"
          className="-ml-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-suave motion-safe:transition-colors motion-reduce:transition-none hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
        >
          <IconoSalir />
        </Link>

        <p className="text-eyebrow uppercase tracking-wide text-ink-tenue">
          Paso <span className="num">{pasoActual + 1}</span> · {tipo}
        </p>

        {/* Zona derecha vacía, con el ancho del objetivo táctil de la izquierda:
            es lo que deja el centro centrado de verdad y no corrido hacia la
            derecha. Cuando entre algo acá, ocupa este hueco. */}
        <div className="min-w-11" aria-hidden="true" />
      </div>

      {/* Fuera del contenedor con `max-w`: la línea recorre el ancho completo del
          viewport, igual que el borde que la sostiene. */}
      <div
        role="progressbar"
        aria-valuenow={pasoActual + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Paso ${pasoActual + 1} de ${total}`}
        className="absolute inset-x-0 bottom-0 h-[3px] bg-border"
      >
        {/* El relleno toma `--linea`, que baja heredada desde la raíz de
            RunnerLeccion: esta franja de 3px es el indicador de eje más visible
            de la pantalla, y en índigo delataba que el runner no había migrado.
            Fuera de un eje cae al default de `:root` (tinta). */}
        <div
          className="h-full bg-[var(--linea)] motion-safe:transition-[width] motion-safe:duration-300 motion-reduce:transition-none"
          style={{ width: `${completado}%` }}
        />
      </div>
    </header>
  );
}
