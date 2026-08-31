"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IlustracionCierre } from "@/components/ilustraciones/IlustracionCierre";
import { Puntaje } from "@/components/ui/linea/Puntaje";
import { FranjaDeItems } from "@/components/ui/linea/FranjaDeItems";
import { TarjetaLoQueFallo } from "@/components/ui/linea/TarjetaLoQueFallo";
import { registrarEvento } from "@/lib/eventos";
import { agruparErroresDelCierre } from "@/lib/erroresDelCierre";
import { obtenerResultadoDiagnostico } from "@/lib/progresoSesion";
import type { ItemCliente } from "@/lib/sanitizar";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";

function formatoTiempo(ms: number): string {
  const totalSeg = Math.round(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function CierreFinal({
  items,
  respuestas,
  ultimaLeccionId,
}: {
  /* Los ítems tal como los mandó el servidor. Hacen falta acá y no antes porque
     `respuestas` guarda la clave elegida, no la alternativa: el `errorCatalogado`
     y su `descripcionError` cuelgan de la alternativa (lib/sanitizar.ts:54-55) y
     hay que volver a buscarlos en el ítem. */
  items: ItemCliente[];
  respuestas: RespuestaRegistrada[];
  /* Última lección abierta del camino (la calcula app/cierre/page.tsx). Puede
     venir indefinida si no hay ninguna publicable. */
  ultimaLeccionId?: string;
}) {
  const router = useRouter();
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const diagnostico = obtenerResultadoDiagnostico();
  const promedioMs =
    respuestas.length > 0
      ? respuestas.reduce((suma, r) => suma + r.tiempoMs, 0) / respuestas.length
      : 0;
  const grupos = agruparErroresDelCierre(items, respuestas);

  function solicitarSiguienteLeccion() {
    /* Sin lecciones abiertas no hay id honesto que mandar: se prefiere perder
       el evento antes que atribuir la solicitud a una lección inventada. */
    if (ultimaLeccionId) {
      registrarEvento({
        nombre: "solicitud_siguiente_leccion",
        props: { leccion_id: ultimaLeccionId },
      });
    }
    router.push("/");
  }

  return (
    <PantallaCentrada className="gap-6 text-center">
      <div className="w-full max-w-56">
        <IlustracionCierre />
      </div>
      <EncabezadoDeEntrada rotulo="Cierre del módulo" titulo="Terminaste el módulo">
        Llegaste al final del recorrido. Esto fue lo que mostró el cierre:
      </EncabezadoDeEntrada>

      <Tarjeta className="w-full max-w-lg p-6 text-left">
        {diagnostico ? (
          <>
            <div className="grid grid-cols-2 divide-x divide-border">
              <Puntaje
                className="pr-6"
                rotulo="Diagnóstico"
                aciertos={diagnostico.aciertos}
                total={diagnostico.total}
                pie="tu punto de partida"
              />
              <Puntaje
                className="pl-6"
                rotulo="Cierre"
                aciertos={aciertos}
                total={respuestas.length}
                pie="después del módulo"
              />
            </div>
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-ink-suave">
              Son sets de preguntas distintos, así que no se comparan uno a uno: lo que importa es
              cómo cambió tu manejo del tema entre el inicio y el final.
            </p>
          </>
        ) : (
          <>
            <Puntaje rotulo="Cierre" aciertos={aciertos} total={respuestas.length} />
            <p className="mt-3 text-sm leading-relaxed text-ink-suave">
              No rendiste el diagnóstico en esta sesión, así que no hay con qué comparar. Se
              rinde antes de las lecciones: está en{" "}
              <Link
                href="/diagnostico"
                /* El enlace pasa al color del eje, mismo criterio que
                   DetalleTema.tsx:77: `--linea-nav` y no `--linea` porque acá es
                   texto sobre superficie clara, el rol donde la 02 cae a tinta.
                   El foco va a `outline-strong` para que el anillo se lea igual
                   en las cuatro líneas. */
                className="font-medium text-[var(--linea-nav)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
              >
                el diagnóstico
              </Link>
              , hoy una versión de demostración.
            </p>
          </>
        )}

        {/* La franja va después de la cifra y antes del ritmo: contesta "¿en
            cuáles?" justo cuando la cifra acaba de contestar "¿cuántas?".
            Se arma con `respuestas`, no con `items`: si alguna vez se pudiera
            abandonar el cierre a mitad, la franja tiene que mostrar lo rendido y
            no ocho casillas de las cuales tres nunca se contestaron. */}
        <FranjaDeItems
          className="mt-5"
          resultados={respuestas.map((r) => (r.correcta ? "correcto" : "incorrecto"))}
        />

        <p className="mt-3 text-sm text-ink-suave">
          Ritmo promedio:{" "}
          <span className="num">{formatoTiempo(promedioMs)}</span> por pregunta
          · en la PAES M1 el tiempo da para ~2:00.
        </p>
      </Tarjeta>

      <TarjetaLoQueFallo grupos={grupos} className="w-full max-w-lg text-left" />

      <div className="w-full max-w-lg">
        <Boton anchoCompleto onClick={solicitarSiguienteLeccion}>
          Quiero la próxima lección
        </Boton>
      </div>
    </PantallaCentrada>
  );
}
