import { registrarEvento } from "@/lib/eventos";
import type { AlternativaCliente } from "@/lib/sanitizar";

/**
 * Capa 1 del feedback: una frase sobre qué pasó con ESTA respuesta, en términos
 * del objeto del problema.
 *
 * Cuando la alternativa trae `feedback` escrito a mano, ese ES el texto — es
 * exactamente lo que la regla de contenido pide para cada distractor, y no se
 * reescribe desde código.
 *
 * El resto de esta función existe por un caso que antes se rompía en silencio:
 * un distractor sin `feedback` producía un recuadro rojo con la frase VACÍA, o
 * sea el peor "Incorrecto" posible, sin siquiera la palabra. El validador solo
 * exige feedback a partir del nivel "revision", así que en borradores el caso es
 * real y hoy llega a Preview.
 *
 * El respaldo nombra las alternativas en juego en vez de dictar un veredicto:
 * es información verdadera y verificable desde el propio ítem, no matemática
 * inventada por código. Un fallback que dijera "Incorrecto" o intentara explicar
 * el error sería, respectivamente, lo prohibido y una invención.
 */
export function capaUno(
  elegida: AlternativaCliente,
  alternativas: AlternativaCliente[],
): string {
  if (elegida.feedback?.trim()) return elegida.feedback;

  const correcta = alternativas.find((a) => a.esCorrecta);
  if (elegida.esCorrecta) return `Elegiste ${elegida.texto}, y es la respuesta correcta.`;
  if (!correcta) return `Elegiste ${elegida.texto}.`;
  return `Elegiste ${elegida.texto}. La respuesta es ${correcta.texto}.`;
}

/**
 * Capa 2: el mecanismo del error, ya resuelto en el servidor contra el
 * `catalogoErrores` del módulo (ver lib/sanitizar.ts). `undefined` cuando el
 * módulo no tiene catálogo propio — hoy, todos los cierres — y entonces la capa
 * se omite entera en vez de mostrarse vacía.
 */
export function capaDos(elegida: AlternativaCliente): string | undefined {
  return elegida.esCorrecta ? undefined : elegida.descripcionError;
}

/**
 * Registra la elección del paso de autoexplicación. `elegida` es null si el
 * estudiante lo saltó.
 *
 * `acerto_su_error` compara la descripción elegida con la que de verdad
 * corresponde a su distractor. Es una señal DISTINTA de haber cometido el
 * error: dice si lo RECONOCE, que es lo que predice si va a poder evitarlo la
 * próxima vez. No afecta el resultado del ítem ni cuenta como intento.
 */
export function registrarAutoexplicacion(
  itemId: string,
  elegida: string | null,
  descripcionReal: string | undefined,
): void {
  if (elegida === null) {
    registrarEvento({ nombre: "autoexplicacion_saltada", props: { item_id: itemId } });
    return;
  }
  registrarEvento({
    nombre: "autoexplicacion_elegida",
    props: { item_id: itemId, acerto_su_error: elegida === descripcionReal },
  });
}
