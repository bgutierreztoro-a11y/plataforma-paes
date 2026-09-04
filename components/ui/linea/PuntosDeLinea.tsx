interface PuntosDeLineaProps {
  /* Una entrada por estación de la línea, en orden de temario. `true` es una
     estación ya pasada. */
  pasadas: boolean[];
  /* Nombre accesible de la fila entera. Los puntos son un resumen, no una lista
     de destinos: exponerlos uno por uno leería "imagen, imagen, imagen" y no
     diría nada que el texto de al lado no diga mejor. */
  etiqueta: string;
  className?: string;
}

/**
 * La fila de puntos de una línea: uno por estación, relleno el que ya se pasó.
 *
 * Es la fila `.dots` de la maqueta
 * (`docs/referencia/B-linea-interfaz-completa.html:93-94`): círculos de 9px con
 * borde de 1,5px, separados 4px.
 *
 * **No reusa `<Estacion>`** aunque las dos dibujen paradas. La estación mide
 * 15px, tiene cinco estados y su geometría es la del riel: darle un segundo
 * tamaño obligaría a una tabla de 2 × 5 con ocho celdas que nadie monta. El
 * punto de acá no es una parada del riel — es un resumen, sin estado propio ni
 * etiqueta propia.
 *
 * El borde va en `currentColor` y el color lo pone el contenedor desde
 * `--linea`, igual que la maqueta pone `style="color:var(--eN)"` en la fila: así
 * el color se escribe una vez por fila y no una vez por punto. Fuera de un eje
 * `--linea` cae a tinta por el default de `:root` y los puntos siguen leyéndose.
 *
 * Ojo al verificar el borde: a devicePixelRatio 1 Chrome redondea 1,5px a 1px, y
 * `getComputedStyle` devuelve ese valor usado. Mismo aviso que en
 * `BloquePregunta.tsx`.
 */
export function PuntosDeLinea({ pasadas, etiqueta, className = "" }: PuntosDeLineaProps) {
  return (
    <div
      role="img"
      aria-label={etiqueta}
      className={`flex flex-wrap gap-1 text-[var(--linea)] ${className}`.trim()}
    >
      {pasadas.map((pasada, i) => (
        <span
          key={i}
          className={`block h-[9px] w-[9px] shrink-0 rounded-full border-[1.5px] border-current ${
            pasada ? "bg-[var(--linea)]" : ""
          }`.trim()}
        />
      ))}
    </div>
  );
}
