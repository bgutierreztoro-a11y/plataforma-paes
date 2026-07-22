"use client";

import { useEffect, useRef, useState } from "react";
import { SliderControl } from "./SliderControl";
import { PlanoCartesiano } from "./PlanoCartesiano";
import { formatoDecimalChileno } from "@/lib/planoCartesiano";

interface ConfigControl {
  min: number;
  max: number;
  valorInicial: number;
  editable: boolean;
}

interface GraficoPendienteProps {
  instruccion?: string;
  configM: ConfigControl;
  configB: ConfigControl;
  /* Solo variante unaVariable: cuántos valores distintos del control editable
     debe probar el estudiante antes de que se le permita avanzar de paso. */
  exploracionMinima?: number;
  onExploracionCompleta?: () => void;
}

const PASO_M = 0.5;
const PASO_B = 1;

export function GraficoPendiente({
  instruccion,
  configM,
  configB,
  exploracionMinima,
  onExploracionCompleta,
}: GraficoPendienteProps) {
  const [m, setM] = useState(configM.valorInicial);
  const [b, setB] = useState(configB.valorInicial);
  const [mostrarCambio, setMostrarCambio] = useState(false);
  const [activo, setActivo] = useState<"m" | "b" | null>(null);

  /* La exploración cuenta valores DISTINTOS, no movimientos: arrastrar el
     slider de ida y vuelta entre dos posiciones no es explorar. Va en un ref
     porque el set no se pinta, solo decide cuándo se libera el avance.
     Se siembra con el valor inicial del único control editable (la variante
     unaVariable, la única con umbral, siempre tiene exactamente uno): la
     posición de partida ya es un valor visto. */
  const explorados = useRef(
    new Set<number>([configM.editable ? configM.valorInicial : configB.valorInicial]),
  );
  const yaLibero = useRef(false);

  useEffect(() => {
    if (!activo) return;
    const t = setTimeout(() => setActivo(null), 600);
    return () => clearTimeout(t);
  }, [activo]);

  /* Sin umbral (variante dosVariables) no hay nada que liberar: el avance ya
     está libre desde el inicio y no se llama al callback. */
  function registrarExploracion(valor: number) {
    if (!exploracionMinima || yaLibero.current) return;
    explorados.current.add(valor);
    if (explorados.current.size >= exploracionMinima) {
      yaLibero.current = true;
      onExploracionCompleta?.();
    }
  }

  return (
    <div className="space-y-4">
      {instruccion && <p className="text-base text-ink">{instruccion}</p>}
      <div className="flex justify-center">
        <PlanoCartesiano m={m} b={b} mostrarCambio={mostrarCambio} />
      </div>
      <p className="text-center font-mono text-xl tabular-nums text-ink">
        y ={" "}
        <span
          className={`rounded px-1 motion-safe:transition-colors ${activo === "m" ? "bg-accent-suave" : ""}`}
        >
          {formatoDecimalChileno(m)}
        </span>
        x +{" "}
        <span
          className={`rounded px-1 motion-safe:transition-colors ${activo === "b" ? "bg-accent-suave" : ""}`}
        >
          {formatoDecimalChileno(b)}
        </span>
      </p>
      <p aria-live="polite" className="solo-lector">
        Ecuación actual: y = {formatoDecimalChileno(m)} x + {formatoDecimalChileno(b)}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <SliderControl
          etiqueta="Pendiente (m)"
          valor={m}
          min={configM.min}
          max={configM.max}
          paso={PASO_M}
          editable={configM.editable}
          onChange={(v) => {
            setM(v);
            setActivo("m");
            registrarExploracion(v);
          }}
          valorTexto={`pendiente ${formatoDecimalChileno(m)}`}
        />
        <SliderControl
          etiqueta="Intercepto (b)"
          valor={b}
          min={configB.min}
          max={configB.max}
          paso={PASO_B}
          editable={configB.editable}
          onChange={(v) => {
            setB(v);
            setActivo("b");
            registrarExploracion(v);
          }}
          valorTexto={`intercepto ${formatoDecimalChileno(b)}`}
        />
      </div>
      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={mostrarCambio}
          onChange={(e) => setMostrarCambio(e.target.checked)}
          className="h-5 w-5 accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        Ver el cambio (Δx / Δy)
      </label>
    </div>
  );
}
