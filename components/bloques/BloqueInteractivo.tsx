import { GraficoPendiente } from "@/components/grafico/GraficoPendiente";
import type { BloqueInteractivoSlider, VariableSlider } from "@/lib/tipos";

/* El orden posicional es el contrato del bloque: variables[0] es la pendiente
   y variables[1] el intercepto (schema: máximo 2). Faltando la segunda, se
   asume un intercepto fijo en 0 para no romper el render. */
const POR_DEFECTO = { min: -5, max: 5, valorInicial: 0, editable: true };

function config(variable: VariableSlider | undefined, respaldo: typeof POR_DEFECTO) {
  if (!variable) return respaldo;
  return {
    min: variable.min,
    max: variable.max,
    valorInicial: variable.valorInicial ?? 0,
    editable: variable.editable,
  };
}

export function BloqueInteractivo({
  bloque,
  onExploracionCompleta,
}: {
  bloque: BloqueInteractivoSlider;
  onExploracionCompleta?: () => void;
}) {
  const [varM, varB] = bloque.variables;
  return (
    /* Contenedor propio: el interactivo es el héroe de la lección (MASTER.md
       §3.3 y UI_GUIDELINES §15) y necesita separarse del texto para decir "acá
       se juega". El radio más grande de la escala y la única sombra teñida de
       aurora son suyos y de nada más — es lo que lo distingue de una tarjeta
       cualquiera sin agregarle adornos. */
    <div className="rounded-escena border border-border bg-surface p-4 shadow-interactivo sm:p-6">
      <GraficoPendiente
        instruccion={bloque.instruccion}
        configM={config(varM, POR_DEFECTO)}
        configB={config(varB, { ...POR_DEFECTO, min: -8, max: 8, editable: false })}
        exploracionMinima={
          bloque.variante === "unaVariable" ? bloque.exploracionMinima : undefined
        }
        onExploracionCompleta={onExploracionCompleta}
        secuenciaMicropreguntas={
          bloque.variante === "dosVariables" ? bloque.secuenciaMicropreguntas : undefined
        }
      />
    </div>
  );
}
