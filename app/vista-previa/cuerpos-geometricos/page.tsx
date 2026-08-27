import type { Metadata } from "next";
import { BloqueVisualizacion } from "@/components/bloques/BloqueVisualizacion";
import { CUERPOS_FUERA_DE_BANDA, CUERPOS_SOLIDO } from "@/e2e/fixtures/cuerposGeometricos";

export const metadata: Metadata = {
  title: "Vista previa — cuerpos geométricos",
  robots: { index: false, follow: false },
};

/**
 * Ruta de previsualización, no de producto: monta el bloque de visualización de
 * cuerpos geométricos con datos de prueba (`e2e/fixtures/`), no con una lección
 * real. Ninguna lección declara este bloque todavía —el módulo
 * `cuerpos-geometricos` no tiene contenido escrito— así que no hay forma de ver
 * ni capturar el componente por el camino normal sin escribir pedagogía, que
 * esta fase de infraestructura tiene prohibido tocar.
 *
 * Mismo patrón y mismo criterio que `/vista-previa/interactivo-dos-variables`.
 * Ningún enlace de la aplicación apunta acá.
 */
export default function VistaPreviaCuerposGeometricos() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="mb-6 rounded-tarjeta border border-dashed border-border-fuerte bg-surface px-4 py-3 text-sm text-ink-suave">
        Vista previa interna. Datos de prueba de <code>e2e/fixtures/</code>, no
        contenido de lección.
      </p>

      <h2 className="mb-3 text-sm font-medium text-ink-tenue">Vista sólido</h2>
      <div className="mb-10 grid gap-5 sm:grid-cols-2">
        {CUERPOS_SOLIDO.map(({ titulo, bloque }) => (
          <section key={titulo} data-caso={titulo}>
            <h3 className="mb-1.5 text-sm text-ink-suave">{titulo}</h3>
            <BloqueVisualizacion bloque={bloque} />
          </section>
        ))}
      </div>

      <h2 className="mb-1.5 text-sm font-medium text-ink-tenue">Fuera de banda</h2>
      <p className="mb-3 text-sm text-ink-suave">
        El type guard los rechaza: tienen que degradar al recuadro de texto con
        su descripción, nunca reventar la página ni dibujarse ilegibles.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {CUERPOS_FUERA_DE_BANDA.map(({ titulo, bloque }) => (
          <section key={titulo} data-caso={titulo}>
            <h3 className="mb-1.5 text-sm text-ink-suave">{titulo}</h3>
            <BloqueVisualizacion bloque={bloque} />
          </section>
        ))}
      </div>
    </div>
  );
}
