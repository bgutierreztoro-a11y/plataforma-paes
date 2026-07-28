"use client";

import { useEffect, useRef, useState } from "react";
import { SliderControl } from "./SliderControl";
import { PlanoCartesiano } from "./PlanoCartesiano";
import {
  SecuenciaMicropreguntas,
  type ConfirmacionMicropregunta,
  type FaseMicropregunta,
} from "./SecuenciaMicropreguntas";
import { Boton } from "@/components/ui/Boton";
import { formatoDecimalChileno } from "@/lib/planoCartesiano";
import type { MicropreguntaSlider } from "@/lib/tipos";

interface ConfigControl {
  min: number;
  max: number;
  valorInicial: number;
  editable: boolean;
}

interface GraficoPendienteProps {
  instruccion?: string;
  configM: ConfigControl;
  configB: ConfigControl;
  /* Solo variante unaVariable: cuántos valores distintos del control editable
     debe probar el estudiante antes de que se le permita avanzar de paso. */
  exploracionMinima?: number;
  onExploracionCompleta?: () => void;
  /* Solo variante dosVariables: el guion predice → mueve → comprueba. */
  secuenciaMicropreguntas?: MicropreguntaSlider[];
}

const PASO_M = 0.5;
const PASO_B = 1;

export function GraficoPendiente({
  instruccion,
  configM,
  configB,
  exploracionMinima,
  onExploracionCompleta,
  secuenciaMicropreguntas,
}: GraficoPendienteProps) {
  const [m, setM] = useState(configM.valorInicial);
  const [b, setB] = useState(configB.valorInicial);
  const [mostrarCambio, setMostrarCambio] = useState(false);
  const [activo, setActivo] = useState<"m" | "b" | null>(null);

  const haySecuencia = (secuenciaMicropreguntas?.length ?? 0) > 0;
  const [indiceMP, setIndiceMP] = useState(0);
  const [faseMP, setFaseMP] = useState<FaseMicropregunta>("predice");
  const [prediccionMP, setPrediccionMP] = useState<number | null>(null);
  const [confirmacionMP, setConfirmacionMP] = useState<ConfirmacionMicropregunta>(null);
  /* Se reinician al pasar de predicción: cada ronda exige volver a mover los
     dos controles, no basta con lo que ya se había tocado antes de predecir. */
  const [tocadoM, setTocadoM] = useState(false);
  const [tocadoB, setTocadoB] = useState(false);

  /* La exploración cuenta valores DISTINTOS, no movimientos: arrastrar el
     slider de ida y vuelta entre dos posiciones no es explorar. Va en un ref
     porque el set no se pinta, solo decide cuándo se libera el avance.
     Se siembra con el valor inicial del único control editable (la variante
     unaVariable, la única con umbral, siempre tiene exactamente uno): la
     posición de partida ya es un valor visto. */
  const explorados = useRef(
    new Set<number>([configM.editable ? configM.valorInicial : configB.valorInicial]),
  );
  const yaLibero = useRef(false);

  useEffect(() => {
    if (!activo) return;
    const t = setTimeout(() => setActivo(null), 600);
    return () => clearTimeout(t);
  }, [activo]);

  /* Sin umbral (variante dosVariables) no hay nada que liberar: el avance ya
     está libre desde el inicio y no se llama al callback. */
  function registrarExploracion(valor: number) {
    if (!exploracionMinima || yaLibero.current) return;
    explorados.current.add(valor);
    if (explorados.current.size >= exploracionMinima) {
      yaLibero.current = true;
      onExploracionCompleta?.();
    }
  }

  /* Solo cuenta como "mover para comprobar" durante la fase "mueve": antes de
     elegir predicción, o después de comprobar, los controles son exploración
     libre y no hacen avanzar el guion. */
  function registrarMovimiento(control: "m" | "b") {
    if (faseMP !== "mueve") return;
    if (control === "m") setTocadoM(true);
    else setTocadoB(true);
  }

  function elegirPrediccionMP(indice: number) {
    setPrediccionMP(indice);
    setTocadoM(false);
    setTocadoB(false);
    setConfirmacionMP(null);
    setFaseMP("mueve");
  }

  function comprobarMP() {
    setFaseMP("comprobada");
  }

  function confirmarMP(valor: "si" | "no") {
    setConfirmacionMP(valor);
  }

  function siguienteMP() {
    setIndiceMP((i) => i + 1);
    setPrediccionMP(null);
    setTocadoM(false);
    setTocadoB(false);
    setConfirmacionMP(null);
    setFaseMP("predice");
  }

  /* Reinicia solo los valores del gráfico a su punto de partida: no existe hoy
     ningún contador de intentos para este bloque (ni exploración, ni
     predicción), así que "empezar de nuevo" no puede gastar nada que no
     exista. No toca `faseMP`/`indiceMP`/`prediccionMP`: es un reset del
     gráfico, no de la secuencia predice→mueve→comprueba. */
  function volverAEmpezar() {
    setM(configM.valorInicial);
    setB(configB.valorInicial);
  }

  return (
    <div className="space-y-4">
      {instruccion && <p className="text-base text-ink">{instruccion}</p>}
      {haySecuencia && (
        <SecuenciaMicropreguntas
          micropreguntas={secuenciaMicropreguntas!}
          indice={indiceMP}
          fase={faseMP}
          prediccionElegida={prediccionMP}
          ambosControlesTocados={tocadoM && tocadoB}
          confirmacion={confirmacionMP}
          onElegirPrediccion={elegirPrediccionMP}
          onComprobar={comprobarMP}
          onConfirmar={confirmarMP}
          onSiguiente={siguienteMP}
        />
      )}
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
          min={configM.min}
          max={configM.max}
          paso={PASO_M}
          editable={configM.editable}
          onChange={(v) => {
            setM(v);
            setActivo("m");
            registrarExploracion(v);
            registrarMovimiento("m");
          }}
          valorTexto={`pendiente ${formatoDecimalChileno(m)}`}
        />
        <SliderControl
          etiqueta="Intercepto (b)"
          valor={b}
          min={configB.min}
          max={configB.max}
          paso={PASO_B}
          editable={configB.editable}
          onChange={(v) => {
            setB(v);
            setActivo("b");
            registrarExploracion(v);
            registrarMovimiento("b");
          }}
          valorTexto={`intercepto ${formatoDecimalChileno(b)}`}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={mostrarCambio}
            onChange={(e) => setMostrarCambio(e.target.checked)}
            className="h-5 w-5 accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          Ver el cambio (Δx / Δy)
        </label>
        <Boton
          variante="secundario"
          onClick={volverAEmpezar}
          disabled={m === configM.valorInicial && b === configB.valorInicial}
        >
          Volver a empezar
        </Boton>
      </div>
    </div>
  );
}
