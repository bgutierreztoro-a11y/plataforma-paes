import { idsDelCamino, obtenerLeccion, esPublicable } from "@/lib/contenido";
import { presentacionDeLeccion } from "@/lib/descripcionesLecciones";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { ChipLeccionCompletada } from "@/components/ChipLeccionCompletada";

/** Copy honesto para una lección aún no publicable: en vez de ocultarla, el
 *  camino la muestra con su título real y esta nota, para que el curso se lea
 *  como en construcción y no como abandonado. */
const DESCRIPCION_EN_PREPARACION =
  "En preparación. Se abre después de la revisión matemática y de originalidad.";

function ChipEnPreparacion() {
  return (
    <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-medium text-ink-suave ring-1 ring-inset ring-border">
      En preparación
    </span>
  );
}

/** El camino de lecciones (portada e índice /lecciones): tarjetas en orden de
 *  curso (l1 → l2 → l3), sin la demo. La publicable es navegable; las que aún
 *  no lo son se muestran como placeholder no-clickeable, con su título real.
 *  Server component: lee el contenido directo del disco. */
export function GrillaLecciones() {
  const lecciones = idsDelCamino().map(obtenerLeccion);

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {lecciones.map((leccion) => {
        const { descripcion, Ilustracion } = presentacionDeLeccion(leccion.id);

        if (!esPublicable(leccion)) {
          // Placeholder: sin href (Tarjeta lo pinta como div, sin hover ni
          // enlace) e `inactiva` (ilustración atenuada, cursor-default,
          // aria-disabled). Con el título real y la nota de "en preparación",
          // no la descripción aspiracional de una lección que aún no se puede
          // hacer.
          return (
            <li key={leccion.id}>
              <Tarjeta
                ilustracion={<Ilustracion />}
                titulo={leccion.titulo}
                descripcion={DESCRIPCION_EN_PREPARACION}
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
              meta={`${leccion.tiempoEstimadoMin} min aprox.`}
              indicador={<ChipLeccionCompletada leccionId={leccion.id} />}
            />
          </li>
        );
      })}
    </ul>
  );
}
