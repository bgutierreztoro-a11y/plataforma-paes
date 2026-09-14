import type { ReactNode } from "react";
import { parsearMarkdownLegal, type Bloque, type Inline } from "@/lib/legal/markdownLegal";

/**
 * Cuerpo de un documento legal (content/legal/*.md) como React, sin
 * `dangerouslySetInnerHTML` en ningún caso: todo pasa por el árbol que produce
 * lib/legal/markdownLegal.ts, así que un `<script>` o un `javascript:` en el
 * markdown terminan como texto visible, nunca como HTML.
 *
 * Server Component: el markdown llega ya leído de disco por la página y no
 * hay estado ni interacción.
 *
 * Tipografía y color salen de los tokens de Línea (app/globals.css). Es una
 * página de lectura larga, no una pantalla: la medida la fija `max-w-prose`
 * en la página, acá solo se compone el ritmo vertical.
 */
export function TextoLegal({ markdown }: { markdown: string }) {
  const bloques = parsearMarkdownLegal(markdown);
  return <div className="flex flex-col gap-4">{bloques.map(renderBloque)}</div>;
}

const CLASE_ENLACE =
  "text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong";

function renderInline(nodos: Inline[]): ReactNode[] {
  return nodos.map((n, i) => {
    switch (n.tipo) {
      case "texto":
        return <span key={i}>{n.texto}</span>;
      case "negrita":
        return (
          <strong key={i} className="font-semibold text-primary">
            {renderInline(n.hijos)}
          </strong>
        );
      case "cursiva":
        return <em key={i}>{renderInline(n.hijos)}</em>;
      case "codigo":
        return (
          <code key={i} className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-[0.95em]">
            {n.texto}
          </code>
        );
      case "enlace":
        // El href ya pasó la lista blanca (https: | mailto:) en el parser;
        // acá no se vuelve a decidir. rel por si algún día es target=_blank.
        return (
          <a key={i} href={n.href} rel="noopener noreferrer" className={CLASE_ENLACE}>
            {renderInline(n.hijos)}
          </a>
        );
    }
  });
}

function renderBloque(b: Bloque, i: number): ReactNode {
  switch (b.tipo) {
    case "h1":
      return (
        <h1 key={i} className="mt-6 text-display-m text-primary">
          {renderInline(b.hijos)}
        </h1>
      );
    case "h2":
      return (
        <h2 key={i} id={b.id} className="mt-8 scroll-mt-6 text-titulo-l text-primary">
          {renderInline(b.hijos)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mt-4 text-titulo-m text-primary">
          {renderInline(b.hijos)}
        </h3>
      );
    case "parrafo":
      return (
        <p key={i} className="text-cuerpo-m text-primary">
          {renderInline(b.hijos)}
        </p>
      );
    case "cita":
      return (
        <blockquote
          key={i}
          className="flex flex-col gap-3 border-l-2 border-strong pl-4 text-cuerpo-m text-secondary"
        >
          {b.parrafos.map((p, j) => (
            <p key={j}>{renderInline(p)}</p>
          ))}
        </blockquote>
      );
    case "regla":
      return <hr key={i} className="my-4 border-0 border-t border-hairline" />;
    case "lista": {
      const Etiqueta = b.ordenada ? "ol" : "ul";
      return (
        <Etiqueta
          key={i}
          className={`flex flex-col gap-2 pl-5 text-cuerpo-m text-primary ${
            b.ordenada ? "list-decimal" : "list-disc"
          } marker:text-secondary`}
        >
          {b.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </Etiqueta>
      );
    }
  }
}
