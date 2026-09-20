"use client";

import { ALTERNATIVA_BASE, CHIP_BASE } from "@/components/ui/alternativa";
import { PlanoIsometrias } from "@/components/advance/PlanoIsometrias";
import { Boton } from "@/components/ui/linea/Boton";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import type { ItemAdvance } from "@/lib/advance/descarte";
import type { Decision } from "@/lib/advance/triage";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { TextoEnriquecido } from "@/lib/markdownSimple";

interface ItemTriageProps {
  item: ItemAdvance;
  /* 0-based, para "Ítem N de M" y la barra. */
  indice: number;
  total: number;
  /* Segundos que quedan, 20 → 0. Quien lo monta lleva el reloj. */
  segundos: number;
  /* Título de la unidad (nombre técnico DEMRE). Opcional solo para la
     galería, que monta la muestra sin banco. */
  titulo?: string;
  /* Recibe una de las dos decisiones. Opcional para que la galería, que es
     un server component, pueda rendir el ítem fijo sin pasar una función. */
  onDecidir?: (decision: Exclude<Decision, "sin-decision">) => void;
}

/* Dos decisiones desde F5a2. `dejo` sigue en el tipo sin botón que la emita. */
const DECISIONES = ["resuelvo", "marco"] as const;

/**
 * Un ítem del triage de 20 segundos (docs/fobos-advance.md §6.5), tal como se
 * ve en la prueba: enunciado y cuatro alternativas, sin rótulo de error, sin
 * feedback y sin nada que tocar en ellas. No se resuelve nada.
 *
 * Presentacional y sin estado: el reloj lo lleva `EjecutorTriage`, y por eso
 * la galería puede montar "ítem con cuenta" con un valor fijo.
 *
 * La cuenta es un número que cambia, y nada más: sin barra que se vacía, sin
 * color que cambia, sin animación. Bajo `prefers-reduced-motion` no hay nada
 * que apagar porque nada se mueve. `aria-live="polite"` anuncia la cuenta sin
 * interrumpir; `aria-atomic` para que se lea la frase completa.
 *
 * Dos botones `secundario` apilados, mismo peso: ninguna decisión es "la
 * correcta", y darle color de línea a una la señalaría como tal. Los dos
 * pasan los 44 px por el `py-3.5` de `Boton`.
 *
 * La instrucción va en todos los ítems, encima de la cuenta: quien entra al
 * ítem 8 tiene que poder leerla. Completa en el primero; corta en los demás,
 * para no robarle lectura a los 20 s.
 *
 * Las alternativas toman `ALTERNATIVA_BASE` y `CHIP_BASE` sin la capa
 * interactiva: son `div`, no `button`, y no responden al dedo.
 */
export function ItemTriage({ item, indice, total, segundos, titulo, onDecidir }: ItemTriageProps) {
  const { triage } = TEXTOS_ADVANCE;
  const conteo = `${triage.sustantivo} ${indice + 1} de ${total}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6" data-triage-item={item.id}>
      {titulo && (
        <h1 className="mb-3 text-titulo-m text-primary" data-titulo-unidad>
          {titulo}
        </h1>
      )}
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--linea-fondo)] px-2.5 py-1 text-etiqueta uppercase text-[var(--linea-contraste)]">
          {triage.pill}
        </span>
        <span className="num shrink-0 text-etiqueta uppercase text-primary">{conteo}</span>
      </div>
      <div className="mb-6">
        <BarraProgreso valor={indice} total={total} etiqueta={conteo} />
      </div>

      <p className="mb-4 text-cuerpo-m text-primary" data-instruccion={indice === 0 ? "completa" : "corta"}>
        {indice === 0 ? triage.instruccion : triage.instruccionCorta}
      </p>

      {/* La cuenta, sola en su fila: es lo único que cambia. El número va en
          `.num` y las palabras en sans; `aria-label` lleva la frase entera. */}
      <p
        className="mb-6 text-titulo-m text-primary"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={triage.cuenta(segundos)}
        data-cuenta={segundos}
      >
        {triage.cuentaAntes} <span className="num">{segundos}</span> {triage.cuentaDespues}
      </p>

      <div className="space-y-5">
        <div className="text-base font-medium text-primary">
          <TextoEnriquecido contenido={item.enunciado} />
        </div>

        {item.figura && item.figura.tipo === undefined && <PlanoIsometrias figura={item.figura} />}

        <ul className="space-y-2.5" aria-label="Alternativas">
          {item.alternativas.map((alt) => (
            <li key={alt.clave} className={`${ALTERNATIVA_BASE} border border-hairline bg-card`}>
              <span aria-hidden="true" className={`${CHIP_BASE} border border-hairline text-secondary`}>
                {alt.clave}
              </span>
              <span className="min-w-0 flex-1 text-cuerpo-m text-primary">{alt.texto}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2.5" role="group" aria-label="Decisión">
          {DECISIONES.map((decision) => (
            <Boton
              key={decision}
              variante="secundario"
              data-decision={decision}
              onClick={() => onDecidir?.(decision)}
            >
              {triage.decision[decision]}
            </Boton>
          ))}
        </div>
      </div>
    </div>
  );
}
