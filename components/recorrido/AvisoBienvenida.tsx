"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import { TEXTOS_BIENVENIDA } from "@/lib/recorrido/textosBienvenida";

/**
 * Isla de la portada: con sesión y sin perfil_inicio, el link a /bienvenida. La portada no
 * redirige y sigue estática (docs/recorrido-entrada.md, ADR-03); la pregunta va a la API.
 */
export function AvisoBienvenida() {
  const { isLoaded, isSignedIn } = useAuth();
  const [falta, setFalta] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let vigente = true;
    fetch("/api/recorrido/inicio")
      .then((r) => (r.ok ? r.json() : null))
      .then((datos: { perfil: boolean } | null) => {
        if (vigente && datos && !datos.perfil) setFalta(true);
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [isLoaded, isSignedIn]);

  if (!falta || !isSignedIn) return null;
  return (
    <div className="mb-6">
      <EnlaceBoton href="/bienvenida" variante="secundario">
        {TEXTOS_BIENVENIDA.terminaTuBienvenida}
      </EnlaceBoton>
    </div>
  );
}
