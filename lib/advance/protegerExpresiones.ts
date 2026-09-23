/**
 * Une con espacio duro (U+00A0) los espacios de cada expresión para que a
 * 390 px una línea no se parta entre operador y término ("3 · (x" / "+ y)").
 *
 * Solo Advance: se aplica en `itemParaCliente` (banco.ts) sobre los cinco
 * campos de texto del banco. No toca `lib/markdownSimple.tsx` ni las
 * lecciones: el texto llega al renderizador ya protegido.
 *
 * Reglas (firmadas 2026-09-17, D1-D7):
 * - `× ÷ ·`: U+00A0 a los dos lados siempre, aunque los operandos sean
 *   palabras ("comensales × porción").
 * - `+ −` (− = U+2212; el guion ASCII de la prosa no cuenta): U+00A0 a los
 *   dos lados solo con operando a ambos.
 * - Relación (`= ≤ ≥ < > ≠`): U+00A0 antes y espacio normal después, con
 *   operando a la izquierda; así una cadena larga parte tras la relación.
 * - Operando: dígito, superíndice, π, `|`, `$`, `√`, paréntesis, `%`, `′`,
 *   o una corrida de 1 o 2 letras que no sea una palabra de la lista
 *   (`mn`, `uv` sí; "es − dos" y "de + la" no).
 * - Número y unidad (2026-09-23, Unidad 14): U+00A0 entre un número (o π,
 *   un superíndice o un paréntesis que cierra) y una unidad de longitud, área
 *   o volumen (mm, cm, dm, m, km, u, con ² o ³), para que "3√2 cm" o "2,5 m"
 *   no dejen la unidad sola al comienzo de la línea siguiente. La unidad es
 *   una palabra entera: "5 mide" no cambia.
 * - Tabla (línea que empieza y termina con `|`): intacta, una celda con
 *   espacio duro podría desbordar su columna. "|x − 3| + 2" no es tabla.
 * - Lista (`- `): el marcador queda y el contenido se protege.
 * - Idempotente: las regex exigen U+0020 literal.
 */
const NBSP = "\u00A0";
/* Palabras de 1-2 letras que no son variables, aunque estén junto a un signo. */
const PALABRAS = "es|de|el|la|lo|un|se|si|no|en|al|su|ni|ya|mi|tu|ha|os";
const LETRAS = `(?<![a-z])(?!(?:${PALABRAS})(?![a-z]))[a-z]{1,2}(?![a-z])`;
const IZQ = `(?<=[0-9⁰¹²³⁴⁵⁶⁷⁸⁹ⁿπ|)%′]|${LETRAS})`;
const DER = `(?=[0-9$√π|(]|${LETRAS})`;
const RE_MULTIPLICACION = / ([×÷·]) /g;
const RE_SUMA_RESTA = new RegExp(`${IZQ} ([+−]) ${DER}`, "gi");
const RE_RELACION = new RegExp(`${IZQ} ([=≤≥<>≠])(?= )`, "gi");
const RE_UNIDAD = /(?<=[0-9²³π)]) (?=(?:mm|cm|dm|km|m|u)[²³]?(?![\p{L}\p{N}]))/gu;

function protegerLinea(linea: string): string {
  return linea
    .replace(RE_MULTIPLICACION, `${NBSP}$1${NBSP}`)
    .replace(RE_SUMA_RESTA, `${NBSP}$1${NBSP}`)
    .replace(RE_RELACION, `${NBSP}$1`)
    .replace(RE_UNIDAD, NBSP);
}

export function protegerExpresiones(texto: string): string {
  return texto
    .split("\n")
    .map((linea) => {
      const t = linea.trimStart();
      if (t.startsWith("|") && t.trimEnd().endsWith("|")) return linea;
      if (t.startsWith("- ")) {
        const inicio = linea.indexOf("- ") + 2;
        return linea.slice(0, inicio) + protegerLinea(linea.slice(inicio));
      }
      return protegerLinea(linea);
    })
    .join("\n");
}
