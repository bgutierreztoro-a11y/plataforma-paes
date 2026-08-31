import type { Metadata } from "next";
import { PanelCuenta } from "@/components/cuenta/PanelCuenta";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";
import { EnlaceBoton } from "@/components/ui/Boton";

export const metadata: Metadata = {
  title: "Tu cuenta",
  robots: { index: false, follow: false },
};

/**
 * Página de servidor (para poder exportar metadata) que monta la isla de
 * cliente con el acceso a Clerk. Mismo reparto que /registrarse con
 * `PuertaDeEdad`.
 *
 * El copy no promete persistencia del avance, y no es un detalle de redacción:
 * hoy la cuenta crea una fila en `usuarios` y un entitlement gratis, nada más
 * —`docs/plan-fase-3-navegacion.md:14-48` lo verificó en el código—, así que
 * decir que "guarda tu progreso" sería prometerle a un menor una función que no
 * existe a cambio de su correo.
 */
export default function Cuenta() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <EncabezadoDeEntrada rotulo="Cuenta" titulo="Tu cuenta">
        Acá gestionas tu correo y cierras sesión. Es lo único que hace la cuenta
        por ahora.
      </EncabezadoDeEntrada>

      <PanelCuenta />

      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-center text-sm leading-6 text-ink-suave">
          La cuenta es opcional. Todo lo que está publicado es gratis y no
          requiere cuenta.
        </p>
        <EnlaceBoton href="/" variante="secundario" className="w-full sm:w-auto">
          Volver al inicio
        </EnlaceBoton>
      </div>
    </main>
  );
}
