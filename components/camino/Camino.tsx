"use client";

import { useEffect } from "react";
import {
  CaminoVertical,
  type NodoCamino,
  type SeccionCamino,
} from "@/components/camino/CaminoVertical";
import { COPY_EN_PREPARACION } from "@/components/camino/NodoTema";
import {
  ContadorDePantalla,
  TituloDePantalla,
} from "@/components/navegacion/EncabezadoPantalla";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { avanceDeTema, estadoDeNodo, resumirRespuestas, type EstadoNodo } from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import { ALTO_FRANJA_CAMINO } from "@/lib/geometriaCamino";
import { TOTAL_TEMAS } from "@/lib/modulos";
import type { EjeDelCamino, TemaDelCamino } from "@/lib/camino";

const ACCION: Record<EstadoNodo, string> = {
  completado: "Repasar el tema",
  porRepasar: "Repasar el tema",
  enCurso: "Seguir el tema",
  disponible: "Empezar el tema",
  enConstruccion: "",
};

/**
 * Por qué este tema todavía no se puede abrir.
 *
 * Son dos casos y no uno, y la diferencia importa: un tema con lecciones ya
 * escritas está esperando revisión —hay algo hecho y hay un criterio conocido
 * para abrirlo—, mientras que uno sin ninguna lección todavía no tiene nada que
 * revisar. Decir lo mismo de los dos convertiría la promesa de revisión en algo
 * que no existe.
 *
 * El primer caso reusa el copy que ya escribió el camino de lecciones en vez de
 * duplicarlo: es la misma situación un nivel más abajo, y dos textos para el
 * mismo hecho se desincronizan al primer retoque.
 *
 * Ninguno de los dos promete fechas.
 */
function razonDeBloqueo(tema: TemaDelCamino): string {
  return tema.lecciones.length === 0
    ? "Todavía no tiene lecciones. Estamos construyendo el temario unidad por unidad."
    : COPY_EN_PREPARACION;
}

/**
 * El camino de temas: una columna de nodos que baja, sobre el papel milimetrado
 * que ya usa el sitio.
 *
 * **Cambio de dirección (2026-07-27).** Antes los temas iban sobre una recta
 * ascendente, de abajo-izquierda a arriba-derecha. Se revirtió tras probarlo en
 * un teléfono real: en móvil se amontonaba, en escritorio quedaba vacío, y la
 * progresión peleaba con el orden de lectura. La metáfora de la función lineal
 * vive en el contenido de las lecciones; la dirección del recorrido es
 * ergonomía. Ver MASTER.md §3.2.
 *
 * **Un solo camino, las 16 unidades (2026-07-31).** Antes se dibujaban solo los
 * temas con al menos una lección —hoy 3— y los otros 13 vivían en una tarjeta
 * colapsable al pie, "El resto del temario M1". El estudiante no veía el curso:
 * veía tres puntos sueltos y una nota al pie. Ahora el temario completo está en
 * la misma columna, agrupado por eje, con la banda del eje pegada arriba. Los
 * ejes donde ningún tema tiene lecciones declaradas arrancan plegados, con el
 * contador en su banda: cuatro discos idénticos que no llevan a ninguna parte
 * no son información, son cuatro filas gastadas.
 *
 * Este componente no hace layout: cruza el progreso del dispositivo con la
 * taxonomía y le entrega a `CaminoVertical` una lista de tramos. El layout es
 * uno solo y lo comparte con el camino de lecciones de /tema/[id].
 *
 * Isla de cliente: el estado de cada nodo depende del progreso del dispositivo.
 * Antes de hidratar pinta todo con el progreso vacío —el mismo HTML en servidor
 * y en el primer render— y se corrige después.
 */
export function Camino({ ejes }: { ejes: EjeDelCamino[] }) {
  const montado = useMontado();

  const progreso = montado ? leer() : null;
  const resumen = resumirRespuestas(progreso);

  /* Los 16 temas aplanados en orden de temario, con su estado ya resuelto. Se
     calcula una vez sobre la lista completa —y no eje por eje— porque el
     contador de avance y el nodo activo son propiedades del camino entero. */
  const temas = ejes.flatMap((eje) => eje.temas);
  const estadoPorTema = new Map<string, EstadoNodo>(
    temas.map((tema) => [tema.id, estadoDeNodo(tema, progreso, resumen)]),
  );
  const completados = [...estadoPorTema.values()].filter((e) => e === "completado").length;

  /* Una sola vez, después de hidratar: antes de eso `completados` es siempre 0
     porque `progreso` todavía es null (mismo HTML servidor/cliente), y contar
     ese cero como si fuera el dato real ensuciaría la métrica. */
  useEffect(() => {
    if (!montado) return;
    registrarEvento({
      nombre: "camino_visto",
      props: { temas_visibles: temas.length, temas_completados: completados },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje, cuando montado pasa a true
  }, [montado]);

  const nodoDeTema = (tema: TemaDelCamino): NodoCamino => {
    const estado = estadoPorTema.get(tema.id)!;
    const avance = avanceDeTema(tema, progreso);
    return {
      id: tema.id,
      titulo: tema.nombre,
      estado,
      href: estado === "enConstruccion" ? undefined : `/tema/${tema.id}`,
      accion: ACCION[estado],
      rotulo: tema.ejeNombre,
      /* En un tema bloqueado la tarjeta dice **por qué** no se puede entrar, no
         qué se va a poder hacer. Son dos razones distintas y confundirlas
         miente: un tema con lecciones escritas espera revisión, uno sin
         ninguna no tiene nada que revisar todavía. */
      descripcion: estado === "enConstruccion" ? razonDeBloqueo(tema) : tema.objetivo,
      /* El conteo solo aparece cuando dice algo que el estado no dice: en un
         tema de una sola lección es ruido. */
      contador:
        avance.total > 1 ? `${avance.hechas} de ${avance.total} lecciones` : undefined,
      onAbrir: () =>
        registrarEvento({ nombre: "nodo_tema_abierto", props: { tema_id: tema.id, estado } }),
    };
  };

  const secciones: SeccionCamino[] = ejes.map((eje) => ({
    id: eje.id,
    titulo: eje.nombre,
    plegable: eje.colapsado,
    /* Sin fecha y sin "próximamente": no prometemos plazos que no
       controlamos. */
    contador: eje.colapsado
      ? `${eje.temas.length} ${eje.temas.length === 1 ? "unidad" : "unidades"} en construcción`
      : undefined,
    nodos: eje.temas.map(nodoDeTema),
    onExpandir: () =>
      registrarEvento({ nombre: "temas_plegados_expandidos", props: { eje_id: eje.id } }),
  }));

  /* Dónde está parado el estudiante: lo empezado manda sobre lo que todavía no
     abre. Si no hay ninguno de los dos, `CaminoVertical` cae en el primer nodo
     seleccionable. */
  const temaActivo =
    temas.find((t) => estadoPorTema.get(t.id) === "enCurso") ??
    temas.find((t) => estadoPorTema.get(t.id) === "disponible");

  return (
    <div className="min-h-full flex-1">
      {/* **Franja fija y compacta (2026-07-31).** Antes el encabezado era un
          bloque de tres líneas que se iba con el scroll y gastaba ~165px del
          alto de la pantalla antes del primer disco. Con 3 nodos daba lo mismo;
          con los 16 del temario, ese alto es la diferencia entre ver el camino y
          ver dos nodos y medio.

          Es el mismo patrón compacto de `DetalleTema`, que es justo lo que hace
          que /tema/[id] cumpla el objetivo de densidad de MASTER.md §3.2: la
          identidad de la pantalla se queda arriba mientras se recorre, en vez de
          cobrarse el alto una sola vez al principio.

          `z-30` la pone sobre las bandas de eje (`z-20`), que se pegan debajo
          usando `ALTO_FRANJA_CAMINO`. El alto va por `style` y no por clase para
          que ese número sea uno solo. */}
      <header
        className="sticky z-30 border-b border-border bg-surface/80 backdrop-blur-md"
        style={{ top: "var(--tope-nav)", height: ALTO_FRANJA_CAMINO }}
      >
        <div className="mx-auto flex h-full w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <TituloDePantalla
            rotulo="Matemática M1 · Piloto privado"
            titulo="Tu camino"
          />
          {/* Contador sobre el temario completo, no sobre lo que alcanzamos a
              construir: el estudiante ve el tamaño real del curso que rinde. La
              forma corta es la que cabe en la franja; el texto entero lo dice el
              lector de pantalla. */}
          <ContadorDePantalla
            hechas={completados}
            total={TOTAL_TEMAS}
            descripcion={`unidades del temario M1 completadas de ${TOTAL_TEMAS}`}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
        <div className="rounded-panel border border-border px-3 py-4 sm:px-4">
          <CaminoVertical
            secciones={secciones}
            idActivo={temaActivo?.id}
            desplazamientoSticky={ALTO_FRANJA_CAMINO}
          />
        </div>
      </div>
    </div>
  );
}
