import { TarjetaEstadoError } from "@/components/advance/TarjetaEstadoError";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { estiloDeLinea, lineaDeEje } from "@/components/ui/linea/colores";
import type { GrupoDeUnidad } from "@/lib/advance/pantallaErrores";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * El cuerpo de /advance/errores: los errores del estudiante agrupados por
 * unidad, cada grupo ya ordenado por `tarjetasDeUnidad` (D8, D11, D12).
 *
 * Componente puro: recibe los grupos calculados en el servidor y no consulta
 * nada, así la galería /_design lo monta con datos de muestra para ver los
 * estados que hoy no existen en Neon (vacío, recaída, dos unidades).
 *
 * El título de la unidad aparece solo cuando hay más de una con tarjetas
 * (D13): con una sola, repetir "Porcentaje" encima de la lista no dice nada.
 * Cada grupo instala el color de su eje; hoy lo toma solo el rótulo de fase de
 * las tarjetas. El retorno queda fuera de los grupos y por eso va en tinta.
 *
 * Sin tarjetas, el estado vacío de D9: título, cuerpo y nada más.
 */
export function ListaErrores({ grupos }: { grupos: readonly GrupoDeUnidad[] }) {
  const { errores, resultado } = TEXTOS_ADVANCE;
  const conTarjetas = grupos.filter((g) => g.tarjetas.length > 0);

  if (conTarjetas.length === 0) {
    return (
      <PantallaCentrada className="gap-5 text-center">
        <div className="w-full max-w-md space-y-3" data-errores-vacio>
          <h1 className="text-titulo-l text-primary">{errores.vacioTitulo}</h1>
          <p className="text-cuerpo-m text-primary">{errores.vacioCuerpo}</p>
        </div>
        <div className="w-full max-w-md">
          <BotonVolver
            destino="/advance"
            etiqueta={resultado.volver}
            tono="sobre-papel"
            className="justify-center"
          />
        </div>
      </PantallaCentrada>
    );
  }

  const variasUnidades = conTarjetas.length > 1;
  return (
    <PantallaCentrada className="gap-8">
      <div className="w-full max-w-md space-y-8" data-errores>
        <h1 className="text-titulo-l text-primary">{errores.titulo}</h1>
        {conTarjetas.map((grupo) => {
          const linea = grupo.ejeId ? lineaDeEje(grupo.ejeId) : undefined;
          return (
            <section
              key={grupo.unidadId}
              style={linea ? estiloDeLinea(linea) : undefined}
              className="space-y-3"
              data-unidad={grupo.unidadId}
            >
              {variasUnidades && <h2 className="text-titulo-m text-primary">{grupo.titulo}</h2>}
              <ul className="space-y-2.5">
                {grupo.tarjetas.map((tarjeta) => (
                  <TarjetaEstadoError key={tarjeta.errorId} tarjeta={tarjeta} />
                ))}
              </ul>
            </section>
          );
        })}
        <BotonVolver destino="/advance" etiqueta={resultado.volver} tono="sobre-papel" />
      </div>
    </PantallaCentrada>
  );
}
