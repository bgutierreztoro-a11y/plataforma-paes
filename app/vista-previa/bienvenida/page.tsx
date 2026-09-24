import type { Metadata } from "next";
import { Bienvenida } from "@/components/recorrido/Bienvenida";
import { TarjetaPrimeraParada } from "@/components/recorrido/TarjetaPrimeraParada";
import { vistaDelPerfil } from "@/lib/recorrido/servidor";
import { encabezadoAcceso } from "@/lib/recorrido/textosBienvenida";

export const metadata: Metadata = {
  title: "Vista previa — bienvenida",
  robots: { index: false, follow: false },
};

const CASOS = [
  { titulo: "Me va bien + encontrar mis errores, desde el video", p1: "me_va_bien", p2: "encontrar_errores", p3: "si", unidad_origen: "porcentaje" },
  { titulo: "Me cuestan harto, puerta B", p1: "me_cuestan", p2: "practicar_prueba", p3: null, unidad_origen: null },
  { titulo: "Más o menos + practicar como en la prueba", p1: "mas_o_menos", p2: "practicar_prueba", p3: null, unidad_origen: null },
  { titulo: "Saltó todo, puerta B", p1: null, p2: null, p3: null, unidad_origen: null },
] as const;

/**
 * Ruta de previsualización, no de producto (mismo patrón que las otras /vista-previa): las
 * pantallas de /bienvenida sin sesión ni base. Las tarjetas salen de vistaDelPerfil con el
 * contenido real; no escriben nada ni emiten analítica. La bienvenida de arriba no tiene
 * acceso, así que no emite cuenta_creada, y al terminar muestra el estado de error: sin
 * sesión, la API responde 401. Ningún enlace de la aplicación apunta acá.
 */
export default function VistaPreviaBienvenida() {
  return (
    <div className="mx-auto max-w-md space-y-12 px-4 py-8">
      <p className="rounded-tarjeta border border-dashed border-border-fuerte bg-surface px-4 py-3 text-sm text-ink-suave">
        Vista previa interna. Sin sesión ni base: responder la última pregunta muestra el estado de error.
      </p>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-tenue">Puerta A, con prueba</h2>
        <Bienvenida
          encabezado={encabezadoAcceso({ origen: "prueba", vigencia_hasta: new Date("2026-10-01T15:00:00Z") })}
          unidadOrigen="porcentaje"
          entrada="video"
          video={null}
          acceso={null}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-tenue">Puerta B, con cortesía</h2>
        <Bienvenida
          encabezado={encabezadoAcceso({ origen: "cortesia", vigencia_hasta: new Date("2026-12-01T03:00:00Z") })}
          unidadOrigen={null}
          entrada="directa"
          video={null}
          acceso={null}
        />
      </section>

      {CASOS.map(({ titulo, ...perfil }) => (
        <section key={titulo} className="space-y-3" data-caso={titulo}>
          <h2 className="text-sm font-medium text-ink-tenue">{titulo}</h2>
          <TarjetaPrimeraParada parada={vistaDelPerfil(perfil)} registrar={false} />
        </section>
      ))}
    </div>
  );
}
