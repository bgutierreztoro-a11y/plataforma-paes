import type { EntradaError } from "../catalogoErrores.ts"; // solo tipo: el módulo lee disco. Extensión `.ts` explícita, la misma convención de `./pantallaErrores.ts`

/**
 * Lo que una pantalla de Advance muestra de un error del catálogo cuando lo
 * nombra: `titulo` y, si existe, `apoyo`. Puro.
 *
 * Es la regla de caída de F4b, escrita una vez para `ResultadoDescarte` (F4c):
 * un error del catálogo sin `titulo` todavía (hoy, cualquier módulo que no sea
 * porcentaje) cae a `descripcion` y sin `apoyo`, para no dejar la tarjeta muda
 * mientras el resto de los catálogos no tiene este copy. `tarjetasDeUnidad`
 * en `./pantallaErrores.ts` aplica la misma regla en línea desde F4b y no se
 * tocó al escribir este módulo: si cambia acá, cambia allá.
 */
export interface CopyDeError {
  /** `titulo` del catálogo; si el error no lo tiene todavía, `descripcion`. */
  titulo: string;
  /** Solo cuando el catálogo trae `apoyo`; sin él, ausente (no vacío). */
  apoyo?: string;
}

export function copyDeError(entrada: EntradaError): CopyDeError {
  const copy: CopyDeError = { titulo: entrada.titulo ?? entrada.descripcion };
  if (entrada.apoyo) copy.apoyo = entrada.apoyo;
  return copy;
}

/**
 * El catálogo completo proyectado a copy, por id local, con la forma que cruza
 * la frontera servidor → cliente como prop (un `Record`, no un `Map`).
 */
export function copyDelCatalogo(catalogo: ReadonlyMap<string, EntradaError>): Record<string, CopyDeError> {
  const copy: Record<string, CopyDeError> = {};
  for (const [id, entrada] of catalogo) copy[id] = copyDeError(entrada);
  return copy;
}
