"use client";

import { Boton } from "@/components/ui/Boton";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const esDev = process.env.NODE_ENV === "development";
  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Algo no funcionó</h1>
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
    </div>
  );
}
