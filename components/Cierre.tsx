"use client";

import { useState } from "react";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { CierreFinal } from "@/components/CierreFinal";
import { AnuncioPrevioItems } from "@/components/AnuncioPrevioItems";
import { BannerDemostracion } from "@/components/ui/Banner";
import type { CierreCliente } from "@/lib/sanitizar";

export function Cierre({
  cierre,
  ultimaLeccionId,
}: {
  cierre: CierreCliente;
  /* Id de la última lección abierta del camino, calculado en servidor. Solo lo
     usa el evento de "quiero la próxima lección". */
  ultimaLeccionId?: string;
}) {
  const [fase, setFase] = useState<"anuncio" | "items">("anuncio");

  return (
    <div className="flex min-h-full flex-col">
      {cierre.estado !== "publicable" && <BannerDemostracion />}
      {fase === "anuncio" ? (
        <AnuncioPrevioItems
          variante="modulo"
          cantidad={cierre.items.length}
          nombreModulo="Función lineal y afín"
          onEmpezar={() => setFase("items")}
        />
      ) : (
        <EjecutorSetItems
          items={cierre.items}
          mostrarFeedback={true}
          contexto="cierre"
          contextoId="cierre"
          renderFinal={(respuestas) => (
            <CierreFinal respuestas={respuestas} ultimaLeccionId={ultimaLeccionId} />
          )}
        />
      )}
    </div>
  );
}
