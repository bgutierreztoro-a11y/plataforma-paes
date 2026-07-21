"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { IconoCorrecto, IconoIncorrecto } from "@/components/ui/Icono";
import { registrarEvento } from "@/lib/eventos";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarAlternativas } from "@/lib/mezclar";
import { visualDeItem } from "@/lib/visualesItems";
import type { ItemCliente } from "@/lib/sanitizar";

interface ItemPAESProps {
  item: ItemCliente;
  mostrarFeedback: boolean;
  onSiguiente: (correcta: boolean, tiempoMs: number) => void;
  /* Texto del botón que avanza tras responder ("Siguiente pregunta", "Ver resultado"...). */
  etiquetaSiguiente?: string;
}

function formatoTiempo(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function ItemPAES({
  item,
  mostrarFeedback,
  onSiguiente,
  etiquetaSiguiente = "Continuar",
}: ItemPAESProps) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [intento, setIntento] = useState(0);
  const [transcurridoMs, setTranscurridoMs] = useState(0);
  const [tiempoFinalMs, setTiempoFinalMs] = useState(0);
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

  /* Cronómetro visible: en la PAES el tiempo por pregunta es escaso (~2 min);
     verlo entrena el ritmo. Se congela al revisar la respuesta. */
  useEffect(() => {
    if (revelado) return;
    const id = setInterval(() => {
      setTranscurridoMs(performance.now() - inicio.current);
    }, 1000);
    return () => clearInterval(id);
  }, [revelado]);

  const alternativaElegida = alternativas.find((a) => a.clave === seleccion);
  const visual = visualDeItem(item.id);

  function revisar() {
    if (!alternativaElegida) return;
    const nuevoIntento = intento + 1;
    setIntento(nuevoIntento);
    const tiempoMs = Math.round(performance.now() - inicio.current);
    setTiempoFinalMs(tiempoMs);
    registrarEvento({
      nombre: "item_respuesta",
      props: {
        item_id: item.id,
        correcta: alternativaElegida.esCorrecta,
        intento: nuevoIntento,
        tiempo_ms: tiempoMs,
      },
    });
    setRevelado(true);
  }

  function clasesOpcion(alt: (typeof alternativas)[number]): string {
    const base =
      "flex min-h-11 cursor-pointer items-center gap-3 rounded-tarjeta border bg-surface px-4 py-3 motion-safe:transition-colors motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent";
    if (revelado && seleccion === alt.clave) {
      return `${base} cursor-default ${
        alt.esCorrecta && mostrarFeedback
          ? "border-success bg-success-suave"
          : !alt.esCorrecta && mostrarFeedback
            ? "border-error bg-error-suave"
            : "border-accent bg-accent-suave"
      }`;
    }
    if (revelado) return `${base} cursor-default opacity-60`;
    if (!montado) return `${base} cursor-not-allowed`;
    return `${base} border-border hover:border-border-fuerte hover:bg-accent-suave/40 has-[:checked]:border-accent has-[:checked]:bg-accent-suave`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-ink-tenue">
          Habilidad: <span className="capitalize">{item.habilidad}</span>
        </p>
        <p
          aria-hidden="true"
          className="text-sm text-ink-suave"
          title="En la PAES M1 tendrás alrededor de 2 minutos por pregunta"
        >
          Tiempo{" "}
          <span className="font-mono tabular-nums">
            {formatoTiempo(revelado ? tiempoFinalMs : transcurridoMs)}
          </span>
        </p>
      </div>
      {visual && (
        <div className="rounded-tarjeta border border-border bg-surface p-4">
          <div className="flex justify-center">{visual}</div>
        </div>
      )}
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={item.enunciado} />
      </div>
      <fieldset className="space-y-2.5" disabled={revelado || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {alternativas.map((alt) => (
          <label key={alt.clave} className={clasesOpcion(alt)}>
            <input
              type="radio"
              name={`item-${item.id}`}
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
        <div className="transicion-paso space-y-4">
          {mostrarFeedback ? (
            <div
              role="status"
              className={`flex items-start gap-2.5 rounded-tarjeta px-4 py-3 text-sm leading-relaxed ${
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
          <p className="text-sm text-ink-suave">
            Resuelta en{" "}
            <span className="font-mono tabular-nums">{formatoTiempo(tiempoFinalMs)}</span> · en la
            PAES M1 tendrás alrededor de 2 minutos por pregunta.
          </p>
          <Boton
            onClick={() => onSiguiente(alternativaElegida.esCorrecta, tiempoFinalMs)}
          >
            {etiquetaSiguiente}
          </Boton>
        </div>
      )}
    </div>
  );
}
