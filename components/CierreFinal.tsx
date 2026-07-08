"use client";

import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { registrarEvento } from "@/lib/eventos";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";

export function CierreFinal({ respuestas }: { respuestas: RespuestaRegistrada[] }) {
  const router = useRouter();
  const aciertos = respuestas.filter((r) => r.correcta).length;

  function solicitarSiguienteLeccion() {
    registrarEvento({
      nombre: "solicitud_siguiente_leccion",
      props: { leccion_id: "l0-demo" },
    });
    router.push("/");
  }

  return (
    <div className="fondo-cuadricula flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Terminaste el cierre</h1>
      <p className="font-mono text-3xl tabular-nums text-ink">
        {aciertos} / {respuestas.length}
      </p>
      <p className="max-w-md text-base text-ink-suave">respuestas correctas.</p>
      <Boton onClick={solicitarSiguienteLeccion}>Quiero la próxima lección</Boton>
    </div>
  );
}
