import { errorPublico } from "./erroresPublicos.ts";
import { leerIdVideo, type IdVideo } from "./video.ts";

/* Cookie propia `fobos_origen` (docs/recorrido-entrada.md, ADR-02): unidad, error y video, nada personal. */
export const COOKIE_ORIGEN = "fobos_origen";
export const DURACION_ORIGEN_SEG = 7 * 24 * 60 * 60;

export interface Origen {
  unidadId: string;
  errorId: string;
  video: IdVideo | null;
}

export function valorCookieOrigen({ unidadId, errorId, video }: Origen): string {
  return [unidadId, errorId, video ?? ""].join("|");
}

/** La cookie se puede editar en el navegador: solo vale si nombra una página de la lista blanca. */
export function leerCookieOrigen(valor: string | undefined): Origen | null {
  if (!valor) return null;
  const partes = valor.split("|");
  if (partes.length !== 3) return null;
  const [unidadId, errorId, video] = partes;
  if (!errorPublico(unidadId, errorId)) return null;
  if (video !== "" && !leerIdVideo(video)) return null;
  return { unidadId, errorId, video: video === "" ? null : leerIdVideo(video) };
}
