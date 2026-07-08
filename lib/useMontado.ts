import { useEffect, useState } from "react";

/**
 * true solo después de que React hidrató en el cliente. El HTML llega
 * server-renderizado y parece interactivo de inmediato, pero un tap que
 * ocurre antes de hidratar no tiene ningún listener de React que lo reciba:
 * el navegador lo procesa nativamente por un instante y luego se pierde
 * cuando React reconcilia contra su propio estado. Este hook evita ofrecer
 * esa interacción antes de que exista de verdad.
 *
 * Nota: una versión anterior usaba useSyncExternalStore con un subscribe
 * "noop" para evitar el setState-en-efecto — pero sin una notificación real
 * no hay ningún disparador que vuelva a evaluar getSnapshot() después de la
 * hidratación, así que el valor quedaba atascado en false para siempre
 * (bug real, reportado en un dispositivo real). El patrón useState+useEffect
 * es el correcto para "detectar que ya montó en el cliente": se ejecuta
 * exactamente una vez, sin cascada de renders.
 */
export function useMontado(): boolean {
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flag de montaje de una sola vez, intencional
    setMontado(true);
  }, []);
  return montado;
}
