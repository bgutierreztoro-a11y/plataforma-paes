import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TextoLegal } from "@/components/legal/TextoLegal";
import { cargarDocumento, enlacesLegales } from "@/lib/legal/cargar";
import { DOCUMENTOS_LEGALES, formatearVigencia } from "@/lib/legal/documentos";

const SLUG = "terminos" as const;

/**
 * /terminos. Ruta estática (no hay `[documento]` dinámico a propósito): cada
 * documento legal es una página con nombre propio y su propio metadata.
 *
 * El cuerpo se lee de content/legal/terminos.md en build. Si el archivo no
 * existe o está vacío, el documento no está publicado y la ruta responde 404
 * sin romper el build (lib/legal/cargar.ts). El encabezado de página —título
 * y línea de versión— sale de lib/legal/documentos.ts y se pinta siempre
 * arriba del cuerpo, aunque el markdown traiga su propio H1.
 *
 * Los robots los fija app/layout.tsx (noindex global); acá no se tocan.
 */
export function generateMetadata(): Metadata {
  const documento = DOCUMENTOS_LEGALES.find((d) => d.slug === SLUG);
  return { title: documento?.titulo };
}

export default function PaginaTerminos() {
  const cargado = cargarDocumento(SLUG);
  if (!cargado) notFound();
  const { documento, cuerpo } = cargado;
  const otros = enlacesLegales().filter((e) => e.href !== `/${SLUG}`);

  return (
    <main className="mx-auto w-full max-w-prose px-4 py-12 sm:py-16">
      <header className="border-b border-strong pb-6">
        <h1 className="text-display-l text-primary">{documento.titulo}</h1>
        {/* Sin fecha firmada no hay "Vigente desde": no se inventa una. */}
        <p className="mt-4 text-cuerpo-s text-secondary">
          Versión {documento.version}.
          {documento.vigenteDesde !== null && (
            <>
              {" "}
              Vigente desde{" "}
              <time dateTime={documento.vigenteDesde}>
                {formatearVigencia(documento.vigenteDesde)}
              </time>
            </>
          )}
        </p>
      </header>

      <article className="mt-8">
        <TextoLegal markdown={cuerpo} />
      </article>

      {otros.length > 0 && (
        <nav aria-label="Otros documentos" className="mt-12 border-t border-hairline pt-6">
          <ul className="flex flex-col gap-2 text-cuerpo-m">
            {otros.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
                >
                  {e.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
