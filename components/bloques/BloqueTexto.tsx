import { TextoEnriquecido } from "@/lib/markdownSimple";
import type { BloqueTexto as BloqueTextoTipo } from "@/lib/tipos";

export function BloqueTexto({ bloque }: { bloque: BloqueTextoTipo }) {
  return (
    <div className="text-base text-ink">
      <TextoEnriquecido contenido={bloque.contenido} />
    </div>
  );
}
