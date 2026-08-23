"use client";

import { useEffect, useRef, useState } from "react";

import { PlanoParabola } from "./PlanoParabola";
import { SliderControl, type ConfigControl } from "./SliderControl";
import { Boton } from "@/components/ui/Boton";
import { formatoDecimalChileno } from "@/lib/planoCartesiano";

/**
 * El gemelo de `GraficoPendiente` para y = ax² + bx + c. Son dos componentes y
 * no uno con un `if` adentro a propósito: comparten piezas (`SliderControl`,
 * `PlanoBase`) pero no comparten guion — la recta lleva el triángulo Δx/Δy y la
 * secuencia predice→mueve→comprueba, la parábola lleva vértice y ceros. Meter
 * los dos en un componente daría un archivo lleno de ramas que ninguna lección
 * recorre entera.
 *
 * Sin `secuenciaMicropreguntas`: ese guion asume dos controles, acá hay tres, y
 * generalizarlo es un cambio propio que ninguna lección pide todavía.
 */

interface GraficoParabolaProps {
  instruccion?: string;
  configA: ConfigControl;
  configB: ConfigControl;
  configC: ConfigControl;
  mostrarVertice?: boolean;
  mostrarCeros?: boolean;
  /* Cuántos valores distintos del primer control editable debe probar el
     estudiante antes de que se le permita avanzar de paso. */
  exploracionMinima?: number;
  onExploracionCompleta?: () => void;
}

const PASO_A = 0.5;
const PASO_B = 1;
const PASO_C = 1;

type Control = "a" | "b" | "c";

/* El signo va fuera del recuadro resaltado: el recuadro es "el valor de este
   control", y "y = 1x² + -3x" no se lee. Con el signo afuera queda
   "y = 1x² − 3x" y el resaltado sigue marcando el número que se está moviendo. */
const signo = (n: number) => (n < 0 ? "−" : "+");
const magnitud = (n: number) => formatoDecimalChileno(Math.abs(n));

export function GraficoParabola({
  instruccion,
  configA,
  configB,
  configC,
  mostrarVertice = false,
  mostrarCeros = false,
  exploracionMinima,
  onExploracionCompleta,
}: GraficoParabolaProps) {
  const [a, setA] = useState(configA.valorInicial);
  const [b, setB] = useState(configB.valorInicial);
  const [c, setC] = useState(configC.valorInicial);
  const [activo, setActivo] = useState<Control | null>(null);

  /* Cuenta valores DISTINTOS, no movimientos: arrastrar el slider de ida y
     vuelta entre dos posiciones no es explorar. Se siembra con el valor de
     partida del primer control editable, que ya es un valor visto. */
  const explorados = useRef(
    new Set<number>([
      (configA.editable ? configA : configB.editable ? configB : configC).valorInicial,
    ]),
  );
  const yaLibero = useRef(false);

  useEffect(() => {
    if (!activo) return;
    const t = setTimeout(() => setActivo(null), 600);
    return () => clearTimeout(t);
  }, [activo]);

  function registrarExploracion(valor: number) {
    if (!exploracionMinima || yaLibero.current) return;
    explorados.current.add(valor);
    if (explorados.current.size >= exploracionMinima) {
      yaLibero.current = true;
      onExploracionCompleta?.();
    }
  }

  function volverAEmpezar() {
    setA(configA.valorInicial);
    setB(configB.valorInicial);
    setC(configC.valorInicial);
  }

  const enElInicio =
    a === configA.valorInicial && b === configB.valorInicial && c === configC.valorInicial;

  const resaltado = (control: Control) =>
    `rounded-control px-1.5 motion-safe:transition-colors ${
      activo === control ? "bg-interactive-suave text-interactive-fuerte" : ""
    }`;

  return (
    <div className="space-y-4">
      {instruccion && <p className="text-base text-ink">{instruccion}</p>}
      <div className="flex justify-center">
        <PlanoParabola
          a={a}
          b={b}
          c={c}
          mostrarVertice={mostrarVertice}
          mostrarCeros={mostrarCeros}
        />
      </div>
      {/* Los tres términos se muestran siempre, incluso con el coeficiente en 0:
          esconder "+ 0x" desconectaría el slider de b de la ecuación justo
          cuando el estudiante lo está mirando pasar por cero. */}
      <p className="text-center text-xl num text-ink">
        y = <span className={resaltado("a")}>{formatoDecimalChileno(a)}</span>x²{" "}
        {signo(b)} <span className={resaltado("b")}>{magnitud(b)}</span>x {signo(c)}{" "}
        <span className={resaltado("c")}>{magnitud(c)}</span>
      </p>
      <p aria-live="polite" className="solo-lector">
        Ecuación actual: y = {formatoDecimalChileno(a)} x cuadrado {signo(b)} {magnitud(b)} x{" "}
        {signo(c)} {magnitud(c)}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <SliderControl
          etiqueta="Coeficiente cuadrático (a)"
          valor={a}
          min={configA.min}
          max={configA.max}
          paso={PASO_A}
          editable={configA.editable}
          onChange={(v) => {
            setA(v);
            setActivo("a");
            registrarExploracion(v);
          }}
          valorTexto={`coeficiente cuadrático ${formatoDecimalChileno(a)}`}
        />
        <SliderControl
          etiqueta="Coeficiente lineal (b)"
          valor={b}
          min={configB.min}
          max={configB.max}
          paso={PASO_B}
          editable={configB.editable}
          onChange={(v) => {
            setB(v);
            setActivo("b");
            registrarExploracion(v);
          }}
          valorTexto={`coeficiente lineal ${formatoDecimalChileno(b)}`}
        />
        <SliderControl
          etiqueta="Término libre (c)"
          valor={c}
          min={configC.min}
          max={configC.max}
          paso={PASO_C}
          editable={configC.editable}
          onChange={(v) => {
            setC(v);
            setActivo("c");
            registrarExploracion(v);
          }}
          valorTexto={`término libre ${formatoDecimalChileno(c)}`}
        />
      </div>
      <div className="flex justify-end">
        {/* Mismo criterio que en la recta: resetear el gráfico es una acción del
            interactivo, no del paso, y con peso de botón secundario competía
            con "Siguiente paso". */}
        <Boton variante="texto" tamano="sm" onClick={volverAEmpezar} disabled={enElInicio}>
          Volver a empezar
        </Boton>
      </div>
    </div>
  );
}
