import type { BloqueInteractivoSlider } from "@/lib/tipos";

/**
 * Fixtures de prueba para `objeto: "parabola"`. No son contenido de lección:
 * ningún archivo de `content/` declara todavía este objeto — el módulo
 * `funcion-cuadratica` está sin escribir y el componente se construyó antes y
 * aparte, justamente para no mezclarlo con la redacción.
 *
 * Viven en `e2e/` y no en `content/lecciones/` por lo mismo que
 * `bloqueDosVariables.ts`: son dato de prueba para verificar el componente, sin
 * proveniencia ni revisión matemática. Los usa
 * `app/vista-previa/interactivo-parabola/` para poder ver y capturar el bloque
 * sin escribir una lección real.
 */

/**
 * Con las dos marcas encendidas y umbral de exploración. y = x² - 4 de partida:
 * vértice en (0, -4) y ceros en -2 y 2, los tres bien separados dentro del
 * plano, que es lo que hace legible la captura.
 */
export const FIXTURE_BLOQUE_PARABOLA: BloqueInteractivoSlider = {
  tipo: "interactivoSlider",
  variante: "unaVariable",
  objeto: "parabola",
  variables: [
    { nombre: "coeficiente cuadrático (a)", min: -2, max: 2, valorInicial: 1, editable: true },
    { nombre: "coeficiente lineal (b)", min: -3, max: 3, valorInicial: 0, editable: false },
    { nombre: "término libre (c)", min: -5, max: 5, valorInicial: -4, editable: false },
  ],
  instruccion: "Mueve solo a. ¿Qué cambia de la curva y qué se queda igual?",
  exploracionMinima: 3,
  feedbackExploracionInsuficiente: "Prueba al menos tres valores distintos antes de seguir.",
  mostrarVertice: true,
  mostrarCeros: true,
};

/**
 * El mismo objeto sin ninguna marca y con los tres controles libres. Existe para
 * comprobar lo contrario del anterior: sin los flags no se dibuja ni vértice ni
 * ceros, aunque la curva sí los tenga.
 */
export const FIXTURE_BLOQUE_PARABOLA_SIN_MARCAS: BloqueInteractivoSlider = {
  tipo: "interactivoSlider",
  variante: "unaVariable",
  objeto: "parabola",
  variables: [
    { nombre: "coeficiente cuadrático (a)", min: -2, max: 2, valorInicial: 1, editable: true },
    { nombre: "coeficiente lineal (b)", min: -3, max: 3, valorInicial: 2, editable: true },
    { nombre: "término libre (c)", min: -5, max: 5, valorInicial: -3, editable: true },
  ],
  instruccion: "Mueve los tres controles y mira cómo se deforma la curva.",
};
