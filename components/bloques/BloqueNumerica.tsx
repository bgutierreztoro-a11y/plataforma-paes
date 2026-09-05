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

/* iOS no ofrece tecla de menos en el teclado de `inputMode="decimal"`, así que
   el signo se cambia con un botón. Opera sobre el string crudo del input —nunca
   sobre el Number— para no tocar el manejo de coma decimal chilena de aNumero(). */
function alternarSigno(valor: string): string {
  return valor.startsWith("-") ? valor.slice(1) : "-" + valor;
}

function mensajeParaCampo(bloque: BloqueNumericaTipo, campoId: string, valor: number): string {
  const campo = bloque.campos.find((c) => c.id === campoId)!;
  if (valor === campo.respuestaCorrecta) return "¡Correcto!";
  const especifico = bloque.feedbackPorError?.find(
    (f) => f.campoId === campoId && f.valorObtenido === valor,
  );
  return especifico?.mensaje ?? bloque.feedbackPorDefecto;
}

export function BloqueNumerica({
  bloque,
  corpus,
}: {
  bloque: BloqueNumericaTipo;
  /* El texto completo de la lección, para el trazo de destacador. Ver
     lib/trazoDestacado.ts. */
  corpus?: string;
}) {
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
        <TextoEnriquecido contenido={bloque.enunciado} corpus={corpus} />
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
              <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  aria-label="Cambiar signo"
                  disabled={revelado}
                  onClick={() =>
                    setValores((v) => ({ ...v, [campo.id]: alternarSigno(v[campo.id] ?? "") }))
                  }
                  className="h-11 w-11 shrink-0 rounded-tarjeta border border-border text-ink num focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-ink-tenue"
                >
                  <span aria-hidden="true">±</span>
                </button>
              </div>
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
          Comprobar
        </Boton>
      )}
    </div>
  );
}
