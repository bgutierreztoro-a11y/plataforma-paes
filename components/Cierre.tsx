"use client";

import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { CierreFinal } from "@/components/CierreFinal";
import { BannerDemostracion } from "@/components/ui/Banner";
import type { CierreCliente } from "@/lib/sanitizar";

export function Cierre({ cierre }: { cierre: CierreCliente }) {
  return (
    <div className="flex min-h-full flex-col">
      {cierre.estado !== "publicable" && <BannerDemostracion />}
      <EjecutorSetItems
        items={cierre.items}
        mostrarFeedback={true}
        renderFinal={(respuestas) => <CierreFinal respuestas={respuestas} />}
      />
    </div>
  );
}
