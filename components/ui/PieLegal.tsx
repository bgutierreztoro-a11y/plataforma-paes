"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EnlaceLegal } from "@/lib/legal/cargar";

/**
 * El deslinde de DEMRE. Obligatorio y no negociable (MOS §11, prioridad 1), así
 * que vive en un solo lugar y se monta desde el layout raíz: duplicar el texto
 * es la forma segura de que un día digan cosas distintas.
 *
 * No se monta dentro de /leccion/[id]. No es que ahí no aplique —aplica en todo
 * el producto—, es que el runner es modo foco: no lleva barra de navegación
 * (ninguna pantalla del runner monta NavInferior) y un pie legal al final de cada
 * paso es andamiaje que el estudiante ya leyó en la portada y volverá a ver al
 * salir al camino. Sigue apareciendo en portada, /camino, /tema, /cierre,
 * /diagnostico y el resto.
 *
 * `enlaces` llega por prop desde el layout (server): este componente es
 * cliente por `usePathname` y no puede leer disco. Los enlaces van debajo
 * del deslinde y solo aparecen si hay alguno; el deslinde no depende de ellos.
 */
export function PieLegal({ enlaces = [] }: { enlaces?: EnlaceLegal[] }) {
  const pathname = usePathname();

  if (pathname.startsWith("/leccion/")) {
    return null;
  }

  return (
    <footer className="border-t border-border px-4 py-6 text-center text-xs text-ink-tenue">
      Plataforma independiente, sin vínculo con DEMRE, la Universidad de Chile ni
      ningún preuniversitario. &quot;PAES&quot; se usa solo para describir el
      formato de los ítems.
      {enlaces.length > 0 && (
        <nav aria-label="Documentos legales" className="mt-3">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="underline underline-offset-4">
                  {e.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </footer>
  );
}
