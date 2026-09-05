import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueTexto as BloqueTextoTipo } from "@/lib/tipos";

export function BloqueTexto({
  bloque,
  corpus,
}: {
  bloque: BloqueTextoTipo;
  /* El texto completo de la lección, para el trazo de destacador. Ver
     lib/trazoDestacado.ts. */
  corpus?: string;
}) {
  // max-w-prose acota la medida de lectura (~65 caracteres): en pasos largos,
  // la línea completa de max-w-2xl cansa la vista.
  //
  // 18px y no 16: leer para aprender pide comodidad, y este es el texto sobre
  // el que el estudiante pasa media hora (MASTER.md §2.2, "body-lg").
  return (
    <div className="max-w-prose text-lg text-ink">
      <TextoEnriquecido contenido={bloque.contenido} corpus={corpus} />
    </div>
  );
}
