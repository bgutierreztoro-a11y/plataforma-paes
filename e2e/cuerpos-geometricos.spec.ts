import { test, expect, type Page } from "@playwright/test";
import {
  CUERPOS_DESARROLLO,
  CUERPOS_FUERA_DE_BANDA,
  CUERPOS_SOLIDO,
} from "./fixtures/cuerposGeometricos";

/**
 * Verifica y captura los cuerpos geométricos contra la ruta de previsualización
 * (`app/vista-previa/cuerpos-geometricos/`), que monta los fixtures de
 * `e2e/fixtures/cuerposGeometricos.ts` — ninguna lección declara este bloque
 * todavía, así que no hay otra forma de verlo renderizado.
 *
 * Qué se cuenta y por qué: cada dibujo se identifica por la forma primitiva que
 * le corresponde, sin ensuciar el markup de producción con atributos que solo
 * existirían para el test. Una caja son 3 `<polygon>` (sus caras visibles) y su
 * red son 6; un cilindro es 1 `<ellipse>` (la tapa superior) y su red es
 * 1 `<polygon>` más 2 `<circle>`. Si el componente dibujara la vista que no
 * corresponde, los conteos no calzarían.
 *
 * El caso de los rechazados es el que más importa: un bloque fuera de banda
 * NO puede reventar la página ni dibujarse ilegible — tiene que degradar al
 * recuadro de texto con su descripción, que sigue siendo contenido para el
 * estudiante.
 */

const caso = (page: Page, titulo: string) => page.locator(`[data-caso="${titulo}"]`);

async function capturar(page: Page, nombre: string, proyecto: string) {
  await page.addStyleTag({
    content: "nav[aria-label='Navegación principal'] { display: none !important; }",
  });
  await page.screenshot({
    path: `e2e/capturas/${nombre}-${proyecto}.png`,
    fullPage: true,
    animations: "disabled",
  });
}

/** Forma primitiva esperada por caso, según cuerpo y vista. */
const FORMA: Record<string, { polygon: number; ellipse: number; circle: number }> = {
  paralelepipedo: { polygon: 3, ellipse: 0, circle: 0 },
  cubo: { polygon: 3, ellipse: 0, circle: 0 },
  cilindro: { polygon: 0, ellipse: 1, circle: 0 },
  "paralelepipedo-desarrollo": { polygon: 6, ellipse: 0, circle: 0 },
  "cubo-desarrollo": { polygon: 6, ellipse: 0, circle: 0 },
  "cilindro-desarrollo": { polygon: 1, ellipse: 0, circle: 2 },
};

const clave = (datos: unknown) => {
  const d = datos as { cuerpo: string; vista?: string };
  return d.vista === "desarrollo" ? `${d.cuerpo}-desarrollo` : d.cuerpo;
};

test("los 6 cuerpos en vista sólido se dibujan con sus 3 cotas", async ({ page }, testInfo) => {
  await page.goto("/vista-previa/cuerpos-geometricos");

  for (const { titulo, bloque } of CUERPOS_SOLIDO) {
    const region = caso(page, titulo);
    const esperado = FORMA[clave(bloque.datos)];
    await expect(region.locator("svg"), titulo).toHaveCount(1);
    await expect(region.locator("svg polygon"), titulo).toHaveCount(esperado.polygon);
    await expect(region.locator("svg ellipse"), titulo).toHaveCount(esperado.ellipse);
    // Regla 6 de docs/reglas-modulo.md: no hay modo sin cotas. Una caja lleva
    // sus tres dimensiones rotuladas; un cilindro, radio y altura.
    const cotas = (bloque.datos as { cuerpo: string }).cuerpo === "cilindro" ? 2 : 3;
    await expect(region.locator("svg text"), titulo).toHaveCount(cotas);
  }

  await capturar(page, "10-cuerpos-solido", testInfo.project.name);
});

test("los 6 desarrollos se dibujan desplegados, no armados", async ({ page }, testInfo) => {
  await page.goto("/vista-previa/cuerpos-geometricos");

  for (const { titulo, bloque } of CUERPOS_DESARROLLO) {
    const region = caso(page, titulo);
    const esperado = FORMA[clave(bloque.datos)];
    await expect(region.locator("svg"), titulo).toHaveCount(1);
    await expect(region.locator("svg polygon"), titulo).toHaveCount(esperado.polygon);
    await expect(region.locator("svg circle"), titulo).toHaveCount(esperado.circle);
    // Ninguna red usa elipses: el escorzo es de la vista sólido. Si apareciera
    // una, el componente estaría dibujando el cuerpo armado.
    await expect(region.locator("svg ellipse"), titulo).toHaveCount(0);
  }

  await capturar(page, "11-cuerpos-desarrollo", testInfo.project.name);
});

test("la red del cilindro rotula la circunferencia, no el radio, sobre el manto", async ({
  page,
}) => {
  await page.goto("/vista-previa/cuerpos-geometricos");
  // Que el ancho del manto sea 2πr es el descubrimiento del área de superficie
  // de un cilindro. Si esa cota dijera solo el radio, el dibujo lo escondería.
  const region = caso(page, "Cilindro desplegado · superficie");
  await expect(region.getByText("2π · 5")).toBeVisible();
});

test("un cuerpo fuera de banda degrada al recuadro de texto y no revienta", async ({
  page,
}, testInfo) => {
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));

  await page.goto("/vista-previa/cuerpos-geometricos");

  for (const { titulo, bloque } of CUERPOS_FUERA_DE_BANDA) {
    const region = caso(page, titulo);
    await expect(region.locator("svg"), titulo).toHaveCount(0);
    await expect(region.getByText("Figura"), titulo).toBeVisible();
    // La descripción no es un placeholder: es el contenido que lee el
    // estudiante cuando la figura no se puede dibujar.
    await expect(region.getByText(bloque.descripcion), titulo).toBeVisible();
  }

  expect(errores, `la página lanzó: ${errores.join(" | ")}`).toEqual([]);
  await capturar(page, "12-cuerpos-fuera-de-banda", testInfo.project.name);
});

test("el sólido y su red hablan del mismo cuerpo: comparten las cotas", async ({ page }) => {
  await page.goto("/vista-previa/cuerpos-geometricos");
  // Es lo que garantiza tener un componente único con dos vistas, en vez de dos
  // componentes que podrían divergir sin que nadie se entere.
  for (const dimension of ["12", "6", "8"]) {
    await expect(caso(page, "Paralelepípedo · superficie").getByText(dimension)).toBeVisible();
    await expect(
      caso(page, "Paralelepípedo desplegado · superficie").getByText(dimension),
    ).toBeVisible();
  }
});
