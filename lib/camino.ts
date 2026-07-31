/**
 * Arma el camino de dos niveles cruzando la taxonomía (`lib/modulos.ts`, estática)
 * con el contenido real en disco (`lib/contenido.ts`).
 *
 * Server-only: lee archivos. Devuelve estructuras planas y serializables, para
 * que las islas de cliente reciban lo mínimo y no viaje una lección completa en
 * el payload RSC de cada nodo.
 *
 * El **estado** de cada nodo no se calcula acá: depende del progreso, que vive
 * en el dispositivo. Eso lo resuelve `estadoDeNodo` en components/camino/.
 */
import { idsDeLecciones, obtenerLeccion, esPublicable, obtenerCierre } from "./contenido";
import { EJES, type Tema, type CierreId } from "./modulos";

export interface LeccionDelTema {
  id: string;
  titulo: string;
  minutos: number;
  publicable: boolean;
  /** Denominador de "Aciertos X/Y". Sale del contenido, no se guarda en el
   *  progreso: el agregado se deriva del detalle, nunca se duplica. */
  totalItemsPAES: number;
}

export interface TemaDelCamino {
  id: string;
  nombre: string;
  objetivo: string;
  capacidad: string;
  ejeId: string;
  ejeNombre: string;
  lecciones: LeccionDelTema[];
  /** El tema termina en /cierre/{id}. `cierrePublicable` decide si es navegable. */
  cierreId?: CierreId;
  cierrePublicable: boolean;
  /** Cuántos ítems trae ese cierre. Es el denominador para saber si se rindió
   *  entero: haber abierto el cierre no es haberlo terminado. */
  cierreTotalItems: number;
}

function leccionesDelTema(tema: Tema, validas: Set<string>): LeccionDelTema[] {
  const salida: LeccionDelTema[] = [];
  for (const id of tema.lecciones) {
    // Una lección con contenido inválido queda fuera del camino sin tumbar el
    // build, igual que en idsDelCamino().
    if (!validas.has(id)) continue;
    const leccion = obtenerLeccion(id);
    salida.push({
      id: leccion.id,
      titulo: leccion.titulo,
      minutos: leccion.tiempoEstimadoMin,
      publicable: esPublicable(leccion),
      totalItemsPAES: leccion.itemsPAES?.length ?? 0,
    });
  }
  return salida;
}

/** Los 16 temas con su contenido resuelto, en orden de temario. */
export function temasDelCamino(): TemaDelCamino[] {
  const validas = new Set(idsDeLecciones());

  return EJES.flatMap((eje) =>
    eje.temas.map((tema) => {
      // El cierre se resuelve por tema: cada tema tiene a lo sumo un cierre
      // propio (o ninguno). Antes de la Enmienda 2 había un único cierre
      // global y esto se calculaba una sola vez fuera del loop; con más de un
      // módulo eso aplicaría el cierre equivocado a temas sin el suyo.
      const cierreId = "cierreId" in tema ? tema.cierreId : undefined;
      const cierre = cierreId ? obtenerCierre(cierreId) : undefined;
      return {
        id: tema.id,
        nombre: tema.nombre,
        objetivo: tema.objetivo,
        capacidad: tema.capacidad,
        ejeId: eje.id,
        ejeNombre: eje.nombre,
        lecciones: leccionesDelTema(tema, validas),
        cierreId,
        cierrePublicable: cierre ? esPublicable(cierre) : false,
        cierreTotalItems: cierre?.items?.length ?? 0,
      };
    }),
  );
}

/**
 * Temas que se dibujan como nodos: los que tienen al menos una lección, esté
 * publicable o no.
 *
 * Por qué "con lección" y no "con lección publicable": un tema que ya tiene
 * contenido escrito y esperando revisión es parte del camino visible, y su nodo
 * en construcción es lo que le dice al estudiante que el curso avanza. Además,
 * con un solo nodo la recta ascendente no se lee como recta — se lee como un
 * punto suelto.
 */
export function temasConNodo(): TemaDelCamino[] {
  return temasDelCamino().filter((t) => t.lecciones.length > 0);
}

/** Temas sin ninguna lección todavía: van en la sección colapsada del pie, sin
 *  nodo propio, para que el camino no se lea como un sitio en obras. */
export function temasSinContenido(): TemaDelCamino[] {
  return temasDelCamino().filter((t) => t.lecciones.length === 0);
}

export function temaDelCaminoPorId(id: string): TemaDelCamino | undefined {
  return temasDelCamino().find((t) => t.id === id);
}
