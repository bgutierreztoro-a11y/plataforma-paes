/**
 * Taxonomía del temario DEMRE M1: 4 ejes → 16 temas → lecciones.
 *
 * **Frontera de este archivo (regla acordada):** acá vive taxonomía de
 * navegación y copy de interfaz. Nada que el estudiante *aprenda* vive acá. Si
 * un texto requiere revisión matemática o de originalidad, va a `content/` con
 * certificación, no a TypeScript. El `objetivo` de cada tema es una promesa de
 * navegación ("qué vas a poder hacer"), no material de estudio.
 *
 * Por qué el registro vive fuera de `content/`:
 *
 * 1. **14 de los 16 temas no tienen ninguna lección.** Un tema no puede
 *    declararse desde dentro de un archivo que no existe, así que el registro
 *    tiene que ser independiente del contenido. No es preferencia: es la única
 *    forma de que el mapa completo pueda existir.
 * 2. `scripts/validar-contenido.mjs` recorre `content/` recursivamente y valida
 *    todo `.json` que encuentre como lección, diagnóstico o cierre. Un
 *    `content/temas/*.json` fallaría con "tipo debe ser leccion, diagnostico o
 *    cierre" y dejaría `npm run validar` en rojo permanente.
 * 3. Mismo criterio y mismo lugar que `lib/descripcionesLecciones.tsx`, que ya
 *    guarda copy de interfaz fuera del JSON de la lección por esta razón.
 *
 * El módulo es **puro**: sin `node:fs`, sin lecturas de disco. Eso lo hace
 * importable desde islas de cliente, que necesitan el nombre del tema para la
 * etiqueta "Continuar: <tema> · <lección>". El cruce contra los archivos reales
 * vive en `lib/contenido.ts`, que es quien ya posee el disco.
 */

/**
 * Universo de ids de lección, declarado una sola vez.
 *
 * TypeScript no puede leer el directorio en tiempo de tipos, así que esta lista
 * es la mitad estática de la garantía: cualquier id escrito en `EJES` que no
 * esté acá es un error de compilación. La otra mitad —que esta lista coincida
 * con los archivos que realmente existen— la verifica
 * `verificarRegistroDeTemas()` en `lib/contenido.ts`.
 */
export const IDS_LECCION = [
  "l0-demo",
  "l1-patrones-de-cambio",
  "l2-pendiente-e-intercepto",
  "l3-ecuaciones-lineales",
] as const;

export type LeccionId = (typeof IDS_LECCION)[number];

/** Forma que `satisfies` verifica. Los tipos públicos `Eje` y `Tema` se derivan
 *  de `EJES` más abajo, para conservar los literales de cada id. */
interface FormaTema {
  id: string;
  nombre: string;
  /** Una línea en lenguaje del estudiante —qué vas a poder hacer—, no en
   *  lenguaje del temario. Copy de interfaz: en 14 de 16 temas describe algo
   *  que todavía no tiene contenido, así que no podría vivir en un JSON de
   *  lección. */
  objetivo: string;
  /**
   * Una frase de capacidad, en primera persona del estudiante, para la
   * pantalla de celebración del tema. Se deriva de `objetivo` pero no es lo
   * mismo: `objetivo` es una promesa antes de empezar ("vas a poder"),
   * `capacidad` es un hecho al terminar ("ya puedes"). Copy de interfaz.
   */
  capacidad: string;
  /** Orden de curso dentro del tema. La posición en este array **es** la
   *  secuencia: sin campo `orden`, sin parsear el prefijo del id, sin sort. */
  lecciones: readonly LeccionId[];
  /**
   * Id del contenido de cierre con que termina este tema (`tipo: "cierre"` en
   * `content/`), o ausente si el tema todavía no tiene uno.
   *
   * Es un id y no un booleano a propósito: el cierre de hoy (`cierre-v0`) es
   * único porque el módulo v1 cabe entero en un tema, pero con 16 temas habrá
   * 16 cierres y un booleano no tendría cómo decir cuál. El cierre no puede ir
   * en `lecciones` porque no es una lección: es `tipo: "cierre"`, vive en
   * `content/cierre.json` y se navega por su propia ruta.
   */
  cierreId?: string;
}

interface FormaEje {
  id: string;
  nombre: string;
  temas: readonly FormaTema[];
}

/**
 * Los 16 temas del temario DEMRE M1, sin ampliar ni inventar.
 * Números 3 · Álgebra y funciones 6 · Geometría 4 · Probabilidad y estadística 3.
 *
 * `as const` conserva los literales (de ahí salen `EjeId` y `TemaId`);
 * `satisfies` verifica la forma **sin** ensancharlos. Un id de lección mal
 * escrito no pertenece a `LeccionId` y `tsc` lo rechaza: el compilador es el
 * antídoto contra la deriva silenciosa cuando hay 16 temas que mantener.
 */
export const EJES = [
  {
    id: "numeros",
    nombre: "Números",
    temas: [
      {
        id: "enteros-y-racionales",
        nombre: "Enteros y racionales",
        capacidad:
          "Ya puedes operar con negativos y fracciones sin perderte con los signos.",
        objetivo: "Operar con negativos y fracciones sin que se te dé vuelta el signo.",
        lecciones: [],
      },
      {
        id: "porcentaje",
        nombre: "Porcentaje",
        capacidad:
          "Ya puedes calcular descuentos, aumentos e IVA sin depender de la calculadora.",
        objetivo:
          "Calcular descuentos, aumentos e IVA de cabeza, y notar cuándo un 20% no es lo que parece.",
        lecciones: [],
      },
      {
        id: "potencias-y-raices",
        nombre: "Potencias y raíces",
        capacidad:
          "Ya puedes manejar potencias y raíces, incluso con exponentes negativos.",
        objetivo:
          "Manejar potencias y raíces, incluidos los exponentes negativos y fraccionarios.",
        lecciones: [],
      },
    ],
  },
  {
    id: "algebra-y-funciones",
    nombre: "Álgebra y funciones",
    temas: [
      {
        id: "expresiones-algebraicas",
        nombre: "Expresiones algebraicas",
        capacidad:
          "Ya puedes reducir y factorizar expresiones sin perder términos.",
        objetivo:
          "Reducir, factorizar y evaluar expresiones con letras sin perder términos en el camino.",
        lecciones: [],
      },
      {
        id: "proporcionalidad",
        nombre: "Proporcionalidad",
        capacidad:
          "Ya puedes distinguir una proporción directa de una inversa y usar ambas.",
        objetivo:
          "Distinguir cuándo dos cantidades crecen juntas y cuándo una sube mientras la otra baja.",
        lecciones: [],
      },
      {
        id: "ecuaciones-e-inecuaciones-primer-grado",
        nombre: "Ecuaciones e inecuaciones de primer grado",
        capacidad:
          "Ya puedes despejar una incógnita y explicar por qué una desigualdad cambia de sentido.",
        objetivo:
          "Despejar la incógnita paso a paso y saber por qué una desigualdad a veces cambia de sentido.",
        lecciones: ["l3-ecuaciones-lineales"],
      },
      {
        id: "sistemas-2x2",
        nombre: "Sistemas de ecuaciones 2×2",
        capacidad:
          "Ya puedes resolver un sistema de dos ecuaciones y leer qué significa su solución.",
        objetivo:
          "Resolver dos ecuaciones con dos incógnitas y leer qué significa el punto donde se cruzan.",
        lecciones: [],
      },
      {
        id: "funcion-lineal-y-afin",
        nombre: "Función lineal y afín",
        capacidad:
          "Ya puedes leer una recta en tabla, gráfico o ecuación, y pasar de una forma a otra.",
        objetivo:
          "Leer una recta en cualquier forma —tabla, gráfico o ecuación— y pasar de una a otra.",
        lecciones: ["l1-patrones-de-cambio", "l2-pendiente-e-intercepto"],
        cierreId: "cierre-v0",
      },
      {
        id: "funcion-cuadratica",
        nombre: "Función cuadrática",
        capacidad:
          "Ya puedes reconocer una parábola y encontrar sus ceros y su vértice.",
        objetivo:
          "Reconocer una parábola, encontrar dónde corta el eje x y dónde está su punto más alto o más bajo.",
        lecciones: [],
      },
    ],
  },
  {
    id: "geometria",
    nombre: "Geometría",
    temas: [
      {
        id: "figuras-geometricas",
        nombre: "Figuras geométricas",
        capacidad:
          "Ya puedes calcular perímetros y áreas, y aplicar Pitágoras cuando corresponde.",
        objetivo:
          "Calcular perímetros y áreas, y sacar el lado que falta cuando aparece un triángulo rectángulo.",
        lecciones: [],
      },
      {
        id: "cuerpos-geometricos",
        nombre: "Cuerpos geométricos",
        capacidad:
          "Ya puedes calcular el volumen y la superficie de los cuerpos que evalúa la PAES.",
        objetivo: "Calcular volumen y superficie de cuerpos que puedes imaginar en la mano.",
        lecciones: [],
      },
      {
        id: "transformaciones-isometricas",
        nombre: "Transformaciones isométricas",
        capacidad:
          "Ya puedes trasladar, rotar y reflejar figuras sin equivocarte en el resultado.",
        objetivo: "Trasladar, rotar y reflejar una figura sin cambiarle el tamaño ni la forma.",
        lecciones: [],
      },
      {
        id: "semejanza-y-proporcionalidad",
        nombre: "Semejanza y proporcionalidad",
        capacidad:
          "Ya puedes usar semejanza para calcular medidas que no puedes tomar directamente.",
        objetivo:
          "Usar figuras semejantes para calcular alturas y distancias que no puedes medir directamente.",
        lecciones: [],
      },
    ],
  },
  {
    id: "probabilidad-y-estadistica",
    nombre: "Probabilidad y estadística",
    temas: [
      {
        id: "tablas-y-graficos",
        nombre: "Tablas y gráficos",
        capacidad:
          "Ya puedes leer un gráfico con criterio y detectar cuando está mal construido.",
        objetivo: "Leer un gráfico rápido y detectar cuándo está armado para confundirte.",
        lecciones: [],
      },
      {
        id: "medidas-de-posicion",
        nombre: "Medidas de posición",
        capacidad:
          "Ya puedes interpretar media, mediana, cuartiles y percentiles, y elegir cuál usar.",
        objetivo:
          "Interpretar media, mediana, cuartiles y percentiles, y saber cuál conviene mirar en cada caso.",
        lecciones: [],
      },
      {
        id: "reglas-de-probabilidades",
        nombre: "Reglas de probabilidades",
        capacidad:
          "Ya puedes calcular probabilidades de eventos combinados sin fiarte de la intuición.",
        objetivo:
          "Calcular la probabilidad de eventos combinados sin caer en las trampas de la intuición.",
        lecciones: [],
      },
    ],
  },
] as const satisfies readonly FormaEje[];

export type Eje = (typeof EJES)[number];
export type Tema = Eje["temas"][number];
export type EjeId = Eje["id"];
export type TemaId = Tema["id"];

/** Cuántos temas tiene el temario M1. Es el denominador del contador de avance
 *  ("N de 16"), que cuenta sobre el temario completo y no sobre lo construido:
 *  el estudiante ve el tamaño real del curso, no el de nuestra obra en curso. */
export const TOTAL_TEMAS = 16;

/* `EJES` es una tupla de 4 ejes con tipos distintos, así que `flatMap` no logra
   inferir solo el elemento de salida y hay que dárselo. Se calculan una vez, a
   nivel de módulo, porque `temaDeLeccion` se llama dentro de bucles. */
const TODOS_LOS_TEMAS: readonly Tema[] = EJES.flatMap<Tema>((eje) => eje.temas);

const IDS_EN_ORDEN: readonly LeccionId[] = TODOS_LOS_TEMAS.flatMap<LeccionId>(
  (tema) => tema.lecciones,
);

/** Los 16 temas aplanados, en orden de temario (eje por eje). */
export function todosLosTemas(): readonly Tema[] {
  return TODOS_LOS_TEMAS;
}

export function temaPorId(id: string): Tema | undefined {
  return TODOS_LOS_TEMAS.find((tema) => tema.id === id);
}

export function ejeDeTema(temaId: string): Eje | undefined {
  return EJES.find((eje) => eje.temas.some((tema) => tema.id === temaId));
}

/** El tema al que pertenece una lección, o `undefined` si ninguno la reclama
 *  (hoy: solo `l0-demo`, que está fuera del alcance del estudiante). */
export function temaDeLeccion(leccionId: string): Tema | undefined {
  return TODOS_LOS_TEMAS.find((tema) =>
    (tema.lecciones as readonly string[]).includes(leccionId),
  );
}

export function leccionesDeTema(temaId: string): readonly LeccionId[] {
  return temaPorId(temaId)?.lecciones ?? [];
}

/**
 * Todos los ids de lección asignados a un tema, en orden de temario:
 * eje → tema → posición dentro del tema. Es el orden del camino.
 *
 * `l0-demo` queda fuera por construcción: no está asignada a ningún tema.
 */
export function idsDeLeccionesEnOrden(): readonly LeccionId[] {
  return IDS_EN_ORDEN;
}
