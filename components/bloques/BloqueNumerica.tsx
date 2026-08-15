"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { usePanelAnclado } from "@/components/ui/ZonaAnclada";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueNumerica as BloqueNumericaTipo } from "@/lib/tipos";

function aNumero(valor: string): number {
  return Number(valor.trim().replace(",", "."));
}

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
  /* Con varios campos este bloque abre un panel por campo, así que el paso
     entero cuenta como múltiple (`lib/feedbackDelPaso.ts`) y no habrá zona
     anclada: `anclar` devuelve el panel en su lugar y cada feedback se queda
     pegado a su campo, que es lo único que los distingue. */
  const anclar = usePanelAnclado();

  const listo = bloque.campos.every((c) => valores[c.id]?.trim());

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <div className="space-y-3">
        {bloque.campos.map((campo) => {
          const numero = aNumero(valores[campo.id] ?? "");
          const esCorrecto = revelado && numero === campo.respuestaCorrecta;
          return (
            <div key={campo.id} className="space-y-1.5">
              <label htmlFor={campo.id} className="block text-sm text-ink-suave">
                {campo.etiqueta}
                {campo.unidad ? ` (${campo.unidad})` : ""}
              </label>
              <input
                id={campo.id}
                type="text"
                inputMode="decimal"
                disabled={revelado}
                value={valores[campo.id] ?? ""}
                onChange={(e) => setValores((v) => ({ ...v, [campo.id]: e.target.value }))}
                /* Al acertar, el verde se ancla al campo que el estudiante
                   llenó y no solo al recuadro de feedback de abajo: con varios
                   campos, el panel por sí solo no dice cuál de ellos quedó
                   bien. Solo el acierto. */
                className={`h-11 w-40 rounded-tarjeta border px-3 num focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  esCorrecto ? "border-success bg-success-suave" : "border-border"
                }`}
              />
              {revelado &&
                anclar(
                  <PanelFeedback
                    tono={esCorrecto ? "acierto" : "atencion"}
                    className="entra-panel-anclado"
                  >
                    {mensajeParaCampo(bloque, campo.id, numero)}
                  </PanelFeedback>,
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
