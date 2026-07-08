"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto } from "@/components/ui/Icono";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueAbierta as BloqueAbiertaTipo } from "@/lib/tipos";

export function BloqueAbierta({ bloque }: { bloque: BloqueAbiertaTipo }) {
  const [respuesta, setRespuesta] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <textarea
        disabled={enviado}
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        rows={4}
        aria-label="Tu respuesta"
        className="w-full rounded-tarjeta border border-border p-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />
      {!enviado && (
        <Boton onClick={() => setEnviado(true)} disabled={!respuesta.trim()}>
          Enviar respuesta
        </Boton>
      )}
      {enviado && (
        <div role="status" className="flex items-start gap-2 rounded-tarjeta bg-success-suave px-4 py-3 text-sm">
          <IconoCorrecto />
          <span>
            Respuesta registrada.
            {bloque.mostrarRespuestaModelo && bloque.respuestaModelo
              ? ` Una forma de decirlo: ${bloque.respuestaModelo}`
              : ""}
          </span>
        </div>
      )}
    </div>
  );
}
