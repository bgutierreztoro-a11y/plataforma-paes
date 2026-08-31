import type { Metadata } from "next";
import { ENLACES_NAV, NavInferior } from "@/components/ui/linea/NavInferior";

export const metadata: Metadata = {
  title: "Tú",
  description: "Tu avance por línea en Matemática M1.",
};

/**
 * Pantalla 11 del HTML de referencia. **Andamiaje: solo el título.**
 *
 * El avance real —racha, estaciones, ítems y las cuatro barras por línea— llega
 * cuando haya progreso persistido de dónde leerlo. Hoy no lo hay: el progreso
 * pedagógico no sobrevive a un reload, con cuenta o sin ella
 * (`docs/plan-fase-3-navegacion.md:14-31`, verificado en el código). Pintar
 * cifras de muestra acá sería afirmar en pantalla justo lo que no existe.
 *
 * **Esta pantalla no es la cuenta.** Acá va avance pedagógico; la identidad
 * —correo, cerrar sesión— vive en /cuenta y se llega por el flujo de auth.
 *
 * Sin `estiloDeLinea()`: muestra las cuatro líneas en paralelo, así que no hay
 * una activa. Mismo criterio que /errores.
 */
export default function PaginaTu() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-3xl font-semibold text-ink">Tú</h1>
      </main>
      <NavInferior
        activo="tu"
        enlaces={ENLACES_NAV}
        className="sticky bottom-0 z-40"
      />
    </div>
  );
}
