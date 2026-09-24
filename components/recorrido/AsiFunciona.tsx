import type { ReactNode } from "react";
import { LINEAS, NOMBRE_DE_LINEA, estiloDeLinea } from "@/components/ui/linea/colores";
import { ASI_FUNCIONA } from "@/lib/recorrido/textosBienvenida";

/** Una sola pantalla para las dos puertas; la usan /bienvenida y /como-funciona (docs/recorrido-entrada.md §4). */
export function AsiFunciona({ accion }: { accion: ReactNode }) {
  return (
    <section className="space-y-5">
      <h1 className="text-display-m text-primary">{ASI_FUNCIONA.titulo}</h1>
      <p className="text-cuerpo-m text-primary">{ASI_FUNCIONA.intro}</p>
      <ul className="space-y-2">
        {LINEAS.map((linea) => (
          <li key={linea} style={estiloDeLinea(linea)} className="flex items-center gap-3">
            <span aria-hidden="true" className="h-3 w-8 shrink-0 rounded-sm bg-[var(--linea)]" />
            <span className="text-cuerpo-m text-primary">
              Línea {linea} · {NOMBRE_DE_LINEA[linea]}
            </span>
          </li>
        ))}
      </ul>
      <ul className="space-y-3">
        {ASI_FUNCIONA.bloques.map((b) => (
          <li key={b.nombre} className="text-cuerpo-m text-primary">
            <strong className="font-semibold">{b.nombre}</strong> {b.texto}
          </li>
        ))}
      </ul>
      <div className="pt-1">{accion}</div>
    </section>
  );
}
