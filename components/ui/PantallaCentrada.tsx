import type { ReactNode } from "react";

/**
 * Una pantalla de una sola cosa, centrada sobre el papel milimetrado.
 *
 * Es el envoltorio de los momentos en que el producto no está enseñando sino
 * marcando un hito: la entrada al diagnóstico, el anuncio antes de las
 * preguntas, el cierre de una lección, la celebración de un tema, y las dos
 * pantallas de nada (404 y error). Estaba copiado literal en ocho lugares —
 * las mismas doce clases, con el `gap` distinto en cada uno no por criterio
 * sino por orden de escritura.
 *
 * El aire es parte de la definición y por eso vive acá: `py-16` y el centrado
 * son lo que hace que estas pantallas se lean como una pausa y no como una
 * página a medio llenar (UI_GUIDELINES §6, regla 2).
 *
 * El `gap` y el `text-center` los sigue poniendo cada pantalla: cuánto separar
 * depende de cuántas piezas haya, y forzar un valor único haría que la de dos
 * elementos y la de cinco se vean igual de apretadas o igual de sueltas.
 */
export function PantallaCentrada({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16 ${className}`}
    >
      {children}
    </div>
  );
}
