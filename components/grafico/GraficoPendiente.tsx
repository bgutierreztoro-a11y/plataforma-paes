"use client";

import { useEffect, useState } from "react";
import { SliderControl } from "./SliderControl";
import { PlanoCartesiano } from "./PlanoCartesiano";
import { formatoDecimalChileno } from "@/lib/planoCartesiano";

interface GraficoPendienteProps {
  instruccion?: string;
  valorInicialM?: number;
  valorInicialB?: number;
}

export function GraficoPendiente({
  instruccion,
  valorInicialM = 0,
  valorInicialB = 0,
}: GraficoPendienteProps) {
  const [m, setM] = useState(valorInicialM);
  const [b, setB] = useState(valorInicialB);
  const [mostrarCambio, setMostrarCambio] = useState(false);
  const [activo, setActivo] = useState<"m" | "b" | null>(null);

  useEffect(() => {
    if (!activo) return;
    const t = setTimeout(() => setActivo(null), 600);
    return () => clearTimeout(t);
  }, [activo]);

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
          min={-5}
          max={5}
          paso={0.5}
          onChange={(v) => {
            setM(v);
            setActivo("m");
          }}
          valorTexto={`pendiente ${formatoDecimalChileno(m)}`}
        />
        <SliderControl
          etiqueta="Intercepto (b)"
          valor={b}
          min={-8}
          max={8}
          paso={1}
          onChange={(v) => {
            setB(v);
            setActivo("b");
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
