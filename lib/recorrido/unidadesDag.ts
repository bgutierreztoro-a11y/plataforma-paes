/**
 * El DAG del diagnóstico (content/diagnostico/dag-m1.json) y lib/modulos.ts nombran las mismas
 * 16 unidades con ids distintos. Este es el único puente entre los dos. Va escrito a mano:
 * derivarlo normalizando guiones pasaría igual aunque los dos archivos hablaran de temarios
 * distintos. lib/diagnostico/__tests__/motor.test.ts exige que siga siendo 1 a 1.
 */
export const MODULO_DE_UNIDAD_DAG: Readonly<Record<string, string>> = {
  "enteros-racionales": "enteros-y-racionales",
  porcentaje: "porcentaje",
  "potencias-raices": "potencias-y-raices",
  "expresiones-algebraicas": "expresiones-algebraicas",
  proporcionalidad: "proporcionalidad",
  "ecuaciones-inecuaciones": "ecuaciones-e-inecuaciones-primer-grado",
  "sistemas-2x2": "sistemas-2x2",
  "funcion-lineal-afin": "funcion-lineal-y-afin",
  "funcion-cuadratica": "funcion-cuadratica",
  "figuras-geometricas": "figuras-geometricas",
  "cuerpos-geometricos": "cuerpos-geometricos",
  "transformaciones-isometricas": "transformaciones-isometricas",
  "semejanza-proporcionalidad": "semejanza-y-proporcionalidad",
  "tablas-graficos": "tablas-y-graficos",
  "medidas-posicion": "medidas-de-posicion",
  "reglas-probabilidad": "reglas-de-probabilidades",
};

export interface UnidadDag {
  id: string;
  eje: string;
  prerrequisitos: readonly string[];
}

/** Primera estación de la Línea 01 (Números) sin prerrequisitos, como id de módulo (docs/recorrido-entrada.md §5). */
export function moduloDePartida(unidades: readonly UnidadDag[]): string {
  const unidad = unidades.find((u) => u.eje === "numeros" && u.prerrequisitos.length === 0);
  const modulo = unidad ? MODULO_DE_UNIDAD_DAG[unidad.id] : undefined;
  if (!modulo) throw new Error("dag-m1.json no tiene una estación de Números sin prerrequisitos con módulo");
  return modulo;
}
