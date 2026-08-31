import type { RespuestaRegistrada } from "@/lib/estadoSetItems";
import type { ItemCliente } from "@/lib/sanitizar";

export interface GrupoDeError {
  /** El id tal como viene del contenido: "error-5". Es una referencia, no una frase. */
  id: string;
  /**
   * El texto del error, ya resuelto en el servidor por `lib/sanitizar.ts:122-145`
   * contra el `catalogoErrores` del propio archivo de cierre.
   *
   * Opcional porque puede faltar de verdad: 5 de los 11 cierres etiquetan sus
   * distractores con `errorCatalogado` pero no traen `catalogoErrores` propio,
   * así que la resolución no encuentra entrada y omite la descripción en
   * silencio (`lib/sanitizar.ts:137-138`). Es la deuda registrada en
   * docs/deuda-catalogo-errores-crossfile.md. Ahí el grupo existe —el id es
   * real— pero no hay texto que mostrar, y eso se pinta, no se inventa.
   */
  descripcion?: string;
  /** Posición del ítem dentro del cierre, en base 1: lo que el estudiante ve. */
  numerosDeItem: number[];
}

/**
 * Los errores catalogados que el estudiante cometió en esta corrida del cierre,
 * agrupados por id y en el orden en que aparecieron.
 *
 * Trabaja **solo con el estado de la sesión** —los ítems que el servidor mandó y
 * las respuestas del reducer de `lib/estadoSetItems.ts`, que arranca vacío en
 * cada corrida—. No lee `localStorage` ni ninguna otra fuente persistida: la
 * pantalla habla de lo que acaba de pasar, no del historial. Por eso tampoco
 * puede decir "te ha pasado N veces", y no lo dice.
 *
 * Un fallo cuyo distractor no lleva `errorCatalogado` **no entra en ningún
 * grupo**: no hay id que mostrar y rotularlo exigiría inventar una categoría que
 * el contenido no declaró. No se pierde de vista —la franja de ítems sigue
 * marcando ese ítem como incorrecto—, simplemente no tiene nombre. Es lo
 * habitual: en `cierre-funcion-cuadratica`, por ejemplo, solo 6 de 24
 * distractores están etiquetados.
 */
export function agruparErroresDelCierre(
  items: ItemCliente[],
  respuestas: RespuestaRegistrada[],
): GrupoDeError[] {
  const posicionDeItem = new Map(items.map((item, i) => [item.id, i + 1]));
  const grupos = new Map<string, GrupoDeError>();

  for (const respuesta of respuestas) {
    if (respuesta.correcta) continue;

    const numero = posicionDeItem.get(respuesta.itemId);
    const item = items.find((i) => i.id === respuesta.itemId);
    if (numero === undefined || !item) continue;

    const elegida = item.alternativas.find((a) => a.clave === respuesta.claveElegida);
    const id = elegida?.errorCatalogado;
    if (!id) continue;

    const grupo = grupos.get(id);
    if (grupo) {
      /* Un mismo error puede repetirse en el mismo ítem si se rehiciera; el
         número se lista una vez. */
      if (!grupo.numerosDeItem.includes(numero)) grupo.numerosDeItem.push(numero);
      /* La descripción puede llegar en una aparición y no en otra solo si el
         contenido fuera incoherente; se conserva la primera que exista en vez
         de sobrescribirla con undefined. */
      if (grupo.descripcion === undefined) grupo.descripcion = elegida?.descripcionError;
    } else {
      grupos.set(id, {
        id,
        descripcion: elegida?.descripcionError,
        numerosDeItem: [numero],
      });
    }
  }

  return [...grupos.values()];
}
