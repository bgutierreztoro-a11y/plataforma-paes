import type { Metadata } from "next";
import { ErroresVivos } from "@/components/errores/ErroresVivos";
import { ENLACES_NAV, NavInferior } from "@/components/ui/linea/NavInferior";

export const metadata: Metadata = {
  title: "Errores",
  description:
    "Las confusiones detrás de las preguntas falladas, para repasarlas dirigido.",
};

/**
 * Pantalla 10 del HTML de referencia.
 *
 * Muestra los "errores vivos" de la sesión: cada error catalogado en el que se
 * cayó en esta pestaña, con su conteo, del más repetido al menos. El dato sale
 * de `lib/progresoSesion.ts` —memoria de módulo, muere al recargar—, así que
 * `<ErroresVivos>` es un island cliente y el caso normal —llegar desde la barra
 * en una pestaña nueva— es el estado vacío, que se pinta como tal: no se
 * inventan filas de ejemplo.
 *
 * Lo que el HTML de referencia promete y la sesión todavía no puede sostener
 * —el chip con el id del error, el fragmento "· línea 0N", el "· N min" del CTA
 * y la extinción "dos veces seguidas", que acá es solo copy— está registrado en
 * `docs/deuda-errores-vivos.md`. El CTA "Repasar" queda deshabilitado: no hay
 * ruta de repaso dirigido.
 *
 * Sin `estiloDeLinea()`: esta pantalla cruza líneas —la 10 mezcla errores de la
 * 02 y la 03 en una sola lista—, así que no hay una línea activa que instalar.
 * El ítem activo de la barra cae a tinta por el valor de raíz de `--linea-nav`
 * (`app/globals.css:130-135`).
 */
export default function PaginaErrores() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <ErroresVivos />
      </main>
      <NavInferior
        activo="errores"
        enlaces={ENLACES_NAV}
        className="sticky bottom-0 z-40"
      />
    </div>
  );
}
