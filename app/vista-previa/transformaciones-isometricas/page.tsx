import type { Metadata } from "next";
import { BloqueVisualizacion } from "@/components/bloques/BloqueVisualizacion";
import { TRANSFORMACIONES, TRANSFORMACIONES_RECHAZADAS } from "@/e2e/fixtures/transformacionesIsometricas";

export const metadata: Metadata = {
  title: "Vista previa — transformaciones isométricas",
  robots: { index: false, follow: false },
};

/**
 * Ruta de previsualización, no de producto: monta el bloque de visualización
 * de transformaciones isométricas con datos de prueba (`e2e/fixtures/`), no
 * con una lección real. Mismo patrón y mismo criterio que
 * `/vista-previa/cuerpos-geometricos`. Ningún enlace de la aplicación apunta acá.
 */
export default function VistaPreviaTransformaciones() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="mb-6 rounded-tarjeta border border-dashed border-border-fuerte bg-surface px-4 py-3 text-sm text-ink-suave">
        Vista previa interna. Datos de prueba de <code>e2e/fixtures/</code>, no
        contenido de lección.
      </p>

      <h2 className="mb-3 text-sm font-medium text-ink-tenue">Escenas</h2>
      <div className="mb-10 grid gap-5 sm:grid-cols-2">
        {TRANSFORMACIONES.map(({ titulo, bloque }) => (
          <section key={titulo} data-caso={titulo}>
            <h3 className="mb-1.5 text-sm text-ink-suave">{titulo}</h3>
            <BloqueVisualizacion bloque={bloque} />
          </section>
        ))}
      </div>

      <h2 className="mb-1.5 text-sm font-medium text-ink-tenue">Rechazados</h2>
      <p className="mb-3 text-sm text-ink-suave">
        El type guard los rechaza: tienen que degradar al recuadro de texto con
        su descripción, nunca reventar la página ni dibujarse ilegibles.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {TRANSFORMACIONES_RECHAZADAS.map(({ titulo, bloque }) => (
          <section key={titulo} data-caso={titulo}>
            <h3 className="mb-1.5 text-sm text-ink-suave">{titulo}</h3>
            <BloqueVisualizacion bloque={bloque} />
          </section>
        ))}
      </div>
    </div>
  );
}
