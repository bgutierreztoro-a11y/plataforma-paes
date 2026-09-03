"use client";

import { useUser } from "@clerk/nextjs";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import { Boton } from "@/components/ui/linea/Boton";
import { SIN_DATO, TiraKPI } from "@/components/ui/linea/TiraKPI";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import { avanceDeTema } from "@/lib/estadoNodo";
import { leer } from "@/lib/progresoLocal";
import { useMontado } from "@/lib/useMontado";
import type { EjeDelCamino } from "@/lib/camino";

/** Lo que la pantalla necesita saber de una línea: su nombre y cuántas de sus
 *  lecciones están cerradas. */
interface AvanceDeLinea {
  ejeId: string;
  nombre: string;
  hechas: number;
  total: number;
}

/**
 * La pantalla 11 del HTML de referencia
 * (`docs/referencia/B-linea-interfaz-completa.html:385-406`).
 *
 * Isla de cliente por dos motivos que apuntan al mismo sitio: el progreso vive
 * en `localStorage` (`lib/progresoLocal.ts`) y el nombre vive en la sesión de
 * Clerk. Ninguno de los dos existe en el servidor. `useUser` además tiene que
 * quedarse del lado cliente para no forzar render dinámico de la ruta, que es
 * el riesgo que documenta `docs/plan-fase-3-navegacion.md:171-177` y que ya
 * evitan `PanelCuenta.tsx` y `EnlaceCuenta.tsx`.
 *
 * `useMontado()` es lo que mantiene la hidratación en pie: el primer paint del
 * cliente tiene que coincidir con el HTML del servidor —todo en cero, sin
 * nombre— y recién después aparecen el progreso y la sesión. Mismo criterio que
 * `DetalleTema.tsx:26-27` y que `ErroresVivos.tsx:12-18`.
 *
 * **Cuenta lecciones completadas, no estaciones.** El HTML promete "Estaciones",
 * pero el chequeo de tema completo pasa por el cierre y ese chequeo hoy usa un
 * balde único: `estadoDeNodo` lee `itemsRespondidos.get("cierre")`
 * (`lib/estadoNodo.ts:118`) y `Cierre.tsx:56` escribe `contextoId="cierre"` para
 * los once cierres, así que rendir uno marca completos temas ajenos.
 * `avanceDeTema` no toca ese balde —solo mira `lecciones[].completada`—, y por
 * eso el rótulo dice "Lecciones": es exactamente lo que el número mide. El
 * desfase completo está en `docs/deuda-avance-por-linea.md`.
 *
 * **Racha e ítems se pintan sin dato, a propósito.** No hay fuente para
 * ninguno de los dos y la que se acerca mentiría: `podar()` conserva las últimas
 * 500 respuestas y las descarta hacia atrás, y ante cuota llena el array
 * completo se pierde. Un 0 ahí afirmaría "llevas cero" sobre algo que nadie
 * midió. Ver los puntos 1 y 2 del documento de deuda.
 *
 * Sin `estiloDeLinea()` a nivel de pantalla: las cuatro líneas se muestran en
 * paralelo, así que no hay una activa. Cada fila instala la suya y la barra la
 * hereda — ver `FilaDeLinea`.
 */
export function AvancePersonal({ ejes }: { ejes: EjeDelCamino[] }) {
  const montado = useMontado();
  const { user } = useUser();

  /* Antes de montar se piden los denominadores con numerador 0: es lo que el
     servidor puede renderizar sin leer el dispositivo, y así las cuatro filas
     existen desde el HTML —el alto no salta al hidratar— sin afirmar avance. */
  const lineas = avancePorLinea(ejes, !montado);

  const leccionesHechas = lineas.reduce((suma, l) => suma + l.hechas, 0);

  /* El titular es el nombre solo cuando existe. Es el caso minoritario: la
     cuenta es opcional en todo el producto (`app/registrarse/page.tsx:22`) y
     Clerk no exige nombre al registrarse —`nombreDe()` en el webhook lo dice
     literal, "Nunca requerido"—. Sin nombre el titular es el de la pestaña, que
     ya nombra la pantalla sin inventarle identidad a nadie. */
  const titular = (montado && user?.firstName) || "Tú";

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-etiqueta uppercase text-secondary">Tu avance</p>
      <h1 className="mt-1.5 text-display-m text-primary">{titular}</h1>

      <TiraKPI
        className="mt-3"
        celdas={[
          { cifra: SIN_DATO, rotulo: "Racha", descripcion: "sin dato" },
          {
            cifra: leccionesHechas,
            rotulo: "Lecciones",
            descripcion: `${leccionesHechas} lecciones completadas`,
          },
          { cifra: SIN_DATO, rotulo: "Ítems", descripcion: "sin dato" },
        ]}
      />

      <p className="mt-5 text-etiqueta uppercase text-secondary">Por línea</p>
      <div className="mt-2.5 flex flex-col gap-3">
        {lineas.map((linea) => (
          <FilaDeLinea key={linea.ejeId} linea={linea} />
        ))}
      </div>

      {/* Funcionalidad de Modo PAES, sin definir: no hay destinatario, ni
          contenido de reporte, ni la decisión de consentimiento que un envío a
          un tercero sobre un menor exige. `deshabilitado` además pone el
          atributo `disabled` (`Boton.tsx:78`). Ver el punto 5 del documento de
          deuda. */}
      <div className="mt-auto pt-6">
        <Boton type="button" variante="deshabilitado">
          Enviar reporte al apoderado
        </Boton>
      </div>
    </div>
  );
}

/**
 * Una línea: nombre a la izquierda, `hechas/total` a la derecha, barra debajo.
 *
 * El color sale de `estiloDeLinea(linea)` puesto **en la fila**, no en la
 * pantalla. `BarraProgreso` rellena con `bg-[var(--linea)]`
 * (`BarraProgreso.tsx:37`), así que la variable baja por herencia y las cuatro
 * barras quedan cada una en su color sin que el componente tenga que aceptar una
 * prop nueva. Es el mecanismo que describe `colores.ts:14-22`.
 *
 * Un eje fuera del mapa de `lineaDeEje` no lleva `style` y cae al `--linea` de
 * `:root`, que es tinta. Nunca revienta.
 */
function FilaDeLinea({ linea }: { linea: AvanceDeLinea }) {
  const id = lineaDeEje(linea.ejeId);

  /* Una línea sin ninguna lección escrita todavía no muestra fracción. "0/0" se
     lee como "no has hecho nada" cuando lo que pasa es que no hay nada que
     hacer: le atribuiría al estudiante una deuda que es nuestra. Hoy es el caso
     de Probabilidad y estadística. Mismo criterio que /camino, que pliega el eje
     entero cuando todos sus temas están en `sin-contenido`
     (`lib/camino.ts:120`), en vez de dibujar cuatro discos vacíos. */
  const sinContenido = linea.total === 0;

  return (
    <div style={id ? estiloDeLinea(id) : undefined}>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-cuerpo-s text-primary">{linea.nombre}</span>
        {/* `num` por tabular-nums: las fracciones se alinean en columna. El `/`
            es aria-hidden y la barra de abajo ya lleva el nombre accesible con
            la frase completa. */}
        {sinContenido ? (
          <span className="shrink-0 text-cuerpo-xs text-muted">Pronto</span>
        ) : (
          <span className="num shrink-0 text-cuerpo-xs text-secondary" aria-hidden="true">
            {linea.hechas}/{linea.total}
          </span>
        )}
      </div>
      <BarraProgreso
        className="mt-1.5"
        valor={linea.hechas}
        total={linea.total}
        etiqueta={
          sinContenido
            ? `${linea.nombre}: todavía sin lecciones publicadas`
            : `${linea.nombre}: ${linea.hechas} de ${linea.total} lecciones completadas`
        }
      />
    </div>
  );
}

/**
 * Pliega los temas de cada eje a un par `hechas/total` de lecciones.
 *
 * `avanceDeTema` (`lib/estadoNodo.ts:54`) es la misma función que usan /camino y
 * /tema/[id] para el mismo cálculo un nivel más abajo. Sumar sus resultados en
 * vez de reimplementar el filtro es lo que impide que esta pantalla y el camino
 * discrepen sobre el mismo hecho.
 *
 * `vacio` devuelve los denominadores con numerador 0: es lo que se renderiza en
 * el servidor y en el primer paint, para que las cuatro barras existan desde el
 * HTML —el alto no salta al hidratar— sin afirmar ningún avance.
 *
 * El denominador son las lecciones **con archivo en disco**, no las 48
 * declaradas del temario: `leccionesDelTema()` (`lib/camino.ts:49`) descarta las
 * que todavía no existen, así que `M` crece a medida que se escribe contenido.
 * Es el mismo denominador que ya muestran /camino y /tema/[id], y el correcto
 * para una fracción que dice cuánto llevas recorrido: no se puede haber
 * completado una lección que no está escrita.
 */
function avancePorLinea(ejes: EjeDelCamino[], vacio = false): AvanceDeLinea[] {
  const progreso = vacio ? null : leer();

  return ejes.map((eje) => {
    const avances = eje.temas.map((tema) => avanceDeTema(tema, progreso));
    return {
      ejeId: eje.id,
      nombre: eje.nombre,
      hechas: avances.reduce((suma, a) => suma + a.hechas, 0),
      total: avances.reduce((suma, a) => suma + a.total, 0),
    };
  });
}
