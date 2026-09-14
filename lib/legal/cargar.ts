import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DOCUMENTOS_LEGALES, type DocumentoLegal, type SlugLegal } from "./documentos.ts";

/**
 * Lee el cuerpo de un documento legal desde `content/legal/`. Mismo patrón que
 * lib/contenido.ts: `readFileSync` contra `process.cwd()`.
 *
 * A diferencia de las lecciones, un archivo ausente NO es un error: significa
 * "no publicado". La ruta responde 404 y el pie no lo enlaza. Por eso nunca
 * lanza, ni en build ni en runtime, y no valida la forma del markdown: si el
 * archivo existe y trae algo que no sea espacio, está publicado tal cual.
 *
 * Relativo y con extensión, no con `@/`: `node --test` (npm run test:unit)
 * resuelve el TS sin los alias de tsconfig.
 */
export function cargarDocumento(
  slug: SlugLegal,
): { documento: DocumentoLegal; cuerpo: string } | null {
  const documento = DOCUMENTOS_LEGALES.find((d) => d.slug === slug);
  if (!documento) return null;
  const ruta = path.join(process.cwd(), documento.archivo);
  if (!existsSync(ruta)) return null;
  let cuerpo: string;
  try {
    cuerpo = readFileSync(ruta, "utf8");
  } catch {
    return null;
  }
  if (cuerpo.trim() === "") return null;
  return { documento, cuerpo };
}

/** Los documentos cuyo archivo existe y no está vacío. Alimenta los enlaces del pie. */
export function documentosPublicados(): DocumentoLegal[] {
  return DOCUMENTOS_LEGALES.filter((d) => cargarDocumento(d.slug) !== null);
}

export type EnlaceLegal = { href: string; titulo: string };

/**
 * Los enlaces legales que muestran el pie y el cierre de cada documento.
 *
 * Sale de `documentosPublicados()` más una excepción fija (decisión
 * 2026-09-14): /privacidad hoy es app/privacidad/page.tsx con la prosa en JSX,
 * no un .md, así que no aparece en `documentosPublicados()` pero está viva y
 * enlazada desde el registro. Se lista siempre. Cuando esa página migre a
 * content/legal/privacidad.md, esta excepción se borra y el .md la reemplaza
 * solo, sin duplicarse: el filtro de abajo descarta el slug repetido.
 */
export function enlacesLegales(): EnlaceLegal[] {
  const publicados = documentosPublicados().map((d) => ({
    href: `/${d.slug}`,
    titulo: d.titulo,
  }));
  const privacidad = DOCUMENTOS_LEGALES.find((d) => d.slug === "privacidad");
  if (privacidad && !publicados.some((e) => e.href === "/privacidad")) {
    publicados.push({ href: "/privacidad", titulo: privacidad.titulo });
  }
  return publicados;
}
