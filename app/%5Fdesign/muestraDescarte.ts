import { copyDelCatalogo } from "@/lib/advance/copyDeError";
import type { FiguraDatos, FiguraDiagramaCajon, FiguraIsometrias, FiguraPlanoFuncion, FiguraTablaValores, ItemAdvance } from "@/lib/advance/descarte";
import type { FasesPorError, RegistroTriage } from "@/lib/advance/triage";
import type { GrupoDeUnidad, TarjetaDeError } from "@/lib/advance/pantallaErrores";
import { panelPorHabilidad, type IntentoConHabilidad } from "@/lib/advance/panel";
import type { EntradaError, RepasoDeError } from "@/lib/catalogoErrores";

/**
 * Ítems de MUESTRA para la galería del modo descarte. Texto obviamente de
 * demostración: no es contenido, no vive en content/, no lo importa ninguna
 * ruta de producto y no pasa por el validador. Los ids de error son los del
 * catálogo de porcentaje solo para que el rótulo (slug humanizado) se vea como en
 * producción; los textos no describen esos errores.
 *
 * Las alternativas vienen ya "mezcladas" (clave visible distinta de la
 * original) para que la galería ejercite el mismo camino que la ruta.
 */
export const MUESTRA_DESCARTE: ItemAdvance[] = [
  {
    id: "adv-muestra-galeria-001",
    unidadId: "muestra",
    moduloId: "porcentaje",
    habilidad: "resolver",
    dificultad: "media",
    tiempoReferenciaSeg: 120,
    enunciado:
      "MUESTRA DE GALERÍA. Un enunciado de demostración con un número, 100, y una pregunta que no hay que resolver. ¿Cuál alternativa queda?",
    alternativas: [
      {
        clave: "A",
        claveOriginal: "C",
        texto: "Muestra: distractor uno",
        esCorrecta: false,
        errorCatalogado: "convierte-mal-porcentaje-a-decimal",
        feedbackDescarte: "Muestra: por qué esta no podía ser, en una o dos líneas, nombrando el error.",
      },
      {
        clave: "B",
        claveOriginal: "A",
        texto: "Muestra: la correcta",
        esCorrecta: true,
        feedbackDescarteIncorrecto:
          "Muestra: por qué esta sí podía ser, dicho sin dramatismo. Es información, no castigo.",
      },
      {
        clave: "C",
        claveOriginal: "D",
        texto: "Muestra: distractor dos",
        esCorrecta: false,
        errorCatalogado: "deshace-porcentaje-con-mismo-porcentaje",
        feedbackDescarte: "Muestra: texto del descarte acertado del segundo distractor.",
      },
      {
        clave: "D",
        claveOriginal: "B",
        texto: "Muestra: distractor tres",
        esCorrecta: false,
        errorCatalogado: "reporta-descuento-en-vez-de-resto",
        feedbackDescarte: "Muestra: texto del descarte acertado del tercer distractor.",
      },
    ],
    solucion:
      "Muestra: la resolución paso a paso iría acá.\n\nSegundo párrafo de la muestra, para ver el salto de línea.",
  },
  {
    id: "adv-muestra-galeria-002",
    unidadId: "muestra",
    moduloId: "porcentaje",
    habilidad: "modelar",
    dificultad: "alta",
    tiempoReferenciaSeg: 160,
    enunciado: "MUESTRA DE GALERÍA. Segundo ítem, para ejercitar el paso al siguiente y el cierre de la sesión.",
    alternativas: [
      {
        clave: "A",
        claveOriginal: "B",
        texto: "Muestra: distractor uno",
        esCorrecta: false,
        errorCatalogado: "deshace-porcentaje-con-mismo-porcentaje",
        feedbackDescarte: "Muestra: descarte acertado del primer distractor del segundo ítem.",
      },
      {
        clave: "B",
        claveOriginal: "D",
        texto: "Muestra: distractor dos",
        esCorrecta: false,
        errorCatalogado: "suma-porcentajes-sucesivos",
        feedbackDescarte: "Muestra: descarte acertado del segundo distractor del segundo ítem.",
      },
      {
        clave: "C",
        claveOriginal: "A",
        texto: "Muestra: la correcta",
        esCorrecta: true,
        feedbackDescarteIncorrecto: "Muestra: por qué esta sí podía ser, segundo ítem.",
      },
      {
        clave: "D",
        claveOriginal: "C",
        texto: "Muestra: distractor tres",
        esCorrecta: false,
        errorCatalogado: "deshace-porcentaje-con-mismo-porcentaje",
        feedbackDescarte: "Muestra: descarte acertado del tercer distractor del segundo ítem.",
      },
    ],
    solucion: "Muestra: resolución del segundo ítem.",
  },
];

/** Descripciones de MUESTRA por id local, con la forma de `catalogoDelModulo`. */
export const CATALOGO_MUESTRA: Record<string, string> = {
  "reporta-descuento-en-vez-de-resto": "Muestra: descripción del primer error del catálogo, como la leería el estudiante.",
  "convierte-mal-porcentaje-a-decimal": "Muestra: descripción del tercer error del catálogo.",
  "suma-porcentajes-sucesivos": "Muestra: descripción del sexto error del catálogo.",
  "deshace-porcentaje-con-mismo-porcentaje": "Muestra: descripción del séptimo error del catálogo, el que más se repite en la muestra.",
};

/* El catálogo completo de MUESTRA, con la forma de `catalogoCompletoDelModulo`
   (F4c): tres errores con titulo + apoyo y suma-porcentajes-sucesivos solo con descripcion, el
   mismo que va sin apoyo en `TARJETAS_UNA_UNIDAD`, para ver la caída de
   `copyDeError` en la pantalla final. */
const CATALOGO_COMPLETO_MUESTRA = new Map<string, EntradaError>([
  ["reporta-descuento-en-vez-de-resto", { id: "reporta-descuento-en-vez-de-resto", descripcion: CATALOGO_MUESTRA["reporta-descuento-en-vez-de-resto"], titulo: "Muestra: título del primer error", apoyo: "Muestra: apoyo del primer error." }],
  ["convierte-mal-porcentaje-a-decimal", { id: "convierte-mal-porcentaje-a-decimal", descripcion: CATALOGO_MUESTRA["convierte-mal-porcentaje-a-decimal"], titulo: "Muestra: título del tercer error", apoyo: "Muestra: apoyo del tercer error." }],
  ["suma-porcentajes-sucesivos", { id: "suma-porcentajes-sucesivos", descripcion: CATALOGO_MUESTRA["suma-porcentajes-sucesivos"] }],
  ["deshace-porcentaje-con-mismo-porcentaje", { id: "deshace-porcentaje-con-mismo-porcentaje", descripcion: CATALOGO_MUESTRA["deshace-porcentaje-con-mismo-porcentaje"], titulo: "Muestra: título del séptimo error", apoyo: "Muestra: apoyo del séptimo error, el que más se repite." }],
]);

/** Lo que recibe `ResultadoDescarte` en la galería: el mismo camino que la ruta real. */
export const COPY_MUESTRA = copyDelCatalogo(CATALOGO_COMPLETO_MUESTRA);

/* Grupos de MUESTRA para /advance/errores (§6.3, F4b): los estados que hoy no
   existen en Neon. `ejeId: null` en el primero para que la galería instale la
   línea desde afuera y mida las cuatro; el segundo trae ejes reales (D13).
   Una tarjeta (suma-porcentajes-sucesivos) sin `apoyo`, para ver la caída de F4b en pantalla. */
const TARJETAS_UNA_UNIDAD: TarjetaDeError[] = [
  { unidadId: "muestra", errorId: "deshace-porcentaje-con-mismo-porcentaje", titulo: "Muestra: título del séptimo error", apoyo: "Muestra: apoyo del séptimo error, el que más se repite.", fase: "por-repasar", recaida: true, ultimoIntentoMs: 3 },
  { unidadId: "muestra", errorId: "reporta-descuento-en-vez-de-resto", titulo: "Muestra: título del primer error", apoyo: "Muestra: apoyo del primer error.", fase: "por-repasar", recaida: false, ultimoIntentoMs: 2 },
  { unidadId: "muestra", errorId: "convierte-mal-porcentaje-a-decimal", titulo: "Muestra: título del tercer error", apoyo: "Muestra: apoyo del tercer error.", fase: "en-estudio", recaida: false, ultimoIntentoMs: 2 },
  { unidadId: "muestra", errorId: "suma-porcentajes-sucesivos", titulo: CATALOGO_MUESTRA["suma-porcentajes-sucesivos"], fase: "superado", recaida: false, ultimoIntentoMs: 1 },
];

const UNA_UNIDAD: GrupoDeUnidad = {
  unidadId: "muestra",
  titulo: "Unidad de muestra",
  ejeId: null,
  tarjetas: TARJETAS_UNA_UNIDAD,
};

/** Mismas tarjetas de `UNA_UNIDAD`, con `unidadId` reescrito al del grupo que las recibe (D13, dos unidades). */
function tarjetasEn(unidadId: string): TarjetaDeError[] {
  return TARJETAS_UNA_UNIDAD.map((t) => ({ ...t, unidadId }));
}

export const GRUPOS_ERRORES_MUESTRA: { id: string; rotulo: string; grupos: GrupoDeUnidad[] }[] = [
  { id: "vacio", rotulo: "Sin tarjetas (D9): ningún error con intentos", grupos: [] },
  { id: "una-unidad", rotulo: "Una unidad: dos por repasar (una recaída), una en estudio, una superada", grupos: [UNA_UNIDAD] },
  {
    id: "dos-unidades",
    rotulo: "Dos unidades (D13): aparece el título de cada una y cada grupo toma su línea",
    grupos: [
      {
        unidadId: "muestra-numeros",
        titulo: "Porcentaje (muestra)",
        ejeId: "numeros",
        tarjetas: tarjetasEn("muestra-numeros"),
      },
      {
        unidadId: "muestra-geometria",
        titulo: "Figuras geométricas (muestra)",
        ejeId: "geometria",
        tarjetas: [
          { unidadId: "muestra-geometria", errorId: "reporta-descuento-en-vez-de-resto", titulo: "Muestra: título del primer error", apoyo: "Muestra: apoyo del primer error.", fase: "por-repasar", recaida: false, ultimoIntentoMs: 1 },
        ],
      },
    ],
  },
];

/** El repaso de un error, de MUESTRA (F4b), para /_design. Textos obviamente de demostración. */
export const REPASO_MUESTRA: { titulo: string; repaso: RepasoDeError } = {
  titulo: "Muestra: título del error",
  repaso: {
    camino: "Muestra: cómo se comete este error, en un par de frases.",
    correcto: "Muestra: cuál es el razonamiento correcto y por qué.",
    ejemplo: "Muestra: un ejemplo numérico resuelto paso a paso.",
  },
};

/* ---------- triage de 20 segundos (F5a) ---------- */

/* Fases de MUESTRA por error (D17): reporta-descuento-en-vez-de-resto abierto, suma-porcentajes-sucesivos en observación,
   convierte-mal-porcentaje-a-decimal y deshace-porcentaje-con-mismo-porcentaje cerrados. Con los cuatro ítems de abajo produce los cuatro
   veredictos. `FASES_SIN_DATOS` es el otro estado de la galería: todo
   sin-datos, todo sin veredicto. */
export const FASES_MUESTRA: FasesPorError = {
  "reporta-descuento-en-vez-de-resto": "abierto",
  "convierte-mal-porcentaje-a-decimal": "cerrado",
  "suma-porcentajes-sucesivos": "observacion",
  "deshace-porcentaje-con-mismo-porcentaje": "cerrado",
};

export const FASES_SIN_DATOS: FasesPorError = {
  "reporta-descuento-en-vez-de-resto": "sin-datos",
  "convierte-mal-porcentaje-a-decimal": "sin-datos",
  "suma-porcentajes-sucesivos": "sin-datos",
  "deshace-porcentaje-con-mismo-porcentaje": "sin-datos",
};

/* Dos ítems más para el resultado del triage: el tercero con sus tres
   distractores en errores cerrados (convierte-mal-porcentaje-a-decimal y deshace-porcentaje-con-mismo-porcentaje), para el punto
   regalado; el cuarto es igual y se marca, para el sin veredicto. */
const ITEM_TODO_CERRADO: ItemAdvance = {
  ...MUESTRA_DESCARTE[0],
  id: "adv-muestra-galeria-003",
  enunciado: "MUESTRA DE GALERÍA. Tercer ítem, cuyos tres distractores codifican errores ya superados.",
  alternativas: MUESTRA_DESCARTE[0].alternativas.map((a) =>
    a.esCorrecta ? a : { ...a, errorCatalogado: a.errorCatalogado === "reporta-descuento-en-vez-de-resto" ? "convierte-mal-porcentaje-a-decimal" : a.errorCatalogado },
  ),
};

export const MUESTRA_TRIAGE: ItemAdvance[] = [
  MUESTRA_DESCARTE[0],
  MUESTRA_DESCARTE[1],
  ITEM_TODO_CERRADO,
  { ...ITEM_TODO_CERRADO, id: "adv-muestra-galeria-004", enunciado: "MUESTRA DE GALERÍA. Cuarto ítem, marcado para volver después." },
];

/* Con FASES_MUESTRA (dos decisiones, F5a2): resuelvo sobre reporta-descuento-en-vez-de-resto abierto →
   Ojo con el tiempo; marco con suma-porcentajes-sucesivos en observación → Buena lectura; marco
   con todo cerrado → Podías con esta; tiempo agotado → Todavía sin datos.
   `dejo` no aparece: quedó sin emisor. */
const REGISTROS_TRIAGE: RegistroTriage[] = [
  { itemId: "adv-muestra-galeria-001", decision: "resuelvo", ms: 8420 },
  { itemId: "adv-muestra-galeria-002", decision: "marco", ms: 4110 },
  { itemId: "adv-muestra-galeria-003", decision: "marco", ms: 6035 },
  { itemId: "adv-muestra-galeria-004", decision: "sin-decision", ms: 20000 },
];

export const RESULTADOS_TRIAGE_MUESTRA: { id: string; rotulo: string; fases: FasesPorError; registros: RegistroTriage[] }[] = [
  {
    id: "con-veredictos",
    rotulo: "Con veredictos: los cuatro rótulos con su explicación, uno por ítem (la tarjeta solo en Ojo con el tiempo)",
    fases: FASES_MUESTRA,
    registros: REGISTROS_TRIAGE,
  },
  {
    id: "sin-veredicto",
    rotulo: "Todo sin datos: sin historial de descarte, las mismas decisiones",
    fases: FASES_SIN_DATOS,
    registros: REGISTROS_TRIAGE,
  },
];

/* ---------- panel 2×2 (§6.2, F4 4.1) ---------- */

/* Intentos de MUESTRA del modo clásico, que hoy no existe: ninguna tabla los
   produce y por eso el panel solo vive acá. Por habilidad: resolver clasifica
   con Frágil (3 correctos lentos de 5); modelar con Error conceptual (2
   incorrectos rápidos de 3); representar queda sin clasificar con 2 intentos,
   los dos lentos (un ítem lento no hace a nadie frágil); argumentar sin
   intentos. Referencias de 80/120/160 s por dificultad (§5.2). */
export const INTENTOS_CLASICOS_MUESTRA: IntentoConHabilidad[] = [
  { habilidad: "resolver", correcto: true, tiempoMs: 64_000, tiempoReferenciaSeg: 120 },
  { habilidad: "resolver", correcto: true, tiempoMs: 151_000, tiempoReferenciaSeg: 120 },
  { habilidad: "resolver", correcto: true, tiempoMs: 98_000, tiempoReferenciaSeg: 80 },
  { habilidad: "resolver", correcto: true, tiempoMs: 172_000, tiempoReferenciaSeg: 160 },
  { habilidad: "resolver", correcto: false, tiempoMs: 210_000, tiempoReferenciaSeg: 120 },
  { habilidad: "modelar", correcto: false, tiempoMs: 31_000, tiempoReferenciaSeg: 120 },
  { habilidad: "modelar", correcto: false, tiempoMs: 47_000, tiempoReferenciaSeg: 160 },
  { habilidad: "modelar", correcto: true, tiempoMs: 88_000, tiempoReferenciaSeg: 120 },
  { habilidad: "representar", correcto: true, tiempoMs: 190_000, tiempoReferenciaSeg: 120 },
  { habilidad: "representar", correcto: true, tiempoMs: 205_000, tiempoReferenciaSeg: 160 },
];

/** Lo que recibe `PanelDosPorDos` en la galería: el mismo camino que tendría la ruta. */
export const PANEL_MUESTRA = panelPorHabilidad(INTENTOS_CLASICOS_MUESTRA);

/* ---------- figura declarativa (PlanoIsometrias) ---------- */

/* Tres figuras de MUESTRA para el plano de isometrías, una por transformación.
   Cada una lleva solo los datos: la figura original y el objeto que define la
   transformación (vector, centro o recta), nunca la imagen. No viven en
   content/ y ningún banco las importa. */
export const FIGURAS_MUESTRA: { id: string; rotulo: string; figura: FiguraIsometrias }[] = [
  {
    id: "traslacion",
    rotulo: "Traslación · triángulo ABC y vector v",
    figura: {
      plano: { xMin: -4, xMax: 6, yMin: -3, yMax: 5 },
      descripcion: "Triángulo ABC con vértices A(-3, -1), B(0, -2) y C(-1, 2), y el vector v que va de (1, 1) a (4, 3).",
      elementos: [
        { tipo: "punto", nombre: "A", x: -3, y: -1 },
        { tipo: "punto", nombre: "B", x: 0, y: -2 },
        { tipo: "punto", nombre: "C", x: -1, y: 2 },
        { tipo: "poligono", vertices: ["A", "B", "C"] },
        { tipo: "vector", etiqueta: "v", desde: [1, 1], hasta: [4, 3] },
      ],
    },
  },
  {
    id: "rotacion",
    rotulo: "Rotación · cuadrilátero PQRS y centro O",
    figura: {
      plano: { xMin: -5, xMax: 5, yMin: -4, yMax: 4 },
      descripcion: "Cuadrilátero PQRS con vértices P(1, 1), Q(4, 1), R(4, 3) y S(2, 3), y el centro de rotación O en el origen.",
      elementos: [
        { tipo: "punto", nombre: "P", x: 1, y: 1 },
        { tipo: "punto", nombre: "Q", x: 4, y: 1 },
        { tipo: "punto", nombre: "R", x: 4, y: 3 },
        { tipo: "punto", nombre: "S", x: 2, y: 3 },
        { tipo: "poligono", nombre: "PQRS", vertices: ["P", "Q", "R", "S"] },
        { tipo: "centro", etiqueta: "O", x: 0, y: 0 },
      ],
    },
  },
  {
    id: "reflexion",
    rotulo: "Reflexión · triángulo DEF y recta x = 1",
    figura: {
      plano: { xMin: -4, xMax: 6, yMin: -2, yMax: 5 },
      descripcion: "Triángulo DEF con vértices D(-3, 1), E(-1, 4) y F(0, 2), y la recta L de ecuación x = 1, eje de la reflexión.",
      elementos: [
        { tipo: "punto", nombre: "D", x: -3, y: 1 },
        { tipo: "punto", nombre: "E", x: -1, y: 4 },
        { tipo: "punto", nombre: "F", x: 0, y: 2 },
        { tipo: "poligono", vertices: ["D", "E", "F"] },
        { tipo: "recta", etiqueta: "L", forma: "x=c", c: 1 },
      ],
    },
  },
  {
    id: "recta-por-puntos",
    rotulo: "Función afín · puntos P, Q y R de una recta, P en el borde superior (yMax = 9)",
    figura: {
      plano: { xMin: -1, xMax: 4, yMin: -1, yMax: 9 },
      descripcion: "Tres puntos P(0, 9), Q(1, 6) y R(3, 0) de una misma recta en el plano cartesiano; la recta no está dibujada.",
      elementos: [
        { tipo: "punto", nombre: "P", x: 0, y: 9 },
        { tipo: "punto", nombre: "Q", x: 1, y: 6 },
        { tipo: "punto", nombre: "R", x: 3, y: 0 },
      ],
    },
  },
];

/* ---------- figuras de función (PlanoFuncion, TablaValores) ---------- */

/* Casos de MUESTRA para el plano de función, uno por situación del temario de
   función cuadrática (variación de parámetros y puntos especiales). Datos
   inventados: no viven en content/ y ningún banco los importa. Las figuras
   muestran datos, nunca una respuesta: acá se marcan vértices y ceros solo
   para medir cómo se ven. */
export const PLANOS_FUNCION_MUESTRA: { id: string; rotulo: string; figura: FiguraPlanoFuncion }[] = [
  {
    id: "dos-ceros",
    rotulo: "a > 0 con dos ceros · f(x) = x² − 4x + 3, ventana automática",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 1, b: -4, c: 3 }],
      descripcion: "MUESTRA. Parábola que abre hacia arriba, corta el eje x en 1 y en 3 y el eje y en 3.",
    },
  },
  {
    id: "vertice-alto",
    rotulo: "a < 0 con vértice alto · f(x) = −x² + 12x + 4, vértice (6, 40)",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: -1, b: 12, c: 4 }],
      descripcion: "MUESTRA. Parábola que abre hacia abajo con vértice en (6, 40) y que corta el eje y en 4.",
    },
  },
  {
    id: "estrecha",
    rotulo: "|a| = 4, estrecha · f(x) = 4x² − 4",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 4, b: 0, c: -4 }],
      descripcion: "MUESTRA. Parábola estrecha que abre hacia arriba, con vértice en (0, −4) y ceros en −1 y 1.",
    },
  },
  {
    id: "chata",
    rotulo: "|a| = 0,25, chata · f(x) = 0,25x² − 1",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 0.25, b: 0, c: -1 }],
      descripcion: "MUESTRA. Parábola chata que abre hacia arriba, con vértice en (0, −1) y ceros en −2 y 2.",
    },
  },
  {
    id: "sin-ceros",
    rotulo: "sin ceros reales · f(x) = x² − 2x + 3, vértice (1, 2)",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 1, b: -2, c: 3 }],
      descripcion: "MUESTRA. Parábola que abre hacia arriba, con vértice en (1, 2), que no corta el eje x.",
    },
  },
  {
    id: "cero-doble",
    rotulo: "un cero doble · f(x) = x² − 4x + 4, vértice sobre el eje x en (2, 0)",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 1, b: -4, c: 4 }],
      puntos: [{ x: 2, y: 0, rotulo: "V" }],
      descripcion: "MUESTRA. Parábola que abre hacia arriba y toca el eje x en un solo punto, V(2, 0).",
    },
  },
  {
    id: "vertice-tercer-cuadrante",
    rotulo: "vértice fuera del primer cuadrante · f(x) = x² + 6x + 5, vértice (−3, −4)",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 1, b: 6, c: 5 }],
      descripcion: "MUESTRA. Parábola que abre hacia arriba con vértice en (−3, −4), ceros en −5 y −1 e intercepto y en 5.",
    },
  },
  {
    id: "parabola-y-recta",
    rotulo: "parábola + recta que la corta en dos puntos · f y g, P y Q con coordenadas",
    figura: {
      tipo: "plano-funcion",
      ventana: { xMin: -1, xMax: 6, yMin: -2, yMax: 6 },
      curvas: [
        { clase: "parabola", a: 1, b: -4, c: 3, rotulo: "f" },
        { clase: "recta", m: 1, b: -1, rotulo: "g", trazo: "segmentado" },
      ],
      puntos: [
        { x: 1, y: 0, rotulo: "P", mostrarCoordenadas: true },
        { x: 4, y: 3, rotulo: "Q", mostrarCoordenadas: true },
      ],
      descripcion: "MUESTRA. Parábola f y recta g segmentada que se cortan en P(1, 0) y Q(4, 3).",
    },
  },
  {
    id: "tres-parabolas",
    rotulo: "tres parábolas comparadas · variación de a: 0,25, 1 y 4, ventana declarada",
    figura: {
      tipo: "plano-funcion",
      ventana: { xMin: -3, xMax: 3, yMin: -1, yMax: 6 },
      curvas: [
        { clase: "parabola", a: 0.25, b: 0, c: 0, rotulo: "a = 0,25", trazo: "punteado" },
        { clase: "parabola", a: 1, b: 0, c: 0, rotulo: "a = 1", trazo: "segmentado" },
        { clase: "parabola", a: 4, b: 0, c: 0, rotulo: "a = 4" },
      ],
      descripcion: "MUESTRA. Tres parábolas con vértice en el origen: a = 0,25 punteada, a = 1 segmentada y a = 4 sólida; a mayor a, más estrecha.",
    },
  },
  {
    id: "eje-de-simetria",
    rotulo: "parábola con eje de simetría rotulado · f(x) = −0,5x² + 2x + 1, eje x = 2",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: -0.5, b: 2, c: 1 }],
      ejeSimetria: { x: 2, rotulo: "x = 2" },
      descripcion: "MUESTRA. Parábola que abre hacia abajo con su eje de simetría x = 2 dibujado punteado.",
    },
  },
  {
    id: "region",
    rotulo: "parábola con región sombreada · f(x) < 0 entre los ceros 1 y 3, y franja en x",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 1, b: -4, c: 3 }],
      regiones: [
        { clase: "entre-curva-y-eje", curva: 0, desde: 1, hasta: 3 },
        { clase: "franja-x", desde: 1, hasta: 3 },
      ],
      puntos: [
        { x: 1, y: 0, estilo: "hueco" },
        { x: 3, y: 0, estilo: "hueco" },
      ],
      descripcion: "MUESTRA. Parábola con la región entre la curva y el eje x sombreada para 1 < x < 3, extremos huecos.",
    },
  },
  {
    id: "contexto",
    rotulo: "contexto con etiquetas de eje largas · h(t) = −5t² + 20t en [0, 4], altura (m) / tiempo (s)",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: -5, b: 20, c: 0, desde: 0, hasta: 4 }],
      etiquetaEjeX: "tiempo (s)",
      etiquetaEjeY: "altura (m)",
      descripcion: "MUESTRA. Altura de un objeto en metros según el tiempo en segundos: sube desde 0, llega a 20 m a los 2 s y vuelve a 0 a los 4 s.",
    },
  },
  {
    id: "decimales",
    rotulo: "valores decimales · f(x) = 0,5x² − 1,5x − 2, vértice (1,5; −3,125) con segmento acotado",
    figura: {
      tipo: "plano-funcion",
      curvas: [{ clase: "parabola", a: 0.5, b: -1.5, c: -2 }],
      puntos: [{ x: 1.5, y: -3.125, rotulo: "V", mostrarCoordenadas: true }],
      segmentos: [{ desde: { x: 1.5, y: 0 }, hasta: { x: 1.5, y: -3.125 }, rotulo: "3,125" }],
      descripcion: "MUESTRA. Parábola con ceros en −1 y 4 y vértice V(1,5; −3,125), con la distancia del vértice al eje x acotada.",
    },
  },
];

export const TABLA_MUESTRA: { id: string; rotulo: string; figura: FiguraTablaValores } = {
  id: "tabla-cinco-columnas",
  rotulo: "tabla de valores de 5 columnas · x, f(x), g(x), h(x) y f(x) − g(x)",
  figura: {
    tipo: "tabla-valores",
    encabezados: ["x", "f(x)", "g(x)", "h(x)", "f(x) − g(x)"],
    filas: [
      [-2, 15, -3, 0.25, 18],
      [-1, 8, -1, 1, 9],
      [0, 3, 1, 4, 2],
      [1, 0, 3, 16, -3],
      [2, -1, 5, 64, -6],
      [3, 0, 7, 256, -7],
    ],
    descripcion: "MUESTRA. Tabla de valores de tres funciones y de la diferencia f(x) − g(x) para x de −2 a 3.",
  },
};

/* Figuras de datos (tabla-datos, grafico-barras, histograma, grafico-lineas,
   grafico-circular). Datos ABSTRACTOS: categorías A, B, C, series "Serie 1" y
   "Serie 2", sin dominio. Acá se mide la letra a 380 px, la separación de las
   series sin color y la colocación de los rótulos del circular. */
export const FIGURAS_DATOS_MUESTRA: { id: string; rotulo: string; figura: FiguraDatos }[] = [
  {
    id: "tabla-frecuencias",
    rotulo: "tabla-datos · frecuencias con intervalos, incógnita y fila de total",
    figura: {
      tipo: "tabla-datos",
      titulo: "MUESTRA. Tabla de frecuencias",
      columnas: ["Intervalo", "f", "F"],
      filas: [
        ["[0, 10[", 4, 4],
        ["[10, 20[", 7, 11],
        ["[20, 30[", "?", 20],
        ["[30, 40[", 5, 25],
      ],
      filaTotal: ["Total", 25, ""],
    },
  },
  {
    id: "tabla-doble-entrada",
    rotulo: "tabla-datos · doble entrada, sin título visible",
    figura: {
      tipo: "tabla-datos",
      columnas: ["", "A", "B", "Total"],
      filas: [
        ["Grupo 1", 12, 8, 20],
        ["Grupo 2", 6, 14, 20],
      ],
      filaTotal: ["Total", 18, 22, 40],
    },
  },
  {
    id: "barras-una-serie",
    rotulo: "grafico-barras · una serie, valores sobre las barras, eje y automático",
    figura: {
      tipo: "grafico-barras",
      categorias: ["A", "B", "C", "D"],
      series: [{ valores: [12, 7, 15, 4] }],
      ejeX: { etiqueta: "Categoría" },
      ejeY: { etiqueta: "Frecuencia" },
      mostrarValores: true,
    },
  },
  {
    id: "barras-tres-series",
    rotulo: "grafico-barras · tres series (sólido, rayado, tinte), leyenda, eje y declarado con paso 5",
    figura: {
      tipo: "grafico-barras",
      categorias: ["A", "B", "C"],
      series: [
        { nombre: "Serie 1", valores: [12, 7, 15] },
        { nombre: "Serie 2", valores: [9, 11, 6] },
        { nombre: "Serie 3", valores: [4, 14, 10] },
      ],
      ejeX: { etiqueta: "Categoría" },
      ejeY: { etiqueta: "Frecuencia", min: 0, max: 20, paso: 5 },
    },
  },
  {
    id: "histograma-poligono",
    rotulo: "histograma · cinco intervalos contiguos, uno vacío, con polígono de frecuencias",
    figura: {
      tipo: "histograma",
      intervalos: [
        { desde: 0, hasta: 10 },
        { desde: 10, hasta: 20 },
        { desde: 20, hasta: 30 },
        { desde: 30, hasta: 40 },
        { desde: 40, hasta: 50 },
      ],
      frecuencias: [3, 8, 0, 6, 2],
      ejeX: { etiqueta: "Valor" },
      ejeY: { etiqueta: "Frecuencia" },
      poligono: true,
    },
  },
  {
    id: "lineas-ojiva",
    rotulo: "grafico-lineas · ojiva de una serie, categorías = bordes superiores",
    figura: {
      tipo: "grafico-lineas",
      categorias: ["10", "20", "30", "40", "50"],
      series: [{ valores: [3, 11, 11, 17, 19] }],
      ejeX: { etiqueta: "Borde superior" },
      ejeY: { etiqueta: "Frecuencia acumulada" },
    },
  },
  {
    id: "lineas-tres-series",
    rotulo: "grafico-lineas · tres series (trazo y marcador distintos), leyenda",
    figura: {
      tipo: "grafico-lineas",
      categorias: ["A", "B", "C", "D"],
      series: [
        { nombre: "Serie 1", valores: [2, 5, 4, 8] },
        { nombre: "Serie 2", valores: [6, 3, 7, 5] },
        { nombre: "Serie 3", valores: [1, 1, 6, 9] },
      ],
      ejeX: { etiqueta: "Categoría" },
      ejeY: { etiqueta: "Valor" },
    },
  },
  {
    id: "circular-porcentaje",
    rotulo: "grafico-circular · cuatro sectores en porcentaje (12,5 % es el decimal exacto que admite la regla)",
    figura: {
      tipo: "grafico-circular",
      sectores: [
        { etiqueta: "A", valor: 4 },
        { etiqueta: "B", valor: 2 },
        { etiqueta: "C", valor: 1 },
        { etiqueta: "D", valor: 1 },
      ],
      modoEtiqueta: "porcentaje",
    },
  },
  {
    id: "circular-angulo",
    rotulo: "grafico-circular · cinco sectores en ángulo (el quinto no repite el relleno del primero)",
    figura: {
      tipo: "grafico-circular",
      sectores: [
        { etiqueta: "A", valor: 5 },
        { etiqueta: "B", valor: 3 },
        { etiqueta: "C", valor: 2 },
        { etiqueta: "D", valor: 1 },
        { etiqueta: "E", valor: 1 },
      ],
      modoEtiqueta: "angulo",
    },
  },
  {
    id: "circular-ninguno",
    rotulo: "grafico-circular · tres sectores sin texto de modo: el ítem pregunta por la fracción",
    figura: {
      tipo: "grafico-circular",
      sectores: [
        { etiqueta: "A", valor: 3 },
        { etiqueta: "B", valor: 2 },
        { etiqueta: "C", valor: 1 },
      ],
      modoEtiqueta: "ninguno",
    },
  },
];

/* Diagrama de cajón (figura diagrama-cajon, reglas 18 a 24). Datos INVENTADOS
   y nombres abstractos (Grupo A, B, C, D), sin dominio. Se mide la letra a
   390 px, que los rótulos no se pisen y que el eje y los nombres quepan en las
   dos orientaciones. */
const CINCO_CAJAS: FiguraDiagramaCajon["cajas"] = [
  { nombre: "Grupo A", minimo: 4, q1: 12, mediana: 19, q3: 27, maximo: 41, rotulos: true },
  { nombre: "Grupo B", minimo: 9, q1: 17, mediana: 23, q3: 31, maximo: 46, rotulos: true },
  { nombre: "Grupo C", minimo: 2, q1: 10, mediana: 16, q3: 22, maximo: 35, rotulos: true },
  { nombre: "Grupo D", minimo: 13, q1: 21, mediana: 26, q3: 33, maximo: 48, rotulos: true },
  { nombre: "Grupo E", minimo: 6, q1: 14, mediana: 20, q3: 29, maximo: 38, rotulos: true },
];

export const CAJONES_MUESTRA: { id: string; rotulo: string; figura: FiguraDiagramaCajon }[] = [
  {
    id: "horizontal-rotulada",
    rotulo: "una caja horizontal con los cinco valores rotulados y unidad en el eje",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "horizontal",
      eje: { min: 0, max: 40, paso: 5, etiqueta: "minutos" },
      cajas: [{ minimo: 7, q1: 13, mediana: 18.5, q3: 24, maximo: 36, rotulos: true }],
      descripcion: "MUESTRA. Diagrama de cajón horizontal: mínimo 7, primer cuartil 13, mediana 18,5, tercer cuartil 24 y máximo 36 minutos.",
    },
  },
  {
    id: "q1-igual-mediana",
    rotulo: "q1 igual a la mediana: un solo rótulo compartido, en negrita por ser la mediana",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "horizontal",
      eje: { min: 0, max: 60, paso: 10, etiqueta: "puntos", grilla: true },
      cajas: [{ minimo: 8, q1: 22, mediana: 22, q3: 37, maximo: 55, rotulos: true }],
      descripcion: "MUESTRA. Diagrama de cajón horizontal donde el primer cuartil y la mediana valen 22; mínimo 8, tercer cuartil 37 y máximo 55 puntos.",
    },
  },
  {
    id: "tres-verticales",
    rotulo: "tres cajas verticales con grilla y unidad, valores leídos del eje",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 0, max: 50, paso: 10, etiqueta: "kg", grilla: true },
      cajas: [
        { nombre: "Grupo A", minimo: 6, q1: 14, mediana: 21, q3: 27, maximo: 42 },
        { nombre: "Grupo B", minimo: 11, q1: 19, mediana: 24, q3: 33, maximo: 47 },
        { nombre: "Grupo C", minimo: 3, q1: 9, mediana: 16, q3: 18, maximo: 29 },
      ],
      descripcion: "MUESTRA. Tres diagramas de cajón verticales sobre un eje de 0 a 50 kg, grupos A, B y C, para leer sus valores en el eje.",
    },
  },
  {
    id: "dos-verticales-rotuladas",
    rotulo: "dos cajas verticales con rótulos a la derecha de cada caja",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 0, max: 100, paso: 20, grilla: true },
      cajas: [
        { nombre: "Grupo A", minimo: 12, q1: 35, mediana: 52, q3: 68, maximo: 91, rotulos: true },
        { nombre: "Grupo B", minimo: 26, q1: 41, mediana: 55, q3: 73, maximo: 84, rotulos: true },
      ],
      descripcion: "MUESTRA. Dos diagramas de cajón verticales. A: 12, 35, 52, 68 y 91. B: 26, 41, 55, 73 y 84.",
    },
  },
  {
    id: "cuatro-horizontales",
    rotulo: "cuatro cajas horizontales (el tope) con nombres, grilla y valores negativos",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "horizontal",
      eje: { min: -10, max: 40, paso: 10, etiqueta: "°C", grilla: true },
      cajas: [
        { nombre: "Grupo A", minimo: 4, q1: 15, mediana: 21, q3: 26, maximo: 38 },
        { nombre: "Grupo B", minimo: -7, q1: 2, mediana: 9, q3: 13, maximo: 24 },
        { nombre: "Grupo C", minimo: 11, q1: 17, mediana: 19, q3: 23, maximo: 31 },
        { nombre: "Grupo D", minimo: -9, q1: -3, mediana: 1, q3: 6, maximo: 17 },
      ],
      descripcion: "MUESTRA. Cuatro diagramas de cajón horizontales sobre un eje de −10 a 40 °C, grupos A, B, C y D, para comparar rangos.",
    },
  },
  {
    id: "cinco-horizontales-rotuladas",
    rotulo: "cinco cajas horizontales (el tope) con nombres y los cinco valores rotulados",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "horizontal",
      eje: { min: 0, max: 50, paso: 10, etiqueta: "horas", grilla: true },
      cajas: CINCO_CAJAS,
      descripcion: "MUESTRA. Cinco diagramas de cajón horizontales con sus valores rotulados, grupos A a E, sobre un eje de 0 a 50 horas.",
    },
  },
  {
    id: "cinco-verticales-rotuladas",
    rotulo: "cinco cajas verticales (el tope) con nombres y los cinco valores rotulados",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 0, max: 50, paso: 10, etiqueta: "horas", grilla: true },
      cajas: CINCO_CAJAS,
      descripcion: "MUESTRA. Cinco diagramas de cajón verticales con sus valores rotulados, grupos A a E, sobre un eje de 0 a 50 horas.",
    },
  },
  {
    id: "peor-caso-vertical",
    rotulo: "peor caso de marcas en vertical: 11 marcas de 4 cifras (la regla 27 las admite)",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 1000, max: 2000, paso: 100, etiqueta: "gramos", grilla: true },
      cajas: [{ minimo: 1120, q1: 1340, mediana: 1470, q3: 1610, maximo: 1880 }],
      descripcion: "MUESTRA. Un diagrama de cajón vertical sobre un eje de 1.000 a 2.000 gramos con once marcas.",
    },
  },
  {
    id: "peor-caso-horizontal",
    rotulo: "peor caso de marcas en horizontal: 11 marcas de 4 cifras no caben (regla 27); la muestra usa el máximo que admite, 9",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "horizontal",
      eje: { min: 1000, max: 2000, paso: 125, etiqueta: "gramos", grilla: true },
      cajas: [{ minimo: 1120, q1: 1340, mediana: 1470, q3: 1610, maximo: 1880 }],
      descripcion: "MUESTRA. Un diagrama de cajón horizontal sobre un eje de 1.000 a 2.000 gramos con nueve marcas.",
    },
  },
];

/* Peor caso de marcas dentro de una alternativa, donde el viewBox es de 280:
   una alternativa suelta (intacta) con cada orientación. */
export const CAJONES_ALTERNATIVA_MUESTRA: { id: string; rotulo: string; figura: FiguraDiagramaCajon }[] = [
  {
    id: "alternativa-vertical",
    rotulo: "en alternativa, vertical: 11 marcas de 4 cifras (la regla 27 las admite)",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "vertical",
      eje: { min: 1000, max: 2000, paso: 100, grilla: true },
      cajas: [{ minimo: 1120, q1: 1340, mediana: 1470, q3: 1610, maximo: 1880 }],
      descripcion: "MUESTRA. Diagrama de cajón vertical en una alternativa, eje de 1.000 a 2.000 con once marcas.",
    },
  },
  {
    id: "alternativa-horizontal",
    rotulo: "en alternativa, horizontal: 11 marcas de 4 cifras no caben (regla 27); la muestra usa el máximo que admite, 8",
    figura: {
      tipo: "diagrama-cajon",
      orientacion: "horizontal",
      eje: { min: 1000, max: 1700, paso: 100, grilla: true },
      cajas: [{ minimo: 1060, q1: 1210, mediana: 1330, q3: 1460, maximo: 1650 }],
      descripcion: "MUESTRA. Diagrama de cajón horizontal en una alternativa, eje de 1.000 a 1.700 con ocho marcas.",
    },
  },
];

/* Alternativas gráficas (reglas 25 y 26): un ítem de MUESTRA con cuatro
   cajones como alternativas y texto vacío, para descarte y triage. Datos
   INVENTADOS, n = 8 (par: todas las convenciones de cuartiles coinciden). */
const cajonAlternativa = (minimo: number, q1: number, mediana: number, q3: number, maximo: number): FiguraDiagramaCajon => ({
  tipo: "diagrama-cajon",
  orientacion: "horizontal",
  eje: { min: 0, max: 25, paso: 5 },
  cajas: [{ minimo, q1, mediana, q3, maximo, rotulos: true }],
  descripcion: `Cajón con mínimo ${minimo}, primer cuartil ${String(q1).replace(".", ",")}, mediana ${String(mediana).replace(".", ",")}, tercer cuartil ${String(q3).replace(".", ",")} y máximo ${maximo}.`,
});

export const MUESTRA_CAJON_ALTERNATIVAS: ItemAdvance = {
  id: "adv-muestra-cajon",
  unidadId: "muestra",
  moduloId: "medidas-de-posicion",
  habilidad: "representar",
  dificultad: "media",
  tiempoReferenciaSeg: 120,
  enunciado: "MUESTRA. Los datos inventados 3, 7, 8, 11, 14, 16, 19 y 23 ya están ordenados. ¿Cuál diagrama de cajón los representa?",
  alternativas: [
    {
      clave: "A",
      claveOriginal: "A",
      texto: "",
      figura: cajonAlternativa(3, 7, 11, 16, 23),
      esCorrecta: false,
      errorCatalogado: "toma-dato-central-sin-promediar",
      feedbackDescarte: "Toma un solo dato donde hay dos centrales: con n par, cada cuartil es el promedio de dos datos vecinos.",
    },
    {
      clave: "B",
      claveOriginal: "B",
      texto: "",
      figura: cajonAlternativa(3, 7.5, 12.5, 17.5, 23),
      esCorrecta: true,
      feedbackDescarteIncorrecto: "Era la correcta: con 8 datos, Q1 = (7 + 8) : 2, la mediana = (11 + 14) : 2 y Q3 = (16 + 19) : 2.",
    },
    {
      clave: "C",
      claveOriginal: "C",
      texto: "",
      figura: cajonAlternativa(3, 8, 13, 18, 23),
      esCorrecta: false,
      errorCatalogado: "toma-cuartil-como-fraccion-del-rango",
      feedbackDescarte: "Reparte el rango de 3 a 23 en cuartos iguales: los cuartiles cortan la lista de datos, no la escala.",
    },
    {
      clave: "D",
      claveOriginal: "D",
      texto: "",
      figura: cajonAlternativa(7, 7.5, 12.5, 17.5, 19),
      esCorrecta: false,
      errorCatalogado: null,
      feedbackDescarte: "Los bigotes llegan al segundo y al penúltimo dato: el cajón va del mínimo, 3, al máximo, 23.",
    },
  ],
  solucion: "Con n = 8: Q1 = (7 + 8) : 2 = 7,5; mediana = (11 + 14) : 2 = 12,5; Q3 = (16 + 19) : 2 = 17,5. Mínimo 3 y máximo 23.",
};
