import { test, expect, type Page } from "@playwright/test";

/**
 * Verifica y captura `objeto: "parabola"` del bloque interactivo contra la ruta
 * de previsualización (`app/vista-previa/interactivo-parabola/`), que monta los
 * fixtures de `e2e/fixtures/bloqueParabola.ts` — ninguna lección declara este
 * objeto todavía, así que no hay otra forma de verlo renderizado.
 *
 * Los marcadores de vértice y ceros son los únicos `<circle>` del plano (la
 * rejilla son `<line>` y los rótulos `<text>`), así que contarlos es la forma
 * más directa de comprobar qué se dibujó, sin ensuciar el markup de producción
 * con atributos que solo existirían para el test.
 */

const conMarcas = (page: Page) => page.getByRole("region", { name: "Parábola con vértice y ceros" });
const sinMarcas = (page: Page) => page.getByRole("region", { name: "Parábola sin marcas" });

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

test("dibuja la curva y, con los flags puestos, el vértice y los dos ceros", async ({
  page,
}, testInfo) => {
  await page.goto("/vista-previa/interactivo-parabola");

  // y = x² - 4 de partida: vértice en (0, -4) y ceros en -2 y 2.
  const region = conMarcas(page);
  await expect(region.locator("svg polyline")).toHaveCount(1);
  await expect(region.locator("svg circle")).toHaveCount(3);
  await expect(region.getByText("(0 ; -4)")).toBeVisible();

  await capturar(page, "9-parabola-con-marcas", testInfo.project.name);
});

test("sin los flags no se dibuja ni vértice ni ceros, aunque la curva los tenga", async ({
  page,
}) => {
  await page.goto("/vista-previa/interactivo-parabola");

  /* y = x² + 2x - 3 tiene vértice en (-1, -4) y ceros en -3 y 1: hay qué marcar,
     y no se marca. Es la prueba de que las marcas dependen del flag del
     contenido y no de que existan. */
  const region = sinMarcas(page);
  await expect(region.locator("svg polyline")).toHaveCount(1);
  await expect(region.locator("svg circle")).toHaveCount(0);
});

test("mover a cambia la ecuación que se muestra", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-parabola");
  const region = conMarcas(page);

  await expect(region.getByText("y =").first()).toBeVisible();
  await expect(region.locator("p", { hasText: "Ecuación actual" })).toContainText("y = 1 x cuadrado");

  const a = region.getByRole("slider", { name: "Coeficiente cuadrático (a)" });
  await a.focus();
  await page.keyboard.press("ArrowLeft"); // paso 0,5 → a = 0,5

  await expect(region.locator("p", { hasText: "Ecuación actual" })).toContainText("y = 0,5 x cuadrado");
});

test("con a = 0 no hay parábola: desaparece el marcador de vértice", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-parabola");
  const region = conMarcas(page);

  await expect(region.locator("svg circle")).toHaveCount(3);

  const a = region.getByRole("slider", { name: "Coeficiente cuadrático (a)" });
  await a.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft"); // 1 → 0,5 → 0

  /* y = -4 es una recta constante: no tiene vértice ni corta el eje x. Los tres
     marcadores se van, y la curva se sigue dibujando. */
  await expect(region.locator("p", { hasText: "Ecuación actual" })).toContainText("y = 0 x cuadrado");
  await expect(region.locator("svg circle")).toHaveCount(0);
  await expect(region.locator("svg polyline")).toHaveCount(1);
});

test("los controles no editables se ven pero no se mueven", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-parabola");
  const region = conMarcas(page);

  await expect(region.getByRole("slider", { name: /Coeficiente lineal \(b\)/ })).toBeDisabled();
  await expect(region.getByRole("slider", { name: /Término libre \(c\)/ })).toBeDisabled();
  await expect(region.getByRole("slider", { name: "Coeficiente cuadrático (a)" })).toBeEnabled();
});

test("el umbral de exploración libera el avance al tercer valor distinto", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-parabola");
  const region = conMarcas(page);
  const estado = page.getByText(/Exploración (pendiente|completa)/);

  await expect(estado).toHaveText("Exploración pendiente");

  const a = region.getByRole("slider", { name: "Coeficiente cuadrático (a)" });
  await a.focus();

  /* El valor inicial ya cuenta como visto, así que faltan dos valores nuevos.
     Con uno solo todavía no se libera: es lo que distingue "contar valores
     distintos" de "contar movimientos". */
  await page.keyboard.press("ArrowLeft");
  await expect(estado).toHaveText("Exploración pendiente");

  // Ir y volver entre dos posiciones ya vistas tampoco suma.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(estado).toHaveText("Exploración pendiente");

  await page.keyboard.press("ArrowLeft");
  await expect(estado).toHaveText("Exploración completa");
});

test("'Volver a empezar' reinicia los tres controles", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-parabola");
  const region = sinMarcas(page);
  const reiniciar = region.getByRole("button", { name: "Volver a empezar" });

  await expect(reiniciar).toBeDisabled();

  await region.getByRole("slider", { name: "Coeficiente cuadrático (a)" }).focus();
  await page.keyboard.press("ArrowLeft");
  await region.getByRole("slider", { name: /Término libre \(c\)/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(region.locator("p", { hasText: "Ecuación actual" })).toContainText(
    "y = 0,5 x cuadrado + 2 x − 2",
  );
  await expect(reiniciar).toBeEnabled();

  await reiniciar.click();
  await expect(region.locator("p", { hasText: "Ecuación actual" })).toContainText(
    "y = 1 x cuadrado + 2 x − 3",
  );
  await expect(reiniciar).toBeDisabled();
});
