"use client";

import { useEffect } from "react";
import Link from "next/link";
import { EnlaceBoton } from "@/components/ui/Boton";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { estadoDeLeccion, resumirRespuestas, type EstadoNodo } from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import { UMBRAL_DOMINIO } from "@/lib/umbrales";
import type { LeccionDelTema, TemaDelCamino } from "@/lib/camino";

/** Una lección abierta del camino, con el tema al que pertenece y la etiqueta
 *  de estado que le pone `lib/estadoNodo.ts`. La página de servidor arma las
 *  lecciones con lib/camino.ts: acá no se lee contenido del disco ni se
 *  serializa una lección completa. */
interface LeccionAbierta {
  id: string;
  titulo: string;
  minutos: number;
  temaNombre: string;
  estado: EstadoNodo;
}

function abiertasEnOrden(
  temas: TemaDelCamino[],
): { leccion: LeccionDelTema; temaNombre: string }[] {
  return temas.flatMap((tema) =>
    tema.lecciones.map((leccion) => ({ leccion, temaNombre: tema.nombre })),
  );
}

/**
 * Punto de partida de la portada: una sola decisión, "¿qué hago ahora?",
 * resuelta con lo que ya existe.
 *
 * Va encima del camino dibujado de fondo, así que se presenta sin tarjeta y con
 * un único botón. Cualquier segundo elemento con peso compite con el fondo y con
 * la decisión — que es exactamente lo que MASTER.md §6 llama densidad de
 * dashboard.
 *
 * El progreso vive en lib/progresoLocal.ts, o sea en el dispositivo, bajo la
 * clave versionada que autoriza MOS §7.5. Sobrevive al reload, pero **no** al
 * cambio de dispositivo ni al borrado del navegador: la migración al servidor
 * al crear cuenta todavía no existe (docs/pendientes.md, 2026-07-26).
 *
 * Por eso el copy de todas las ramas es neutro respecto a la memoria: no dice
 * "de vuelta", no saluda distinto al que ya estuvo, y nunca afirma que algo
 * quedó guardado por tener cuenta. Un estudiante que abre esto en otro teléfono
 * ve la rama 1 y no debe poder concluir que perdió algo ni que la cuenta se lo
 * estaba guardando (docs/plan-fase-3-navegacion.md §1).
 *
 * Isla de cliente porque el progreso solo tiene sentido después de hidratar:
 * antes de eso renderiza la rama 1 —mismo HTML en servidor y en el primer
 * render, sin mismatch— y recién después se corrige a la rama que corresponda.
 */
export function PuntoDePartida({ temas }: { temas: TemaDelCamino[] }) {
  const montado = useMontado();
  /* "Falta contenido por venir" = algún módulo declara más lecciones de las
     que tienen archivo escrito. Es el mismo criterio que `estadoDelModulo`, y
     desde que se eliminó el sistema de `estado` (2026-08-12) es el único: un
     archivo que existe y valida es contenido terminado. */
  const enPreparacion = temas.some((t) => t.estado !== "completo");

  /* El estado sale de `lib/estadoNodo.ts`, el mismo módulo que pinta los dos
     niveles del camino, y no de contar filas de `progresoLocal`.

     Contar filas era una segunda derivación del mismo hecho, y se
     desincronizó exactamente donde se esperaba (docs/pendientes.md,
     2026-07-27): `registrarPaso` escribe la fila al montar el runner, o sea
     apenas se abre la lección, así que abrirla y salirse en el paso 0 le hacía
     decir a esta pantalla "te queda una lección" mientras el camino seguía
     diciendo "Empezar". Con `estadoDeLeccion` el predicado es `pasoActual > 0`
     y esa lección es `disponible` en las tres superficies que hablan de estado:
     abrir algo no es haberlo empezado. */
  const progreso = montado ? leer() : null;
  const resumen = resumirRespuestas(progreso);
  const conEstado: LeccionAbierta[] = abiertasEnOrden(temas).map(
    ({ leccion, temaNombre }) => ({
      id: leccion.id,
      titulo: leccion.titulo,
      minutos: leccion.minutos,
      temaNombre,
      estado: estadoDeLeccion(leccion, progreso, resumen),
    }),
  );
  const primera = conEstado[0];

  /* Lo empezado manda sobre lo que todavía no se abre. Es la misma regla que
     mueve la tarjeta del nodo activo en `Camino` y en `CaminoLecciones`, y está
     escrita igual a propósito: la portada y el camino tienen que elegir la
     misma lección o se contradicen al nombrarla.

     Se calculan acá arriba, antes del `if (!primera)`, y no donde se leían
     originalmente (justo antes de la rama 4) para que el evento de abajo
     pueda usarlas sin duplicar esta misma lógica de ramas en dos lugares:
     son funciones puras sobre `conEstado`, que con `conEstado` vacío
     simplemente dan `undefined`/`false`, así que moverlas antes del early
     return no cambia ningún comportamiento. */
  const pendiente =
    conEstado.find((l) => l.estado === "enCurso") ??
    conEstado.find((l) => l.estado === "disponible");

  /* Hay avance cuando alguna lección abierta dejó de estar `disponible`. Antes
     era `progreso.lecciones.length > 0`, que cuenta filas guardadas y no
     progreso. */
  const hayAvance = conEstado.some((l) => l.estado !== "disponible");

  /* La deuda pedagógica: terminada pero bajo el umbral de dominio. Misma
     etiqueta que pinta el nodo en ámbar en los dos niveles del camino. */
  const porRepasar = conEstado.find((l) => l.estado === "porRepasar");

  /* Qué rama se le muestra al estudiante, en el mismo orden y con el mismo
     criterio que las cuatro ramas de abajo — nunca "el camino todavía no
     abre": esa quinta pantalla no es ninguna de las cuatro que se pidió medir
     (empezar / continuar / repasar / todo_al_dia), y hoy es inalcanzable
     porque l1 siempre es publicable. */
  const rama: "empezar" | "continuar" | "repasar" | "todo_al_dia" | null = !primera
    ? null
    : !pendiente && porRepasar
      ? "repasar"
      : !pendiente
        ? "todo_al_dia"
        : hayAvance
          ? "continuar"
          : "empezar";

  /* Una vez por hidratación, igual que camino_visto en Camino.tsx: antes de
     montar, `progreso` es null y `rama` daría siempre "empezar" — el cero de
     SSR, no el dato real. */
  useEffect(() => {
    if (!montado || !rama) return;
    registrarEvento({ nombre: "portada_vista", props: { rama } });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por montaje, cuando montado pasa a true
  }, [montado]);

  // Invariante del camino: hoy l1 es publicable. Si algún día no se cumple, el
  // punto de partida dice la verdad en vez de ofrecer un enlace roto.
  if (!primera) {
    return (
      <Marco
        titulo="El camino todavía no abre"
        subtitulo="Ninguna lección pasó todavía la revisión matemática y de originalidad. Es lo único que falta para abrirlas."
      >
        <EnlaceBoton href="/diagnostico" anchoCompleto className="mt-8" variante="secundario">
          Hacer el diagnóstico
        </EnlaceBoton>
      </Marco>
    );
  }

  /* Rama 4 — no queda nada abierto sin terminar, pero alguna lección quedó
     bajo el umbral de dominio.

     Va **antes** que la rama 3 porque es la que impide declarar "hiciste todo"
     sobre una deuda abierta: `porRepasar` significa terminada y floja, no
     pendiente sin tocar, y hasta ahora esta pantalla la contaba como cerrada y
     mandaba al estudiante a otra parte mientras el camino la pintaba en ámbar
     (docs/pendientes.md, caso A).

     Es rama propia y no la 2 reusada a propósito: la 2 habla de algo que quedó
     sin terminar, y mezclarlas juntaría dos estados distintos en un copy que
     habría que cambiar igual.

     Si hay más de una, apunta a la primera en orden de temario — `conEstado`
     ya viene en ese orden desde `lib/camino.ts`. */
  if (!pendiente && porRepasar) {
    return (
      <Marco
        titulo="Te conviene repasar una lección"
        /* El umbral sale de lib/umbrales.ts y no escrito a mano: es
           exactamente el número que ese módulo existe para que no aparezca
           dos veces y se desincronice. */
        subtitulo={
          <>
            Terminaste todo lo abierto.{" "}
            <strong className="font-semibold text-ink">
              {porRepasar.temaNombre} · {porRepasar.titulo}
            </strong>{" "}
            quedó bajo el {Math.round(UMBRAL_DOMINIO * 100)}% de aciertos al primer
            intento.
          </>
        }
      >
        {/* Mismo criterio que la rama 2: el nombre vive en el subtítulo y el
            botón dice la acción. */}
        <EnlaceBoton href={`/leccion/${porRepasar.id}`} anchoCompleto className="mt-8">
          Repasar la lección
        </EnlaceBoton>
      </Marco>
    );
  }

  // Rama 3 — todo lo abierto quedó hecho, y sin deuda. Si no hay pendiente y
  // las lecciones abiertas existen, todas están completadas: `hayAvance` sobra.
  if (!pendiente) {
    return (
      <Marco
        titulo="Hiciste todo lo que está abierto"
        subtitulo={
          enPreparacion
            ? "Las lecciones que siguen están en preparación: se abren a medida que se terminan de escribir. Mientras tanto, las que ya hiciste se pueden repasar enteras."
            : "Las lecciones que ya hiciste se pueden repasar enteras."
        }
      >
        <EnlaceBoton href="/camino" anchoCompleto className="mt-8">
          Ver el camino
        </EnlaceBoton>
      </Marco>
    );
  }

  /* Rama 2 — quedó algo sin terminar.
     El tema y la lección se nombran, porque es lo que le permite al estudiante
     reconocer dónde iba sin abrirla. Lo que cambió (Fase 6) es **dónde**: van en
     el subtítulo y no dentro del botón. Medido a 390px, "Continuar: {tema} ·
     {lección}" ocupaba 2 líneas (71px con line-height de 24), y un botón que
     envuelve pierde la forma de botón. El dato no se recortó, se movió a la
     línea que existe para dar contexto. */
  if (hayAvance) {
    return (
      <Marco
        titulo="Te queda una lección del camino"
        subtitulo={
          <>
            <strong className="font-semibold text-ink">
              {pendiente.temaNombre} · {pendiente.titulo}
            </strong>
            . Unos {pendiente.minutos} minutos, con preguntas formato PAES al final.
          </>
        }
      >
        <EnlaceBoton href={`/leccion/${pendiente.id}`} anchoCompleto className="mt-8">
          Continuar la lección
        </EnlaceBoton>
      </Marco>
    );
  }

  /* Rama 1 — arranque, y lo que se ve antes de hidratar. El destino es la
     primera lección abierta, no el diagnóstico: `content/diagnostico.json` se
     declara a sí mismo demostración técnica que no pasa a publicable, así que
     mandar ahí el primer clic del producto abre con el cartel "DEMOSTRACIÓN —
     contenido no revisado". Decisión del 2026-07-25 en docs/pendientes.md, que
     hasta ahora solo cumplía `/` mientras esta pantalla hacía lo contrario. El
     diagnóstico sigue accesible, abajo y nombrando lo que es. */
  return (
    <Marco
      titulo="Empieza por acá"
      subtitulo={
        <>
          El camino abre en{" "}
          <strong className="font-semibold text-ink">
            {primera.temaNombre} · {primera.titulo}
          </strong>
          . Unos {primera.minutos} minutos, con preguntas formato PAES al final. No
          necesitas cuenta para nada de esto.
        </>
      }
    >
      {/* Las cuatro ramas dicen la acción y nada más; el nombre de la lección
          vive arriba, en el subtítulo. Antes esta era la única corta y las otras
          dos metían tema y lección adentro del botón. */}
      <EnlaceBoton href={`/leccion/${primera.id}`} anchoCompleto className="mt-8">
        Empezar la primera lección
      </EnlaceBoton>
      <p className="mt-6 text-sm leading-6 text-ink-suave">
        ¿Prefieres medir tu punto de partida antes? El diagnóstico son 5 preguntas y
        hoy es una versión de demostración.{" "}
        <Link
          href="/diagnostico"
          className="font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Hacer el diagnóstico
        </Link>
      </p>
    </Marco>
  );
}

/** Contenedor común a las cuatro ramas: mismo lugar del título, del subtítulo y
 *  del CTA, para que pasar de una rama a otra no mueva la página.
 *
 *  Sin tarjeta y sin borde: esto va sobre el camino dibujado de fondo, y una
 *  superficie opaca encima lo taparía justo donde tiene que verse. */
function Marco({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-xl text-center">
      {/* El rótulo no se pasa acá: lo pinta `app/page.tsx` sobre el camino de
          fondo, y duplicarlo pondría dos en la misma pantalla.

          Pasa a `h1` (Fase 6): esta era la única pantalla del producto sin
          ninguno. */}
      <EncabezadoDeEntrada titulo={titulo} escala="portada">
        {subtitulo}
      </EncabezadoDeEntrada>
      <div className="mt-5 flex flex-col items-center">{children}</div>
    </section>
  );
}
