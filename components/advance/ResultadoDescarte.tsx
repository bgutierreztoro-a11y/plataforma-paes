"use client";

import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { Boton } from "@/components/ui/linea/Boton";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { FranjaDeItems } from "@/components/ui/linea/FranjaDeItems";
import { TarjetaError } from "@/components/ui/linea/TarjetaError";
import { resumenDeSesion, type RegistroItem } from "@/lib/advance/descarte";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { rotuloDeError } from "@/lib/progresoSesion";

interface ResultadoDescarteProps {
  registros: RegistroItem[];
  /* Id local del catálogo → descripción, resuelto en el servidor con
     `catalogoDelModulo`. Solo se lee la entrada del error más frecuente. */
  catalogo: Record<string, string>;
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
 * "Nombre del error" es el rótulo de `rotuloDeError` ("Error 07") más la
 * descripción del catálogo canónico, en `TarjetaError`: la misma pieza que ve
 * el estudiante cuando falla un ítem en la capa gratis.
 *
 * Todo texto sobre el fondo de página va en `text-primary` (deuda-contraste-
 * etiquetas.md §1); la jerarquía la dan tamaño y peso.
 */
export function ResultadoDescarte({ registros, catalogo, rutaOtraSesion }: ResultadoDescarteProps) {
  const { resultado } = TEXTOS_ADVANCE;
  const resumen = resumenDeSesion(registros);
  const error = resumen.errorMasFrecuente;
  const descripcion = error ? catalogo[error] : undefined;

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
            <TarjetaError clave={rotuloDeError(error, 1)} diagnostico={descripcion ?? error} />
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
