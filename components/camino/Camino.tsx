"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { NodoTema, PuntoNodo, EtiquetaNodo } from "@/components/camino/NodoTema";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { avanceDeTema, estadoDeNodo, resumirRespuestas, type EstadoNodo } from "@/lib/estadoNodo";
import { posicionEnRecta, extremosDeLaRecta } from "@/lib/geometriaCamino";
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
 * **El origen va abajo.** En los dos anchos el recorrido empieza en la esquina
 * inferior izquierda y sube: es un plano cartesiano de verdad, no una lista.
 * En escritorio eso ya lo daba `posicionEnRecta`; en móvil hace falta
 * `flex-col-reverse`, porque una lista en orden de documento pinta el primer
 * tema arriba y deja el camino leyéndose al revés de lo que enseña.
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
  const resumen = resumirRespuestas(progreso);
  const estados: EstadoNodo[] = temasConNodo.map((t) => estadoDeNodo(t, progreso, resumen));
  const avances = temasConNodo.map((t) => avanceDeTema(t, progreso));
  const completados = estados.filter((e) => e === "completado").length;

  const n = temasConNodo.length;
  const posicion = (i: number) => posicionEnRecta(i, n);
  const { desde, hasta } = extremosDeLaRecta(n);

  /* Dónde está parado el estudiante: lo empezado manda sobre lo que todavía no
     abre. Si no hay ninguno de los dos —todo completado o todo en obra— no hay
     a qué llevar el scroll y se deja donde el navegador lo puso. */
  const indiceActivo = (() => {
    const enCurso = estados.indexOf("enCurso");
    if (enCurso !== -1) return enCurso;
    const disponible = estados.indexOf("disponible");
    return disponible !== -1 ? disponible : null;
  })();

  /* Un ref por variante: móvil y escritorio montan los dos árboles y ocultan
     uno con CSS, así que hay que llevar el scroll al que efectivamente se está
     viendo. `offsetParent === null` es la forma barata de preguntarlo sin medir
     nada (`display:none` no tiene offsetParent). */
  const nodoActivoMovil = useRef<HTMLLIElement>(null);
  const nodoActivoEscritorio = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (indiceActivo === null) return;
    const movil = nodoActivoMovil.current;
    const escritorio = nodoActivoEscritorio.current;
    const nodo = movil && movil.offsetParent !== null ? movil : escritorio;
    if (!nodo || nodo.offsetParent === null) return;
    // Solo si la página realmente desborda: en un camino corto el scroll no
    // tiene a dónde ir y llamarlo igual roba el foco de lectura del encabezado.
    if (document.documentElement.scrollHeight <= window.innerHeight) return;
    /* Instantáneo a propósito. Un scroll animado al cargar es justo el
       movimiento decorativo que MASTER.md §2.6 descarta, y siendo instantáneo
       no hay nada que apagar bajo prefers-reduced-motion. */
    nodo.scrollIntoView({ block: "center", behavior: "auto" });
  }, [indiceActivo]);

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

      {/* ---------- móvil: recta vertical, con el origen abajo ---------- */}
      <div className="fondo-cuadricula relative rounded-tarjeta border border-border p-4 sm:hidden">
        {/* La recta como SVG y no como <div>: un borde de CSS no tiene trazo
            que animar, y este es el mismo gesto de dibujado que la celebración
            de tema. preserveAspectRatio="none" la estira al alto que tenga la
            lista sin deformar el grosor (non-scaling-stroke). */}
        <svg
          aria-hidden="true"
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-8 left-[38px] top-8 w-0.5 -translate-x-1/2"
        >
          <line
            x1="1"
            y1="100"
            x2="1"
            y2="0"
            stroke="var(--color-border-fuerte)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* `flex-col-reverse` invierte la pintura, no el DOM: el orden de
            lectura y de tabulación sigue siendo el del curso, que ahora además
            coincide con lo que se ve (de abajo hacia arriba). Invertir el array
            en cambio dejaría el orden semántico al revés. */}
        <ol className="relative flex flex-col-reverse gap-3">
          {temasConNodo.map((tema, i) => (
            <li key={tema.id} ref={i === indiceActivo ? nodoActivoMovil : undefined}>
              <NodoTema
                id={tema.id}
                nombre={tema.nombre}
                objetivo={tema.objetivo}
                ejeNombre={tema.ejeNombre}
                estado={estados[i]}
                avance={avances[i]}
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
                x1={desde.x}
                y1={desde.y}
                x2={hasta.x}
                y2={hasta.y}
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* El cero en el vértice de los ejes. Sin él la recta se lee como una
              diagonal decorativa; con él, el camino se declara plano cartesiano
              y el estudiante ubica de dónde parte. */}
          <span
            aria-hidden="true"
            className="absolute left-[8%] top-[92%] -translate-x-[150%] font-mono text-xs tabular-nums text-ink-tenue"
          >
            0
          </span>

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
                {/* El punto, exactamente sobre la recta. Es el que lleva el ref
                    del nodo activo: el envoltorio no sirve, porque sus dos
                    hijos son absolutos y queda con alto 0 al inicio del
                    contenedor. */}
                <div
                  ref={i === indiceActivo ? nodoActivoEscritorio : undefined}
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
                      avance={avances[i]}
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
