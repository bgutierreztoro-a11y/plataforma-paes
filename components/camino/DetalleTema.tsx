"use client";

import Link from "next/link";
import { CaminoLecciones } from "@/components/camino/CaminoLecciones";
import {
  ContadorDePantalla,
  TituloDePantalla,
} from "@/components/navegacion/EncabezadoPantalla";
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
          va abajo, y el alto real de la barra en escritorio, donde se pega
          arriba y la franja tiene que quedar justo debajo en vez de tapada. El
          número no se escribe: se deriva de las clases de la barra, en
          app/globals.css.

          Antes había un `3.25rem` escrito acá a mano. Desde que /camino apila
          dos capas pegadas —su franja y las bandas de eje, que se suman con
          `calc`— el número vive en una variable, y tenerlo repetido en dos
          archivos es pedir que se separen el día que la barra cambie de alto. */}
      <header
        className="sticky z-20 border-b border-border bg-surface/80 backdrop-blur-md"
        style={{ top: "var(--tope-nav)" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-2 sm:px-6">
          <Link
            href="/camino"
            aria-label="Volver al camino"
            className="-ml-2 flex min-h-11 min-w-11 items-center justify-center rounded-tarjeta text-lg text-ink-suave motion-safe:transition-colors motion-reduce:transition-none hover:bg-accent-suave hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            ←
          </Link>
          <TituloDePantalla rotulo={tema.ejeNombre} titulo={tema.nombre} />
          <ContadorDePantalla
            hechas={avance.hechas}
            total={avance.total}
            descripcion={`lecciones completadas de ${avance.total}`}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
        <CaminoLecciones tema={tema} />
      </div>
    </div>
  );
}
