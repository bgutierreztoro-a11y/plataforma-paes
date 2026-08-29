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

const DESTINOS: { id: DestinoNav; etiqueta: string; Icono: typeof IconoRed }[] = [
  { id: "red", etiqueta: "Red", Icono: IconoRed },
  { id: "ensayo", etiqueta: "Ensayo", Icono: IconoEnsayo },
  { id: "errores", etiqueta: "Errores", Icono: IconoErrores },
  { id: "tu", etiqueta: "Tú", Icono: IconoTu },
];

/**
 * La barra de cuatro destinos.
 *
 * El ítem activo toma el color del eje en el que estás (`--linea`), así que la
 * barra dice a la vez dónde estás y en qué línea. Fuera de un eje, el default de
 * `--linea` es `text-primary` y el activo se lee igual, en tinta.
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
          esActivo ? "text-[var(--linea)]" : "text-muted"
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
