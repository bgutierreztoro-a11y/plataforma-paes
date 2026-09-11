import Link from "next/link";
import type { EstadoAdvance } from "@/lib/advance/acceso";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

/* La geometría de una parada, copiada de components/ui/linea/RielEstaciones.tsx
   (CENTRO_DEL_DISCO :33, EJE_DEL_RIEL :38, CANALETA :39). Se duplica y no se
   exporta para que el riel de la capa gratis no cambie por Advance (regla de
   aislamiento, docs/fobos-advance.md §1). Si esos números cambian allá, cambian
   acá. */
const CENTRO_DEL_DISCO = 21;
const EJE_DEL_RIEL = 12;
const CANALETA = 29;

/**
 * El tramo de Advance al final del riel de una línea (docs/fobos-advance.md
 * §3.1): un destino más allá de la última estación, no un cartel.
 *
 * Componente puro: recibe el estado por props y no consulta
 * `lib/advance/acceso.ts`, así la galería lo rinde en sus dos estados sin
 * flags y quien lo monta decide con qué estado.
 *
 * Dos estados. **Sin acceso** se atenúa solo en lo no textual: el segmento de
 * riel pasa a hairline punteada y el glifo a anillo punteado. El texto no lleva
 * `opacity` en ningún estado: la línea 03 pasa AA por 0,04 y la 01 por 0,07 y
 * cualquier atenuación las tumba. El estado lo dice también el subtítulo en
 * palabras, no solo el glifo. **Activo** dibuja el segmento sólido, como el
 * riel, y el glifo con relleno y chevron.
 *
 * El subtítulo va en `--text-primary` y no en el `--text-secondary` de las
 * paradas: sobre el fondo de página el gris da 4,37 (medido en /_design) y no
 * llega a AA, que es la deuda registrada en docs/deuda-contraste-etiquetas.md
 * §1. La jerarquía la dan tamaño y peso, no el gris.
 *
 * El glifo va en `--linea-nav` y no en `--linea`: es un elemento gráfico que
 * comunica estado y tiene que pasar 3:1 sobre superficie clara, cosa que la 02
 * cruda (#FFB600) no hace. El segmento sí hereda `--linea`, como el riel, porque
 * es continuidad y no información: el estado ya está en el glifo y en el texto.
 *
 * `temporada-terminada` se rinde como sin acceso: en F1 no hay temporada. El
 * switch es exhaustivo para que F3 tenga que decidir qué dibuja ahí.
 *
 * Sin animación. Sin indicador de progreso: en F1 no hay nada que medir.
 */
export function TramoAdvance({
  estado,
  ejeId,
}: {
  estado: EstadoAdvance;
  ejeId: string;
}) {
  const activo = tieneAcceso(estado);
  const { tramo } = TEXTOS_ADVANCE;
  /* `origen=tramo` alimenta advance_puerta_vista (§8); la ruta lo valida. */
  const href = activo ? `/advance?eje=${ejeId}` : `/advance/puerta?eje=${ejeId}&origen=tramo`;

  return (
    <div className="relative" style={{ paddingLeft: CANALETA }}>
      {/* El segmento que empalma con el final del riel: baja desde arriba
          hasta el centro del glifo, como el primer tramo del riel pero al
          revés. */}
      <span
        aria-hidden="true"
        className={
          activo
            ? "absolute w-1.5 -translate-x-1/2 rounded-b-[3px] bg-[var(--linea)]"
            : "absolute w-0 -translate-x-1/2 border-l-2 border-dotted border-[var(--linea)]"
        }
        style={{ left: EJE_DEL_RIEL, top: 0, height: CENTRO_DEL_DISCO }}
      />

      <span
        aria-hidden="true"
        className="absolute top-3 flex h-[18px] -translate-x-1/2 items-center text-[var(--linea-nav)]"
        style={{ left: EJE_DEL_RIEL }}
      >
        <GlifoAdvance activo={activo} />
      </span>

      {/* El enlace lleva el `py-3` de la parada y no el contenedor: así el área
          táctil es la fila entera (≥44px) y no solo las dos líneas de texto.
          Mismo anillo de foco que una parada del riel. */}
      <Link
        href={href}
        className="block rounded-sm py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
      >
        <p className="text-titulo-s text-primary">{tramo.titulo}</p>
        <p className="mt-[3px] text-cuerpo-xs text-primary">
          {activo ? tramo.activo : tramo.sinAcceso}
        </p>
      </Link>
    </div>
  );
}

function tieneAcceso(estado: EstadoAdvance): boolean {
  switch (estado) {
    case "activo":
      return true;
    case "sin-acceso":
    case "temporada-terminada":
      return false;
    default: {
      const nunca: never = estado;
      throw new Error(`Estado de Advance sin manejar: ${nunca}`);
    }
  }
}

const TRAZO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * El glifo propio de Advance: un anillo con chevron, "seguir más allá".
 * Contrato de la familia de 16px de ui/linea/IconosNav.tsx: viewBox 16, trazo 2,
 * extremos redondos, `currentColor`. Sin acceso, el anillo va punteado y sin
 * chevron: hueco, no transparente.
 */
function GlifoAdvance({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 shrink-0">
      <circle
        cx="8"
        cy="8"
        r="6"
        {...TRAZO}
        fill={activo ? "var(--linea-tinte)" : "none"}
        strokeDasharray={activo ? undefined : "2 2.4"}
      />
      {activo && <path d="M6.5 5 9.5 8 6.5 11" {...TRAZO} />}
    </svg>
  );
}
