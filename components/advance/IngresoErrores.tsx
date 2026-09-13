import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import { BotonVolver } from "@/components/ui/linea/BotonVolver";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/**
 * /advance/errores sin sesión de Clerk: dice por qué no hay nada que mostrar e
 * invita a ingresar por /ingresar, la ruta real de login. No es el estado
 * vacío de D9: sin sesión no se sabe si hay errores, y decir "todavía no hay"
 * sería mentira.
 *
 * Variante `neutro` y no `linea`: la pantalla es global, fuera de todo eje.
 *
 * `titulo` y `cuerpo` son opcionales (F5a): el triage la reutiliza con su
 * propio copy, porque también exige sesión (sin historial no hay veredicto).
 * Sin ellos, el copy de /advance/errores, sin cambio.
 */
export function IngresoErrores({ titulo, cuerpo }: { titulo?: string; cuerpo?: string } = {}) {
  const { errores, resultado } = TEXTOS_ADVANCE;
  return (
    <PantallaCentrada className="gap-5 text-center">
      <div className="w-full max-w-md space-y-3" data-errores-ingreso>
        <h1 className="text-titulo-l text-primary">{titulo ?? errores.ingresoTitulo}</h1>
        <p className="text-cuerpo-m text-primary">{cuerpo ?? errores.ingresoCuerpo}</p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <EnlaceBoton href="/ingresar" variante="neutro">
          {errores.ingresar}
        </EnlaceBoton>
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
