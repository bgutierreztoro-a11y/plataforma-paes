"use client";

import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { IlustracionCierre } from "@/components/ilustraciones/IlustracionCierre";
import { registrarEvento } from "@/lib/eventos";
import { obtenerResultadoDiagnostico } from "@/lib/progresoSesion";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";

function formatoTiempo(ms: number): string {
  const totalSeg = Math.round(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function CierreFinal({ respuestas }: { respuestas: RespuestaRegistrada[] }) {
  const router = useRouter();
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const diagnostico = obtenerResultadoDiagnostico();
  const promedioMs =
    respuestas.length > 0
      ? respuestas.reduce((suma, r) => suma + r.tiempoMs, 0) / respuestas.length
      : 0;

  function solicitarSiguienteLeccion() {
    registrarEvento({
      nombre: "solicitud_siguiente_leccion",
      props: { leccion_id: "l0-demo" },
    });
    router.push("/");
  }

  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="w-full max-w-56">
        <IlustracionCierre />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
          Terminaste el módulo
        </h1>
        <p className="mx-auto max-w-md text-base leading-relaxed text-ink-suave">
          Llegaste al final del recorrido. Esto fue lo que mostró el cierre:
        </p>
      </div>

      <div className="w-full max-w-lg rounded-tarjeta border border-border bg-surface p-6 text-left shadow-tarjeta">
        {diagnostico ? (
          <>
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="pr-6">
                <p className="text-sm text-ink-suave">Diagnóstico</p>
                <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-ink">
                  {diagnostico.aciertos}
                  <span className="text-lg text-ink-tenue"> / {diagnostico.total}</span>
                </p>
                <p className="mt-1 text-sm text-ink-tenue">tu punto de partida</p>
              </div>
              <div className="pl-6">
                <p className="text-sm text-ink-suave">Cierre</p>
                <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-accent-fuerte">
                  {aciertos}
                  <span className="text-lg text-ink-tenue"> / {respuestas.length}</span>
                </p>
                <p className="mt-1 text-sm text-ink-tenue">después del módulo</p>
              </div>
            </div>
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-ink-suave">
              Son sets de preguntas distintos, así que no se comparan uno a uno: lo que importa es
              cómo cambió tu manejo del tema entre el inicio y el final.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-suave">Cierre</p>
            <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-ink">
              {aciertos}
              <span className="text-lg text-ink-tenue"> / {respuestas.length}</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-suave">
              Esta vez no rendiste el diagnóstico en esta sesión, así que no hay con qué comparar.
              La próxima vez, pártelo desde la portada para ver tu avance completo.
            </p>
          </>
        )}
        <p className="mt-3 text-sm text-ink-suave">
          Ritmo promedio:{" "}
          <span className="font-mono tabular-nums">{formatoTiempo(promedioMs)}</span> por pregunta
          · en la PAES M1 el tiempo da para ~2:00.
        </p>
      </div>

      <Boton onClick={solicitarSiguienteLeccion}>Quiero la próxima lección</Boton>
    </div>
  );
}
