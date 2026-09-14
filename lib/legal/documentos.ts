/**
 * Registro de los documentos legales publicables. La metadata vive acá, tipada,
 * y no en el markdown: el texto lo firma un abogado y no debería tener que
 * saber de front-matter para que la fecha o la versión cambien.
 *
 * `publicado` es el gate: mientras sea false, la ruta responde 404 y el pie no
 * enlaza el documento, exista o no el archivo. `version` y `vigenteDesde` se
 * corrigen a mano en este archivo al firmar el texto, no en el .md.
 */
export type SlugLegal = "terminos" | "privacidad";

export type DocumentoLegal = {
  slug: SlugLegal;
  titulo: string;
  version: string;
  /** ISO yyyy-mm-dd, o null si todavía no hay fecha de vigencia firmada. */
  vigenteDesde: string | null;
  /** Ruta relativa a la raíz del proyecto. */
  archivo: string;
  /** false: la ruta responde 404 y el pie no lo enlaza, aunque el archivo exista. */
  publicado: boolean;
};

export const DOCUMENTOS_LEGALES: readonly DocumentoLegal[] = [
  {
    slug: "terminos",
    titulo: "Términos y condiciones",
    // La que declara la última línea del .md; no se inventa otra.
    version: "5.0",
    vigenteDesde: null,
    archivo: "content/legal/terminos.md",
    // false mientras content/legal/terminos.md sea el borrador: trae el
    // blockquote de revisión legal, 2 notas y 16 campos entre corchetes.
    // Se pone en true en el mismo commit que reemplaza el .md por el texto
    // firmado.
    publicado: false,
  },
  {
    slug: "privacidad",
    titulo: "Política de privacidad",
    version: "1.0",
    vigenteDesde: null,
    archivo: "content/legal/privacidad.md",
    // No tiene .md: /privacidad hoy es app/privacidad/page.tsx en JSX. El
    // enlace fijo del pie sale de lib/legal/cargar.ts (enlacesLegales), no
    // de este gate.
    publicado: false,
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
