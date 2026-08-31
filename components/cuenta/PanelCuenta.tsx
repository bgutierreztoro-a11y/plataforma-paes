"use client";

import { Show, useClerk } from "@clerk/nextjs";
import { useMontado } from "@/lib/useMontado";
import { Boton, EnlaceBoton } from "@/components/ui/Boton";

/**
 * El acceso a la cuenta de Clerk, en su propia pantalla.
 *
 * Antes vivía como una tercera pestaña dentro de `navegacion/Navegacion.tsx`:
 * `openUserProfile()` con sesión y un enlace a /ingresar sin ella. Esa barra se
 * borró al adoptar `ui/linea/NavInferior`, cuyos cuatro destinos son Red,
 * Ensayo, Errores y Tú — ninguno es la cuenta, y en el HTML de referencia
 * ninguna de las once pantallas dibuja acceso a cuenta. Se rescata acá para no
 * perder la función junto con la barra.
 *
 * **"Tú" no es esto.** La pantalla 11 del HTML es avance pedagógico (racha,
 * estaciones, ítems); la cuenta es identidad. Se mantienen separadas a
 * propósito.
 *
 * Es una isla de cliente y no un server component con `<Show>` por el riesgo de
 * prerender que documenta `docs/plan-fase-3-navegacion.md:171-177`: la versión
 * servidor de `Show` forzaría render dinámico de la ruta.
 *
 * `min-h-11` en el envoltorio reserva el alto del botón antes de montar: `Show`
 * no conoce el estado de sesión durante el SSR y sin esa reserva la pantalla
 * saltaría al hidratar. Mismo criterio que usaba `Navegacion.tsx` y que usan
 * `PuntoDePartida` y los caminos de `components/camino/`.
 */
export function PanelCuenta() {
  const montado = useMontado();
  const { openUserProfile } = useClerk();

  return (
    <div className="flex min-h-11 w-full flex-col items-center gap-3">
      {montado && (
        <>
          <Show when="signed-in">
            {/* `type="button"` explícito: Boton reenvía props a un <button>,
                que sin type sería "submit". */}
            <Boton
              type="button"
              variante="primario"
              anchoCompleto
              onClick={() => openUserProfile()}
            >
              Gestionar cuenta
            </Boton>
          </Show>
          <Show when="signed-out">
            <EnlaceBoton href="/ingresar" variante="primario" anchoCompleto>
              Entrar a tu cuenta
            </EnlaceBoton>
          </Show>
        </>
      )}
    </div>
  );
}
