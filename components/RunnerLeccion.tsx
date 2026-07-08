"use client";

import { useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { estadoInicialRunner, reducerRunner } from "@/lib/estadoRunner";
import { registrarEvento } from "@/lib/eventos";
import { BannerDemostracion } from "@/components/ui/Banner";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { Boton } from "@/components/ui/Boton";
import { PasoLeccion } from "@/components/PasoLeccion";
import type { Leccion } from "@/lib/tipos";

export function RunnerLeccion({ leccion }: { leccion: Leccion }) {
  const [estado, dispatch] = useReducer(reducerRunner, estadoInicialRunner);
  const router = useRouter();
  const totalPasos = leccion.pasos.length;
  const esUltimoPaso = estado.pasoActual === totalPasos - 1;

  useEffect(() => {
    registrarEvento({ nombre: "leccion_inicio", props: { leccion_id: leccion.id } });
    // Solo al montar: leccion_inicio se dispara una vez por sesión de lección.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registrarEvento({
      nombre: "paso_inicio",
      props: { paso: estado.pasoActual + 1, leccion_id: leccion.id },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.pasoActual]);

  function irAlCierre() {
    registrarEvento({ nombre: "leccion_fin", props: { leccion_id: leccion.id } });
    router.push("/cierre");
  }

  return (
    <div className="flex min-h-full flex-col">
      {leccion.estado !== "publicable" && <BannerDemostracion />}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold text-ink">{leccion.titulo}</h1>
          <BarraProgreso pasoActual={estado.pasoActual} total={totalPasos} />
        </div>
        <PasoLeccion
          key={estado.pasoActual}
          paso={leccion.pasos[estado.pasoActual]}
          leccionId={leccion.id}
          numeroPaso={estado.pasoActual + 1}
        />
        <div className="mt-8 flex justify-between gap-3">
          <Boton
            variante="secundario"
            onClick={() => dispatch({ type: "IR_ANTERIOR" })}
            disabled={estado.pasoActual === 0}
          >
            Paso anterior
          </Boton>
          {esUltimoPaso ? (
            <Boton onClick={irAlCierre}>Ir al cierre</Boton>
          ) : (
            <Boton onClick={() => dispatch({ type: "IR_SIGUIENTE" })}>Siguiente paso</Boton>
          )}
        </div>
      </div>
    </div>
  );
}
