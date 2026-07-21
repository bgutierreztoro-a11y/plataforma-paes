import { EnlaceBoton } from "@/components/ui/Boton";
import { IlustracionPlano } from "@/components/ilustraciones/IlustracionPlano";

export default function NotFound() {
  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <div className="w-full max-w-56">
        <IlustracionPlano />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Este punto quedó fuera del plano
      </h1>
      <p className="max-w-md text-base leading-relaxed text-ink-suave">
        La página que buscas no existe: el enlace puede estar mal escrito, o esta lección todavía
        no es parte del piloto.
      </p>
      <EnlaceBoton href="/">Volver a la portada</EnlaceBoton>
    </div>
  );
}
