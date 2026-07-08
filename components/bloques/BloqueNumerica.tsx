"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueNumerica as BloqueNumericaTipo } from "@/lib/tipos";

function mensajeParaCampo(bloque: BloqueNumericaTipo, campoId: string, valor: number): string {
  const campo = bloque.campos.find((c) => c.id === campoId)!;
  if (valor === campo.respuestaCorrecta) return "¡Correcto!";
  const especifico = bloque.feedbackPorError?.find(
    (f) => f.campoId === campoId && f.valorObtenido === valor,
  );
  return especifico?.mensaje ?? bloque.feedbackPorDefecto;
}

export function BloqueNumerica({ bloque }: { bloque: BloqueNumericaTipo }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [revelado, setRevelado] = useState(false);

  const listo = bloque.campos.every((c) => valores[c.id]?.trim());

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <div className="space-y-3">
        {bloque.campos.map((campo) => {
          const numero = Number(valores[campo.id]);
          const esCorrecto = revelado && numero === campo.respuestaCorrecta;
          return (
            <div key={campo.id} className="space-y-1.5">
              <label htmlFor={campo.id} className="block text-sm text-ink-suave">
                {campo.etiqueta}
                {campo.unidad ? ` (${campo.unidad})` : ""}
              </label>
              <input
                id={campo.id}
                type="number"
                inputMode="decimal"
                disabled={revelado}
                value={valores[campo.id] ?? ""}
                onChange={(e) => setValores((v) => ({ ...v, [campo.id]: e.target.value }))}
                className="h-11 w-40 rounded-tarjeta border border-border px-3 font-mono tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              />
              {revelado && (
                <div
                  role="status"
                  className={`flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm ${
                    esCorrecto ? "bg-success-suave" : "bg-error-suave"
                  }`}
                >
                  {esCorrecto ? <IconoCorrecto /> : <IconoIncorrecto />}
                  <span>{mensajeParaCampo(bloque, campo.id, numero)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!revelado && (
        <Boton onClick={() => setRevelado(true)} disabled={!listo}>
          Revisar respuesta
        </Boton>
      )}
    </div>
  );
}
