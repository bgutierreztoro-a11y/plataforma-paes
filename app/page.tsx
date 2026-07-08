import { EnlaceBoton } from "@/components/ui/Boton";

export default function Portada() {
  return (
    <div className="fondo-cuadricula flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-wide text-ink-suave">
        Matemática M1 · Piloto privado
      </p>
      <h1 className="max-w-lg text-4xl font-semibold leading-tight text-ink">
        Funciones lineales y afines, paso a paso
      </h1>
      <p className="max-w-md text-lg leading-8 text-ink-suave">
        Un diagnóstico breve, una lección interactiva y un cierre con preguntas formato PAES. Unos
        20 minutos en total.
      </p>
      <EnlaceBoton href="/diagnostico" className="text-lg">
        Empezar el diagnóstico
      </EnlaceBoton>
    </div>
  );
}
