"use client";

import Link from "next/link";

import { useState } from "react";
import { NodoTema, PuntoNodo, EtiquetaNodo } from "@/components/camino/NodoTema";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { aciertosPorContexto, estadoDeNodo, type EstadoNodo } from "@/lib/estadoNodo";
import { TOTAL_TEMAS } from "@/lib/temas";
import type { TemaDelCamino } from "@/lib/camino";

/**
 * El camino: una recta ascendente sobre el papel milimetrado que ya usa el
 * sitio, con los temas como puntos sobre ella.
 *
 * La metáfora no es decorativa. El módulo enseña funciones lineales, así que el
 * avance del estudiante se dibuja como la recta que está aprendiendo a leer:
 * ejes tenues, cuadrícula de fondo, puntos sobre la recta. Nada de mapa
 * isométrico ni de sendero serpenteante — ese vocabulario es de otro producto.
 *
 * En móvil la recta se endereza a vertical: una diagonal en 360px de ancho deja
 * los nodos apretados contra los bordes y el texto sin espacio. Mobile-first
 * (MASTER.md §5), así que la vertical es el caso base y la diagonal es la
 * mejora de escritorio.
 *
 * Isla de cliente: el estado de cada nodo depende del progreso del dispositivo.
 * Antes de hidratar pinta todo con el progreso vacío —el mismo HTML en servidor
 * y en el primer render— y se corrige después. Sin `suppressHydrationWarning` y
 * sin parpadeo de layout, porque el tamaño de los nodos no depende del estado.
 */
export function Camino({
  temasConNodo,
  temasSinContenido,
}: {
  temasConNodo: TemaDelCamino[];
  temasSinContenido: TemaDelCamino[];
}) {
  const montado = useMontado();
  const [expandido, setExpandido] = useState(false);

  const progreso = montado ? leer() : null;
  const aciertos = aciertosPorContexto(progreso);
  const estados: EstadoNodo[] = temasConNodo.map((t) => estadoDeNodo(t, progreso, aciertos));
  const completados = estados.filter((e) => e === "completado").length;

  const n = temasConNodo.length;
  /* Posición de cada punto sobre la recta, en porcentaje del lienzo. La recta
     va de abajo-izquierda a arriba-derecha; el primer tema es el origen. Con un
     solo nodo se centra en vez de dividir por cero. */
  const posicion = (i: number) =>
    n <= 1 ? { x: 50, y: 50 } : { x: 12 + (i * 72) / (n - 1), y: 86 - (i * 72) / (n - 1) };

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-ink-suave">
          Matemática M1 · Piloto privado
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
          Tu camino
        </h1>
        <p className="mt-2 text-base text-ink-suave">
          {/* Contador sobre el temario completo, no sobre lo que alcanzamos a
              construir: el estudiante ve el tamaño real del curso que rinde. */}
          <span className="font-mono tabular-nums">{completados}</span> de{" "}
          <span className="font-mono tabular-nums">{TOTAL_TEMAS}</span> unidades del temario M1
        </p>
      </header>

      {/* ---------- móvil: recta vertical ---------- */}
      <div className="fondo-cuadricula relative rounded-tarjeta border border-border p-4 sm:hidden">
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-[38px] top-8 w-0.5 -translate-x-1/2 bg-border-fuerte"
        />
        <ol className="relative space-y-3">
          {temasConNodo.map((tema, i) => (
            <li key={tema.id}>
              <NodoTema
                id={tema.id}
                nombre={tema.nombre}
                objetivo={tema.objetivo}
                ejeNombre={tema.ejeNombre}
                estado={estados[i]}
              />
            </li>
          ))}
        </ol>
      </div>

      {/* ---------- escritorio: recta ascendente con ejes ---------- */}
      <div className="fondo-cuadricula relative hidden overflow-hidden rounded-tarjeta border border-border sm:block">
        <div className="relative aspect-[16/10] w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            {/* Ejes tenues: contexto de plano cartesiano sin competir con los
                nodos. non-scaling-stroke evita que preserveAspectRatio="none"
                deforme el grosor de la línea. */}
            <path
              d="M8 6 V92 H96"
              stroke="var(--color-border-fuerte)"
              strokeWidth="1"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            {n > 1 && (
              <line
                x1={posicion(0).x}
                y1={posicion(0).y}
                x2={posicion(n - 1).x}
                y2={posicion(n - 1).y}
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {temasConNodo.map((tema, i) => {
            const { x, y } = posicion(i);
            /* La etiqueta se ancla al lado del punto y cambia de lado pasada la
               mitad del plano. Sin ese volteo, un nodo en la parte derecha
               empujaría su tarjeta fuera del contenedor y aparecería scroll
               horizontal — que es justo lo que no puede pasar en ninguna
               pantalla. */
            const aLaDerecha = x <= 50;
            return (
              <div key={tema.id}>
                {/* El punto, exactamente sobre la recta. */}
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <PuntoNodo estado={estados[i]} />
                </div>
                {/* La etiqueta, al lado. Es el destino clickeable; el punto es
                    decorativo y queda cubierto por el mismo enlace en móvil. */}
                <div
                  className="absolute w-60 -translate-y-1/2"
                  style={
                    aLaDerecha
                      ? { left: `calc(${x}% + 2rem)`, top: `${y}%` }
                      : { right: `calc(${100 - x}% + 2rem)`, top: `${y}%` }
                  }
                >
                  <EnlaceNodo id={tema.id} estado={estados[i]}>
                    <EtiquetaNodo
                      nombre={tema.nombre}
                      objetivo={tema.objetivo}
                      estado={estados[i]}
                      ejeNombre={tema.ejeNombre}
                    />
                  </EnlaceNodo>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- el resto del temario, colapsado ---------- */}
      {temasSinContenido.length > 0 && (
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            aria-expanded={expandido}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-tarjeta border border-border bg-surface px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span>
              <span className="block text-base font-medium text-ink">
                El resto del temario M1
              </span>
              {/* Sin fecha y sin "próximamente": no prometemos plazos que no
                  controlamos. */}
              <span className="block text-sm text-ink-suave">
                {temasSinContenido.length} unidades en construcción
              </span>
            </span>
            <span aria-hidden="true" className="text-ink-suave">
              {expandido ? "−" : "+"}
            </span>
          </button>
          {expandido && (
            <ul className="mt-3 space-y-2">
              {temasSinContenido.map((tema) => (
                <li
                  key={tema.id}
                  className="rounded-tarjeta border border-dashed border-border px-4 py-3"
                >
                  <span className="block text-xs font-medium uppercase tracking-wide text-ink-tenue">
                    {tema.ejeNombre}
                  </span>
                  <span className="block text-sm font-medium text-ink">{tema.nombre}</span>
                  <span className="block text-sm text-ink-suave">{tema.objetivo}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

/** Envoltorio de la etiqueta en escritorio: enlace cuando el tema es navegable,
 *  contenedor inerte cuando está en construcción. Mismo criterio que NodoTema
 *  en móvil — un tema sin contenido no lleva a ninguna parte. */
function EnlaceNodo({
  id,
  estado,
  children,
}: {
  id: string;
  estado: EstadoNodo;
  children: React.ReactNode;
}) {
  const clases =
    "flex min-h-11 w-full rounded-tarjeta bg-surface/95 p-3 text-left shadow-tarjeta backdrop-blur-[2px]";
  if (estado === "enConstruccion") {
    return (
      <div className={`${clases} cursor-default`} aria-disabled="true">
        {children}
      </div>
    );
  }
  return (
    <Link
      href={`/tema/${id}`}
      className={`${clases} motion-safe:transition-shadow hover:shadow-tarjeta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {children}
    </Link>
  );
}
