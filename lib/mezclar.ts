/**
 * Fisher-Yates. Pura: no muta el array de entrada, devuelve uno nuevo.
 * Usar dentro de un useState(() => mezclarArray(...)) para que el orden
 * se fije una sola vez por montaje del componente, no en cada render.
 */
export function mezclarArray<T>(original: T[]): T[] {
  const copia = [...original];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const CLAVES = ["A", "B", "C", "D"] as const;

/**
 * Mezcla alternativas formato PAES (A–D) y reasigna `clave` según la nueva
 * posición: la etiqueta visible siempre debe coincidir con dónde quedó la
 * alternativa, no con su posición original en el JSON. Todo lo demás
 * (texto, esCorrecta, feedback, errorCatalogado) viaja intacto.
 */
export function mezclarAlternativas<T extends { clave: string }>(alternativas: T[]): T[] {
  return mezclarArray(alternativas).map((alt, i) => ({ ...alt, clave: CLAVES[i] }));
}
