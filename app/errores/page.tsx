import type { Metadata } from "next";
import { ENLACES_NAV, NavInferior } from "@/components/ui/linea/NavInferior";

export const metadata: Metadata = {
  title: "Errores",
  description:
    "Las confusiones detrás de las preguntas falladas, para repasarlas dirigido.",
};

/**
 * Pantalla 10 del HTML de referencia. **Andamiaje: solo el título.**
 *
 * El contenido real —la lista de errores vivos con su conteo y su línea— llega
 * cuando exista de dónde leerlo. No se inventan datos de muestra: una lista
 * falsa de "4 errores vivos" se ve terminada y esconde que no hay nada detrás.
 *
 * Sin `estiloDeLinea()`: esta pantalla cruza líneas —la 10 del HTML mezcla
 * errores de la 02 y la 03 en la misma lista—, así que no hay una línea activa
 * que instalar. El ítem activo de la barra cae a tinta por el valor de raíz de
 * `--linea-nav` (`app/globals.css:130-135`).
 */
export default function PaginaErrores() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-3xl font-semibold text-ink">Errores</h1>
      </main>
      <NavInferior
        activo="errores"
        enlaces={ENLACES_NAV}
        className="sticky bottom-0 z-40"
      />
    </div>
  );
}
