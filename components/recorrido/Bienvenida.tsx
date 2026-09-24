"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/linea/Boton";
import { AsiFunciona } from "@/components/recorrido/AsiFunciona";
import { TarjetaPrimeraParada } from "@/components/recorrido/TarjetaPrimeraParada";
import { registrarEvento, type AccesoRecorrido, type EntradaRecorrido } from "@/lib/eventos";
import {
  explorar,
  inicioBienvenida,
  responder,
  saltar,
  terminada,
  type EstadoBienvenida,
} from "@/lib/recorrido/flujoBienvenida";
import type { VistaPrimeraParada } from "@/lib/recorrido/servidor";
import { PREGUNTA_1, PREGUNTA_2, TEXTOS_BIENVENIDA, pregunta3, ASI_FUNCIONA } from "@/lib/recorrido/textosBienvenida";
import type { IdVideo } from "@/lib/recorrido/video";
import { useMontado } from "@/lib/useMontado";

interface Props {
  encabezado: string | null;
  /** "porcentaje" en la puerta A, para la pregunta 3; null en la puerta B. */
  unidadOrigen: string | null;
  entrada: EntradaRecorrido;
  video: IdVideo | null;
  acceso: AccesoRecorrido | null;
}

type Fase = "preguntas" | "enviando" | "asi" | "parada" | "error";

const CLAVE_CUENTA_CREADA = "fobos:cuenta_creada";

export function Bienvenida({ encabezado, unidadOrigen, entrada, video, acceso }: Props) {
  const router = useRouter();
  const montado = useMontado();
  const [estado, setEstado] = useState<EstadoBienvenida>(() => inicioBienvenida(unidadOrigen !== null));
  const [fase, setFase] = useState<Fase>("preguntas");
  const [parada, setParada] = useState<VistaPrimeraParada | null>(null);
  const [pendiente, setPendiente] = useState<{ final: EstadoBienvenida; aPortada: boolean } | null>(null);

  /* Una vez por pestaña: recargar /bienvenida antes de terminar no cuenta otra cuenta creada. */
  useEffect(() => {
    if (!montado || !acceso) return;
    try {
      if (sessionStorage.getItem(CLAVE_CUENTA_CREADA)) return;
      sessionStorage.setItem(CLAVE_CUENTA_CREADA, "1");
    } catch {
      /* sin sessionStorage el evento sale igual */
    }
    registrarEvento({ nombre: "cuenta_creada", props: { entrada, video, acceso } });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje, cuando montado pasa a true
  }, [montado]);

  async function enviar(final: EstadoBienvenida, aPortada: boolean) {
    setPendiente({ final, aPortada });
    setFase("enviando");
    const { p1, p2, p3, saltada } = final;
    try {
      const resp = await fetch("/api/recorrido/bienvenida", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ p1, p2, p3, saltada }),
      });
      if (!resp.ok) throw new Error(String(resp.status));
      registrarEvento({ nombre: "bienvenida_respondida", props: { p1, p2, p3, saltada, entrada } });
      if (aPortada) {
        router.push("/");
        return;
      }
      setParada((await resp.json()) as VistaPrimeraParada);
      setFase("asi");
    } catch {
      setFase("error");
    }
  }

  function avanzar(siguiente: EstadoBienvenida) {
    setEstado(siguiente);
    if (terminada(siguiente)) void enviar(siguiente, false);
  }

  if (fase === "asi") {
    return (
      <AsiFunciona
        accion={
          <Boton variante="neutro" onClick={() => setFase("parada")}>
            {ASI_FUNCIONA.boton}
          </Boton>
        }
      />
    );
  }

  if (fase === "parada" && parada) return <TarjetaPrimeraParada parada={parada} />;

  if (fase === "error") {
    return (
      <section role="alert" className="space-y-4">
        <p className="text-cuerpo-m text-primary">
          No pudimos guardar tus respuestas. Revisa tu conexión e inténtalo de nuevo.
        </p>
        <Boton variante="neutro" onClick={() => pendiente && void enviar(pendiente.final, pendiente.aPortada)}>
          Intentar de nuevo
        </Boton>
      </section>
    );
  }

  const cual = estado.preguntas[Math.min(estado.indice, estado.preguntas.length - 1)];
  const pregunta = cual === "p1" ? PREGUNTA_1 : cual === "p2" ? PREGUNTA_2 : pregunta3(unidadOrigen ?? "");
  const deshabilitado = fase === "enviando" || !montado;

  return (
    <section className="flex flex-1 flex-col">
      {encabezado && estado.indice === 0 && <p className="mb-6 text-cuerpo-m text-primary">{encabezado}</p>}
      <p className="text-etiqueta uppercase text-secondary">
        {Math.min(estado.indice + 1, estado.preguntas.length)} de {estado.preguntas.length}
      </p>
      <h1 className="mt-2 text-titulo-l text-primary">{pregunta.texto}</h1>
      <div className="mt-5 space-y-2.5">
        {pregunta.opciones.map((o) => (
          <Boton
            key={o.id}
            variante={deshabilitado ? "deshabilitado" : "secundario"}
            onClick={() => avanzar(responder(estado, o.id))}
          >
            {o.texto}
          </Boton>
        ))}
      </div>
      <div className="mt-4">
        <Boton variante="texto" disabled={deshabilitado} onClick={() => avanzar(saltar(estado))}>
          {TEXTOS_BIENVENIDA.saltar}
        </Boton>
      </div>
      <div className="mt-auto pt-10 text-center">
        <Boton variante="texto" disabled={deshabilitado} onClick={() => void enviar(explorar(estado), true)}>
          {TEXTOS_BIENVENIDA.explorar}
        </Boton>
      </div>
    </section>
  );
}
