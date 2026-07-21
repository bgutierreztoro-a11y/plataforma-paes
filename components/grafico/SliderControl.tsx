"use client";

interface SliderControlProps {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  onChange: (valor: number) => void;
  valorTexto: string;
}

export function SliderControl({
  etiqueta,
  valor,
  min,
  max,
  paso,
  onChange,
  valorTexto,
}: SliderControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink-suave">{etiqueta}</span>
        <span className="font-mono text-base tabular-nums text-ink">
          {valor.toLocaleString("es-CL", { maximumFractionDigits: 1 })}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={etiqueta}
        aria-valuetext={valorTexto}
        className="h-11 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
      />
    </div>
  );
}
