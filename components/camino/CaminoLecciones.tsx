"use client";

import {
  PuntoNodo,
  CanaletaPunto,
  TarjetaNodo,
  FilaNodo,
  COPY_EN_PREPARACION,
} from "@/components/camino/NodoTema";
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

const ETIQUETA: Record<EstadoNodo, string> = {
  completado: "Completada",
  porRepasar: "Por repasar",
  enCurso: "En curso",
  disponible: "Empezar",
  enConstruccion: "En preparación",
};

const CLASE_CHIP: Record<EstadoNodo, string> = {
  completado: "bg-success-suave text-success",
  porRepasar: "bg-attention-suave text-attention-fuerte",
  enCurso: "bg-accent-suave text-accent-fuerte",
  disponible: "bg-accent-suave text-accent-fuerte",
  enConstruccion: "bg-bg text-ink-suave ring-1 ring-inset ring-border",
};

function Chip({ estado, texto }: { estado: EstadoNodo; texto?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CLASE_CHIP[estado]}`}
    >
      {texto ?? ETIQUETA[estado]}
    </span>
  );
}

/**
 * Segundo nivel del camino: las lecciones de un tema como puntos sobre el mismo
 * trazo, más el cierre como último nodo si el tema lo tiene.
 *
 * **Por qué el mismo trazo y no tarjetas sueltas.** El producto tiene un solo
 * gesto de navegación —recorrer una recta— y usarlo en /camino pero no dentro
 * del tema obligaba a aprender dos lenguajes para la misma idea. Acá se reusan
 * `PuntoNodo`, `CanaletaPunto` y `TarjetaNodo` tal cual: los cinco estados se
 * pintan idéntico en los dos niveles, que es lo que hace que sea un camino y no
 * dos pantallas parecidas.
 *
 * **El origen abajo, igual que en /camino.** `flex-col-reverse` invierte la
 * pintura sin tocar el DOM, así que el orden de lectura y de tabulación sigue
 * siendo el del curso. La lección 1 queda abajo y el cierre arriba: el punto
 * más alto del trazo es el que termina el tema.
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

  return (
    /* pl-6 y no p-4: el nodo de meta mide 56px y su contorno doble se extiende
       8px más, así que con 16px de padding izquierdo se salía por el borde de la
       tarjeta. 24px le dan aire sin mover el resto. */
    <div className="fondo-cuadricula relative rounded-tarjeta border border-border p-4 pl-6">
      {/* El trazo que une los nodos, corriendo por la canaleta de los puntos.
          SVG y no borde de CSS: un borde no tiene trazo que animar, y este es el
          mismo gesto de dibujado que la celebración de tema. El left coincide
          con el centro de la canaleta (24px de padding + 22px de medio punto). */}
      {/* El <svg> va envuelto en un div y no posicionado directo: un SVG es un
          elemento reemplazado y con `top`/`bottom` no se estira — se queda en el
          tamaño intrínseco de su viewBox (acá, 100px de alto), y el trazo salía
          cortado a un tercio del camino. El div sí estira, y el svg lo llena. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-[46px] top-10 w-0.5 -translate-x-1/2"
      >
        <svg viewBox="0 0 2 100" preserveAspectRatio="none" className="h-full w-full">
          {/* Se dibuja desde el origen: y1=100 es el extremo de abajo. */}
          <line
            x1="1"
            y1="100"
            x2="1"
            y2="0"
            stroke="var(--color-border-fuerte)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="trazo-camino"
          />
        </svg>
      </div>

      <ol className="flex flex-col-reverse gap-3">
        {tema.lecciones.map((leccion, i) => {
          const { descripcion, Ilustracion } = presentacionDeLeccion(leccion.id);
          const estado = estados[i];
          const enConstruccion = estado === "enConstruccion";
          return (
            <li key={leccion.id}>
              <FilaNodo indice={i}>
              <CanaletaPunto>
                <PuntoNodo estado={estado} />
              </CanaletaPunto>
              <TarjetaNodo href={enConstruccion ? undefined : `/leccion/${leccion.id}`}>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium uppercase tracking-wide text-ink-tenue">
                    Lección <span className="font-mono tabular-nums">{i + 1}</span> de{" "}
                    <span className="font-mono tabular-nums">{total}</span>
                  </span>
                  <span className="block text-base font-semibold leading-snug text-ink">
                    {leccion.titulo}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-ink-suave">
                    {enConstruccion ? COPY_EN_PREPARACION : descripcion}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Chip estado={estado} />
                    {!enConstruccion && (
                      <span className="text-xs text-ink-tenue">
                        <span className="font-mono tabular-nums">{leccion.minutos}</span> min
                        aprox.
                      </span>
                    )}
                  </span>
                </span>
                {/* La ilustración que ya existía por lección no se pierde al
                    dejar las tarjetas: baja a miniatura y solo aparece cuando
                    hay ancho para ella. */}
                <span
                  aria-hidden="true"
                  className={`hidden w-24 shrink-0 self-center sm:block${enConstruccion ? " opacity-60" : ""}`}
                >
                  <Ilustracion />
                </span>
              </TarjetaNodo>
              </FilaNodo>
            </li>
          );
        })}

        {/* El cierre va último en el DOM, o sea arriba del todo con
            flex-col-reverse: es el punto que termina el tema. No es una lección
            —es `tipo: "cierre"` y tiene ruta propia— y por eso se distingue por
            tamaño y doble contorno en vez de por un color nuevo. */}
        {tema.cierreId && (
          <NodoCierre
            tema={tema}
            estado={estadoDelCierre(tema, resumen)}
            indice={total}
          />
        )}
      </ol>
    </div>
  );
}

function NodoCierre({
  tema,
  estado,
  indice,
}: {
  tema: TemaDelCamino;
  estado: EstadoNodo;
  indice: number;
}) {
  /* El cierre es navegable aunque su contenido esté en revisión: eso ya lo
     decidió el producto el 2026-07-25 y se avisa antes de entrar, no cerrando
     la puerta. Ver `estadoDelCierre`. */
  const esDemostracion = !tema.cierrePublicable;
  return (
    <li>
      <FilaNodo indice={indice}>
      <CanaletaPunto>
        <PuntoNodo estado={estado} meta />
      </CanaletaPunto>
      <TarjetaNodo href="/cierre">
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-ink-tenue">
            Cierre del tema
          </span>
          <span className="block text-lg font-semibold leading-snug text-ink">
            {tema.nombre}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-ink-suave">
            Ocho preguntas formato PAES sobre todo el tema.
            {esDemostracion
              ? " Hoy es una versión de demostración."
              : " Al terminarlo comparamos con tu diagnóstico."}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-2">
            {/* Un cierre no se "empieza", se rinde: el verbo del botón tiene que
                ser el de la acción real (MASTER.md §4). */}
            <Chip
              estado={estado}
              texto={
                estado === "completado"
                  ? "Rendido"
                  : estado === "disponible"
                    ? "Rendir"
                    : undefined
              }
            />
            {esDemostracion && (
              <span className="rounded-full bg-accent-suave px-2.5 py-0.5 text-xs font-medium text-accent-fuerte">
                Demostración
              </span>
            )}
          </span>
        </span>
      </TarjetaNodo>
      </FilaNodo>
    </li>
  );
}
