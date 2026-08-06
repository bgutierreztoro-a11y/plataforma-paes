"use client";

import { Boton } from "@/components/ui/Boton";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const esDev = process.env.NODE_ENV === "development";
  return (
    <PantallaCentrada className="gap-4 text-center">
      <h1 className="text-3xl font-semibold text-ink">Algo no funcionó</h1>
      <p className="max-w-md text-base leading-relaxed text-ink-suave">
        {esDev
          ? "Detalle del error (solo visible en desarrollo):"
          : "Ocurrió un error inesperado. Puedes intentar de nuevo."}
      </p>
      {esDev && (
        <pre className="max-w-2xl overflow-x-auto whitespace-pre-wrap rounded-tarjeta border border-error-suave bg-error-suave p-4 text-left font-mono text-xs text-error">
          {error.message}
        </pre>
      )}
      <Boton onClick={reset}>Intentar de nuevo</Boton>
    </PantallaCentrada>
  );
}
