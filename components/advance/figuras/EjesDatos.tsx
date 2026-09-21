import type { EjeResuelto } from "@/lib/advance/figurasDatos";
import { rotuloMarca } from "@/lib/advance/figurasDatos";
import { ALTO, HAIRLINE, HALO, LETRA_MARCA, TICK, TINTA } from "./lienzo";

interface EjesDatosProps {
  eje: EjeResuelto;
  yAPixel: (y: number) => number;
  izq: number;
  der: number;
  sup: number;
  inf: number;
  /** Fila del eje x en píxeles: la del 0 si está en el rango, o el borde inferior. */
  yEjeX: number;
  etiquetaX: string;
  etiquetaY: string;
}

/**
 * Lo común a barras, histograma y líneas: grilla horizontal en hairline, eje y
 * con tick y número por marca, eje x en la fila del 0, etiqueta del eje y
 * arriba a la izquierda y la del eje x abajo a la derecha. Los números son
 * <text> reales para que escalen con el zoom del sistema.
 */
export function EjesDatos({ eje, yAPixel, izq, der, sup, inf, yEjeX, etiquetaX, etiquetaY }: EjesDatosProps) {
  const grilla = eje.marcas.map((m) => `M ${izq} ${yAPixel(m)} H ${der}`).join(" ");
  return (
    <>
      <path d={grilla} stroke={HAIRLINE} strokeWidth="1" fill="none" data-elemento="grilla" />
      <line x1={izq} y1={sup} x2={izq} y2={inf} stroke={TINTA} strokeWidth="1.5" data-elemento="eje-y" />
      <line x1={izq} y1={yEjeX} x2={der} y2={yEjeX} stroke={TINTA} strokeWidth="1.5" data-elemento="eje-x" />
      <g fill={TINTA} fontSize={LETRA_MARCA} className="num" data-elemento="marcas-y">
        {eje.marcas.map((m) => (
          <g key={m}>
            <line x1={izq - TICK} y1={yAPixel(m)} x2={izq} y2={yAPixel(m)} stroke={TINTA} strokeWidth="1" />
            <text {...HALO} x={izq - TICK - 3} y={yAPixel(m)} dy="0.35em" textAnchor="end">
              {rotuloMarca(m, eje)}
            </text>
          </g>
        ))}
      </g>
      <text {...HALO} x={izq} y={LETRA_MARCA} fontSize={LETRA_MARCA} fontWeight="600" textAnchor="start" fill={TINTA} data-elemento="etiqueta-eje-y">
        {etiquetaY}
      </text>
      <text {...HALO} x={der} y={ALTO - 3} fontSize={LETRA_MARCA} fontWeight="600" textAnchor="end" fill={TINTA} data-elemento="etiqueta-eje-x">
        {etiquetaX}
      </text>
    </>
  );
}
