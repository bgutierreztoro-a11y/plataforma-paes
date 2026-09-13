import { copyDelCatalogo } from "@/lib/advance/copyDeError";
import type { ItemAdvance } from "@/lib/advance/descarte";
import type { FasesPorError, RegistroTriage } from "@/lib/advance/triage";
import type { GrupoDeUnidad, TarjetaDeError } from "@/lib/advance/pantallaErrores";
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
