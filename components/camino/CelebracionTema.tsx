"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EnlaceBoton } from "@/components/ui/Boton";
import { leer, marcarTemaCelebrado } from "@/lib/progresoLocal";
import { temasCompletados } from "@/lib/estadoNodo";
import { TOTAL_TEMAS } from "@/lib/temas";
import type { TemaDelCamino } from "@/lib/camino";

/**
 * El trazo del camino completándose. Es la misma recta ascendente de /camino,
 * dibujada de una pasada: el gesto de cierre es ver la recta que se venía
 * construyendo llegar hasta arriba.
 *
 * Sin confeti a propósito. El confeti celebra el evento; la recta celebra lo
 * aprendido, que es lo que el estudiante vino a buscar.
 */
function TrazoCompletandose() {
  return (
    <svg
      viewBox="0 0 100 60"
      aria-hidden="true"
      className="mx-auto h-24 w-full max-w-sm"
      fill="none"
    >
      <path
        d="M8 4 V52 H94"
        stroke="var(--color-border-fuerte)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8 52 L92 8"
        pathLength={1}
        stroke="var(--color-success)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="trazo-camino"
      />
      <circle cx="92" cy="8" r="4" fill="var(--color-success)" className="punto-final" />
    </svg>
  );
}

/**
 * Celebración de tema: pantalla completa, una sola vez.
 *
 * La idempotencia la resuelve `marcarTemaCelebrado`, que devuelve `true` solo
 * la primera vez. Si alguien vuelve a esta URL —recarga, botón atrás, enlace
 * guardado— se va al camino en vez de repetir la celebración. El efecto corre
 * una vez por montaje y el `ref` evita que el modo estricto de desarrollo, que
 * monta dos veces, la consuma antes de mostrarla.
 *
 * Paleta clara. El tema oscuro está fuera de alcance y una pantalla oscura acá
 * rompería con el resto del producto.
 */
export function CelebracionTema({
  tema,
  temasConNodo,
}: {
  tema: TemaDelCamino;
  /* Todos los temas con nodo, para contar cuántos van completados. El número se
     deriva del progreso real; escribirlo a mano sería inventar avance. */
  temasConNodo: TemaDelCamino[];
}) {
  const router = useRouter();
  const [mostrar, setMostrar] = useState(false);
  const [completados, setCompletados] = useState(0);
  const resuelto = useRef(false);

  useEffect(() => {
    if (resuelto.current) return;
    resuelto.current = true;
    if (marcarTemaCelebrado(tema.id)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe tras montar; es la lectura inicial, no una sincronización de props
      setCompletados(temasCompletados(temasConNodo, leer()));
      setMostrar(true);
    } else {
      router.replace("/camino");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- corre una sola vez por montaje; el ref ya protege la idempotencia
  }, [tema.id, router]);

  // Antes de resolver no se pinta nada: mostrar la celebración y después
  // esconderla sería peor que un instante en blanco.
  if (!mostrar) return null;

  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <TrazoCompletandose />

        <p className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-suave">
          Tema completado
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{tema.nombre}</h1>

        {/* La capacidad, no el puntaje: lo que el estudiante ya puede hacer. */}
        <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-ink-suave">
          {tema.capacidad}
        </p>

        <p className="mt-8 text-sm text-ink-suave">
          <span className="font-mono tabular-nums">{completados}</span> de{" "}
          <span className="font-mono tabular-nums">{TOTAL_TEMAS}</span> unidades del temario M1
        </p>

        <div className="mt-8 flex justify-center">
          <EnlaceBoton href="/camino">Volver al camino</EnlaceBoton>
        </div>
      </div>
    </div>
  );
}
