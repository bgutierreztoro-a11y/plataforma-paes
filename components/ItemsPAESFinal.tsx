"use client";

import { useEffect, useRef } from "react";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { AvisoCierreDemostracion } from "@/components/ui/Banner";
import { alcanzaDominio } from "@/lib/umbrales";
import { registrarEvento } from "@/lib/eventos";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { SelloDeEstacion } from "@/components/ui/linea/SelloDeEstacion";
import { GlifoRepetir } from "@/components/ui/linea/GlifoRepetir";
import { FranjaDeItems } from "@/components/ui/linea/FranjaDeItems";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";

/* Mismo estilo que el enlace "← Salir al camino" de RunnerLeccion.tsx: la
   opción discreta de esta pantalla no es un tercer botón del mismo peso que
   los otros dos, es un enlace de texto. No es <Link> porque no navega directo
   — dispara analítica y un handler antes.

   El subrayado se mudó de acá al `<span>` de la etiqueta (ver `EnlaceDiscreto`).
   Puesto en el contenedor alcanzaba también al glifo de "repetir", y una flecha
   circular con una raya debajo no se lee como un icono sino como parte del
   texto. Los dos enlaces sin glifo se rinden exactamente igual que antes: un
   `inline-flex` con un solo hijo subrayado ocupa lo mismo que el subrayado en el
   contenedor. */
const CLASE_ENLACE_DISCRETO =
  "mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Uno de los enlaces discretos del pie. Con `glifo`, antepone la flecha circular
 * de "volver a pasar por esto".
 *
 * Existe para que los cuatro call sites no repitan el `<span>` del subrayado, y
 * para que la regla del glifo quede en un solo lugar: lo llevan las dos
 * apariciones de "Repetir solo las preguntas" y ninguna otra.
 */
function EnlaceDiscreto({
  glifo = false,
  onClick,
  children,
}: {
  glifo?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={CLASE_ENLACE_DISCRETO}>
      {glifo && <GlifoRepetir />}
      <span className="underline underline-offset-4">{children}</span>
    </button>
  );
}

/** Una de las dos tarjetas del cierre. Exactamente dos: el número que importa y
 *  dónde queda dentro del tema. Nada de XP, puntos ni monedas — lista negra del
 *  MOS, y además desviarían la atención del único dato accionable. */
function TarjetaDato({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  /* ReactNode y no string: el monoespaciado es solo para las cifras, y las
     palabras que van entre ellas ("de") se pintan en sans. */
  valor: React.ReactNode;
  detalle: string;
}) {
  return (
    <Tarjeta className="p-5 text-left">
      {/* El orden ya era el correcto —etiqueta arriba, cifra abajo—; lo que
          cambió en la Fase 6 fue dejar de escribir el tamaño a mano, y en la
          Fase E, quedar en la receta única `text-etiqueta uppercase`.

          Acá sí va el gris de rótulo: la tarjeta trae fondo propio (`bg-surface`,
          #FFFFFF), donde `--text-secondary` da 4,69:1 y pasa AA — es el caso que
          `docs/deuda-contraste-etiquetas.md` §1 separa del fondo de página. */}
      <p className="text-etiqueta uppercase text-secondary">{etiqueta}</p>
      {/* Cifras tabulares: el número no cambia de ancho entre lecciones. */}
      <p className="mt-1 text-3xl font-semibold text-ink">{valor}</p>
      <p className="mt-1 text-sm leading-6 text-ink-suave">{detalle}</p>
    </Tarjeta>
  );
}

/**
 * Cierre de una lección: dos tarjetas y una decisión de tres caminos —
 * avanzar, repetir la lección completa, o repetir solo estas preguntas.
 *
 * El umbral **no bloquea nada**. Los tres caminos están siempre disponibles en
 * las dos ramas; lo que cambia con el umbral es cuál se propone primero, no
 * qué se permite: bloquear contenido por puntaje está en la lista negra del
 * MOS.
 */
export function ItemsPAESFinal({
  respuestas,
  leccionId,
  temaNombre,
  ordinalLeccion,
  totalLeccionesTema,
  onRepasar,
  onRepetirCierre,
  onContinuar,
  siguienteLeccionId,
  animarSello = false,
  cierreEnDemostracion = false,
}: {
  respuestas: RespuestaRegistrada[];
  leccionId: string;
  temaNombre: string;
  ordinalLeccion: number;
  totalLeccionesTema: number;
  onRepasar: () => void;
  /* Repite solo el cierre (itemsPAES), sin rehacer los 10 pasos. */
  onRepetirCierre: () => void;
  onContinuar: () => void;
  /* Presente solo si hay una siguiente lección publicable en el camino
     completo — decide el copy del botón/enlace de avance. */
  siguienteLeccionId?: string;
  /* Si el momento del sello se reproduce. Lo decide `RunnerLeccion`, que es
     quien sabe si éste es el primer cierre de esta lección; acá el default es
     `false` porque el estado final quieto es el render seguro — una pantalla que
     nunca anima es correcta, una que anima de más es una promesa repetida. */
  animarSello?: boolean;
  /* Solo aplica cuando el destino de "Continuar" es /cierre. */
  cierreEnDemostracion?: boolean;
}) {
  const total = respuestas.length;
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const conDominio = alcanzaDominio(aciertos, total);
  const copyAvanzar = siguienteLeccionId ? "Siguiente lección" : "Seguir al camino";

  /* Esta pantalla solo se monta una vez, cuando EjecutorSetItems agota los
     ítems (ver su condición `indiceActual >= items.length`): no hay
     re-render que vuelva a poner indiceActual atrás, así que el montaje es
     el evento real de "llegó al resultado", igual que leccion_inicio en
     RunnerLeccion.tsx.
     El `ref` es el mismo guardia que ya usa CelebracionTema.tsx contra el
     modo estricto de desarrollo, que monta dos veces: verificado en el
     navegador que sin él este evento se duplicaba (dos entradas idénticas en
     consola por una sola pantalla), y `leccion_terminada` alimenta una tasa
     de término — contarla dos veces la infla. */
  const yaRegistrado = useRef(false);
  useEffect(() => {
    if (yaRegistrado.current) return;
    yaRegistrado.current = true;
    registrarEvento({
      nombre: "leccion_terminada",
      props: { leccion_id: leccionId, aciertos, total, sobre_umbral: conDominio },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una sola vez, al montar esta pantalla
  }, []);

  /* A diferencia de cuando solo había un botón en la rama con dominio, ahora
     las tres opciones son una decisión real en las dos ramas: los tres
     eventos se registran siempre, no solo bajo el umbral. */
  function repasar() {
    registrarEvento({ nombre: "repaso_elegido", props: { leccion_id: leccionId } });
    onRepasar();
  }

  function continuar() {
    registrarEvento({ nombre: "camino_elegido", props: { leccion_id: leccionId } });
    onContinuar();
  }

  function repetirCierre() {
    registrarEvento({ nombre: "cierre_repetido_elegido", props: { leccion_id: leccionId } });
    onRepetirCierre();
  }

  return (
    <PantallaCentrada>
      <div className="w-full max-w-xl text-center">
        <EncabezadoDeEntrada
          rotulo={temaNombre}
          titulo={conDominio ? "Lección terminada" : "Lección terminada, y hay algo que afinar"}
        />

        {/* El momento (Fase C2). Va acá, entre el título y las cifras, porque es
            lo que el título afirma dicho en señalética — y antes de los números,
            que son el detalle.

            Hermano y no envoltorio: los tres CTA de abajo se pintan y se tocan
            desde el primer frame, y ninguna de las tres animaciones del sello
            cae sobre un elemento que ya esté entrando por otra cosa. Esta
            pantalla no tiene entrada escalonada propia —a diferencia del cierre
            de módulo, del paso y de la celebración—, así que el sello es lo
            único que se mueve y no hay apilado que agregar a
            `docs/deuda-entradas-apiladas.md`.

            `conDominio` y no un umbral propio: el sello repite lo que el `h1` de
            arriba ya dice. Ver `lib/umbrales.ts`. */}
        <SelloDeEstacion className="mt-6" estampado={conDominio} animar={animarSello} />

        {/* La contraparte de la franja hueca del anuncio previo
            (`AnuncioPrevioItems.tsx`): la misma fila, ahora llena. Esa es toda
            su razón de estar acá — el estudiante vio ocho casillas vacías antes
            de empezar y ve las mismas ocho resueltas al terminar.

            Hermana del sello y no envuelta en él ni en nada que anime: el sello
            trae su guion interno propio y esta pantalla no tiene entrada
            escalonada, así que no hay entrada que apilar
            (`docs/deuda-entradas-apiladas.md`).

            Se arma con `respuestas` y no con un total, igual que en
            `CierreFinal.tsx:183`: la franja muestra lo rendido. */}
        <FranjaDeItems
          className="mt-6"
          resultados={respuestas.map((r) => (r.correcta ? "correcto" : "incorrecto"))}
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TarjetaDato
            etiqueta="Aciertos"
            valor={<span className="num">{`${aciertos}/${total}`}</span>}
            detalle="Preguntas formato PAES de esta lección."
          />
          <TarjetaDato
            etiqueta="Tu avance"
            valor={
              <>
                <span className="num">{ordinalLeccion}</span>
                <span className="px-1.5 text-2xl text-ink-suave">de</span>
                <span className="num">{totalLeccionesTema}</span>
              </>
            }
            detalle={`Lecciones de ${temaNombre}.`}
          />
        </div>

        {conDominio ? (
          <>
            <p className="mt-6 text-base leading-7 text-ink-suave">
              Lo que viste acá quedó sólido.
            </p>
            {/* Un solo primario a ancho completo (Fase 6). Antes eran dos
                botones del mismo peso lado a lado y un enlace debajo: tres
                opciones compitiendo sin que ninguna se leyera como la propuesta.
                Ahora la jerarquía es una y se ve — primario, texto, texto. */}
            <Boton anchoCompleto className="mt-6" onClick={continuar}>
              {copyAvanzar}
            </Boton>
            <div className="flex flex-col items-center">
              <EnlaceDiscreto onClick={repasar}>Repasar esta lección</EnlaceDiscreto>
              {/* El glifo va acá y no en el de arriba: los dos enlaces decían lo
                  mismo con distintas palabras y había que separar uno de los
                  dos. Se marca el más angosto —repetir solo el set— porque es
                  el que se confunde con el otro, y no al revés. */}
              <EnlaceDiscreto glifo onClick={repetirCierre}>
                Repetir solo las preguntas
              </EnlaceDiscreto>
            </div>
          </>
        ) : (
          <>
            {/* Tono de guía, jamás de reproche (MASTER.md §4): nombra el hecho y
                ofrece la salida, no califica a la persona. */}
            <p className="mt-6 text-base leading-7 text-ink-suave">
              Varias se te escaparon. Rehacer la lección ahora es lo que más rinde: no
              pierdes nada de lo que ya hiciste, y el camino te espera igual.
            </p>
            {/* Misma jerarquía que la otra rama; lo que cambia es cuál opción
                es la propuesta, que es la decisión que el umbral ya tomaba. */}
            <Boton anchoCompleto className="mt-6" onClick={repasar}>
              Repasar esta lección
            </Boton>
            <div className="flex flex-col items-center">
              {/* Misma regla que en la otra rama: el glifo marca "repetir el
                  set" siempre que aparece, tenga al lado a "Repasar esta
                  lección" o al avance. */}
              <EnlaceDiscreto glifo onClick={repetirCierre}>
                Repetir solo las preguntas
              </EnlaceDiscreto>
              <EnlaceDiscreto onClick={continuar}>{copyAvanzar}</EnlaceDiscreto>
            </div>
          </>
        )}

        {cierreEnDemostracion && (
          <div className="mt-6 text-left">
            <AvisoCierreDemostracion />
          </div>
        )}
      </div>
    </PantallaCentrada>
  );
}
