interface GlifoProps {
  className?: string;
}

/**
 * "Volver a pasar por esto": la flecha circular que marca la acción de repetir.
 *
 * Hoy tiene un solo consumidor, `components/ItemsPAESFinal.tsx`, donde el cierre
 * de lección ofrece dos enlaces de texto casi idénticos ("Repasar esta lección" y
 * "Repetir solo las preguntas") con la misma clase y el mismo peso. Se
 * distinguían solo leyéndolos completos. El glifo marca el segundo en las dos
 * ramas del umbral, así que la regla es una y no tiene excepciones: donde dice
 * "repetir el set", va el glifo.
 *
 * **No es un dibujo nuevo.** Es el mismo arco de ~300° con la punta de flecha
 * arriba que ya usan `camino/NodoTema.tsx:45` (`GlifoRepasar`, viewBox 24) y
 * `ui/Icono.tsx:42` (`IconoIncorrecto`, viewBox 20), reescalado. Traer un
 * segundo dibujo para el mismo concepto era justo lo que había que evitar: el
 * producto ya tiene tres familias de glifos conviviendo
 * (`ui/linea/IconosNav.tsx:12-14`) y no necesita una cuarta forma para "volver a
 * pasar".
 *
 * **Y no es una equis.** Misma razón que documenta `ui/Icono.tsx:31-41`: la equis
 * es un veredicto sobre la persona y queda reservada a fallos de sistema, igual
 * que el rojo. Repetir el set es una invitación, no una falla.
 *
 * Sigue el contrato de `ui/linea/IconosNav.tsx:16-24` y no el de su origen:
 * viewBox 16, trazo 2, extremos y uniones redondas, `currentColor`. El trazo
 * sube de los 1,5 que daría el reescalado directo a los 2 de la familia de 16px,
 * porque lo que tiene que coincidir es el peso óptico de la fila donde vive, no
 * la proporción del dibujo del que salió.
 *
 * `currentColor` y ningún color propio: hereda del enlace que lo contiene. En
 * `ItemsPAESFinal` eso es `--color-accent` (#4A4FE0), medido en 5,62:1 sobre el
 * fondo de página (#F7F7F5) y 8,82:1 en el hover (`--color-accent-fuerte`,
 * #3831AE). Si algún día se moviera a `--linea-nav`, las cuatro líneas pasan el
 * 3:1 de gráfico sobre ese mismo fondo: 01 → 4,52, 02 → 16,56, 03 → 4,48,
 * 04 → 6,41. Medido, no calculado de memoria.
 *
 * `aria-hidden` sin excepción, igual que los otros diez glifos del repo: la
 * palabra de al lado ya dice qué hace, y anunciarlo dos veces es ruido para el
 * lector de pantalla.
 *
 * **El gesto vive en el CSS, no acá.** El componente solo pone los dos ganchos
 * —`.glifo-repetir` en el `<svg>` y `.glifo-repetir-trazo` en el `<path>`— y el
 * `pathLength`. Quién lo dispara y cuánto dura se declara en `app/globals.css`,
 * junto a `.canto` y por el mismo motivo: el movimiento del sistema se retempla
 * en un lugar. Para que ocurra, el control que lo contiene tiene que llevar
 * `.gesto-repetir`.
 *
 * En reposo el glifo no lleva `stroke-dasharray` de ninguna clase: el dash se
 * declara solo dentro de la regla del gesto, así que sin interacción el render
 * es idéntico al de la versión estática.
 *
 * **Sin `.canto`.** Pinta un `box-shadow: 0 2px 0` bajo el elemento
 * (`app/globals.css:855-858`), y bajo un enlace subrayado eso se lee como un
 * segundo subrayado, no como un canto que se hunde.
 */
export function GlifoRepetir({ className = "" }: GlifoProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`glifo-repetir h-4 w-4 shrink-0 ${className}`.trim()}
    >
      {/* Arco de ~300°, hueco arriba a la izquierda, con la punta de flecha en el
          extremo superior apuntando en el sentido del giro.

          `pathLength="1"` normaliza el largo del trazo a 1 para que el dash del
          gesto se escriba sin medir el arco a mano. Sin él habría que dejar el
          largo real (~26,75 unidades) escrito en el CSS, y ese número se rompe
          en silencio la primera vez que alguien retoque la `d`. No cambia nada
          del render: solo la unidad en que se cuenta el trazo. */}
      <path
        className="glifo-repetir-trazo"
        pathLength="1"
        d="M8 3.67A4.33 4.33 0 1 1 4.27 5.83M6.4 2.4L8 3.67 6.4 4.93"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
