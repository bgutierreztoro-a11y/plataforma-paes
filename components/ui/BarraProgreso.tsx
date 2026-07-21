interface BarraProgresoProps {
  pasoActual: number;
  total: number;
  /* Sustantivo de la unidad: "Paso" (runner) o "Pregunta" (sets de ítems). */
  sustantivo?: string;
  /* Texto opcional a la derecha de la etiqueta (ej. tipo del paso actual). */
  detalle?: string;
}

export function BarraProgreso({
  pasoActual,
  total,
  sustantivo = "Paso",
  detalle,
}: BarraProgresoProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium tabular-nums text-ink-suave">
          {sustantivo} {pasoActual + 1} de {total}
        </p>
        {detalle && <p className="truncate text-sm capitalize text-ink-tenue">{detalle}</p>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={pasoActual + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${sustantivo} ${pasoActual + 1} de ${total}`}
        className="flex w-full gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full motion-safe:transition-colors motion-safe:duration-300 motion-reduce:transition-none ${
              i <= pasoActual ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
