import type { DatosVisualProbabilidad } from "@/lib/tipos";
import { DiagramaArbol } from "./DiagramaArbol";
import { CuadriculaEspacioMuestral } from "./CuadriculaEspacioMuestral";

/**
 * Despacha por `datos.tipo` a uno de los dos bloques visuales de probabilidad.
 * Mismo papel que `GraficoEstadistico` para los gráficos de datos: el único
 * punto de entrada que conocen `BloqueVisualizacion` y `visualesItems`, con el
 * contrato compartido de `motivoRechazoDatosProbabilidad` (lib/probabilidad.ts).
 */
export function VisualProbabilidad({ datos }: { datos: DatosVisualProbabilidad }) {
  switch (datos.tipo) {
    case "diagramaArbol":
      return <DiagramaArbol {...datos} />;
    case "cuadriculaEspacioMuestral":
      return <CuadriculaEspacioMuestral {...datos} />;
  }
}
