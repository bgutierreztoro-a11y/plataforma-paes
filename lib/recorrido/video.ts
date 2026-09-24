/** Id del video de origen: el `utm_content` del link (docs/recorrido-entrada.md §4, "v001-deshace-porcentaje"). */
export type IdVideo = string & { readonly __tipo: "IdVideo" };

const FORMATO = /^v\d{3}-[a-z0-9-]+$/;
const LARGO_MAXIMO = 60;

/** Llega desde la URL, así que es texto de afuera: solo pasa si calza exacto con el formato. */
export function leerIdVideo(crudo: unknown): IdVideo | null {
  if (typeof crudo !== "string") return null;
  if (crudo.length > LARGO_MAXIMO || !FORMATO.test(crudo)) return null;
  return crudo as IdVideo;
}

/** Donde queda el video ya validado para que una recarga no lo pierda. */
export const CLAVE_ESTADO_VIDEO = "fobosVideo";

/**
 * El video de esta visita y la dirección sin parámetros. Manda el `utm_content` de la URL;
 * sin él, el que quedó en `history.state` (la recarga ya no trae la URL original).
 */
export function videoDeLaVisita(
  estado: unknown,
  href: string,
): { video: IdVideo | null; urlLimpia: string | null } {
  const url = new URL(href);
  const guardado =
    estado && typeof estado === "object" ? (estado as Record<string, unknown>)[CLAVE_ESTADO_VIDEO] : null;
  const video = url.searchParams.has("utm_content")
    ? leerIdVideo(url.searchParams.get("utm_content"))
    : leerIdVideo(guardado);
  return { video, urlLimpia: url.search ? url.pathname + url.hash : null };
}
