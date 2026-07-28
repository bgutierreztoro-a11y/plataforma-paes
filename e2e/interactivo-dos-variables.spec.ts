import { test, expect } from "@playwright/test";

/**
 * Verifica y captura la variante `dosVariables` del bloque interactivo
 * (MASTER.md §3.3, la interacción insignia) contra la ruta de previsualización
 * (`app/vista-previa/interactivo-dos-variables/`), que monta el componente con
 * el fixture de `e2e/fixtures/bloqueDosVariables.ts` — no hay lección real que
 * use esta variante todavía, así que no hay otra forma de verla renderizada.
 *
 * Usa los mismos dos proyectos que `capturas.spec.ts` (360×800 y 1440×900,
 * MASTER.md §5) en vez de depender de un resize de ventana en vivo: correr
 * contra el build de producción con un viewport fijo es lo único reproducible.
 */

async function capturar(page: import("@playwright/test").Page, nombre: string, proyecto: string) {
  await page.addStyleTag({
    content: "nav[aria-label='Navegación principal'] { display: none !important; }",
  });
  await page.screenshot({
    path: `e2e/capturas/${nombre}-${proyecto}.png`,
    fullPage: true,
    animations: "disabled",
  });
}

test("predice, mueve, comprueba, confirma — con una predicción declarada", async ({
  page,
}, testInfo) => {
  await page.goto("/vista-previa/interactivo-dos-variables");
  await expect(
    page.getByRole("heading", { name: /Si subes la pendiente/ }).or(page.getByText("Si subes la pendiente")),
  ).toBeVisible();

  // Fase "predice": los dos sliders ya están visibles y activos (dosVariables
  // no oculta el gráfico mientras se predice, MASTER §3.3 lo pinta como hero).
  // .first() porque la ecuación aparece dos veces a propósito: una visible y
  // una réplica aria-live solo-lector (accesibilidad, no duplicado real).
  await expect(page.getByText("y =").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Comprobar" })).toHaveCount(0);

  await page.getByRole("radio", { name: "También sube" }).click();

  // Fase "mueve": sin mover, "Comprobar" no aparece.
  await expect(page.getByText("Mueve los dos controles para comprobar")).toBeVisible();
  await expect(page.getByRole("button", { name: "Comprobar" })).toHaveCount(0);

  const pendiente = page.getByRole("slider", { name: "Pendiente (m)" });
  const intercepto = page.getByRole("slider", { name: "Intercepto (b)" });
  await pendiente.focus();
  await page.keyboard.press("ArrowRight");
  // Un solo control no alcanza: "mueve" pide los dos, no cualquiera de los dos.
  await expect(page.getByRole("button", { name: "Comprobar" })).toHaveCount(0);
  await intercepto.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Comprobar" })).toBeVisible();

  await page.getByRole("button", { name: "Comprobar" }).click();

  // El mensaje mostrado es el de la predicción elegida, no uno genérico: prueba
  // que la respuesta i-ésima de feedbackPorPrediccion se lee por índice, no por
  // texto adivinado.
  await expect(
    page.getByText("El intercepto depende del otro control, no de este."),
  ).toBeVisible();

  // La micro-confirmación gatea el avance: "Siguiente predicción" no aparece
  // hasta responder "¿Tiene sentido?".
  await expect(page.getByRole("button", { name: "Siguiente predicción" })).toHaveCount(0);
  await expect(page.getByText("¿Tiene sentido?")).toBeVisible();
  await page.getByRole("button", { name: "Sí", exact: true }).click();
  await expect(page.getByRole("button", { name: "Siguiente predicción" })).toBeVisible();

  await capturar(page, "8-slider-dos-variables-comprobada", testInfo.project.name);
});

test("responder 'No' en la confirmación muestra el aviso y no bloquea el avance", async ({
  page,
}) => {
  await page.goto("/vista-previa/interactivo-dos-variables");
  await page.getByRole("radio", { name: "También sube" }).click();
  await page.getByRole("slider", { name: "Pendiente (m)" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("slider", { name: "Intercepto (b)" }).focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", { name: "Comprobar" }).click();

  await page.getByRole("button", { name: "No", exact: true }).click();
  await expect(
    page.getByText("Vuelve a mover los dos controles y compara con el mensaje anterior"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente predicción" })).toBeVisible();
});

test("el catch-all 'No estoy seguro' no inventa una respuesta", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-dos-variables");
  await page.getByRole("radio", { name: "También sube" }).click();
  await page.getByRole("slider", { name: "Pendiente (m)" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("slider", { name: "Intercepto (b)" }).focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", { name: "Comprobar" }).click();
  await page.getByRole("button", { name: "Sí", exact: true }).click();
  await page.getByRole("button", { name: "Siguiente predicción" }).click();

  await expect(page.getByText("Predicción 2 de 2")).toBeVisible();
  await page.getByRole("radio", { name: "No estoy seguro" }).click();

  await page.getByRole("slider", { name: "Pendiente (m)" }).focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("slider", { name: "Intercepto (b)" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Comprobar" }).click();

  /* Sin match en feedbackPorPrediccion: mensaje neutro, nunca "correcto" — no
     hay forma de saber si la predicción real del estudiante lo era. */
  await expect(page.getByText("Comprobado. Sigue mirando qué cambia")).toBeVisible();
  await page.getByRole("button", { name: "Sí", exact: true }).click();
  await expect(page.getByText("Sigue explorando el gráfico libremente")).toBeVisible();
  // Última micropregunta: no hay "Siguiente predicción" que ofrecer.
  await expect(page.getByRole("button", { name: "Siguiente predicción" })).toHaveCount(0);
});

test("los sliders no se bloquean fuera de la fase mueve", async ({ page }) => {
  /* Explorar libremente antes de predecir, o después de comprobar, sigue
     funcionando: dosVariables nunca gatea el movimiento (a diferencia de
     unaVariable, que sí tiene exploracionMinima). */
  await page.goto("/vista-previa/interactivo-dos-variables");
  const pendiente = page.getByRole("slider", { name: "Pendiente (m)" });
  await pendiente.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("y = 1,5").first()).toBeVisible();
});

test("'Volver a empezar' reinicia los sliders a su valor inicial", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-dos-variables");
  const reiniciar = page.getByRole("button", { name: "Volver a empezar" });

  // Estado inicial: nada que reiniciar.
  await expect(reiniciar).toBeDisabled();

  const pendiente = page.getByRole("slider", { name: "Pendiente (m)" });
  const intercepto = page.getByRole("slider", { name: "Intercepto (b)" });
  await pendiente.focus();
  await page.keyboard.press("ArrowRight");
  await intercepto.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("y = 1,5").first()).toBeVisible();
  await expect(reiniciar).toBeEnabled();

  await reiniciar.click();
  await expect(page.getByText("y = 1").first()).toBeVisible();
  await expect(reiniciar).toBeDisabled();
});

test("flujo completo: explorar, reiniciar, predecir, feedback, confirmar", async ({ page }) => {
  await page.goto("/vista-previa/interactivo-dos-variables");

  // Explorar libremente antes de comprometer una predicción.
  const pendiente = page.getByRole("slider", { name: "Pendiente (m)" });
  const intercepto = page.getByRole("slider", { name: "Intercepto (b)" });
  await pendiente.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await intercepto.focus();
  await page.keyboard.press("ArrowLeft");

  // Reiniciar antes de predecir: vuelve al punto de partida, no cuenta como intento.
  await page.getByRole("button", { name: "Volver a empezar" }).click();
  await expect(page.getByText("y = 1").first()).toBeVisible();
  await expect(page.getByText("Predicción 1 de 2")).toBeVisible();

  // Predecir.
  await page.getByRole("radio", { name: "También sube" }).click();

  // Mover los dos controles.
  await pendiente.focus();
  await page.keyboard.press("ArrowRight");
  await intercepto.focus();
  await page.keyboard.press("ArrowLeft");

  // Comprobar y ver el feedback.
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(
    page.getByText("El intercepto depende del otro control, no de este."),
  ).toBeVisible();

  // Confirmar comprensión.
  await page.getByRole("button", { name: "Sí", exact: true }).click();
  await expect(page.getByRole("button", { name: "Siguiente predicción" })).toBeVisible();
});
