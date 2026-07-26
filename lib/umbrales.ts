/**
 * Umbrales pedagógicos, en un solo lugar.
 *
 * Existen como constante exportada y no repartidos por los componentes porque
 * un número así se desincroniza en cuanto aparece dos veces: la pantalla diría
 * una cosa y el nodo del camino pintaría otra, sobre el mismo desempeño.
 */

/**
 * Proporción de aciertos al primer intento a partir de la cual damos por
 * entendida una lección.
 *
 * **Qué NO hace este umbral:** no bloquea nada. Quedar debajo abre la
 * invitación a repasar, nunca cierra el paso a la lección siguiente. El bloqueo
 * de contenido por puntaje está en la lista negra del MOS y no se construye.
 *
 * El 0,6 viene del criterio de señal positiva del MOS §6 (mejora en al menos
 * 60% de los estudiantes). Es una hipótesis de trabajo, no un resultado
 * medido: se recalibra con datos del piloto, no por intuición.
 */
export const UMBRAL_DOMINIO = 0.6;

/** `true` si el desempeño alcanza el umbral. Con `total` en 0 devuelve `false`:
 *  sin ítems no hay evidencia de dominio, y afirmarlo sería inventar progreso. */
export function alcanzaDominio(aciertos: number, total: number): boolean {
  if (total <= 0) return false;
  return aciertos / total >= UMBRAL_DOMINIO;
}
