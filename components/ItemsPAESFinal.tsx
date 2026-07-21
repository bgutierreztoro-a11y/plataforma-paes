"use client";

import { Boton } from "@/components/ui/Boton";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";

function formatoTiempo(ms: number): string {
  const totalSeg = Math.round(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function ItemsPAESFinal({
  respuestas,
  onContinuar,
}: {
  respuestas: RespuestaRegistrada[];
  onContinuar: () => void;
}) {
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const promedioMs =
    respuestas.length > 0
      ? respuestas.reduce((suma, r) => suma + r.tiempoMs, 0) / respuestas.length
      : 0;

  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Cerraste esta lección</h1>
      <div className="w-full max-w-sm rounded-tarjeta border border-border bg-surface p-6 shadow-tarjeta">
        <p className="font-mono text-3xl font-medium tabular-nums text-ink">
          {aciertos}
          <span className="text-lg text-ink-tenue"> / {respuestas.length}</span>
        </p>
        <p className="mt-1 text-sm text-ink-suave">respuestas correctas</p>
        <p className="mt-3 border-t border-border pt-3 text-sm text-ink-suave">
          Ritmo promedio:{" "}
          <span className="font-mono tabular-nums">{formatoTiempo(promedioMs)}</span> por pregunta
        </p>
      </div>
      <Boton onClick={onContinuar}>Continuar</Boton>
    </div>
  );
}
