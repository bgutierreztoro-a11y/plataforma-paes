"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueAbierta as BloqueAbiertaTipo } from "@/lib/tipos";

export function BloqueAbierta({
  bloque,
  corpus,
}: {
  bloque: BloqueAbiertaTipo;
  /* El texto completo de la lección, para el trazo de destacador. Ver
     lib/trazoDestacado.ts. */
  corpus?: string;
}) {
  const [respuesta, setRespuesta] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} corpus={corpus} />
      </div>
      <textarea
        disabled={enviado}
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        rows={4}
        aria-label="Tu respuesta"
        className="w-full rounded-tarjeta border border-border p-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />
      {/* `Registrar respuesta` y no `Comprobar`: acá no se corrige nada. El
          verbo del botón tiene que ser el mismo que el del acuse de abajo
          ("Respuesta registrada"), que es el par que `BloquePrediccion` ya
          tenía bien. Decía `Enviar respuesta`, un tercer verbo que prometía un
          envío a alguna parte. */}
      {!enviado && (
        <Boton onClick={() => setEnviado(true)} disabled={!respuesta.trim()}>
          Registrar respuesta
        </Boton>
      )}
      {/* Acuse de recibo, no veredicto: se queda inline por el mismo motivo que
          en BloquePrediccion. */}
      {enviado && (
        <PanelFeedback tono="acierto">
          Respuesta registrada.
          {bloque.mostrarRespuestaModelo && bloque.respuestaModelo
            ? ` Una forma de decirlo: ${bloque.respuestaModelo}`
            : ""}
        </PanelFeedback>
      )}
    </div>
  );
}
