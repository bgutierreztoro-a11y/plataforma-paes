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
 * 1. **13 de los 16 temas no tienen ningún archivo de lección en disco.** Los
 *    16 declaran sus 3 lecciones acá —el mapa completo del temario existe
 *    desde el primer día—, pero solo 3 módulos tienen JSON escrito. Un tema no
 *    puede declararse desde dentro de un archivo que no existe, así que el
 *    registro tiene que ser independiente del contenido. No es preferencia: es
 *    la única forma de que el mapa completo pueda existir.
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
 * esté acá es un error de compilación.
 *
 * **Declarar un id NO afirma que su archivo exista.** Las 48 lecciones del
 * temario están declaradas; solo 9 tienen JSON escrito. Un id sin archivo es
 * una lección *planeada*: `verificarRegistroDeTemas()` en `lib/contenido.ts`
 * la deja pasar y su módulo se muestra como "sin contenido" en el camino. Lo
 * que esa función sí sigue prohibiendo es la dirección contraria —un archivo
 * en disco que ningún tema reclame—, porque ese desaparece en silencio.
 */
export const IDS_LECCION = [
  "l0-demo",

  // Números
  "enteros-operar-y-ordenar",
  "enteros-operar-y-comparar",
  "enteros-problemas-en-contexto",
  "porcentaje-concepto",
  "porcentaje-rebaja-doble",
  "porcentaje-volver-atras",
  "potencias-multiplicar-corto",
  "potencias-raiz-escondida",
  "potencias-problemas-en-contexto",

  // Álgebra y funciones
  "expresiones-rectangulo",
  "expresiones-deshacer-producto",
  "expresiones-sumar-lo-que-se-parece",
  "proporcionalidad-directa",
  "proporcionalidad-inversa",
  "proporcionalidad-reconocer",
  "ecuaciones-lineales",
  "inecuaciones-resolucion",
  "inecuaciones-problemas",
  "sistemas-dos-historias",
  "sistemas-rectas-no-se-cruzan",
  "sistemas-plantear-antes-resolver",
  "lineal-patrones-de-cambio",
  "lineal-pendiente-e-intercepto",
  "lineal-modelamiento-paes",
  "cuadratica-sube-y-baja",
  "cuadratica-punto-mas-alto",
  "cuadratica-donde-toca-el-eje",

  // Geometría
  "figuras-triangulo-no-se-rompe",
  "figuras-borde-y-superficie",
  "figuras-problemas-con-forma",
  "cuerpos-desarmar-la-caja",
  "cuerpos-cuanto-cabe-adentro",
  "cuerpos-hoja-al-cilindro",
  "isometrias-mover-sin-deformar",
  "isometrias-girar-reflejar-trasladar",
  "isometrias-figura-y-su-imagen",
  "semejanza-misma-forma-otro-tamano",
  "semejanza-medir-sin-acercarse",
  "semejanza-plano-y-realidad",

  // Probabilidad y estadística
  "datos-grafico-puede-mentir",
  "datos-numero-que-representa",
  "datos-leer-antes-de-calcular",
  "posicion-donde-quedaste-tu",
  "posicion-partir-en-cuatro",
  "posicion-caja-que-resume",
  "probabilidad-posible-y-probable",
  "probabilidad-esto-o-esto-otro",
  "probabilidad-antes-de-apostar",
] as const;

export type LeccionId = (typeof IDS_LECCION)[number];

/**
 * Universo de ids de cierre, misma garantía de doble capa que `IDS_LECCION`:
 * un `cierreId` en `EJES` que no esté acá no compila, y que esta lista
 * coincida con los archivos que realmente existen en `content/cierres/` lo
 * verifica `verificarRegistroDeTemas()` en `lib/contenido.ts`.
 */
export const IDS_CIERRE = [
  "cierre-v0",
  "cierre-enteros-racionales",
  "cierre-ecuaciones-lineales",
  "cierre-porcentaje",
  "cierre-proporcionalidad",
  "cierre-expresiones-algebraicas",
] as const;

export type CierreId = (typeof IDS_CIERRE)[number];

/** Forma que `satisfies` verifica. Los tipos públicos `Eje` y `Tema` se derivan
 *  de `EJES` más abajo, para conservar los literales de cada id. */
interface FormaTema {
  id: string;
  nombre: string;
  /** Una línea en lenguaje del estudiante —qué vas a poder hacer—, no en
   *  lenguaje del temario. Copy de interfaz: en 13 de 16 temas describe algo
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
   *  secuencia: sin campo `orden`, sin parsear el prefijo del id, sin sort.
   *  Los 16 temas declaran sus 3 lecciones aunque el JSON todavía no exista:
   *  declarar es planificar, no afirmar que el archivo está escrito. */
  lecciones: readonly LeccionId[];
  /**
   * Id del contenido de cierre con que termina este tema (`tipo: "cierre"` en
   * `content/`), o ausente si el tema todavía no tiene uno.
   *
   * Es un id y no un booleano a propósito: el cierre de hoy (`cierre-v0`) es
   * uno entre varios ya (con la Enmienda 2, 16 temas tendrán hasta 16
   * cierres) y un booleano no tendría cómo decir cuál. El cierre no puede ir
   * en `lecciones` porque no es una lección: es `tipo: "cierre"`, vive en
   * `content/cierres/{cierreId}.json` y se navega en `/cierre/{temaId}`.
   */
  cierreId?: CierreId;
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
        lecciones: [
          "enteros-operar-y-ordenar",
          "enteros-operar-y-comparar",
          "enteros-problemas-en-contexto",
        ],
        cierreId: "cierre-enteros-racionales",
      },
      {
        id: "porcentaje",
        nombre: "Porcentaje",
        capacidad:
          "Ya puedes calcular descuentos, aumentos e IVA sin depender de la calculadora.",
        objetivo:
          "Calcular descuentos, aumentos e IVA de cabeza, y notar cuándo un 20% no es lo que parece.",
        lecciones: [
          "porcentaje-concepto",
          "porcentaje-rebaja-doble",
          "porcentaje-volver-atras",
        ],
        cierreId: "cierre-porcentaje",
      },
      {
        id: "potencias-y-raices",
        nombre: "Potencias y raíces enésimas",
        capacidad:
          "Ya puedes manejar potencias y raíces, incluso con exponentes negativos.",
        objetivo:
          "Manejar potencias y raíces, incluidos los exponentes negativos y fraccionarios.",
        lecciones: [
          "potencias-multiplicar-corto",
          "potencias-raiz-escondida",
          "potencias-problemas-en-contexto",
        ],
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
        /**
         * Orden pedagógico, no el del temario: operatoria primero, después
         * productos notables, factorización al final. Factorizar es reconocer
         * la forma que produce un producto notable, así que no puede ir antes
         * de haberlo construido; y la operatoria con términos semejantes es
         * prerrequisito de las dos. El orden original (rectángulo, deshacer,
         * sumar) venía de la carga masiva de los 48 ids en `9ee55fa` y dejaba
         * la operatoria al final. Corregido el 2026-08-14, antes de que
         * existiera ningún archivo del módulo.
         */
        lecciones: [
          "expresiones-sumar-lo-que-se-parece",
          "expresiones-rectangulo",
          "expresiones-deshacer-producto",
        ],
        cierreId: "cierre-expresiones-algebraicas",
      },
      {
        id: "proporcionalidad",
        nombre: "Proporcionalidad",
        capacidad:
          "Ya puedes distinguir una proporción directa de una inversa y usar ambas.",
        objetivo:
          "Distinguir cuándo dos cantidades crecen juntas y cuándo una sube mientras la otra baja.",
        lecciones: [
          "proporcionalidad-directa",
          "proporcionalidad-inversa",
          "proporcionalidad-reconocer",
        ],
        cierreId: "cierre-proporcionalidad",
      },
      {
        id: "ecuaciones-e-inecuaciones-primer-grado",
        nombre: "Ecuaciones e inecuaciones de primer grado",
        capacidad:
          "Ya puedes despejar una incógnita y explicar por qué una desigualdad cambia de sentido.",
        objetivo:
          "Despejar la incógnita paso a paso y saber por qué una desigualdad a veces cambia de sentido.",
        lecciones: [
          "ecuaciones-lineales",
          "inecuaciones-resolucion",
          "inecuaciones-problemas",
        ],
        cierreId: "cierre-ecuaciones-lineales",
      },
      {
        id: "sistemas-2x2",
        nombre: "Sistemas de ecuaciones lineales (2x2)",
        capacidad:
          "Ya puedes resolver un sistema de dos ecuaciones y leer qué significa su solución.",
        objetivo:
          "Resolver dos ecuaciones con dos incógnitas y leer qué significa el punto donde se cruzan.",
        lecciones: [
          "sistemas-dos-historias",
          "sistemas-rectas-no-se-cruzan",
          "sistemas-plantear-antes-resolver",
        ],
      },
      {
        id: "funcion-lineal-y-afin",
        nombre: "Función lineal y afín",
        capacidad:
          "Ya puedes leer una recta en tabla, gráfico o ecuación, y pasar de una forma a otra.",
        objetivo:
          "Leer una recta en cualquier forma —tabla, gráfico o ecuación— y pasar de una a otra.",
        lecciones: [
          "lineal-patrones-de-cambio",
          "lineal-pendiente-e-intercepto",
          "lineal-modelamiento-paes",
        ],
        cierreId: "cierre-v0",
      },
      {
        id: "funcion-cuadratica",
        nombre: "Función cuadrática",
        capacidad:
          "Ya puedes reconocer una parábola y encontrar sus ceros y su vértice.",
        objetivo:
          "Reconocer una parábola, encontrar dónde corta el eje x y dónde está su punto más alto o más bajo.",
        lecciones: [
          "cuadratica-sube-y-baja",
          "cuadratica-punto-mas-alto",
          "cuadratica-donde-toca-el-eje",
        ],
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
        lecciones: [
          "figuras-triangulo-no-se-rompe",
          "figuras-borde-y-superficie",
          "figuras-problemas-con-forma",
        ],
      },
      {
        id: "cuerpos-geometricos",
        nombre: "Cuerpos geométricos",
        capacidad:
          "Ya puedes calcular el volumen y la superficie de los cuerpos que evalúa la PAES.",
        objetivo: "Calcular volumen y superficie de cuerpos que puedes imaginar en la mano.",
        lecciones: [
          "cuerpos-desarmar-la-caja",
          "cuerpos-cuanto-cabe-adentro",
          "cuerpos-hoja-al-cilindro",
        ],
      },
      {
        id: "transformaciones-isometricas",
        nombre: "Transformaciones isométricas",
        capacidad:
          "Ya puedes trasladar, rotar y reflejar figuras sin equivocarte en el resultado.",
        objetivo: "Trasladar, rotar y reflejar una figura sin cambiarle el tamaño ni la forma.",
        lecciones: [
          "isometrias-mover-sin-deformar",
          "isometrias-girar-reflejar-trasladar",
          "isometrias-figura-y-su-imagen",
        ],
      },
      {
        id: "semejanza-y-proporcionalidad",
        nombre: "Semejanza y proporcionalidad de figuras",
        capacidad:
          "Ya puedes usar semejanza para calcular medidas que no puedes tomar directamente.",
        objetivo:
          "Usar figuras semejantes para calcular alturas y distancias que no puedes medir directamente.",
        lecciones: [
          "semejanza-misma-forma-otro-tamano",
          "semejanza-medir-sin-acercarse",
          "semejanza-plano-y-realidad",
        ],
      },
    ],
  },
  {
    id: "probabilidad-y-estadistica",
    nombre: "Probabilidad y estadística",
    temas: [
      {
        id: "tablas-y-graficos",
        nombre: "Representación de datos a través de tablas y gráficos",
        capacidad:
          "Ya puedes leer un gráfico con criterio y detectar cuando está mal construido.",
        objetivo: "Leer un gráfico rápido y detectar cuándo está armado para confundirte.",
        lecciones: [
          "datos-grafico-puede-mentir",
          "datos-numero-que-representa",
          "datos-leer-antes-de-calcular",
        ],
      },
      {
        id: "medidas-de-posicion",
        nombre: "Medidas de posición",
        capacidad:
          "Ya puedes interpretar media, mediana, cuartiles y percentiles, y elegir cuál usar.",
        objetivo:
          "Interpretar media, mediana, cuartiles y percentiles, y saber cuál conviene mirar en cada caso.",
        lecciones: [
          "posicion-donde-quedaste-tu",
          "posicion-partir-en-cuatro",
          "posicion-caja-que-resume",
        ],
      },
      {
        id: "reglas-de-probabilidades",
        nombre: "Reglas de las probabilidades",
        capacidad:
          "Ya puedes calcular probabilidades de eventos combinados sin fiarte de la intuición.",
        objetivo:
          "Calcular la probabilidad de eventos combinados sin caer en las trampas de la intuición.",
        lecciones: [
          "probabilidad-posible-y-probable",
          "probabilidad-esto-o-esto-otro",
          "probabilidad-antes-de-apostar",
        ],
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
