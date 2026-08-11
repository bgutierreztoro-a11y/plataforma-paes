import { EnlaceBoton } from "@/components/ui/Boton";
import { IlustracionPlano } from "@/components/ilustraciones/IlustracionPlano";
import { PantallaCentrada } from "@/components/ui/PantallaCentrada";
import { EncabezadoDeEntrada } from "@/components/ui/EncabezadoDeEntrada";

export default function NotFound() {
  return (
    <PantallaCentrada className="gap-5 text-center">
      <div className="w-full max-w-56">
        <IlustracionPlano />
      </div>
      {/* Sin rótulo, igual que error.tsx: las dos pantallas de nada no tienen
          contexto que dar —no estás "en" ninguna parte del producto— y un rótulo
          inventado sería peor que ninguno. */}
      <EncabezadoDeEntrada titulo="Este punto quedó fuera del plano">
        La página que buscas no existe: el enlace puede estar mal escrito, o esta
        lección todavía no es parte del piloto.
      </EncabezadoDeEntrada>
      <div className="w-full max-w-md">
        <EnlaceBoton href="/" anchoCompleto>
          Volver a la portada
        </EnlaceBoton>
      </div>
    </PantallaCentrada>
  );
}
