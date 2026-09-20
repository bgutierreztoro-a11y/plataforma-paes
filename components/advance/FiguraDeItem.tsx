import { PlanoFuncion } from "@/components/advance/PlanoFuncion";
import { PlanoIsometrias } from "@/components/advance/PlanoIsometrias";
import { TablaValores } from "@/components/advance/TablaValores";
import type { FiguraItem } from "@/lib/advance/descarte";

/**
 * Despacha la figura de un ítem Advance por `tipo`: sin tipo es el plano de
 * isometrías (los bancos anteriores a plano-funcion), con tipo es una figura
 * de función. Único punto que conoce los tres componentes: descarte y triage
 * lo montan entre el enunciado y las alternativas y no saben cuál es cuál.
 */
export function FiguraDeItem({ figura }: { figura: FiguraItem }) {
  switch (figura.tipo) {
    case undefined:
      return <PlanoIsometrias figura={figura} />;
    case "plano-funcion":
      return <PlanoFuncion figura={figura} />;
    case "tabla-valores":
      return <TablaValores figura={figura} />;
  }
}
