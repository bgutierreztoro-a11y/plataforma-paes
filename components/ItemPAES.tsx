"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { registrarEvento } from "@/lib/eventos";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarAlternativas } from "@/lib/mezclar";
import type { ItemCliente } from "@/lib/sanitizar";

interface ItemPAESProps {
  item: ItemCliente;
  mostrarFeedback: boolean;
  onSiguiente: (correcta: boolean) => void;
}

export function ItemPAES({ item, mostrarFeedback, onSiguiente }: ItemPAESProps) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [intento, setIntento] = useState(0);
  const inicio = useRef(0);
  // El orden inicial es el original (idéntico en servidor y cliente, sin
  // Math.random en el render: mezclarlo aquí causaría un mismatch de
  // hidratación). La mezcla real ocurre en el efecto de abajo, que solo
  // corre en el cliente después de hidratar — coincide con la misma
  // ventana en la que el fieldset ya está deshabilitado por !montado, así
  // que no hay tap posible sobre el orden sin mezclar.
  const [alternativas, setAlternativas] = useState(item.alternativas);
  // Ver lib/useMontado.ts: evita ofrecer las alternativas como tocables
  // antes de que React haya hidratado y conectado sus listeners de verdad.
  const montado = useMontado();
  useEffect(() => {
    inicio.current = performance.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mezcla de una sola vez al montar, ver comentario arriba
    setAlternativas(mezclarAlternativas(item.alternativas));
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
        {alternativas.map((alt) => (
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
