"use client";

import { useEffect, useRef } from "react";
import { registrarEvento } from "@/lib/eventos";

export type OrigenPuerta = "tramo" | "portada" | "directo";

/**
 * Emite `advance_puerta_vista` una vez por montaje (docs/fobos-advance.md §8).
 *
 * Vive aparte de `PuertaAdvance` a propósito: la puerta es un componente puro
 * que la galería rinde sin flags, y la galería no emite analítica. Solo la
 * ruta /advance/puerta monta este registro. Sin UI.
 */
export function RegistroPuertaVista({
  ejeId,
  origen,
}: {
  ejeId: string | null;
  origen: OrigenPuerta;
}) {
  /* Guard contra el doble efecto de StrictMode en desarrollo, como
     `leccion_inicio` en RunnerLeccion.tsx. */
  const yaRegistrado = useRef(false);
  useEffect(() => {
    if (yaRegistrado.current) return;
    yaRegistrado.current = true;
    registrarEvento({ nombre: "advance_puerta_vista", props: { eje_id: ejeId, origen } });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje
  }, []);
  return null;
}
