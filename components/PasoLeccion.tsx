import { Fragment, type ReactNode } from "react";
import { Bloque } from "@/components/bloques/Bloque";
import type { Paso, Bloque as BloqueTipo } from "@/lib/tipos";

/**
 * La tarjeta teñida de la pantalla 05
 * (`docs/referencia/B-linea-interfaz-completa.html:260-263`): fondo en el tinte
 * de la línea, borde en el color de la línea y el rótulo "Lo que estás viendo".
 *
 * El rótulo va en `--linea-sobre-tinte` y no en `--linea`: sobre el tinte, el
 * color de línea crudo da 4,06:1 en la 01 y 4,30:1 en la 03, bajo el 4,5:1 que
 * pide AA para 10px. Ver components/ui/linea/colores.ts.
 *
 * El texto de adentro conserva su tipografía de lectura (18px, `BloqueTexto`) y
 * no baja a los 13px de la maqueta: es el texto sobre el que el estudiante pasa
 * media hora, y la tarjeta es marco, no una excusa para achicarlo.
 */
function TarjetaLoQueVes({ rotulada, children }: { rotulada: boolean; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--linea)] bg-[var(--linea-tinte)] px-[13px] py-3">
      {rotulada && (
        <p className="mb-1.5 text-etiqueta uppercase text-[var(--linea-sobre-tinte)]">
          Lo que estás viendo
        </p>
      )}
      {children}
    </div>
  );
}

interface PasoLeccionProps {
  paso: Paso;
  leccionId: string;
  numeroPaso: number;
  onExploracionCompleta?: () => void;
  onAcierto?: () => void;
  /* El texto completo de la lección, no el de este paso: el trazo de destacador
     solo marca un término si se repite en la lección entera, y un paso suelto
     no alcanza para saberlo. Lo arma `RunnerLeccion`, que es quien tiene la
     lección. Ver lib/trazoDestacado.ts. */
  corpus?: string;
}

const TIPOS_VISUALES: BloqueTipo["tipo"][] = ["interactivoSlider", "visualizacion"];

/**
 * Lo que el cuerpo del paso espera después del título (Fase C). Dos partes, no
 * tres: el título dice qué estás mirando y todo lo demás es el paso.
 *
 * No es un token de motion y no debe serlo: un token es cuánto dura un gesto, y
 * esto es el guion de este momento. Los otros dos momentos de la fase usan
 * escalones distintos justamente porque pesan distinto — el cierre de módulo
 * 150ms, éste 70. Un escalón compartido sería el aplanamiento que la fase
 * combate.
 *
 * Los 70ms suman 70ms al tiempo percibido por paso, y solo sobre el cuerpo: el
 * paso termina de asentarse a 70 + 250 = 320ms en vez de 250. Es un retraso
 * sobre contenido que todavía no se puede usar —hay que leer el título antes de
 * que el cuerpo sirva de algo—, no sobre ninguna decisión del estudiante.
 */
const RETRASO_CUERPO = 70;

export function PasoLeccion({
  paso,
  leccionId,
  numeroPaso,
  onExploracionCompleta,
  onAcierto,
  corpus,
}: PasoLeccionProps) {
  /* Los bloques visuales (gráfico interactivo, tablas/diagramas) van al
     costado en desktop, con posición de grid fija (col-start/row-start) que
     no depende del orden en el DOM. En mobile no hay grid, así que el orden
     en el DOM sí importa: el grupo que aparece primero en el JSON define cuál
     de los dos bloques va arriba, para no adelantar un gráfico que revela el
     patrón antes de que el estudiante llegue a la pregunta que lo antecede
     (p. ej. un bloque `prediccion`). Se separan preservando el índice
     original para que las keys y los eventos por bloque no cambien entre
     layouts. */
  const bloquesConIndice = paso.bloques.map((bloque, i) => ({ bloque, i }));
  const visuales = bloquesConIndice.filter(({ bloque }) => TIPOS_VISUALES.includes(bloque.tipo));
  const lectura = bloquesConIndice.filter(({ bloque }) => !TIPOS_VISUALES.includes(bloque.tipo));
  const visualesVanPrimero =
    paso.bloques.length > 0 && TIPOS_VISUALES.includes(paso.bloques[0].tipo);

  /* Los bloques de texto que van en tarjeta teñida: los que aparecen **después**
     del primer bloque visual, y solo ésos.

     La maqueta de la pantalla 05 pone el texto en una tarjeta con el color del
     eje, rotulada "Lo que estás viendo"
     (`docs/referencia/B-linea-interfaz-completa.html:260-263`). El rótulo es del
     marco y no del contenido —no se edita ningún JSON—, pero eso no lo autoriza
     a mentir: un texto que va antes del gráfico es el planteo, no la lectura de
     la figura.

     Medido sobre el corpus el 2026-09-03: de los 38 pasos que mezclan visual con
     texto, 27 tienen al menos un texto después del primer visual (24 con
     exactamente uno, que es el caso de la maqueta) y 11 lo tienen solo antes.
     Esos 11 se quedan sin tarjeta y sin rótulo. */
  const primerVisual = paso.bloques.findIndex((b) => TIPOS_VISUALES.includes(b.tipo));
  const enTarjeta =
    primerVisual >= 0
      ? bloquesConIndice
          .filter(({ bloque, i }) => bloque.tipo === "texto" && i > primerVisual)
          .map(({ i }) => i)
      : [];

  function pintar({ bloque, i }: { bloque: BloqueTipo; i: number }) {
    const elemento = (
      <Bloque
        bloque={bloque}
        leccionId={leccionId}
        paso={numeroPaso}
        indiceBloque={i}
        onExploracionCompleta={onExploracionCompleta}
        onAcierto={onAcierto}
        corpus={corpus}
      />
    );

    if (!enTarjeta.includes(i)) return <Fragment key={i}>{elemento}</Fragment>;

    /* El rótulo va una sola vez, en la primera tarjeta del paso: repetirlo en
       cada bloque de texto lo convertiría en ruido en los tres pasos del corpus
       que tienen dos o más. */
    return (
      <TarjetaLoQueVes key={i} rotulada={i === enTarjeta[0]}>
        {elemento}
      </TarjetaLoQueVes>
    );
  }

  return (
    /* `.transicion-paso` **se movió** del `<section>` a sus dos hijos (Fase C).
       No se agregó: dejarla en los tres habría puesto una entrada dentro de otra
       —opacidades multiplicadas y los dos translateY sumados—, que es el apilado
       de `docs/deuda-entradas-apiladas.md`.

       El escalón es de 70ms, un tercio del cierre de módulo y a propósito. Este
       momento se ve unas diez veces por lección y no puede ser ceremonia: a
       200ms se percibiría "el cuerpo tardó", a 70 se percibe "el título llegó
       primero", que es lo único que hay que decir.

       Y no retrasa la interacción. El título entra exactamente cuando entraba
       antes, así que el instante en que la pantalla acusa recibo del click no se
       mueve ni un frame; el CTA y "Paso anterior" viven en `CascaronAnclado`,
       fuera de este componente, y no se remontan al cambiar de paso
       (RunnerLeccion.tsx:340-348). Los bloques del cuerpo sí entran, pero
       `opacity` y `transform` no bloquean `pointer-events`: son tocables
       mientras entran.

       El remontaje por paso ya estaba resuelto sin JS: `key={estado.pasoActual}`
       en RunnerLeccion.tsx:373 reinicia las animaciones. */
    <section>
      {/* El único h1 de la pantalla: el nombre de la lección lo da
          `document.title`, y el que cambia en cada paso —y por lo tanto el que
          nombra lo que se está mirando— es este.

          Lleva la tipografía `.q` de la maqueta
          (`docs/referencia/B-linea-interfaz-completa.html:72`): 18px, 600, altura
          de línea 1,28 y tracking -1,8%. `text-lg` ya es 1.125rem; los otros dos
          valores no están en la escala de diez pasos del sistema y van escritos
          acá en vez de agregar un paso once que hoy usaría un solo call site. */}
      <h1 className="transicion-paso text-lg font-semibold leading-[1.28] tracking-[-0.018em] text-primary">
        {paso.titulo}
      </h1>
      {visuales.length > 0 && lectura.length > 0 ? (
        <div
          className="transicion-paso mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-10"
          style={{ ["--retraso" as string]: `${RETRASO_CUERPO}ms` }}
        >
          <div
            // top-17 (68px) = los 44px del header de HeaderLeccion.tsx (`h-11`)
            // más 24 de aire, para que no se pisen al hacer scroll en desktop.
            // Venía de top-20 (80px), calibrado contra el header de 56px que la
            // fase 3H reemplazó por la barra de la maqueta.
            className={`space-y-8 lg:sticky lg:top-17 lg:col-start-2 lg:row-start-1 lg:order-none ${
              visualesVanPrimero ? "order-1" : "order-2"
            }`}
          >
            {visuales.map(pintar)}
          </div>
          <div
            className={`space-y-8 lg:col-start-1 lg:row-start-1 lg:order-none ${
              visualesVanPrimero ? "order-2" : "order-1"
            }`}
          >
            {lectura.map(pintar)}
          </div>
        </div>
      ) : (
        <div
          className="transicion-paso mx-auto mt-6 max-w-2xl space-y-8"
          style={{ ["--retraso" as string]: `${RETRASO_CUERPO}ms` }}
        >
          {paso.bloques.map((bloque, i) => pintar({ bloque, i }))}
        </div>
      )}
    </section>
  );
}
