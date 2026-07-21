import { GrillaLecciones } from "@/components/GrillaLecciones";

export default function IndiceLecciones() {
  return (
    <div className="min-h-full flex-1 px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-suave">
          Matemática M1 · Piloto privado
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
          Lecciones
        </h1>
        <div className="mt-8">
          <GrillaLecciones />
        </div>
      </div>
    </div>
  );
}
