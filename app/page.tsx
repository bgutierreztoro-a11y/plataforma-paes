import { EnlaceBoton } from "@/components/ui/Boton";
import { GrillaLecciones } from "@/components/GrillaLecciones";

export default function Portada() {
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
          Un diagnóstico breve, lecciones interactivas y un cierre con preguntas formato PAES.
        </p>
        <EnlaceBoton href="/diagnostico" className="mt-8 text-lg">
          Comenzar diagnóstico
        </EnlaceBoton>
      </section>

      {/* Acceso directo a lecciones */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          O refuerza un tema directo
        </h2>
        <p className="mt-2 text-base text-ink-suave">
          Cada lección se completa en una sesión y termina con preguntas formato PAES.
        </p>
        <div className="mt-8">
          <GrillaLecciones />
        </div>
      </section>
    </div>
  );
}
