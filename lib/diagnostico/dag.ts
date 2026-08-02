/**
 * Topología del dominio: el DAG de unidades y prerrequisitos.
 *
 * Acá no hay pedagogía ni aritmética de creencias, solo grafo: quién viene
 * antes de quién, a cuántos saltos, y qué tan central es cada unidad. El motor
 * pregunta por ancestros y descendientes; este archivo se los da.
 *
 * Convención de dirección, una sola vez y para todo el módulo: la arista va del
 * prerrequisito a quien lo necesita. Entonces los **ancestros** de una unidad
 * son sus prerrequisitos (directos y transitivos) y los **descendientes**,
 * todo lo que depende de ella.
 */

import { ContenidoInvalidoError } from "../errores.ts";
import type { UnidadDominio } from "./tipos.ts";

export type Dag = {
  /**
   * Las unidades en el orden en que vienen declaradas en el JSON. Ese orden es
   * el desempate final y determinista del selector de ítems, así que mover una
   * unidad de lugar en el archivo puede cambiar qué pregunta sale primero ante
   * un empate perfecto. Es intencional: preferimos un orden estable y visible
   * en el contenido antes que uno escondido en el código.
   */
  unidades: UnidadDominio[];
  porId: Map<string, UnidadDominio>;
  /** Prerrequisitos directos de cada unidad. */
  prerrequisitos: Map<string, string[]>;
  /** Inversa de la anterior: quiénes dependen directamente de cada unidad. */
  dependientes: Map<string, string[]>;
  /** `nº ancestros + nº descendientes`, transitivos. Ver `centralidad`. */
  centralidad: Map<string, number>;
};

/**
 * Construye el DAG y lo valida. Falla ruidosamente ante ids duplicados,
 * prerrequisitos que apuntan a unidades inexistentes o ciclos.
 *
 * La validación no es decorativa: las aristas las escribe una persona a mano en
 * `content/diagnostico/dag-m1.json`, y un ciclo silencioso ahí haría que el
 * motor propagara evidencia en círculo sin que nada se queje.
 */
export function construirDag(unidades: UnidadDominio[]): Dag {
  if (unidades.length === 0) {
    throw new ContenidoInvalidoError("El DAG no tiene unidades.");
  }

  const porId = new Map<string, UnidadDominio>();
  for (const unidad of unidades) {
    if (porId.has(unidad.id)) {
      throw new ContenidoInvalidoError(`Unidad duplicada en el DAG: ${unidad.id}`);
    }
    porId.set(unidad.id, unidad);
  }

  const prerrequisitos = new Map<string, string[]>();
  const dependientes = new Map<string, string[]>();
  for (const unidad of unidades) {
    prerrequisitos.set(unidad.id, []);
    dependientes.set(unidad.id, []);
  }

  for (const unidad of unidades) {
    for (const previo of unidad.prerrequisitos) {
      if (!porId.has(previo)) {
        throw new ContenidoInvalidoError(
          `La unidad ${unidad.id} declara el prerrequisito ${previo}, que no existe.`,
        );
      }
      if (previo === unidad.id) {
        throw new ContenidoInvalidoError(`La unidad ${unidad.id} es prerrequisito de sí misma.`);
      }
      prerrequisitos.get(unidad.id)!.push(previo);
      dependientes.get(previo)!.push(unidad.id);
    }
  }

  const enCiclo = detectarCiclo(unidades, prerrequisitos, dependientes);
  if (enCiclo.length > 0) {
    throw new ContenidoInvalidoError(
      `El DAG tiene un ciclo de prerrequisitos entre: ${enCiclo.join(", ")}`,
    );
  }

  const dag: Dag = {
    unidades: [...unidades],
    porId,
    prerrequisitos,
    dependientes,
    centralidad: new Map(),
  };

  for (const unidad of unidades) {
    const total =
      ancestros(dag, unidad.id).size + descendientes(dag, unidad.id).size;
    dag.centralidad.set(unidad.id, total);
  }

  return dag;
}

/** Ids de las unidades que quedan fuera de un orden topológico, o sea, en ciclo. */
function detectarCiclo(
  unidades: UnidadDominio[],
  prerrequisitos: Map<string, string[]>,
  dependientes: Map<string, string[]>,
): string[] {
  const gradoEntrada = new Map<string, number>();
  for (const unidad of unidades) {
    gradoEntrada.set(unidad.id, prerrequisitos.get(unidad.id)!.length);
  }

  const cola = unidades.map((u) => u.id).filter((id) => gradoEntrada.get(id) === 0);
  let ordenadas = 0;
  while (cola.length > 0) {
    const id = cola.shift()!;
    ordenadas++;
    for (const siguiente of dependientes.get(id)!) {
      const grado = gradoEntrada.get(siguiente)! - 1;
      gradoEntrada.set(siguiente, grado);
      if (grado === 0) cola.push(siguiente);
    }
  }

  if (ordenadas === unidades.length) return [];
  return unidades.map((u) => u.id).filter((id) => gradoEntrada.get(id)! > 0);
}

/**
 * Recorrido en anchura sobre `vecinos`, devolviendo la distancia MÍNIMA en
 * saltos hasta cada alcanzado. Que sea la mínima importa: si una unidad es
 * prerrequisito por dos caminos de largo distinto, la evidencia se atenúa por
 * el camino corto, no por el largo.
 */
function alcanzables(
  vecinos: Map<string, string[]>,
  origen: string,
  profundidadMax: number,
): Map<string, number> {
  const distancias = new Map<string, number>();
  let frontera = [origen];

  for (let d = 1; d <= profundidadMax && frontera.length > 0; d++) {
    const siguiente: string[] = [];
    for (const actual of frontera) {
      for (const vecino of vecinos.get(actual) ?? []) {
        if (distancias.has(vecino)) continue;
        distancias.set(vecino, d);
        siguiente.push(vecino);
      }
    }
    frontera = siguiente;
  }

  return distancias;
}

/**
 * Prerrequisitos transitivos de `id`, con su distancia en saltos.
 * Sin `profundidadMax` recorre el grafo completo.
 */
export function ancestros(
  dag: Dag,
  id: string,
  profundidadMax = Number.POSITIVE_INFINITY,
): Map<string, number> {
  exigirUnidad(dag, id);
  return alcanzables(dag.prerrequisitos, id, profundidadMax);
}

/**
 * Unidades que dependen transitivamente de `id`, con su distancia en saltos.
 * Sin `profundidadMax` recorre el grafo completo.
 */
export function descendientes(
  dag: Dag,
  id: string,
  profundidadMax = Number.POSITIVE_INFINITY,
): Map<string, number> {
  exigirUnidad(dag, id);
  return alcanzables(dag.dependientes, id, profundidadMax);
}

/**
 * `nº ancestros + nº descendientes` transitivos: cuánta parte del dominio toca
 * esta unidad. Es el desempate del selector cuando dos unidades están
 * igual de indecisas — preguntar primero por la más conectada mueve más
 * creencia por respuesta.
 */
export function centralidad(dag: Dag, id: string): number {
  exigirUnidad(dag, id);
  return dag.centralidad.get(id)!;
}

function exigirUnidad(dag: Dag, id: string): void {
  if (!dag.porId.has(id)) {
    throw new ContenidoInvalidoError(`La unidad ${id} no está en el DAG.`);
  }
}
