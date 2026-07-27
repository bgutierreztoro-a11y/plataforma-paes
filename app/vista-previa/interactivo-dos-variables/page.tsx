import type { Metadata } from "next";
import { BloqueInteractivo } from "@/components/bloques/BloqueInteractivo";
import { FIXTURE_BLOQUE_DOS_VARIABLES } from "@/e2e/fixtures/bloqueDosVariables";

export const metadata: Metadata = {
  title: "Vista previa — interactivo dos variables",
  robots: { index: false, follow: false },
};

/**
 * Ruta de previsualización, no de producto: monta la variante `dosVariables`
 * del bloque interactivo con datos de prueba (`e2e/fixtures/`), no con una
 * lección real. Ninguna lección publicada declara este bloque todavía —
 * `content/lecciones/l2-pendiente-e-intercepto.json` solo usa `unaVariable` —
 * así que no hay forma de ver ni capturar el componente por el camino normal
 * sin escribir contenido de lección, que este trabajo tiene prohibido tocar.
 *
 * Ningún enlace de la aplicación apunta acá, igual que `l0-demo` o
 * `/diagnostico` con su cartel de demostración: es navegable por URL directa
 * para pruebas internas, no parte del camino del estudiante.
 */
export default function VistaPreviaInteractivoDosVariables() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="mb-6 rounded-tarjeta border border-dashed border-border-fuerte bg-surface px-4 py-3 text-sm text-ink-suave">
        Vista previa interna. Datos de prueba de <code>e2e/fixtures/</code>, no
        contenido de lección.
      </p>
      <BloqueInteractivo bloque={FIXTURE_BLOQUE_DOS_VARIABLES} />
    </div>
  );
}
