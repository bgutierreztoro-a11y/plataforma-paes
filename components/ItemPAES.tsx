"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/linea/Boton";
import {
  ALTERNATIVA_BASE,
  ALTERNATIVA_CORRECTA,
  ALTERNATIVA_DESCARTADA,
  ALTERNATIVA_ELEGIDA_REVELADA,
  ALTERNATIVA_INTERACTIVA,
  ALTERNATIVA_REPOSO,
  CHIP_BASE,
  CHIP_CORRECTA,
  CHIP_ELEGIDA_REVELADA,
  CHIP_REPOSO,
} from "@/components/ui/alternativa";
import { FeedbackEnCapas } from "@/components/FeedbackEnCapas";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { usePanelAnclado } from "@/components/ui/ZonaAnclada";
import { capaUno, capaDos, registrarAutoexplicacion } from "@/lib/capasFeedback";
import { registrarOcurrenciaDeError, rotuloDeError } from "@/lib/progresoSesion";
import { registrarEvento } from "@/lib/eventos";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarAlternativas } from "@/lib/mezclar";
import { visualDeItem } from "@/lib/visualesItems";
import { registrarRespuesta, type RespuestaLocal } from "@/lib/progresoLocal";
import type { ItemCliente } from "@/lib/sanitizar";
import type { ClaveAlternativa } from "@/lib/tipos";

interface ItemPAESProps {
  item: ItemCliente;
  mostrarFeedback: boolean;
  /* `claveElegida` va como tercer argumento y no reemplaza a `correcta`: los
     llamadores que solo declaran dos parámetros siguen compilando, y `correcta`
     es lo que casi todos necesitan. Lo agrega la pantalla de resultado del
     cierre, que sí necesita saber CUÁL distractor se marcó para leer su
     `errorCatalogado`. */
  onSiguiente: (correcta: boolean, tiempoMs: number, claveElegida: ClaveAlternativa) => void;
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
  /* Las versalitas del banner de error, congeladas al comprobar. Se calculan
     acá y no al renderizar porque `registrarOcurrenciaDeError` tiene efecto:
     recalcularlo en cada pasada sumaría una ocurrencia por re-render. */
  const [rotuloError, setRotuloError] = useState<string | undefined>(undefined);
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
      {/* `variante="linea"` toma el color del eje desde `--linea-fondo`, que la
          pantalla instaló arriba. Fuera de un eje —/diagnostico— ese token cae
          a tinta por el default de `:root` y el botón queda sólido en negro,
          que es la misma jerarquía. No lleva `anchoCompleto`: el botón del kit
          ya es `block w-full`. */}
      <Boton
        variante="linea"
        onClick={() =>
          onSiguiente(alternativaElegida.esCorrecta, tiempoFinalMs, alternativaElegida.clave)
        }
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

    /* El error se cuenta en el mismo punto donde ya se instrumenta y se persiste
       la respuesta: son el mismo hecho. Solo cuando el catálogo del archivo
       resolvió una descripción — sin ella no hay error que nombrar ni banner que
       mostrar (los cierres sin catálogo propio y /diagnostico caen acá). */
    const descripcion = alternativaElegida.descripcionError;
    if (!alternativaElegida.esCorrecta && descripcion && alternativaElegida.errorCatalogado) {
      setRotuloError(
        rotuloDeError(alternativaElegida.errorCatalogado, registrarOcurrenciaDeError(descripcion)),
      );
    }
    setRevelado(true);
  }

  /**
   * Cómo se trata una fila. Son los tres estados de `BloquePregunta`
   * —abierta, correcta, elegida-revelada— más el apagado de las que no se
   * eligieron, que es propio de esta pantalla: acá hay cuatro alternativas y
   * una explicación debajo, y bajar las dos que no importan es lo que deja
   * leer las que sí.
   *
   * Al fallar, la elegida queda marcada como elegida y nada más: el rojo que
   * llevaba antes contestaba "¿la tuve bien?" desde el costado, antes de que se
   * leyera la Capa 1, que es donde está lo que enseña. El acierto sí se marca —
   * es información, no reproche.
   */
  function tratamiento(
    alt: (typeof alternativas)[number],
  ): "abierta" | "correcta" | "elegidaRevelada" | "descartada" {
    if (!revelado) return "abierta";
    if (seleccion !== alt.clave) return "descartada";
    /* En /diagnostico (`mostrarFeedback` en false) ni la acertada se marca en
       verde: esa pantalla registra la respuesta sin decir si estuvo bien, y un
       borde verde lo diría. Cae al tratamiento neutro, que afirma "esto
       elegiste" y nada más. */
    return alt.esCorrecta && mostrarFeedback ? "correcta" : "elegidaRevelada";
  }

  function clasesOpcion(alt: (typeof alternativas)[number]): string {
    const estado = tratamiento(alt);
    if (estado === "abierta") {
      return `${ALTERNATIVA_BASE} ${ALTERNATIVA_REPOSO} ${
        montado ? ALTERNATIVA_INTERACTIVA : "cursor-not-allowed"
      }`;
    }
    return `${ALTERNATIVA_BASE} ${
      {
        correcta: ALTERNATIVA_CORRECTA,
        elegidaRevelada: ALTERNATIVA_ELEGIDA_REVELADA,
        descartada: ALTERNATIVA_DESCARTADA,
      }[estado]
    }`;
  }

  /**
   * El disco de la letra, en el tono de la fila que lo contiene.
   *
   * Lo que arregla: hasta la 3J el chip emitía `peer-checked:` **siempre**, así
   * que tras revelar seguía relleno en `--linea-fondo` y tapaba el estado
   * revelado —un disco del color del eje dentro de una fila ya verde o ya en
   * tinta—. Es exactamente lo que advierte `BloquePregunta.tsx:126-129`. Ahora
   * esas variantes viven solo en `CHIP_REPOSO`, que es el único estado que se
   * usa antes de revelar.
   *
   * `descartada` también toma `CHIP_REPOSO` y no una constante propia: su input
   * está por definición sin marcar —es la rama de "no la elegiste"—, así que los
   * `peer-checked:` no llegan a aplicar y el disco queda en el neutro. Una
   * cuarta constante que renderiza igual sería una diferencia sin diferencia.
   */
  function clasesChip(alt: (typeof alternativas)[number]): string {
    return `${CHIP_BASE} ${
      {
        abierta: CHIP_REPOSO,
        correcta: CHIP_CORRECTA,
        elegidaRevelada: CHIP_ELEGIDA_REVELADA,
        descartada: CHIP_REPOSO,
      }[tratamiento(alt)]
    }`;
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
            {/* Mismo chip que BloquePregunta.tsx y por los mismos números, pero
                ahora compartido de verdad: las clases salen de
                components/ui/alternativa.ts en vez de estar escritas otra vez
                acá. Ver `clasesChip` arriba para el estado revelado. */}
            <span className={clasesChip(alt)}>{alt.clave}</span>
            <span>{alt.texto}</span>
          </label>
        ))}
      </fieldset>
      {/* El CTA del ítem va anclado igual que el feedback que lo reemplaza: son
          el mismo lugar de la pantalla en dos momentos, y dejar el botón en el
          flujo haría que el control saltara al fondo recién al comprobar. */}
      {/* Sin alternativa marcada el botón va en la variante `deshabilitado` del
          kit y no en `linea` con `disabled`: la variante `linea` no tiene
          tratamiento apagado —el `ui/Boton` anterior sí lo traía en `primario`—,
          así que un botón deshabilitado se vería idéntico a uno activo. La
          variante `deshabilitado` además pone el atributo `disabled` sola
          (`ui/linea/Boton.tsx:87`), que es lo que impide un control que se ve
          apagado y sigue respondiendo al clic. */}
      {!revelado &&
        anclar(
          <Boton
            variante={seleccion && montado ? "linea" : "deshabilitado"}
            onClick={revisar}
          >
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
              rotuloError={rotuloError}
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
