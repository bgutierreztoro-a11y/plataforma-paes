"use client";

import { usePathname } from "next/navigation";

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
 */
export function PieLegal() {
  const pathname = usePathname();

  if (pathname.startsWith("/leccion/")) {
    return null;
  }

  return (
    <footer className="border-t border-border px-4 py-6 text-center text-xs text-ink-tenue">
      Plataforma independiente, sin vínculo con DEMRE, la Universidad de Chile ni
      ningún preuniversitario. &quot;PAES&quot; se usa solo para describir el
      formato de los ítems.
    </footer>
  );
}
