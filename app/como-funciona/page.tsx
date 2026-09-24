import type { Metadata } from "next";
import { AsiFunciona } from "@/components/recorrido/AsiFunciona";
import { EnlaceBoton } from "@/components/ui/linea/Boton";
import { ASI_FUNCIONA } from "@/lib/recorrido/textosBienvenida";

export const metadata: Metadata = {
  title: ASI_FUNCIONA.titulo,
};

/** La misma pantalla de la bienvenida, para volver a abrirla desde la portada (§4). */
export default function ComoFunciona() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <AsiFunciona
        accion={
          <EnlaceBoton href="/" variante="neutro">
            Ir a Fobos
          </EnlaceBoton>
        }
      />
    </main>
  );
}
