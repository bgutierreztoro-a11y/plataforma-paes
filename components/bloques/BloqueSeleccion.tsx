"use client";

import { useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarArray } from "@/lib/mezclar";
import type { BloqueSeleccion as BloqueSeleccionTipo } from "@/lib/tipos";

export function BloqueSeleccion({ bloque }: { bloque: BloqueSeleccionTipo }) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  // Orden inicial = original (idéntico servidor/cliente). La mezcla real
  // ocurre en el efecto, que solo corre en el cliente tras hidratar —
  // mezclar directo en el useState causaría un mismatch de hidratación
  // (Math.random ejecutándose distinto en servidor y cliente). El id
  // (a/b/c) no se muestra al estudiante, así que no hace falta reasignarlo.
  const [opciones, setOpciones] = useState(bloque.opciones);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mezcla de una sola vez al montar, ver comentario arriba
    setOpciones(mezclarArray(bloque.opciones));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const opcionElegida = opciones.find((o) => o.id === seleccion);

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <fieldset className="space-y-2" disabled={revelado}>
        <legend className="sr-only">Opciones</legend>
        {opciones.map((op) => (
          <label
            key={op.id}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-tarjeta border border-border px-4 py-2.5 has-[:checked]:border-accent has-[:checked]:bg-accent-suave ${
              revelado ? "cursor-not-allowed" : ""
            }`}
          >
            <input
              type="radio"
              name={`seleccion-${bloque.enunciado.slice(0, 10)}`}
              checked={seleccion === op.id}
              onChange={() => setSeleccion(op.id)}
              className="h-5 w-5 accent-accent"
            />
            <span>{op.texto}</span>
          </label>
        ))}
      </fieldset>
      {!revelado && (
        <Boton onClick={() => setRevelado(true)} disabled={!seleccion}>
          Revisar respuesta
        </Boton>
      )}
      {revelado && opcionElegida && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm ${
            opcionElegida.esCorrecta ? "bg-success-suave" : "bg-error-suave"
          }`}
        >
          {opcionElegida.esCorrecta ? <IconoCorrecto /> : <IconoIncorrecto />}
          <span>{opcionElegida.feedback}</span>
        </div>
      )}
    </div>
  );
}
