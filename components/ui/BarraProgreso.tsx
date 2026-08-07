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
        {/* El número del paso en el color del texto principal y el resto de la
            frase apagado: lo que se consulta de reojo es "¿en cuál voy?", no la
            oración entera. */}
        <p className="text-sm text-ink-tenue">
          {sustantivo}{" "}
          <span className="font-medium num text-ink">{pasoActual + 1}</span> de{" "}
          <span className="num">{total}</span>
        </p>
        {detalle && <p className="truncate text-sm capitalize text-ink-tenue">{detalle}</p>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={pasoActual + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${sustantivo} ${pasoActual + 1} de ${total}`}
        /* `items-center` porque los segmentos ya no miden todos igual: sin él,
           los de 6px se alinean arriba contra el de 8px y la barra queda
           dentada. */
        className="flex h-2 w-full items-center gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            /* El segmento actual va más alto y en el tono fuerte: la barra pasa
               de decir "cuánto llevas" a decir además "dónde estás parado", que
               es la pregunta que el estudiante se hace mirándola. Sube 2px, no
               cambia de caja: el contenedor mantiene su alto y nada se corre. */
            className={`flex-1 rounded-full motion-safe:transition-[background-color,height] motion-safe:duration-300 motion-reduce:transition-none ${
              i === pasoActual
                ? "h-2 bg-accent-fuerte"
                : i < pasoActual
                  ? "h-1.5 bg-accent"
                  : "h-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
