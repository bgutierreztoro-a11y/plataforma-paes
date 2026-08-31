import type { ReactNode } from "react";
import Link from "next/link";
import { Estacion } from "./Estacion";

export type EstadoDeParada =
  | "pasada"
  | "actual"
  | "proxima"
  | "cerrada"
  | "combinacion";

export interface ParadaDelRiel {
  id: string;
  estado: EstadoDeParada;
  titulo: string;
  /** Ya formateado. El riel no sabe qué se cuenta: "Pasada · 3 lecciones",
   *  "Lección 2 de 3 · 4 min", "En preparación". Mismo contrato que `contador`
   *  en `NodoCamino`. */
  subtitulo: string;
  /** Ausente = la parada no lleva a ninguna parte y se rinde como texto. */
  href?: string;
  /** Lo que cuelga debajo del subtítulo. Hoy solo lo trae la parada `actual`:
   *  la tarjeta de la lección en curso. */
  tarjeta?: ReactNode;
  onAbrir?: () => void;
}

/* Distancia del borde superior de una parada al centro de su disco: los 12px de
   `py-3` más la mitad de la línea de 18px del título. Es lo que mantiene el
   disco a la altura del texto y no del bloque entero —una parada con tarjeta
   mide unos 150px y su disco tiene que seguir junto al título— y también dónde
   arranca y dónde termina el riel. */
const CENTRO_DEL_DISCO = 21;

/* El riel corre por x=12: 9px de sangría más la mitad de sus 6px de ancho. La
   canaleta de 29px es lo que deja el texto libre del trazo. Los tres números
   son los del HTML de referencia (`.track`). */
const EJE_DEL_RIEL = 12;
const CANALETA = 29;

/**
 * El trazo vertical de una línea con sus paradas: la pantalla 03 del sistema de
 * señalética.
 *
 * Traducción directa de `.track` / `.stn` del HTML de referencia: riel de 6px en
 * `--linea`, un disco por parada, título y subtítulo a la derecha de la
 * canaleta. Los cinco estados del disco no se redibujan acá — son `<Estacion>`,
 * que ya los tiene con sus tamaños y bordes medidos.
 *
 * **El riel se dibuja por tramo y no de una sola pieza.** Un `::before` que
 * recorriera todo el contenedor tendría que cerrar en un `bottom` fijo, y ese
 * número solo sirve mientras la última parada mida lo mismo que las demás: con
 * la tarjeta de la lección en curso al final, el trazo seguiría más de cien
 * píxeles por debajo del último disco. Por tramo, el primero arranca en su
 * disco y el último termina en el suyo, midan lo que midan.
 *
 * **No conoce el dominio.** Recibe paradas ya resueltas —estado, copy y
 * destino—, igual que `CaminoVertical` recibe `SeccionCamino[]`. Quien las arma
 * es quien sabe qué es un tema y qué es una lección.
 *
 * El color sale de `--linea` heredado: quien monta el riel ya instaló la línea
 * más arriba (la placa, o la raíz de la pantalla). Ver ./colores.ts.
 */
export function RielEstaciones({
  paradas,
  className = "",
}: {
  paradas: ParadaDelRiel[];
  className?: string;
}) {
  return (
    <ol className={`relative ${className}`.trim()}>
      {paradas.map((parada, i) => {
        const primera = i === 0;
        const ultima = i === paradas.length - 1;
        const apagada = parada.estado === "cerrada";

        const contenido = (
          <>
            <p className={`text-titulo-s ${apagada ? "text-muted" : "text-primary"}`}>
              {parada.titulo}
            </p>
            <p
              className={`mt-[3px] text-cuerpo-xs ${apagada ? "text-muted" : "text-secondary"}`}
            >
              {parada.subtitulo}
            </p>
          </>
        );

        return (
          <li key={parada.id} className="relative py-3" style={{ paddingLeft: CANALETA }}>
            {/* El tramo de riel de esta parada. El primero baja desde su propio
                disco, el último termina en el suyo, y los del medio cruzan la
                fila entera para empalmar con el de arriba y el de abajo. Con una
                sola parada no hay tramo que dibujar. */}
            {!(primera && ultima) && (
              <span
                aria-hidden="true"
                className="absolute w-1.5 -translate-x-1/2 bg-[var(--linea)]"
                style={{
                  left: EJE_DEL_RIEL,
                  top: primera ? CENTRO_DEL_DISCO : 0,
                  ...(ultima ? { height: CENTRO_DEL_DISCO } : { bottom: 0 }),
                  /* Solo los dos extremos del riel van redondeados. Redondear
                     cada tramo pellizca el trazo en cada junta y el riel se lee
                     punteado —visible en el navegador a 390px, no deducido—: la
                     junta entre dos tramos es continua, no un final de línea. */
                  borderTopLeftRadius: primera ? 3 : 0,
                  borderTopRightRadius: primera ? 3 : 0,
                  borderBottomLeftRadius: ultima ? 3 : 0,
                  borderBottomRightRadius: ultima ? 3 : 0,
                }}
              />
            )}

            {/* El disco, centrado sobre el riel y a la altura de la primera
                línea del título. `Estacion` ya se marca `aria-hidden` cuando no
                lleva etiqueta: el nombre de la parada está en el texto de al
                lado y repetirlo sería ruido para el lector de pantalla. */}
            <span
              className="absolute top-3 flex h-[18px] -translate-x-1/2 items-center"
              style={{ left: EJE_DEL_RIEL }}
            >
              <Estacion estado={parada.estado} />
            </span>

            {/* Una parada sin destino es texto, no un enlace muerto: es el caso
                de la estación en preparación, que no tiene página propia. */}
            {parada.href ? (
              <Link
                href={parada.href}
                onClick={parada.onAbrir}
                className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-strong"
              >
                {contenido}
              </Link>
            ) : (
              contenido
            )}

            {parada.tarjeta}
          </li>
        );
      })}
    </ol>
  );
}
