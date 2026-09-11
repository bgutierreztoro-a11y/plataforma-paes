/**
 * Única fuente de verdad del acceso a Fobos Advance (docs/fobos-advance.md §2.2).
 *
 * Nadie más en el repo lee `NEXT_PUBLIC_ADVANCE_*`. Quien necesite saber si
 * hay Advance consume estas dos funciones desde un server component y hace
 * `switch` exhaustivo sobre `EstadoAdvance` con chequeo `never`, para que una
 * fase futura no pueda olvidar un estado.
 *
 * F1: el estado sale de una variable de entorno para construir y probar sin
 * cuentas. F3 reemplaza el cuerpo de `estadoAdvance` por Clerk + base de datos
 * sin cambiar la firma: por eso ya es `async` aunque hoy no espere nada.
 *
 * `temporada-terminada` existe en el tipo desde ahora e inalcanzable en F1: la
 * temporada la define la suscripción (§0, modelo comercial), que llega en F3.
 */
export type EstadoAdvance = "activo" | "sin-acceso" | "temporada-terminada";

export async function estadoAdvance(): Promise<EstadoAdvance> {
  return process.env.NEXT_PUBLIC_ADVANCE_DEMO === "1" ? "activo" : "sin-acceso";
}

/**
 * Si Advance existe en la interfaz. Con `false` el tramo no se monta en el riel
 * y toda ruta bajo /advance responde 404: producción sin flags queda idéntica a
 * antes de F1. Es independiente del estado: se puede ver el tramo sin tener
 * acceso, que es justamente el estado "sin-acceso".
 */
export function advanceVisible(): boolean {
  return process.env.NEXT_PUBLIC_ADVANCE_VISIBLE === "1";
}
