"use client";

import { useState } from "react";
import { EjecutorSetItems } from "@/components/EjecutorSetItems";
import { CierreFinal } from "@/components/CierreFinal";
import { AnuncioPrevioItems } from "@/components/AnuncioPrevioItems";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import type { CierreCliente } from "@/lib/sanitizar";

export function Cierre({
  cierre,
  ejeId,
  ultimaLeccionId,
  siguienteTemaId,
}: {
  cierre: CierreCliente;
  /* Eje del tema al que pertenece este cierre, resuelto en servidor
     (lib/camino.ts:79). Llega solo el id y no el `tema` entero: es lo único que
     esta pantalla necesita, y el objeto completo arrastra las lecciones al
     payload RSC sin que nadie las use. */
  ejeId: string;
  /* Id de la última lección abierta del camino, calculado en servidor. Solo lo
     usa el evento de "quiero la próxima lección". */
  ultimaLeccionId?: string;
  /* Id del tema que sigue en el temario, calculado en servidor
     (`siguienteTemaConNodo`). Lo usa el CTA secundario del resultado. Sin él,
     éste es el último tema con contenido. */
  siguienteTemaId?: string;
}) {
  const [fase, setFase] = useState<"anuncio" | "items">("anuncio");

  /* La línea del eje, igual que en /camino, /tema/[id] y /leccion/[id]: el
     estudiante entra desde un tema ya pintado y el color no puede apagarse justo
     en la pantalla que cierra el módulo. */
  const linea = lineaDeEje(ejeId);

  return (
    /* Una sola instalación, acá. Este div envuelve las dos fases **y** la
       pantalla de resultado, que no es una ruta ni un estado propio: cuelga de
       `EjecutorSetItems` vía `renderFinal`, así que hereda por árbol DOM sin
       necesitar su propio `style`.

       Un eje fuera del mapa devuelve `undefined` y no se pone `style`: el
       fallback es el default de `:root` en app/globals.css:130-135 —`--linea:
       var(--text-primary)` y sus cinco derivados en tinta neutra—, que es la
       segunda mitad de la misma regla. Escribir los seis tokens a mano acá
       duplicaría esa tabla en un segundo lugar. */
    <div className="flex min-h-full flex-col" style={linea ? estiloDeLinea(linea) : undefined}>
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
          /* La pill y el sustantivo de la maqueta. `contextoId="cierre"` NO se
             toca: es el balde único de docs/deuda-cierre.md §2 y arreglarlo
             exige decidir qué pasa con el progreso ya guardado en los
             dispositivos, que no es una decisión de marco. */
          rotulo="Cierre PAES"
          sustantivo="Ítem"
          contexto="cierre"
          contextoId="cierre"
          renderFinal={(respuestas) => (
            /* `cierre.items` viaja por closure y no por `EjecutorSetItems`: el
               ejecutor es agnóstico de qué se hace con las respuestas, y
               ensancharle `renderFinal` para esto tocaría también /diagnostico y
               la fase de ítems de /leccion, que no lo necesitan. */
            <CierreFinal
              items={cierre.items}
              respuestas={respuestas}
              ultimaLeccionId={ultimaLeccionId}
              siguienteTemaId={siguienteTemaId}
            />
          )}
        />
      )}
    </div>
  );
}
