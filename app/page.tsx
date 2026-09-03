import type { Metadata } from "next";
import { PuntoDePartida } from "@/components/PuntoDePartida";
import { ejesDelCamino, temasConNodo } from "@/lib/camino";

export const metadata: Metadata = {
  title: "Competencia matemática 1",
  description:
    "El punto de partida de Matemática M1: una medición corta para saber en qué línea subirte, o el camino completo si prefieres elegir tú.",
};

/**
 * La entrada al producto: la pantalla 01 ("Entrada") del HTML de referencia.
 *
 * Antes había dos entradas casi iguales que se contradecían — `/` era un hero de
 * texto que mandaba a la primera lección, `/inicio` era el punto de partida que
 * mandaba al diagnóstico. Ahora es una sola pantalla y `/inicio` redirige acá.
 *
 * Ya no hay camino dibujado de fondo: la 01 del HTML es una tarjeta con rótulo,
 * titular, una tira de tres cifras y dos acciones. El fondo de camino desenfocado
 * (`CaminoFantasma`) se retiró con él.
 *
 * Server component: cruza taxonomía con disco y le pasa a la isla lo que necesita
 * —las tres cifras y los temas para decidir la rama del CTA—. El estado del
 * estudiante lo resuelve el cliente, porque vive en el dispositivo.
 */
export default function Portada() {
  const temas = temasConNodo();

  /* Las tres cifras salen de lo que hay escrito y validado en disco, no de la
     taxonomía completa de `lib/modulos.ts` (que declara 16 · 48 · 4). Hoy dan
     11 · 33 · 4 y suben solas cuando se escribe contenido. El porqué, en
     docs/deuda-entrada.md §2. */
  const kpi = {
    estaciones: temas.length,
    lecciones: temas.reduce((total, tema) => total + tema.lecciones.length, 0),
    lineas: ejesDelCamino().length,
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      {/* El rótulo vive acá y no dentro de `PuntoDePartida`: es de la pantalla,
          no de la rama, así que no cambia cuando la rama cambia. */}
      <p className="text-etiqueta uppercase text-secondary">Competencia matemática 1</p>
      <div className="mt-2.5">
        <PuntoDePartida temas={temas} kpi={kpi} />
      </div>
    </main>
  );
}
