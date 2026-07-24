import type { Metadata } from "next";
import Link from "next/link";
import { PuertaDeEdad } from "@/components/cuenta/PuertaDeEdad";

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
      <p className="text-center text-sm leading-6 text-ink-suave">
        La cuenta es opcional y sirve para una sola cosa: que no pierdas tu avance si
        cambias de teléfono o borras el navegador.{" "}
        <Link
          href="/lecciones"
          className="font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte"
        >
          Estudiar sin cuenta
        </Link>
      </p>
    </main>
  );
}
