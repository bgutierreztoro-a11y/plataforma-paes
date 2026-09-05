import { BloqueTexto } from "./BloqueTexto";
import { BloquePrediccion } from "./BloquePrediccion";
import { BloqueSeleccion } from "./BloqueSeleccion";
import { BloqueNumerica } from "./BloqueNumerica";
import { BloqueVerdaderoFalso } from "./BloqueVerdaderoFalso";
import { BloqueAbierta } from "./BloqueAbierta";
import { BloquePregunta } from "./BloquePregunta";
import { BloqueInteractivo } from "./BloqueInteractivo";
import { BloquePistas } from "./BloquePistas";
import { BloqueVisualizacion } from "./BloqueVisualizacion";
import type { Bloque as BloqueTipo } from "@/lib/tipos";

interface BloqueProps {
  bloque: BloqueTipo;
  leccionId: string;
  paso: number;
  indiceBloque: number;
  /* Solo lo usa interactivoSlider con exploracionMinima: avisa al runner que
     el estudiante ya exploró lo suficiente y puede avanzar de paso. */
  onExploracionCompleta?: () => void;
  /* Solo lo usa el bloque `pregunta`: avisa al runner que se respondió bien,
     para el "¿Te hizo sentido?" del pie. */
  onAcierto?: () => void;
  /* El texto completo de la lección. Solo lo usa el trazo de destacador, para
     el criterio de repetición: ver lib/trazoDestacado.ts. No lo reciben los
     bloques que no pintan prosa (`interactivoSlider`, `pistas`), ni
     `visualizacion`, que solo llama a `conEnfasis` para celdas de tabla — y una
     tabla nunca lleva trazo. */
  corpus?: string;
}

export function Bloque({
  bloque,
  leccionId,
  paso,
  indiceBloque,
  onExploracionCompleta,
  onAcierto,
  corpus,
}: BloqueProps) {
  const itemId = `${leccionId}-p${paso}-b${indiceBloque}`;

  switch (bloque.tipo) {
    case "texto":
      return <BloqueTexto bloque={bloque} corpus={corpus} />;
    case "prediccion":
      return <BloquePrediccion bloque={bloque} corpus={corpus} />;
    case "seleccion":
      return <BloqueSeleccion bloque={bloque} corpus={corpus} />;
    case "numerica":
      return <BloqueNumerica bloque={bloque} corpus={corpus} />;
    case "verdaderoFalso":
      return <BloqueVerdaderoFalso bloque={bloque} corpus={corpus} />;
    case "abierta":
      return <BloqueAbierta bloque={bloque} corpus={corpus} />;
    case "pregunta":
      /* Un bloque `pregunta` siempre vive dentro de una lección: el contexto
         no puede ser otro y sale del id que este componente ya recibe. */
      return (
        <BloquePregunta
          bloque={bloque}
          itemId={itemId}
          contexto="leccion"
          contextoId={leccionId}
          onAcierto={onAcierto}
          corpus={corpus}
        />
      );
    case "interactivoSlider":
      return <BloqueInteractivo bloque={bloque} onExploracionCompleta={onExploracionCompleta} />;
    case "pistas":
      return <BloquePistas bloque={bloque} paso={paso} />;
    case "visualizacion":
      return <BloqueVisualizacion bloque={bloque} />;
  }
}
