import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Alternativa } from "@/components/ui/linea/Alternativa";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import { Boton } from "@/components/ui/linea/Boton";
import { Estacion } from "@/components/ui/linea/Estacion";
import { FranjaDeItems } from "@/components/ui/linea/FranjaDeItems";
import { NavInferior } from "@/components/ui/linea/NavInferior";
import { PlacaLinea } from "@/components/ui/linea/PlacaLinea";
import { RielEstaciones, type ParadaDelRiel } from "@/components/ui/linea/RielEstaciones";
import { Puntaje } from "@/components/ui/linea/Puntaje";
import { TarjetaError } from "@/components/ui/linea/TarjetaError";
import { SIN_DATO, TiraKPI } from "@/components/ui/linea/TiraKPI";
import { TarjetaLoQueFallo } from "@/components/ui/linea/TarjetaLoQueFallo";
import { ListaErroresVivos } from "@/components/errores/ListaErroresVivos";
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
 * Aviso al mirar: el `PieLegal` se monta igual desde el root layout, así que al
 * pie de esta página se ve cromo que no es parte de la galería. La `Navegacion`
 * del sistema anterior ya no aparece: se borró al adoptar `NavInferior` como
 * barra de la app, y esta página la sigue mostrando como pieza de catálogo, en
 * sus cuatro estados.
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
  { clase: "bg-line-01-tint", nombre: "line-01-tint", hex: "#FBE6EA" },
  { clase: "bg-line-02-tint", nombre: "line-02-tint", hex: "#FFF6E0" },
  { clase: "bg-line-03-tint", nombre: "line-03-tint", hex: "#EAF5EE" },
  { clase: "bg-line-04-tint", nombre: "line-04-tint", hex: "#E6EDF8" },
  { clase: "bg-line-01-clara", nombre: "line-01-clara", hex: "#FF8A9E" },
  { clase: "bg-line-02-clara", nombre: "line-02-clara", hex: "#FFD466" },
  { clase: "bg-line-03-clara", nombre: "line-03-clara", hex: "#7BD6A2" },
  { clase: "bg-line-04-clara", nombre: "line-04-clara", hex: "#7FA8E8" },
  { clase: "bg-line-03-oscura", nombre: "line-03-oscura", hex: "#007034" },
];

const ESTADOS_DE_ESTACION = [
  "pasada",
  "actual",
  "proxima",
  "cerrada",
  "combinacion",
] as const;

/* Paradas de muestra para el riel. Datos ficticios y explícitamente marcados
   como tales: esta galería no lee el temario, muestra la pieza. */
const PARADAS_DE_MUESTRA: ParadaDelRiel[] = [
  { id: "a", estado: "pasada", titulo: "Primera estación", subtitulo: "Pasada · 3 lecciones" },
  { id: "b", estado: "pasada", titulo: "Segunda estación", subtitulo: "Pasada · 3 lecciones" },
  {
    id: "c",
    estado: "actual",
    titulo: "Tercera estación",
    subtitulo: "Lección 2 de 3 · 4 min",
    tarjeta: (
      <div className="mt-[9px] rounded-sm border-[1.5px] border-[var(--linea)] bg-card px-[13px] py-3">
        <p className="text-titulo-s text-primary">Nombre de la lección en curso</p>
        <BarraProgreso valor={3} total={7} className="mt-[9px]" etiqueta="Avance de la lección" />
        <p className="mt-[7px] text-cuerpo-xs text-secondary">
          Paso <span className="num">3</span> de <span className="num">7</span>
        </p>
      </div>
    ),
  },
  { id: "d", estado: "proxima", titulo: "Cuarta estación", subtitulo: "3 lecciones" },
  { id: "e", estado: "cerrada", titulo: "Quinta estación", subtitulo: "En preparación" },
  {
    id: "f",
    estado: "combinacion",
    titulo: "Combinación · cierre de línea",
    subtitulo: "Sin fuente real todavía: acá va solo de catálogo",
  },
];

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

/**
 * `--trazo-eje` para la muestra del trazo de destacador.
 *
 * Es su propio rol y no sale de `estiloDeLinea()`, por lo mismo que en
 * RunnerLeccion.tsx: `--linea-tinte` cae a blanco fuera de un eje instalado, y
 * meter el estilo de línea completo arrastraría el color a todo lo que cuelga.
 * Acá se emite sola, igual que en el producto.
 */
function trazoDeLinea(linea: LineaId): CSSProperties {
  return { "--trazo-eje": `var(--line-${linea})` } as CSSProperties;
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
          titulo="Riel de estaciones"
          nota="El trazo de una línea con sus paradas: riel de 6px en el color del eje, disco por parada y la tarjeta de la lección en curso colgando de la actual. El riel se dibuja por tramo, así que el primero arranca en su disco y el último termina en el suyo aunque la última parada mida el triple. La parada «combinación» aparece acá de catálogo: en /linea/[ejeId] no se pinta, porque no existe todavía un cierre a nivel de eje del que sacar su título, su conteo y su destino."
        >
          <div className="flex flex-col gap-6">
            <div style={estiloDeLinea("03")} className="max-w-sm">
              <Rotulo>Línea 03 · los seis casos</Rotulo>
              <div className="rounded-sm border border-hairline bg-screen px-4 py-2">
                <RielEstaciones paradas={PARADAS_DE_MUESTRA} />
              </div>
            </div>

            <PorLinea>
              {() => (
                <div className="rounded-sm border border-hairline bg-screen px-4 py-2">
                  <RielEstaciones paradas={PARADAS_DE_MUESTRA.slice(0, 4)} />
                </div>
              )}
            </PorLinea>

            <div style={estiloDeLinea("01")} className="max-w-sm">
              <Rotulo>Una sola parada: sin tramo de riel que dibujar</Rotulo>
              <div className="rounded-sm border border-hairline bg-screen px-4 py-2">
                <RielEstaciones paradas={PARADAS_DE_MUESTRA.slice(4, 5)} />
              </div>
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Botones"
          nota="Ancho completo, 14px de padding vertical, radio de 2px, titulo-s centrado. La variante «línea» toma el color del eje como fondo de texto: sobre la línea 02 el texto va en tinta porque el claro da 1,64:1, y la línea 03 usa su verde oscurecido (#007034) porque el de la línea daba 4,48:1, bajo AA."
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
          nota="La única superficie oscura del sistema. La clave va en el color de la línea aclarado, no en el color de línea: los cuatro están calibrados contra papel y sobre tinta se apagan. Las dos primeras son las formas que salen HOY del flujo real: dos párrafos, porque el desarrollo numérico no existe como campo de contenido (docs/deuda-banner-error-desarrollo.md), y el conteo solo desde la segunda vez que se cae en el mismo error dentro de la sesión. La tercera es la forma completa, para cuando ese campo exista."
        >
          <PorLinea>
            {() => (
              <div className="space-y-3">
                <TarjetaError
                  clave="Error 07"
                  diagnostico="Restaste el paréntesis sin repartir el signo"
                />
                <TarjetaError
                  clave="Error 07 · te ha pasado 3 veces"
                  diagnostico="Restaste el paréntesis sin repartir el signo"
                />
                <TarjetaError
                  clave="Error 07 · te ha pasado 3 veces"
                  diagnostico="Restaste el paréntesis sin repartir el signo"
                  detalle="Al sacar un paréntesis precedido de un menos, cambian de signo todos los términos de adentro, no solo el primero."
                />
              </div>
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
          titulo="Tira de KPIs"
          nota="Tres cifras con divisores hairline sobre superficie de tarjeta. La cifra va en titulo-l con tabular-nums para que las columnas se alineen; el rótulo en versalitas, en sans. No depende del color del eje: es tinta en las cuatro líneas, igual que Puntaje. La celda sin fuente de datos se pinta con un guion y no con un 0 — un 0 afirmaría «llevas cero» sobre algo que nadie midió."
        >
          <div className="flex flex-col gap-6">
            <div>
              <Rotulo>Pantalla 11 · como se monta hoy en /tu</Rotulo>
              <TiraKPI
                celdas={[
                  { cifra: SIN_DATO, rotulo: "Racha", descripcion: "sin dato" },
                  { cifra: 7, rotulo: "Lecciones", descripcion: "7 lecciones completadas" },
                  { cifra: SIN_DATO, rotulo: "Ítems", descripcion: "sin dato" },
                ]}
              />
            </div>
            <div>
              <Rotulo>Pantalla 01 · Entrada (en la portada) — cifras de ejemplo</Rotulo>
              <TiraKPI
                celdas={[
                  { cifra: 11, rotulo: "Estaciones" },
                  { cifra: 33, rotulo: "Lecciones" },
                  { cifra: 4, rotulo: "Líneas" },
                ]}
              />
            </div>
            <div>
              <Rotulo>Pantalla 04 · Estación (todavía sin migrar)</Rotulo>
              <TiraKPI
                celdas={[
                  { cifra: 3, rotulo: "Lecciones" },
                  { cifra: 8, rotulo: "Ítems" },
                  { cifra: 12, rotulo: "Min" },
                ]}
              />
            </div>
            <div>
              <Rotulo>Cifras largas y rótulo que no cabe</Rotulo>
              <TiraKPI
                celdas={[
                  { cifra: 128, rotulo: "Ítems respondidos" },
                  { cifra: 1024, rotulo: "Minutos" },
                  { cifra: SIN_DATO, rotulo: "Racha", descripcion: "sin dato" },
                ]}
              />
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Navegación inferior"
          nota="El ítem activo toma el color del eje, así que la barra dice a la vez dónde estás y en qué línea. La línea 02 es la excepción: acá el color de línea es texto sobre blanco y el amarillo da 1,76:1 en un cuerpo de 9px, así que su etiqueta activa va en tinta. La línea se sigue leyendo en la placa, las estaciones y la barra. Los destinos todavía no existen como rutas."
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

        <Seccion
          titulo="Puntaje"
          nota="El denominador va apagado porque no es la noticia. Va en text-secondary (4,69:1) y no en text-muted, el ink3 de la escala, que mide 2,30:1 contra la tarjeta y no alcanza AA ni con el umbral de texto grande. La jerarquía la sostiene la diferencia contra el numerador (17,76:1), no el valor absoluto. No depende del color del eje: la cifra es tinta en las cuatro líneas."
        >
          <div className="flex flex-wrap gap-10">
            <Puntaje rotulo="Cierre" aciertos={6} total={8} pie="después del módulo" />
            <Puntaje rotulo="Diagnóstico" aciertos={2} total={5} pie="tu punto de partida" />
            <Puntaje rotulo="Sin fallos" aciertos={8} total={8} />
          </div>
        </Seccion>

        <Seccion
          titulo="Franja de ítems"
          nota="Barras de 28px, radio 2px, 5px de separación. Sin semáforo: lo acertado toma el color del eje y lo fallado se hunde con borde de tinta de 1,5px. La señal del fallo es la forma, no el color — por eso la 02 funciona igual, aunque su amarillo mida 1,76:1 contra la tarjeta y como relleno no marcaría nada por sí solo."
        >
          <div className="flex flex-col gap-6">
            <PorLinea>
              {() => (
                <div className="flex flex-col gap-3">
                  <FranjaDeItems
                    resultados={[
                      "correcto",
                      "correcto",
                      "incorrecto",
                      "correcto",
                      "correcto",
                      "incorrecto",
                      "correcto",
                      "correcto",
                    ]}
                  />
                  <FranjaDeItems resultados={["correcto", "correcto", "correcto", "correcto"]} />
                  <FranjaDeItems
                    resultados={["incorrecto", "incorrecto", "incorrecto", "incorrecto"]}
                  />
                </div>
              )}
            </PorLinea>
            <div>
              <Rotulo>Fuera de un eje (cae a text-primary)</Rotulo>
              <FranjaDeItems
                resultados={["correcto", "incorrecto", "correcto", "correcto", "incorrecto"]}
              />
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Lo que falló"
          nota="Agrupa por mecanismo y no por pregunta: dos ítems bajo el mismo id son un patrón, y ése es el dato que sirve para estudiar. Superficie clara y chip en tinta, a diferencia de la tarjeta de error, que gasta la excepción de la superficie oscura en un error solo. El segundo grupo muestra el caso real de 5 de los 11 cierres: el id existe y el texto no, porque el archivo no trae catalogoErrores propio. Sin grupos la tarjeta no se renderiza."
        >
          <div className="max-w-lg" style={estiloDeLinea("03")}>
            <TarjetaLoQueFallo
              grupos={[
                {
                  id: "error-5",
                  descripcion:
                    "Al factorizar x² + bx + c como (x − p)(x − q), invertir el signo de la raíz al leerla desde el factor.",
                  numerosDeItem: [2, 6],
                },
                { id: "error-9", numerosDeItem: [4] },
              ]}
            />
          </div>
        </Seccion>

        <Seccion
          titulo="Errores vivos"
          nota="Pantalla 10. Los errores catalogados de la sesión, del más repetido al menos, con su conteo. Sin chip de id ni línea: el conteo de sesión se cuña por descripción y no guarda ni el id (local al archivo) ni el eje — docs/deuda-errores-vivos.md. Sin filas, el estado vacío honesto reemplaza el titular y no monta ni la lista ni el CTA."
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <Rotulo>Con errores</Rotulo>
              <ListaErroresVivos
                filas={[
                  { titulo: "Olvidar el factor 1/2 en el área de triángulo y trapecio", veces: 3 },
                  { titulo: "Confundir el perímetro del círculo con su área", veces: 2 },
                  { titulo: "Invertir el signo de la desigualdad al dividir por un negativo", veces: 2 },
                  { titulo: "Contar el borde interior en figuras compuestas", veces: 1 },
                ]}
              />
            </div>
            <div>
              <Rotulo>Sin errores</Rotulo>
              <ListaErroresVivos filas={[]} />
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="Trazo de destacador"
          nota="Fase D. El único gesto de mano del sistema: bordes que no son paralelos, extremos que no cierran y trazo que desborda el texto. Sin imagen y sin librería — banda de gradiente, ocho radios distintos y una máscara de seis capas. Quién decide dónde va es lib/trazoDestacado.ts; la clase no se escribe a mano en ningún componente del producto."
        >
          <div className="flex flex-col gap-7">
            <div>
              <Rotulo>Uno por eje: el trazo toma el color de su línea</Rotulo>
              <PorLinea>
                {(linea) => (
                  <p className="text-cuerpo-m text-primary" style={trazoDeLinea(linea)}>
                    El <strong className="trazo-destacado">vértice</strong> es el punto más
                    alto de la parábola.
                  </p>
                )}
              </PorLinea>
            </div>

            <div>
              {/* El caso que decide si `box-decoration-break: clone` está haciendo
                  su trabajo. La medida angosta fuerza el corte: si el término se
                  ve como una banda continua entre las dos líneas, en vez de dos
                  trazos con sus propios extremos irregulares, `clone` no llegó.
                  Es también donde se mira si la máscara sobrevive a un inline
                  fragmentado; si no sobrevive, se cae la capa 3 y quedan la
                  banda y los radios. Ver el comentario en app/globals.css. */}
              <Rotulo>Partido en dos líneas: dos trazos, no una banda estirada</Rotulo>
              <p className="max-w-[13rem] text-cuerpo-m text-primary" style={trazoDeLinea("03")}>
                Buscamos la{" "}
                <strong className="trazo-destacado">ecuación de segundo grado</strong> que
                describe la curva.
              </p>
            </div>

            <div>
              <Rotulo>Fuera de un eje cae a tinta, y convive con la negrita normal</Rotulo>
              <p className="max-w-prose text-cuerpo-m text-primary">
                El <strong className="trazo-destacado">discriminante</strong> decide cuántos{" "}
                <strong>ceros reales</strong> tiene: la segunda negrita no lleva trazo porque
                el trazo es uno por bloque.
              </p>
            </div>
          </div>
        </Seccion>
      </div>
    </main>
  );
}
