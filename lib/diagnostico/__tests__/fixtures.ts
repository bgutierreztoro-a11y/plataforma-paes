/**
 * DAG y banco sintéticos para los tests del motor.
 *
 * Nada de esto tiene que ver con matemática real: los nombres son letras
 * griegas y los enunciados son etiquetas, no preguntas. Es a propósito. El
 * motor se prueba contra una topología conocida y controlada; probarlo contra
 * el DAG real ataría los tests a decisiones pedagógicas que todavía no están
 * tomadas, y una arista nueva rompería tests que no hablan de esa arista.
 *
 * Forma del grafo (la arista va del prerrequisito a quien lo necesita):
 *
 *        alfa                 zeta
 *        /  \               (aislada)
 *     beta  gamma
 *        \  /
 *        delta
 *          |
 *       epsilon
 *
 * Propiedades que los tests usan:
 *   · `alfa` es raíz y `epsilon` es hoja, a distancia 3 — justo el borde de
 *     `PROFUNDIDAD_MAX`, así que la propagación llega y se puede medir.
 *   · `delta` tiene dos prerrequisitos: la distancia mínima no es ambigua.
 *   · `zeta` no toca a nadie: sirve para medir una unidad sin propagación.
 *   · Centralidades: alfa 4, delta 4, epsilon 4, beta 3, gamma 3, zeta 0.
 */

import { construirDag } from "../dag.ts";
import type { ItemDiagnostico, UnidadDominio } from "../tipos.ts";

/**
 * El orden de esta lista es el desempate final del selector, así que moverlo
 * cambia qué unidad se pregunta primero. Los tests dependen de él.
 */
export const UNIDADES_FIXTURE: UnidadDominio[] = [
  { id: "alfa", nombre: "Alfa", eje: "numeros", prerrequisitos: [] },
  { id: "beta", nombre: "Beta", eje: "numeros", prerrequisitos: ["alfa"] },
  { id: "gamma", nombre: "Gamma", eje: "numeros", prerrequisitos: ["alfa"] },
  { id: "delta", nombre: "Delta", eje: "algebra", prerrequisitos: ["beta", "gamma"] },
  { id: "epsilon", nombre: "Epsilon", eje: "algebra", prerrequisitos: ["delta"] },
  { id: "zeta", nombre: "Zeta", eje: "geometria", prerrequisitos: [] },
];

export const DAG_FIXTURE = construirDag(UNIDADES_FIXTURE);

/** La alternativa correcta en todo ítem del banco sintético. */
export const CLAVE_CORRECTA = "A";

/**
 * Las incorrectas y el error que cataloga cada una. Como todos los ítems de una
 * unidad comparten estos errores, elegir dos veces la misma clave en dos ítems
 * distintos produce el mismo `errorCatalogado`: eso es lo que hace posible el
 * caso `error-confirmado`.
 */
export const CLAVES_INCORRECTAS = ["B", "C", "D"] as const;

export function errorDe(unidadId: string, clave: string): string {
  const posicion = (CLAVES_INCORRECTAS as readonly string[]).indexOf(clave);
  return `err-${unidadId}-${posicion + 1}`;
}

function itemSintetico(unidadId: string, n: number, aislante = true): ItemDiagnostico {
  return {
    id: `fx-${unidadId}-${n}`,
    unidadId,
    aislante,
    enunciado: `Ítem sintético ${n} de ${unidadId}`,
    alternativas: [
      { clave: "A", texto: "correcta", esCorrecta: true },
      ...CLAVES_INCORRECTAS.map((clave) => ({
        clave,
        texto: `incorrecta ${clave}`,
        esCorrecta: false,
        errorCatalogado: errorDe(unidadId, clave),
      })),
    ],
  };
}

/**
 * Cuatro ítems aislantes por unidad —de sobra para llegar a `MAX_ITEMS` sin
 * que el banco se agote— más uno no aislante por unidad, que el selector nunca
 * debe entregar.
 */
export const BANCO_FIXTURE: ItemDiagnostico[] = UNIDADES_FIXTURE.flatMap((unidad) => [
  itemSintetico(unidad.id, 1),
  itemSintetico(unidad.id, 2),
  itemSintetico(unidad.id, 3),
  itemSintetico(unidad.id, 4),
  itemSintetico(unidad.id, 9, false),
]);

export function itemsDe(unidadId: string): ItemDiagnostico[] {
  return BANCO_FIXTURE.filter((item) => item.unidadId === unidadId && item.aislante);
}

/**
 * Dominio plano: `cantidad` unidades sin ninguna arista, con `itemsPorUnidad`
 * ítems aislantes cada una.
 *
 * Sirve para forzar cortes del bucle que el DAG de seis nodos no alcanza. Sin
 * aristas no hay propagación, todas las centralidades son 0 y el selector queda
 * reducido a "la primera declarada que siga indecisa": el recorrido es
 * predecible unidad por unidad, que es justo lo que hace falta para provocar un
 * corte por `MAX_ITEMS` en la respuesta exacta que uno quiera.
 */
export function dominioPlano(
  cantidad: number,
  itemsPorUnidad: number,
): { unidades: UnidadDominio[]; dag: ReturnType<typeof construirDag>; banco: ItemDiagnostico[] } {
  const unidades: UnidadDominio[] = Array.from({ length: cantidad }, (_, i) => ({
    id: `p${String(i + 1).padStart(2, "0")}`,
    nombre: `Plana ${i + 1}`,
    eje: "numeros",
    prerrequisitos: [],
  }));

  const banco = unidades.flatMap((unidad) =>
    Array.from({ length: itemsPorUnidad }, (_, n) => itemSintetico(unidad.id, n + 1)),
  );

  return { unidades, dag: construirDag(unidades), banco };
}

/**
 * Generador pseudoaleatorio determinista (Lehmer). Los tests que barren
 * estrategias de respuesta necesitan variedad, no azar: con la misma semilla
 * un fallo se reproduce siempre.
 */
export function generadorDeterminista(semilla: number): () => number {
  let x = semilla % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => {
    x = Math.imul(x, 48271) % 2147483647;
    if (x < 0) x += 2147483647;
    return x / 2147483647;
  };
}
