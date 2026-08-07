"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EnlaceBoton } from "@/components/ui/Boton";
import { PuntoNodo } from "@/components/camino/NodoTema";
import { IlustracionTema } from "@/lib/ilustracionesTemas";
import { leer, marcarTemaCelebrado } from "@/lib/progresoLocal";
import { temasCompletados } from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import { TOTAL_TEMAS } from "@/lib/modulos";
import type { TemaDelCamino } from "@/lib/camino";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";

/**
 * Guion de tiempos de la celebración. Un solo lugar, en orden de lectura, para
 * que la secuencia se pueda ajustar sin ir a buscar números sueltos por el JSX.
 *
 * El trazo tarda 900ms (`.trazo-camino` en globals.css) y todo lo demás entra
 * después: primero se completa el camino, recién entonces se dice qué pasó.
 */
const RETRASO = {
  nodo: 900,
  titulo: 1100,
  datos: 1400,
  boton: 1700,
} as const;

/**
 * El trazo del camino completándose, con el nodo del tema al final.
 *
 * Es la misma recta ascendente de /camino, dibujada de una pasada: el gesto de
 * cierre es ver la recta que se venía construyendo llegar hasta arriba, y el
 * punto que la remata es el mismo nodo de siempre, ahora completado.
 *
 * Sin confeti a propósito. El confeti celebra el evento; la recta celebra lo
 * aprendido, que es lo que el estudiante vino a buscar.
 */
function TrazoCompletandose() {
  return (
    /* El contenedor lleva la misma relación de aspecto que el viewBox (100×60)
       y el svg lo llena. Sin eso, `preserveAspectRatio` centra el dibujo con
       bandas a los lados y las coordenadas del viewBox dejan de mapear a
       porcentajes del contenedor — el nodo quedaba flotando lejos del extremo
       de la recta en vez de rematarla. */
    <div className="relative mx-auto aspect-[100/60] w-full max-w-md">
      <svg viewBox="0 0 100 60" aria-hidden="true" className="h-full w-full" fill="none">
        <path
          d="M8 4 V52 H94"
          stroke="var(--color-border-fuerte)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M8 52 L88 10"
          stroke="var(--color-success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="trazo-camino"
        />
      </svg>
      {/* El nodo real, no un <circle> genérico: el estudiante tiene que
          reconocer el mismo punto que venía mirando en el camino, ahora en
          verde. Va posicionado sobre el extremo de la recta (88, 10) del
          viewBox 100×60. */}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "88%", top: `${(10 / 60) * 100}%` }}
      >
        {/* La animación va en el hijo: `entra-en-secuencia` anima transform, que
            es lo mismo que usa el centrado del padre. Juntos, el keyframe pisa
            la posición. */}
        <span
          className="entra-en-secuencia block"
          style={{ ["--retraso" as string]: `${RETRASO.nodo}ms` }}
        >
          <PuntoNodo estado="completado" meta />
        </span>
      </span>
    </div>
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
      registrarEvento({ nombre: "tema_celebrado", props: { tema_id: tema.id } });
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
    <PantallaCentrada>
      <div className="w-full max-w-2xl text-center">
        <TrazoCompletandose />

        {/* El rótulo chico y el nombre enorme, no al revés: lo memorable es qué
            tema terminó, no la palabra "completado". Escala `display` de
            MASTER.md §2.2, que hasta ahora ninguna pantalla usaba. */}
        <div
          className="entra-en-secuencia mt-10"
          style={{ ["--retraso" as string]: `${RETRASO.titulo}ms` }}
        >
          <p className="text-sm font-medium uppercase tracking-wide text-ink-suave">
            Tema completado
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
            {tema.nombre}
          </h1>
        </div>

        <div
          className="entra-en-secuencia"
          style={{ ["--retraso" as string]: `${RETRASO.datos}ms` }}
        >
          <div aria-hidden="true" className="mx-auto mt-10 w-full max-w-xs sm:max-w-sm">
            <IlustracionTema temaId={tema.id} />
          </div>

          {/* La capacidad, no el puntaje: lo que el estudiante ya puede hacer. */}
          <p className="mx-auto mt-8 max-w-lg text-xl leading-9 text-ink-suave">
            {tema.capacidad}
          </p>

          <p className="mt-8 text-sm text-ink-suave">
            <span className="num">{completados}</span> de{" "}
            <span className="num">{TOTAL_TEMAS}</span> unidades del
            temario M1
          </p>
        </div>

        <div
          className="entra-en-secuencia mt-10 flex justify-center"
          style={{ ["--retraso" as string]: `${RETRASO.boton}ms` }}
        >
          <EnlaceBoton href="/camino" className="text-lg">
            Volver al camino
          </EnlaceBoton>
        </div>
      </div>
    </PantallaCentrada>
  );
}
