import type { Metadata } from "next";
import { AvancePersonal } from "@/components/tu/AvancePersonal";
import { ENLACES_NAV, NavInferior } from "@/components/ui/linea/NavInferior";
import { ejesDelCamino } from "@/lib/camino";

export const metadata: Metadata = {
  title: "Tú",
  description: "Tu avance por línea en Matemática M1.",
};

/**
 * Pantalla 11 del HTML de referencia.
 *
 * Server component: cruza la taxonomía con los archivos en disco vía
 * `ejesDelCamino()` y le pasa a la isla los cuatro ejes con sus temas ya
 * resueltos. Mismo reparto que /camino, que recibe exactamente la misma
 * estructura — el estado depende del progreso y ese vive en el dispositivo, así
 * que lo resuelve el cliente.
 *
 * **Esta pantalla no es la cuenta.** Acá va avance pedagógico; la identidad
 * —correo, cerrar sesión— vive en /cuenta y se llega por el flujo de auth. Lo
 * único que la 11 toma de la sesión es el nombre de pila, y solo si existe.
 *
 * Lo que el HTML promete y el progreso no puede sostener —racha, ítems
 * acumulados, y el conteo de *estaciones* en vez de lecciones— está registrado
 * en `docs/deuda-avance-por-linea.md` con el detalle de por qué. Se pinta lo que
 * se puede afirmar y el resto se muestra sin dato: una cifra falsa acá es peor
 * que una celda vacía.
 *
 * Sin `estiloDeLinea()`: muestra las cuatro líneas en paralelo, así que no hay
 * una activa. Cada fila instala la suya. Mismo criterio que /errores.
 */
export default function PaginaTu() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <AvancePersonal ejes={ejesDelCamino()} />
      </main>
      <NavInferior
        activo="tu"
        enlaces={ENLACES_NAV}
        className="sticky bottom-0 z-40"
      />
    </div>
  );
}
