"use client";

import { useState } from "react";

import { BloqueInteractivo } from "@/components/bloques/BloqueInteractivo";
import {
  FIXTURE_BLOQUE_PARABOLA,
  FIXTURE_BLOQUE_PARABOLA_SIN_MARCAS,
} from "@/e2e/fixtures/bloqueParabola";

/**
 * Las dos parábolas de prueba, cada una en su `<section>` con nombre: la página
 * monta dos bloques a la vez y sin ese nombre los tres sliders de uno y los del
 * otro serían indistinguibles para un locator. De paso comprueba que dos
 * `clipPath` en la misma página no se pisan.
 *
 * El cartel de "exploración completa" es andamiaje de prueba, no interfaz del
 * producto: en una lección real ese callback lo escucha `RunnerLeccion` para
 * habilitar "Siguiente paso", y acá no hay runner que lo reciba. Es la única
 * forma de comprobar el contrato del umbral sin escribir una lección.
 */
export function Demostracion() {
  const [exploracionCompleta, setExploracionCompleta] = useState(false);

  return (
    <div className="space-y-10">
      <section aria-label="Parábola con vértice y ceros" className="space-y-3">
        <h2 className="text-lg font-medium text-ink">Parábola con vértice y ceros</h2>
        <BloqueInteractivo
          bloque={FIXTURE_BLOQUE_PARABOLA}
          onExploracionCompleta={() => setExploracionCompleta(true)}
        />
        <p role="status" className="text-sm text-ink-suave">
          {exploracionCompleta ? "Exploración completa" : "Exploración pendiente"}
        </p>
      </section>

      <section aria-label="Parábola sin marcas" className="space-y-3">
        <h2 className="text-lg font-medium text-ink">Parábola sin marcas</h2>
        <BloqueInteractivo bloque={FIXTURE_BLOQUE_PARABOLA_SIN_MARCAS} />
      </section>
    </div>
  );
}
