import posthog from "posthog-js";

export type Evento =
  | { nombre: "leccion_inicio"; props: { leccion_id: string } }
  | { nombre: "paso_inicio"; props: { paso: number; leccion_id: string } }
  | {
      nombre: "item_respuesta";
      props: { item_id: string; correcta: boolean; intento: number; tiempo_ms: number };
    }
  | { nombre: "pista_usada"; props: { paso: number } }
  | { nombre: "leccion_fin"; props: { leccion_id: string } }
  | { nombre: "solicitud_siguiente_leccion"; props: { leccion_id: string } };

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
