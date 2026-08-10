"use client";

import { Boton } from "@/components/ui/Boton";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const esDev = process.env.NODE_ENV === "development";
  return (
    <PantallaCentrada className="gap-5 text-center">
      <EncabezadoDeEntrada titulo="Algo no funcionó">
        {esDev
          ? "Detalle del error (solo visible en desarrollo):"
          : "Ocurrió un error inesperado. Puedes intentar de nuevo."}
      </EncabezadoDeEntrada>
      {/* El rojo se queda: esto es fallo de sistema, que es el único uso que el
          sistema le reserva a `--color-error` (ver PanelFeedback.tsx). */}
      {esDev && (
        <pre className="max-w-2xl overflow-x-auto whitespace-pre-wrap rounded-tarjeta border border-error-suave bg-error-suave p-4 text-left font-mono text-xs text-error">
          {error.message}
        </pre>
      )}
      <div className="w-full max-w-md">
        <Boton anchoCompleto onClick={reset}>
          Intentar de nuevo
        </Boton>
      </div>
    </PantallaCentrada>
  );
}
