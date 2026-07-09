import type { CierreContenido, DiagnosticoContenido, Item, Leccion } from "@/lib/tipos";

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
 * `estado` no se filtra: BannerDemostracion lo necesita. `respuestaModelo`
 * tampoco: BloqueAbierta lo muestra.
 *
 * Nota de alcance (decisión 2026-07-09): `esCorrecta`, `respuestaCorrecta` y el
 * `feedback` por alternativa siguen viajando al cliente. Esconderlos exige
 * verificar la respuesta contra un endpoint, o sea backend, fuera del alcance de
 * v1 (CLAUDE.md). Ver docs/pendientes.md para el razonamiento y el riesgo asumido.
 */
const CLAVES_INTERNAS = [
  "proveniencia",
  "checklistOriginalidad",
  "revisionMatematica",
  "catalogoErrores",
  "contextosNumericos",
  "_notasInternas",
  "notaDiseno",
  "notaVerificacionMatematica",
  "solucion",
] as const;

type ClaveInterna = (typeof CLAVES_INTERNAS)[number];

export type ItemCliente = Omit<Item, "solucion">;

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
  return quitarClavesInternas(leccion) as LeccionCliente;
}

export function sanitizarDiagnostico(diagnostico: DiagnosticoContenido): DiagnosticoCliente {
  return quitarClavesInternas(diagnostico) as DiagnosticoCliente;
}

export function sanitizarCierre(cierre: CierreContenido): CierreCliente {
  return quitarClavesInternas(cierre) as CierreCliente;
}
