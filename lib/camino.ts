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
import { estadoDelModulo, type EstadoModulo } from "./estadoModulo";

export type { EstadoModulo };

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
  /** Derivado de `lecciones` y de las declaradas en el registro. Ver `EstadoModulo`. */
  estado: EstadoModulo;
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
      const lecciones = leccionesDelTema(tema, validas);
      return {
        id: tema.id,
        nombre: tema.nombre,
        objetivo: tema.objetivo,
        capacidad: tema.capacidad,
        ejeId: eje.id,
        ejeNombre: eje.nombre,
        lecciones,
        estado: estadoDelModulo(tema.lecciones.length, lecciones),
        cierreId,
        cierrePublicable: cierre ? esPublicable(cierre) : false,
        cierreTotalItems: cierre?.items?.length ?? 0,
      };
    }),
  );
}

/**
 * Temas que tienen página propia y cuentan para el avance: los que tienen al
 * menos una lección, esté publicable o no.
 *
 * Ya **no** es el filtro de qué se dibuja en /camino —desde la agrupación por
 * ejes se dibujan los 16—, pero sigue siendo el de qué es navegable: alimenta
 * `generateStaticParams` de `/tema/[id]` y de `/tema/[id]/completado`, y el
 * denominador de la portada. Un tema en `sin-contenido` no tiene nada que
 * mostrar en su página: queda fuera de `generateStaticParams` y, con
 * `dynamicParams = false`, `/tema/{id}` cae en el 404 normal en vez de
 * renderizar una pantalla vacía. Es lo que mantiene el build en pie con 13
 * módulos declarados y sin escribir.
 */
export function temasConNodo(): TemaDelCamino[] {
  return temasDelCamino().filter((t) => t.estado !== "sin-contenido");
}

/** Un eje del temario con sus temas resueltos, tal como lo recorre /camino. */
export interface EjeDelCamino {
  id: string;
  nombre: string;
  temas: TemaDelCamino[];
  /**
   * Un eje donde **todos** los temas están en `sin-contenido` arranca plegado,
   * con el contador en la banda, en vez de gastar cuatro filas en cuatro discos
   * idénticos que no llevan a ninguna parte. Hoy: Geometría y Probabilidad y
   * estadística.
   *
   * El criterio es "sin archivo en disco" y no "sin lección publicable" a
   * propósito. Ya no puede ser "sin lección declarada": desde que el registro
   * planifica las 48 lecciones del temario, los 16 temas declaran las suyas y
   * ese criterio no plegaría ningún eje. Con el criterio de publicable, en
   * cambio, un módulo a medio escribir plegaría su eje entero — escondiendo lo
   * recién construido justo cuando lo que el camino tiene que comunicar es que
   * el curso avanza.
   */
  colapsado: boolean;
}

/**
 * Los 4 ejes del temario M1 con sus 16 temas, en orden DEMRE.
 *
 * El orden sale de `EJES` (`lib/modulos.ts`) y de ningún otro lado: la posición
 * en ese array **es** la secuencia. Esta función no reordena ni renumera nada,
 * solo agrupa lo que `temasDelCamino()` ya devuelve en orden.
 */
export function ejesDelCamino(): EjeDelCamino[] {
  const porTema = new Map(temasDelCamino().map((t) => [t.id, t]));

  return EJES.map((eje) => {
    const temas = eje.temas.map((t) => porTema.get(t.id)!);
    return {
      id: eje.id,
      nombre: eje.nombre,
      temas,
      colapsado: temas.every((t) => t.estado === "sin-contenido"),
    };
  });
}

export function temaDelCaminoPorId(id: string): TemaDelCamino | undefined {
  return temasDelCamino().find((t) => t.id === id);
}
