"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { FeedbackEnCapas } from "@/components/FeedbackEnCapas";
import { capaUno, capaDos, registrarAutoexplicacion } from "@/lib/capasFeedback";
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
    setRevelado(true);
  }

  function intentarDeNuevo() {
    setSeleccion(null);
    setRevelado(false);
  }

  return (
    <div className="space-y-3">
      <div className="text-base font-medium text-ink">
        <TextoEnriquecido contenido={bloque.enunciado} />
      </div>
      <fieldset className="space-y-2" disabled={revelado || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {alternativas.map((alt) => (
          <label
            key={alt.clave}
            /* Al acertar, el verde se ancla a la alternativa elegida y no solo
               al recuadro de feedback de abajo: es el objeto que el estudiante
               estaba mirando al comprobar. Solo el acierto — el caso incorrecto
               se resuelve en el panel, donde la explicación puede llegar antes
               que el veredicto.

               **Deuda conocida:** estas clases son casi las de
               `components/ui/alternativa.ts` (`ALTERNATIVA_BASE` +
               `ALTERNATIVA_REPOSO` + `ALTERNATIVA_INTERACTIVA`), escritas otra
               vez acá. Los tokens de línea se migraron en los dos lados a la
               vez para que no se separen; unificarlos es un cambio de
               estructura y va en su propia tanda. */
            className={`flex min-h-11 items-center gap-3 rounded-tarjeta border bg-surface px-4 py-3 motion-safe:transition-colors motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-strong ${
              revelado && seleccion === alt.clave && alt.esCorrecta
                ? "border-success bg-success-suave"
                : "border-border has-[:checked]:border-[var(--linea)] has-[:checked]:bg-[var(--linea-tinte)]"
            } ${
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
            {/* El chip relleno lleva la letra encima, así que el fondo es
                `--linea-fondo` y no `--linea` —en la 03 el color de línea da
                4,48:1 con texto claro— y la letra es `--linea-contraste`, que
                en la 02 amarilla es tinta y no blanco. El borde sí va en
                `--linea`, que es donde el color es forma. Ver
                components/ui/linea/colores.ts. */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-fuerte text-sm text-ink-suave peer-checked:border-[var(--linea)] peer-checked:bg-[var(--linea-fondo)] peer-checked:text-[var(--linea-contraste)]">
              {alt.clave}
            </span>
            <span>{alt.texto}</span>
          </label>
        ))}
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
