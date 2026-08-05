/**
 * Constantes del motor de diagnóstico, todas nombradas y en un solo lugar.
 *
 * Ninguna está calibrada con datos: son hipótesis de trabajo del diseño del
 * motor, elegidas para que el algoritmo tenga un comportamiento razonable antes
 * de que exista un solo ítem real. Se recalibran con desempeño medido, no por
 * intuición.
 */

import type { Confianza } from "./tipos.ts";

/**
 * Cuánto mueve el log-odds una respuesta de peso 1. Con K = 1,4 un acierto
 * seguro lleva la unidad de p = 0,5 a p ≈ 0,80 de un golpe, y dos aciertos
 * seguros a p ≈ 0,94: suficiente para salir de la banda de indecisión rápido
 * sin que una sola respuesta cierre el asunto para siempre.
 */
export const K = 1.4;

/**
 * Atenuación por nivel de propagación. Un prerrequisito a un salto recibe la
 * mitad de la evidencia, a dos saltos un cuarto, a tres un octavo. Que decaiga
 * rápido es el punto: la evidencia indirecta nunca debe pesar como la directa.
 */
export const GAMMA = 0.5;

/**
 * Hasta cuántos saltos del DAG se propaga una respuesta.
 *
 * **Radio de propagación, no altura del grafo — y la métrica que de verdad
 * importa acá tampoco es la altura.** `ancestros()`/`descendientes()`
 * (`dag.ts`) devuelven la distancia BFS **mínima** a cada nodo alcanzable: si
 * hay dos caminos de largo distinto entre dos unidades, la propagación viaja
 * por el corto. La altura del grafo — el largo de la cadena de prerrequisitos
 * MÁS LARGA — es una cifra distinta que no gobierna nada de esto; que hoy sea
 * 4 (`enteros-racionales → expresiones-algebraicas → ecuaciones-inecuaciones →
 * funcion-lineal-afin → sistemas-2x2`, fijado en el test "la cadena de
 * prerrequisitos más larga tiene 4 aristas") no dice nada sobre qué tan lejos
 * llega una respuesta.
 *
 * (Esto corrige una nota anterior de este comentario, que afirmaba que fallar
 * `sistemas-2x2` o `funcion-cuadratica` nunca movía la creencia sobre
 * `enteros-racionales` "porque quedan a 4 saltos". Es falso: la distancia BFS
 * mínima de `sistemas-2x2` a `enteros-racionales` es 3, no 4, porque además
 * del camino largo por `funcion-lineal-afin` existe uno corto por
 * `ecuaciones-inecuaciones`. La altura mide el peor camino; la propagación usa
 * el mejor.)
 *
 * La cifra que sí importa: hoy, la distancia BFS mínima MÁS GRANDE entre
 * cualquier par (unidad, ancestro-o-descendiente) alcanzable del grafo real es
 * **3**, tanto subiendo como bajando. O sea `PROFUNDIDAD_MAX = 3` no trunca
 * ningún par existente — cubre el grafo entero tal como está hoy. Esa
 * cobertura depende de la estructura actual de aristas, no de este número: si
 * mañana una arista nueva alarga el camino MÍNIMO (no el más largo) entre dos
 * unidades más allá de 3, empieza a haber pares que dejan de recibir
 * evidencia. El test "la propagación cubre el DAG real: distancia BFS mínima
 * dentro de PROFUNDIDAD_MAX" (`__tests__/motor.test.ts`) revisa exactamente
 * eso contra `dag-m1.json` y falla nombrando el par y la distancia si se
 * rompe.
 */
export const PROFUNDIDAD_MAX = 3;

/**
 * Mientras el log-odds de una unidad esté dentro de esta banda, la unidad
 * cuenta como indecisa y el test no puede terminar por ella. Equivale más o
 * menos a p ∈ [0,35 · 0,65].
 */
export const BANDA_INDECISION: readonly [number, number] = [-0.62, 0.62];

/** Piso de preguntas: bajo esto el test sigue aunque no quede incertidumbre. */
export const MIN_ITEMS = 8;

/** Techo duro de preguntas. Un diagnóstico más largo que esto no se termina. */
export const MAX_ITEMS = 20;

/**
 * Probabilidad de dominio a partir de la cual damos una unidad por dominada al
 * armar el plan.
 *
 * Ojo: no es el `UMBRAL_DOMINIO` de `lib/umbrales.ts`. Ese mide aciertos al
 * primer intento dentro de una lección ya hecha; este mide una creencia
 * inferida sobre una unidad que el alumno quizá nunca tocó.
 */
export const UMBRAL_P_DOMINADA = 0.65;

/**
 * Peso de un ACIERTO según la confianza declarada.
 *
 * Asimétrico a propósito respecto del fallo: acertar adivinando es evidencia
 * débil, porque con 4 alternativas el azar solo explica un 25% de los aciertos.
 */
export const PESO_ACIERTO: Readonly<Record<Confianza, number>> = {
  "lo-sabia": 1.0,
  "lo-deduje": 0.65,
  adivine: 0.25,
};

/**
 * Peso de un FALLO según la confianza declarada.
 *
 * Fallar adivinando sí informa —el alumno ya declaró que no sabía—, así que el
 * piso es bastante más alto que el del acierto adivinado.
 */
export const PESO_FALLO: Readonly<Record<Confianza, number>> = {
  "lo-sabia": 1.0,
  "lo-deduje": 0.8,
  adivine: 0.5,
};

/** Semiancho de la banda de puntaje estimada, en puntos PAES. */
export const AMPLITUD_BANDA_PUNTAJE = 40;

/** Extremos de la escala de puntaje PAES. */
export const PUNTAJE_MIN = 100;
export const PUNTAJE_MAX = 1000;
