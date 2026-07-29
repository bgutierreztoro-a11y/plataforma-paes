"use client";

import { Boton } from "@/components/ui/Boton";
import { IconoIncorrecto } from "@/components/ui/Icono";
import { SelectorOpciones } from "@/components/ui/SelectorOpciones";
import type { MicropreguntaSlider } from "@/lib/tipos";

/**
 * El guion predice → mueve → comprueba de la variante `dosVariables`
 * (MASTER.md §3.3, schema `secuenciaMicropreguntas`). Puramente presentacional:
 * no guarda estado propio. Quien la usa (`GraficoPendiente`) es dueño de la
 * fase actual y de `m`/`b`, porque ya es quien escucha los sliders — duplicar
 * ese estado acá abriría la puerta a que la fase y los valores reales del
 * gráfico se desincronicen.
 *
 * `prediccionElegida` usa `-1` como centinela de "no estoy seguro": no es un
 * campo del schema, es copy de interfaz (igual que `COPY_EN_PREPARACION` en
 * NodoTema.tsx) para la predicción que ningún autor de contenido anticipó. El
 * schema describe `feedbackPorPrediccion` como "feedback por cada predicción
 * INCORRECTA prevista" — todas las opciones declaradas son desvíos conocidos,
 * así que la única predicción que puede corresponder a "voy bien" es la que no
 * está en la lista, y el centinela le da un lugar sin inventarle un mensaje
 * que el contenido nunca escribió.
 */

export type FaseMicropregunta = "predice" | "mueve" | "comprobada";
export type ConfirmacionMicropregunta = "si" | "no" | null;

const SIN_ESTAR_SEGURO = -1;
const ID_SIN_ESTAR_SEGURO = "no-estoy-seguro";

interface SecuenciaMicropreguntasProps {
  micropreguntas: MicropreguntaSlider[];
  indice: number;
  fase: FaseMicropregunta;
  prediccionElegida: number | null;
  /** Solo importa durante "mueve": si ya se tocaron los dos controles, se
   *  habilita "Comprobar". Antes de elegir predicción, y durante "comprobada",
   *  los sliders siguen libres para explorar — nunca se bloquean. */
  ambosControlesTocados: boolean;
  /** Micro-confirmación tras el feedback de "comprobada": gatea el avance a la
   *  siguiente predicción hasta que el estudiante responda, sin importar cuál
   *  de las dos respuestas dé. No es un campo del schema — vive solo acá. */
  confirmacion: ConfirmacionMicropregunta;
  onElegirPrediccion: (indice: number) => void;
  onComprobar: () => void;
  onConfirmar: (valor: "si" | "no") => void;
  onSiguiente: () => void;
}

export function SecuenciaMicropreguntas({
  micropreguntas,
  indice,
  fase,
  prediccionElegida,
  ambosControlesTocados,
  confirmacion,
  onElegirPrediccion,
  onComprobar,
  onConfirmar,
  onSiguiente,
}: SecuenciaMicropreguntasProps) {
  const actual = micropreguntas[indice];
  const esUltima = indice === micropreguntas.length - 1;
  const mensaje =
    prediccionElegida !== null && prediccionElegida !== SIN_ESTAR_SEGURO
      ? actual.feedbackPorPrediccion[prediccionElegida]?.mensaje
      : undefined;

  return (
    <div className="rounded-tarjeta border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tenue">
        Predicción {indice + 1} de {micropreguntas.length}
      </p>
      <p className="mt-1 text-base font-medium text-ink">{actual.enunciado}</p>

      {fase === "predice" && (
        <div className="mt-3">
          <SelectorOpciones
            leyenda="Tu predicción"
            nombre={`prediccion-${actual.id}`}
            seleccionado={
              prediccionElegida === null
                ? null
                : prediccionElegida === SIN_ESTAR_SEGURO
                  ? ID_SIN_ESTAR_SEGURO
                  : String(prediccionElegida)
            }
            onSeleccionar={(id) =>
              onElegirPrediccion(id === ID_SIN_ESTAR_SEGURO ? SIN_ESTAR_SEGURO : Number(id))
            }
            opciones={[
              ...actual.feedbackPorPrediccion.map((f, i) => ({
                id: String(i),
                texto: f.prediccion,
              })),
              { id: ID_SIN_ESTAR_SEGURO, texto: "No estoy seguro" },
            ]}
          />
        </div>
      )}

      {fase === "mueve" && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-ink-suave">
            Mueve los dos controles para comprobar qué pasa de verdad.
          </p>
          {ambosControlesTocados && <Boton onClick={onComprobar}>Comprobar</Boton>}
        </div>
      )}

      {fase === "comprobada" && (
        <div className="mt-3 space-y-3">
          {mensaje ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-tarjeta bg-attention-suave px-4 py-3 text-sm"
            >
              <IconoIncorrecto />
              <span>{mensaje}</span>
            </div>
          ) : (
            <p role="status" className="text-sm text-ink-suave">
              {actual.mensajeCorrecto ?? "Comprobado. Sigue mirando qué cambia y qué se queda igual."}
            </p>
          )}

          {confirmacion === null ? (
            <div className="space-y-2">
              <p className="text-sm text-ink">¿Tiene sentido?</p>
              <div className="flex gap-2">
                <Boton variante="secundario" onClick={() => onConfirmar("si")}>
                  Sí
                </Boton>
                <Boton variante="secundario" onClick={() => onConfirmar("no")}>
                  No
                </Boton>
              </div>
            </div>
          ) : (
            <>
              {confirmacion === "no" && (
                <p role="status" className="text-sm text-ink-suave">
                  Vuelve a mover los dos controles y compara con el mensaje anterior antes de
                  seguir.
                </p>
              )}
              {esUltima ? (
                <p className="text-sm text-ink-suave">
                  Sigue explorando el gráfico libremente cuando quieras.
                </p>
              ) : (
                <Boton onClick={onSiguiente}>Siguiente predicción</Boton>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
