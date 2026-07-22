import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueTexto as BloqueTextoTipo } from "@/lib/tipos";

export function BloqueTexto({ bloque }: { bloque: BloqueTextoTipo }) {
  // max-w-prose acota la medida de lectura (~65 caracteres): en pasos largos,
  // la línea completa de max-w-2xl cansa la vista.
  return (
    <div className="max-w-prose text-base text-ink">
      <TextoEnriquecido contenido={bloque.contenido} />
    </div>
  );
}
