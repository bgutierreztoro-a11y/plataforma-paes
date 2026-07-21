"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { registrarEvento } from "@/lib/eventos";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarAlternativas } from "@/lib/mezclar";
import type { BloquePregunta as BloquePreguntaTipo } from "@/lib/tipos";

export function BloquePregunta({
  bloque,
  itemId,
}: {
  bloque: BloquePreguntaTipo;
  itemId: string;
}) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [intento, setIntento] = useState(0);
  const inicio = useRef(0);
  // Orden inicial = original (idéntico servidor/cliente); la mezcla real
  // ocurre en el efecto de abajo, solo en el cliente tras hidratar (ver
  // nota en ItemPAES.tsx sobre por qué no mezclar directo en useState).
  // "Intentar de nuevo" no remonta el componente, así que una vez mezclado
  // el orden se mantiene estable entre reintentos de la misma pregunta.
  const [alternativas, setAlternativas] = useState(bloque.alternativas);
  // Ver lib/useMontado.ts: mismo guard de hidratación que ItemPAES.
  const montado = useMontado();
  useEffect(() => {
    inicio.current = performance.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mezcla de una sola vez al montar, ver comentario arriba
    setAlternativas(mezclarAlternativas(bloque.alternativas));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const alternativaElegida = alternativas.find((a) => a.clave === seleccion);

  function revisar() {
    if (!alternativaElegida) return;
    const nuevoIntento = intento + 1;
    setIntento(nuevoIntento);
    registrarEvento({
      nombre: "item_respuesta",
      props: {
        item_id: itemId,
        correcta: alternativaElegida.esCorrecta,
        intento: nuevoIntento,
        tiempo_ms: Math.round(performance.now() - inicio.current),
      },
    });
    setRevelado(true);
  }

  function intentarDeNuevo() {
    setSeleccion(null);
    setRevelado(false);
  }

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <fieldset className="space-y-2" disabled={revelado || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {alternativas.map((alt) => (
          <label
            key={alt.clave}
            className={`flex min-h-11 items-center gap-3 rounded-tarjeta border border-border bg-surface px-4 py-3 motion-safe:transition-colors motion-reduce:transition-none has-[:checked]:border-accent has-[:checked]:bg-accent-suave has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              revelado || !montado
                ? "cursor-not-allowed"
                : "cursor-pointer hover:border-border-fuerte hover:bg-accent-suave/40"
            }`}
          >
            <input
              type="radio"
              name={`pregunta-${itemId}`}
              value={alt.clave}
              checked={seleccion === alt.clave}
              onChange={() => setSeleccion(alt.clave)}
              className="peer sr-only"
            />
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-fuerte font-mono text-sm text-ink-suave peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white">
              {alt.clave}
            </span>
            <span>{alt.texto}</span>
          </label>
        ))}
      </fieldset>
      {!revelado && (
        <Boton onClick={revisar} disabled={!seleccion || !montado}>
          Revisar respuesta
        </Boton>
      )}
      {revelado && alternativaElegida && (
        <div
          role="status"
          className={`transicion-paso flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm ${
            alternativaElegida.esCorrecta ? "bg-success-suave" : "bg-error-suave"
          }`}
        >
          {alternativaElegida.esCorrecta ? <IconoCorrecto /> : <IconoIncorrecto />}
          <span>
            {alternativaElegida.feedback ?? (alternativaElegida.esCorrecta ? "¡Correcto!" : "")}
          </span>
        </div>
      )}
      {revelado && alternativaElegida && !alternativaElegida.esCorrecta && (
        <Boton variante="secundario" onClick={intentarDeNuevo}>
          Intentar de nuevo
        </Boton>
      )}
    </div>
  );
}
