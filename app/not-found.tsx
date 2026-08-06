import { EnlaceBoton } from "@/components/ui/Boton";
import { IlustracionPlano } from "@/components/ilustraciones/IlustracionPlano";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";

export default function NotFound() {
  return (
    <PantallaCentrada className="gap-5 text-center">
      <div className="w-full max-w-56">
        <IlustracionPlano />
      </div>
      <h1 className="text-3xl font-semibold text-ink">
        Este punto quedó fuera del plano
      </h1>
      <p className="max-w-md text-base leading-relaxed text-ink-suave">
        La página que buscas no existe: el enlace puede estar mal escrito, o esta lección todavía
        no es parte del piloto.
      </p>
      <EnlaceBoton href="/">Volver a la portada</EnlaceBoton>
    </PantallaCentrada>
  );
}
