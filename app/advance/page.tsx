import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import {
  advanceVisible,
  estadoAdvance,
  type EstadoAdvance,
} from "@/lib/advance/acceso";
import { unidadesConBanco } from "@/lib/advance/banco";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

export const metadata: Metadata = {
  title: TEXTOS_ADVANCE.portada.titulo,
  robots: { index: false, follow: false },
};

/**
 * /advance: la portada, "qué hacer ahora" (docs/fobos-advance.md §1.2).
 *
 * Sin acceso, redirige a la puerta conservando el eje de origen. Con acceso,
 * enlaza a una sesión de descarte por cada unidad con banco en disco (F2); sin
 * ningún banco, lo dice tal cual, sin prometer fecha.
 */
export default async function PaginaAdvance({
  searchParams,
}: {
  searchParams: Promise<{ eje?: string | string[] }>;
}) {
  if (!advanceVisible()) notFound();

  const { eje } = await searchParams;
  const ejeId = typeof eje === "string" && lineaDeEje(eje) ? eje : undefined;
  const linea = ejeId ? lineaDeEje(ejeId) : undefined;

  const estado: EstadoAdvance = await estadoAdvance();
  switch (estado) {
    case "sin-acceso":
    case "temporada-terminada":
      redirect(
        ejeId ? `/advance/puerta?eje=${ejeId}&origen=portada` : "/advance/puerta?origen=portada",
      );
    case "activo":
      break;
    default: {
      const nunca: never = estado;
      throw new Error(`Estado de Advance sin manejar: ${nunca}`);
    }
  }

  const { portada, puerta } = TEXTOS_ADVANCE;
  const unidades = unidadesConBanco();
  return (
    <main
      style={linea ? estiloDeLinea(linea) : undefined}
      className="flex min-h-full flex-1 flex-col"
    >
      <PantallaCentrada className="gap-5 text-center">
        <div className="w-full max-w-md space-y-3">
          <h1 className="text-titulo-l text-primary">{portada.titulo}</h1>
          {unidades.length === 0 ? (
            <>
              <p className="text-titulo-m text-primary">{portada.vacio}</p>
              <p className="text-cuerpo-m text-primary">{portada.detalle}</p>
            </>
          ) : (
            <p className="text-cuerpo-m text-primary">{portada.conBancos}</p>
          )}
        </div>
        {unidades.length > 0 && (
          <ul className="w-full max-w-md space-y-2.5" data-sesiones>
            {unidades.map(({ unidadId, titulo }) => (
              <li key={unidadId}>
                <EnlaceBoton
                  variante="linea"
                  href={
                    ejeId ? `/advance/descarte/${unidadId}?eje=${ejeId}` : `/advance/descarte/${unidadId}`
                  }
                >
                  {portada.sesion(titulo)}
                </EnlaceBoton>
              </li>
            ))}
          </ul>
        )}
        <div className="w-full max-w-md">
          {ejeId ? (
            <BotonVolver
              destino={`/linea/${ejeId}`}
              etiqueta={puerta.volverAlEje}
              tono="sobre-papel"
              className="justify-center"
            />
          ) : (
            <BotonVolver
              destino="/camino"
              etiqueta={puerta.volverALaRed}
              tono="sobre-papel"
              className="justify-center"
            />
          )}
        </div>
      </PantallaCentrada>
    </main>
  );
}
