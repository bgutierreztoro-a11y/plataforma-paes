import posthog from "posthog-js";
import type { EstadoNodo } from "@/lib/estadoNodo";

export type Evento =
  | { nombre: "leccion_inicio"; props: { leccion_id: string } }
  | { nombre: "paso_inicio"; props: { paso: number; leccion_id: string } }
  | {
      nombre: "item_respuesta";
      props: { item_id: string; correcta: boolean; intento: number; tiempo_ms: number };
    }
  | { nombre: "pista_usada"; props: { paso: number } }
  | { nombre: "leccion_fin"; props: { leccion_id: string } }
  | { nombre: "solicitud_siguiente_leccion"; props: { leccion_id: string } }
  /* ---------- rediseño del camino (2026-07-27) ---------- */
  /* Qué rama de PuntoDePartida.tsx vio el estudiante — la primera pantalla
     que abre todo el mundo, y hasta esta sesión la única sin instrumentar.
     No incluye la quinta rama ("el camino todavía no abre"): no es una de
     las cuatro pedidas y hoy es inalcanzable. */
  | {
      nombre: "portada_vista";
      props: { rama: "empezar" | "continuar" | "repasar" | "todo_al_dia" };
    }
  | { nombre: "camino_visto"; props: { temas_visibles: number; temas_completados: number } }
  | { nombre: "nodo_tema_abierto"; props: { tema_id: string; estado: EstadoNodo } }
  | { nombre: "nodo_leccion_abierto"; props: { leccion_id: string; estado: EstadoNodo } }
  | {
      nombre: "leccion_terminada";
      props: { leccion_id: string; aciertos: number; total: number; sobre_umbral: boolean };
    }
  /* Las tres opciones de ItemsPAESFinal.tsx (avanzar, repasar, repetir el
     cierre) son siempre una decisión real, en las dos ramas del umbral. */
  | { nombre: "repaso_elegido"; props: { leccion_id: string } }
  | { nombre: "camino_elegido"; props: { leccion_id: string } }
  /* Tercera opción de ItemsPAESFinal.tsx: repetir solo el cierre (itemsPAES)
     sin rehacer los 10 pasos. Mismo criterio que repaso_elegido/camino_elegido:
     cada decisión real de esta pantalla se mide. */
  | { nombre: "cierre_repetido_elegido"; props: { leccion_id: string } }
  | { nombre: "tema_celebrado"; props: { tema_id: string } }
  /* Cuánto interés hay en el resto del temario. Desde la agrupación por ejes
     (2026-07-31) lo que se pliega es un eje y no "el resto" en bloque, así que
     el evento dice cuál: sin `eje_id`, cuatro bandas distintas producirían el
     mismo dato y no se sabría si el interés está en Geometría o en
     Probabilidad. Se conserva el nombre en vez de inventar uno nuevo — es el
     mismo gesto sobre la misma pregunta, y renombrarlo cortaría la serie. */
  | { nombre: "temas_plegados_expandidos"; props: { eje_id: string } };

/**
 * Envía a PostHog solo si hay clave configurada; siempre loguea a consola en
 * desarrollo, haya o no clave, para que el disparo de cada evento sea
 * demostrable sin depender de tener PostHog configurado.
 */
export function registrarEvento(evento: Evento): void {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(evento.nombre, evento.props);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${evento.nombre}`, evento.props);
  }
}
