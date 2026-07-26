"use client";

import Link from "next/link";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { ChipLeccionCompletada } from "@/components/ChipLeccionCompletada";
import { COPY_EN_PREPARACION } from "@/components/camino/NodoTema";
import { presentacionDeLeccion } from "@/lib/descripcionesLecciones";
import type { TemaDelCamino } from "@/lib/camino";

function ChipEnPreparacion() {
  return (
    <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-medium text-ink-suave ring-1 ring-inset ring-border">
      En preparación
    </span>
  );
}

/**
 * Segundo nivel del camino: las lecciones de un tema, en orden de curso, más su
 * cierre si lo tiene.
 *
 * Reusa `Tarjeta` y `presentacionDeLeccion` —las ilustraciones y descripciones
 * por lección que ya existían para la grilla retirada— en vez de inventar una
 * presentación nueva. Lo que cambia es el nivel en que aparecen: antes eran
 * todas las lecciones sueltas, ahora son las de este tema.
 */
export function DetalleTema({ tema }: { tema: TemaDelCamino }) {
  const total = tema.lecciones.length;

  return (
    <div className="min-h-full flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/camino"
          className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Volver al camino
        </Link>

        <header className="mt-2">
          <p className="text-sm font-medium uppercase tracking-wide text-ink-tenue">
            {tema.ejeNombre}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
            {tema.nombre}
          </h1>
          <p className="mt-2 text-base leading-7 text-ink-suave">{tema.objetivo}</p>
        </header>

        <ul className="mt-8 space-y-4">
          {tema.lecciones.map((leccion, i) => {
            const { descripcion, Ilustracion } = presentacionDeLeccion(leccion.id);
            const ordinal = `Lección ${i + 1} de ${total}`;

            if (!leccion.publicable) {
              return (
                <li key={leccion.id}>
                  <Tarjeta
                    ilustracion={<Ilustracion />}
                    titulo={leccion.titulo}
                    descripcion={COPY_EN_PREPARACION}
                    meta={ordinal}
                    indicador={<ChipEnPreparacion />}
                    inactiva
                  />
                </li>
              );
            }

            return (
              <li key={leccion.id}>
                <Tarjeta
                  href={`/leccion/${leccion.id}`}
                  ilustracion={<Ilustracion />}
                  titulo={leccion.titulo}
                  descripcion={descripcion}
                  meta={`${ordinal} · ${leccion.minutos} min aprox.`}
                  indicador={<ChipLeccionCompletada leccionId={leccion.id} />}
                />
              </li>
            );
          })}
        </ul>

        {/* El cierre no es una lección: es `tipo: "cierre"` y vive en su propia
            ruta. Aparece acá porque es donde termina el tema, pero se presenta
            aparte para no sugerir que es una lección más. */}
        {tema.cierreId && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Cierre del tema
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-suave">
              {tema.cierrePublicable
                ? "Ocho preguntas formato PAES sobre todo el tema. Al terminarlo comparamos con tu diagnóstico."
                : "Ocho preguntas formato PAES. Todavía en revisión: hoy se muestra como demostración."}
            </p>
            <Link
              href="/cierre"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ir al cierre del tema
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
