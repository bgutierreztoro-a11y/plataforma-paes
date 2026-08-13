/**
 * Tipos del motor de diagnóstico adaptativo.
 *
 * El diagnóstico es un test adaptativo de longitud variable: el dominio es un
 * DAG de unidades con aristas de prerrequisito, el estado del alumno es una
 * probabilidad de dominio por unidad, y cada respuesta se propaga por el grafo.
 * El test termina cuando se acaba la incertidumbre, no cuando se acaban las
 * preguntas.
 *
 * Este archivo solo describe formas de datos. La aritmética está en `motor.ts`,
 * la topología en `dag.ts` y la lectura pedagógica del resultado en `plan.ts`.
 */

/** Los cuatro ejes del temario M1. */
export type Eje = "numeros" | "algebra" | "geometria" | "probabilidad";

/**
 * Una unidad del dominio y sus prerrequisitos directos.
 *
 * `prerrequisitos` lista ids de unidades que van ANTES. La arista apunta del
 * prerrequisito a quien lo necesita, así que los ancestros de una unidad son
 * sus prerrequisitos (transitivos) y los descendientes, quienes dependen de
 * ella.
 */
export type UnidadDominio = {
  id: string;
  nombre: string;
  eje: Eje;
  prerrequisitos: string[];
};

/** El archivo `content/diagnostico/dag-m1.json` deserializado. */
export type DominioSerializado = {
  id: string;
  nota?: string;
  unidades: UnidadDominio[];
};

/**
 * Qué tan seguro dice estar el alumno de su propia respuesta. Se le pregunta
 * después de responder y antes de mostrarle si acertó, para que la respuesta no
 * quede contaminada por saber el resultado.
 */
export type Confianza = "lo-sabia" | "lo-deduje" | "adivine";

/**
 * Una alternativa de un ítem de diagnóstico.
 *
 * `errorCatalogado` va SOLO en las incorrectas: es el id del error específico
 * que produce esa alternativa. Es lo que convierte un distractor en evidencia
 * diagnóstica en vez de en un simple "no". Las correctas no lo llevan.
 */
export type AlternativaDiagnostico = {
  clave: string;
  texto: string;
  esCorrecta: boolean;
  errorCatalogado?: string;
};

/**
 * Un ítem de diagnóstico.
 *
 * `aislante` significa que el ítem mide SU unidad y nada más: se puede fallar
 * sin arrastrar el fallo de un prerrequisito. El selector solo entrega ítems
 * aislantes, porque un fallo en un ítem no aislante no dice cuál de las dos
 * unidades falló y rompe la propagación por el DAG.
 *
 * Desde que se eliminó el sistema de `estado` (2026-08-12) el tipo no lleva
 * campos de gobernanza: la Regla 8 (`esServible` en `motor.ts`) pasó a exigir
 * que el ítem esté completo —enunciado con texto y exactamente 4 alternativas
 * con una sola correcta—, que es lo que el selector necesita para no servir
 * basura. La revisión del contenido ocurre antes de que el archivo entre al
 * repositorio, no como un flag dentro del propio ítem.
 */
export type ItemDiagnostico = {
  id: string;
  unidadId: string;
  aislante: boolean;
  enunciado: string;
  alternativas: AlternativaDiagnostico[];
};

/** Un fallo ya ocurrido, con el error que lo produjo. */
export type FalloRegistrado = {
  errorCatalogado: string;
};

/**
 * Creencia acumulada sobre una unidad.
 *
 * `logOdds` arranca en 0 (p = 0,5: no sabemos nada) y se mueve con cada
 * respuesta, propia o propagada desde el DAG. `requiereConfirmacion` marca la
 * hipótesis abierta por un fallo único: hasta cerrarla el test no puede
 * terminar.
 */
export type EstadoUnidad = {
  unidadId: string;
  logOdds: number;
  itemsVistos: number;
  fallos: FalloRegistrado[];
  requiereConfirmacion: boolean;
};

/**
 * Qué se puede afirmar sobre una unidad al terminar.
 *
 * Regla dura: solo `error-confirmado` autoriza NOMBRARLE el error al alumno.
 * Un fallo abre una hipótesis, no un diagnóstico; decirle "tu problema es X"
 * con un solo dato es inventar.
 */
export type CausaDiagnosticada =
  | "error-confirmado"
  | "punto-debil"
  | "a-reforzar"
  | "sin-datos";
