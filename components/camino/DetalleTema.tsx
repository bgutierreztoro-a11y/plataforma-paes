"use client";

import Link from "next/link";
import { CaminoLecciones } from "@/components/camino/CaminoLecciones";
import { IlustracionTema } from "@/lib/ilustracionesTemas";
import type { TemaDelCamino } from "@/lib/camino";

/**
 * Segundo nivel del camino: las lecciones de un tema, en orden de curso, más su
 * cierre si lo tiene.
 *
 * Antes esto era una lista de tarjetas sueltas y el cierre colgaba de un
 * enlace subrayado al pie. Dos problemas: el tema por dentro no se parecía en
 * nada al camino que lo contiene, y la meta del tema —lo único que lo cierra—
 * era el elemento con menos peso visual de la pantalla. Ahora es el mismo trazo
 * de /camino con los mismos nodos, y el cierre es su último punto.
 */
export function DetalleTema({ tema }: { tema: TemaDelCamino }) {
  return (
    <div className="min-h-full flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/camino"
          className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Volver al camino
        </Link>

        {/* La ilustración del tema al lado del título, no encima: es una figura
            de apoyo y no puede empujar el nombre del tema fuera de la primera
            pantalla. En 360px se apila debajo. */}
        <header className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-wide text-ink-tenue">
              {tema.ejeNombre}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
              {tema.nombre}
            </h1>
            <p className="mt-2 text-base leading-7 text-ink-suave">{tema.objetivo}</p>
          </div>
          <div aria-hidden="true" className="w-40 shrink-0 self-start sm:w-48 sm:self-center">
            <IlustracionTema temaId={tema.id} />
          </div>
        </header>

        <div className="mt-8">
          <CaminoLecciones tema={tema} />
        </div>
      </div>
    </div>
  );
}
