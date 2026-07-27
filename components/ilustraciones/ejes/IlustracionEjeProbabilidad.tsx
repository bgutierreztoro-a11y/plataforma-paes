import { CuadriculaFondo } from "../CuadriculaFondo";

/* Eje Probabilidad y estadística: un histograma con la mediana marcada.
   Es la figura común a tablas y gráficos, medidas de posición y reglas de
   probabilidades: datos repartidos y un corte que los divide. */
const BARRAS = [26, 48, 74, 92, 62, 34];
const X_INICIO = 52;
const ANCHO = 22;
const PASO = 28;
const BASE = 128;

export function IlustracionEjeProbabilidad() {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {BARRAS.map((alto, i) => (
        <rect
          key={i}
          x={X_INICIO + i * PASO}
          y={BASE - alto}
          width={ANCHO}
          height={alto}
          rx="2"
          fill="var(--color-accent-suave)"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
        />
      ))}
      {/* eje horizontal */}
      <path
        d={`M 40 ${BASE} H 216`}
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* el corte de la mediana: discontinuo, como los catetos de
          IlustracionPendiente */}
      <path
        d="M 137 24 V 136"
        stroke="var(--color-ink-suave)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
      />
    </svg>
  );
}
