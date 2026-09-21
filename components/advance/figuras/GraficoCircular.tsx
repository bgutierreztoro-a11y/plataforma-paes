import { useId } from "react";
import type { FiguraGraficoCircular } from "@/lib/advance/descarte";
import { ariaLabelCircular, pathSector, puntoPolar, sectoresResueltos, textoDeSector } from "@/lib/advance/figurasDatos";
import { ANCHO, FONDO, HALO, LETRA_ROTULO, rellenoDe, TINTA } from "./lienzo";
import { Rayas } from "./Rayas";

/**
 * Gráfico circular para la figura `grafico-circular` de un ítem Advance
 * (item-advance.schema.json, figuraGraficoCircular). Los sectores empiezan a
 * las 12 en punto y giran en sentido horario, en el orden del banco. Cada uno
 * lleva su etiqueta afuera, a la altura del ángulo medio, seguida del texto del
 * modo (porcentaje, valor, ángulo o nada). Los rellenos alternan sólido,
 * rayado, tinte y hueco para que dos sectores vecinos nunca se fundan sin
 * depender del color; la etiqueta directa es lo que los identifica.
 *
 * Accesibilidad: role="img" y aria-label generado desde los datos, con el
 * mismo texto que ve el estudiante (en modo ninguno, solo las etiquetas).
 */

const ALTO_CIRCULAR = 210;
const CX = ANCHO / 2;
const CY = ALTO_CIRCULAR / 2;
const RADIO = 70;
const SEPARACION_ROTULO = 12;

export function GraficoCircular({ figura }: { figura: FiguraGraficoCircular }) {
  const idRayas = `r${useId()}`;
  const sectores = sectoresResueltos(figura.sectores);
  const n = sectores.length;

  /* Con n ≡ 1 (mod 4) el último sector caería en el mismo relleno que el
     primero, con el que es vecino: se le da el segundo. */
  const indiceRelleno = (j: number) => (j === n - 1 && n % 4 === 1 ? 1 : j);

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO_CIRCULAR}`} className="block h-auto w-full max-w-[26rem]" role="img" aria-label={ariaLabelCircular(figura)} focusable="false" data-grafico-circular>
      <defs>
        <Rayas id={idRayas} />
      </defs>

      {sectores.map((s, j) => {
        const relleno = rellenoDe(indiceRelleno(j), idRayas);
        return <path key={j} d={pathSector(CX, CY, RADIO, s.inicio, s.fin)} fill={relleno.fill} stroke={FONDO} strokeWidth="1.5" strokeLinejoin="round" data-elemento="sector" />;
      })}
      {/* Contorno y radios en tinta, después de los sectores, para que el
          sector hueco tenga borde y los vecinos no dependan del relleno. */}
      <circle cx={CX} cy={CY} r={RADIO} fill="none" stroke={TINTA} strokeWidth="1" />
      <path
        d={sectores.map((s) => {
          const p = puntoPolar(CX, CY, RADIO, s.inicio);
          return `M ${CX} ${CY} L ${p.x} ${p.y}`;
        }).join(" ")}
        stroke={TINTA}
        strokeWidth="1"
        fill="none"
        data-elemento="radios"
      />

      {sectores.map((s, j) => {
        const medio = (s.inicio + s.fin) / 2;
        const p = puntoPolar(CX, CY, RADIO + SEPARACION_ROTULO, medio);
        const cos = Math.cos(((medio - 90) * Math.PI) / 180);
        const ancla = cos > 0.15 ? "start" : cos < -0.15 ? "end" : "middle";
        const valor = textoDeSector(s, figura.modoEtiqueta);
        return (
          <text key={j} {...HALO} x={p.x} y={p.y} dy="0.35em" textAnchor={ancla} fontSize={LETRA_ROTULO} fill={TINTA} data-elemento="rotulo-sector">
            <tspan fontWeight="600">{s.etiqueta}</tspan>
            {valor && <tspan className="num">{` ${valor}`}</tspan>}
          </text>
        );
      })}
    </svg>
  );
}
