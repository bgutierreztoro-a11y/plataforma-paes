import Link from "next/link";
import { idsDeLecciones, obtenerLeccion } from "@/lib/contenido";
import { BannerDemostracion } from "@/components/ui/Banner";

export default function IndiceLecciones() {
  const lecciones = idsDeLecciones().sort().map(obtenerLeccion);

  return (
    <div className="fondo-cuadricula min-h-full flex-1 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-sm uppercase tracking-wide text-ink-suave">
          Matemática M1 · Piloto privado
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Lecciones</h1>

        <ul className="mt-6 flex flex-col gap-4">
          {lecciones.map((leccion) => (
            <li key={leccion.id}>
              <Link
                href={`/leccion/${leccion.id}`}
                className="block overflow-hidden rounded-tarjeta border border-border bg-surface transition-colors hover:border-accent"
              >
                {leccion.estado !== "publicable" && <BannerDemostracion />}
                <div className="px-5 py-4">
                  <h2 className="text-lg font-semibold text-ink">{leccion.titulo}</h2>
                  <p className="mt-1 text-sm text-ink-suave">
                    {leccion.tiempoEstimadoMin} min aprox.
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
