import type { Metadata } from "next";
import { PuertaDeEdad } from "@/components/cuenta/PuertaDeEdad";
import { EnlaceCuenta } from "@/components/cuenta/EnlaceCuenta";
import { EnlaceBoton } from "@/components/ui/Boton";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

/**
 * Página de servidor (para poder exportar metadata) que monta la puerta de
 * edad como componente de cliente. El formulario de Clerk no se renderiza
 * hasta que la casilla esté marcada — ver components/cuenta/PuertaDeEdad.tsx.
 */
export default function Registrarse() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <PuertaDeEdad />
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-center text-sm leading-6 text-ink-suave">
          La cuenta es opcional. Todo lo que está publicado es gratis y no requiere
          cuenta.
        </p>
        <EnlaceBoton href="/" variante="secundario" className="w-full sm:w-auto">
          Seguir sin cuenta
        </EnlaceBoton>
        {/* Solo aparece con sesión iniciada: es la salida para quien llegó acá
            estando ya adentro. Ver components/cuenta/EnlaceCuenta.tsx. */}
        <EnlaceCuenta />
      </div>
    </main>
  );
}
