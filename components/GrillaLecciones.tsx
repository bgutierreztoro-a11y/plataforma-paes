import { idsDeLecciones, obtenerLeccion } from "@/lib/contenido";
import { presentacionDeLeccion } from "@/lib/descripcionesLecciones";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { ChipLeccionCompletada } from "@/components/ChipLeccionCompletada";

/** Grilla de tarjetas de lección (portada e índice /lecciones).
 *  Server component: lee el contenido directo del disco. */
export function GrillaLecciones() {
  const lecciones = idsDeLecciones().sort().map(obtenerLeccion);

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {lecciones.map((leccion) => {
        const { descripcion, Ilustracion } = presentacionDeLeccion(leccion.id);
        return (
          <li key={leccion.id}>
            <Tarjeta
              href={`/leccion/${leccion.id}`}
              ilustracion={<Ilustracion />}
              titulo={leccion.titulo}
              descripcion={descripcion}
              meta={`${leccion.tiempoEstimadoMin} min aprox.`}
              // Cinta oculta a pedido del usuario (piloto): decisión visual,
              // el campo leccion.estado sigue siendo la fuente de verdad.
              esDemostracion={false}
              indicador={<ChipLeccionCompletada leccionId={leccion.id} />}
            />
          </li>
        );
      })}
    </ul>
  );
}
