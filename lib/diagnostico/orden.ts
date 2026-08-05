/**
 * Orden de estudio derivado del DAG: en qué secuencia se pueden tomar las
 * unidades, a qué altura queda cada una y cuánto abre cada una.
 *
 * Todo se calcula desde el `Dag` construido a partir de
 * `content/diagnostico/dag-m1.json`. Nada acá está escrito a mano: si mañana
 * cambia una arista en el JSON, el orden cambia solo. Ese es el punto del
 * archivo — la alternativa (una lista de 16 ids escrita aparte) se
 * desincroniza del grafo sin que nada avise.
 *
 * Misma convención de dirección que `dag.ts`: la arista va del prerrequisito a
 * quien lo necesita, así que los ancestros de una unidad son sus
 * prerrequisitos.
 */

import { descendientes, type Dag } from "./dag.ts";

/**
 * Las unidades en un orden en que cada una viene después de todos sus
 * prerrequisitos.
 *
 * Kahn, con un detalle que importa: el desempate NO es alfabético sino el orden
 * de declaración en el JSON, igual que `dag.unidades` (ver `dag.ts`, campo
 * `unidades`). Cuando varias unidades quedan disponibles a la vez, sale primero
 * la que viene antes en el archivo. Así el orden es determinista y, si hay que
 * cambiarlo, se cambia moviendo una unidad en el contenido y no tocando código.
 *
 * Asume un DAG acíclico: `construirDag` ya rechaza los ciclos, así que si acá
 * quedaran unidades sin emitir es que alguien construyó el `Dag` a mano.
 */
export function ordenTopologico(dag: Dag): string[] {
  const posicion = new Map(dag.unidades.map((u, i) => [u.id, i]));
  const gradoEntrada = new Map<string, number>(
    dag.unidades.map((u) => [u.id, dag.prerrequisitos.get(u.id)!.length]),
  );

  const disponibles = dag.unidades.map((u) => u.id).filter((id) => gradoEntrada.get(id) === 0);
  const orden: string[] = [];

  while (disponibles.length > 0) {
    // El menor índice de declaración: desempate estable y visible en el JSON.
    let elegido = 0;
    for (let i = 1; i < disponibles.length; i++) {
      if (posicion.get(disponibles[i])! < posicion.get(disponibles[elegido])!) elegido = i;
    }
    const id = disponibles.splice(elegido, 1)[0];
    orden.push(id);

    for (const siguiente of dag.dependientes.get(id)!) {
      const grado = gradoEntrada.get(siguiente)! - 1;
      gradoEntrada.set(siguiente, grado);
      if (grado === 0) disponibles.push(siguiente);
    }
  }

  return orden;
}

/**
 * Profundidad de cada unidad: cuántas aristas tiene el camino MÁS LARGO desde
 * una raíz hasta ella. Las raíces quedan en 0.
 *
 * Ojo con la diferencia, que es la fuente de confusión más probable de este
 * módulo: `ancestros`/`descendientes` de `dag.ts` miden la distancia MÍNIMA,
 * porque para propagar evidencia interesa el camino corto (atenúa menos). Acá
 * interesa el largo, porque el nivel responde "¿cuánto hay que haber estudiado
 * antes, en el peor caso, para llegar a esta unidad?". Poner una unidad en el
 * nivel de su camino corto la mostraría antes de que sus prerrequisitos estén
 * listos.
 *
 * Se calcula sobre `ordenTopologico`, así que cuando se procesa una unidad
 * todos sus prerrequisitos ya tienen nivel definitivo.
 */
export function niveles(dag: Dag): Map<string, number> {
  const nivel = new Map<string, number>();

  for (const id of ordenTopologico(dag)) {
    let mayor = -1;
    for (const previo of dag.prerrequisitos.get(id)!) {
      mayor = Math.max(mayor, nivel.get(previo)!);
    }
    nivel.set(id, mayor + 1);
  }

  return nivel;
}

/**
 * La altura del grafo: el largo en aristas de la cadena de prerrequisitos más
 * larga. Es el máximo de `niveles`.
 *
 * No confundir con `PROFUNDIDAD_MAX` de `constantes.ts`, que es otra cosa: el
 * radio en saltos hasta donde el motor propaga la evidencia de una respuesta.
 * Ver la nota en ese archivo.
 */
export function altura(dag: Dag): number {
  return Math.max(...niveles(dag).values());
}

/**
 * Cuántas unidades quedan desbloqueadas, directa o transitivamente, al dominar
 * esta. Sirve para responder "¿por dónde conviene empezar?": mientras más
 * abre una unidad, más cara sale tenerla floja.
 *
 * Reusa `descendientes` de `dag.ts` en vez de recorrer el grafo de nuevo.
 */
export function desbloquea(dag: Dag, id: string): number {
  return descendientes(dag, id).size;
}

/** Una fila del orden de estudio: la unidad, dónde va y cuánto abre. */
export type PasoDelOrden = {
  id: string;
  nivel: number;
  desbloquea: number;
};

/**
 * El orden de estudio completo, listo para agrupar por nivel o para imprimir.
 * Es la vista que consume `docs/dag-m1-para-revision.md`.
 */
export function ordenDeEstudio(dag: Dag): PasoDelOrden[] {
  const nivel = niveles(dag);
  return ordenTopologico(dag).map((id) => ({
    id,
    nivel: nivel.get(id)!,
    desbloquea: desbloquea(dag, id),
  }));
}
