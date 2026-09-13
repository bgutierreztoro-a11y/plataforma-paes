"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ItemTriage } from "@/components/advance/ItemTriage";
import type { ItemAdvance } from "@/lib/advance/descarte";
import {
  LIMITE_MS,
  payloadTriageDecision,
  registroDecision,
  registroSinDecision,
  type Decision,
  type PayloadTriageDecision,
  type RegistroTriage,
} from "@/lib/advance/triage";

interface EjecutorTriageProps {
  items: ItemAdvance[];
  /* Título de la unidad (nombre técnico DEMRE). Opcional solo para la galería. */
  titulo?: string;
  renderFinal: (registros: RegistroTriage[]) => ReactNode;
  /* Analítica: una vez por ítem decidido, incluido el tiempo agotado. El
     payload sale de lib/advance/triage.ts y quien lo envía es la ruta; la
     galería monta el ejecutor sin callbacks y no emite nada. */
  alDecidir?: (payload: PayloadTriageDecision) => void;
  /* Persistencia (D15). Los registros completos de la sesión, una vez, al
     decidir el último ítem. La galería no lo pasa y no envía nada. */
  alCerrarSesion?: (registros: RegistroTriage[]) => void;
}

const SEGUNDOS = LIMITE_MS / 1000;
/* Cadencia del reloj. Menor que un segundo para que el número cambie cerca del
   instante real; el valor mostrado se calcula desde `performance.now()` y no
   contando ticks, así que una pestaña en segundo plano no atrasa la cuenta. */
const TICK_MS = 250;

/**
 * Una sesión de triage: un ítem por pantalla, 20 segundos cada uno, y al
 * final `renderFinal` con el registro de cada decisión (§6.5).
 *
 * Toma de `EjecutorDescarte` la estructura (índice, registros acumulados,
 * `renderFinal`, callbacks opcionales, reloj en `performance.now()` tomado en
 * el inicializador de estado). Lo que cambia es el reloj: acá corre solo, y
 * al llegar a 0 registra `sin-decision` con `ms = 20000` (D16) y avanza.
 *
 * `cerrado` es un ref y no un estado: un toque y el tick del reloj pueden
 * caer en el mismo instante, y el segundo tiene que encontrar el ítem ya
 * cerrado sin esperar un render. Un toque después de los 20 s (el tick
 * todavía no llegó) cuenta como tiempo agotado, no como decisión: la regla es
 * el límite, no la cadencia del reloj.
 */
export function EjecutorTriage({ items, titulo, renderFinal, alDecidir, alCerrarSesion }: EjecutorTriageProps) {
  const [indice, setIndice] = useState(0);
  const [registros, setRegistros] = useState<RegistroTriage[]>([]);
  const [inicioMs, setInicioMs] = useState(() => performance.now());
  const [segundos, setSegundos] = useState(SEGUNDOS);
  const cerrado = useRef(false);

  const terminado = indice >= items.length;

  function avanzar(registro: RegistroTriage) {
    if (cerrado.current) return;
    cerrado.current = true;
    const acumulados = [...registros, registro];
    setRegistros(acumulados);
    alDecidir?.(payloadTriageDecision(registro));
    if (indice === items.length - 1) {
      alCerrarSesion?.(acumulados);
      setIndice(items.length);
      return;
    }
    cerrado.current = false;
    setInicioMs(performance.now());
    setSegundos(SEGUNDOS);
    setIndice(indice + 1);
  }

  function decidir(decision: Exclude<Decision, "sin-decision">) {
    const enMs = performance.now();
    if (enMs - inicioMs >= LIMITE_MS) {
      avanzar(registroSinDecision(items[indice]));
      return;
    }
    avanzar(registroDecision(items[indice], decision, inicioMs, enMs));
  }

  /* Un reloj por ítem: el efecto se rehace con `indice` e `inicioMs`, así que
     las clausuras de adentro son las del ítem en pantalla. StrictMode lo monta
     dos veces en desarrollo; la limpieza deja uno solo. */
  useEffect(() => {
    if (terminado) return;
    const id = setInterval(() => {
      const restante = Math.max(0, Math.ceil((LIMITE_MS - (performance.now() - inicioMs)) / 1000));
      setSegundos(restante);
      if (restante === 0) {
        clearInterval(id);
        avanzar(registroSinDecision(items[indice]));
      }
    }, TICK_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un reloj por ítem
  }, [indice, inicioMs, terminado]);

  if (terminado) {
    return <>{renderFinal(registros)}</>;
  }

  return (
    <ItemTriage
      item={items[indice]}
      indice={indice}
      total={items.length}
      segundos={segundos}
      titulo={titulo}
      onDecidir={decidir}
    />
  );
}
