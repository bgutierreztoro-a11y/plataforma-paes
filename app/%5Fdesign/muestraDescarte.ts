import { copyDelCatalogo } from "@/lib/advance/copyDeError";
import type { FiguraIsometrias, ItemAdvance } from "@/lib/advance/descarte";
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
