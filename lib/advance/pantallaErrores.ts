import type { EstadoDeError, FaseError } from "./dominio.ts";

/**
 * Lo que la pantalla /advance/errores muestra de cada error, y nada más. Puro.
 *
 * Es la capa de presentación de `dominio.ts`: los nombres de fase del dominio
 * no se renombran, se traducen acá (D8). `sin-datos` no genera tarjeta (D9);
 * un error observado que no está en el catálogo de su unidad se omite, porque
 * sin descripción no hay nada útil que mostrar (D12); p(L) no se copia al
 * modelo de vista, así que la pantalla no puede mostrarlo ni por descuido
 * (D10). La recaída viaja como booleano y la pantalla la dice con texto (D11).
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
  errorId: string;
  descripcion: string;
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
  estados: readonly EstadoDeError[],
  catalogo: ReadonlyMap<string, string>,
): TarjetaDeError[] {
  const tarjetas: TarjetaDeError[] = [];
  for (const estado of estados) {
    if (estado.fase === "sin-datos") continue;
    const descripcion = catalogo.get(estado.errorId);
    if (descripcion === undefined) continue;
    tarjetas.push({
      errorId: estado.errorId,
      descripcion,
      fase: FASE_VISIBLE[estado.fase],
      recaida: estado.recaidas >= 1,
      ultimoIntentoMs: estado.ultimoIntentoMs ?? 0,
    });
  }
  return tarjetas.sort(
    (a, b) =>
      ORDEN_FASES.indexOf(a.fase) - ORDEN_FASES.indexOf(b.fase) ||
      b.ultimoIntentoMs - a.ultimoIntentoMs,
  );
}
