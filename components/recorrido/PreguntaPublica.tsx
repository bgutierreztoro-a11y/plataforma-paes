"use client";

import { useEffect, useRef, useState } from "react";
import { Show } from "@clerk/nextjs";
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
import { Boton, EnlaceBoton } from "@/components/ui/linea/Boton";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import { registrarEvento } from "@/lib/eventos";
import { resultadoDe, textoDeRespuesta, type ErrorPublico } from "@/lib/recorrido/erroresPublicos";
import { COOKIE_ORIGEN, DURACION_ORIGEN_SEG, valorCookieOrigen } from "@/lib/recorrido/origen";
import { leerIdVideo, type IdVideo } from "@/lib/recorrido/video";
import type { ClaveAlternativa } from "@/lib/tipos";
import { useMontado } from "@/lib/useMontado";

interface Props {
  unidadId: string;
  errorId: string;
  itemId: string;
  enunciado: string;
  alternativas: { clave: ClaveAlternativa; texto: string }[];
  correcta: ClaveAlternativa;
  textos: Pick<ErrorPublico, "tentadora" | "casos" | "lineaTrasOtra">;
  cierre: string;
}

export function PreguntaPublica({
  unidadId,
  errorId,
  itemId,
  enunciado,
  alternativas,
  correcta,
  textos,
  cierre,
}: Props) {
  const montado = useMontado();
  const [seleccion, setSeleccion] = useState<ClaveAlternativa | null>(null);
  const [respondida, setRespondida] = useState(false);
  const video = useRef<IdVideo | null>(null);
  const respuesta = useRef<HTMLDivElement>(null);

  /* Con `montado` y no al primer efecto: PostHog se inicia en el efecto del proveedor, que corre después que los de sus hijos. */
  useEffect(() => {
    if (!montado) return;
    video.current = leerIdVideo(new URLSearchParams(window.location.search).get("utm_content"));
    registrarEvento({
      nombre: "error_publico_visto",
      props: { unidad_id: unidadId, error_id: errorId, item_id: itemId, video: video.current },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje, cuando montado pasa a true
  }, [montado]);

  useEffect(() => {
    if (respondida) respuesta.current?.focus();
  }, [respondida]);

  const resultado = seleccion ? resultadoDe(textos, seleccion, correcta) : null;

  function responder() {
    if (!seleccion || !resultado) return;
    setRespondida(true);
    registrarEvento({
      nombre: "error_publico_respondido",
      props: { unidad_id: unidadId, error_id: errorId, item_id: itemId, resultado, video: video.current },
    });
  }

  function empezarPrueba() {
    if (!resultado) return;
    const seguro = window.location.protocol === "https:" ? "; Secure" : "";
    const valor = valorCookieOrigen({ unidadId, errorId, video: video.current });
    document.cookie = `${COOKIE_ORIGEN}=${valor}; Max-Age=${DURACION_ORIGEN_SEG}; Path=/; SameSite=Lax${seguro}`;
    registrarEvento({
      nombre: "cta_prueba_clic",
      props: { unidad_id: unidadId, error_id: errorId, resultado, video: video.current },
    });
  }

  /* Mismo criterio que ItemPAES: al revelar se marca solo la elegida, en verde si acertó. */
  function tratamiento(clave: ClaveAlternativa) {
    if (!respondida) return "abierta" as const;
    if (clave !== seleccion) return "descartada" as const;
    return clave === correcta ? ("correcta" as const) : ("elegida" as const);
  }

  const claseFila = {
    abierta: `${ALTERNATIVA_BASE} ${ALTERNATIVA_REPOSO} ${montado ? ALTERNATIVA_INTERACTIVA : "cursor-not-allowed"}`,
    correcta: `${ALTERNATIVA_BASE} ${ALTERNATIVA_CORRECTA}`,
    elegida: `${ALTERNATIVA_BASE} ${ALTERNATIVA_ELEGIDA_REVELADA}`,
    descartada: `${ALTERNATIVA_BASE} ${ALTERNATIVA_DESCARTADA}`,
  };
  const claseChip = {
    abierta: `${CHIP_BASE} ${CHIP_REPOSO}`,
    correcta: `${CHIP_BASE} ${CHIP_CORRECTA}`,
    elegida: `${CHIP_BASE} ${CHIP_ELEGIDA_REVELADA}`,
    descartada: `${CHIP_BASE} ${CHIP_REPOSO}`,
  };

  const texto = respondida && seleccion ? textoDeRespuesta(textos, seleccion, correcta) : null;

  return (
    <div className="space-y-5">
      <p className="text-base font-medium leading-6 text-primary">{enunciado}</p>

      <fieldset className="space-y-2.5" disabled={respondida || !montado}>
        <legend className="sr-only">Alternativas</legend>
        {alternativas.map((alt) => (
          <label key={alt.clave} className={claseFila[tratamiento(alt.clave)]}>
            <input
              type="radio"
              name={`publica-${itemId}`}
              checked={seleccion === alt.clave}
              onChange={() => setSeleccion(alt.clave)}
              className="peer sr-only"
            />
            <span className={claseChip[tratamiento(alt.clave)]}>{alt.clave}</span>
            <span className="text-cuerpo-m text-primary">{alt.texto}</span>
          </label>
        ))}
      </fieldset>

      {!respondida && (
        <Boton variante={seleccion && montado ? "neutro" : "deshabilitado"} onClick={responder}>
          Responder
        </Boton>
      )}

      {texto && (
        <>
          <div
            ref={respuesta}
            tabIndex={-1}
            role="status"
            className={`${TARJETA_LINEA} px-4 py-3 outline-none`}
          >
            <p className="text-titulo-s text-primary">{texto.titulo}</p>
            {texto.parrafos.map((p) => (
              <p key={p} className="mt-2 text-cuerpo-m text-primary">
                {p}
              </p>
            ))}
          </div>

          <p className="text-cuerpo-m text-secondary">{cierre}</p>

          <Show when="signed-out">
            <div className="space-y-2">
              <EnlaceBoton href="/registrarse" variante="neutro" onClick={empezarPrueba}>
                Empieza tu prueba gratuita de 7 días
              </EnlaceBoton>
              <p className="text-cuerpo-s text-secondary">
                Al terminar eliges si sigues con Base, con Advance o si prefieres no seguir. No se
                cobra nada automáticamente.
              </p>
            </div>
          </Show>
          <Show when="signed-in">
            <EnlaceBoton href="/" variante="neutro">
              Ir a Fobos
            </EnlaceBoton>
          </Show>
        </>
      )}
    </div>
  );
}
