"use client";

import { useReducer, type ReactNode } from "react";
import { ItemPAES } from "@/components/ItemPAES";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import { CascaronAnclado } from "@/components/ui/ZonaAnclada";
import { estadoInicialSetItems, reducerSetItems, type RespuestaRegistrada } from "@/lib/estadoSetItems";
import type { RespuestaLocal } from "@/lib/progresoLocal";
import type { ItemCliente } from "@/lib/sanitizar";

interface EjecutorSetItemsProps {
  items: ItemCliente[];
  mostrarFeedback: boolean;
  /* Requeridas y sin default: los tres llamadores (diagnóstico, cierre y la
     fase de ítems PAES de una lección) son contextos distintos y confundirlos
     rompería en silencio la comparación pre/post del MOS §6. */
  contexto: RespuestaLocal["contexto"];
  contextoId: string;
  renderFinal: (respuestas: RespuestaRegistrada[]) => ReactNode;
  /* Ancla el CTA y el feedback al fondo del viewport (Fase 5). Opt-in y no por
     defecto: el cascarón ocupa `100dvh` y asume el modo foco de /leccion/[id],
     donde no hay barra de navegación inferior. /diagnostico y /cierre sí la
     montan —y encima anteponen su banner de demostración—, así que ahí el
     cascarón dejaba la zona anclada 37px por debajo del borde del viewport,
     medido. Esas dos rutas se quedan con el layout de siempre hasta que
     alguien las mida y las migre a propósito. */
  anclarAcciones?: boolean;
  /* El texto de la pill de la fila superior. **Opcional a propósito**: solo el
     cierre se anuncia como tal ("Cierre PAES"). Sin ella la pill no se dibuja,
     así que /diagnostico y la fase de ítems de una lección no se presentan como
     un cierre que no son. */
  rotulo?: string;
  /* La unidad que se cuenta a la derecha: "Pregunta 3 de 8". El cierre dice
     "Ítem", que es como lo nombra la maqueta y como se llaman en el contenido;
     las otras dos rutas conservan su copy de siempre. */
  sustantivo?: string;
}

export function EjecutorSetItems({
  items,
  mostrarFeedback,
  contexto,
  contextoId,
  renderFinal,
  anclarAcciones = false,
  rotulo,
  sustantivo = "Pregunta",
}: EjecutorSetItemsProps) {
  const [estado, dispatch] = useReducer(reducerSetItems, estadoInicialSetItems);

  if (estado.indiceActual >= items.length) {
    return <>{renderFinal(estado.respuestas)}</>;
  }

  const item = items[estado.indiceActual];
  const esUltimo = estado.indiceActual === items.length - 1;

  const contenido = (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      {/* La fila superior de la maqueta
          (`docs/referencia/B-linea-interfaz-completa.html:317-321`): la pill a
          la izquierda y el conteo a la derecha, y debajo la barra fina.

          La pill usa los mismos dos tokens medidos que `Boton variante="linea"`
          —`--linea-fondo` de fondo y `--linea-contraste` de texto— y no
          `--linea` crudo: la 03 (#00843D) con texto claro da 4,48:1 y la 02
          (#FFB600) pide la letra en tinta. Ver ui/linea/colores.ts. Fuera de un
          eje los dos caen a tinta por el default de `:root`. */}
      <div className="mb-3 flex items-center justify-between gap-3">
        {rotulo ? (
          <span className="rounded-full bg-[var(--linea-fondo)] px-2.5 py-1 text-etiqueta uppercase text-[var(--linea-contraste)]">
            {rotulo}
          </span>
        ) : (
          /* Sin pill la celda igual ocupa su lado del `justify-between`, para
             que el conteo no se corra a la izquierda entre una ruta y otra. */
          <span />
        )}
        <span className="num shrink-0 text-etiqueta uppercase text-secondary">
          {sustantivo} {estado.indiceActual + 1} de {items.length}
        </span>
      </div>
      <div className="mb-8">
        {/* La barra continua del kit reemplaza a la segmentada de
            `ui/BarraProgreso`, que quedó sin ningún consumidor y se borró. La
            segmentada respondía "¿en cuál voy?", que es justo lo que ahora dice
            el texto de arriba con todas sus letras; la barra responde "¿cuánto
            llevo". `valor` es el índice y no el ordinal: al abrir el primer ítem
            no hay nada recorrido todavía. */}
        <BarraProgreso
          valor={estado.indiceActual}
          total={items.length}
          etiqueta={`${sustantivo} ${estado.indiceActual + 1} de ${items.length}`}
        />
      </div>
      <ItemPAES
        key={item.id}
        item={item}
        mostrarFeedback={mostrarFeedback}
        contexto={contexto}
        contextoId={contextoId}
        etiquetaSiguiente={esUltimo ? "Ver resultado" : "Siguiente pregunta"}
        onSiguiente={(correcta, tiempoMs, claveElegida) => {
          dispatch({ type: "REGISTRAR", itemId: item.id, correcta, tiempoMs, claveElegida });
          dispatch({ type: "SIGUIENTE" });
        }}
      />
    </div>
  );

  if (!anclarAcciones) return contenido;

  /* Un ítem por pantalla: `EjecutorSetItems` monta uno solo a la vez, así que
     nunca hay dos veredictos compitiendo y siempre puede anclar. Las acciones
     las aporta el propio ItemPAES —"Revisar respuesta" antes de comprobar, el
     pie después—, por eso `acciones` va vacío acá: son estados distintos del
     mismo control y decidirlos afuera obligaría a levantar `revelado`. */
  return (
    <CascaronAnclado acciones={null} anclarFeedback>
      {contenido}
    </CascaronAnclado>
  );
}
