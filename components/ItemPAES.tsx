"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { registrarEvento } from "@/lib/eventos";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { Item } from "@/lib/tipos";

interface ItemPAESProps {
  item: Item;
  mostrarFeedback: boolean;
  onSiguiente: (correcta: boolean) => void;
}

export function ItemPAES({ item, mostrarFeedback, onSiguiente }: ItemPAESProps) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [intento, setIntento] = useState(0);
  const inicio = useRef(0);
  // Ver lib/useMontado.ts: evita ofrecer las alternativas como tocables
  // antes de que React haya hidratado y conectado sus listeners de verdad.
  const montado = useMontado();
  useEffect(() => {
    inicio.current = performance.now();
  }, []);

  const alternativaElegida = item.alternativas.find((a) => a.clave === seleccion);

  function revisar() {
    if (!alternativaElegida) return;
    const nuevoIntento = intento + 1;
    setIntento(nuevoIntento);
    registrarEvento({
      nombre: "item_respuesta",
      props: {
        item_id: item.id,
        correcta: alternativaElegida.esCorrecta,
        intento: nuevoIntento,
        tiempo_ms: Math.round(performance.now() - inicio.current),
      },
    });
    setRevelado(true);
  }

  return (
    <div className="space-y-4">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={item.enunciado} />
      </div>
      <fieldset className="space-y-2" disabled={revelado || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {item.alternativas.map((alt) => (
          <label
            key={alt.clave}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-tarjeta border border-border px-4 py-2.5 has-[:checked]:border-accent has-[:checked]:bg-accent-suave ${
              revelado || !montado ? "cursor-not-allowed" : ""
            }`}
          >
            <input
              type="radio"
              name={`item-${item.id}`}
              checked={seleccion === alt.clave}
              onChange={() => setSeleccion(alt.clave)}
              className="h-5 w-5 accent-accent"
            />
            <span className="font-mono text-sm text-ink-suave">{alt.clave}</span>
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
        <>
          {mostrarFeedback ? (
            <div
              role="status"
              className={`flex items-start gap-2 rounded-tarjeta px-4 py-3 text-sm ${
                alternativaElegida.esCorrecta ? "bg-success-suave" : "bg-error-suave"
              }`}
            >
              {alternativaElegida.esCorrecta ? <IconoCorrecto /> : <IconoIncorrecto />}
              <span>
                {alternativaElegida.feedback ??
                  (alternativaElegida.esCorrecta ? "¡Correcto!" : "")}
              </span>
            </div>
          ) : (
            <div role="status" className="rounded-tarjeta bg-accent-suave px-4 py-3 text-sm text-ink">
              Respuesta registrada.
            </div>
          )}
          <Boton onClick={() => onSiguiente(alternativaElegida.esCorrecta)}>Continuar</Boton>
        </>
      )}
    </div>
  );
}
