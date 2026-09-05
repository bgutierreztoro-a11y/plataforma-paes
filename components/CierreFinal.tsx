"use client";

import Link from "next/link";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { IlustracionCierre } from "@/components/ilustraciones/IlustracionCierre";
import { Boton, EnlaceBoton } from "@/components/ui/linea/Boton";
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

/**
 * Guion de tiempos del cierre de módulo (Fase C). Un solo lugar, en orden de
 * lectura, igual que `camino/CelebracionTema.tsx:22`.
 *
 * Es el momento más grande del producto y hasta ahora entraba de golpe: la
 * pantalla cuelga de `renderFinal` en `EjecutorSetItems.tsx:60-62`, que la monta
 * cruda, sin ningún envoltorio que la animara. El orden de entrada es lo que
 * dice qué importa — dónde estás, qué sacaste, en qué fallaste, qué hacer — y
 * las acciones van últimas a propósito: la salida no compite con el resultado.
 *
 * Escalón de 150ms y no de 200. Con 200 la secuencia cerraba a 960ms y el
 * estudiante que ya leyó su puntaje quedaba esperando los botones; con 150
 * cierra a 810ms y el orden se sigue leyendo igual de claro.
 *
 * Los retrasos NO son tokens de motion y no deben serlo. Un token es una
 * constante del sistema —cuánto dura un gesto—; un escalón es el guion de este
 * momento, y tres momentos con el mismo escalón sería justo el aplanamiento que
 * la fase combate. Las duraciones y curvas sí salen de `:root`, vía
 * `.entra-en-secuencia`.
 */
const RETRASO = {
  encabezado: 0,
  puntaje: 150,
  errores: 300,
  acciones: 450,
} as const;

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
  siguienteTemaId,
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
  /* Tema que sigue en el temario (`siguienteTemaConNodo`, resuelto en la ruta).
     Indefinido cuando éste es el último con contenido. */
  siguienteTemaId?: string;
}) {
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const diagnostico = obtenerResultadoDiagnostico();
  const promedioMs =
    respuestas.length > 0
      ? respuestas.reduce((suma, r) => suma + r.tiempoMs, 0) / respuestas.length
      : 0;
  const grupos = agruparErroresDelCierre(items, respuestas);

  /* `solicitud_siguiente_leccion` conserva su significado original: "no queda
     nada abierto y quiero más". Por eso solo se emite en la rama SIN siguiente
     estación. Cuando hay una de verdad, el estudiante navega a ella y no está
     pidiendo contenido que no existe — contarlo ahí convertiría una señal de
     demanda en un contador de navegación.

     Sin lecciones abiertas no hay id honesto que mandar: se prefiere perder el
     evento antes que atribuir la solicitud a una lección inventada. */
  function registrarSolicitudDeContenido() {
    if (ultimaLeccionId) {
      registrarEvento({
        nombre: "solicitud_siguiente_leccion",
        props: { leccion_id: ultimaLeccionId },
      });
    }
  }

  return (
    <PantallaCentrada className="gap-6 text-center">
      {/* Los cuatro bloques van dentro de un envoltorio con `.entra-en-secuencia`
          y no lo llevan puesto ellos mismos: `Tarjeta`, `TarjetaLoQueFallo` y
          `EncabezadoDeEntrada` aceptan `className` pero no `style`, y el
          `--retraso` tiene que ir inline. Ensancharles la firma metería en tres
          componentes compartidos una prop que solo usa esta pantalla.

          Los envoltorios son hermanos, nunca anidados: una entrada por elemento
          y ninguna dentro de otra (`docs/deuda-entradas-apiladas.md`). Y llevan
          ellos el ancho (`w-full max-w-lg`), porque dentro del `items-center` de
          `PantallaCentrada` un div sin ancho colapsa al contenido.

          La ilustración y el encabezado comparten escalón: la ilustración sin su
          título no dice nada, y el `gap-6` se conserva repitiéndolo adentro. */}
      <div
        className="entra-en-secuencia flex w-full flex-col items-center gap-6"
        style={{ ["--retraso" as string]: `${RETRASO.encabezado}ms` }}
      >
        <div className="w-full max-w-56">
          <IlustracionCierre />
        </div>
        <EncabezadoDeEntrada rotulo="Cierre del módulo" titulo="Terminaste el módulo">
          Llegaste al final del recorrido. Esto fue lo que mostró el cierre:
        </EncabezadoDeEntrada>
      </div>

      <div
        className="entra-en-secuencia w-full max-w-lg"
        style={{ ["--retraso" as string]: `${RETRASO.puntaje}ms` }}
      >
        <Tarjeta className="w-full p-6 text-left">
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
            Ritmo promedio: <span className="num">{formatoTiempo(promedioMs)}</span> por
            pregunta. En la PAES M1 el tiempo da para ~2:00.
          </p>
        </Tarjeta>
      </div>

      {/* La guarda es del envoltorio, no solo de la tarjeta. `TarjetaLoQueFallo`
          ya devuelve `null` sin grupos, pero un div vacío sigue siendo un item
          del flex: con `gap-6` a cada lado abriría 48px de aire donde debería
          haber 24. Y no es el caso raro — `cierre-v0`, al que redirige `/cierre`,
          no etiqueta ni un distractor, así que sin grupos es el camino normal.

          Cuando no hay tarjeta, las acciones conservan su retraso de 450ms en vez
          de subir a 300: el escalón dice "esto viene después del resultado", y eso
          es igual de cierto con dos bloques que con tres. */}
      {grupos.length > 0 && (
        <div
          className="entra-en-secuencia w-full max-w-lg"
          style={{ ["--retraso" as string]: `${RETRASO.errores}ms` }}
        >
          <TarjetaLoQueFallo grupos={grupos} className="text-left" />
        </div>
      )}

      {/* El par de acciones de la pantalla 09
          (`docs/referencia/B-linea-interfaz-completa.html:359-362`): el repaso
          del error arriba y la salida hacia adelante abajo.

          Último escalón, y eso NO las hace inalcanzables: `opacity` y `transform`
          no bloquean `pointer-events`. Los botones responden al toque desde el
          primer frame, aunque todavía estén entrando. */}
      <div
        className="entra-en-secuencia flex w-full max-w-lg flex-col gap-2.5"
        style={{ ["--retraso" as string]: `${RETRASO.acciones}ms` }}
      >
        {/* Solo con grupos: sin error catalogado, "ese error" no nombra nada y
            la tarjeta de arriba tampoco se dibujó.

            Deshabilitado por el mismo motivo y con el mismo control que el
            "Repasar" de /errores (`ListaErroresVivos.tsx:64`): no existe ruta
            de repaso dirigido (`docs/deuda-errores-vivos.md`). Sin el "3 min"
            de la maqueta, que no tiene fuente. */}
        {grupos.length > 0 && (
          <Boton type="button" variante="deshabilitado">
            Repasar ese error
          </Boton>
        )}

        {siguienteTemaId ? (
          <EnlaceBoton variante="secundario" href={`/tema/${siguienteTemaId}`}>
            Ir a la siguiente estación
          </EnlaceBoton>
        ) : (
          /* Último tema con contenido: no hay estación siguiente que ofrecer, y
             prometerla sería un enlace roto. La red es el destino honesto, y es
             el punto donde el estudiante sí está pidiendo más contenido. */
          <EnlaceBoton
            variante="secundario"
            href="/camino"
            onClick={registrarSolicitudDeContenido}
          >
            Volver a la red
          </EnlaceBoton>
        )}
      </div>
    </PantallaCentrada>
  );
}
