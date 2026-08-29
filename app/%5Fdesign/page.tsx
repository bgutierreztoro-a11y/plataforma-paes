import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Alternativa } from "@/components/ui/linea/Alternativa";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import { Boton } from "@/components/ui/linea/Boton";
import { Estacion } from "@/components/ui/linea/Estacion";
import { NavInferior } from "@/components/ui/linea/NavInferior";
import { PlacaLinea } from "@/components/ui/linea/PlacaLinea";
import { TarjetaError } from "@/components/ui/linea/TarjetaError";
import {
  LINEAS,
  NOMBRE_DE_LINEA,
  estiloDeLinea,
  type LineaId,
} from "@/components/ui/linea/colores";

export const metadata: Metadata = {
  title: "Dirección Línea — capa visual base",
  robots: { index: false, follow: false },
};

/**
 * Galería de revisión visual de la dirección "Línea". No es producto: ninguna
 * pantalla enlaza acá y la ruta va `noindex`. Mismo criterio que
 * `/vista-previa/*`, que es el patrón del repo para poder mirar una pieza antes
 * de que exista contenido que la monte.
 *
 * La carpeta se llama `%5Fdesign` y no `_design` porque en App Router una
 * carpeta que empieza con `_` es privada y no se rutea; `%5F` es la forma
 * codificada del guion bajo, y la URL resultante es `/_design`.
 *
 * Aviso al mirar: la `Navegacion` y el `PieLegal` del sistema anterior se montan
 * igual desde el root layout, así que arriba y abajo de esta página se ve cromo
 * de Antigravity. Es esperable en esta fase, que no toca ninguna pantalla.
 */

const PASOS_DE_ESCALA: { clase: string; nombre: string; specs: string }[] = [
  { clase: "text-display-l", nombre: "display-l", specs: "44/44 · 700 · −3,5%" },
  { clase: "text-display-m", nombre: "display-m", specs: "26/26 · 700 · −3,2%" },
  { clase: "text-titulo-l", nombre: "titulo-l", specs: "23/25 · 700 · −3,0%" },
  { clase: "text-titulo-m", nombre: "titulo-m", specs: "16/19 · 600 · −1,8%" },
  { clase: "text-titulo-s", nombre: "titulo-s", specs: "15/18 · 600 · −1,5%" },
  { clase: "text-cuerpo-m", nombre: "cuerpo-m", specs: "14/20 · 400 · 0" },
  { clase: "text-cuerpo-s", nombre: "cuerpo-s", specs: "12,5/18 · 400 · 0" },
  { clase: "text-cuerpo-xs", nombre: "cuerpo-xs", specs: "11/15 · 400 · 0" },
  { clase: "text-etiqueta uppercase", nombre: "etiqueta", specs: "10/12 · 600 · +12% · mayúsculas" },
  { clase: "text-nav uppercase", nombre: "nav", specs: "9/11 · 600 · +8% · mayúsculas" },
];

const MUESTRAS_DE_COLOR: { clase: string; nombre: string; hex: string }[] = [
  { clase: "bg-paper", nombre: "surface-paper", hex: "#F0F0EE" },
  { clase: "bg-screen", nombre: "surface-screen", hex: "#F7F7F5" },
  { clase: "bg-card", nombre: "surface-card", hex: "#FFFFFF" },
  { clase: "bg-sunken", nombre: "surface-sunken", hex: "#EDEDEA" },
  { clase: "bg-primary", nombre: "text-primary", hex: "#16181D" },
  { clase: "bg-secondary", nombre: "text-secondary", hex: "#71747A" },
  { clase: "bg-muted", nombre: "text-muted", hex: "#A9ABAF" },
  { clase: "bg-inverse", nombre: "text-inverse", hex: "#F7F7F5" },
  { clase: "bg-hairline", nombre: "border-hairline", hex: "#D8D9D4" },
  { clase: "bg-strong", nombre: "border-strong", hex: "#16181D" },
  { clase: "bg-line-01", nombre: "line-01", hex: "#E4002B" },
  { clase: "bg-line-02", nombre: "line-02", hex: "#FFB600" },
  { clase: "bg-line-03", nombre: "line-03", hex: "#00843D" },
  { clase: "bg-line-04", nombre: "line-04", hex: "#0057B8" },
  { clase: "bg-line-03-tint", nombre: "line-03-tint", hex: "#EAF5EE" },
  { clase: "bg-line-03-clara", nombre: "line-03-clara", hex: "#7BD6A2" },
];

const ESTADOS_DE_ESTACION = [
  "pasada",
  "actual",
  "proxima",
  "cerrada",
  "combinacion",
] as const;

function Seccion({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-hairline pt-6">
      <h2 className="text-etiqueta uppercase text-secondary">{titulo}</h2>
      {nota && <p className="mt-2 max-w-prose text-cuerpo-s text-secondary">{nota}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Rotulo({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-cuerpo-xs text-muted">{children}</p>;
}

/** Una columna por línea, ya con `--linea` instalado en el contenedor. */
function PorLinea({ children }: { children: (linea: LineaId) => ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {LINEAS.map((linea) => (
        <div key={linea} style={estiloDeLinea(linea)}>
          <Rotulo>
            Línea {linea} · {NOMBRE_DE_LINEA[linea]}
          </Rotulo>
          {children(linea)}
        </div>
      ))}
    </div>
  );
}

export default function PaginaDiseno() {
  return (
    <main className="min-h-screen bg-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header>
          <p className="text-etiqueta uppercase text-secondary">Revisión interna</p>
          <h1 className="mt-2 text-display-l text-primary">Dirección Línea</h1>
          <p className="mt-3 max-w-prose text-cuerpo-m text-secondary">
            Capa visual base: Archivo, los tokens del sistema y los componentes
            nuevos con todos sus estados. Ninguna pantalla del producto usa esto
            todavía.
          </p>
        </header>

        <Seccion
          titulo="Tipografía"
          nota="Archivo en 400, 500, 600 y 700. Es la única familia del producto."
        >
          <div className="flex flex-col gap-5">
            {PASOS_DE_ESCALA.map(({ clase, nombre, specs }) => (
              <div key={nombre}>
                <p className="text-cuerpo-xs text-muted">
                  {nombre} · {specs}
                </p>
                <p className={`${clase} mt-1 text-primary`}>
                  La pendiente dice cuánto cambia
                </p>
              </div>
            ))}
            <div>
              <p className="text-cuerpo-xs text-muted">cursiva real (no sintética)</p>
              <p className="mt-1 text-cuerpo-m text-primary">
                Despeja la <em>incógnita</em> hasta dejarla <em>sola</em>.
              </p>
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Color">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MUESTRAS_DE_COLOR.map(({ clase, nombre, hex }) => (
              <div key={nombre}>
                <div className={`h-14 rounded-sm border border-hairline ${clase}`} />
                <p className="mt-1.5 text-cuerpo-xs text-primary">{nombre}</p>
                <p className="text-cuerpo-xs text-muted">{hex}</p>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion
          titulo="Placa de línea"
          nota="Instala el color del eje: todo lo que se anide dentro de la placa lo hereda sin recibir props."
        >
          <div className="flex flex-col gap-3">
            {LINEAS.map((linea) => (
              <PlacaLinea
                key={linea}
                linea={linea}
                titulo={NOMBRE_DE_LINEA[linea]}
                subtitulo={`Línea ${linea} · 4 estaciones`}
              />
            ))}
          </div>
        </Seccion>

        <Seccion
          titulo="Estaciones"
          nota="Círculo de 15px con borde de 3px; «actual» crece a 21px con borde de 5px; «combinación» es un cuadrado a 45° con borde border-strong. Un cuadrado de 15px rotado mide 21px de diagonal, así que los cinco estados comparten dos anchos."
        >
          <div className="flex flex-col gap-6">
            <PorLinea>
              {() => (
                <div className="flex items-center gap-4 rounded-sm border border-hairline bg-card px-4 py-4">
                  {ESTADOS_DE_ESTACION.map((estado) => (
                    <Estacion key={estado} estado={estado} />
                  ))}
                </div>
              )}
            </PorLinea>

            <div style={estiloDeLinea("03")}>
              <Rotulo>Estados, uno a uno (línea 03)</Rotulo>
              <div className="flex flex-wrap gap-6 rounded-sm border border-hairline bg-card px-4 py-4">
                {ESTADOS_DE_ESTACION.map((estado) => (
                  <div key={estado} className="flex flex-col items-center gap-2">
                    <span className="flex h-6 items-center">
                      <Estacion estado={estado} />
                    </span>
                    <span className="text-cuerpo-xs text-secondary">{estado}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Botones"
          nota="Ancho completo, 14px de padding vertical, radio de 2px, titulo-s centrado. La variante «línea» toma el color del eje; sobre la línea 02 el texto va en tinta porque el claro da 1,6:1 de contraste."
        >
          <div className="flex flex-col gap-6">
            <PorLinea>
              {() => (
                <Boton variante="linea">
                  Continuar
                </Boton>
              )}
            </PorLinea>

            <div className="grid max-w-md gap-3">
              <Rotulo>Fuera de un eje</Rotulo>
              <Boton variante="neutro">Neutro</Boton>
              <Boton variante="secundario">Secundario</Boton>
              <Boton variante="deshabilitado">Deshabilitado</Boton>
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Alternativas"
          nota="No hay verde de «correcto» ni rojo de «error»: la correcta se tiñe con el color del eje y la incorrecta va en superficie hundida con borde border-strong. El veredicto lo da el feedback escrito."
        >
          <PorLinea>
            {() => (
              <div className="flex flex-col gap-2">
                <Alternativa letra="A" estado="neutra">
                  El doble de la diferencia
                </Alternativa>
                <Alternativa letra="B" estado="correcta">
                  La mitad de la suma
                </Alternativa>
                <Alternativa letra="C" estado="incorrecta">
                  La suma de las mitades
                </Alternativa>
              </div>
            )}
          </PorLinea>
        </Seccion>

        <Seccion
          titulo="Tarjeta de error"
          nota="La única superficie oscura del sistema. Hoy solo la línea 03 tiene su color aclarado definido; las otras tres caen a texto inverso, y se ve acá."
        >
          <PorLinea>
            {() => (
              <TarjetaError
                clave="E-042 · SIGNO"
                diagnostico="Restaste el paréntesis sin repartir el signo"
                detalle="Al sacar un paréntesis precedido de un menos, cambian de signo todos los términos de adentro, no solo el primero."
              />
            )}
          </PorLinea>
        </Seccion>

        <Seccion titulo="Barra de progreso" nota="6px de alto, pista hundida, extremos redondos.">
          <div className="flex flex-col gap-6">
            <PorLinea>
              {() => (
                <div className="flex flex-col gap-3">
                  <BarraProgreso valor={1} total={4} etiqueta="1 de 4" />
                  <BarraProgreso valor={3} total={4} etiqueta="3 de 4" />
                  <BarraProgreso valor={4} total={4} etiqueta="4 de 4" />
                </div>
              )}
            </PorLinea>
            <div>
              <Rotulo>Fuera de un eje (cae a text-primary)</Rotulo>
              <BarraProgreso valor={2} total={5} etiqueta="2 de 5" />
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Navegación inferior"
          nota="El ítem activo toma el color del eje, así que la barra dice a la vez dónde estás y en qué línea. Los destinos todavía no existen como rutas."
        >
          <div className="flex flex-col gap-4">
            {LINEAS.map((linea) => (
              <div key={linea} style={estiloDeLinea(linea)}>
                <Rotulo>
                  Línea {linea} · activo «Red»
                </Rotulo>
                <NavInferior activo="red" />
              </div>
            ))}
            <div>
              <Rotulo>Fuera de un eje, recorriendo los cuatro destinos</Rotulo>
              <div className="flex flex-col gap-2">
                <NavInferior activo="ensayo" />
                <NavInferior activo="errores" />
                <NavInferior activo="tu" />
              </div>
            </div>
          </div>
        </Seccion>
      </div>
    </main>
  );
}
