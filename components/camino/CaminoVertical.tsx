"use client";

import { useState } from "react";
import { Boton, EnlaceBoton } from "@/components/ui/Boton";
import { PuntoNodo } from "@/components/camino/NodoTema";
import { EncabezadoEje } from "@/components/camino/EncabezadoEje";
import {
  ANCHO_CANALETA,
  ANCHO_COLUMNA,
  altoDeFila,
  desplazamientoDeNodo,
  desplazamientoVertical,
  retrasoDeEntrada,
  tapariaUnaBanda,
  RESERVA_TARJETA,
  type ElementoColumna,
} from "@/lib/geometriaCamino";
import type { EstadoNodo } from "@/lib/estadoNodo";

/**
 * Un nodo del camino, en cualquiera de los dos niveles.
 *
 * Lo que va **junto al disco** es solo `titulo`. Todo lo demás vive en la
 * tarjeta, y la tarjeta es una sola: la del nodo activo.
 */
export interface NodoCamino {
  id: string;
  /** Corto. Es lo único que se lee sin tocar nada, así que compite con los
   *  otros cinco títulos de la pantalla, no consigo mismo. */
  titulo: string;
  /** Título dentro de la tarjeta, cuando repetir `titulo` sería redundante con
   *  el rótulo. Lo usa el cierre: su rótulo ya dice "Cierre del tema", así que
   *  la tarjeta nombra el tema. */
  tituloTarjeta?: string;
  estado: EstadoNodo;
  /** El cierre del tema: disco más grande y contorno doble. */
  meta?: boolean;
  /** Destino de la acción. Ausente = el nodo no lleva a ninguna parte. */
  href?: string;
  /** Texto del botón. Dice qué pasa, no "OK" (MASTER.md §3.1). */
  accion?: string;
  /** Línea superior de la tarjeta: el eje, o el rótulo del cierre. */
  rotulo?: string;
  descripcion?: string;
  /** "N de M lecciones". Ya formateado: el camino no sabe qué se cuenta. */
  contador?: string;
  demostracion?: boolean;
  /** Dispara el evento de analítica del nivel que corresponda
   *  (`nodo_tema_abierto` en /camino, `nodo_leccion_abierto` en /tema/[id]).
   *  Vive acá y no en `CaminoVertical` porque quien arma `nodos` es quien sabe
   *  si el id es un tema o una lección — este componente es genérico a
   *  propósito y no debe aprender ese dominio. */
  onAbrir?: () => void;
}

/**
 * Un tramo del camino con su banda de encabezado.
 *
 * En /camino es un eje del temario; en /tema/[id] hay un solo tramo sin
 * encabezado, y entonces la columna es exactamente la de antes de agrupar por
 * ejes. Esa equivalencia está afirmada en `lib/geometriaCamino.test.ts`.
 */
export interface SeccionCamino {
  id: string;
  /** Ausente = tramo sin banda. La geometría no suma nada por él. */
  titulo?: string;
  /** Solo en tramos plegables: "4 unidades en construcción". Ya formateado. */
  contador?: string;
  /** Arranca plegado y su banda es un botón que lo despliega. */
  plegable?: boolean;
  nodos: NodoCamino[];
  /** Se dispara al **desplegar**, nunca al volver a plegar: lo que interesa
   *  medir es el interés, no el arrepentimiento. */
  onExpandir?: () => void;
}

/** Lo que se pinta, en orden visual, ya resuelto qué tramos están desplegados.
 *  `indiceNodo` corre solo sobre nodos: es el que alimenta el zigzag y el
 *  escalonamiento de entrada, que no saben de bandas. */
type Item =
  | { clase: "encabezado"; seccion: SeccionCamino }
  | { clase: "nodo"; nodo: NodoCamino; indiceNodo: number; primeroDelTramo: boolean };

/**
 * El camino, en columna y hacia abajo.
 *
 * **Por qué baja (enmienda del 2026-07-27).** Antes subía, sobre una recta
 * ascendente, porque el módulo enseña funciones lineales. Se revirtió tras
 * probarlo en un teléfono real: la progresión peleaba con el orden de lectura y
 * con el scroll. Ninguna app de aprendizaje sube. La metáfora de la función
 * vive en el contenido de las lecciones; la dirección del recorrido es
 * ergonomía, no didáctica. Se conservan el papel milimetrado y el trazo que une
 * los nodos.
 *
 * **Una sola implementación para los dos tamaños.** No hay árbol de móvil y
 * árbol de escritorio: hay una columna centrada de ancho máximo fijo. El
 * escritorio no necesita otro layout, necesita no estirarse. Lo único que
 * cambia con el ancho es dónde se ancla la tarjeta —al pie de la pantalla en
 * móvil, colgando del nodo en escritorio— y el tamaño de los discos.
 *
 * **Los nodos no arrastran tarjeta.** Cada uno es un disco y un título; el
 * detalle completo aparece una sola vez, para el nodo activo, y se mueve al
 * tocar otro. Antes cada nodo llevaba eje, descripción, contador y chip, y en
 * 360px eso dejaba dos nodos y medio en pantalla.
 *
 * **La columna se recorre por tramos (2026-07-31).** /camino pasó de dibujar
 * los 3 temas con contenido a dibujar los 16 del temario, agrupados por eje con
 * la banda del eje pegada arriba. El ancla de la tarjeta ya no puede multiplicar
 * por el alto de fila: suma altos de elementos, y las bandas son elementos.
 * `position: sticky` no saca del flujo, así que la suma vale igual con la banda
 * pegada — no hay que medir nada en el navegador.
 */
export function CaminoVertical({
  secciones,
  idActivo,
  desplazamientoSticky = 0,
}: {
  secciones: SeccionCamino[];
  /** Cuánto ocupa la franja fija de la pantalla, para que las bandas de eje se
   *  peguen debajo de ella y no detrás. */
  desplazamientoSticky?: number;
  /** Dónde está parado el estudiante, por id de nodo. La tarjeta arranca acá y
   *  sigue a este nodo mientras nadie toque otro — que es lo que hace que el
   *  estado llegue bien después de hidratar, sin un efecto que lo sincronice.
   *
   *  Es un id y no un índice a propósito: con bandas intercaladas hay dos
   *  numeraciones distintas (la de nodos y la de la columna) y pasar la
   *  equivocada no fallaría, solo pondría la tarjeta en otro nodo. */
  idActivo?: string;
}) {
  const [elegido, setElegido] = useState<string | null>(null);
  const [expandidas, setExpandidas] = useState<ReadonlySet<string>>(new Set());

  /* La columna visible, en orden. Un tramo plegable oculta sus nodos pero
     conserva su banda: la banda es lo que dice cuántos hay y cómo abrirlos. */
  const items: Item[] = [];
  let indiceNodo = 0;
  for (const seccion of secciones) {
    if (seccion.titulo !== undefined) {
      items.push({ clase: "encabezado", seccion });
    }
    if (seccion.plegable && !expandidas.has(seccion.id)) continue;
    seccion.nodos.forEach((nodo, i) => {
      items.push({ clase: "nodo", nodo, indiceNodo, primeroDelTramo: i === 0 });
      indiceNodo++;
    });
  }

  const elementos: ElementoColumna[] = items.map((item) =>
    item.clase === "encabezado"
      ? { tipo: "encabezado" }
      : { tipo: "nodo", meta: item.nodo.meta === true },
  );

  /* El índice de nodo de cada uno, para no ir a buscarlo dentro del render. */
  const indicePorId = new Map(
    items.flatMap((item) => (item.clase === "nodo" ? [[item.nodo.id, item.indiceNodo]] : [])),
  );

  /* Qué nodo lleva la tarjeta: lo tocado manda sobre lo que el progreso dice, y
     si ninguno de los dos sirve, el primero de la columna.

     **Todos los nodos sirven (2026-07-31).** Antes uno en construcción quedaba
     excluido de esta resolución porque no tenía tarjeta que mostrar, y el
     camino terminaba diciendo que algo no se podía abrir sin decir nunca por
     qué. Ahora su tarjeta trae la razón y el botón deshabilitado, así que no
     hay motivo para saltárselo. Un id dentro de un tramo plegado sigue sin
     contar, pero por otra razón: no está en pantalla. */
  const indiceDe = (id: string | null | undefined) =>
    id == null
      ? -1
      : items.findIndex((item) => item.clase === "nodo" && item.nodo.id === id);

  const indice = (() => {
    const tocado = indiceDe(elegido);
    if (tocado !== -1) return tocado;
    const delProgreso = indiceDe(idActivo);
    if (delProgreso !== -1) return delProgreso;

    /* De arranque, el primer nodo que **se pueda abrir**. Un nodo bloqueado es
       seleccionable —para eso tiene tarjeta con la razón— pero no es un buen
       lugar donde dejar parado a alguien que todavía no tocó nada: la pantalla
       abriría ofreciendo un botón apagado.

       Importa cuando no hay nada empezado ni disponible: con una deuda de
       repaso y el resto en construcción, `idActivo` viene vacío y sin este
       filtro la tarjeta caía en la primera unidad del temario, que hoy está en
       borrador. Solo si no hay ninguno abrible se cae al primero, que es mejor
       que no mostrar tarjeta. */
    const abrible = items.findIndex(
      (item) => item.clase === "nodo" && item.nodo.estado !== "enConstruccion",
    );
    return abrible !== -1 ? abrible : items.findIndex((item) => item.clase === "nodo");
  })();

  const itemActivo = indice >= 0 ? items[indice] : undefined;
  const activo = itemActivo?.clase === "nodo" ? itemActivo.nodo : undefined;

  /* En escritorio la tarjeta cuelga hacia abajo y tapa lo que venga: eso es lo
     que hace un panel flotante, y tapar títulos de nodos es aceptable porque
     basta tocar otro nodo para moverla. Hay dos casos donde no lo es, y en los
     dos la tarjeta se voltea y cuelga hacia arriba:

     - **La meta.** Es la última fila, así que no hay ningún nodo más abajo al
       que saltar para destaparla — queda inalcanzable.
     - **Una banda de eje.** Es un control: la banda de un eje plegado abre sus
       unidades. Taparla no la esconde, la deshabilita — el clic se lo come la
       tarjeta. Lo detectó Playwright al intentar desplegar Geometría con la
       tarjeta encima.

     El segundo caso mira todo el alcance de la tarjeta y no solo el elemento
     siguiente: la tarjeta mide más que una fila, así que llega a una banda que
     está dos elementos más abajo. Ver `tapariaUnaBanda`. */
  const siguiente = indice >= 0 ? items[indice + 1] : undefined;
  const voltear =
    (siguiente?.clase === "nodo" && siguiente.nodo.meta === true) ||
    tapariaUnaBanda(elementos, indice);

  const alternar = (seccion: SeccionCamino) => {
    /* Solo el gesto de abrir es la señal que importa: cuánto interés hay en el
       resto del temario, no si el estudiante lo volvió a cerrar. Se lee el set
       del cierre del render y no del updater funcional de abajo a propósito:
       React vuelve a invocar ese updater en modo estricto de desarrollo para
       detectar impurezas, y un evento de analítica ahí adentro se dispararía
       dos veces por un solo clic. */
    if (!expandidas.has(seccion.id)) seccion.onExpandir?.();
    setExpandidas((previas) => {
      const siguientes = new Set(previas);
      if (siguientes.has(seccion.id)) siguientes.delete(seccion.id);
      else siguientes.add(seccion.id);
      return siguientes;
    });
  };

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: ANCHO_COLUMNA }}>
      {secciones.map((seccion) => {
        const desplegada = !seccion.plegable || expandidas.has(seccion.id);
        return (
          <section key={seccion.id}>
            {seccion.titulo !== undefined && (
              <EncabezadoEje
                nombre={seccion.titulo}
                contador={seccion.contador}
                desplazamientoSticky={desplazamientoSticky}
                expandido={seccion.plegable ? desplegada : undefined}
                onAlternar={seccion.plegable ? () => alternar(seccion) : undefined}
              />
            )}
            {desplegada && (
              <ol className="relative">
                {seccion.nodos.map((nodo, i) => {
                  const n = indicePorId.get(nodo.id) ?? i;
                  const anterior = seccion.nodos[i - 1];
                  return (
                    <FilaCamino
                      key={nodo.id}
                      nodo={nodo}
                      indice={n}
                      x={desplazamientoDeNodo(n, nodo.meta)}
                      /* El trazo no cruza la banda de un eje: cada tramo empieza
                         su propio recorrido. Una línea por debajo de una franja
                         opaca y pegada se vería solo a ratos, según el scroll. */
                      xAnterior={
                        anterior ? desplazamientoDeNodo(n - 1, anterior.meta) : undefined
                      }
                      alto={altoDeFila(nodo.meta === true)}
                      altoAnterior={anterior ? altoDeFila(anterior.meta === true) : 0}
                      seleccionado={activo?.id === nodo.id}
                      onSeleccionar={() => setElegido(nodo.id)}
                    />
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}

      {/* **Una sola tarjeta**, reposicionada por CSS.
          - Móvil: fija al pie. `bottom-14` libra la barra de navegación, que
            mide 56px y también es fija.
          - Escritorio: cuelga del borde **inferior** de la fila del nodo activo,
            como el globo de un mapa. Anclarla ahí y no unos píxeles más arriba
            es lo que hace que tape enteros los títulos de abajo —que es lo que
            hace un panel flotante— en vez de cortar por la mitad el título del
            propio nodo activo.

          El anclaje viaja por variable CSS y no por `style.top` directo porque
          `top` inline aplicaría también en móvil, donde la tarjeta es `fixed`
          con `bottom`: tener las dos la estiraría de punta a punta.

          Se renderiza **una vez y no una por tamaño**. La primera versión
          montaba dos y las alternaba con `sm:hidden`: eso deja el mismo texto
          dos veces en el DOM, dos regiones `aria-live` anunciando lo mismo, y
          lo delató un test que encontró dos "Demostración" donde el estudiante
          ve una. */}
      {activo && (
        <aside
          aria-live="polite"
          className={`fixed inset-x-0 bottom-14 z-30 px-4 pb-4 sm:absolute sm:bottom-auto sm:left-[var(--canaleta)] sm:right-0 sm:top-[var(--anclaje)] sm:px-0 sm:pb-0${
            voltear ? " sm:-translate-y-full" : ""
          }`}
          style={
            {
              /* Colgando hacia abajo, el ancla es el borde inferior de la fila
                 activa. Volteada (`voltear`), el ancla pasa a ser su borde
                 superior, y `-translate-y-full` sube la tarjeta por su propio
                 alto —desconocido acá, lo resuelve el navegador— para que
                 termine justo encima en vez de justo debajo. */
              "--anclaje": `${
                voltear
                  ? desplazamientoVertical(elementos, indice) - altoDeFila(activo.meta === true)
                  : desplazamientoVertical(elementos, indice)
              }px`,
              "--canaleta": `${ANCHO_CANALETA}px`,
            } as React.CSSProperties
          }
        >
          <TarjetaActivo nodo={activo} />
        </aside>
      )}

      {/* Reserva al pie, para que lo último de la columna se pueda alcanzar.
          Antes existía solo en escritorio (`hidden sm:block`), donde evita que
          la tarjeta se salga del contenedor cuando el nodo activo es el último.

          **En móvil hacía falta igual y no estaba (2026-07-31).** Ahí la tarjeta
          es `fixed` sobre el pie y tapa `RESERVA_TARJETA` + los 56px de la barra
          de navegación: sin reserva, lo que caiga al final de la página queda
          debajo y no hay scroll que lo saque. Con 3 nodos no se notaba porque
          abajo no había nada; con las 16 unidades, las dos bandas de eje
          plegadas viven justo ahí, y Playwright las encontró inalcanzables al
          intentar desplegar Geometría en 360px.

          Sale de `RESERVA_TARJETA` y no de un número suelto para que la reserva
          siga a la tarjeta si vuelve a cambiar de alto. */}
      <div
        aria-hidden="true"
        className="h-[var(--reserva-movil)] sm:h-[var(--reserva-escritorio)]"
        style={
          {
            "--reserva-movil": `${RESERVA_TARJETA + 56}px`,
            "--reserva-escritorio": `${RESERVA_TARJETA}px`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

/**
 * Una fila: el trazo hacia el nodo anterior, el disco y el título.
 *
 * El alto es fijo (`PASO_FILA`) y no depende del contenido. Es lo que permite
 * dibujar el trazo con geometría conocida y anclar la tarjeta sin medir nada en
 * el navegador.
 */
function FilaCamino({
  nodo,
  indice,
  x,
  xAnterior,
  alto,
  altoAnterior,
  seleccionado,
  onSeleccionar,
}: {
  nodo: NodoCamino;
  indice: number;
  x: number;
  xAnterior?: number;
  alto: number;
  altoAnterior: number;
  seleccionado: boolean;
  onSeleccionar: () => void;
}) {
  return (
    <li className="relative flex items-center" style={{ height: alto }}>
      {/* El tramo de trazo que llega desde el nodo de arriba. Va por fila y no
          uno solo para todo el camino porque con el zigzag cada tramo tiene su
          propia inclinación.

          Va del centro de la fila anterior al centro de esta, y por eso necesita
          los dos altos: la fila del cierre es más alta que las demás y suponer
          que todas miden igual dejaba el tramo corto justo ahí.

          `preserveAspectRatio="none"` lo estira sin que haya que calcular la
          inclinación, y `non-scaling-stroke` evita que ese estirón deforme el
          grosor. Ojo con el dash: ese modo resuelve el trazado en píxeles de
          pantalla, no en unidades del viewBox (ver .trazo-camino en
          globals.css). */}
      {xAnterior !== undefined && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0"
          style={{
            width: ANCHO_CANALETA,
            top: -altoAnterior / 2,
            height: altoAnterior / 2 + alto / 2,
          }}
        >
          <line
            x1={xAnterior}
            y1="0"
            x2={x}
            y2="100"
            stroke="var(--color-border-fuerte)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="trazo-camino"
          />
        </svg>
      )}

      {/* El disco y el título son **un solo botón** (2026-07-31). Antes el
          disco era decorativo y solo el título seleccionaba, lo que contradecía
          MASTER.md §3.2 —"el disco es lo que se toca"— y dejaba fuera del área
          táctil justo el elemento más grande y más obvio de la fila.

          El disco sigue posicionado en la canaleta con la geometría del zigzag;
          lo que cambió es que ahora vive dentro del botón en vez de al lado.
          `entra-nodo` anima `transform`, que es lo mismo que usa el centrado,
          así que la posición y la animación siguen en elementos distintos: si
          compartieran uno, el keyframe pisaría la posición. */}
      <button
        type="button"
        onClick={onSeleccionar}
        aria-current={seleccionado ? "true" : undefined}
        className={`absolute inset-0 z-10 flex items-center rounded-tarjeta text-left motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
          seleccionado && nodo.estado !== "enConstruccion" ? "bg-accent-suave" : ""
        }`}
      >
        {/* La marca de fila activa (2026-08-01). Antes solo el título cambiaba de
            color (`text-accent-fuerte`): con 5 a 16 filas visibles no bastaba
            para ubicar cuál estaba seleccionada de un vistazo.

            El fondo se omite en un nodo `enConstruccion`: su título ya va en
            `text-ink-tenue` (2,99:1 contra el fondo, deuda preexistente fuera de
            este cambio) y `bg-accent-suave` lo bajaría a 2,72:1 — justo en la
            fila que más necesita leerse, porque es la que explica el bloqueo. La
            barra lateral, en cambio, no es texto y no depende de ese contraste:
            queda como única marca en ese caso.

            Vocabulario reutilizado, no inventado: mismo `bg-accent-suave` /
            `border-accent` que ya usan el chip "Demostración" de `TarjetaActivo`
            y la alternativa marcada en `BloquePregunta.tsx`. */}
        {seleccionado && (
          <span
            aria-hidden="true"
            className="absolute inset-y-2 left-0 w-1 rounded-full bg-accent"
          />
        )}
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `calc(${ANCHO_CANALETA}px * ${x} / 100)` }}
        >
          <span
            className="entra-nodo block"
            style={{ animationDelay: `${retrasoDeEntrada(indice)}ms` }}
          >
            <PuntoNodo estado={nodo.estado} meta={nodo.meta} />
          </span>
        </span>
        {/* El título no se desplaza con el zigzag: si el texto bailara, la
            columna dejaría de leerse como columna. A dos líneas como máximo: la
            fila tiene alto fijo, así que un título de tres —"Ecuaciones e
            inecuaciones de primer grado" ya llega— desbordaría a la fila de al
            lado. El nombre completo no se pierde cuando se recorta: es el
            título de la tarjeta en cuanto el nodo queda activo.

            Un nodo en construcción se atenúa y baja de peso. Es la misma
            jerarquía de antes; lo que cambió es que ahora también es un botón,
            porque su tarjeta explica qué le falta. */}
        <span
          className={`line-clamp-2 min-w-0 flex-1 pr-2 text-base leading-snug motion-safe:transition-colors ${
            nodo.estado === "enConstruccion"
              ? "font-medium text-ink-tenue"
              : `font-semibold ${seleccionado ? "text-accent-fuerte" : "text-ink"}`
          }`}
          style={{ marginLeft: ANCHO_CANALETA }}
        >
          {nodo.titulo}
        </span>
      </button>
    </li>
  );
}

/**
 * La única tarjeta de la pantalla: la del nodo activo.
 *
 * Compacta a propósito. En móvil va fija al pie y cada píxel que ocupa es un
 * píxel menos de recorrido visible: con 210px de alto entraban 5 nodos en una
 * pantalla de 800, con ~150px entran 6. Por eso la descripción se recorta a dos
 * líneas en vez de crecer sin techo — el texto completo del tema ya vive en la
 * tarjeta de /camino, que es donde el estudiante decide si entrar.
 */
function TarjetaActivo({ nodo }: { nodo: NodoCamino }) {
  /* Un nodo en construcción ahora **sí** tiene tarjeta (2026-07-31). Antes no
     era ni seleccionable: su disco iba punteado, su título atenuado, y no había
     forma de saber qué le faltaba. El camino mostraba que algo no se podía
     abrir pero nunca por qué. Ahora la tarjeta lo dice y el botón queda
     deshabilitado, que es más honesto que no ofrecer nada.

     El estado manda: no hace falta un campo aparte. `estadoDelCierre` nunca
     devuelve "enConstruccion" —un cierre en revisión está escrito y es
     navegable—, así que el cierre no cae acá por accidente. */
  const bloqueado = nodo.estado === "enConstruccion";

  return (
    <div className="rounded-tarjeta border border-border bg-surface p-3 shadow-tarjeta-hover">
      {nodo.rotulo && (
        <p className="text-xs font-medium uppercase tracking-wide text-ink-tenue">
          {nodo.rotulo}
        </p>
      )}
      <p className="mt-0.5 text-base font-semibold leading-snug text-ink">
        {nodo.tituloTarjeta ?? nodo.titulo}
      </p>
      {/* En un nodo bloqueado esta línea es la **razón** por la que no se puede
          entrar, no el objetivo del tema: quien arma los nodos la sustituye. */}
      {nodo.descripcion && (
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-suave">
          {nodo.descripcion}
        </p>
      )}
      {/* El contador y el chip suben junto a la descripción para que el botón
          quede solo y último: una sola acción principal por vista, y es lo
          último que se lee (MASTER.md §3.1 y §6). */}
      {(nodo.contador || nodo.demostracion) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {nodo.contador && (
            <span className="text-sm text-ink-suave">{nodo.contador}</span>
          )}
          {nodo.demostracion && (
            <span className="rounded-full bg-accent-suave px-2.5 py-0.5 text-xs font-medium text-accent-fuerte">
              Demostración
            </span>
          )}
        </div>
      )}
      {/* Full-width: la tarjeta es angosta y un botón a media línea deja al lado
          un hueco que no es nada. Ocupando el ancho, el objetivo táctil es todo
          el borde inferior de la tarjeta. */}
      {bloqueado ? (
        <Boton disabled className="mt-2.5 w-full">
          Aún no disponible
        </Boton>
      ) : (
        nodo.href &&
        nodo.accion && (
          <EnlaceBoton href={nodo.href} onClick={nodo.onAbrir} className="mt-2.5 w-full">
            {nodo.accion}
          </EnlaceBoton>
        )
      )}
    </div>
  );
}
