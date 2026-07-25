import type { Metadata } from "next";
import Link from "next/link";
import { idsDelCamino, obtenerLeccion, esPublicable } from "@/lib/contenido";
import { PuntoDePartida, type LeccionDelCamino } from "@/components/PuntoDePartida";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Dónde empezar o seguir el camino de funciones lineales y afines.",
};

/**
 * Punto de partida tras entrar (con o sin cuenta). Server component: lee el
 * camino del disco con lib/contenido.ts y le pasa a la isla de cliente solo lo
 * que necesita para decidir el CTA — id, título, minutos y si está abierta.
 * El estado del estudiante lo resuelve el cliente, porque vive en memoria de
 * sesión (ver components/PuntoDePartida.tsx).
 *
 * / se queda como hero público y no rebota acá; el enlace "ver todo el camino"
 * mantiene /lecciones como índice completo.
 */
export default function Inicio() {
  const lecciones: LeccionDelCamino[] = idsDelCamino()
    .map(obtenerLeccion)
    .map((leccion) => ({
      id: leccion.id,
      titulo: leccion.titulo,
      minutos: leccion.tiempoEstimadoMin,
      publicable: esPublicable(leccion),
    }));

  return (
    <div className="min-h-full flex-1 px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wide text-ink-suave">
          Matemática M1 · Piloto privado
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
          Tu punto de partida
        </h1>
        <div className="mt-8">
          <PuntoDePartida lecciones={lecciones} />
        </div>
        <p className="mt-6 text-sm leading-6 text-ink-suave">
          <Link
            href="/lecciones"
            className="font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Ver todo el camino
          </Link>{" "}
          — las tres lecciones del módulo y en qué estado está cada una.
        </p>
      </div>
    </div>
  );
}
