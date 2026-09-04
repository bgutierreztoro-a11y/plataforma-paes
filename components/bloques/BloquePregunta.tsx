"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { FeedbackEnCapas } from "@/components/FeedbackEnCapas";
import { capaUno, capaDos, registrarAutoexplicacion } from "@/lib/capasFeedback";
import { registrarOcurrenciaDeError, rotuloDeError } from "@/lib/progresoSesion";
import { registrarEvento } from "@/lib/eventos";
import { registrarRespuesta, type RespuestaLocal } from "@/lib/progresoLocal";
import type { AlternativaCliente } from "@/lib/sanitizar";
import { useMontado } from "@/lib/useMontado";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { mezclarAlternativas } from "@/lib/mezclar";
import type { BloquePregunta as BloquePreguntaTipo } from "@/lib/tipos";

export function BloquePregunta({
  bloque,
  itemId,
  contexto,
  contextoId,
}: {
  bloque: BloquePreguntaTipo;
  itemId: string;
  /* Requeridas, sin default: ver la nota en ItemPAES.tsx. */
  contexto: RespuestaLocal["contexto"];
  contextoId: string;
}) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [intento, setIntento] = useState(0);
  /* Ver la nota en ItemPAES.tsx: se congela al comprobar porque contarlo al
     renderizar sumaría una ocurrencia por re-render. */
  const [rotuloError, setRotuloError] = useState<string | undefined>(undefined);
  const inicio = useRef(0);
  // Orden inicial = original (idéntico servidor/cliente); la mezcla real
  // ocurre en el efecto de abajo, solo en el cliente tras hidratar (ver
  // nota en ItemPAES.tsx sobre por qué no mezclar directo en useState).
  // "Intentar de nuevo" no remonta el componente, así que una vez mezclado
  // el orden se mantiene estable entre reintentos de la misma pregunta.
  /* AlternativaCliente y no Alternativa: el bloque llega después de pasar por
     lib/sanitizar.ts, que resuelve `descripcionError` y las opciones de
     autoexplicación contra el catálogo del módulo. El tipo `Bloque` de tipos.ts
     describe el JSON en disco, no lo que cruza al cliente — los dos campos
     extra son opcionales, así que el valor entra sin cast. */
  const [alternativas, setAlternativas] = useState<AlternativaCliente[]>(bloque.alternativas);
  // Ver lib/useMontado.ts: mismo guard de hidratación que ItemPAES.
  const montado = useMontado();
  useEffect(() => {
    inicio.current = performance.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mezcla de una sola vez al montar, ver comentario arriba
    setAlternativas(mezclarAlternativas(bloque.alternativas));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const alternativaElegida = alternativas.find((a) => a.clave === seleccion);

  function revisar() {
    if (!alternativaElegida) return;
    const nuevoIntento = intento + 1;
    setIntento(nuevoIntento);
    const tiempoMs = Math.round(performance.now() - inicio.current);
    registrarEvento({
      nombre: "item_respuesta",
      props: {
        item_id: itemId,
        correcta: alternativaElegida.esCorrecta,
        intento: nuevoIntento,
        tiempo_ms: tiempoMs,
      },
    });
    registrarRespuesta({
      contexto,
      contextoId,
      itemId,
      valor: { tipo: "alternativa", clave: alternativaElegida.clave },
      correcta: alternativaElegida.esCorrecta,
      intento: nuevoIntento,
      tiempoMs,
    });
    /* Mismo punto y mismo criterio que ItemPAES.tsx. Reintentar y volver a caer
       en el mismo distractor sí suma: es el mismo error otra vez, que es
       exactamente lo que el conteo dice. */
    const descripcion = alternativaElegida.descripcionError;
    if (!alternativaElegida.esCorrecta && descripcion && alternativaElegida.errorCatalogado) {
      setRotuloError(
        rotuloDeError(alternativaElegida.errorCatalogado, registrarOcurrenciaDeError(descripcion)),
      );
    }
    setRevelado(true);
  }

  function intentarDeNuevo() {
    setSeleccion(null);
    setRevelado(false);
    setRotuloError(undefined);
  }

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <fieldset className="space-y-2" disabled={revelado || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {alternativas.map((alt) => {
          /* Tres estados, y solo el revelado depende de la respuesta.

             El acierto se queda en el verde de `success` (decisión de la fase 3H,
             ver PanelFeedback.tsx): en las líneas 01 y 02 el color del eje sobre
             una respuesta correcta sería rojo o amarillo, y eso no significa
             "correcto" en ningún lado.

             La elegida incorrecta pasa a tinta —borde `strong`, fondo hundido y
             el disco de la letra en negativo—, que es el `.opt.no` de la maqueta
             (`docs/referencia/B-linea-interfaz-completa.html:43-44`) y lo que ya
             tenía escrito `components/ui/linea/Alternativa.tsx:41,48`. Antes
             quedaba teñida con el color del eje, o sea igual que estar
             simplemente elegida: el estado revelado no se distinguía del previo.

             Los `peer-checked:` solo se emiten mientras no hay revelación: como
             variante tienen más especificidad que las clases base, y si
             quedaran puestos se comerían el estado revelado. */
          const elegida = seleccion === alt.clave;
          const estado = !revelado || !elegida ? "abierta" : alt.esCorrecta ? "correcta" : "fallada";

          const clasesFila = {
            abierta:
              "border-border has-[:checked]:border-[var(--linea)] has-[:checked]:bg-[var(--linea-tinte)]",
            correcta: "border-[1.5px] border-success bg-success-suave",
            fallada: "border-[1.5px] border-strong bg-sunken",
          }[estado];

          const clasesChip = {
            abierta:
              "border-border-fuerte text-ink-suave peer-checked:border-[var(--linea)] peer-checked:bg-[var(--linea-fondo)] peer-checked:text-[var(--linea-contraste)]",
            /* El disco también en verde, no en el color del eje: un chip rojo
               dentro de una fila verde es justamente la contradicción que la
               decisión evita. `text-inverse` sobre #0E7C57 da 4,85:1. */
            correcta: "border-success bg-success text-inverse",
            fallada: "border-strong bg-strong text-inverse",
          }[estado];

          return (
            <label
              key={alt.clave}
              /* **Deuda conocida:** estas clases son casi las de
                 `components/ui/alternativa.ts` (`ALTERNATIVA_BASE` +
                 `ALTERNATIVA_REPOSO` + `ALTERNATIVA_INTERACTIVA`), escritas otra
                 vez acá. Los tokens de línea se migraron en los dos lados a la
                 vez para que no se separen; unificarlos es un cambio de
                 estructura y va en su propia tanda. */
              className={`flex min-h-11 items-center gap-3 rounded-sm border bg-card px-4 py-3 motion-safe:transition-colors motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-strong ${clasesFila} ${
                revelado || !montado
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:border-border-fuerte hover:bg-sunken"
              }`}
            >
              <input
                type="radio"
                name={`pregunta-${itemId}`}
                value={alt.clave}
                checked={seleccion === alt.clave}
                onChange={() => setSeleccion(alt.clave)}
                className="peer sr-only"
              />
              {/* Mientras se elige, el chip relleno lleva la letra encima, así
                  que el fondo es `--linea-fondo` y no `--linea` —en la 03 el
                  color de línea da 4,48:1 con texto claro— y la letra es
                  `--linea-contraste`, que en la 02 amarilla es tinta y no
                  blanco. El borde sí va en `--linea`, que es donde el color es
                  forma. Ver components/ui/linea/colores.ts. */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${clasesChip}`}
              >
                {alt.clave}
              </span>
              <span>{alt.texto}</span>
            </label>
          );
        })}
      </fieldset>
      {!revelado && (
        <Boton onClick={revisar} disabled={!seleccion || !montado}>
          Revisar respuesta
        </Boton>
      )}
      {revelado && alternativaElegida && (
        <FeedbackEnCapas
          esCorrecta={alternativaElegida.esCorrecta}
          capa1={capaUno(alternativaElegida, alternativas)}
          capa2={capaDos(alternativaElegida)}
          rotuloError={rotuloError}
          opcionesAutoexplicacion={alternativaElegida.opcionesAutoexplicacion}
          onAutoexplicacion={(elegida) =>
            registrarAutoexplicacion(itemId, elegida, alternativaElegida.descripcionError)
          }
          extra={
            !alternativaElegida.esCorrecta ? (
              <Boton variante="secundario" onClick={intentarDeNuevo}>
                Intentar de nuevo
              </Boton>
            ) : null
          }
        />
      )}
    </div>
  );
}
