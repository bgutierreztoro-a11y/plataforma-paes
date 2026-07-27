"use client";

import { CaminoVertical, type NodoCamino } from "@/components/camino/CaminoVertical";
import { COPY_EN_PREPARACION } from "@/components/camino/NodoTema";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import {
  estadoDeLeccion,
  estadoDelCierre,
  resumirRespuestas,
  type EstadoNodo,
} from "@/lib/estadoNodo";
import { presentacionDeLeccion } from "@/lib/descripcionesLecciones";
import type { TemaDelCamino } from "@/lib/camino";

const ACCION: Record<EstadoNodo, string> = {
  completado: "Repasar la lección",
  porRepasar: "Repasar la lección",
  enCurso: "Continuar la lección",
  disponible: "Empezar la lección",
  enConstruccion: "",
};

/**
 * Segundo nivel del camino: las lecciones de un tema, en orden de curso, y el
 * cierre al final.
 *
 * Mismo componente de layout que /camino (`CaminoVertical`) y por lo tanto el
 * mismo vocabulario: el tema es un camino de temas, el tema por dentro es un
 * camino de lecciones. Si fueran dos implementaciones, se desincronizarían.
 *
 * **El orden baja y el cierre va último** (2026-07-27). Antes la lista se
 * invertía para que el recorrido subiera, lo que dejaba el cierre arriba del
 * todo — la meta era lo primero que se leía. Ahora: lección 1, lección 2,
 * cierre.
 *
 * Isla de cliente: el estado de cada nodo sale del progreso del dispositivo.
 * Antes de hidratar pinta con el progreso vacío —mismo HTML en servidor y en el
 * primer render— y se corrige después.
 */
export function CaminoLecciones({ tema }: { tema: TemaDelCamino }) {
  const montado = useMontado();
  const progreso = montado ? leer() : null;
  const resumen = resumirRespuestas(progreso);

  const total = tema.lecciones.length;
  const estados = tema.lecciones.map((l) => estadoDeLeccion(l, progreso, resumen));

  const nodos: NodoCamino[] = tema.lecciones.map((leccion, i) => {
    const estado = estados[i];
    const { descripcion } = presentacionDeLeccion(leccion.id);
    return {
      id: leccion.id,
      titulo: leccion.titulo,
      estado,
      href: estado === "enConstruccion" ? undefined : `/leccion/${leccion.id}`,
      accion: ACCION[estado],
      rotulo: `Lección ${i + 1} de ${total}`,
      descripcion: estado === "enConstruccion" ? COPY_EN_PREPARACION : descripcion,
      contador: `${leccion.minutos} min aprox.`,
    };
  });

  if (tema.cierreId) {
    const estado = estadoDelCierre(tema, resumen);
    /* El cierre es navegable aunque su contenido esté en revisión: lo decidió el
       producto el 2026-07-25 y se avisa antes de entrar con el chip de
       demostración, en vez de cerrar la puerta. Ver `estadoDelCierre`. */
    nodos.push({
      id: "cierre",
      titulo: "Cierre del tema",
      tituloTarjeta: tema.nombre,
      estado,
      meta: true,
      href: "/cierre",
      /* Un cierre no se "empieza", se rinde: el verbo dice la acción real
         (MASTER.md §4). */
      accion: estado === "completado" ? "Repasar el cierre" : "Rendir el cierre",
      rotulo: "Cierre del tema · 8 preguntas formato PAES",
      descripcion: tema.cierrePublicable
        ? "Todo el tema junto. Al terminarlo comparamos con tu diagnóstico."
        : "Todo el tema junto, en formato PAES.",
      demostracion: !tema.cierrePublicable,
    });
  }

  /* La tarjeta arranca en lo empezado; si no hay nada empezado, en lo primero
     que se puede hacer. */
  const indiceActivo = (() => {
    const enCurso = nodos.findIndex((n) => n.estado === "enCurso");
    if (enCurso !== -1) return enCurso;
    const disponible = nodos.findIndex((n) => n.estado === "disponible");
    return disponible !== -1 ? disponible : 0;
  })();

  return (
    <div className="fondo-cuadricula rounded-tarjeta border border-border px-3 py-4 sm:px-4">
      <CaminoVertical nodos={nodos} indiceActivo={indiceActivo} />
    </div>
  );
}
