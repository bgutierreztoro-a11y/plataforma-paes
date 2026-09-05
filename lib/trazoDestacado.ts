/**
 * El trazo de destacador (Fase D): qué negrita deja de ser negrita y pasa a ser
 * una marca hecha con destacador.
 *
 * ## El problema
 *
 * `**…**` está sobrecargado en el contenido. Hace de término clave
 * (`**vértice**`), de notación (`**ⁿ√a**`, `**3⁻²**`), de frase entera
 * (`**Vuelve a leer lo que escribiste ahí.**`) y de rótulo (`**Ejercicio.**`).
 * Son 1.080 marcas en `content/`. Pintarlas todas dejaría páginas rayadas
 * enteras y pondría el destacador encima de matemática, que es justo lo que la
 * fase prohíbe.
 *
 * No hay ninguna señal en `content/` que diga cuál es el término clave, y
 * `content/` no se toca. Así que la selección es una regla del renderer, y es
 * **heurística**. Se dice acá porque quien la lea tiene que saberlo antes de
 * confiar en ella.
 *
 * ## Los cinco criterios
 *
 * 1. Vive en un bloque de párrafo o lista. Tabla y cita quedan fuera: la tabla
 *    ya jerarquiza con su estructura, y la cita ya es el destaque de bloque —
 *    marcar una palabra adentro duplicaría el gesto sobre la misma frase. Ese
 *    criterio lo aplica `TextoEnriquecido`, no este módulo.
 * 2. Es un término y no una frase: ≤ 4 palabras, no termina en `.?!:;` ni
 *    empieza en `¿¡`.
 * 3. No es matemática: ni operadores, dígitos, paréntesis o superíndices, ni
 *    una palabra suelta de ≤ 2 caracteres. `a`, `b`, `r`, `t`, `n` son
 *    variables algebraicas y el regex no puede verlas, porque no traen ningún
 *    símbolo al lado. Es el mismo criterio cerrando ese hueco, no uno nuevo.
 * 4. Se repite: aparece ≥ 2 veces en el archivo de la lección, contando todas
 *    sus apariciones, con negrita o sin ella. Un término clave se repite; una
 *    palabra de paso, no.
 * 5. Es el primero que califica en su bloque. Uno por párrafo, que es lo que
 *    hace una persona con un destacador.
 *
 * ## Qué produce, medido sobre `content/` entero el 2026-09-05
 *
 * 160 trazos · mediana 6 por lección · máximo 14 (`inecuaciones-problemas`).
 * 855 negritas siguen saliendo como `<strong>` pelado. Nueve lecciones quedan
 * sin ningún trazo, y ocho de ellas porque no usan `**…**` en absoluto — el
 * filtro no las vació, ya no tenían énfasis inline.
 *
 * Sin el criterio 4 serían 211 trazos, con ~1 de cada 5 sobre una palabra que
 * no es el término clave. Con el criterio 4 pero sin cerrar el hueco del
 * criterio 3, 183, con 29 sobre letras algebraicas sueltas.
 *
 * ## Lo que no acierta
 *
 * Quedan 3 marcas de 160 sobre palabras funcionales que se repiten
 * (`cualquier`, `misma`, `una`). Sacarlas pedía una lista de palabras vacías
 * escrita a mano, que envejece mal; tres casos no la pagan. Si algún día el
 * contenido puede marcar el término explícitamente, esta heurística entera se
 * reemplaza por esa señal y este módulo se borra.
 */

const ES_MATEMATICA = /[0-9√^⁄∙×÷≤≥≠=+\-−·()[\]/ⁿ⁰¹²³⁴⁵⁶⁷⁸⁹%]/;

/** Criterios 2 y 3: la forma del término, sin mirar el resto de la lección. */
export function esTerminoDestacable(texto: string): boolean {
  const t = texto.trim();
  if (t === "") return false;
  const palabras = t.split(/\s+/);
  if (palabras.length > 4) return false;
  if (/[.?!:;]$/.test(t) || /^[¿¡]/.test(t)) return false;
  if (ES_MATEMATICA.test(t)) return false;
  // Variable algebraica suelta: el criterio 3, para la letra sin operador.
  if (palabras.length === 1 && t.length <= 2) return false;
  return true;
}

/**
 * Letras y dígitos, para decidir dónde empieza y termina una palabra.
 *
 * La frontera se comprueba a mano y no con `\b`: el `\b` de JavaScript es
 * ASCII, así que trataría la tilde de "área" como separador y contaría "rea"
 * como palabra propia. Van las cinco vocales acentuadas, la diéresis y la ñ.
 */
const LETRA_O_DIGITO = /[0-9a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/;

/**
 * Criterio 4: cuántas veces aparece `termino` en `texto`, sin distinguir
 * mayúsculas y respetando la frontera de palabra — "red" no cuenta dentro de
 * "pared", y "Ceros" cuenta como "ceros".
 */
export function vecesQueAparece(texto: string, termino: string): number {
  const heno = texto.toLowerCase();
  const aguja = termino.trim().toLowerCase();
  if (aguja === "") return 0;
  const esLetra = (c: string | undefined) => c !== undefined && LETRA_O_DIGITO.test(c);
  let veces = 0;
  let i = 0;
  while ((i = heno.indexOf(aguja, i)) !== -1) {
    if (!esLetra(heno[i - 1]) && !esLetra(heno[i + aguja.length])) veces += 1;
    i += aguja.length;
  }
  return veces;
}

/**
 * Criterio 5: el término que se lleva el trazo en este bloque, que es el
 * primero que califica.
 *
 * `corpus` es el texto completo de la lección, y solo sirve para el criterio 4.
 * Sin él no hay trazo: es lo que hace que una tabla, una cita o un llamador que
 * no tiene la lección a mano rendericen exactamente igual que antes de la fase.
 */
export function marcaDelBloque(bloque: string, corpus?: string): string | undefined {
  if (corpus === undefined) return undefined;
  const marcas = bloque.match(/\*\*[^*]+\*\*/g) ?? [];
  for (const bruto of marcas) {
    const termino = bruto.slice(2, -2).trim();
    if (!esTerminoDestacable(termino)) continue;
    if (vecesQueAparece(corpus, termino) < 2) continue;
    return termino;
  }
  return undefined;
}

/** El término elegido y si ya se gastó: el trazo es uno por bloque. */
export interface MarcaDeBloque {
  termino: string;
  usado: boolean;
}

/**
 * El corpus de una lección: todo su texto, sin los delimitadores de negrita,
 * para que "vértice" cuente igual venga de `**vértice**` o de "vértice".
 *
 * Recorre el objeto entero y no una lista de campos: el criterio 4 pregunta si
 * el término se repite *en la lección*, y una repetición en el feedback de un
 * distractor o en el texto de una alternativa cuenta tanto como una en la
 * prosa. Enumerar campos habría que mantenerlo cada vez que el schema crece.
 */
export function corpusDeLeccion(leccion: unknown): string {
  const piezas: string[] = [];
  const recorrer = (valor: unknown): void => {
    if (typeof valor === "string") {
      piezas.push(valor);
      return;
    }
    if (Array.isArray(valor)) {
      valor.forEach(recorrer);
      return;
    }
    if (valor !== null && typeof valor === "object") {
      Object.values(valor).forEach(recorrer);
    }
  };
  recorrer(leccion);
  return piezas.join("\n").split("*").join("");
}
