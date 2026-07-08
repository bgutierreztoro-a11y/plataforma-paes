import { EnlaceBoton } from "@/components/ui/Boton";

export default function NotFound() {
  return (
    <div className="fondo-cuadricula flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">No encontramos esta página</h1>
      <p className="max-w-md text-base text-ink-suave">
        El enlace puede estar mal escrito, o esta lección todavía no existe en este piloto.
      </p>
      <EnlaceBoton href="/">Volver a la portada</EnlaceBoton>
    </div>
  );
}
