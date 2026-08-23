import { GraficoParabola } from "@/components/grafico/GraficoParabola";
import { GraficoPendiente } from "@/components/grafico/GraficoPendiente";
import type { BloqueInteractivoSlider, VariableSlider } from "@/lib/tipos";

/* El orden posicional es el contrato del bloque. Con recta: variables[0] es la
   pendiente y variables[1] el intercepto. Con parábola: [0] = a, [1] = b y
   [2] = c, en el orden de lectura de y = ax² + bx + c. Faltando alguna, se
   asume el respaldo para no romper el render. */
const POR_DEFECTO = { min: -5, max: 5, valorInicial: 0, editable: true };

/* Los rangos de la parábola no son los de la recta: están elegidos para que el
   vértice nunca se salga del plano [-10,10]². Con |a| ≥ 0,5 se cumple
   |x_v| = |b|/(2|a|) ≤ 3 y |y_v| ≤ |c| + b²/(4|a|) ≤ 5 + 4,5 = 9,5. El barrido
   completo del cubo está comprobado en lib/planoCartesiano.test.ts. Una lección
   que quiera menos margen los estrecha en su JSON. */
const POR_DEFECTO_A = { min: -2, max: 2, valorInicial: 1, editable: true };
const POR_DEFECTO_B = { min: -3, max: 3, valorInicial: 0, editable: true };
const POR_DEFECTO_C = { min: -5, max: 5, valorInicial: 0, editable: true };

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
  const [var0, var1, var2] = bloque.variables;
  /* Ausente = recta: todo el contenido escrito antes de que existiera la
     parábola sigue cayendo en la misma rama de siempre. */
  const esParabola = bloque.objeto === "parabola";
  const exploracionMinima =
    bloque.variante === "unaVariable" ? bloque.exploracionMinima : undefined;

  return (
    /* Contenedor propio: el interactivo es el héroe de la lección (MASTER.md
       §3.3 y UI_GUIDELINES §15) y necesita separarse del texto para decir "acá
       se juega". El radio más grande de la escala y la única sombra teñida de
       aurora son suyos y de nada más — es lo que lo distingue de una tarjeta
       cualquiera sin agregarle adornos. */
    <div className="rounded-escena border border-border bg-surface p-4 shadow-interactivo sm:p-6">
      {esParabola ? (
        <GraficoParabola
          instruccion={bloque.instruccion}
          configA={config(var0, POR_DEFECTO_A)}
          configB={config(var1, POR_DEFECTO_B)}
          configC={config(var2, POR_DEFECTO_C)}
          mostrarVertice={bloque.mostrarVertice}
          mostrarCeros={bloque.mostrarCeros}
          exploracionMinima={exploracionMinima}
          onExploracionCompleta={onExploracionCompleta}
        />
      ) : (
        <GraficoPendiente
          instruccion={bloque.instruccion}
          configM={config(var0, POR_DEFECTO)}
          configB={config(var1, { ...POR_DEFECTO, min: -8, max: 8, editable: false })}
          exploracionMinima={exploracionMinima}
          onExploracionCompleta={onExploracionCompleta}
          secuenciaMicropreguntas={
            bloque.variante === "dosVariables" ? bloque.secuenciaMicropreguntas : undefined
          }
        />
      )}
    </div>
  );
}
