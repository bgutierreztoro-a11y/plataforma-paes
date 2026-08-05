import { CuadriculaFondo } from "./CuadriculaFondo";

interface Props {
  tazasTotal: number;
  partesPorTaza: number;
  partesTotales: number;
  partesPorGrupo: number;
  gruposCompletos: number;
}

/* Reparto de unidades enteras en partes iguales, agrupadas de a tantas. Las
   llaves cruzan las fronteras entre unidades a propósito: ahí está la idea de
   que un grupo puede armarse con partes de dos unidades distintas. El número
   de grupos no se escribe — el diagrama es la pista, no la respuesta. */
export function IlustracionParticion({
  tazasTotal,
  partesPorTaza,
  partesTotales,
  partesPorGrupo,
  gruposCompletos,
}: Props) {
  const margen = 18;
  const separacion = 10;
  const anchoUnidad = (240 - margen * 2 - separacion * (tazasTotal - 1)) / tazasTotal;
  const anchoParte = anchoUnidad / partesPorTaza;
  const yTop = 34;
  const altoUnidad = 54;
  const yBase = yTop + altoUnidad;

  // x del borde izquierdo de la parte i contada sobre el flujo continuo
  const xParte = (i: number) => {
    const unidad = Math.floor(i / partesPorTaza);
    const dentro = i % partesPorTaza;
    return margen + unidad * (anchoUnidad + separacion) + dentro * anchoParte;
  };

  const unidades = Array.from({ length: tazasTotal }, (_, u) => u);
  const cortes = Array.from({ length: partesTotales }, (_, i) => i).filter(
    (i) => i % partesPorTaza !== 0,
  );
  const grupos = Array.from({ length: gruposCompletos }, (_, g) => g);

  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <CuadriculaFondo />
      {/* cada unidad entera: un recipiente abierto arriba */}
      {unidades.map((u) => {
        const x = margen + u * (anchoUnidad + separacion);
        return (
          <path
            key={u}
            d={`M ${x} ${yTop} V ${yBase - 8} Q ${x} ${yBase} ${x + 8} ${yBase} H ${x + anchoUnidad - 8} Q ${x + anchoUnidad} ${yBase} ${x + anchoUnidad} ${yBase - 8} V ${yTop}`}
            fill="var(--color-accent-suave)"
            stroke="var(--color-ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      })}
      {/* divisiones internas: partes iguales dentro de cada unidad */}
      {cortes.map((i) => {
        const x = xParte(i);
        return (
          <line
            key={i}
            x1={x}
            y1={yTop + 3}
            x2={x}
            y2={yBase - 4}
            stroke="var(--color-ink-suave)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        );
      })}
      {/* una llave por grupo completo; las partes sobrantes quedan sin llave */}
      {grupos.map((g) => {
        const xIni = xParte(g * partesPorGrupo);
        const xFin = xParte(g * partesPorGrupo + partesPorGrupo - 1) + anchoParte;
        const yLlave = yBase + 12;
        const medio = (xIni + xFin) / 2;
        return (
          <path
            key={g}
            d={`M ${xIni} ${yLlave} q 0 5 5 5 H ${medio - 3} q 3 0 3 5 q 0 -5 3 -5 H ${xFin - 5} q 5 0 5 -5`}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
