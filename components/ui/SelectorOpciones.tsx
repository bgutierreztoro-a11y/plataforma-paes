"use client";

export interface OpcionSelector {
  id: string;
  texto: string;
}

interface SelectorOpcionesProps {
  opciones: OpcionSelector[];
  nombre: string;
  seleccionado: string | null;
  onSeleccionar: (id: string) => void;
  disabled?: boolean;
  leyenda: string;
}

/**
 * Selector de alternativas de una sola opción, compartido por `BloqueSeleccion`
 * (ítems de selección normales) y `SecuenciaMicropreguntas` (predicción del
 * bloque interactivo `dosVariables`) — antes cada uno tenía su propio
 * `fieldset`/`label`/`input radio` casi idéntico.
 */
export function SelectorOpciones({
  opciones,
  nombre,
  seleccionado,
  onSeleccionar,
  disabled = false,
  leyenda,
}: SelectorOpcionesProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">{leyenda}</legend>
      {opciones.map((op) => (
        <label
          key={op.id}
          className={`flex min-h-11 items-center gap-3 rounded-tarjeta border border-border bg-surface px-4 py-3 motion-safe:transition-colors motion-reduce:transition-none has-[:checked]:border-accent has-[:checked]:bg-accent-suave has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
            disabled
              ? "cursor-not-allowed"
              : "cursor-pointer hover:border-border-fuerte hover:bg-accent-suave/40"
          }`}
        >
          <input
            type="radio"
            name={nombre}
            checked={seleccionado === op.id}
            onChange={() => onSeleccionar(op.id)}
            className="h-5 w-5 accent-accent"
          />
          <span className="text-sm text-ink">{op.texto}</span>
        </label>
      ))}
    </fieldset>
  );
}
