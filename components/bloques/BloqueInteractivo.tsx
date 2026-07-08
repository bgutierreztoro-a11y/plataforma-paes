import { GraficoPendiente } from "@/components/grafico/GraficoPendiente";
import type { BloqueInteractivoSlider } from "@/lib/tipos";

export function BloqueInteractivo({ bloque }: { bloque: BloqueInteractivoSlider }) {
  const [varM, varB] = bloque.variables;
  return (
    <GraficoPendiente
      instruccion={bloque.instruccion}
      valorInicialM={varM?.valorInicial ?? 0}
      valorInicialB={varB?.valorInicial ?? 0}
    />
  );
}
