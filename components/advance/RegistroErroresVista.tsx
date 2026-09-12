"use client";

import { useEffect, useRef } from "react";
import type { EstadoDeError, FaseError } from "@/lib/advance/dominio";
import { registrarEvento } from "@/lib/eventos";

/** Lo único del estado que el evento necesita; p(L) no cruza al cliente (D10). */
export type EstadoParaVista = Pick<EstadoDeError, "fase" | "recaidas">;

/**
 * Emite `advance_errores_vista` una vez por montaje (docs/fobos-advance.md §8).
 *
 * Mismo patrón que `RegistroPuertaVista`: isla sin UI, aparte de `ListaErrores`,
 * que es puro y la galería /_design monta sin emitir analítica. Solo la rama
 * con sesión y acceso de /advance/errores monta este registro. Recibe el estado
 * ya calculado (el mismo que alimenta las tarjetas), no calcula nada dos veces
 * ni lee datos.
 */
export function RegistroErroresVista({ estados }: { estados: readonly EstadoParaVista[] }) {
  /* Guard contra el doble efecto de StrictMode en desarrollo, como en
     RegistroPuertaVista.tsx. */
  const yaRegistrado = useRef(false);
  useEffect(() => {
    if (yaRegistrado.current) return;
    yaRegistrado.current = true;
    const porFase: Record<FaseError, number> = { "sin-datos": 0, abierto: 0, observacion: 0, cerrado: 0 };
    let recaidas = 0;
    for (const estado of estados) {
      porFase[estado.fase] += 1;
      if (estado.recaidas >= 1) recaidas += 1;
    }
    registrarEvento({
      nombre: "advance_errores_vista",
      props: { total: estados.length, recaidas, ...porFase },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje
  }, []);
  return null;
}
