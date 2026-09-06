import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * La silueta del sello de estación tiene que verse en las cuatro líneas.
 *
 * ## Por qué existe este archivo
 *
 * Porque una de las cuatro no se ve. `--line-02` (#FFB600) sobre el fondo de
 * página da **1,66:1**, muy por debajo del 3:1 que WCAG 2.1 §1.4.11 pide para
 * un gráfico — y la 02 es *álgebra y funciones*, o sea el eje del módulo v1: un
 * sello pintado en `--linea` crudo sería invisible justo en la pantalla donde
 * más se mira.
 *
 * Por eso `SelloDeEstacion` pinta su silueta con `--linea-nav` y no con
 * `--linea`. Este test es lo que impide que alguien "simplifique" esa distinción
 * más adelante sin darse cuenta de lo que apaga.
 *
 * ## Qué lee
 *
 * Los tokens de `app/globals.css` **y** el mapa `NAV_POR_LINEA` de
 * `components/ui/linea/colores.ts`, los dos como texto. No una copia de sus
 * valores: si alguien cambia el color de un eje, el fondo de página, o le
 * devuelve la 02 al color de línea crudo, la cuenta se rehace sola y el test se
 * cae. Se leen como texto y no se importan porque `node --test` sobre estos
 * archivos no resuelve el alias `@/` ni compila TSX.
 *
 * ## Qué afirma
 *
 * La propiedad, no el decimal: la silueta del sello queda en 3:1 o más sobre los
 * dos fondos donde la pieza puede aparecer, en las cuatro líneas. Los números
 * medidos el 2026-09-05 van de referencia en los comentarios, no como assert.
 */

const RAIZ = process.cwd();
const CSS = readFileSync(path.join(RAIZ, "app", "globals.css"), "utf8");
const COLORES = readFileSync(
  path.join(RAIZ, "components", "ui", "linea", "colores.ts"),
  "utf8",
);

/* Lee un token del CSS. Falla ruidoso si el token dejó de existir.

   Anclado a principio de línea (`^\s*`), a diferencia del de
   `contrasteTrazo.test.ts`: los comentarios de `globals.css` citan tokens dentro
   de la prosa —`--text-primary: #16181D` aparece dentro de una frase en la
   línea 9— y sin el ancla la primera coincidencia era esa, con el resto del
   párrafo de "valor". */
function token(nombre: string): string {
  const m = new RegExp(`^\\s*--${nombre}:\\s*([^;]+);`, "m").exec(CSS);
  assert.ok(m, `El token --${nombre} ya no está en app/globals.css`);
  return m[1].trim();
}

function hex(valor: string): [number, number, number] {
  const h = valor.replace("#", "").trim();
  assert.match(h, /^[0-9a-fA-F]{6}$/, `No es un hex de 6 dígitos: ${valor}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Luminancia relativa, WCAG 2.1 §relative luminance. */
function luminancia([r, g, b]: [number, number, number]): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [luminancia(a), luminancia(b)];
  const [alto, bajo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (alto + 0.05) / (bajo + 0.05);
}

/**
 * Qué color termina siendo un mapa de `colores.ts` en una línea dada, leyendo el
 * mapa real en vez de repetirlo acá.
 *
 * Las formas que los mapas usan hoy: `var(--linea)` —que es el color de la
 * propia línea, ver `estiloDeLinea()`— y un token directo (`var(--text-primary)`,
 * `var(--line-01-oscura)`, `var(--line-03-tint)`…). Cualquier tercera forma cae
 * en el `assert` de abajo en vez de pasar en silencio.
 */
function colorDeMapa(mapa: string, id: string): [number, number, number] {
  const cuerpo = new RegExp(`const ${mapa}[^{]*\\{([^}]*)\\}`).exec(COLORES);
  assert.ok(cuerpo, `${mapa} ya no está en components/ui/linea/colores.ts`);
  const entrada = new RegExp(`"${id}":\\s*"var\\(--([a-z0-9-]+)\\)"`).exec(cuerpo[1]);
  assert.ok(entrada, `${mapa} ya no tiene entrada para la línea ${id}`);
  const nombre = entrada[1];
  return hex(token(nombre === "linea" ? `line-${id}` : nombre));
}

/** La silueta: los dos anillos y el tramo. */
const siluetaDeLinea = (id: string) => colorDeMapa("NAV_POR_LINEA", id);
/** El núcleo: el campo teñido sobre el que se traza el visto. */
const nucleoDeLinea = (id: string) => colorDeMapa("TINTE_POR_LINEA", id);
/** El visto: la marca que separa un estado del otro. */
const vistoDeLinea = (id: string) => colorDeMapa("SOBRE_TINTE_POR_LINEA", id);

/* WCAG 2.1 §1.4.11 (non-text contrast): un componente gráfico necesita 3:1
   contra lo que lo rodea. El sello va `aria-hidden` y es decoración —los datos
   están en las dos tarjetas y en el título—, así que técnicamente 1.4.11 no lo
   obliga. Se sostiene igual: una pieza que existe para marcar un momento y no
   se ve no marca nada. */
const NO_TEXTO = 3;

const LINEAS = [
  ["01", "Números"],
  ["02", "Álgebra y funciones"],
  ["03", "Geometría"],
  ["04", "Probabilidad y datos"],
] as const;

describe("El sello de estación se ve en las cuatro líneas", () => {
  /* Los dos fondos sobre los que la pieza puede aparecer. Hoy solo el de página
     —el cierre de lección no monta la pieza dentro de una tarjeta—, pero la
     galería `/_design` la muestra sobre los dos y nada impide que un cierre
     futuro la meta en una `Tarjeta`.

     Medido el 2026-09-05, silueta en `--linea-nav` sobre el fondo de página:

       01  4,57   02  16,75 (cae a tinta)   03  4,54   04  6,48

     Con `--linea` crudo, que es lo que la pieza NO usa, la 02 daría 1,66. */
  const FONDOS = [
    ["fondo de página (--color-bg)", hex(token("ink-50"))],
    ["tarjeta (--surface-card)", hex(token("surface-card"))],
  ] as const;

  for (const [id, nombre] of LINEAS) {
    const silueta = siluetaDeLinea(id);
    for (const [dondeVa, fondo] of FONDOS) {
      test(`línea ${id} (${nombre}): la silueta sobre ${dondeVa}`, () => {
        const ratio = contraste(silueta, fondo);
        assert.ok(
          ratio >= NO_TEXTO,
          `${ratio.toFixed(2)}:1 está bajo ${NO_TEXTO}:1. ` +
            `La silueta del sello sale de NAV_POR_LINEA en colores.ts.`,
        );
      });
    }
  }

  test("la 02 no pinta su silueta con el amarillo", () => {
    /* El caso que motiva todo el archivo, afirmado directo: si alguien devuelve
       la 02 a `var(--linea)` el test de arriba se cae, pero este dice por qué. */
    const amarillo = hex(token("line-02"));
    const fondo = hex(token("ink-50"));
    assert.ok(
      contraste(amarillo, fondo) < NO_TEXTO,
      "El amarillo de la 02 ya pasa 3:1 sobre el fondo: revisar si esta separación sigue haciendo falta",
    );
    assert.notDeepEqual(
      siluetaDeLinea("02"),
      amarillo,
      "La silueta de la línea 02 volvió al color de línea y quedaría invisible",
    );
  });

  test("el núcleo es el campo teñido del eje y el visto se pinta encima", () => {
    /* **Este assert cambió de color a propósito el 2026-09-05, con el visto.**
       Antes exigía `var(--linea)` en el núcleo: el disco era masa sólida del eje,
       la estación `pasada` de `Estacion.tsx`, y lo que separaba un estado del
       otro era la **presencia** del disco, no su contraste.

       Con el visto ese reparto ya no sirve. Un tic pintado sobre `--linea` crudo
       necesita contrastar contra él, y no hay color que lo logre en las cuatro
       líneas: en blanco daría 1,66:1 sobre el amarillo de la 02 —el mismo bug que
       este archivo existe para prevenir, movido un nivel adentro— y en
       `--linea-nav` se fundiría con el núcleo en la 01, la 03 y la 04, donde
       `--linea-nav` ES `--linea`.

       Así que el núcleo baja a `--linea-tinte` y el visto va en
       `--linea-sobre-tinte`: el par que `colores.ts:156-185` ya tiene calibrado
       para "texto sobre el tinte de su propia línea". Lo que separa un estado del
       otro pasó a ser el visto; el disco es el campo donde se lee, y quien
       sostiene la pieza contra el fondo sigue siendo el anillo — el núcleo solo
       da 1,02 a 1,19 contra la página, y no hace falta que dé más.

       La identidad del eje se conserva, teñida en vez de saturada. El costo está
       escrito en el docblock del componente: la estación sellada ya no se ve
       igual que en el riel de /camino. */
    const componente = readFileSync(
      path.join(RAIZ, "components", "ui", "linea", "SelloDeEstacion.tsx"),
      "utf8",
    );

    const nucleo = /r=\{R_NUCLEO\}[\s\S]{0,120}?fill="var\(--([a-z-]+)\)"/.exec(componente);
    assert.ok(nucleo, "El núcleo del sello ya no declara su relleno como se esperaba");
    assert.equal(
      nucleo[1],
      "linea-tinte",
      "El núcleo dejó de llevar el tinte del eje: el visto se queda sin campo calibrado",
    );

    const visto = /d=\{VISTO\}[\s\S]{0,160}?stroke="var\(--([a-z-]+)\)"/.exec(componente);
    assert.ok(visto, "El visto del sello ya no declara su trazo como se esperaba");
    assert.equal(
      visto[1],
      "linea-sobre-tinte",
      "El visto dejó de usar el color calibrado contra el tinte",
    );
  });

  /* El par nuevo que el visto introduce. Los dos salen de sus mapas en
     `colores.ts`, así que si alguien recalibra un tinte o le devuelve la 02 al
     amarillo, la cuenta se rehace sola y esto se cae.

     Medido el 2026-09-05, visto sobre núcleo:

       01  4,90   02  16,50 (el visto cae a tinta)   03  5,58   04  5,84

     Son los mismos números de la tabla de `colores.ts:164`, que es de donde sale
     el par: acá se afirman para el sello, que es un gráfico y no texto. */
  for (const [id, nombre] of LINEAS) {
    test(`línea ${id} (${nombre}): el visto sobre el núcleo`, () => {
      const ratio = contraste(vistoDeLinea(id), nucleoDeLinea(id));
      assert.ok(
        ratio >= NO_TEXTO,
        `${ratio.toFixed(2)}:1 está bajo ${NO_TEXTO}:1. ` +
          `El visto sale de SOBRE_TINTE_POR_LINEA y el núcleo de TINTE_POR_LINEA, ` +
          `los dos en colores.ts.`,
      );
    });
  }
});
