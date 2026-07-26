"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { useMontado } from "@/lib/useMontado";

const DESTINOS = [
  { href: "/inicio", etiqueta: "Inicio" },
  { href: "/camino", etiqueta: "Camino" },
] as const;

const CLASE_ENLACE =
  "text-sm font-medium text-ink-suave hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Barra de navegación persistente: inferior en móvil, superior en desktop.
 * No se monta dentro de /leccion/[id] — ahí la lección es modo foco y la
 * salida es el enlace "Salir al camino" del propio RunnerLeccion.
 *
 * El slot de Cuenta reserva tamaño fijo (h-9 w-20) antes de montar: `Show` no
 * sabe el estado de sesión durante el SSR, y sin ese slot reservado la barra
 * saltaría al hidratar. Mismo criterio que useMontado en ChipLeccionCompletada
 * y PuntoDePartida.
 */
export function Navegacion() {
  const pathname = usePathname();
  const montado = useMontado();

  if (pathname.startsWith("/leccion/")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 h-14 border-t border-border bg-surface sm:sticky sm:top-0 sm:h-auto sm:border-b sm:border-t-0"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-around px-4 sm:h-auto sm:justify-start sm:gap-8 sm:px-6 sm:py-3">
        {DESTINOS.map((destino) => (
          <Link key={destino.href} href={destino.href} className={CLASE_ENLACE}>
            {destino.etiqueta}
          </Link>
        ))}
        <div className="flex h-9 w-20 items-center justify-center sm:ml-auto sm:justify-end">
          {montado && (
            <>
              <Show when="signed-out">
                <Link href="/ingresar" className={CLASE_ENLACE}>
                  Entrar
                </Link>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
