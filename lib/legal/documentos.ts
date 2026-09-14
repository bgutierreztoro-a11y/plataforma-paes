/**
 * Registro de los documentos legales publicables. La metadata vive acá, tipada,
 * y no en el markdown: el texto lo firma un abogado y no debería tener que
 * saber de front-matter para que la fecha o la versión cambien.
 *
 * `version` y `vigenteDesde` son provisorias hasta la firma del texto: se
 * corrigen a mano en este archivo, no en el .md.
 */
export type SlugLegal = "terminos" | "privacidad";

export type DocumentoLegal = {
  slug: SlugLegal;
  titulo: string;
  version: string;
  /** ISO yyyy-mm-dd. */
  vigenteDesde: string;
  /** Ruta relativa a la raíz del proyecto. */
  archivo: string;
};

export const DOCUMENTOS_LEGALES: readonly DocumentoLegal[] = [
  {
    slug: "terminos",
    titulo: "Términos y condiciones",
    version: "1.0",
    vigenteDesde: "2026-09-14",
    archivo: "content/legal/terminos.md",
  },
  {
    slug: "privacidad",
    titulo: "Política de privacidad",
    version: "1.0",
    vigenteDesde: "2026-09-14",
    archivo: "content/legal/privacidad.md",
  },
];

/**
 * "14 de septiembre de 2026", es-CL. Se arma en UTC para que la fecha ISO no
 * retroceda un día en un servidor con zona horaria negativa.
 */
export function formatearVigencia(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, d)));
}
