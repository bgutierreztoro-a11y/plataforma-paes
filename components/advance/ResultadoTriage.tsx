"use client";

import Link from "next/link";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { Boton } from "@/components/ui/linea/Boton";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { TarjetaError } from "@/components/ui/linea/TarjetaError";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import type { CopyDeError } from "@/lib/advance/copyDeError";
import type { ItemAdvance } from "@/lib/advance/descarte";
import { resumenTriage, type FasesPorError, type RegistroTriage } from "@/lib/advance/triage";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { rotuloDeError } from "@/lib/progresoSesion";

interface ResultadoTriageProps {
  registros: RegistroTriage[];
  /* Los ítems de la sesión, para el enunciado y los distractores de cada fila. */
  items: ItemAdvance[];
  /* Fase de cada error del catálogo al abrir la sesión (sin p(L), D10). */
  fases: FasesPorError;
  /* Id local del catálogo → titulo + apoyo, resuelto en el servidor. */
  catalogo: Record<string, CopyDeError>;
  /* La unidad de la sesión: arma el enlace de la tarjeta al repaso del error. */
  unidadId: string;
  /* La ruta de la sesión. Si está, aparece "Otra sesión" con navegación
     completa, como en ResultadoDescarte. Sin ella (la galería) no hay botón. */
  rutaOtraSesion?: string;
}

/**
 * La pantalla final de una sesión de triage (docs/fobos-advance.md §6.5,
 * D18): cuántas decisiones, cuántas con veredicto, y el listado ítem por
 * ítem con su decisión y su veredicto en palabras: un rótulo en negrita y
 * una explicación debajo (F5a2). Sin porcentaje ni proyección (Ley 19.496).
 * Al pie, siempre, la nota que dice de dónde salen "los errores" y que el
 * triage no juzga: el estudiante de F5a no entendía ninguna de las dos cosas.
 *
 * El veredicto se calcula acá, en runtime, con `resumenTriage` sobre las
 * fases que la página leyó al abrir (D17); no viene del servidor ni se guarda.
 *
 * Cada fila lleva el enunciado: sin él, "Ítem 7, la dejaste, punto regalado"
 * no le dice nada al estudiante. En `lectura-a-revisar` va además la
 * `TarjetaError` del primer error abierto del ítem, enlazada a su repaso con
 * las mismas clases que en `ResultadoDescarte`; en los otros veredictos no hay
 * error que mostrar. Un error sin copy en el catálogo muestra su id.
 *
 * Todo texto sobre el fondo de página va en `text-primary` (deuda-contraste-
 * etiquetas.md §1); la jerarquía la dan tamaño y peso.
 */
export function ResultadoTriage({ registros, items, fases, catalogo, unidadId, rutaOtraSesion }: ResultadoTriageProps) {
  const { triage } = TEXTOS_ADVANCE;
  const { resultado } = triage;
  const resumen = resumenTriage(registros, items, fases);
  const porId = new Map(items.map((item) => [item.id, item]));
  const hayARevisar = resumen.filas.some((f) => f.veredicto === "lectura-a-revisar");

  return (
    <PantallaCentrada className="gap-8">
      <div className="w-full max-w-md space-y-8" data-resultado-triage>
        <h1 className="text-titulo-l text-primary">{resultado.titulo}</h1>

        <section className="space-y-3" data-conteo>
          <p className="text-cuerpo-m text-primary">
            <span className="num">{resumen.total}</span> {resultado.decisiones(resumen.total)},{" "}
            <span className="num">{resumen.conVeredicto}</span> {resultado.conVeredicto}.
          </p>
          {resumen.conVeredicto === 0 && (
            <p className="text-cuerpo-m text-primary" data-sin-veredictos>
              {resultado.sinVeredictos}
            </p>
          )}
        </section>

        <section className="space-y-3" data-como-leiste>
          <h2 className="text-etiqueta uppercase text-primary">{resultado.comoLeiste}</h2>
          <ol className="space-y-2.5">
            {resumen.filas.map((fila, i) => {
              const item = porId.get(fila.itemId);
              const error = fila.erroresAbiertos[0];
              const copy = error ? catalogo[error] : undefined;
              return (
                <li
                  key={fila.itemId}
                  className={`${TARJETA_LINEA} space-y-2 p-4`}
                  data-item-id={fila.itemId}
                  data-decision={fila.decision}
                  data-veredicto={fila.veredicto}
                >
                  <p className="text-etiqueta uppercase text-primary">
                    <span className="num">{triage.sustantivo} {i + 1}</span> · {triage.decision[fila.decision]}
                  </p>
                  {item && (
                    <div className="text-cuerpo-s text-primary">
                      <TextoEnriquecido contenido={item.enunciado} />
                    </div>
                  )}
                  <p className="text-cuerpo-m font-semibold text-primary" data-veredicto-texto>
                    {triage.veredicto[fila.veredicto]}
                  </p>
                  <p className="text-cuerpo-s text-primary" data-explicacion>
                    {triage.explicacion[fila.veredicto]}
                  </p>
                  {error && (
                    <Link
                      href={`/advance/errores/${unidadId}/${error}`}
                      data-error-id={error}
                      className="block min-h-11 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
                    >
                      <TarjetaError
                        clave={rotuloDeError(error, 1)}
                        diagnostico={copy?.titulo ?? error}
                        detalle={copy?.apoyo}
                      />
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="space-y-4" data-que-hacer>
          <h2 className="text-etiqueta uppercase text-primary">{resultado.queHacer}</h2>
          <p className="text-cuerpo-m text-primary">
            {hayARevisar ? resultado.queHacerDetalle : resultado.queHacerSinRevisar}
          </p>
          <p className="text-cuerpo-s text-primary" data-nota>
            {resultado.nota}
          </p>
          {rutaOtraSesion && (
            <Boton
              variante="linea"
              data-accion="otra-sesion"
              onClick={() => window.location.assign(rutaOtraSesion)}
            >
              {resultado.otraSesion}
            </Boton>
          )}
          <BotonVolver destino="/advance" etiqueta={TEXTOS_ADVANCE.resultado.volver} tono="sobre-papel" />
        </section>
      </div>
    </PantallaCentrada>
  );
}
