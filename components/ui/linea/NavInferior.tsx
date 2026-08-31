import Link from "next/link";
import { IconoRed, IconoEnsayo, IconoErrores, IconoTu } from "./IconosNav";

export type DestinoNav = "red" | "ensayo" | "errores" | "tu";

interface NavInferiorProps {
  activo: DestinoNav;
  /* Los destinos todavía no existen como rutas: esta fase construye la capa
     visual y no toca navegación. Un ítem sin enlace se dibuja igual pero no es
     interactivo, que es más honesto que un enlace a ninguna parte. */
  enlaces?: Partial<Record<DestinoNav, string>>;
  className?: string;
}

/**
 * Los destinos que ya son rutas, declarados una sola vez para que las tres
 * pantallas que montan la barra no repitan el mapa.
 *
 * **Sin `ensayo` a propósito.** No existe producto de ensayo todavía: sin
 * `href`, el tab se dibuja igual pero no es interactivo (ver abajo), que es más
 * honesto que un enlace a ninguna parte. Las candidatas cercanas no lo son:
 * /diagnostico es la medición de entrada y /cierre es el cierre de una
 * estación; un ensayo completo M1 no está construido.
 */
export const ENLACES_NAV: Partial<Record<DestinoNav, string>> = {
  red: "/camino",
  errores: "/errores",
  tu: "/tu",
};

const DESTINOS: { id: DestinoNav; etiqueta: string; Icono: typeof IconoRed }[] = [
  { id: "red", etiqueta: "Red", Icono: IconoRed },
  { id: "ensayo", etiqueta: "Ensayo", Icono: IconoEnsayo },
  { id: "errores", etiqueta: "Errores", Icono: IconoErrores },
  { id: "tu", etiqueta: "Tú", Icono: IconoTu },
];

/**
 * La barra de cuatro destinos.
 *
 * El ítem activo toma el color del eje en el que estás, así que la barra dice a
 * la vez dónde estás y en qué línea. Fuera de un eje cae a `text-primary` y el
 * activo se lee igual, en tinta.
 *
 * El color sale de `--linea-nav` y no de `--linea` porque acá el color de línea
 * es **texto sobre `bg-card`**: la 02 (#FFB600) daría 1,76:1 en un cuerpo de
 * 9px y `--linea-nav` la baja a tinta. Ver ./colores.ts. La 02 no queda sin
 * identificar por eso: la placa, las estaciones y la barra de progreso siguen
 * en amarillo en la misma pantalla.
 *
 * `min-h-11` por ítem es el objetivo táctil de 44px, que se sostiene aunque el
 * dibujo —icono de 16px y etiqueta de 9px— sea mucho más chico que la celda.
 */
export function NavInferior({ activo, enlaces, className = "" }: NavInferiorProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className={`flex w-full items-stretch border-t border-hairline bg-card ${className}`.trim()}
    >
      {DESTINOS.map(({ id, etiqueta, Icono }) => {
        const esActivo = id === activo;
        const href = enlaces?.[id];

        const contenido = (
          <>
            <Icono />
            <span className="text-nav uppercase">{etiqueta}</span>
          </>
        );

        const clases = `flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 ${
          esActivo ? "text-[var(--linea-nav)]" : "text-muted"
        }`;

        return href ? (
          <Link
            key={id}
            href={href}
            aria-current={esActivo ? "page" : undefined}
            className={`${clases} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-strong`}
          >
            {contenido}
          </Link>
        ) : (
          <span key={id} aria-current={esActivo ? "page" : undefined} className={clases}>
            {contenido}
          </span>
        );
      })}
    </nav>
  );
}
