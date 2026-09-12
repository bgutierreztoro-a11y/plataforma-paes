import type { EntradaError } from "../catalogoErrores.ts"; // solo tipo: el módulo lee disco. Extensión `.ts` explícita, la misma convención del import vecino `./dominio.ts`
import type { EstadoDeError, FaseError } from "./dominio.ts";

/**
 * Lo que la pantalla /advance/errores muestra de cada error, y nada más. Puro.
 *
 * Es la capa de presentación de `dominio.ts`: los nombres de fase del dominio
 * no se renombran, se traducen acá (D8). `sin-datos` no genera tarjeta (D9);
 * un error observado que no está en el catálogo de su unidad se omite, porque
 * sin catálogo no hay nada útil que mostrar (D12); p(L) no se copia al modelo
 * de vista, así que la pantalla no puede mostrarlo ni por descuido (D10). La
 * recaída viaja como booleano y la pantalla la dice con texto (D11).
 *
 * F4b: la tarjeta pasa de `descripcion` (ficha de autor) a `titulo` + `apoyo`
 * (copy para el estudiante). Un error del catálogo sin `titulo` todavía —hoy,
 * cualquier módulo que no sea porcentaje— cae a `descripcion` y sin `apoyo`,
 * para no dejar la tarjeta muda mientras el resto de los catálogos no tiene
 * este copy. `unidadId` se agrega a la tarjeta porque `TarjetaEstadoError`
 * arma con él el link al repaso (`/advance/errores/<unidadId>/<errorId>`).
 */
export type FaseVisible = "por-repasar" | "en-estudio" | "superado";

/** Orden en pantalla: primero lo que hay que trabajar. */
export const ORDEN_FASES: readonly FaseVisible[] = ["por-repasar", "en-estudio", "superado"];

const FASE_VISIBLE: Record<Exclude<FaseError, "sin-datos">, FaseVisible> = {
  abierto: "por-repasar",
  observacion: "en-estudio",
  cerrado: "superado",
};

export interface TarjetaDeError {
  unidadId: string;
  errorId: string;
  /** `titulo` del catálogo; si el error no lo tiene todavía, `descripcion`. */
  titulo: string;
  /** Solo cuando el catálogo trae `apoyo`; sin él, ausente (no vacío). */
  apoyo?: string;
  fase: FaseVisible;
  recaida: boolean;
  ultimoIntentoMs: number;
}

export interface GrupoDeUnidad {
  unidadId: string;
  /** Nombre técnico DEMRE de la unidad, el único que sale a pantalla. */
  titulo: string;
  /** Eje del temario al que pertenece, para el color de línea; null si no se resuelve. */
  ejeId: string | null;
  tarjetas: TarjetaDeError[];
}

/**
 * Tarjetas de una unidad, ya en el orden de pantalla: por fase según
 * `ORDEN_FASES` y, dentro de cada fase, último intento más reciente arriba.
 */
export function tarjetasDeUnidad(
  unidadId: string,
  estados: readonly EstadoDeError[],
  catalogo: ReadonlyMap<string, EntradaError>,
): TarjetaDeError[] {
  const tarjetas: TarjetaDeError[] = [];
  for (const estado of estados) {
    if (estado.fase === "sin-datos") continue;
    const entrada = catalogo.get(estado.errorId);
    if (entrada === undefined) continue;
    const tarjeta: TarjetaDeError = {
      unidadId,
      errorId: estado.errorId,
      titulo: entrada.titulo ?? entrada.descripcion,
      fase: FASE_VISIBLE[estado.fase],
      recaida: estado.recaidas >= 1,
      ultimoIntentoMs: estado.ultimoIntentoMs ?? 0,
    };
    if (entrada.apoyo) tarjeta.apoyo = entrada.apoyo;
    tarjetas.push(tarjeta);
  }
  return tarjetas.sort(
    (a, b) =>
      ORDEN_FASES.indexOf(a.fase) - ORDEN_FASES.indexOf(b.fase) ||
      b.ultimoIntentoMs - a.ultimoIntentoMs,
  );
}
