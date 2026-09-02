"use client";

import { Boton, EnlaceBoton } from "@/components/ui/linea/Boton";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import {
  RielEstaciones,
  type EstadoDeParada,
  type ParadaDelRiel,
} from "@/components/ui/linea/RielEstaciones";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import {
  avanceDeTema,
  estadoDeLeccion,
  estadoDeNodo,
  resumirRespuestas,
  type EstadoNodo,
} from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import type { EjeDelCamino, LeccionDelTema, TemaDelCamino } from "@/lib/camino";

function plural(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/**
 * Una estación está **pasada** cuando todas sus lecciones se recorrieron, sea
 * con dominio (`completado`) o con deuda (`porRepasar`).
 *
 * Se decide sobre los estados de las lecciones y **no** sobre `estadoDeNodo`,
 * aunque este archivo también lo use. `estadoDeNodo` colapsa el tema a
 * "porRepasar" en cuanto **una** lección queda bajo umbral, aunque las otras dos
 * no se hayan abierto: es correcto para el nodo de /camino, donde la tarjeta
 * dice aparte "1 de 3 lecciones", pero acá pintaría la estación como pasada y el
 * subtítulo diría "Pasada · 3 lecciones" con una sola hecha. Verificado en el
 * navegador con progreso sembrado, no deducido.
 *
 * Que la deuda de repaso no se distinga de un recorrido limpio es deliberado: la
 * deuda es material de la pantalla de Errores, y decirla también acá abriría un
 * segundo lugar donde mantener el mismo hecho.
 */
function estaPasada(estados: EstadoNodo[]): boolean {
  return (
    estados.length > 0 &&
    estados.every((e) => e === "completado" || e === "porRepasar")
  );
}

/** La lección donde está parado el estudiante dentro del tema: la empezada, y
 *  si no hay ninguna, la primera que se pueda abrir. Misma regla que la tarjeta
 *  de `CaminoLecciones`, un nivel más abajo. */
function leccionEnCurso(
  tema: TemaDelCamino,
  estados: EstadoNodo[],
): { leccion: LeccionDelTema; indice: number } | undefined {
  const empezada = estados.findIndex((e) => e === "enCurso");
  const i = empezada !== -1 ? empezada : estados.findIndex((e) => e === "disponible");
  return i === -1 ? undefined : { leccion: tema.lecciones[i], indice: i };
}

/**
 * La pantalla 03: una línea de la red con sus estaciones.
 *
 * Isla de cliente porque el estado de cada estación sale del progreso guardado
 * en el dispositivo. Antes de hidratar pinta con el progreso vacío —el mismo
 * HTML en el servidor y en el primer render— y se corrige después, igual que
 * `Camino` y `CaminoLecciones`.
 *
 * **Una estación por tema del eje, y ninguna más.** El HTML de referencia
 * cierra la línea con una estación de combinación ("cierre de línea · 12 ítems
 * PAES"). No se pinta: `lib/modulos.ts` declara `cierreId` por **tema**
 * (`FormaTema`), `FormaEje` no tiene ningún campo de cierre, y la ruta es
 * `/cierre/[temaId]`. El título, el conteo y el destino de esa estación
 * tendrían que inventarse los tres. El estado `combinacion` de `<Estacion>`
 * queda soportado por el riel y visible en `/_design`, sin instanciar acá.
 */
export function LineaDelEje({ eje }: { eje: EjeDelCamino }) {
  const montado = useMontado();
  const progreso = montado ? leer() : null;
  const resumen = resumirRespuestas(progreso);

  /* Todo lo que hace falta saber de cada tema, resuelto una sola vez: el estado
     del nodo —que es lo que viaja a analítica, igual que en /camino—, el de cada
     lección, y si la estación quedó atrás.

     Una estación **cerrada** es la que no tiene ninguna lección con archivo en
     disco, que en este repo es lo único que `enConstruccion` puede significar:
     no existe ninguna puerta por prerrequisitos en el código. Por eso su
     subtítulo no es un conteo —`tema.lecciones` viene vacío y diría "0
     lecciones"— sino que está en preparación. */
  const resueltos = eje.temas.map((tema) => {
    const estado = estadoDeNodo(tema, progreso, resumen);
    const estadosDeLeccion = tema.lecciones.map((l) => estadoDeLeccion(l, progreso, resumen));
    return {
      tema,
      estado,
      estadosDeLeccion,
      cerrada: estado === "enConstruccion",
      pasada: estado !== "enConstruccion" && estaPasada(estadosDeLeccion),
    };
  });

  /* Dónde está parado el estudiante en esta línea: la primera estación que no
     quedó atrás y que se puede abrir. Puede no haber ninguna —una línea entera
     recorrida, o una entera en construcción— y entonces ninguna estación crece. */
  const actual = resueltos.find((r) => !r.cerrada && !r.pasada);

  const paradas: ParadaDelRiel[] = resueltos.map((r) => {
    const { tema, estado, estadosDeLeccion } = r;
    const esActual = r === actual;
    const parada: EstadoDeParada = r.cerrada
      ? "cerrada"
      : r.pasada
        ? "pasada"
        : esActual
          ? "actual"
          : "proxima";
    const avance = avanceDeTema(tema, progreso);
    const enCurso = esActual ? leccionEnCurso(tema, estadosDeLeccion) : undefined;

    /* El subtítulo dice lo que el disco no puede: cuánto hay, y cuánto llevas.
       Los tres números salen del contenido y del progreso; ninguno se estima.
       Los minutos son `tiempoEstimadoMin` de la lección, que ya viaja en
       `LeccionDelTema`. */
    const subtitulo =
      parada === "cerrada"
        ? "En preparación"
        : parada === "pasada"
          ? `Pasada · ${plural(avance.total, "lección", "lecciones")}`
          : enCurso
            ? `Lección ${enCurso.indice + 1} de ${avance.total} · ${enCurso.leccion.minutos} min`
            : avance.hechas > 0
              ? `${avance.hechas} de ${plural(avance.total, "lección", "lecciones")}`
              : plural(avance.total, "lección", "lecciones");

    /* El paso guardado es un índice base cero (`registrarPaso`, llamado desde
       RunnerLeccion); "Paso N de M" lo muestra base uno, igual que el header
       del runner. La tarjeta aparece solo si hay una lección **empezada**: en
       una que todavía no se abre, "Paso 1 de 10" afirmaría un avance que no
       existe. */
    const pasoGuardado = enCurso
      ? (progreso?.lecciones.find((l) => l.leccionId === enCurso.leccion.id)?.pasoActual ?? 0)
      : 0;

    return {
      id: tema.id,
      estado: parada,
      titulo: tema.nombre,
      subtitulo,
      href: estado === "enConstruccion" ? undefined : `/tema/${tema.id}`,
      onAbrir: () =>
        registrarEvento({ nombre: "nodo_tema_abierto", props: { tema_id: tema.id, estado } }),
      tarjeta:
        enCurso && pasoGuardado > 0 ? (
          <div className="mt-[9px] rounded-sm border-[1.5px] border-[var(--linea)] bg-card px-[13px] py-3">
            <p className="text-titulo-s text-primary">{enCurso.leccion.titulo}</p>
            <BarraProgreso
              valor={pasoGuardado + 1}
              total={enCurso.leccion.totalPasos}
              etiqueta={`Avance de ${enCurso.leccion.titulo}`}
              className="mt-[9px]"
            />
            <p className="mt-[7px] text-cuerpo-xs text-secondary">
              Paso <span className="num">{pasoGuardado + 1}</span> de{" "}
              <span className="num">{enCurso.leccion.totalPasos}</span>
            </p>
          </div>
        ) : undefined,
    };
  });

  /* El destino del CTA. Si no hay estación actual —la línea entera recorrida—
     se cae a la primera abrible, que es repasar; si no hay ninguna abrible
     —la línea entera en construcción— el botón queda apagado, mismo criterio y
     mismo copy que la tarjeta de `CaminoVertical`. */
  const destino = actual ?? resueltos.find((r) => !r.cerrada);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pt-2 sm:px-6">
        <RielEstaciones paradas={paradas} />
      </div>
      {/* El CTA al pie, con el ancho de la columna: una sola acción principal
          por vista y es lo último que se lee (MASTER.md §3.1). */}
      <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-4 sm:px-6">
        {destino ? (
          <EnlaceBoton variante="linea" href={`/tema/${destino.tema.id}`}>
            {actual ? "Continuar" : "Repasar la línea"}
          </EnlaceBoton>
        ) : (
          <Boton variante="deshabilitado">Aún no disponible</Boton>
        )}
      </div>
    </div>
  );
}
