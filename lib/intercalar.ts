/**
 * Intercalado de ítems para que dos consecutivos nunca pidan la misma
 * estrategia de resolución.
 *
 * Por qué: la PAES son 65 preguntas mezcladas. Si los ítems de un cierre llegan
 * agrupados, el estudiante sabe qué estrategia usar antes de leer el enunciado y
 * nunca practica la decisión —que es justamente lo que la prueba evalúa.
 *
 * **Puro y determinista.** Nada de `Math.random`: el mismo array de entrada da
 * siempre el mismo orden de salida, en servidor y en cliente. Un intercalado
 * aleatorio provocaría un mismatch de hidratación, igual que le pasa a la mezcla
 * de alternativas (ver la nota en ItemPAES.tsx).
 *
 * **No toca el contenido.** Reordena una copia; el array de entrada no se muta.
 *
 * NOTA DE ESTADO: hoy nadie llama a esta función desde el render. Falta el campo
 * que diga la estrategia de cada ítem — `habilidad` es la habilidad PAES
 * (resolver/modelar/representar/argumentar), no el procedimiento de resolución,
 * y dos ítems `resolver` pueden pedir despejar una ecuación y resolver una
 * inecuación con signo negativo. Ver docs/pendientes.md.
 */

/**
 * Reordena para que no queden dos elementos consecutivos con la misma clave.
 *
 * Estrategia: en cada posición se toma la clave con más elementos pendientes que
 * NO sea la de la posición anterior. Gastar primero la clave más abundante es lo
 * que evita quedarse al final con un bloque de repetidas sin dónde separarlas.
 * Los empates se rompen por primera aparición en el original, y dentro de una
 * misma clave se conserva el orden original: dos corridas dan el mismo
 * resultado.
 *
 * Si la propiedad es insatisfacible —una clave ocupa más de la mitad de los
 * puestos, redondeando hacia arriba— devuelve el ORDEN ORIGINAL intacto. Un
 * orden a medio intercalar sería peor que el del autor, que al menos es
 * deliberado.
 */
export function intercalarPorClave<T>(items: T[], claveDe: (item: T) => string): T[] {
  if (items.length <= 2) return [...items];

  const grupos = new Map<string, T[]>();
  for (const item of items) {
    const clave = claveDe(item);
    const grupo = grupos.get(clave);
    if (grupo) grupo.push(item);
    else grupos.set(clave, [item]);
  }

  if (!esSatisfacible(items, claveDe)) return [...items];

  /* El orden de inserción del Map es el de primera aparición en el original, y
     Array.prototype.sort es estable, así que el desempate por abundancia cae
     naturalmente en ese orden sin necesidad de un criterio extra. */
  const resultado: T[] = [];
  let anterior: string | null = null;

  while (resultado.length < items.length) {
    const candidata = [...grupos.entries()]
      .filter(([clave, grupo]) => grupo.length > 0 && clave !== anterior)
      .sort((a, b) => b[1].length - a[1].length)[0];

    /* Inalcanzable si esSatisfacible() dijo que sí, pero un return explícito es
       mejor que un bucle infinito si esa invariante alguna vez se rompe. */
    if (!candidata) return [...items];

    const [clave, grupo] = candidata;
    resultado.push(grupo.shift()!);
    anterior = clave;
  }

  return resultado;
}

/**
 * `true` si existe algún orden sin dos consecutivos de la misma clave. La
 * condición es exacta, no una heurística: con `n` elementos hay `ceil(n/2)`
 * puestos mutuamente no adyacentes (1º, 3º, 5º…), así que una clave que aparece
 * más veces que eso obliga a que dos queden juntas, y cualquier reparto por
 * debajo de ese tope cabe.
 */
export function esSatisfacible<T>(items: T[], claveDe: (item: T) => string): boolean {
  if (items.length <= 1) return true;
  const conteo = new Map<string, number>();
  for (const item of items) {
    const clave = claveDe(item);
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }
  return Math.max(...conteo.values()) <= Math.ceil(items.length / 2);
}

/** Helper de test y de diagnóstico: ¿hay dos consecutivos con la misma clave? */
export function hayConsecutivosIguales<T>(items: T[], claveDe: (item: T) => string): boolean {
  return items.some((item, i) => i > 0 && claveDe(item) === claveDe(items[i - 1]));
}
