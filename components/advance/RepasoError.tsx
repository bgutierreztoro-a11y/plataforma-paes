import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import type { RepasoDeError } from "@/lib/catalogoErrores";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * /advance/errores/[unidadId]/[errorId] (F4b): el repaso de un error.
 *
 * Componente puro: recibe el título y el `repaso` ya resueltos y no consulta
 * nada, así la galería `/_design` lo monta con datos de muestra, igual que
 * `ListaErrores`.
 *
 * Tres secciones en el orden del catálogo: cómo se comete, lo correcto,
 * ejemplo. Los rótulos salen de `TEXTOS_ADVANCE.errores.repaso`, nunca como
 * string literal acá. El `ejemplo` mezcla prosa y números en una sola frase
 * ("Precio 20.000 con 30% de descuento…") y va completo en sans: partirlo en
 * números y prosa para llevar los números a `num` exigiría un parser sobre
 * texto libre, y no se pide.
 *
 * Sin `repaso` (todo catálogo que no sea porcentaje, hoy): sin las tres
 * secciones, con el aviso `errores.repaso.sinRepaso` en su lugar, para que la
 * pantalla no quede como título y botones con un hueco en medio.
 *
 * Sin p(L), sin fase, sin números internos: esta pantalla explica el error, no
 * reporta el estado del estudiante frente a él (eso ya lo dijo la tarjeta).
 */
export function RepasoError({
  unidadId,
  ejeId,
  titulo,
  repaso,
}: {
  unidadId: string;
  ejeId: string | null;
  titulo: string;
  repaso?: RepasoDeError;
}) {
  const { errores } = TEXTOS_ADVANCE;
  const hrefPracticar = ejeId ? `/advance/descarte/${unidadId}?eje=${ejeId}` : `/advance/descarte/${unidadId}`;

  return (
    <PantallaCentrada className="gap-8">
      <div className="w-full max-w-md space-y-8" data-repaso>
        <h1 className="text-titulo-l text-primary">{titulo}</h1>

        {repaso ? (
          <>
            <Seccion rotulo={errores.repaso.camino} texto={repaso.camino} />
            <Seccion rotulo={errores.repaso.correcto} texto={repaso.correcto} />
            <Seccion rotulo={errores.repaso.ejemplo} texto={repaso.ejemplo} />
          </>
        ) : (
          <p className="text-cuerpo-m text-primary">{errores.repaso.sinRepaso}</p>
        )}

        <div className="space-y-3">
          <EnlaceBoton href={hrefPracticar} variante={ejeId ? "linea" : "neutro"}>
            {errores.repaso.practicar}
          </EnlaceBoton>
          <BotonVolver destino="/advance/errores" etiqueta={errores.repaso.volver} tono="sobre-papel" />
        </div>
      </div>
    </PantallaCentrada>
  );
}

function Seccion({ rotulo, texto }: { rotulo: string; texto: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-etiqueta uppercase text-[var(--linea-nav)]">{rotulo}</h2>
      <p className="text-cuerpo-m text-primary">{texto}</p>
    </section>
  );
}
