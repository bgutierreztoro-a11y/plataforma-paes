"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueVerdaderoFalso as BloqueVFTipo } from "@/lib/tipos";

export function BloqueVerdaderoFalso({ bloque }: { bloque: BloqueVFTipo }) {
  const [respuesta, setRespuesta] = useState<boolean | null>(null);
  const [revelado, setRevelado] = useState(false);

  const esCorrecto = respuesta === bloque.respuestaCorrecta;

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <div className="flex gap-3">
        <Boton
          variante={respuesta === true ? "primario" : "secundario"}
          disabled={revelado}
          onClick={() => setRespuesta(true)}
        >
          Verdadero
        </Boton>
        <Boton
          variante={respuesta === false ? "primario" : "secundario"}
          disabled={revelado}
          onClick={() => setRespuesta(false)}
        >
          Falso
        </Boton>
      </div>
      {!revelado && (
        <Boton onClick={() => setRevelado(true)} disabled={respuesta === null}>
          Revisar respuesta
        </Boton>
      )}
      {revelado && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm ${
            esCorrecto ? "bg-success-suave" : "bg-error-suave"
          }`}
        >
          {esCorrecto ? <IconoCorrecto /> : <IconoIncorrecto />}
          <span>{respuesta === true ? bloque.feedbackVerdadero : bloque.feedbackFalso}</span>
        </div>
      )}
    </div>
  );
}
