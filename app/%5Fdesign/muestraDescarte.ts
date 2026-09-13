import { copyDelCatalogo } from "@/lib/advance/copyDeError";
import type { ItemAdvance } from "@/lib/advance/descarte";
import type { GrupoDeUnidad, TarjetaDeError } from "@/lib/advance/pantallaErrores";
import type { EntradaError, RepasoDeError } from "@/lib/catalogoErrores";

/**
 * Ítems de MUESTRA para la galería del modo descarte. Texto obviamente de
 * demostración: no es contenido, no vive en content/, no lo importa ninguna
 * ruta de producto y no pasa por el validador. Los ids de error son los del
 * catálogo de porcentaje solo para que el rótulo "Error 0N" se vea como en
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
        errorCatalogado: "error-3",
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
        errorCatalogado: "error-7",
        feedbackDescarte: "Muestra: texto del descarte acertado del segundo distractor.",
      },
      {
        clave: "D",
        claveOriginal: "B",
        texto: "Muestra: distractor tres",
        esCorrecta: false,
        errorCatalogado: "error-1",
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
        errorCatalogado: "error-7",
        feedbackDescarte: "Muestra: descarte acertado del primer distractor del segundo ítem.",
      },
      {
        clave: "B",
        claveOriginal: "D",
        texto: "Muestra: distractor dos",
        esCorrecta: false,
        errorCatalogado: "error-6",
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
        errorCatalogado: "error-7",
        feedbackDescarte: "Muestra: descarte acertado del tercer distractor del segundo ítem.",
      },
    ],
    solucion: "Muestra: resolución del segundo ítem.",
  },
];

/** Descripciones de MUESTRA por id local, con la forma de `catalogoDelModulo`. */
export const CATALOGO_MUESTRA: Record<string, string> = {
  "error-1": "Muestra: descripción del primer error del catálogo, como la leería el estudiante.",
  "error-3": "Muestra: descripción del tercer error del catálogo.",
  "error-6": "Muestra: descripción del sexto error del catálogo.",
  "error-7": "Muestra: descripción del séptimo error del catálogo, el que más se repite en la muestra.",
};

/* El catálogo completo de MUESTRA, con la forma de `catalogoCompletoDelModulo`
   (F4c): tres errores con titulo + apoyo y error-6 solo con descripcion, el
   mismo que va sin apoyo en `TARJETAS_UNA_UNIDAD`, para ver la caída de
   `copyDeError` en la pantalla final. */
const CATALOGO_COMPLETO_MUESTRA = new Map<string, EntradaError>([
  ["error-1", { id: "error-1", descripcion: CATALOGO_MUESTRA["error-1"], titulo: "Muestra: título del primer error", apoyo: "Muestra: apoyo del primer error." }],
  ["error-3", { id: "error-3", descripcion: CATALOGO_MUESTRA["error-3"], titulo: "Muestra: título del tercer error", apoyo: "Muestra: apoyo del tercer error." }],
  ["error-6", { id: "error-6", descripcion: CATALOGO_MUESTRA["error-6"] }],
  ["error-7", { id: "error-7", descripcion: CATALOGO_MUESTRA["error-7"], titulo: "Muestra: título del séptimo error", apoyo: "Muestra: apoyo del séptimo error, el que más se repite." }],
]);

/** Lo que recibe `ResultadoDescarte` en la galería: el mismo camino que la ruta real. */
export const COPY_MUESTRA = copyDelCatalogo(CATALOGO_COMPLETO_MUESTRA);

/* Grupos de MUESTRA para /advance/errores (§6.3, F4b): los estados que hoy no
   existen en Neon. `ejeId: null` en el primero para que la galería instale la
   línea desde afuera y mida las cuatro; el segundo trae ejes reales (D13).
   Una tarjeta (error-6) sin `apoyo`, para ver la caída de F4b en pantalla. */
const TARJETAS_UNA_UNIDAD: TarjetaDeError[] = [
  { unidadId: "muestra", errorId: "error-7", titulo: "Muestra: título del séptimo error", apoyo: "Muestra: apoyo del séptimo error, el que más se repite.", fase: "por-repasar", recaida: true, ultimoIntentoMs: 3 },
  { unidadId: "muestra", errorId: "error-1", titulo: "Muestra: título del primer error", apoyo: "Muestra: apoyo del primer error.", fase: "por-repasar", recaida: false, ultimoIntentoMs: 2 },
  { unidadId: "muestra", errorId: "error-3", titulo: "Muestra: título del tercer error", apoyo: "Muestra: apoyo del tercer error.", fase: "en-estudio", recaida: false, ultimoIntentoMs: 2 },
  { unidadId: "muestra", errorId: "error-6", titulo: CATALOGO_MUESTRA["error-6"], fase: "superado", recaida: false, ultimoIntentoMs: 1 },
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
          { unidadId: "muestra-geometria", errorId: "error-1", titulo: "Muestra: título del primer error", apoyo: "Muestra: apoyo del primer error.", fase: "por-repasar", recaida: false, ultimoIntentoMs: 1 },
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
