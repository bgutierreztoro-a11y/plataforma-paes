import type { ReactNode } from "react";

/**
 * El contenido de las franjas fijas de /camino y /tema/[id].
 *
 * Solo el contenido: el envoltorio `sticky` se queda en cada pantalla porque
 * las dos difieren por razones que están escritas en su propio código —
 * /camino fija el alto por `style` (ese número alimenta el cálculo del ancla de
 * las bandas de eje) y se pone en `z-30` para quedar sobre ellas; /tema/[id] no
 * tiene bandas, así que no necesita ninguna de las dos cosas. Forzarlas a
 * compartir envoltorio sería uniformidad contra el motivo, no consistencia.
 *
 * Lo que sí era copia literal —el trío rótulo / título / contador, con sus
 * quince líneas de clases idénticas en dos archivos— vive acá.
 */
export function TituloDePantalla({
  rotulo,
  titulo,
}: {
  rotulo: string;
  titulo: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-tenue">
        {rotulo}
      </p>
      {/* Sin `tracking-tight`: a 16–18px este título es una etiqueta de
          interfaz, no un titular, y apretarlo solo le resta legibilidad. El
          tracking negativo lo aplican los tokens desde text-xl para arriba. */}
      <h1 className="truncate text-base font-semibold text-ink sm:text-lg">
        {titulo}
      </h1>
    </div>
  );
}

/**
 * El avance de la pantalla, en su forma corta. La cifra hecha lleva el peso y
 * el color del texto principal y el total se apaga: así el número que importa
 * se lee sin tener que procesar la fracción entera. `descripcion` es la frase
 * completa que escucha un lector de pantalla, donde "12/16" no significa nada.
 */
export function ContadorDePantalla({
  hechas,
  total,
  descripcion,
}: {
  hechas: number;
  total: number;
  descripcion: ReactNode;
}) {
  return (
    <p className="shrink-0 text-sm text-ink-tenue">
      <span className="font-mono font-medium tabular-nums text-ink">
        {hechas}
      </span>
      <span aria-hidden="true">/</span>
      <span className="font-mono tabular-nums">{total}</span>
      <span className="sr-only"> {descripcion}</span>
    </p>
  );
}
