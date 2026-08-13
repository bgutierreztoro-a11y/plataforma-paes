import type {
  Alternativa,
  CierreContenido,
  DiagnosticoContenido,
  Item,
  Leccion,
} from "@/lib/tipos";

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
 * Las tres opciones del paso de autoexplicación para un error dado: la real y
 * dos señuelos, tomados del mismo catálogo recorriéndolo en círculo desde la
 * entrada real.
 *
 * Determinista, sin `Math.random`: el orden se rota según la posición del error
 * real en el catálogo, así la respuesta verdadera no cae siempre en el mismo
 * lugar —se aprendería el patrón en dos ítems— pero servidor y cliente
 * coinciden y no hay mismatch de hidratación.
 */
function opcionesDeAutoexplicacion(idReal: string, catalogo: Map<string, string>): string[] | undefined {
  if (catalogo.size < 3) return undefined;
  const ids = [...catalogo.keys()];
  const i = ids.indexOf(idReal);
  if (i === -1) return undefined;

  const tres = [0, 1, 2].map((k) => catalogo.get(ids[(i + k) % ids.length])!);
  const giro = i % 3;
  return [...tres.slice(giro), ...tres.slice(0, giro)];
}

function resolverDescripcionesDeError(valor: unknown, catalogo: Map<string, string>): unknown {
  if (catalogo.size === 0) return valor;
  if (Array.isArray(valor)) {
    return valor.map((v) => resolverDescripcionesDeError(v, catalogo));
  }
  if (valor === null || typeof valor !== "object") return valor;

  const objeto = valor as Record<string, unknown>;
  const resuelto: Record<string, unknown> = {};
  for (const [clave, anidado] of Object.entries(objeto)) {
    resuelto[clave] = resolverDescripcionesDeError(anidado, catalogo);
  }

  const id = objeto.errorCatalogado;
  if (typeof id === "string") {
    const descripcion = catalogo.get(id);
    if (descripcion) {
      resuelto.descripcionError = descripcion;
      const opciones = opcionesDeAutoexplicacion(id, catalogo);
      if (opciones) resuelto.opcionesAutoexplicacion = opciones;
    }
  }
  return resuelto;
}

function catalogoDe(contenido: { catalogoErrores?: { id: string; descripcion: string }[] }) {
  return new Map((contenido.catalogoErrores ?? []).map((e) => [e.id, e.descripcion]));
}

function prepararParaCliente<T>(contenido: {
  catalogoErrores?: { id: string; descripcion: string }[];
}): T {
  return quitarClavesInternas(
    resolverDescripcionesDeError(contenido, catalogoDe(contenido)),
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
