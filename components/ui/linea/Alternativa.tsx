import type { ReactNode } from "react";

type Estado = "neutra" | "correcta" | "incorrecta";

interface AlternativaProps {
  /* A, B, C, D. */
  letra: string;
  children: ReactNode;
  estado?: Estado;
  className?: string;
}

/**
 * Una alternativa de opción múltiple: chip circular de 20px con la letra y el
 * texto en `cuerpo-m`.
 *
 * **No hay verde de "correcto" ni rojo de "error".** La alternativa correcta se
 * tiñe con el color del eje y la incorrecta va en superficie hundida con borde
 * `border-strong`. El veredicto lo da el feedback escrito, no un semáforo: un
 * color de "mal" contesta "¿la tuve bien?" desde el costado, antes de que el
 * estudiante lea lo que enseña.
 *
 * El borde sube de 1px a 1.5px en los dos estados revelados, que es la regla del
 * sistema para lo activo o seleccionado. Va como `border-[1.5px]` y no como un
 * `ring`: acá la fila no se re-selecciona después de revelada, así que el
 * píxel de reflow que el anillo evitaba no llega a ocurrir.
 *
 * `--linea-tinte` es el pálido de la línea. Fuera de un eje cae a la superficie
 * de tarjeta, y ahí la correcta se distingue por el borde y el chip, que toman
 * el default de `--linea` (tinta).
 *
 * El chip de la correcta se rellena con `--linea-fondo` y no con `--linea`: es
 * fondo de un texto —la letra— y en la línea 03 el color de línea daba 4,48:1,
 * bajo AA. El borde del chip y el de la fila sí van en `--linea`, que es donde
 * el color es forma. Que difieran apenas no se nota: son dos verdes contiguos
 * en un anillo de 1,5px. Ver ./colores.ts.
 */
const CLASES_ESTADO: Record<Estado, string> = {
  neutra: "border-hairline bg-card",
  correcta: "border-[1.5px] border-[var(--linea)] bg-[var(--linea-tinte)]",
  incorrecta: "border-[1.5px] border-strong bg-sunken",
};

const CLASES_CHIP: Record<Estado, string> = {
  neutra: "border border-hairline text-secondary",
  correcta:
    "border-[1.5px] border-[var(--linea)] bg-[var(--linea-fondo)] text-[var(--linea-contraste)]",
  incorrecta: "border-[1.5px] border-strong bg-strong text-inverse",
};

export function Alternativa({
  letra,
  children,
  estado = "neutra",
  className = "",
}: AlternativaProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-sm border px-3 py-3 ${CLASES_ESTADO[estado]} ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-cuerpo-xs ${CLASES_CHIP[estado]}`}
      >
        {letra}
      </span>
      <span className="text-cuerpo-m text-primary">{children}</span>
    </div>
  );
}
