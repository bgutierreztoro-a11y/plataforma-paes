import { Boton } from "@/components/ui/Boton";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";

interface AnuncioPrevioItemsProps {
  variante: "leccion" | "modulo";
  cantidad: number;
  /* Solo se usa (y en la práctica es obligatorio) cuando variante === "modulo". */
  nombreModulo?: string;
  onEmpezar: () => void;
}

const ANCHO_TRAZO = 240;
const ALTO_TRAZO = 56;
const MARGEN_TRAZO = 26;
const Y_TRAZO = 28;

/* El mismo lenguaje visual que IlustracionPatrones/IlustracionPendiente
   (recta + puntos, trazo del acento), pero acá cada punto es literalmente una
   de las preguntas que vienen — no es decoración, es la cuenta. En "modulo"
   el último punto se dibuja como el punto de llegada de IlustracionCierre
   (círculos concéntricos): es el mismo camino, y esta vez sí se termina. */
function TrazoPreguntas({
  cantidad,
  variante,
}: {
  cantidad: number;
  variante: "leccion" | "modulo";
}) {
  const utilizable = ANCHO_TRAZO - MARGEN_TRAZO * 2;
  return (
    <svg
      viewBox={`0 0 ${ANCHO_TRAZO} ${ALTO_TRAZO}`}
      className="h-auto w-full max-w-60"
      aria-hidden="true"
    >
      <line
        x1={MARGEN_TRAZO}
        y1={Y_TRAZO}
        x2={ANCHO_TRAZO - MARGEN_TRAZO}
        y2={Y_TRAZO}
        stroke="var(--color-border-fuerte)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {Array.from({ length: cantidad }, (_, i) => {
        const x =
          cantidad === 1 ? ANCHO_TRAZO / 2 : MARGEN_TRAZO + (i * utilizable) / (cantidad - 1);
        const esLlegada = variante === "modulo" && i === cantidad - 1;
        return (
          <g key={i} className="entra-nodo" style={{ animationDelay: `${i * 60}ms` }}>
            {esLlegada ? (
              <>
                <circle
                  cx={x}
                  cy={Y_TRAZO}
                  r="11"
                  fill="none"
                  stroke="var(--color-accent-suave)"
                  strokeWidth="2.5"
                />
                <circle
                  cx={x}
                  cy={Y_TRAZO}
                  r="6"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                />
                <circle cx={x} cy={Y_TRAZO} r="2.5" fill="var(--color-accent)" />
              </>
            ) : (
              <circle cx={x} cy={Y_TRAZO} r="4" fill="var(--color-accent)" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function AnuncioPrevioItems({
  variante,
  cantidad,
  nombreModulo,
  onEmpezar,
}: AnuncioPrevioItemsProps) {
  const singular = cantidad === 1;
  const sustantivo = singular ? "pregunta" : "preguntas";
  const titulo = variante === "leccion" ? "Repaso rápido" : "Cierre del módulo";
  const alcance = variante === "leccion" ? "de esta lección" : `de ${nombreModulo}`;

  return (
    <PantallaCentrada className="transicion-paso mx-auto w-full gap-7 text-center">
      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{titulo}</h1>
      <TrazoPreguntas cantidad={cantidad} variante={variante} />
      <div>
        <p
          className="entra-numero text-7xl font-semibold num text-accent-fuerte sm:text-8xl"
          style={{ animationDelay: "120ms" }}
        >
          {cantidad}
        </p>
        <p className="mt-2 text-base leading-relaxed text-ink-suave">
          {sustantivo} {alcance}
        </p>
      </div>
      <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-tenue">
        Sin pistas
      </span>
      <Boton
        onClick={onEmpezar}
        className="group motion-safe:transition-transform motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
      >
        <span className="inline-flex items-center gap-2">
          Empezar
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Boton>
    </PantallaCentrada>
  );
}
