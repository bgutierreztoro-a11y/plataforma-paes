import { redirect } from "next/navigation";

/**
 * `/inicio` fue el punto de partida mientras `/` era un hero de venta. Con la
 * portada unificada las dos pantallas hacían la misma pregunta, así que esta
 * redirige a la única que queda.
 *
 * **La ruta no se borra.** `app/layout.tsx` la usa en `signInFallbackRedirectUrl`
 * y `signUpFallbackRedirectUrl` de Clerk: borrarla dejaría en un 404 a quien
 * acaba de registrarse, que es el peor momento posible para romperle el flujo.
 * Cambiar esas dos constantes en vez de esto tampoco alcanzaría — el destino
 * también puede venir de un enlace guardado o del historial de quien ya usaba
 * la plataforma antes de este cambio.
 */
export default function Inicio() {
  redirect("/");
}
