import type { Metadata } from "next";

import { Demostracion } from "./Demostracion";

export const metadata: Metadata = {
  title: "Vista previa — interactivo parábola",
  robots: { index: false, follow: false },
};

/**
 * Ruta de previsualización, no de producto: monta `objeto: "parabola"` con datos
 * de prueba (`e2e/fixtures/`), no con una lección real. Ningún archivo de
 * `content/` declara este objeto todavía — el módulo `funcion-cuadratica` está
 * sin escribir — así que no hay forma de ver ni capturar el componente por el
 * camino normal sin redactar contenido, que esta tanda tiene prohibido tocar.
 *
 * Ningún enlace de la aplicación apunta acá, igual que
 * `/vista-previa/interactivo-dos-variables`: es navegable por URL directa para
 * pruebas internas, no parte del camino del estudiante.
 */
export default function VistaPreviaInteractivoParabola() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="mb-6 rounded-tarjeta border border-dashed border-border-fuerte bg-surface px-4 py-3 text-sm text-ink-suave">
        Vista previa interna. Datos de prueba de <code>e2e/fixtures/</code>, no
        contenido de lección.
      </p>
      <Demostracion />
    </div>
  );
}
