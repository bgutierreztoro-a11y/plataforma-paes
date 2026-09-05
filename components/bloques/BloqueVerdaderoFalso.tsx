"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { usePanelAnclado } from "@/components/ui/ZonaAnclada";
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
  const anclar = usePanelAnclado();

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
        <Boton onClick={() => setRevelado(true)} disabled={respuesta === null}>
          Comprobar
        </Boton>
      )}
      {revelado &&
        anclar(
          <PanelFeedback
            tono={esCorrecto ? "acierto" : "atencion"}
            className="entra-panel-anclado"
          >
            {respuesta === true ? bloque.feedbackVerdadero : bloque.feedbackFalso}
          </PanelFeedback>,
        )}
    </div>
  );
}
