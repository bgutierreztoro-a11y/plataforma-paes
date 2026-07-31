"use client";

import Link from "next/link";
import { CaminoLecciones } from "@/components/camino/CaminoLecciones";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { avanceDeTema } from "@/lib/estadoNodo";
import type { TemaDelCamino } from "@/lib/camino";

/**
 * Segundo nivel del camino: las lecciones de un tema y su cierre.
 *
 * **Encabezado fijo (2026-07-27).** Antes el encabezado llevaba el eje, el
 * nombre, el objetivo completo y un enlace de volver, y ocupaba casi media
 * pantalla de 360px antes de que apareciera el primer nodo. Ahora es una franja
 * compacta que se queda arriba mientras se recorre: el estudiante siempre sabe
 * en qué tema está sin gastar el alto una sola vez al principio.
 *
 * El objetivo del tema salió de acá. No se pierde: es la descripción de la
 * tarjeta del nodo en /camino, que es donde el estudiante decide si entrar.
 */
export function DetalleTema({ tema }: { tema: TemaDelCamino }) {
  const montado = useMontado();
  const avance = montado ? avanceDeTema(tema, leer()) : { hechas: 0, total: tema.lecciones.length };

  return (
    <div className="min-h-full flex-1">
      {/* El tope sale de `--tope-nav`: 0 en móvil, donde la barra de navegación
          va abajo, y 3.25rem en escritorio, donde la barra se pega arriba y la
          franja tiene que quedar justo debajo en vez de tapada.

          Antes ese 3.25rem estaba escrito acá a mano. Desde que /camino apila
          dos capas pegadas —su franja y las bandas de eje, que se suman con
          `calc`— el número vive en una variable, y tenerlo repetido en dos
          archivos es pedir que se separen el día que la barra cambie de alto. */}
      <header
        className="sticky z-20 border-b border-border bg-surface/95 backdrop-blur-sm"
        style={{ top: "var(--tope-nav)" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-2 sm:px-6">
          <Link
            href="/camino"
            aria-label="Volver al camino"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-tarjeta text-lg text-accent hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-tenue">
              {tema.ejeNombre}
            </p>
            <h1 className="truncate text-base font-semibold tracking-tight text-ink sm:text-lg">
              {tema.nombre}
            </h1>
          </div>
          <p className="shrink-0 text-sm text-ink-suave">
            <span className="font-mono tabular-nums">{avance.hechas}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono tabular-nums">{avance.total}</span>
            <span className="sr-only">
              {" "}
              lecciones completadas de {avance.total}
            </span>
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
        <CaminoLecciones tema={tema} />
      </div>
    </div>
  );
}
