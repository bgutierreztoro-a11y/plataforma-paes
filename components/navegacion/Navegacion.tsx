"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, useClerk } from "@clerk/nextjs";
import { useMontado } from "@/lib/useMontado";
import { IconoInicio, IconoCamino, IconoPerfil } from "./IconosNav";

/* "Inicio" apunta a `/`, que es la portada. `/inicio` sigue existiendo pero solo
   como redirección: mandar la barra ahí obligaría a un salto de más en cada
   toque.

   `subrutas` es lo que hace que la barra siga diciendo dónde estás cuando se
   baja un nivel: /tema/[id] es el detalle de un nodo del camino, no un destino
   aparte. Se declara por destino y no con una regla general para que agregar
   una ruta nueva sea una decisión explícita y no un efecto colateral. */
const DESTINOS: {
  href: string;
  etiqueta: string;
  subrutas: string[];
  Icono: typeof IconoInicio;
}[] = [
  { href: "/", etiqueta: "Inicio", subrutas: [], Icono: IconoInicio },
  {
    href: "/camino",
    etiqueta: "Camino",
    subrutas: ["/tema/"],
    Icono: IconoCamino,
  },
];

/* Los destinos y "Perfil" comparten el mismo alto completo y posición relativa
   porque los tres son pestañas de la misma fila; solo los dos primeros marcan
   estado activo (son rutas), "Perfil" abre el modal de cuenta de Clerk y no
   navega a ningún lado. */
const CLASE_DESTINO =
  "relative flex h-full min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-2 text-[11px] motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";

/**
 * Barra de navegación persistente: inferior en móvil, superior en desktop.
 * No se monta dentro de /leccion/[id] — ahí la lección es modo foco y la
 * salida es el enlace "Salir al camino" del propio RunnerLeccion.
 *
 * La pestaña "Perfil" reserva su celda (min-h-11 min-w-11, vía CLASE_DESTINO)
 * antes de montar: `Show` no sabe el estado de sesión durante el SSR, y sin
 * esa celda reservada la barra saltaría al hidratar. Mismo criterio que
 * useMontado en PuntoDePartida y en los caminos de components/camino/.
 */
export function Navegacion() {
  const pathname = usePathname();
  const montado = useMontado();
  const { openUserProfile } = useClerk();

  if (pathname.startsWith("/leccion/")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación principal"
      /* pb con env(safe-area-inset-bottom) empuja la fila h-14 por encima del
         home indicator en iOS sin reducir el alto táctil de cada pestaña; en
         un dispositivo sin notch el env() resuelve a 0 y no cambia nada. */
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] sm:sticky sm:top-0 sm:border-b sm:border-t-0 sm:pb-0"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-around px-4 sm:h-auto sm:justify-start sm:gap-8 sm:px-6 sm:py-3">
        {DESTINOS.map(({ href, etiqueta, subrutas, Icono }) => {
          const activo =
            pathname === href || subrutas.some((ruta) => pathname.startsWith(ruta));

          return (
            <Link
              key={href}
              href={href}
              /* Lo que hace que la barra responda "¿dónde estoy?" también para
                 quien no ve el color. */
              aria-current={activo ? "page" : undefined}
              className={`${CLASE_DESTINO} ${
                activo
                  ? "font-semibold text-accent"
                  : "font-medium text-ink-suave hover:text-ink"
              }`}
            >
              <Icono />
              {etiqueta}
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
        {/* "Perfil" no es una ruta: abre el modal de cuenta de Clerk
            (signed-in, vía openUserProfile) o manda a /ingresar (signed-out),
            pero ocupa la misma celda que Inicio y Camino. El `div` externo
            reserva tamaño (CLASE_DESTINO) antes de montar — Show no conoce el
            estado de sesión durante el SSR — para que no haya salto de layout
            al hidratar; el Link/button interno rellena esa celda entera. */}
        <div className={CLASE_DESTINO}>
          {montado && (
            <>
              <Show when="signed-out">
                <Link
                  href="/ingresar"
                  className="flex h-full w-full flex-col items-center justify-center gap-0.5 font-medium text-ink-suave hover:text-ink"
                >
                  <IconoPerfil />
                  Perfil
                </Link>
              </Show>
              <Show when="signed-in">
                <button
                  type="button"
                  onClick={() => openUserProfile()}
                  className="flex h-full w-full flex-col items-center justify-center gap-0.5 font-medium text-ink-suave hover:text-ink"
                >
                  <IconoPerfil />
                  Perfil
                </button>
              </Show>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
