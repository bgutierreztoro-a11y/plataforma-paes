import Link from "next/link";
import { EnlaceBoton } from "@/components/ui/Boton";
import { idsPublicables } from "@/lib/contenido";

export default function Portada() {
  /* El destino del CTA sale del camino real, no de un id escrito a mano:
     cuando se publique otra lección, la portada apunta sola a la primera
     abierta. Si no hubiera ninguna publicable no se pinta CTA primario — la
     grilla de abajo ya sabe decir "En preparación". */
  const primeraLeccion = idsPublicables()[0];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Hero sobre papel milimetrado con desvanecido central */}
      <section className="fondo-cuadricula cuadricula-desvanecida flex flex-col items-center px-4 py-24 text-center lg:py-36">
        <p className="text-sm font-medium uppercase tracking-wide text-ink-suave">
          Matemática M1 · Piloto privado
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink lg:text-6xl">
          Funciones lineales y afines, paso a paso
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-ink-suave">
          Lecciones interactivas que terminan con preguntas formato PAES. Abajo ves
          cuáles están abiertas y cuáles en preparación.
        </p>
        {primeraLeccion && (
          <EnlaceBoton href={`/leccion/${primeraLeccion}`} className="mt-8 text-lg">
            Empezar la primera lección
          </EnlaceBoton>
        )}
        {/* El diagnóstico sigue accesible, pero como opción secundaria y
            nombrando lo que es: su contenido está en `revision` y la propia
            página muestra el banner de demostración. Decirlo acá evita que la
            portada prometa una cosa y el destino muestre otra. */}
        <p className="mt-6 max-w-md text-sm leading-6 text-ink-suave">
          ¿Prefieres medir tu punto de partida antes? El diagnóstico son 5 preguntas
          y hoy es una versión de demostración.{" "}
          <Link
            href="/diagnostico"
            className="font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Hacer el diagnóstico
          </Link>
        </p>
      </section>

      {/* Un solo destino de navegación: el camino. La grilla de lecciones que
          vivía acá se retiró — dos formas de recorrer el mismo contenido es
          deuda de diseño, no una comodidad. */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-24 pt-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          El temario completo, por unidades
        </h2>
        <p className="mt-2 text-base leading-7 text-ink-suave">
          Matemática M1 son 16 unidades repartidas en cuatro ejes. En el camino ves cuáles
          están abiertas, cuáles en preparación y por dónde vas.
        </p>
        <div className="mt-8 flex justify-center">
          <EnlaceBoton href="/camino" variante="secundario">
            Ver el camino
          </EnlaceBoton>
        </div>
      </section>
    </div>
  );
}
