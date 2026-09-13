import type { DatosGraficoCircular } from "@/lib/tipos";
import {
  LIENZO,
  RELLENO_ACENTO,
  Rotulo,
  TRAMA_CRUZADA,
  TRAMA_DIAGONAL,
  TRAMA_PUNTOS,
  TRAZO_INK,
  TRAZO_SUAVE,
  Tramas,
  formatoNumero,
} from "./graficosComunes";

/**
 * Sectores desde las 12 en sentido horario, cada uno con el rótulo que el
 * contenido declara (porcentaje o ángulo). El componente no calcula ninguna
 * medida: solo reparte el círculo en proporción a lo declarado y escribe ese
 * mismo número. Sin 3D ni explosión. Los sectores alternan trama y tono, y la
 * leyenda de la derecha repite la categoría de cada uno.
 */

const CENTRO = { x: 92, y: 102 };
const RADIO = 74;
/** Bajo este ángulo el rótulo no cabe dentro del sector y sale afuera con una guía. */
const ANGULO_MINIMO_INTERIOR = 32;

const RELLENOS = [
  { fill: RELLENO_ACENTO, opacity: 1 },
  { fill: `url(#${TRAMA_DIAGONAL})`, opacity: 1 },
  { fill: `url(#${TRAMA_PUNTOS})`, opacity: 1 },
  { fill: `url(#${TRAMA_CRUZADA})`, opacity: 1 },
  { fill: RELLENO_ACENTO, opacity: 0.45 },
  { fill: "var(--color-card)", opacity: 1 },
];

const punto = (anguloGrados: number, radio: number) => {
  const rad = ((anguloGrados - 90) * Math.PI) / 180;
  return { x: CENTRO.x + radio * Math.cos(rad), y: CENTRO.y + radio * Math.sin(rad) };
};

export function GraficoCircular(datos: DatosGraficoCircular) {
  const { sectores, rotulo } = datos;
  const angulos = sectores.map((s) => (rotulo === "porcentaje" ? s.porcentaje! * 3.6 : s.angulo!));
  const textoDe = (i: number) =>
    rotulo === "porcentaje" ? `${formatoNumero(sectores[i].porcentaje!)} %` : `${formatoNumero(sectores[i].angulo!)}°`;

  const etiqueta = `Gráfico circular con ${sectores.length} sectores: ${sectores.map((s, i) => `${s.categoria} ${textoDe(i)}`).join(", ")}.`;

  /* Inicio de cada sector: la suma de los ángulos anteriores, calculada sin
     reasignar nada durante el render (regla react-hooks/immutability). */
  const inicios = angulos.map((_, i) => angulos.slice(0, i).reduce((s, a) => s + a, 0));
  const piezas = sectores.map((s, i) => {
    const inicio = inicios[i];
    const fin = inicio + angulos[i];
    return { categoria: s.categoria, inicio, fin, medio: (inicio + fin) / 2, angulo: angulos[i], texto: textoDe(i) };
  });

  return (
    <svg viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`} className="h-auto w-full" role="img" aria-label={etiqueta}>
      <Tramas />
      {piezas.map((p, i) => {
        const a = punto(p.inicio, RADIO);
        const b = punto(p.fin, RADIO);
        const grande = p.angulo > 180 ? 1 : 0;
        const d =
          p.angulo >= 360
            ? `M ${CENTRO.x} ${CENTRO.y - RADIO} A ${RADIO} ${RADIO} 0 1 1 ${CENTRO.x - 0.01} ${CENTRO.y - RADIO} Z`
            : `M ${CENTRO.x} ${CENTRO.y} L ${a.x} ${a.y} A ${RADIO} ${RADIO} 0 ${grande} 1 ${b.x} ${b.y} Z`;
        const relleno = RELLENOS[i % RELLENOS.length];
        return (
          <path key={p.categoria} d={d} fill={relleno.fill} fillOpacity={relleno.opacity} stroke={TRAZO_INK} strokeWidth="1.5" strokeLinejoin="round" />
        );
      })}
      {piezas.map((p) => {
        if (p.angulo >= ANGULO_MINIMO_INTERIOR) {
          const c = punto(p.medio, RADIO * 0.6);
          return (
            <Rotulo key={`r${p.categoria}`} x={c.x} y={c.y} tamano={10} fuerte numero halo>
              {p.texto}
            </Rotulo>
          );
        }
        const borde = punto(p.medio, RADIO * 0.97);
        const fuera = punto(p.medio, RADIO * 1.16);
        const derecha = fuera.x >= CENTRO.x;
        return (
          <g key={`r${p.categoria}`}>
            <line x1={borde.x} y1={borde.y} x2={fuera.x} y2={fuera.y} stroke={TRAZO_SUAVE} strokeWidth="1" />
            <Rotulo x={fuera.x + (derecha ? 2 : -2)} y={fuera.y} anclaje={derecha ? "start" : "end"} tamano={9} fuerte numero>
              {p.texto}
            </Rotulo>
          </g>
        );
      })}
      {piezas.map((p, i) => {
        const y = 44 + i * 22;
        const relleno = RELLENOS[i % RELLENOS.length];
        return (
          <g key={`l${p.categoria}`}>
            <rect x={196} y={y - 6} width="12" height="12" fill={relleno.fill} fillOpacity={relleno.opacity} stroke={TRAZO_INK} strokeWidth="1.2" />
            <Rotulo x={214} y={y} anclaje="start" tamano={10}>
              {p.categoria}
            </Rotulo>
          </g>
        );
      })}
    </svg>
  );
}
