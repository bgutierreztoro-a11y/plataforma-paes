type Estado = "pasada" | "actual" | "proxima" | "cerrada" | "combinacion";

interface EstacionProps {
  estado: Estado;
  /* Nombre accesible. Sin él la estación es decoración: quien lee la pantalla
     con lector ya tiene el nombre de la parada en el texto de al lado, y
     repetirlo sería ruido. */
  etiqueta?: string;
  className?: string;
}

/**
 * La marca de una parada sobre el trazo de una línea.
 *
 * La geometría es la del sistema: círculo de 15px con borde de 3px; `actual`
 * crece a 21px con borde de 5px; `combinacion` es un cuadrado rotado 45° con
 * radio 3 y borde `border-strong` —el rombo dice "acá se cambia de línea", que
 * es lo mismo que dice en un mapa de metro—.
 *
 * Un cuadrado de 15px rotado 45° mide 21px de diagonal, o sea exactamente el
 * ancho de la estación `actual`: los cinco estados comparten dos anchos y no
 * cinco, y una fila de paradas no queda dentada.
 *
 * El color sale de `--linea`, heredado (ver ./colores.ts). Las diferencias:
 * - `pasada`: relleno sólido. El recorrido hecho es tinta, no contorno.
 * - `actual`: más grande y con el borde más grueso. Es la única que crece.
 * - `proxima`: contorno del color de línea sobre la superficie de la tarjeta.
 * - `cerrada`: contorno en `text-muted`. Es un estado apagado, no un borde de
 *   estructura, así que no usa `border-hairline`.
 */
const CLASES_ESTADO: Record<Estado, string> = {
  pasada: "h-[15px] w-[15px] rounded-full border-[3px] border-[var(--linea)] bg-[var(--linea)]",
  actual: "h-[21px] w-[21px] rounded-full border-[5px] border-[var(--linea)] bg-card",
  proxima: "h-[15px] w-[15px] rounded-full border-[3px] border-[var(--linea)] bg-card",
  cerrada: "h-[15px] w-[15px] rounded-full border-[3px] border-muted bg-card",
  combinacion: "h-[15px] w-[15px] rotate-45 rounded-[3px] border-[3px] border-strong bg-card",
};

export function Estacion({ estado, etiqueta, className = "" }: EstacionProps) {
  return (
    <span
      role={etiqueta ? "img" : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      className={`block shrink-0 ${CLASES_ESTADO[estado]} ${className}`.trim()}
    />
  );
}
