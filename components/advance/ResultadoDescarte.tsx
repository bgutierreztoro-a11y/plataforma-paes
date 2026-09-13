"use client";

import Link from "next/link";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { Boton } from "@/components/ui/linea/Boton";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { FranjaDeItems } from "@/components/ui/linea/FranjaDeItems";
import { TarjetaError } from "@/components/ui/linea/TarjetaError";
import type { CopyDeError } from "@/lib/advance/copyDeError";
import { resumenDeSesion, type RegistroItem } from "@/lib/advance/descarte";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { rotuloDeError } from "@/lib/progresoSesion";

interface ResultadoDescarteProps {
  registros: RegistroItem[];
  /* Id local del catálogo → titulo + apoyo, resuelto en el servidor con
     `copyDelCatalogo(catalogoCompletoDelModulo(...))`. Solo se lee la entrada
     del error más frecuente. */
  catalogo: Record<string, CopyDeError>;
  /* La unidad de la sesión: arma el enlace de la tarjeta al repaso del error. */
  unidadId: string;
  /* La ruta de la sesión. Si está, aparece "Otra sesión", que la vuelve a pedir
     al servidor con una navegación completa: un `Link` a la misma ruta puede
     servir el payload cacheado y repetir los mismos cinco ítems. Sin ella (la
     galería) no hay botón. */
  rutaOtraSesion?: string;
}

/**
 * La pantalla final de una sesión de descarte (docs/fobos-advance.md §6.1).
 * Responde tres preguntas, en este orden: cómo te fue, qué error apareció más
 * (por nombre), qué hacer ahora. Sin gráficos, sin porcentajes, sin
 * celebración. `FranjaDeItems` es el eco visual de la sesión, igual que en el
 * cierre de una lección.
 *
 * "Nombre del error" es el rótulo de `rotuloDeError` (el slug humanizado) más el
 * `titulo` del catálogo canónico y, debajo, su `apoyo`, en `TarjetaError`: la
 * misma pieza que ve el estudiante cuando falla un ítem en la capa gratis.
 * Desde F4c es el copy para el estudiante y no la ficha de autor; un catálogo
 * sin `titulo` todavía cae a `descripcion` (`copyDeError`, resuelto en el
 * servidor). Un error que no está en el catálogo muestra su id, como antes.
 *
 * **Tocable desde F4c**: la tarjeta entera es un `<Link>` a
 * `/advance/errores/<unidadId>/<errorId>`, la pantalla de repaso de ese error,
 * con las mismas clases de foco y `min-h-11` que `TarjetaEstadoError`. Sin
 * hover de borde: la superficie oscura no tiene borde. Sin botón nuevo:
 * `queHacerDetalle` ya dice "vuelve a leer el error de arriba".
 *
 * Todo texto sobre el fondo de página va en `text-primary` (deuda-contraste-
 * etiquetas.md §1); la jerarquía la dan tamaño y peso.
 */
export function ResultadoDescarte({ registros, catalogo, unidadId, rutaOtraSesion }: ResultadoDescarteProps) {
  const { resultado } = TEXTOS_ADVANCE;
  const resumen = resumenDeSesion(registros);
  const error = resumen.errorMasFrecuente;
  const copy = error ? catalogo[error] : undefined;

  return (
    <PantallaCentrada className="gap-8">
      <div className="w-full max-w-md space-y-8" data-resultado-descarte>
        <h1 className="text-titulo-l text-primary">{resultado.titulo}</h1>

        <section className="space-y-3" data-como-te-fue>
          <h2 className="text-etiqueta uppercase text-primary">{resultado.comoTeFue}</h2>
          <FranjaDeItems resultados={resumen.resultados} />
          <p className="text-cuerpo-m text-primary">
            <span className="num">{resumen.items}</span> {resultado.items(resumen.items)},{" "}
            <span className="num">{resumen.descartesAcertados}</span>{" "}
            {resultado.descartesAcertados(resumen.descartesAcertados)}.
          </p>
        </section>

        <section className="space-y-3" data-que-error>
          <h2 className="text-etiqueta uppercase text-primary">{resultado.queError}</h2>
          {error ? (
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
          ) : (
            <p className="text-cuerpo-m text-primary">{resultado.sinDescartes}</p>
          )}
        </section>

        <section className="space-y-4" data-que-hacer>
          <h2 className="text-etiqueta uppercase text-primary">{resultado.queHacer}</h2>
          <p className="text-cuerpo-m text-primary">
            {error ? resultado.queHacerDetalle : resultado.queHacerSinError}
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
          <BotonVolver destino="/advance" etiqueta={resultado.volver} tono="sobre-papel" />
        </section>
      </div>
    </PantallaCentrada>
  );
}
