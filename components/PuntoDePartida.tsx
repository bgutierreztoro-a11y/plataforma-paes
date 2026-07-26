"use client";

import { EnlaceBoton } from "@/components/ui/Boton";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import type { TemaDelCamino } from "@/lib/camino";

/** Una lección abierta del camino, con el tema al que pertenece. La página de
 *  servidor lo arma con lib/camino.ts: acá no se lee contenido del disco ni se
 *  serializa una lección completa. */
interface LeccionAbierta {
  id: string;
  titulo: string;
  minutos: number;
  temaNombre: string;
}

function abiertasEnOrden(temas: TemaDelCamino[]): LeccionAbierta[] {
  return temas.flatMap((tema) =>
    tema.lecciones
      .filter((l) => l.publicable)
      .map((l) => ({
        id: l.id,
        titulo: l.titulo,
        minutos: l.minutos,
        temaNombre: tema.nombre,
      })),
  );
}

/**
 * Punto de partida de /inicio: una sola decisión, "¿qué hago ahora?", resuelta
 * con lo que ya existe.
 *
 * El progreso vive en lib/progresoLocal.ts, o sea en el dispositivo, bajo la
 * clave versionada que autoriza MOS §7.5. Sobrevive al reload, pero **no** al
 * cambio de dispositivo ni al borrado del navegador: la migración al servidor
 * al crear cuenta todavía no existe (docs/pendientes.md, 2026-07-26).
 *
 * Por eso el copy de las tres ramas es neutro respecto a la memoria: no dice
 * "de vuelta", no saluda distinto al que ya estuvo, y nunca afirma que algo
 * quedó guardado por tener cuenta. Un estudiante que abre esto en otro teléfono
 * ve la rama 1 y no debe poder concluir que perdió algo ni que la cuenta se lo
 * estaba guardando (docs/plan-fase-3-navegacion.md §1).
 *
 * Isla de cliente porque el progreso solo tiene sentido después de hidratar:
 * antes de eso renderiza la rama 1 —mismo HTML en servidor y en el primer
 * render, sin mismatch— y recién después se corrige a la rama que corresponda.
 */
export function PuntoDePartida({ temas }: { temas: TemaDelCamino[] }) {
  const montado = useMontado();
  const abiertas = abiertasEnOrden(temas);
  const enPreparacion = temas.some((t) => t.lecciones.some((l) => !l.publicable));
  const primera = abiertas[0];

  // Invariante del camino: hoy l1 es publicable. Si algún día no se cumple, el
  // punto de partida dice la verdad en vez de ofrecer un enlace roto.
  if (!primera) {
    return (
      <Marco titulo="El camino todavía no abre">
        <p className="text-base leading-7 text-ink-suave">
          Ninguna lección pasó todavía la revisión matemática y de originalidad. Es lo
          único que falta para abrirlas.
        </p>
        <EnlaceBoton href="/diagnostico" className="mt-6" variante="secundario">
          Hacer el diagnóstico
        </EnlaceBoton>
      </Marco>
    );
  }

  const progreso = montado ? leer() : null;
  const completadas = new Set(
    (progreso?.lecciones ?? []).filter((l) => l.completada).map((l) => l.leccionId),
  );
  const pendiente = montado ? abiertas.find((l) => !completadas.has(l.id)) : primera;
  const hayAvance = montado && (progreso?.lecciones.length ?? 0) > 0;

  // Rama 3 — todo lo abierto quedó hecho.
  if (hayAvance && !pendiente) {
    return (
      <Marco titulo="Hiciste todo lo que está abierto">
        <p className="text-base leading-7 text-ink-suave">
          {enPreparacion
            ? "Las lecciones que siguen están en preparación: se abren cuando pasen la revisión matemática y de originalidad. Mientras tanto, las que ya hiciste se pueden repasar enteras."
            : "Las lecciones que ya hiciste se pueden repasar enteras."}
        </p>
        <EnlaceBoton href="/camino" className="mt-6">
          Ver el camino
        </EnlaceBoton>
      </Marco>
    );
  }

  // Rama 2 — quedó algo sin terminar. La etiqueta nombra el tema y la lección,
  // que es lo que le permite al estudiante reconocer dónde iba sin abrirla.
  if (hayAvance && pendiente) {
    return (
      <Marco titulo="Te queda una lección del camino">
        <p className="text-base leading-7 text-ink-suave">
          Unos {pendiente.minutos} minutos, con preguntas formato PAES al final.
        </p>
        <EnlaceBoton href={`/leccion/${pendiente.id}`} className="mt-6">
          Continuar: {pendiente.temaNombre} · {pendiente.titulo}
        </EnlaceBoton>
      </Marco>
    );
  }

  // Rama 1 — arranque, y lo que se ve antes de hidratar. Sin progreso el
  // destino es el diagnóstico: medir el punto de partida antes de empezar.
  return (
    <Marco titulo="Empieza por acá">
      <p className="text-base leading-7 text-ink-suave">
        Son 5 preguntas formato PAES para ver de dónde partes. Después el camino te
        abre en «{primera.titulo}». No necesitas cuenta para nada de esto.
      </p>
      <EnlaceBoton href="/diagnostico" className="mt-6">
        Hacer el diagnóstico
      </EnlaceBoton>
    </Marco>
  );
}

/** Contenedor común a las cuatro ramas: mismo alto visual y mismo lugar del
 *  CTA, para que pasar de una rama a otra no mueva la página. */
function Marco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-tarjeta border border-border bg-surface shadow-tarjeta p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
