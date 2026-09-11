"use client";

import { ALTERNATIVA_BASE, ALTERNATIVA_INTERACTIVA, CHIP_BASE } from "@/components/ui/alternativa";
import type { AlternativaAdvance, EstadoAlternativa } from "@/lib/advance/descarte";
import type { ClaveAlternativa } from "@/lib/tipos";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";

interface AlternativaDescartableProps {
  alternativa: AlternativaAdvance;
  estado: EstadoAlternativa;
  /* "Error 07": el rótulo del error catalogado, ya resuelto por quien monta.
     Solo se lee en `descartada-correcta`. */
  rotuloError?: string;
  /* Si el ítem ya está cerrado o la alternativa es la sobreviviente, el toque
     no hace nada y el control lo dice con `disabled`. */
  deshabilitada?: boolean;
  /* Recibe la clave visible. Opcional solo para que la galería, que es un
     server component, pueda rendir los estados fijos sin pasar una función. */
  onDescartar?: (clave: ClaveAlternativa) => void;
}

/**
 * Una alternativa del modo descarte (docs/fobos-advance.md §6.1).
 *
 * Es un `button` con `aria-pressed`: presionada = descartada. El estado se
 * anuncia por texto ("Descartada: Error 07") y no solo por el tachado, así que
 * un lector de pantalla y una persona que no distinga el tachado leen lo
 * mismo.
 *
 * **Sin `opacity` en ningún estado.** La descartada se "atenúa" por superficie
 * hundida y tachado, con el texto en `text-primary`: el contraste tiene que
 * medir 4,5:1 en render, y `opacity` lo rompería sin que ninguna clase lo
 * dijera. Por lo mismo el texto de estado y el feedback van en `text-primary`
 * y no en `text-secondary`, que sobre `bg-sunken` no llega a AA; la jerarquía
 * la dan tamaño y peso.
 *
 * Los cuatro estados toman la misma base que el resto de las alternativas del
 * producto (`components/ui/alternativa.ts`: 44px de alto mínimo, transición
 * solo con `motion-safe`, foco en tinta). `.canto` va solo en la intacta, que
 * es la única que responde al dedo; viene en `ALTERNATIVA_INTERACTIVA`.
 *
 * - intacta: tarjeta con borde hairline.
 * - descartada-correcta: hundida, tachada, rótulo del error y `feedbackDescarte`.
 * - descartada-por-error: en verde de `success`, tachada, y el
 *   `feedbackDescarteIncorrecto`. El verde dice "era la correcta", que es la
 *   información; la solución la muestra el ejecutor debajo de la lista.
 * - sobreviviente: color del eje, sin tachar. Es la que se confirma.
 */
const CLASES_FILA: Record<EstadoAlternativa, string> = {
  intacta: `border border-hairline bg-card ${ALTERNATIVA_INTERACTIVA}`,
  "descartada-correcta": "cursor-default border border-hairline bg-sunken",
  "descartada-por-error": "cursor-default border-[1.5px] border-success bg-success-suave",
  sobreviviente: "cursor-default border-[1.5px] border-[var(--linea)] bg-[var(--linea-tinte)]",
};

const CLASES_CHIP: Record<EstadoAlternativa, string> = {
  intacta: "border border-hairline text-secondary",
  "descartada-correcta": "border border-strong bg-strong text-inverse",
  "descartada-por-error": "border border-success bg-success text-inverse",
  sobreviviente:
    "border-[1.5px] border-[var(--linea)] bg-[var(--linea-fondo)] text-[var(--linea-contraste)]",
};

export function AlternativaDescartable({
  alternativa,
  estado,
  rotuloError,
  deshabilitada = false,
  onDescartar,
}: AlternativaDescartableProps) {
  const { descarte } = TEXTOS_ADVANCE;
  const descartada = estado === "descartada-correcta" || estado === "descartada-por-error";
  const inactiva = deshabilitada || estado !== "intacta";

  return (
    <button
      type="button"
      aria-pressed={descartada}
      disabled={inactiva}
      onClick={() => onDescartar?.(alternativa.clave)}
      data-alternativa-estado={estado}
      className={`${ALTERNATIVA_BASE} w-full flex-wrap text-left ${CLASES_FILA[estado]}`}
    >
      <span aria-hidden="true" className={`${CHIP_BASE} ${CLASES_CHIP[estado]}`}>
        {alternativa.clave}
      </span>
      {/* Texto plano, como en ItemPAES: `TextoEnriquecido` emite `<p>`, que no
          puede ir dentro de un `button`. */}
      <span
        className={`min-w-0 flex-1 text-cuerpo-m text-primary ${descartada ? "line-through" : ""}`.trim()}
      >
        {alternativa.texto}
      </span>

      {estado === "descartada-correcta" && !alternativa.esCorrecta && (
        <span className="basis-full pl-10">
          <span className="block text-etiqueta uppercase text-primary" data-estado-texto>
            {descarte.descartada}: {rotuloError ?? alternativa.errorCatalogado}
          </span>
          <span className="mt-1 block text-cuerpo-s text-primary" data-feedback>
            {alternativa.feedbackDescarte}
          </span>
        </span>
      )}

      {estado === "descartada-por-error" && alternativa.esCorrecta && (
        <span className="basis-full pl-10">
          <span className="block text-etiqueta uppercase text-primary" data-estado-texto>
            {descarte.descartadaPorError}
          </span>
          <span className="mt-1 block text-cuerpo-s text-primary" data-feedback>
            {alternativa.feedbackDescarteIncorrecto}
          </span>
        </span>
      )}

      {estado === "sobreviviente" && (
        <span className="basis-full pl-10">
          <span className="block text-etiqueta uppercase text-primary" data-estado-texto>
            {descarte.sobreviviente}
          </span>
        </span>
      )}
    </button>
  );
}
