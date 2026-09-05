import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * El trazo de destacador no puede bajar el contraste del texto que destaca:
 * AA o no va.
 *
 * ## Por qué existe este archivo
 *
 * Hoy el proyecto no tiene ningún gate automático de contraste. Los pares
 * medidos viven a mano en comentarios —`app/globals.css` y
 * `components/ui/linea/colores.ts` los documentan con sus cifras— y en
 * `docs/deuda-contraste-etiquetas.md`. Eso funciona mientras nadie toque los
 * valores; el día que alguien suba `--trazo-alfa` para que el trazo "se note
 * más", el comentario sigue diciendo 11,42:1 y la pantalla ya no.
 *
 * Así que este test **lee los tokens del CSS**, no una copia de sus valores.
 * Si alguien cambia un color de eje, el alfa o el fondo de página, la cuenta se
 * rehace sola y el test se cae si el par deja de pasar AA.
 *
 * ## Qué afirma
 *
 * La propiedad, no el decimal: el texto de cuerpo sobre el trazo, en las cuatro
 * líneas y sobre los dos fondos donde puede aparecer, queda en 4,5:1 o más
 * (WCAG 2.1 AA para texto normal). Los números medidos el 2026-09-05 van como
 * referencia en el comentario de la tabla de abajo, no como assert — un assert
 * sobre "11,42" se rompería con un ajuste de tono que no empeora nada.
 */

const CSS = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

/** Lee un token del CSS. Falla ruidoso si el token dejó de existir. */
function token(nombre: string): string {
  const m = new RegExp(`--${nombre}:\\s*([^;]+);`).exec(CSS);
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

/** El trazo compuesto sobre su fondo: `color-mix(in srgb, eje alfa%, transparent)`. */
function componer(
  eje: [number, number, number],
  fondo: [number, number, number],
  alfa: number,
): [number, number, number] {
  return eje.map((c, i) => Math.round(c * alfa + fondo[i] * (1 - alfa))) as [
    number,
    number,
    number,
  ];
}

const AA_TEXTO_NORMAL = 4.5;

const LINEAS = [
  ["01", "Números"],
  ["02", "Álgebra y funciones"],
  ["03", "Geometría"],
  ["04", "Probabilidad y datos"],
] as const;

describe("El trazo de destacador no baja de AA en ninguna línea", () => {
  const alfa = Number(token("trazo-alfa"));
  // El texto de cuerpo es `--color-ink`, que es el que `body` aplica hoy.
  const tinta = hex(token("ink-900"));

  test("el alfa del trazo es un número entre 0 y 1", () => {
    assert.ok(Number.isFinite(alfa) && alfa > 0 && alfa < 1, `--trazo-alfa = ${alfa}`);
  });

  /* Los dos fondos sobre los que el trazo puede aparecer: el de página, que es
     donde vive la prosa de la lección, y la tarjeta blanca. Medido el
     2026-09-05 con --trazo-alfa 0,22 — línea 01 es el peor par en los dos:

       sobre #f8f8fb   01 11,42 · 02 14,98 · 03 12,52 · 04 11,97
       sobre #ffffff   01 12,07 · 02 15,76 · 03 13,24 · 04 12,58

     Sin trazo, el texto sobre el fondo de página da 16,95:1. */
  const FONDOS = [
    ["fondo de página (--color-bg)", hex(token("ink-50"))],
    ["tarjeta (--surface-card)", hex(token("surface-card"))],
  ] as const;

  for (const [id, nombre] of LINEAS) {
    const eje = hex(token(`line-${id}`));
    for (const [dondeVa, fondo] of FONDOS) {
      test(`línea ${id} (${nombre}) sobre ${dondeVa}`, () => {
        const trazo = componer(eje, fondo, alfa);
        const ratio = contraste(tinta, trazo);
        assert.ok(
          ratio >= AA_TEXTO_NORMAL,
          `${ratio.toFixed(2)}:1 está bajo AA (${AA_TEXTO_NORMAL}:1). ` +
            `Bajá --trazo-alfa o cambiá el color de la línea ${id}.`,
        );
      });
    }
  }

  test("el trazo nunca es más oscuro que el texto que destaca", () => {
    // Si el trazo se acercara a la tinta, el término se leería como un bloque
    // tachado en vez de destacado. No es un umbral de WCAG: es la diferencia
    // entre "marcado" y "tapado".
    for (const [id] of LINEAS) {
      const trazo = componer(hex(token(`line-${id}`)), hex(token("ink-50")), alfa);
      assert.ok(
        luminancia(trazo) > luminancia(hex(token("ink-900"))),
        `El trazo de la línea ${id} quedó más oscuro que la tinta`,
      );
    }
  });

  test("fuera de un eje el trazo cae a la tinta del texto", () => {
    // Es la segunda mitad de la regla de color del sistema, y lo que hace que
    // el trazo siga siendo legible en una pantalla sin eje instalado.
    assert.equal(token("trazo-eje"), "var(--text-primary)");
  });
});
