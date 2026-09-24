/** Id del video de origen: el `utm_content` del link (docs/recorrido-entrada.md §4, "v001-deshace-porcentaje"). */
export type IdVideo = string & { readonly __tipo: "IdVideo" };

const FORMATO = /^v\d{3}(-[a-z0-9]+)+$/;
const LARGO_MAXIMO = 60;

/** Llega desde la URL, así que es texto de afuera: solo pasa si calza exacto con el formato. */
export function leerIdVideo(crudo: unknown): IdVideo | null {
  if (typeof crudo !== "string") return null;
  if (crudo.length > LARGO_MAXIMO || !FORMATO.test(crudo)) return null;
  return crudo as IdVideo;
}
