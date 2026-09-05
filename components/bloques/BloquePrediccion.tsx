"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloquePrediccion as BloquePrediccionTipo } from "@/lib/tipos";

/* iOS no ofrece tecla de menos en el teclado de `inputMode="decimal"`, así que
   el signo se cambia con un botón. Opera sobre el string crudo del input. */
function alternarSigno(valor: string): string {
  return valor.startsWith("-") ? valor.slice(1) : "-" + valor;
}

export function BloquePrediccion({
  bloque,
  corpus,
}: {
  bloque: BloquePrediccionTipo;
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
      {bloque.tipoRespuesta === "seleccionSimple" && bloque.opciones ? (
        <fieldset className="space-y-2" disabled={enviado}>
          <legend className="sr-only">Opciones</legend>
          {bloque.opciones.map((op) => (
            <label
              key={op}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-tarjeta border border-border px-4 py-2.5 has-[:checked]:border-accent has-[:checked]:bg-accent-suave"
            >
              <input
                type="radio"
                name={bloque.enunciado.slice(0, 10)}
                checked={respuesta === op}
                onChange={() => setRespuesta(op)}
                className="h-5 w-5 accent-accent"
              />
              <span>{op}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="flex items-center gap-2 w-full max-w-xs">
          <input
            type="text"
            inputMode={bloque.tipoRespuesta === "numero" ? "decimal" : undefined}
            disabled={enviado}
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            aria-label="Tu predicción"
            className="h-11 flex-1 rounded-tarjeta border border-border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          />
          {bloque.tipoRespuesta === "numero" && (
            <button
              type="button"
              aria-label="Cambiar signo"
              disabled={enviado}
              onClick={() => setRespuesta((r) => alternarSigno(r))}
              className="h-11 w-11 shrink-0 rounded-tarjeta border border-border text-ink num focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-ink-tenue"
            >
              <span aria-hidden="true">±</span>
            </button>
          )}
        </div>
      )}
      {!enviado && (
        <Boton onClick={() => setEnviado(true)} disabled={!respuesta.trim()}>
          Registrar predicción
        </Boton>
      )}
      {/* Acuse de recibo, no veredicto: dice lo mismo se haya predicho lo que
          se haya predicho. Por eso se queda inline aunque el paso ancle
          feedback — la zona anclada es del veredicto, y mandar acá un "quedó
          registrado" ocuparía el lugar donde el estudiante espera un
          resultado. Ver `lib/feedbackDelPaso.ts`. */}
      {enviado && (
        <PanelFeedback tono="acierto">Predicción registrada. Sigue para comparar.</PanelFeedback>
      )}
    </div>
  );
}
