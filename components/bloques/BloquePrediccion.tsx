"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto } from "@/components/ui/Icono";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloquePrediccion as BloquePrediccionTipo } from "@/lib/tipos";

export function BloquePrediccion({ bloque }: { bloque: BloquePrediccionTipo }) {
  const [respuesta, setRespuesta] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
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
        <input
          type={bloque.tipoRespuesta === "numero" ? "number" : "text"}
          inputMode={bloque.tipoRespuesta === "numero" ? "decimal" : undefined}
          disabled={enviado}
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          aria-label="Tu predicción"
          className="h-11 w-full max-w-xs rounded-tarjeta border border-border px-3 font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
      )}
      {!enviado && (
        <Boton onClick={() => setEnviado(true)} disabled={!respuesta.trim()}>
          Registrar predicción
        </Boton>
      )}
      {enviado && (
        <div role="status" className="flex items-start gap-2 rounded-tarjeta bg-success-suave px-4 py-3 text-sm">
          <IconoCorrecto />
          <span>Predicción registrada. Sigue para comparar.</span>
        </div>
      )}
    </div>
  );
}
