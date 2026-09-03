"use client";

import Link from "next/link";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import {
  RielEstaciones,
  type EstadoDeParada,
  type ParadaDelRiel,
} from "@/components/ui/linea/RielEstaciones";
import { SIN_DATO, TiraKPI } from "@/components/ui/linea/TiraKPI";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { estadoDeLeccion, leccionesCompletadas, resumirRespuestas } from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import type { TemaDelCamino } from "@/lib/camino";

/** La posición de la lección **dentro del tema**, con cero a la izquierda, como
 *  la escribe la maqueta ("Lección 02"). No es un id ni un número global. */
function ordinal(indice: number): string {
  return String(indice + 1).padStart(2, "0");
}

/**
 * La pantalla 04 del HTML de referencia ("Estación"),
 * `docs/referencia/B-linea-interfaz-completa.html:220-237`.
 *
 * De arriba a abajo: la etiqueta de la línea, el nombre del tema, su objetivo,
 * las tres cifras, el riel con las lecciones y el cierre, y una sola acción al
 * pie. Reemplaza el marco de la capa anterior —franja fija con `←` a /camino,
 * `TituloDePantalla` y la columna de `CaminoVertical` con tarjeta flotante—, que
 * era el motivo de que la 04 figurara como parcial en el recuento de la fase 3.
 *
 * **La salida de esta pantalla es hacia la línea, no hacia /camino.** Lo dice la
 * maqueta: el único enlace de vuelta es la propia etiqueta ("← Línea 03 ·
 * Geometría"). El botón de volver de la franja fija desaparece con ella.
 *
 * Isla de cliente porque el estado de cada estación sale del progreso guardado
 * en el dispositivo. Antes de hidratar pinta con el progreso vacío —el mismo
 * HTML en el servidor y en el primer render— y se corrige después, igual que
 * `Camino` y `LineaDelEje`.
 *
 * **No lleva `NavInferior`.** En el HTML solo las pantallas 02, 10 y 11 traen
 * barra; la 04 es una pantalla de profundidad dentro de la red, no un destino de
 * la barra. Mismo criterio que /linea/[ejeId].
 */
export function DetalleTema({ tema }: { tema: TemaDelCamino }) {
  const montado = useMontado();
  const progreso = montado ? leer() : null;

  /* `leccionesCompletadas` y no `estadoDeNodo` / `estadoDeLeccion` /
     `estadoDelCierre`: los tres pasan por `itemsRespondidos.get("cierre")`, el
     balde único que comparten los once cierres y que documenta
     `docs/deuda-avance-por-linea.md` §3. Esta pantalla no lo toca, así que
     ninguno de sus números ni de sus marcadores puede salir mal por ese bug.
     Es la misma lista que suma `avanceDeTema`, leída una sola vez. */
  const completadas = leccionesCompletadas(progreso);

  /* Solo para la analítica: `nodo_leccion_abierto` reporta `EstadoNodo` —el
     vocabulario de cinco etiquetas— y ya venía emitiéndolo así desde el marco
     anterior, así que cambiar lo que reporta sería una regresión silenciosa. */
  const resumen = resumirRespuestas(progreso);

  const linea = lineaDeEje(tema.ejeId);

  /* Dónde está parado el estudiante: la primera lección que no cerró. -1 cuando
     las cerró todas, que es lo que manda el CTA al cierre. No hay puerta por
     prerrequisitos en este producto, así que "primera pendiente" es una
     sugerencia de orden, no un candado. */
  const pendiente = tema.lecciones.findIndex((l) => !completadas.has(l.id));

  /* Las tres cifras salen del contenido en disco y ninguna se estima:
     `lecciones` son las que tienen archivo (`lib/camino.ts:50-66`), los ítems
     son `itemsPAES` de cada lección más los `items` del cierre —un cierre no
     tiene `itemsPAES`, por eso el segundo sumando viene de `cierreTotalItems`—,
     y los minutos son `tiempoEstimadoMin`. Medido el 2026-09-03 sobre los 11
     temas con contenido: 17 ítems en todos (3 por lección × 3 + 8 del cierre) y
     entre 66 y 90 minutos según el tema. */
  const items =
    tema.lecciones.reduce((suma, l) => suma + l.totalItemsPAES, 0) + tema.cierreTotalItems;
  const minutos = tema.lecciones.reduce((suma, l) => suma + l.minutos, 0);

  /* `tiempoEstimadoMin` está hoy en los 33 archivos de lección, pero **no es
     `required`** en `content/schema/leccion.schema.json`: el día que falte, la
     suma daría `NaN` y la celda afirmaría un disparate. Sin dato se dice sin
     dato, mismo criterio que Racha e Ítems en /tu (`TiraKPI.tsx:21`). */
  const minutosMedidos = tema.lecciones.every((l) => Number.isFinite(l.minutos));

  const paradas: ParadaDelRiel[] = tema.lecciones.map((leccion, i) => {
    /* Una lección que todavía no se alcanzó va en `proxima` —anillo en color de
       línea—, **no** en `cerrada`. La maqueta la pinta apagada (`.stn.lock`),
       pero en este producto no existe ninguna puerta por prerrequisitos: el
       estudiante puede abrirla ahora mismo, y apagarla prometería un candado que
       no hay. `cerrada` significa "sin archivo en disco", que es lo único que
       puede significar acá — y eso no llega a esta pantalla, porque
       `tema.lecciones` ya viene filtrado por `leccionesDelTema()`. */
    const estado: EstadoDeParada = completadas.has(leccion.id)
      ? "pasada"
      : i === pendiente
        ? "actual"
        : "proxima";

    return {
      id: leccion.id,
      estado,
      titulo: leccion.titulo,
      subtitulo: `Lección ${ordinal(i)}${estado === "pasada" ? " · completa" : ""}`,
      href: `/leccion/${leccion.id}`,
      onAbrir: () =>
        registrarEvento({
          nombre: "nodo_leccion_abierto",
          // `estadoDeLeccion` lee `aciertos`/`itemsRespondidos` por id de lección, nunca
          // la clave "cierre": el bug del balde único (deuda-avance-por-linea §3) solo
          // toca `estadoDeNodo` y `estadoDelCierre`, y acá no se llama ninguno de los dos.
          props: { leccion_id: leccion.id, estado: estadoDeLeccion(leccion, progreso, resumen) },
        }),
    };
  });

  if (tema.cierreId) {
    paradas.push({
      id: "cierre",
      /* El rombo de la maqueta (`.stn.tr`), que `Estacion` pinta en `border-strong`
         —tinta— y no en color de línea. Va en `combinacion` a secas y no en
         `combinacion + apagado`: no existe ese estado y no se agrega, por lo
         mismo que las lecciones no van en `lock`. El cierre es navegable aunque
         su contenido esté en revisión (decisión del 2026-07-25).

         Su estado de rendido **no** se pinta: la única fuente sería el balde
         contaminado, y el rombo es fijo en la maqueta de todos modos. Así el bug
         del `contextoId` no tiene por dónde entrar acá. */
      estado: "combinacion",
      titulo: "Cierre PAES",
      /* Sin el número cuando es 0 —el cierre quedó fuera por contenido
         inválido—, en vez de anunciar "0 ítems". Mismo criterio que tenía el
         rótulo del cierre en el marco anterior. */
      subtitulo:
        tema.cierreTotalItems > 0
          ? `${tema.cierreTotalItems} ítems tipo prueba`
          : "Ítems tipo prueba",
      href: `/cierre/${tema.id}`,
    });
  }

  const destino = destinoDelCTA(tema, progreso, pendiente);

  return (
    /* La línea se instala **una sola vez, acá**, en la raíz: la etiqueta, el
       riel, el rombo y el CTA la toman por herencia sin recibir props. Un eje
       fuera del mapa devuelve `undefined` y no se pone `style`: el fallback es
       el default de `:root` en app/globals.css —`--linea: var(--text-primary)` y
       sus cinco derivados en tinta—, así que la tabla no se duplica acá. */
    <div
      className="flex min-h-full flex-1 flex-col"
      style={linea ? estiloDeLinea(linea) : undefined}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-2 sm:px-6">
        {/* La etiqueta es el único camino de vuelta de la pantalla, así que
            conserva el área táctil de 44px del botón que reemplaza aunque la
            maqueta la dibuje como texto suelto. El foco va a `outline-strong`
            —tinta— y no al color de línea: el anillo tiene que leerse igual en
            las cuatro. */}
        <Link
          href={`/linea/${tema.ejeId}`}
          className="inline-flex min-h-11 items-center self-start text-etiqueta uppercase text-[var(--linea)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
        >
          ← {linea ? `Línea ${linea} · ` : ""}
          {tema.ejeNombre}
        </Link>

        <h1 className="mt-[3px] text-titulo-l text-primary">{tema.nombre}</h1>

        {/* `objetivo` y no un texto nuevo: es el único campo descriptivo que el
            tema tiene (`FormaTema` en lib/modulos.ts), está escrito en lenguaje
            del estudiante y ya es la `description` de la ruta. */}
        <p className="mt-[7px] text-cuerpo-s text-secondary">{tema.objetivo}</p>

        <TiraKPI
          className="mt-[13px]"
          celdas={[
            { cifra: tema.lecciones.length, rotulo: "Lecciones" },
            { cifra: items, rotulo: "Ítems" },
            minutosMedidos
              ? { cifra: minutos, rotulo: "Min", descripcion: `${minutos} minutos estimados` }
              : { cifra: SIN_DATO, rotulo: "Min", descripcion: "sin dato" },
          ]}
        />

        <RielEstaciones className="mt-3.5" paradas={paradas} />

        {/* Una sola acción principal por vista, y es lo último que se lee
            (MASTER.md §3.1). `mt-auto` la deja al pie aunque el riel sea corto,
            como en la maqueta. */}
        <div className="mt-auto pb-6 pt-6">
          <EnlaceBoton variante="linea" href={destino.href}>
            {destino.copy}
          </EnlaceBoton>
        </div>
      </div>
    </div>
  );
}

/**
 * A dónde manda el botón del pie, y con qué verbo.
 *
 * El verbo dice la acción real (MASTER.md §4): "continuar" una lección que nunca
 * se abrió sería falso, así que se separa de "empezar" mirando `pasoActual`, que
 * sale del mismo `ProgresoLocal` que las completadas y tampoco toca el balde del
 * cierre. Es el mismo criterio que el mapa `ACCION` del marco anterior.
 *
 * Con todas las lecciones cerradas el destino es el cierre. Un tema sin cierre
 * declarado no tiene a dónde avanzar: se ofrece repasar, igual que hace
 * `LineaDelEje` cuando la línea entera quedó atrás.
 */
function destinoDelCTA(
  tema: TemaDelCamino,
  progreso: ReturnType<typeof leer>,
  pendiente: number,
): { href: string; copy: string } {
  if (pendiente !== -1) {
    const leccion = tema.lecciones[pendiente];
    const empezada =
      (progreso?.lecciones.find((l) => l.leccionId === leccion.id)?.pasoActual ?? 0) > 0;
    return {
      href: `/leccion/${leccion.id}`,
      copy: `${empezada ? "Continuar" : "Empezar"} lección ${ordinal(pendiente)}`,
    };
  }

  if (tema.cierreId) {
    return { href: `/cierre/${tema.id}`, copy: "Ir al cierre PAES" };
  }

  return { href: `/leccion/${tema.lecciones[0].id}`, copy: "Repasar el tema" };
}
