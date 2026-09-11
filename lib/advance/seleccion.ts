import { mezclarAlternativas, mezclarArray } from "../mezclar.ts";
import type { AlternativaAdvance, ItemAdvance } from "./descarte.ts";

/**
 * Armado de una sesión de descarte (docs/fobos-advance.md §2.1): `n` ítems al
 * azar del banco, sin repetir, cada uno con sus alternativas mezcladas.
 *
 * La letra visible se reasigna por posición (`mezclarAlternativas`, como en
 * todo el producto) y `claveOriginal` conserva la del JSON: es la que va al
 * registro y a los eventos, porque una letra aleatoria no sirve para analizar.
 * `lib/mezclar.ts` no se toca: la conservación se hace acá, antes de mezclar.
 *
 * Pura. `aleatorio` se inyecta para poder testear; en la ruta es `Math.random`.
 */
export function seleccionarSesion(
  items: ItemAdvance[],
  n: number,
  aleatorio: () => number = Math.random,
): ItemAdvance[] {
  const cuantos = Math.max(0, Math.min(n, items.length));
  return mezclarArrayCon(items, aleatorio)
    .slice(0, cuantos)
    .map((item) => ({ ...item, alternativas: mezclarAlternativasCon(item.alternativas, aleatorio) }));
}

/* `mezclarArray`/`mezclarAlternativas` usan `Math.random` por dentro y no
   admiten inyección. Para el caso real se usan tal cual; con un `aleatorio`
   distinto se aplica el mismo Fisher-Yates acá, para que el test sea
   determinista sin tocar lib/mezclar.ts. */
function mezclarArrayCon<T>(original: T[], aleatorio: () => number): T[] {
  if (aleatorio === Math.random) return mezclarArray(original);
  const copia = [...original];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const CLAVES = ["A", "B", "C", "D"] as const;

function mezclarAlternativasCon(
  alternativas: AlternativaAdvance[],
  aleatorio: () => number,
): AlternativaAdvance[] {
  const conOriginal = alternativas.map((a) => ({ ...a, claveOriginal: a.clave }));
  if (aleatorio === Math.random) return mezclarAlternativas(conOriginal);
  return mezclarArrayCon(conOriginal, aleatorio).map((alt, i) => ({ ...alt, clave: CLAVES[i] }));
}
