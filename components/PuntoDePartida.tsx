"use client";

import { EnlaceBoton } from "@/components/ui/Boton";
import { esLeccionCompletada } from "@/lib/progresoSesion";
import { useMontado } from "@/lib/useMontado";

/** Lo mínimo que el cliente necesita de cada lección del camino. La página de
 *  servidor lo arma con lib/contenido.ts: acá no se lee contenido del disco ni
 *  se serializa una lección completa. */
export interface LeccionDelCamino {
  id: string;
  titulo: string;
  minutos: number;
  publicable: boolean;
}

/**
 * Punto de partida de /inicio: una sola decisión, "¿qué hago ahora?", resuelta
 * con lo que ya existe.
 *
 * El progreso vive en memoria de módulo (lib/progresoSesion.ts) y muere al
 * recargar: eso es una decisión de privacidad tomada, no un bug. Consecuencia
 * asumida y visible acá: un estudiante con cuenta puede volver, seguir con
 * sesión de Clerk iniciada, y ver igual el arranque de la rama 1. Por eso el
 * copy de las tres ramas es neutro respecto a la memoria — no dice "de vuelta",
 * no saluda distinto al que ya estuvo, y nunca afirma que algo quedó guardado.
 * Un estudiante que ve la rama 1 no debe poder concluir que perdió algo.
 *
 * Isla de cliente porque `esLeccionCompletada` solo tiene sentido después de
 * hidratar; antes de eso renderiza la rama 1 (mismo HTML en servidor y en el
 * primer render de cliente, sin mismatch de hidratación) y recién después se
 * corrige a la rama que corresponda. Cero tracking nuevo: no agrega estado, no
 * toca RunnerLeccion y no registra eventos.
 */
export function PuntoDePartida({ lecciones }: { lecciones: LeccionDelCamino[] }) {
  const montado = useMontado();
  const publicables = lecciones.filter((l) => l.publicable);
  const enPreparacion = lecciones.filter((l) => !l.publicable);
  const primera = publicables[0];

  // Invariante del camino (Fase 1: l1 es publicable). Si algún día no se
  // cumple, el punto de partida dice la verdad en vez de ofrecer un enlace roto.
  if (!primera) {
    return (
      <Marco titulo="El camino todavía no abre">
        <p className="text-base leading-7 text-ink-suave">
          Ninguna lección pasó todavía la revisión matemática y de originalidad.
          Es lo único que falta para abrirlas.
        </p>
      </Marco>
    );
  }

  const pendiente = montado ? publicables.find((l) => !esLeccionCompletada(l.id)) : primera;
  const hayAvance = montado && publicables.some((l) => esLeccionCompletada(l.id));

  // Rama 3 — todas las lecciones abiertas quedaron hechas en esta sesión.
  if (hayAvance && !pendiente) {
    return (
      <Marco titulo="Hiciste todo lo que está abierto">
        <p className="text-base leading-7 text-ink-suave">
          {enPreparacion.length > 0
            ? "Las lecciones que siguen están en preparación: se abren cuando pasen la revisión matemática y de originalidad. Mientras tanto, la que ya hiciste se puede volver a hacer entera."
            : "La lección que ya hiciste se puede volver a hacer entera."}
        </p>
        <EnlaceBoton href={`/leccion/${primera.id}`} className="mt-6">
          Volver a hacer «{primera.titulo}»
        </EnlaceBoton>
      </Marco>
    );
  }

  // Rama 2 — quedó una lección abierta sin terminar en esta sesión.
  if (hayAvance && pendiente) {
    return (
      <Marco titulo="Te queda una lección del camino">
        <p className="text-base leading-7 text-ink-suave">
          Sigue «{pendiente.titulo}»: unos {pendiente.minutos} minutos, con
          preguntas formato PAES al final.
        </p>
        <EnlaceBoton href={`/leccion/${pendiente.id}`} className="mt-6">
          Retomar el camino
        </EnlaceBoton>
      </Marco>
    );
  }

  // Rama 1 — arranque. También es lo que se ve antes de hidratar.
  return (
    <Marco titulo="Empieza por acá">
      <p className="text-base leading-7 text-ink-suave">
        El camino parte en «{primera.titulo}»: unos {primera.minutos} minutos,
        con preguntas formato PAES al final. No necesitas cuenta para hacerla.
      </p>
      <EnlaceBoton href={`/leccion/${primera.id}`} className="mt-6">
        Empezar la lección
      </EnlaceBoton>
    </Marco>
  );
}

/** Contenedor común a las tres ramas: mismo alto visual y mismo lugar del CTA,
 *  para que pasar de una rama a otra no mueva la página. */
function Marco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-tarjeta border border-border bg-surface shadow-tarjeta p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
