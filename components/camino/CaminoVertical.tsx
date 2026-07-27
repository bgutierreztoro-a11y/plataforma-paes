"use client";

import { useState } from "react";
import { EnlaceBoton } from "@/components/ui/Boton";
import { PuntoNodo } from "@/components/camino/NodoTema";
import {
  ANCHO_CANALETA,
  ANCHO_COLUMNA,
  altoDeFila,
  desplazamientoDeNodo,
  desplazamientoVertical,
  retrasoDeEntrada,
} from "@/lib/geometriaCamino";
import type { EstadoNodo } from "@/lib/estadoNodo";

/**
 * Un nodo del camino, en cualquiera de los dos niveles.
 *
 * Lo que va **junto al disco** es solo `titulo`. Todo lo demás vive en la
 * tarjeta, y la tarjeta es una sola: la del nodo activo.
 */
export interface NodoCamino {
  id: string;
  /** Corto. Es lo único que se lee sin tocar nada, así que compite con los
   *  otros cinco títulos de la pantalla, no consigo mismo. */
  titulo: string;
  /** Título dentro de la tarjeta, cuando repetir `titulo` sería redundante con
   *  el rótulo. Lo usa el cierre: su rótulo ya dice "Cierre del tema", así que
   *  la tarjeta nombra el tema. */
  tituloTarjeta?: string;
  estado: EstadoNodo;
  /** El cierre del tema: disco más grande y contorno doble. */
  meta?: boolean;
  /** Destino de la acción. Ausente = el nodo no lleva a ninguna parte. */
  href?: string;
  /** Texto del botón. Dice qué pasa, no "OK" (MASTER.md §3.1). */
  accion?: string;
  /** Línea superior de la tarjeta: el eje, o el rótulo del cierre. */
  rotulo?: string;
  descripcion?: string;
  /** "N de M lecciones". Ya formateado: el camino no sabe qué se cuenta. */
  contador?: string;
  demostracion?: boolean;
}

/**
 * El camino, en columna y hacia abajo.
 *
 * **Por qué baja (enmienda del 2026-07-27).** Antes subía, sobre una recta
 * ascendente, porque el módulo enseña funciones lineales. Se revirtió tras
 * probarlo en un teléfono real: la progresión peleaba con el orden de lectura y
 * con el scroll. Ninguna app de aprendizaje sube. La metáfora de la función
 * vive en el contenido de las lecciones; la dirección del recorrido es
 * ergonomía, no didáctica. Se conservan el papel milimetrado y el trazo que une
 * los nodos.
 *
 * **Una sola implementación para los dos tamaños.** No hay árbol de móvil y
 * árbol de escritorio: hay una columna centrada de ancho máximo fijo. El
 * escritorio no necesita otro layout, necesita no estirarse. Lo único que
 * cambia con el ancho es dónde se ancla la tarjeta —al pie de la pantalla en
 * móvil, colgando del nodo en escritorio— y el tamaño de los discos.
 *
 * **Los nodos no arrastran tarjeta.** Cada uno es un disco y un título; el
 * detalle completo aparece una sola vez, para el nodo activo, y se mueve al
 * tocar otro. Antes cada nodo llevaba eje, descripción, contador y chip, y en
 * 360px eso dejaba dos nodos y medio en pantalla.
 */
export function CaminoVertical({
  nodos,
  indiceActivo,
}: {
  nodos: NodoCamino[];
  /** Dónde está parado el estudiante. La tarjeta arranca acá y sigue a este
   *  índice mientras nadie toque otro nodo — que es lo que hace que el estado
   *  llegue bien después de hidratar, sin un efecto que lo sincronice. */
  indiceActivo: number;
}) {
  const [elegido, setElegido] = useState<number | null>(null);

  const seleccionable = (n: NodoCamino) => n.estado !== "enConstruccion";
  /* Un nodo en construcción nunca queda seleccionado, ni siquiera si el índice
     activo apunta ahí: no tiene tarjeta que mostrar. */
  const indice =
    elegido !== null && seleccionable(nodos[elegido])
      ? elegido
      : nodos.findIndex(seleccionable) === -1
        ? -1
        : seleccionable(nodos[indiceActivo] ?? nodos[0])
          ? indiceActivo
          : nodos.findIndex(seleccionable);

  const activo = indice >= 0 ? nodos[indice] : undefined;

  /* Las posiciones se calculan una vez, acá, y se reparten. Que el disco, el
     trazo que llega a él y el ancla de la tarjeta salgan del mismo número es lo
     que hace que el trazo toque el centro del disco en vez de pasar cerca. */
  const metas = nodos.map((n) => n.meta === true);
  const equis = nodos.map((n, i) => desplazamientoDeNodo(i, n.meta));

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: ANCHO_COLUMNA }}
    >
      <ol className="relative">
        {nodos.map((nodo, i) => (
          <FilaCamino
            key={nodo.id}
            nodo={nodo}
            indice={i}
            x={equis[i]}
            xAnterior={i > 0 ? equis[i - 1] : undefined}
            alto={altoDeFila(metas[i])}
            altoAnterior={i > 0 ? altoDeFila(metas[i - 1]) : 0}
            seleccionado={i === indice}
            onSeleccionar={() => setElegido(i)}
          />
        ))}
      </ol>

      {/* **Una sola tarjeta**, reposicionada por CSS.
          - Móvil: fija al pie. `bottom-14` libra la barra de navegación, que
            mide 56px y también es fija.
          - Escritorio: cuelga del borde **inferior** de la fila del nodo activo,
            como el globo de un mapa. Anclarla ahí y no unos píxeles más arriba
            es lo que hace que tape enteros los títulos de abajo —que es lo que
            hace un panel flotante— en vez de cortar por la mitad el título del
            propio nodo activo.

          El anclaje viaja por variable CSS y no por `style.top` directo porque
          `top` inline aplicaría también en móvil, donde la tarjeta es `fixed`
          con `bottom`: tener las dos la estiraría de punta a punta.

          Se renderiza **una vez y no una por tamaño**. La primera versión
          montaba dos y las alternaba con `sm:hidden`: eso deja el mismo texto
          dos veces en el DOM, dos regiones `aria-live` anunciando lo mismo, y
          lo delató un test que encontró dos "Demostración" donde el estudiante
          ve una. */}
      {activo && (
        <aside
          aria-live="polite"
          className="fixed inset-x-0 bottom-14 z-30 px-4 pb-4 sm:absolute sm:bottom-auto sm:left-[var(--canaleta)] sm:right-0 sm:top-[var(--anclaje)] sm:px-0 sm:pb-0"
          style={
            {
              "--anclaje": `${desplazamientoVertical(metas, indice)}px`,
              "--canaleta": `${ANCHO_CANALETA}px`,
            } as React.CSSProperties
          }
        >
          <TarjetaActivo nodo={activo} />
        </aside>
      )}

      {/* Reserva para que la tarjeta de escritorio no se salga del contenedor
          cuando el nodo activo es el último. */}
      <div aria-hidden="true" className="hidden h-44 sm:block" />
    </div>
  );
}

/**
 * Una fila: el trazo hacia el nodo anterior, el disco y el título.
 *
 * El alto es fijo (`PASO_FILA`) y no depende del contenido. Es lo que permite
 * dibujar el trazo con geometría conocida y anclar la tarjeta sin medir nada en
 * el navegador.
 */
function FilaCamino({
  nodo,
  indice,
  x,
  xAnterior,
  alto,
  altoAnterior,
  seleccionado,
  onSeleccionar,
}: {
  nodo: NodoCamino;
  indice: number;
  x: number;
  xAnterior?: number;
  alto: number;
  altoAnterior: number;
  seleccionado: boolean;
  onSeleccionar: () => void;
}) {
  const enConstruccion = nodo.estado === "enConstruccion";

  return (
    <li className="relative flex items-center" style={{ height: alto }}>
      {/* El tramo de trazo que llega desde el nodo de arriba. Va por fila y no
          uno solo para todo el camino porque con el zigzag cada tramo tiene su
          propia inclinación.

          Va del centro de la fila anterior al centro de esta, y por eso necesita
          los dos altos: la fila del cierre es más alta que las demás y suponer
          que todas miden igual dejaba el tramo corto justo ahí.

          `preserveAspectRatio="none"` lo estira sin que haya que calcular la
          inclinación, y `non-scaling-stroke` evita que ese estirón deforme el
          grosor. Ojo con el dash: ese modo resuelve el trazado en píxeles de
          pantalla, no en unidades del viewBox (ver .trazo-camino en
          globals.css). */}
      {xAnterior !== undefined && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0"
          style={{
            width: ANCHO_CANALETA,
            top: -altoAnterior / 2,
            height: altoAnterior / 2 + alto / 2,
          }}
        >
          <line
            x1={xAnterior}
            y1="0"
            x2={x}
            y2="100"
            stroke="var(--color-border-fuerte)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="trazo-camino"
          />
        </svg>
      )}

      {/* El disco. Posición y animación en elementos distintos: `entra-nodo`
          anima `transform`, que es lo mismo que usa el centrado, y juntos el
          keyframe pisa la posición. */}
      <span
        className="absolute z-10 -translate-x-1/2"
        style={{ left: `calc(${ANCHO_CANALETA}px * ${x} / 100)` }}
      >
        <span
          className="entra-nodo block"
          style={{ animationDelay: `${retrasoDeEntrada(indice)}ms` }}
        >
          <PuntoNodo estado={nodo.estado} meta={nodo.meta} />
        </span>
      </span>

      {/* El título, al costado. No se desplaza con el zigzag: si el texto
          bailara, la columna dejaría de leerse como columna.

          A dos líneas como máximo. La fila tiene alto fijo, así que un título de
          tres líneas —"Ecuaciones e inecuaciones de primer grado" ya llega—
          desborda hacia la fila de al lado. El nombre completo no se pierde: es
          el título de la tarjeta en cuanto el nodo queda activo. */}
      {enConstruccion ? (
        <span
          className="line-clamp-2 min-w-0 flex-1 text-base font-medium leading-snug text-ink-tenue"
          style={{ marginLeft: ANCHO_CANALETA }}
        >
          {nodo.titulo}
        </span>
      ) : (
        <button
          type="button"
          onClick={onSeleccionar}
          aria-current={seleccionado ? "true" : undefined}
          className={`z-10 line-clamp-2 min-h-11 min-w-0 flex-1 rounded-tarjeta px-2 py-3 text-left text-base font-semibold leading-snug motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            seleccionado ? "text-accent-fuerte" : "text-ink hover:text-accent"
          }`}
          style={{ marginLeft: ANCHO_CANALETA }}
        >
          {nodo.titulo}
        </button>
      )}
    </li>
  );
}

/**
 * La única tarjeta de la pantalla: la del nodo activo.
 *
 * Compacta a propósito. En móvil va fija al pie y cada píxel que ocupa es un
 * píxel menos de recorrido visible: con 210px de alto entraban 5 nodos en una
 * pantalla de 800, con ~150px entran 6. Por eso la descripción se recorta a dos
 * líneas en vez de crecer sin techo — el texto completo del tema ya vive en la
 * tarjeta de /camino, que es donde el estudiante decide si entrar.
 */
function TarjetaActivo({ nodo }: { nodo: NodoCamino }) {
  return (
    <div className="rounded-tarjeta border border-border bg-surface p-3 shadow-tarjeta-hover">
      {nodo.rotulo && (
        <p className="text-xs font-medium uppercase tracking-wide text-ink-tenue">
          {nodo.rotulo}
        </p>
      )}
      <p className="mt-0.5 text-base font-semibold leading-snug text-ink">
        {nodo.tituloTarjeta ?? nodo.titulo}
      </p>
      {nodo.descripcion && (
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-suave">
          {nodo.descripcion}
        </p>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {nodo.href && nodo.accion && (
          <EnlaceBoton href={nodo.href}>{nodo.accion}</EnlaceBoton>
        )}
        {nodo.contador && (
          <span className="text-sm text-ink-suave">{nodo.contador}</span>
        )}
        {nodo.demostracion && (
          <span className="rounded-full bg-accent-suave px-2.5 py-0.5 text-xs font-medium text-accent-fuerte">
            Demostración
          </span>
        )}
      </div>
    </div>
  );
}
