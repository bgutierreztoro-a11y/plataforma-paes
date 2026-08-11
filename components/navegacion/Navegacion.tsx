"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { useMontado } from "@/lib/useMontado";

/* "Inicio" apunta a `/`, que es la portada. `/inicio` sigue existiendo pero solo
   como redirección: mandar la barra ahí obligaría a un salto de más en cada
   toque.

   `subrutas` es lo que hace que la barra siga diciendo dónde estás cuando se
   baja un nivel: /tema/[id] es el detalle de un nodo del camino, no un destino
   aparte. Se declara por destino y no con una regla general para que agregar
   una ruta nueva sea una decisión explícita y no un efecto colateral. */
const DESTINOS: { href: string; etiqueta: string; subrutas: string[] }[] = [
  { href: "/", etiqueta: "Inicio", subrutas: [] },
  { href: "/camino", etiqueta: "Camino", subrutas: ["/tema/"] },
];

const CLASE_ENLACE =
  "text-sm font-medium text-ink-suave hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/* Los destinos llevan su propio base porque son los únicos que marcan estado
   activo: necesitan alto completo (para colgar el indicador de los bordes de la
   barra) y posición relativa. "Entrar" no marca nada y se queda con
   CLASE_ENLACE. */
const CLASE_DESTINO =
  "relative flex h-full min-h-11 items-center justify-center px-1 text-sm motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";

/**
 * Barra de navegación persistente: inferior en móvil, superior en desktop.
 * No se monta dentro de /leccion/[id] — ahí la lección es modo foco y la
 * salida es el enlace "Salir al camino" del propio RunnerLeccion.
 *
 * El slot de Cuenta reserva tamaño fijo (h-9 w-20) antes de montar: `Show` no
 * sabe el estado de sesión durante el SSR, y sin ese slot reservado la barra
 * saltaría al hidratar. Mismo criterio que useMontado en PuntoDePartida y en
 * los caminos de components/camino/.
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
      className="fixed inset-x-0 bottom-0 z-40 h-14 border-t border-border bg-surface/90 backdrop-blur-md sm:sticky sm:top-0 sm:h-auto sm:border-b sm:border-t-0"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-around px-4 sm:h-auto sm:justify-start sm:gap-8 sm:px-6 sm:py-3">
        {DESTINOS.map((destino) => {
          const activo =
            pathname === destino.href ||
            destino.subrutas.some((ruta) => pathname.startsWith(ruta));

          return (
            <Link
              key={destino.href}
              href={destino.href}
              /* Lo que hace que la barra responda "¿dónde estoy?" también para
                 quien no ve el color. */
              aria-current={activo ? "page" : undefined}
              className={`${CLASE_DESTINO} ${
                activo
                  ? "font-semibold text-accent"
                  : "font-medium text-ink-suave hover:text-ink"
              }`}
            >
              {destino.etiqueta}
              {activo && (
                /* El indicador se cuelga del borde de la barra, y ese borde
                   cambia de lado con el layout: la barra va abajo en móvil, así
                   que la marca va arriba; en escritorio va al revés. El -bottom-3
                   compensa el sm:py-3 del contenedor para tocar el borde. */
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-accent sm:top-auto sm:-bottom-3"
                />
              )}
            </Link>
          );
        })}
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
