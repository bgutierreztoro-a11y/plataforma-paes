import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { EnlaceBoton } from "@/components/ui/Boton";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

/**
 * El componente prearmado de Clerk, no un formulario propio: renderiza
 * exactamente lo que el dashboard tiene configurado, así que es imposible que
 * aparezca un campo de contraseña o un botón de login social por descuido.
 *
 * routing="hash" en vez del "path" por defecto: con path routing Clerk navega
 * a sub-rutas reales durante la verificación del código, lo que exigiría un
 * segmento catch-all. Acá no hace falta, y en /registrarse además rompería el
 * checkbox de edad (ver el comentario de esa página).
 */
export default function Ingresar() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <SignIn routing="hash" signUpUrl="/registrarse" />
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-center text-sm leading-6 text-ink-suave">
          No necesitas cuenta: todo lo que está publicado es gratis y no requiere
          registro.
        </p>
        <EnlaceBoton href="/inicio" variante="secundario" className="w-full sm:w-auto">
          Seguir sin cuenta
        </EnlaceBoton>
      </div>
    </main>
  );
}
