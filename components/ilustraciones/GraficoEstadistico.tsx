import type { DatosGraficoEstadistico } from "@/lib/tipos";
import { GraficoBarras } from "./GraficoBarras";
import { GraficoCircular } from "./GraficoCircular";
import { GraficoLineas } from "./GraficoLineas";
import { DiagramaCajon } from "./DiagramaCajon";

/**
 * Despacha por `datos.tipo` a uno de los cuatro gráficos de datos. Es el único
 * punto de entrada que conocen `BloqueVisualizacion` y `visualesItems`: los
 * cuatro componentes comparten contrato (`motivoRechazoDatosGrafico`), tokens
 * y lienzo, y quien los monta no necesita saber cuál es cuál.
 */
export function GraficoEstadistico({ datos }: { datos: DatosGraficoEstadistico }) {
  switch (datos.tipo) {
    case "graficoBarras":
      return <GraficoBarras {...datos} />;
    case "graficoLineas":
      return <GraficoLineas {...datos} />;
    case "graficoCircular":
      return <GraficoCircular {...datos} />;
    case "diagramaCajon":
      return <DiagramaCajon {...datos} />;
  }
}
