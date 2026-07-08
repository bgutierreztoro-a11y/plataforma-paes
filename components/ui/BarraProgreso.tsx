interface BarraProgresoProps {
  pasoActual: number;
  total: number;
}

export function BarraProgreso({ pasoActual, total }: BarraProgresoProps) {
  const porcentaje = ((pasoActual + 1) / total) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={pasoActual + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Paso ${pasoActual + 1} de ${total}`}
      className="h-2 w-full rounded-full bg-border"
    >
      <div
        className="h-2 rounded-full bg-accent motion-safe:transition-[width] motion-safe:duration-300 motion-reduce:transition-none"
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}
