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
}

export function Bloque({
  bloque,
  leccionId,
  paso,
  indiceBloque,
  onExploracionCompleta,
}: BloqueProps) {
  const itemId = `${leccionId}-p${paso}-b${indiceBloque}`;

  switch (bloque.tipo) {
    case "texto":
      return <BloqueTexto bloque={bloque} />;
    case "prediccion":
      return <BloquePrediccion bloque={bloque} />;
    case "seleccion":
      return <BloqueSeleccion bloque={bloque} />;
    case "numerica":
      return <BloqueNumerica bloque={bloque} />;
    case "verdaderoFalso":
      return <BloqueVerdaderoFalso bloque={bloque} />;
    case "abierta":
      return <BloqueAbierta bloque={bloque} />;
    case "pregunta":
      return <BloquePregunta bloque={bloque} itemId={itemId} />;
    case "interactivoSlider":
      return <BloqueInteractivo bloque={bloque} onExploracionCompleta={onExploracionCompleta} />;
    case "pistas":
      return <BloquePistas bloque={bloque} paso={paso} />;
    case "visualizacion":
      return <BloqueVisualizacion bloque={bloque} />;
  }
}
