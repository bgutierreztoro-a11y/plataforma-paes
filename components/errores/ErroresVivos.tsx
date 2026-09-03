"use client";

import { useEffect, useState } from "react";
import { ListaErroresVivos } from "./ListaErroresVivos";
import { erroresVivosDeSesion, type ErrorVivo } from "@/lib/erroresVivos";
import { ocurrenciasDeErrorDeSesion } from "@/lib/progresoSesion";

/**
 * Lee el conteo de errores de la sesión —memoria de módulo, cliente— y arma la
 * lista de la pantalla 10.
 *
 * La lectura va en un efecto y no en el render: el estado de sesión no existe en
 * el servidor, y el primer paint del cliente tiene que coincidir con el HTML
 * server-renderizado —lista vacía— para no romper la hidratación. Es el mismo
 * motivo por el que `ItemPAES` congela su rótulo de error en un efecto.
 *
 * Tras hidratar, si la sesión trae errores, se rellena. Al recargar la página el
 * conteo se perdió y queda el estado vacío honesto — ver
 * `docs/deuda-errores-vivos.md`.
 */
export function ErroresVivos() {
  const [filas, setFilas] = useState<ErrorVivo[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única del estado de sesión tras hidratar, ver doc arriba
    setFilas(erroresVivosDeSesion(ocurrenciasDeErrorDeSesion()));
  }, []);

  return <ListaErroresVivos filas={filas} />;
}
