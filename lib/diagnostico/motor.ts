/**
 * Motor del diagnóstico adaptativo.
 *
 * Test adaptativo de longitud variable sobre un DAG de unidades. El estado del
 * alumno es una creencia por unidad, guardada en log-odds y arrancando en 0
 * (p = 0,5: no sabemos nada). Cada respuesta mueve su unidad y se PROPAGA por
 * el grafo: acertar sube la creencia sobre los prerrequisitos, fallar la baja
 * sobre los dependientes. El test termina cuando se acaba la incertidumbre.
 *
 * Por qué log-odds y no probabilidad directa: en log-odds la evidencia se suma
 * y la actualización es una suma, no una multiplicación con normalización. La
 * atenuación por distancia (`GAMMA^d`) se vuelve entonces una simple escala del
 * sumando, y nada puede sacar la probabilidad del intervalo (0, 1).
 *
 * Todo acá es determinista y sin efectos: `registrarRespuesta` devuelve un
 * estado nuevo en vez de mutar el que recibe.
 */

import {
  BANDA_INDECISION,
  GAMMA,
  K,
  MAX_ITEMS,
  MIN_ITEMS,
  PESO_ACIERTO,
  PESO_FALLO,
  PROFUNDIDAD_MAX,
} from "./constantes.ts";
import { ancestros, centralidad, descendientes, type Dag } from "./dag.ts";
import { ContenidoInvalidoError } from "../errores.ts";
import type {
  CausaDiagnosticada,
  Confianza,
  EstadoUnidad,
  ItemDiagnostico,
} from "./tipos.ts";

/** Estado completo de una sesión de diagnóstico. */
export type EstadoDiagnostico = {
  /** Creencia por unidad, en el orden de declaración del DAG. */
  unidades: Map<string, EstadoUnidad>;
  /** Total de ítems respondidos en la sesión (no por unidad). */
  itemsVistos: number;
  /** Ids ya preguntados: ningún ítem se repite dentro de una sesión. */
  itemsUsados: Set<string>;
};

/** Lo que contesta el alumno a un ítem. */
export type Respuesta = {
  clave: string;
  confianza: Confianza;
};

/** p = 1 / (1 + e^-L). */
export function probabilidad(logOdds: number): number {
  return 1 / (1 + Math.exp(-logOdds));
}

/** Estado inicial: toda unidad en L = 0, o sea p = 0,5 y cero evidencia. */
export function crearEstado(dag: Dag): EstadoDiagnostico {
  const unidades = new Map<string, EstadoUnidad>();
  for (const unidad of dag.unidades) {
    unidades.set(unidad.id, {
      unidadId: unidad.id,
      logOdds: 0,
      itemsVistos: 0,
      fallos: [],
      requiereConfirmacion: false,
    });
  }
  return { unidades, itemsVistos: 0, itemsUsados: new Set() };
}

function clonar(estado: EstadoDiagnostico): EstadoDiagnostico {
  const unidades = new Map<string, EstadoUnidad>();
  for (const [id, u] of estado.unidades) {
    unidades.set(id, { ...u, fallos: [...u.fallos] });
  }
  return {
    unidades,
    itemsVistos: estado.itemsVistos,
    itemsUsados: new Set(estado.itemsUsados),
  };
}

/**
 * Aplica una respuesta y devuelve el estado nuevo.
 *
 * Acierto: `L[u] += K·peso`, y cada ancestro a distancia `d ≤ PROFUNDIDAD_MAX`
 * recibe `K·peso·GAMMA^d`. Si el alumno resolvió esto, probablemente maneja lo
 * que viene antes.
 *
 * Fallo: `L[u] -= K·peso`, cada descendiente a distancia `d` recibe
 * `−K·peso·GAMMA^d`, y se registra el error catalogado del distractor elegido.
 * Si esto falló, lo que se apoya encima está en duda.
 */
export function registrarRespuesta(
  estado: EstadoDiagnostico,
  dag: Dag,
  item: ItemDiagnostico,
  claveElegida: string,
  confianza: Confianza,
): EstadoDiagnostico {
  if (!dag.porId.has(item.unidadId)) {
    throw new ContenidoInvalidoError(
      `El ítem ${item.id} apunta a la unidad ${item.unidadId}, que no está en el DAG.`,
    );
  }

  const elegida = item.alternativas.find((a) => a.clave === claveElegida);
  if (!elegida) {
    throw new ContenidoInvalidoError(
      `El ítem ${item.id} no tiene la alternativa ${claveElegida}.`,
    );
  }

  const siguiente = clonar(estado);
  const unidad = siguiente.unidades.get(item.unidadId)!;
  const acierto = elegida.esCorrecta;
  const peso = acierto ? PESO_ACIERTO[confianza] : PESO_FALLO[confianza];
  const delta = K * peso;

  if (acierto) {
    unidad.logOdds += delta;
    for (const [id, d] of ancestros(dag, item.unidadId, PROFUNDIDAD_MAX)) {
      siguiente.unidades.get(id)!.logOdds += delta * GAMMA ** d;
    }
  } else {
    if (!elegida.errorCatalogado) {
      throw new ContenidoInvalidoError(
        `La alternativa ${claveElegida} del ítem ${item.id} es incorrecta y no declara errorCatalogado.`,
      );
    }
    unidad.logOdds -= delta;
    for (const [id, d] of descendientes(dag, item.unidadId, PROFUNDIDAD_MAX)) {
      siguiente.unidades.get(id)!.logOdds -= delta * GAMMA ** d;
    }
    unidad.fallos.push({ errorCatalogado: elegida.errorCatalogado });
  }

  unidad.itemsVistos += 1;
  siguiente.itemsVistos += 1;
  siguiente.itemsUsados.add(item.id);
  unidad.requiereConfirmacion = necesitaConfirmacion(unidad);

  return siguiente;
}

/**
 * Un fallo único con la creencia ya en negativo abre una hipótesis, y el test
 * no puede terminar con una hipótesis abierta: hay que volver a preguntar por
 * esa unidad.
 *
 * **Decisión de implementación** (el marco fija cuándo se PRENDE la marca, no
 * cuándo se apaga): la confirmación se gasta con el segundo ítem de la unidad,
 * sea cual sea su resultado. A partir de ahí ya hay dos datos y la causa queda
 * determinada —`error-confirmado`, `punto-debil` o `a-reforzar`—, así que
 * insistir no agregaría información. Sin esta regla la marca no se apagaría
 * nunca y todo diagnóstico con un fallo correría hasta `MAX_ITEMS`.
 */
function necesitaConfirmacion(unidad: EstadoUnidad): boolean {
  return unidad.itemsVistos === 1 && unidad.fallos.length === 1 && unidad.logOdds < 0;
}

/**
 * Regla 8 (2026-08-02, reescrita el 2026-08-12): el selector solo sirve ítems
 * estructuralmente completos. Los dos gates de gobernanza que tenía —`estado`
 * y `revisionMatematica.aprobada`— desaparecieron con el sistema de estado: la
 * revisión del contenido ocurre antes de que el archivo entre al repositorio,
 * no como un flag que el motor consulta en runtime.
 *
 * Lo que queda es la parte que el motor sí puede y debe verificar por su
 * cuenta: que el ítem tenga enunciado y exactamente 4 alternativas con una
 * sola correcta. Un ítem mal formado queda afuera del banco servible en vez de
 * tirar abajo el selector con una excepción cruda, que es el mismo criterio
 * defensivo de la versión anterior.
 */
export function esServible(item: ItemDiagnostico): boolean {
  return (
    typeof item.enunciado === "string" &&
    item.enunciado.trim().length > 0 &&
    Array.isArray(item.alternativas) &&
    item.alternativas.length === 4 &&
    item.alternativas.filter((a) => a?.esCorrecta === true).length === 1
  );
}

/** Ítems del banco que sirven para preguntar por `unidadId` y no se han usado. */
function itemsDisponibles(
  estado: EstadoDiagnostico,
  banco: ItemDiagnostico[],
  unidadId: string,
): ItemDiagnostico[] {
  return banco.filter(
    (item) =>
      item.unidadId === unidadId &&
      item.aislante &&
      esServible(item) &&
      !estado.itemsUsados.has(item.id),
  );
}

/**
 * Unidades con una hipótesis abierta que además se PUEDE cerrar, o sea que
 * todavía tienen ítem con qué preguntar. Una confirmación sin ítems no bloquea
 * el término del test: sería esperar una respuesta que nadie puede dar.
 */
function confirmacionesPendientes(
  estado: EstadoDiagnostico,
  banco: ItemDiagnostico[],
): EstadoUnidad[] {
  return [...estado.unidades.values()].filter(
    (u) => u.requiereConfirmacion && itemsDisponibles(estado, banco, u.unidadId).length > 0,
  );
}

/**
 * Elige el próximo ítem, o `null` si no queda ninguno que preguntar.
 *
 * Orden de decisión:
 *   1. Si hay hipótesis abiertas, se cierra una de esas antes que nada.
 *   2. Si no, la unidad con `|L|` mínimo: donde más incertidumbre hay.
 *   3. Empate: mayor centralidad en el DAG.
 *   4. Empate perfecto: orden de declaración del DAG.
 * Solo entran unidades con ítems aislantes sin usar.
 */
export function siguienteItem(
  estado: EstadoDiagnostico,
  dag: Dag,
  banco: ItemDiagnostico[],
): ItemDiagnostico | null {
  const candidatas = dag.unidades
    .map((u) => estado.unidades.get(u.id)!)
    .filter((u) => itemsDisponibles(estado, banco, u.unidadId).length > 0);

  if (candidatas.length === 0) return null;

  const pendientes = candidatas.filter((u) => u.requiereConfirmacion);
  const elegibles = pendientes.length > 0 ? pendientes : candidatas;

  // `reduce` sin ordenar: recorre en orden de declaración y solo reemplaza ante
  // una mejora estricta, así que el primer declarado gana los empates.
  const unidad = elegibles.reduce((mejor, actual) =>
    prefiereA(dag, actual, mejor) ? actual : mejor,
  );

  const disponibles = itemsDisponibles(estado, banco, unidad.unidadId);

  if (unidad.requiereConfirmacion) {
    const yaVistos = new Set(unidad.fallos.map((f) => f.errorCatalogado));
    const mismoError = disponibles.find((item) =>
      item.alternativas.some(
        (a) => !a.esCorrecta && a.errorCatalogado !== undefined && yaVistos.has(a.errorCatalogado),
      ),
    );
    if (mismoError) return mismoError;
  }

  return disponibles[0];
}

/** `true` si `a` debe preguntarse antes que `b`. Ver `siguienteItem`. */
function prefiereA(dag: Dag, a: EstadoUnidad, b: EstadoUnidad): boolean {
  const incertidumbreA = Math.abs(a.logOdds);
  const incertidumbreB = Math.abs(b.logOdds);
  if (incertidumbreA !== incertidumbreB) return incertidumbreA < incertidumbreB;
  return centralidad(dag, a.unidadId) > centralidad(dag, b.unidadId);
}

/** `true` si la unidad ya salió de la banda de indecisión, para cualquier lado. */
function fueraDeBanda(unidad: EstadoUnidad): boolean {
  const [piso, techo] = BANDA_INDECISION;
  return unidad.logOdds < piso || unidad.logOdds > techo;
}

/**
 * Regla de parada.
 *
 * Bajo `MIN_ITEMS` el test sigue siempre; en `MAX_ITEMS` para siempre. En el
 * medio, para cuando ninguna unidad sigue indecisa y no queda ninguna hipótesis
 * abierta. Se agrega una salida que el marco no nombra pero que el código
 * necesita: si no queda ítem que preguntar, el test termina — con el piso de
 * `MIN_ITEMS` sin cumplir si el banco se quedó corto.
 */
export function debeTerminar(
  estado: EstadoDiagnostico,
  dag: Dag,
  banco: ItemDiagnostico[],
): boolean {
  if (estado.itemsVistos >= MAX_ITEMS) return true;
  if (siguienteItem(estado, dag, banco) === null) return true;
  if (estado.itemsVistos < MIN_ITEMS) return false;
  if (confirmacionesPendientes(estado, banco).length > 0) return false;
  return [...estado.unidades.values()].every(fueraDeBanda);
}

/**
 * Corre el diagnóstico completo contra un `responder` sincrónico. Es el bucle
 * de referencia del motor: define el orden exacto entre parada, selección y
 * registro, y es el que se pone a prueba en los tests.
 */
export function ejecutarDiagnostico(
  dag: Dag,
  banco: ItemDiagnostico[],
  responder: (item: ItemDiagnostico, estado: EstadoDiagnostico) => Respuesta,
): EstadoDiagnostico {
  let estado = crearEstado(dag);
  while (!debeTerminar(estado, dag, banco)) {
    const item = siguienteItem(estado, dag, banco);
    if (item === null) break;
    const respuesta = responder(item, estado);
    estado = registrarRespuesta(estado, dag, item, respuesta.clave, respuesta.confianza);
  }
  return estado;
}

/**
 * Qué se puede afirmar sobre una unidad al terminar.
 *
 *   sin ítems               → `sin-datos` (lo que se sepa de ella vino del DAG)
 *   ≥2 fallos, mismo error  → `error-confirmado`
 *   ≥2 fallos, distintos    → `punto-debil`
 *   1 fallo                 → `a-reforzar`, esté acompañado de acierto o solo
 *   ítems vistos, 0 fallos  → `null`: no hay nada que diagnosticar
 *
 * El marco define el caso de 1 fallo como "1 fallo + 1 acierto". La rama de
 * `fallos.length === 1` no mira `itemsVistos` a propósito, así que cubre igual
 * las dos formas en que un fallo se queda sin confirmar: que el test corte por
 * `MAX_ITEMS` justo después de fallar, o que a esa unidad ya no le queden ítems
 * aislantes con qué preguntar de nuevo. En las tres formas hay un solo dato, la
 * lectura conservadora es la misma y el error no se nombra.
 */
export function causaDeUnidad(unidad: EstadoUnidad): CausaDiagnosticada | null {
  if (unidad.itemsVistos === 0) return "sin-datos";
  if (unidad.fallos.length === 0) return null;
  if (unidad.fallos.length === 1) return "a-reforzar";

  const errores = unidad.fallos.map((f) => f.errorCatalogado);
  const todosIguales = errores.every((e) => e === errores[0]);
  return todosIguales ? "error-confirmado" : "punto-debil";
}

/**
 * El único punto por el que un error puede llegar a la pantalla del alumno.
 *
 * **Regla dura:** solo `error-confirmado` autoriza nombrar el error. Cualquier
 * otra causa devuelve `null` y la UI no tiene de dónde sacar el nombre. Un
 * fallo abre una hipótesis, no un diagnóstico, y decirle a alguien "tu problema
 * es X" con un solo dato es inventar con cara de precisión.
 */
export function errorNombrable(unidad: EstadoUnidad): string | null {
  if (causaDeUnidad(unidad) !== "error-confirmado") return null;
  return unidad.fallos[0].errorCatalogado;
}
