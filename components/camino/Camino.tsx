"use client";

import { useEffect } from "react";
import Link from "next/link";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import { PuntosDeLinea } from "@/components/ui/linea/PuntosDeLinea";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { useMontado } from "@/lib/useMontado";
import { leer } from "@/lib/progresoLocal";
import { estadoDeNodo, resumirRespuestas, type EstadoNodo } from "@/lib/estadoNodo";
import { registrarEvento } from "@/lib/eventos";
import type { EjeDelCamino, TemaDelCamino } from "@/lib/camino";

/** Lo que la fila necesita saber de una línea, ya resuelto contra el progreso. */
interface LineaDelCamino {
  ejeId: string;
  nombre: string;
  /** Una entrada por estación del eje, en orden de temario: `true` = completada. */
  pasadas: boolean[];
  /** Posición 1-based de la estación activa dentro de este eje, si está acá. */
  estacionActual?: number;
  /** Ningún tema del eje tiene contenido en disco todavía. */
  sinContenido: boolean;
}

/**
 * La pantalla 02 del HTML de referencia
 * (`docs/referencia/B-linea-interfaz-completa.html:169-196`), "La red".
 *
 * **Cambio de dirección (2026-09-04, fase 3J).** Antes esta pantalla era una
 * columna de 16 nodos —`CaminoVertical` con bandas de eje pegadas y tarjeta
 * flotante— bajo una franja fija con "Tu camino" y un contador. La maqueta pide
 * lo contrario: **resumir por línea**. Cuatro filas compactas, una por eje, con
 * la barra de color, el nombre, el conteo de estaciones y una fila de puntos.
 * El detalle tema por tema ya lo da /linea/[ejeId] (pantalla 03), que es a donde
 * entra cada fila: la 02 dejó de duplicar ese nivel.
 *
 * Isla de cliente: el estado de cada estación depende del progreso del
 * dispositivo. Antes de hidratar pinta con el progreso vacío —el mismo HTML en
 * servidor y en el primer render— y se corrige después.
 *
 * **Sin `estiloDeLinea()` en la raíz.** La pantalla cruza los cuatro ejes y no
 * hay línea activa que instalar arriba; cada fila instala la suya y los puntos y
 * la barra la heredan. Es el mismo mecanismo de `AvancePersonal.tsx` y el que
 * describe `ui/linea/colores.ts:14-22`.
 *
 * **La racha de la maqueta no se dibuja.** No tiene fuente
 * (`docs/deuda-avance-por-linea.md` §1) y acá no hay una `TiraKPI` que sostenga
 * un `SIN_DATO` con su rótulo, como sí la hay en /tu: el bloque simplemente no
 * existe. No se deriva ninguna racha nueva para llenar el hueco.
 */
export function Camino({ ejes }: { ejes: EjeDelCamino[] }) {
  const montado = useMontado();

  const progreso = montado ? leer() : null;
  const resumen = resumirRespuestas(progreso);

  /* Las 16 estaciones aplanadas en orden de temario, con su estado ya resuelto.
     Se calcula una vez sobre la lista completa —y no eje por eje— porque la
     estación activa y su posición son propiedades de la red entera, no de una
     línea. */
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

  /* Dónde está parado el estudiante: lo empezado manda sobre lo que todavía no
     abre. Es el mismo criterio con el que el camino de nodos elegía su tarjeta
     activa, conservado tal cual. */
  const temaActivo =
    temas.find((t) => estadoPorTema.get(t.id) === "enCurso") ??
    temas.find((t) => estadoPorTema.get(t.id) === "disponible");

  /* La N de "Vas en la N": la posición 1-based de esa estación entre las 16, en
     orden de temario.

     Sin estación activa —todo lo que tiene contenido quedó cerrado o por
     repasar— no hay una siguiente que señalar, y el número pasa a ser la última
     estación con contenido: es hasta dónde llegó el recorrido, que es justo lo
     que la frase afirma. Los dos casos apuntan a una estación real; no se
     inventa un número. El CTA del pie, en cambio, sí desaparece — ver abajo. */
  const indiceActivo = temaActivo
    ? temas.indexOf(temaActivo)
    : temas.findLastIndex((t) => estadoPorTema.get(t.id) !== "enConstruccion");

  const lineas: LineaDelCamino[] = ejes.map((eje) => ({
    ejeId: eje.id,
    nombre: eje.nombre,
    pasadas: eje.temas.map((t) => estadoPorTema.get(t.id) === "completado"),
    estacionActual: posicionEnEje(eje, temaActivo),
    sinContenido: eje.colapsado,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-etiqueta uppercase text-secondary">Tu red</p>
      {indiceActivo >= 0 ? (
        <h1 className="mt-1.5 text-display-m text-primary">Vas en la {indiceActivo + 1}</h1>
      ) : (
        /* Ninguna estación tiene contenido todavía: no hay posición que decir y
           "Vas en la 0" no nombra ninguna parada. El titular nombra la pantalla
           y el subtítulo de abajo ya da el tamaño de la red. Hoy es inalcanzable
           —tres estaciones tienen archivos— pero el render no puede depender de
           eso. */
        <h1 className="mt-1.5 text-display-m text-primary">La red M1</h1>
      )}

      {/* Los dos números salen de la estructura, no cableados: `ejesDelCamino()`
          es la única fuente del tamaño de la red, así que publicar una lección
          nueva o declarar un eje mueve la frase sin que nadie la edite. */}
      <p className="mt-1.5 text-cuerpo-s text-secondary">
        {temas.length} estaciones repartidas en {ejes.length} líneas.
      </p>

      <div className="mt-3 flex flex-col">
        {lineas.map((linea) => (
          <FilaDeLinea key={linea.ejeId} linea={linea} />
        ))}
      </div>

      {/* El CTA solo existe si hay una estación a la que ir. Sin ella —todo
          cerrado o por repasar— un botón "Ir a mi estación" apuntaría a la
          última que ya se recorrió, que no es lo que promete. */}
      {temaActivo && (
        <div className="mt-auto pt-6">
          <EnlaceBoton href={`/tema/${temaActivo.id}`} variante="neutro">
            Ir a mi estación
          </EnlaceBoton>
        </div>
      )}
    </div>
  );
}

/**
 * En qué posición de **este** eje está la estación activa, 1-based, o
 * `undefined` si la activa no es de acá.
 *
 * Es la posición dentro de la línea y no dentro de la red: la frase es "Vas
 * aquí, estación K" leída dentro de la fila de su propia línea, así que K tiene
 * que contar desde el principio de esa línea. La posición global es la del
 * titular.
 */
function posicionEnEje(eje: EjeDelCamino, activo?: TemaDelCamino): number | undefined {
  if (!activo) return undefined;
  const i = eje.temas.findIndex((t) => t.id === activo.id);
  return i < 0 ? undefined : i + 1;
}

/**
 * Una línea: barra de color a la izquierda, nombre, el estado en una línea y la
 * fila de puntos debajo. La fila entera entra a `/linea/[ejeId]`.
 *
 * El color sale de `estiloDeLinea(linea)` puesto **en la fila**, no en la
 * pantalla, igual que en `AvancePersonal.tsx:138`: la barra y los puntos lo
 * heredan por árbol DOM sin recibir ninguna prop. Un eje fuera del mapa de
 * `lineaDeEje` no lleva `style` y cae al `--linea` de `:root`, que es tinta.
 * Nunca revienta.
 *
 * **El alto de la barra es la señal de eje activo**: 34px normal, 42px en el eje
 * donde está la estación actual. Es lo que hace la maqueta
 * (`B-linea-interfaz-completa.html:186`) y no se le suma ningún otro realce —el
 * texto de abajo ya cambia de frase y de color.
 *
 * **"Vas aquí, estación K" va en `--linea-nav`, no en `--linea`.** Acá el color
 * de la línea es texto sobre superficie clara, y la 02 (#FFB600) da 1,76:1 ahí.
 * Es la misma razón que ya documenta `colores.ts` para `NavInferior`. La barra y
 * los puntos, que son forma, sí van en `--linea`.
 *
 * Un eje sin contenido dice "Pronto" en vez de "0 de N estaciones": "0 de 4" se
 * lee como "no hiciste nada" cuando lo que pasa es que no hay nada que hacer, y
 * le atribuiría al estudiante una deuda que es nuestra. Mismo criterio que
 * `AvancePersonal.tsx:145`. Los puntos igual se dibujan: dicen el tamaño de la
 * línea, que es cierto tenga o no archivos.
 */
function FilaDeLinea({ linea }: { linea: LineaDelCamino }) {
  const id = lineaDeEje(linea.ejeId);
  const hechas = linea.pasadas.filter(Boolean).length;
  const total = linea.pasadas.length;
  const esActual = linea.estacionActual !== undefined;

  return (
    <Link
      href={`/linea/${linea.ejeId}`}
      style={id ? estiloDeLinea(id) : undefined}
      className="flex items-center gap-[11px] rounded-sm py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
    >
      {/* El alto va por `style` y no por clase: son dos valores de la maqueta y
          no dos pasos de una escala del sistema. */}
      <span
        aria-hidden="true"
        className="w-1.5 shrink-0 rounded-[3px] bg-[var(--linea)]"
        style={{ height: esActual ? 42 : 34 }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-titulo-s text-primary">{linea.nombre}</span>
        {linea.sinContenido ? (
          <span className="mt-0.5 block text-cuerpo-xs text-muted">Pronto</span>
        ) : esActual ? (
          <span className="mt-0.5 block text-cuerpo-xs font-semibold text-[var(--linea-nav)]">
            Vas aquí, estación {linea.estacionActual}
          </span>
        ) : (
          <span className="mt-0.5 block text-cuerpo-xs text-secondary">
            {hechas} de {total} estaciones
          </span>
        )}
        <PuntosDeLinea
          className="mt-1.5"
          pasadas={linea.pasadas}
          etiqueta={
            linea.sinContenido
              ? `${linea.nombre}: ${total} estaciones, todavía sin contenido`
              : `${linea.nombre}: ${hechas} de ${total} estaciones completadas`
          }
        />
      </span>
    </Link>
  );
}
