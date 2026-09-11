import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * La pantalla de qué es Fobos Advance: el estado "sin acceso" hecho página
 * (docs/fobos-advance.md §1.4 y §7).
 *
 * Componente puro: recibe el eje desde el que se llegó (ya validado por la
 * ruta) y no consulta `lib/advance/acceso.ts`. Así la galería puede rendirla
 * sin flags y F3 puede montarla con el estado que sea.
 *
 * Un solo control, el retorno. No hay botón de pago porque no hay pago en F1,
 * y no hay ningún texto de precio: ver la cabecera de lib/advance/textos.ts.
 */
export function PuertaAdvance({ ejeId }: { ejeId?: string }) {
  const { puerta } = TEXTOS_ADVANCE;
  return (
    <PantallaCentrada className="gap-5 text-center">
      <div className="w-full max-w-md space-y-3">
        <h1 className="text-titulo-l text-primary">{puerta.titulo}</h1>
        <p className="text-titulo-m text-primary">{puerta.tesis}</p>
        <p className="text-cuerpo-m text-primary">{puerta.queEs}</p>
        <p className="text-cuerpo-m text-primary">{puerta.queNoEs}</p>
      </div>
      <p className="w-full max-w-md text-cuerpo-s text-secondary">
        {puerta.disclaimer}
      </p>
      <div className="w-full max-w-md">
        {ejeId ? (
          <BotonVolver
            destino={`/linea/${ejeId}`}
            etiqueta={puerta.volverAlEje}
            tono="sobre-papel"
            className="justify-center"
          />
        ) : (
          <BotonVolver
            destino="/camino"
            etiqueta={puerta.volverALaRed}
            tono="sobre-papel"
            className="justify-center"
          />
        )}
      </div>
    </PantallaCentrada>
  );
}
