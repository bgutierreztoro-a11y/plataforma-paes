/* Relativo y con extensión, no con el alias `@/`: este import es de VALOR, y
   `node --test` (npm run test:unit) resuelve el TS sin los alias de tsconfig.
   Los `import type` de este archivo sí pueden usar el alias porque TypeScript
   los borra antes de que Node los vea. */
import { catalogoDelModulo } from "./catalogoErrores.ts";
import type {
  Alternativa,
  CierreContenido,
  DiagnosticoContenido,
  Item,
  Leccion,
} from "@/lib/tipos";

/**
 * FRONTERA DE CLIENTE. Este módulo pasó a importar `lib/catalogoErrores`, que lee
 * disco con `node:fs`, así que ya no es puro y no puede entrar al bundle del
 * navegador.
 *
 * Hoy no entra: los diez archivos de `components/` y `lib/` que lo referencian lo
 * hacen con `import type` (`AlternativaCliente`, `ItemCliente`, `LeccionCliente`,
 * `CierreCliente`, `DiagnosticoCliente`), y TypeScript borra esos imports al
 * compilar. Los únicos imports de valor están en los tres server components de
 * `app/`. Verificado con `npm run build`.
 *
 * Si alguna vez hace falta un import de VALOR desde el cliente, no se cambia acá:
 * se mueve el tipo a `lib/tipos.ts` o se recibe el catálogo por parámetro.
 * Convertir un `import type` de éstos en import normal rompe el build del
 * cliente.
 */

/**
 * Claves que existen en content/*.json para el proceso editorial (proveniencia,
 * auditorías, notas de diseño) o para corregir del lado del servidor (solucion),
 * y que ningún componente renderiza.
 *
 * Un componente cliente recibe sus props serializadas en el payload RSC, que
 * viaja completo al navegador y se lee con "ver código fuente" — no solo lo que
 * se pinta en pantalla. Pasar el objeto de contenido entero publicaba las
 * fuentes de análisis y el razonamiento de las auditorías de originalidad
 * (MOS §7.2: las fuentes no se publican). Por eso el filtro corre en el server
 * component, antes de cruzar la frontera al cliente.
 *
 * `respuestaModelo` no se filtra: BloqueAbierta lo muestra.
 *
 * Nota de alcance (decisión 2026-07-09): `esCorrecta`, `respuestaCorrecta` y el
 * `feedback` por alternativa siguen viajando al cliente. Esconderlos exige
 * verificar la respuesta contra un endpoint, o sea backend, fuera del alcance de
 * v1 (CLAUDE.md). Ver docs/pendientes.md para el razonamiento y el riesgo asumido.
 */
const CLAVES_INTERNAS = [
  "proveniencia",
  "catalogoErrores",
  "contextosNumericos",
  "_notasInternas",
  "notaDiseno",
  "notaVerificacionMatematica",
  "solucion",
] as const;

type ClaveInterna = (typeof CLAVES_INTERNAS)[number];

/**
 * La descripción del error que produjo este distractor, ya resuelta contra el
 * `catalogoErrores` del módulo. Es la Capa 2 del feedback ("el mecanismo del
 * error", no el ejercicio).
 *
 * Existe porque `catalogoErrores` **no puede** viajar al cliente: publicarlo
 * entero entregaría el mapa completo de errores previstos del módulo, incluidos
 * los de ítems que el estudiante todavía no respondió. Resolver en el servidor y
 * mandar solo la descripción del distractor efectivamente elegido da la Capa 2
 * sin abrir el catálogo — y mantiene `catalogoErrores` en CLAVES_INTERNAS.
 *
 * Opcional a propósito: un módulo sin `catalogoErrores` (hoy, todos los cierres)
 * simplemente no la trae y el componente omite la capa. Ver docs/pendientes.md.
 */
export type AlternativaCliente = Alternativa & {
  descripcionError?: string;
  /**
   * Tres descripciones del catálogo del módulo —la que de verdad corresponde a
   * este distractor y dos señuelos— para el paso de autoexplicación: antes de
   * ver la Capa 2, se le pregunta al estudiante cuál describe lo que le pasó.
   *
   * Son EXACTAMENTE tres y salen del `catalogoErrores` existente: no se inventa
   * ningún error. Ausente cuando el catálogo tiene menos de tres entradas o
   * cuando el módulo no tiene catálogo, y ahí el ítem omite el paso entero.
   *
   * Sobre exposición: manda tres descripciones por distractor, no el catálogo
   * completo, y no dice cuál es la verdadera. Cuál lo es se puede deducir del
   * payload cruzándolo con `descripcionError`, que ya viajaba desde la Capa 2 —
   * este campo no abre una vía nueva, agrega dos señuelos a algo ya visible.
   */
  opcionesAutoexplicacion?: string[];
};

export type ItemCliente = Omit<Item, "solucion" | "alternativas"> & {
  alternativas: AlternativaCliente[];
};

export type LeccionCliente = Omit<Leccion, ClaveInterna | "itemsPAES"> & {
  itemsPAES: ItemCliente[];
};

export type DiagnosticoCliente = Omit<DiagnosticoContenido, ClaveInterna | "items"> & {
  items: ItemCliente[];
};

export type CierreCliente = Omit<CierreContenido, ClaveInterna | "items"> & {
  items: ItemCliente[];
};

/**
 * Recorre el árbol y, en cada objeto que declare `errorCatalogado`, agrega la
 * `descripcionError` correspondiente del catálogo del módulo. Corre ANTES de
 * `quitarClavesInternas` — después, `catalogoErrores` ya no existe.
 *
 * Los ids del catálogo embebido son locales ("error-4"), y dentro de un mismo
 * archivo eso es inequívoco. NO lo es entre archivos: `content/errores/` usa
 * ids con unidad ("ecuaciones-inecuaciones/error-4") y los cierres mezclan
 * ítems de dos unidades sin catálogo propio. Por eso la resolución es
 * estrictamente local al archivo: sin `catalogoErrores`, no se resuelve nada.
 * Un id sin entrada se deja sin descripción en vez de adivinar.
 */
/**
 * Los ids que este archivo referencia con `errorCatalogado`, en cualquier
 * profundidad, ordenados por número de id.
 *
 * Es la fuente de los señuelos de autoexplicación, y por eso no se deriva del
 * catálogo: el catálogo de un módulo es más grande que lo que cada archivo
 * ejercita, así que sacar los señuelos de ahí le pediría al estudiante
 * distinguir su error de errores que pertenecen a lecciones que todavía no hizo.
 * Además ataría la pantalla al tamaño del catálogo: cada vez que el catálogo del
 * módulo creciera se moverían los señuelos de todas las lecciones, sin que nadie
 * lo hubiera pedido.
 */
function idsReferenciados(valor: unknown, acumulado = new Set<string>()): Set<string> {
  if (Array.isArray(valor)) {
    for (const v of valor) idsReferenciados(v, acumulado);
    return acumulado;
  }
  if (valor === null || typeof valor !== "object") return acumulado;

  const objeto = valor as Record<string, unknown>;
  if (typeof objeto.errorCatalogado === "string") acumulado.add(objeto.errorCatalogado);
  for (const anidado of Object.values(objeto)) idsReferenciados(anidado, acumulado);
  return acumulado;
}

/** Orden estable por número de id ("error-2" antes que "error-10"), no alfabético. */
function ordenarIds(ids: Iterable<string>): string[] {
  const numero = (id: string) => {
    const m = /error-(\d+)/.exec(id);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  };
  return [...ids].sort((a, b) => numero(a) - numero(b) || a.localeCompare(b));
}

/**
 * Las tres opciones del paso de autoexplicación para un error dado: la real y
 * dos señuelos, tomados de los ids que el propio archivo referencia,
 * recorriéndolos en círculo desde la entrada real.
 *
 * Determinista, sin `Math.random`: el orden se rota según la posición del error
 * real en la lista, así la respuesta verdadera no cae siempre en el mismo
 * lugar —se aprendería el patrón en dos ítems— pero servidor y cliente
 * coinciden y no hay mismatch de hidratación.
 *
 * Un archivo que referencia menos de tres errores distintos no tiene con qué
 * armar la pregunta y omite el paso entero.
 */
function opcionesDeAutoexplicacion(
  idReal: string,
  catalogo: Map<string, string>,
  idsDelArchivo: readonly string[],
): string[] | undefined {
  if (idsDelArchivo.length < 3) return undefined;
  const i = idsDelArchivo.indexOf(idReal);
  if (i === -1) return undefined;

  const tres = [0, 1, 2].map((k) => catalogo.get(idsDelArchivo[(i + k) % idsDelArchivo.length]));
  /* Un señuelo sin descripción dejaría un `undefined` en el payload del
     cliente. Desde que la lista de señuelos dejó de derivarse del catálogo, eso
     es posible en principio, así que el paso se omite en vez de mandar un
     hueco. */
  if (tres.some((d) => d === undefined)) return undefined;

  const giro = i % 3;
  const completas = tres as string[];
  return [...completas.slice(giro), ...completas.slice(0, giro)];
}

function resolverDescripcionesDeError(
  valor: unknown,
  catalogo: Map<string, string>,
  idsDelArchivo: readonly string[],
): unknown {
  if (catalogo.size === 0) return valor;
  if (Array.isArray(valor)) {
    return valor.map((v) => resolverDescripcionesDeError(v, catalogo, idsDelArchivo));
  }
  if (valor === null || typeof valor !== "object") return valor;

  const objeto = valor as Record<string, unknown>;
  const resuelto: Record<string, unknown> = {};
  for (const [clave, anidado] of Object.entries(objeto)) {
    resuelto[clave] = resolverDescripcionesDeError(anidado, catalogo, idsDelArchivo);
  }

  const id = objeto.errorCatalogado;
  if (typeof id === "string") {
    const descripcion = catalogo.get(id);
    if (descripcion) {
      resuelto.descripcionError = descripcion;
      const opciones = opcionesDeAutoexplicacion(id, catalogo, idsDelArchivo);
      if (opciones) resuelto.opcionesAutoexplicacion = opciones;
    }
  }
  return resuelto;
}

/**
 * El catálogo contra el que se resuelve este archivo: la UNIÓN del embebido y el
 * canónico del módulo (`content/errores/<moduloId>.json`), con el canónico
 * ganando cuando un id está en los dos.
 *
 * Unión y no "el canónico si existe, si no el embebido". Esa versión introducía
 * una regresión medida: `lineal-pendiente-e-intercepto` referencia `error-8` a
 * `error-12`, que viven en su array embebido y todavía no en el canónico de
 * `funcion-lineal-afin` —ese módulo tiene dos L1 y solo una está migrada—, así
 * que un canónico no vacío pero incompleto dejaba mudos 18 portadores que antes
 * resolvían. Con la unión, ningún portador pierde resolución en ningún punto de
 * la migración.
 *
 * Que el canónico gane los empates es seguro y no cosmético: se verificó con
 * `node -e` que los 32 pares de catálogos con ids comunes del repo coinciden
 * carácter a carácter, canónico contra embebido incluido, así que en la
 * transición las descripciones que ve el estudiante no cambian.
 *
 * La rama del embebido es de transición y se retira cuando no quede ningún
 * `catalogoErrores` en `content/`. Ahí la unión degenera en el canónico solo.
 */
function catalogoDe(contenido: {
  moduloId?: string;
  catalogoErrores?: { id: string; descripcion: string }[];
}) {
  const catalogo = new Map((contenido.catalogoErrores ?? []).map((e) => [e.id, e.descripcion]));
  for (const [id, descripcion] of catalogoDelModulo(contenido.moduloId)) {
    catalogo.set(id, descripcion);
  }
  return catalogo;
}

function prepararParaCliente<T>(contenido: {
  moduloId?: string;
  catalogoErrores?: { id: string; descripcion: string }[];
}): T {
  return quitarClavesInternas(
    resolverDescripcionesDeError(
      contenido,
      catalogoDe(contenido),
      ordenarIds(idsReferenciados(contenido)),
    ),
  ) as T;
}

/**
 * Recorre el objeto completo, a cualquier profundidad: `_notasInternas` puede
 * colgar de la raíz o de un paso, y `solucion` de cualquier ítem. Filtrar por
 * nombre de clave en todo el árbol es más difícil de romper al agregar un tipo
 * de bloque nuevo que enumerar rutas concretas.
 */
function quitarClavesInternas(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(quitarClavesInternas);
  if (valor === null || typeof valor !== "object") return valor;

  const entradas = Object.entries(valor as Record<string, unknown>)
    .filter(([clave]) => !(CLAVES_INTERNAS as readonly string[]).includes(clave))
    .map(([clave, anidado]) => [clave, quitarClavesInternas(anidado)] as const);

  return Object.fromEntries(entradas);
}

export function sanitizarLeccion(leccion: Leccion): LeccionCliente {
  return prepararParaCliente<LeccionCliente>(leccion);
}

export function sanitizarDiagnostico(diagnostico: DiagnosticoContenido): DiagnosticoCliente {
  return prepararParaCliente<DiagnosticoCliente>(diagnostico);
}

export function sanitizarCierre(cierre: CierreContenido): CierreCliente {
  return prepararParaCliente<CierreCliente>(cierre);
}
