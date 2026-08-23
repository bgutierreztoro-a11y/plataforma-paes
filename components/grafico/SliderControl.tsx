"use client";

import type { CSSProperties } from "react";

/**
 * Lo que el contenido declara por control en `variables[]`, ya traducido por
 * `BloqueInteractivo`. Vive acá y no en `lib/tipos.ts` porque no es una forma
 * del schema: es la config de este control, y los dos gráficos (recta y
 * parábola) la arman igual.
 */
export interface ConfigControl {
  min: number;
  max: number;
  valorInicial: number;
  editable: boolean;
}

interface SliderControlProps {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  onChange: (valor: number) => void;
  valorTexto: string;
  /* false = control fijo de la variante unaVariable: se sigue viendo (su valor
     es parte de lo que hay que observar) pero no se puede mover. */
  editable?: boolean;
}

export function SliderControl({
  etiqueta,
  valor,
  min,
  max,
  paso,
  onChange,
  valorTexto,
  editable = true,
}: SliderControlProps) {
  return (
    <div className={`space-y-1.5 ${editable ? "" : "opacity-60"}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink-suave">
          {etiqueta}
          {!editable && " · fijo"}
        </span>
        <span className="text-base num text-ink">
          {valor.toLocaleString("es-CL", { maximumFractionDigits: 1 })}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        disabled={!editable}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={editable ? etiqueta : `${etiqueta}, fijo en este paso`}
        aria-valuetext={valorTexto}
        /* Qué parte del riel va pintada. El dibujo del control vive en
           `.slider-interactivo` (globals.css); acá solo viaja el número, que es
           lo único que depende del estado. Se acota a [0, 100] porque un valor
           fuera de rango —`valorInicial` mal puesto en el contenido— daría un
           degradado invertido en vez de un riel. */
        style={
          {
            "--relleno": `${Math.min(100, Math.max(0, ((valor - min) / (max - min)) * 100))}%`,
          } as CSSProperties
        }
        className={`slider-interactivo h-11 w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          editable ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      />
    </div>
  );
}
