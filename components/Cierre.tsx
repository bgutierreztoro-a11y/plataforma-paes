"use client";

import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { CierreFinal } from "@/components/CierreFinal";
import type { CierreContenido } from "@/lib/tipos";

export function Cierre({ cierre }: { cierre: CierreContenido }) {
  return (
    <EjecutorSetItems
      items={cierre.items}
      mostrarFeedback={true}
      renderFinal={(respuestas) => <CierreFinal respuestas={respuestas} />}
    />
  );
}
