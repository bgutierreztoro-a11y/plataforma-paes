"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueVerdaderoFalso as BloqueVFTipo } from "@/lib/tipos";

/* Las variantes `disabled:` son obligatorias, no decorativas: al comprobar los
   dos botones quedan deshabilitados, y `disabled:bg-border` de Boton.tsx le
   gana a cualquier `bg-*` plano (es una variante, y en el CSS generado va
   después). Sin repetir el acierto bajo `disabled:`, el botón acertado se
   pintaría gris como el otro. */
const CLASE_ACIERTO =
  "border border-success bg-success-suave text-ink disabled:border-success disabled:bg-success-suave disabled:text-ink";

export function BloqueVerdaderoFalso({ bloque }: { bloque: BloqueVFTipo }) {
  const [respuesta, setRespuesta] = useState<boolean | null>(null);
  const [revelado, setRevelado] = useState(false);

  const esCorrecto = respuesta === bloque.respuestaCorrecta;

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      {/* Al acertar, el verde se ancla al botón que el estudiante eligió y no
          solo al recuadro de feedback: `disabled` deja los dos botones
          apagados tras comprobar, así que sin esto no quedaría rastro de cuál
          había elegido. Solo el acierto. */}
      <div className="flex gap-3">
        <Boton
          variante={respuesta === true ? "primario" : "secundario"}
          disabled={revelado}
          onClick={() => setRespuesta(true)}
          className={revelado && respuesta === true && esCorrecto ? CLASE_ACIERTO : ""}
        >
          Verdadero
        </Boton>
        <Boton
          variante={respuesta === false ? "primario" : "secundario"}
          disabled={revelado}
          onClick={() => setRespuesta(false)}
          className={revelado && respuesta === false && esCorrecto ? CLASE_ACIERTO : ""}
        >
          Falso
        </Boton>
      </div>
      {!revelado && (
        <div className="flex flex-wrap items-center gap-3">
          <Boton onClick={() => setRevelado(true)} disabled={respuesta === null}>
            Revisar respuesta
          </Boton>
          {/* Presente durante toda la resolución, apagado sin nada que limpiar:
              ver la nota en ItemPAES.tsx. */}
          <Boton
            variante="secundario"
            onClick={() => setRespuesta(null)}
            disabled={respuesta === null}
          >
            Empezar de nuevo
          </Boton>
        </div>
      )}
      {revelado && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm ${
            esCorrecto ? "bg-success-suave" : "bg-attention-suave"
          }`}
        >
          {esCorrecto ? <IconoCorrecto /> : <IconoIncorrecto />}
          <span>{respuesta === true ? bloque.feedbackVerdadero : bloque.feedbackFalso}</span>
        </div>
      )}
    </div>
  );
}
