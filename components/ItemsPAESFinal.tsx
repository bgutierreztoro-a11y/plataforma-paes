"use client";

import { Boton } from "@/components/ui/Boton";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";

export function ItemsPAESFinal({
  respuestas,
  onContinuar,
}: {
  respuestas: RespuestaRegistrada[];
  onContinuar: () => void;
}) {
  const aciertos = respuestas.filter((r) => r.correcta).length;

  return (
    <div className="fondo-cuadricula flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Cerraste esta lección</h1>
      <p className="font-mono text-3xl tabular-nums text-ink">
        {aciertos} / {respuestas.length}
      </p>
      <p className="max-w-md text-base text-ink-suave">respuestas correctas.</p>
      <Boton onClick={onContinuar}>Continuar</Boton>
    </div>
  );
}
