import type { ReactNode } from "react";

export interface CeldaKPI {
  /**
   * La cifra. Es `ReactNode` y no `number` a propósito: una celda sin fuente de
   * datos tiene que poder decir que no la tiene, y un 0 afirmaría un hecho
   * —"llevas cero"— que nadie midió. Ver `SIN_DATO`.
   */
  cifra: ReactNode;
  rotulo: string;
  /** Lo que escucha un lector de pantalla en lugar de la cifra, cuando la cifra
   *  sola no significa nada (el guion de `SIN_DATO`). */
  descripcion?: string;
}

/**
 * El guion de una celda sin fuente. No es un placeholder que alguien vaya a
 * rellenar con datos falsos por descuido: es el estado terminal de una celda
 * cuyo número no existe, y se lee como tal.
 */
export const SIN_DATO = "—";

interface TiraKPIProps {
  celdas: readonly CeldaKPI[];
  className?: string;
}

/**
 * La tira horizontal de cifras con divisores verticales: tres números que
 * resumen la pantalla, separados por hairlines, sobre superficie de tarjeta.
 *
 * Traduce `.kpi` del HTML de referencia
 * (`docs/referencia/B-linea-interfaz-completa.html:75-79`) a los tokens del
 * proyecto. El HTML la usa en tres pantallas —01 (Entrada), 04 (Estación) y 11
 * (Tú)—, y por eso vive acá y no dentro de la 11.
 *
 * Hoy solo la monta la 11. Ni /inicio ni /tema/[id] tienen tira: la 04 usa el
 * encabezado fijo de `navegacion/EncabezadoPantalla` y no la fila de cifras del
 * mock, así que no había nada inline que unificar. Cuando esas dos pantallas se
 * migren, toman este componente en vez de escribirlo de nuevo.
 *
 * La cifra va en `text-titulo-l` —23px/700/-0.03em, que es el `.kpi b` del mock
 * ya tokenizado— más `num` (`app/globals.css:493`, `font-variant-numeric:
 * tabular-nums`): son números y tienen que alinearse entre celdas. El rótulo va
 * en `text-etiqueta uppercase text-secondary`, el mismo par que ya usan
 * `Puntaje.tsx` y `ListaErroresVivos.tsx` — versalitas de interfaz, en sans, no
 * en la figura numérica.
 *
 * Sin `--linea`: la tira es tinta neutra en las tres pantallas del mock. La 11
 * cruza las cuatro líneas, así que no hay una activa que aplicar.
 */
export function TiraKPI({ celdas, className = "" }: TiraKPIProps) {
  return (
    <div
      className={`flex items-stretch rounded-sm border border-hairline bg-card ${className}`.trim()}
    >
      {celdas.map(({ cifra, rotulo, descripcion }) => (
        <div
          key={rotulo}
          className="min-w-0 flex-1 border-r border-hairline p-2.5 last:border-r-0"
        >
          <b className="num block text-titulo-l text-primary">
            {descripcion ? <span aria-hidden="true">{cifra}</span> : cifra}
            {descripcion && <span className="sr-only">{descripcion}</span>}
          </b>
          <span className="mt-1 block truncate text-etiqueta uppercase text-secondary">
            {rotulo}
          </span>
        </div>
      ))}
    </div>
  );
}
