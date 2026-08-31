"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { useMontado } from "@/lib/useMontado";

/**
 * El enlace a /cuenta para quien ya tiene sesión iniciada.
 *
 * Va en el pie de /ingresar y /registrarse porque son las dos pantallas donde
 * alguien con sesión puede terminar por accidente —vuelve a "entrar" cuando ya
 * está adentro— y ahí el enlace es la respuesta correcta. No entra en
 * `NavInferior`: sus cuatro destinos son producto, no identidad.
 *
 * Solo se pinta con sesión: sin ella no hay cuenta que gestionar y estas dos
 * pantallas ya ofrecen el formulario que corresponde.
 *
 * Isla de cliente por lo mismo que `PanelCuenta`: la versión servidor de `Show`
 * forzaría render dinámico de la ruta
 * (`docs/plan-fase-3-navegacion.md:171-177`). `useMontado` evita el parpadeo del
 * enlace al hidratar, cuando `Show` todavía no conoce el estado de sesión.
 */
export function EnlaceCuenta() {
  const montado = useMontado();

  if (!montado) {
    return null;
  }

  return (
    <Show when="signed-in">
      <Link
        href="/cuenta"
        className="text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte"
      >
        Ir a tu cuenta
      </Link>
    </Show>
  );
}
