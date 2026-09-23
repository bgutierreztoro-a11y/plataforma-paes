import { DiagramaCajon } from "@/components/advance/figuras/DiagramaCajon";
import { GraficoBarras } from "@/components/advance/figuras/GraficoBarras";
import { GraficoCircular } from "@/components/advance/figuras/GraficoCircular";
import { GraficoLineas } from "@/components/advance/figuras/GraficoLineas";
import { Histograma } from "@/components/advance/figuras/Histograma";
import { LienzoGeometrico } from "@/components/advance/figuras/LienzoGeometrico";
import { TablaDatos } from "@/components/advance/figuras/TablaDatos";
import { PlanoFuncion } from "@/components/advance/PlanoFuncion";
import { PlanoIsometrias } from "@/components/advance/PlanoIsometrias";
import { TablaValores } from "@/components/advance/TablaValores";
import type { FiguraItem } from "@/lib/advance/descarte";

/**
 * Despacha la figura de un ítem Advance por `tipo`: sin tipo es el plano de
 * isometrías (los bancos anteriores a plano-funcion), con tipo es una figura
 * de función, una de datos o el lienzo geométrico (components/advance/figuras/). Único punto que
 * conoce los componentes: descarte y triage lo montan entre el enunciado y
 * las alternativas y no saben cuál es cuál.
 */
export function FiguraDeItem({ figura }: { figura: FiguraItem }) {
  switch (figura.tipo) {
    case undefined:
      return <PlanoIsometrias figura={figura} />;
    case "plano-funcion":
      return <PlanoFuncion figura={figura} />;
    case "tabla-valores":
      return <TablaValores figura={figura} />;
    case "tabla-datos":
      return <TablaDatos figura={figura} />;
    case "grafico-barras":
      return <GraficoBarras figura={figura} />;
    case "histograma":
      return <Histograma figura={figura} />;
    case "grafico-lineas":
      return <GraficoLineas figura={figura} />;
    case "grafico-circular":
      return <GraficoCircular figura={figura} />;
    case "diagrama-cajon":
      return <DiagramaCajon figura={figura} />;
    case "lienzo-geometrico":
      return <LienzoGeometrico figura={figura} />;
  }
}
