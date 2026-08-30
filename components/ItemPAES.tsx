"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import {
  ALTERNATIVA_BASE,
  ALTERNATIVA_CORRECTA,
  ALTERNATIVA_DESCARTADA,
  ALTERNATIVA_ELEGIDA_REVELADA,
  ALTERNATIVA_INTERACTIVA,
  ALTERNATIVA_REPOSO,
} from "@/components/ui/alternativa";
import { FeedbackEnCapas } from "@/components/FeedbackEnCapas";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { usePanelAnclado } from "@/components/ui/ZonaAnclada";
import { capaUno, capaDos, registrarAutoexplicacion } from "@/lib/capasFeedback";
import { registrarEvento } from "@/lib/eventos";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarAlternativas } from "@/lib/mezclar";
import { visualDeItem } from "@/lib/visualesItems";
import { registrarRespuesta, type RespuestaLocal } from "@/lib/progresoLocal";
import type { ItemCliente } from "@/lib/sanitizar";

interface ItemPAESProps {
  item: ItemCliente;
  mostrarFeedback: boolean;
  onSiguiente: (correcta: boolean, tiempoMs: number) => void;
  /* Dónde se está respondiendo. Requeridas y sin valor por defecto a propósito:
     un default silencioso de "leccion" atribuiría al camino las respuestas del
     diagnóstico y arruinaría el delta pre/post del MOS §6 sin que nada falle.
     Preferimos el error de compilación. */
  contexto: RespuestaLocal["contexto"];
  contextoId: string;
  /* Texto del botón que avanza tras responder ("Siguiente pregunta", "Ver resultado"...). */
  etiquetaSiguiente?: string;
}

function formatoTiempo(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function ItemPAES({
  item,
  mostrarFeedback,
  onSiguiente,
  contexto,
  contextoId,
  etiquetaSiguiente = "Continuar",
}: ItemPAESProps) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [intento, setIntento] = useState(0);
  const [transcurridoMs, setTranscurridoMs] = useState(0);
  const [tiempoFinalMs, setTiempoFinalMs] = useState(0);
  const inicio = useRef(0);
  const anclar = usePanelAnclado();
  // El orden inicial es el original (idéntico en servidor y cliente, sin
  // Math.random en el render: mezclarlo aquí causaría un mismatch de
  // hidratación). La mezcla real ocurre en el efecto de abajo, que solo
  // corre en el cliente después de hidratar — coincide con la misma
  // ventana en la que el fieldset ya está deshabilitado por !montado, así
  // que no hay tap posible sobre el orden sin mezclar.
  const [alternativas, setAlternativas] = useState(item.alternativas);
  // Ver lib/useMontado.ts: evita ofrecer las alternativas como tocables
  // antes de que React haya hidratado y conectado sus listeners de verdad.
  const montado = useMontado();
  useEffect(() => {
    inicio.current = performance.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mezcla de una sola vez al montar, ver comentario arriba
    setAlternativas(mezclarAlternativas(item.alternativas));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  /* Cronómetro visible: en la PAES el tiempo por pregunta es escaso (~2 min);
     verlo entrena el ritmo. Se congela al revisar la respuesta. */
  useEffect(() => {
    if (revelado) return;
    const id = setInterval(() => {
      setTranscurridoMs(performance.now() - inicio.current);
    }, 1000);
    return () => clearInterval(id);
  }, [revelado]);

  const alternativaElegida = alternativas.find((a) => a.clave === seleccion);
  /* Respuesta tentativa: lo que el estudiante tiene marcado y todavía NO
     comprobó. El gráfico se redibuja con ese valor para que el aprendizaje
     ocurra al manipular, no al presionar "Revisar respuesta" — comprobar solo
     confirma lo que ya vio. Es reversible sin costo (cambiar de alternativa
     redibuja), no cuesta ninguna llamada al servidor, y deja de aplicarse al
     revelar: desde ahí el gráfico vuelve a mostrar la recta real del
     enunciado. */
  const textoTentativo = !revelado ? (alternativaElegida?.texto ?? null) : null;
  const visual = visualDeItem(item.id, textoTentativo);

  /* El pie es el mismo en las dos ramas (con y sin feedback) y va DESPUÉS de
     las capas: el botón de avanzar tiene que quedar debajo de la explicación,
     no compitiendo con ella. Es un valor JSX y no un componente definido acá
     adentro — declarar un componente durante el render lo remontaría en cada
     pasada (regla react-hooks/static-components). */
  const pieDelItem = alternativaElegida ? (
    <>
      <p className="text-sm text-ink-suave">
        Resuelta en{" "}
        <span className="num">{formatoTiempo(tiempoFinalMs)}</span> · en la
        PAES M1 tendrás alrededor de 2 minutos por pregunta.
      </p>
      <Boton
        anchoCompleto
        onClick={() => onSiguiente(alternativaElegida.esCorrecta, tiempoFinalMs)}
      >
        {etiquetaSiguiente}
      </Boton>
    </>
  ) : null;

  function revisar() {
    if (!alternativaElegida) return;
    const nuevoIntento = intento + 1;
    setIntento(nuevoIntento);
    const tiempoMs = Math.round(performance.now() - inicio.current);
    setTiempoFinalMs(tiempoMs);
    registrarEvento({
      nombre: "item_respuesta",
      props: {
        item_id: item.id,
        correcta: alternativaElegida.esCorrecta,
        intento: nuevoIntento,
        tiempo_ms: tiempoMs,
      },
    });
    // Se persiste en el mismo punto donde ya se instrumentaba: son el mismo
    // hecho. Un intento es una fila nueva y nunca se actualiza una anterior,
    // igual que en la tabla `respuestas` — así se puede reconstruir cuántos
    // intentos necesitó el ítem, que es la señal pedagógica que importa.
    registrarRespuesta({
      contexto,
      contextoId,
      itemId: item.id,
      valor: { tipo: "alternativa", clave: alternativaElegida.clave },
      correcta: alternativaElegida.esCorrecta,
      intento: nuevoIntento,
      tiempoMs,
    });
    setRevelado(true);
  }

  function clasesOpcion(alt: (typeof alternativas)[number]): string {
    const base = ALTERNATIVA_BASE;
    if (revelado && seleccion === alt.clave) {
      /* Al fallar, la alternativa elegida queda marcada como elegida y nada
         más: el rojo que llevaba antes contestaba "¿la tuve bien?" desde el
         costado, antes de que se leyera la Capa 1, que es donde está lo que
         enseña. El acierto sí se marca — es información, no reproche. */
      return `${base} ${
        alt.esCorrecta && mostrarFeedback
          ? ALTERNATIVA_CORRECTA
          : ALTERNATIVA_ELEGIDA_REVELADA
      }`;
    }
    if (revelado) return `${base} ${ALTERNATIVA_DESCARTADA}`;
    if (!montado) return `${base} ${ALTERNATIVA_REPOSO} cursor-not-allowed`;
    return `${base} ${ALTERNATIVA_REPOSO} ${ALTERNATIVA_INTERACTIVA}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-ink-tenue">
          Habilidad: <span className="capitalize">{item.habilidad}</span>
        </p>
        <p
          aria-hidden="true"
          className="text-sm text-ink-suave"
          title="En la PAES M1 tendrás alrededor de 2 minutos por pregunta"
        >
          Tiempo{" "}
          <span className="num">
            {formatoTiempo(revelado ? tiempoFinalMs : transcurridoMs)}
          </span>
        </p>
      </div>
      {visual && (
        <div className="rounded-tarjeta border border-border bg-surface p-4">
          <div className="flex justify-center">{visual}</div>
        </div>
      )}
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={item.enunciado} />
      </div>
      <fieldset className="space-y-2.5" disabled={revelado || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {alternativas.map((alt) => (
          <label key={alt.clave} className={clasesOpcion(alt)}>
            <input
              type="radio"
              name={`item-${item.id}`}
              checked={seleccion === alt.clave}
              onChange={() => setSeleccion(alt.clave)}
              className="peer sr-only"
            />
            {/* Mismo chip que BloquePregunta.tsx, y por los mismos números: el
                fondo va en `--linea-fondo` (la 03 no pasa AA con el color de
                línea crudo) y la letra en `--linea-contraste` (la 02 amarilla
                la lleva en tinta). Ver components/ui/linea/colores.ts. */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-fuerte text-sm text-ink-suave peer-checked:border-[var(--linea)] peer-checked:bg-[var(--linea-fondo)] peer-checked:text-[var(--linea-contraste)]">
              {alt.clave}
            </span>
            <span>{alt.texto}</span>
          </label>
        ))}
      </fieldset>
      {/* El CTA del ítem va anclado igual que el feedback que lo reemplaza: son
          el mismo lugar de la pantalla en dos momentos, y dejar el botón en el
          flujo haría que el control saltara al fondo recién al comprobar. */}
      {!revelado &&
        anclar(
          <Boton anchoCompleto onClick={revisar} disabled={!seleccion || !montado}>
            Revisar respuesta
          </Boton>,
        )}
      {revelado && alternativaElegida && (
        <>
          {mostrarFeedback ? (
            <FeedbackEnCapas
              esCorrecta={alternativaElegida.esCorrecta}
              capa1={capaUno(alternativaElegida, alternativas)}
              capa2={capaDos(alternativaElegida)}
              opcionesAutoexplicacion={alternativaElegida.opcionesAutoexplicacion}
              onAutoexplicacion={(elegida) =>
                registrarAutoexplicacion(item.id, elegida, alternativaElegida.descripcionError)
              }
              pie={pieDelItem}
            />
          ) : (
            /* Diagnóstico: se registra la respuesta sin decir si estuvo bien.
               Mismo tratamiento anclado que el feedback completo — cambia qué
               dice el panel, no dónde vive. */
            anclar(
              <div className="entra-panel-anclado space-y-3">
                <PanelFeedback tono="neutro">Respuesta registrada.</PanelFeedback>
                {pieDelItem}
              </div>,
            )
          )}
        </>
      )}
    </div>
  );
}
