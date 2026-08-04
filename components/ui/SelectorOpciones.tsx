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
  /* Id de la opción que quedó ACERTADA, para anclar el estado correcto al
     objeto de la respuesta y no solo al panel de feedback de abajo: la opción
     que el estudiante eligió es lo que estaba mirando cuando comprobó, y es
     ahí donde tiene que aparecer que estuvo bien. Solo el acierto — el caso
     incorrecto lo decide quien llama, porque ahí el orden en que se revela el
     veredicto importa. */
  marcaAcierto?: string | null;
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
  marcaAcierto = null,
}: SelectorOpcionesProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">{leyenda}</legend>
      {opciones.map((op) => (
        <label
          key={op.id}
          /* El acierto gana sobre `has-[:checked]`: son la misma opción (solo
             se marca la elegida), y sin el orden explícito el azul de
             seleccionado taparía el verde. */
          className={`flex min-h-11 items-center gap-3 rounded-tarjeta border bg-surface px-4 py-3 motion-safe:transition-colors motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
            marcaAcierto === op.id
              ? "border-success bg-success-suave"
              : "border-border has-[:checked]:border-accent has-[:checked]:bg-accent-suave"
          } ${
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
