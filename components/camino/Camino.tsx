"use client";

import { useEffect, useState } from "react";
import { CaminoVertical, type NodoCamino } from "@/components/camino/CaminoVertical";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { avanceDeTema, estadoDeNodo, resumirRespuestas, type EstadoNodo } from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import { TOTAL_TEMAS } from "@/lib/modulos";
import type { TemaDelCamino } from "@/lib/camino";

const ACCION: Record<EstadoNodo, string> = {
  completado: "Repasar el tema",
  porRepasar: "Repasar el tema",
  enCurso: "Seguir el tema",
  disponible: "Empezar el tema",
  enConstruccion: "",
};

/**
 * El camino de temas: una columna de nodos que baja, sobre el papel milimetrado
 * que ya usa el sitio.
 *
 * **Cambio de dirección (2026-07-27).** Antes los temas iban sobre una recta
 * ascendente, de abajo-izquierda a arriba-derecha. Se revirtió tras probarlo en
 * un teléfono real: en móvil se amontonaba, en escritorio quedaba vacío, y la
 * progresión peleaba con el orden de lectura. La metáfora de la función lineal
 * vive en el contenido de las lecciones; la dirección del recorrido es
 * ergonomía. Ver MASTER.md §3.2.
 *
 * Este componente ya no hace layout: cruza el progreso del dispositivo con la
 * taxonomía y le entrega a `CaminoVertical` una lista de nodos. El layout es
 * uno solo y lo comparte con el camino de lecciones de /tema/[id].
 *
 * Isla de cliente: el estado de cada nodo depende del progreso del dispositivo.
 * Antes de hidratar pinta todo con el progreso vacío —el mismo HTML en servidor
 * y en el primer render— y se corrige después.
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
  const estados = temasConNodo.map((t) => estadoDeNodo(t, progreso, resumen));
  const completados = estados.filter((e) => e === "completado").length;

  /* Una sola vez, después de hidratar: antes de eso `completados` es siempre 0
     porque `progreso` todavía es null (mismo HTML servidor/cliente), y contar
     ese cero como si fuera el dato real ensuciaría la métrica. */
  useEffect(() => {
    if (!montado) return;
    registrarEvento({
      nombre: "camino_visto",
      props: { temas_visibles: temasConNodo.length, temas_completados: completados },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje, cuando montado pasa a true
  }, [montado]);

  const nodos: NodoCamino[] = temasConNodo.map((tema, i) => {
    const estado = estados[i];
    const avance = avanceDeTema(tema, progreso);
    return {
      id: tema.id,
      titulo: tema.nombre,
      estado,
      href: estado === "enConstruccion" ? undefined : `/tema/${tema.id}`,
      accion: ACCION[estado],
      rotulo: tema.ejeNombre,
      descripcion: tema.objetivo,
      /* El conteo solo aparece cuando dice algo que el estado no dice: en un
         tema de una sola lección es ruido. */
      contador:
        avance.total > 1 ? `${avance.hechas} de ${avance.total} lecciones` : undefined,
      onAbrir: () =>
        registrarEvento({ nombre: "nodo_tema_abierto", props: { tema_id: tema.id, estado } }),
    };
  });

  /* Dónde está parado el estudiante: lo empezado manda sobre lo que todavía no
     abre. Si no hay ninguno de los dos, la tarjeta arranca en el primero. */
  const indiceActivo = (() => {
    const enCurso = estados.indexOf("enCurso");
    if (enCurso !== -1) return enCurso;
    const disponible = estados.indexOf("disponible");
    return disponible !== -1 ? disponible : 0;
  })();

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-ink-suave">
          Matemática M1 · Piloto privado
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
          Tu camino
        </h1>
        <p className="mt-1 text-base text-ink-suave">
          {/* Contador sobre el temario completo, no sobre lo que alcanzamos a
              construir: el estudiante ve el tamaño real del curso que rinde. */}
          <span className="font-mono tabular-nums">{completados}</span> de{" "}
          <span className="font-mono tabular-nums">{TOTAL_TEMAS}</span> unidades del temario M1
        </p>
      </header>

      <div className="fondo-cuadricula rounded-tarjeta border border-border px-3 py-4 sm:px-4">
        <CaminoVertical nodos={nodos} indiceActivo={indiceActivo} />
      </div>

      {/* ---------- el resto del temario, colapsado ---------- */}
      {temasSinContenido.length > 0 && (
        <section className="mt-6">
          <button
            type="button"
            onClick={() => {
              /* Solo el gesto de abrir es la señal que importa: cuánto interés
                 hay en el resto del temario, no si el estudiante lo volvió a
                 cerrar. Se lee `expandido` del cierre del render y no del
                 updater funcional de abajo a propósito: React vuelve a invocar
                 ese updater en modo estricto de desarrollo para detectar
                 impurezas, y un evento de analítica ahí adentro se dispararía
                 dos veces por un solo clic. */
              if (!expandido) registrarEvento({ nombre: "temas_plegados_expandidos", props: {} });
              setExpandido((v) => !v);
            }}
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
