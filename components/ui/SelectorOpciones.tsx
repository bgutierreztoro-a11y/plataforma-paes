"use client";

import {
  ALTERNATIVA_BASE,
  ALTERNATIVA_CORRECTA,
  ALTERNATIVA_INTERACTIVA,
  ALTERNATIVA_REPOSO,
} from "@/components/ui/alternativa";

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
          className={`${ALTERNATIVA_BASE} ${
            marcaAcierto === op.id ? ALTERNATIVA_CORRECTA : ALTERNATIVA_REPOSO
          } ${disabled ? "cursor-not-allowed" : ALTERNATIVA_INTERACTIVA}`}
        >
          <input
            type="radio"
            name={nombre}
            checked={seleccionado === op.id}
            onChange={() => onSeleccionar(op.id)}
            /* `accent-color` del radio nativo, al color del eje: la fila que lo
               rodea ya lo toma desde `ALTERNATIVA_REPOSO`, y dejarlo en índigo
               ponía dos colores distintos dentro del mismo control. */
            className="h-5 w-5 accent-[var(--linea)]"
          />
          <span className="text-sm text-ink">{op.texto}</span>
        </label>
      ))}
    </fieldset>
  );
}
