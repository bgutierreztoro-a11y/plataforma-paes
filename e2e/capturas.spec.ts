import { test, expect, type Page } from "@playwright/test";

/**
 * Capturas de las pantallas del camino, en los dos anchos de diseño.
 *
 * Las escribe en `e2e/capturas/` (fuera de git: son artefactos, no fuente).
 * Cada test comprueba además que la pantalla dice lo que tiene que decir, para
 * que una captura en blanco o una ruta caída fallen acá y no pasen inadvertidas
 * al mirar imágenes.
 */

const CLAVE = "pm1:progreso:v1";
const TEMA = "funcion-lineal-y-afin";
const LECCION = "l1-patrones-de-cambio";

/**
 * Progreso sembrado a mano, respetando campo por campo la forma que valida
 * `lib/progresoLocal.ts`: lo que no calza se descarta en silencio, así que un
 * error acá no rompe nada — simplemente deja la pantalla como si no hubiera
 * progreso, y la captura mentiría.
 *
 * `completada: false` con `pasoActual > 0` a propósito: es lo que produce la
 * rama "Continuar" de la portada. Con la lección terminada, y siendo hoy la
 * única publicable, la portada mostraría "hiciste todo lo que está abierto",
 * que no es el estado que hay que retratar.
 */
const PROGRESO_EN_CURSO = {
  version: 1,
  lecciones: [{ leccionId: LECCION, pasoActual: 3, completada: false }],
};

/**
 * La lección terminada y con dominio: los tres ítems PAES acertados al primer
 * intento. Es lo que hace falta para que el nodo se pinte "completado" y no
 * "por repasar" — `alcanzaDominio` pide 60% de aciertos al primer intento
 * (`lib/umbrales.ts`), y con 1 de 3 el camino saldría en ámbar.
 *
 * Se usa en las capturas del camino y del tema porque ahí lo que hay que
 * retratar son los estados de los nodos, y con la lección a medias todos
 * saldrían en el mismo estado inicial.
 */
const PROGRESO_LECCION_HECHA = {
  version: 1,
  lecciones: [{ leccionId: LECCION, pasoActual: 9, completada: true }],
  respuestas: ["l1-item-1", "l1-item-2", "l1-item-3"].map((itemId, i) => ({
    contexto: "leccion",
    contextoId: LECCION,
    itemId,
    valor: { tipo: "alternativa", clave: "B" },
    correcta: true,
    intento: 1,
    tiempoMs: 42_000,
    respondidaEn: `2026-07-26T18:0${i}:00.000Z`,
  })),
};

/**
 * La lección abierta y abandonada en el paso 0. Es la fila que `registrarPaso`
 * escribe al montar el runner, o sea apenas se abre: existe, pero no dice que
 * el estudiante avanzara. `estadoDeLeccion` pide `pasoActual > 0`, así que la
 * llama `disponible`.
 *
 * Este era el caso B de docs/pendientes.md: la portada contaba filas y decía
 * "Te queda una lección del camino" mientras el camino decía "Empezar".
 */
const PROGRESO_ABIERTA_SIN_AVANZAR = {
  version: 1,
  lecciones: [{ leccionId: LECCION, pasoActual: 0, completada: false }],
};

/**
 * La lección terminada pero floja: 1 de 3 ítems al primer intento, bajo el 0,6
 * que pide `alcanzaDominio`. `estadoDeLeccion` la llama `porRepasar`.
 *
 * Este era el caso A: la portada la contaba como cerrada y declaraba "Hiciste
 * todo lo que está abierto" sobre una deuda que el camino pintaba en ámbar.
 */
const PROGRESO_BAJO_UMBRAL = {
  version: 1,
  lecciones: [{ leccionId: LECCION, pasoActual: 9, completada: true }],
  respuestas: ["l1-item-1", "l1-item-2", "l1-item-3"].map((itemId, i) => ({
    contexto: "leccion",
    contextoId: LECCION,
    itemId,
    valor: { tipo: "alternativa", clave: "B" },
    correcta: i === 0,
    intento: 1,
    tiempoMs: 42_000,
    respondidaEn: `2026-07-26T18:0${i}:00.000Z`,
  })),
};

/** Siembra el progreso antes de que corra cualquier script de la página, que es
 *  la única forma de que el primer render del cliente ya lo vea. */
async function sembrar(page: Page, progreso: unknown) {
  await page.addInitScript(
    ([clave, valor]) => window.localStorage.setItem(clave as string, valor as string),
    [CLAVE, JSON.stringify(progreso)] as const,
  );
}

/** Deja el dispositivo sin progreso: es un estado, no la ausencia de uno, y hay
 *  que forzarlo porque el contexto puede venir con restos de otro test. */
async function limpiar(page: Page) {
  await page.addInitScript((clave) => window.localStorage.removeItem(clave as string), CLAVE);
}

async function capturar(page: Page, nombre: string, nombreProyecto: string) {
  /* La barra de navegación se oculta para la captura.

     Es `fixed` —abajo en móvil, pegada arriba en escritorio— y en una captura de
     página completa el navegador la pinta a la altura donde estaba el viewport,
     o sea flotando a media página y tapando contenido. Se probó recolocarla con
     CSS y es peor: la clase base lleva `bottom-0` y la de escritorio `top-0`,
     así que en `absolute` la barra se estira de punta a punta y cubre la página
     entera con su fondo.

     Entre dibujarla donde nunca está y no dibujarla, se elige lo segundo: estas
     capturas son del camino, no de la navegación, y una barra en el lugar
     equivocado se lee como un defecto de maquetación que no existe. */
  await page.addStyleTag({
    content: "nav[aria-label='Navegación principal'] { display: none !important; }",
  });
  await page.screenshot({
    path: `e2e/capturas/${nombre}-${nombreProyecto}.png`,
    fullPage: true,
    /* Congela las animaciones en su estado final: lo que hay que retratar es la
       composición ya asentada, no un fotograma al azar de la entrada
       escalonada. */
    animations: "disabled",
  });
}

test("portada sin progreso", async ({ page }, testInfo) => {
  await limpiar(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Empieza por acá" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Empezar la primera lección" })).toBeVisible();
  await capturar(page, "1-portada-sin-progreso", testInfo.project.name);
});

test("portada con progreso", async ({ page }, testInfo) => {
  await sembrar(page, PROGRESO_EN_CURSO);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Te queda una lección" })).toBeVisible();
  // El botón nombra tema y lección: es lo que le permite al estudiante
  // reconocer dónde iba sin abrirla.
  await expect(page.getByRole("link", { name: /^Continuar: .+ · .+/ })).toBeVisible();
  await capturar(page, "2-portada-con-progreso", testInfo.project.name);
});

test("camino con la lección a medias", async ({ page }, testInfo) => {
  /* El par de la captura anterior: **el mismo progreso sembrado**, para poder
     mirar portada y camino lado a lado y comprobar que dicen lo mismo sobre el
     mismo estado.

     Es el caso que el pliegue de `estadoDeNodo` sobre `estadoDeLeccion` cambió.
     Antes el tema miraba solo lecciones completadas, así que con una lección
     empezada y ninguna cerrada se pintaba "disponible" y el botón decía
     "Empezar el tema" — le pedía al estudiante empezar algo que ya había
     empezado, justo cuando la portada le ofrecía continuarlo. Ahora hereda el
     predicado `pasoActual > 0` de la lección y se lee "en curso".

     El conteo se queda en "0 de 2": `avanceDeTema` cuenta lecciones cerradas y
     no hay ninguna. No se pisa con el estado —el estado dice que hay avance, el
     conteo dice cuánto está cerrado— y por eso se afirman los dos juntos. */
  await sembrar(page, PROGRESO_EN_CURSO);
  await page.goto("/camino");
  await expect(page.getByRole("heading", { name: "Tu camino" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Seguir el tema" })).toBeVisible();
  await expect(page.getByText("0 de 2 lecciones")).toBeVisible();
  /* "2b" y no "3": el número las ordena en el directorio, y esta captura es el
     par de la 2, no el comienzo de otra serie. */
  await capturar(page, "2b-camino-leccion-a-medias", testInfo.project.name);
});

test("camino", async ({ page }, testInfo) => {
  await sembrar(page, PROGRESO_LECCION_HECHA);
  await page.goto("/camino");
  await expect(page.getByRole("heading", { name: "Tu camino" })).toBeVisible();
  await expect(page.getByText("unidades del temario M1")).toBeVisible();
  /* El tema queda "en curso" y no "completado": l2 sigue en borrador, y un tema
     solo se completa con todas sus lecciones declaradas publicables y hechas
     (lib/estadoNodo.ts). El conteo distingue "voy en la mitad" de "terminé", y
     desde el rediseño vive en la tarjeta del nodo activo, no en cada nodo. */
  await expect(page.getByText("1 de 2 lecciones")).toBeVisible();
  await capturar(page, "3-camino", testInfo.project.name);
});

test("tema con los nodos enlazados", async ({ page }, testInfo) => {
  await sembrar(page, PROGRESO_LECCION_HECHA);
  await page.goto(`/tema/${TEMA}`);
  await expect(page.getByRole("heading", { name: "Función lineal y afín" })).toBeVisible();

  /* Orden del recorrido: las lecciones y el cierre al final. Va sobre el DOM y
     no sobre píxeles porque es lo que define la dirección — si alguien vuelve a
     invertir la lista, esto se cae. */
  const titulos = await page.getByRole("listitem").allInnerTexts();
  expect(titulos.at(-1)).toContain("Cierre del tema");

  /* El cierre es navegable aunque su contenido esté en revisión: se avisa que es
     demostración en vez de cerrar la puerta (decisión del 2026-07-25). El
     enlace vive en la tarjeta del nodo activo, así que primero hay que
     seleccionarlo. */
  await page.getByRole("button", { name: "Cierre del tema" }).click();
  await expect(page.getByRole("link", { name: "Rendir el cierre" })).toHaveAttribute(
    "href",
    "/cierre",
  );
  await expect(page.getByText("Demostración")).toBeVisible();
  await expect(page.getByText("8 preguntas formato PAES")).toBeVisible();

  await capturar(page, "4-tema-nodo-cierre", testInfo.project.name);
});

test("caben 6 nodos sin scroll en 360px", async ({ page }, testInfo) => {
  /* El objetivo verificable del rediseño. Solo tiene sentido en el ancho de
     diseño base (MASTER.md §5), así que en escritorio se salta en vez de
     afirmar algo que no se pidió. */
  test.skip(testInfo.project.name !== "movil", "la densidad se exige a 360px");

  await sembrar(page, PROGRESO_LECCION_HECHA);
  await page.goto(`/tema/${TEMA}`);
  await expect(page.getByRole("button", { name: "El patrón que se repite" })).toBeVisible();

  const caben = await page.evaluate(() => {
    const alto = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().height : 0;
    };
    const fila = document.querySelector("ol li");
    const paso = fila ? fila.getBoundingClientRect().height : 0;
    const caja = document.querySelector(".fondo-cuadricula");
    const desde = caja ? caja.getBoundingClientRect().top + 16 : 0;
    // Lo que tapan la barra de navegación y la tarjeta fija del nodo activo.
    const hasta = window.innerHeight - alto("nav[aria-label]") - alto("aside") - 16;
    return paso > 0 ? Math.floor((hasta - desde) / paso) : 0;
  });

  expect(caben).toBeGreaterThanOrEqual(6);
});

test("sin movimiento cuando el sistema lo pide", async ({ browser }) => {
  /* `prefers-reduced-motion` no se comprueba a ojo: se le pide al navegador que
     lo declare y se lee el estilo calculado. Lo que importa es que el estado
     final sea el mismo —el trazo completo, el nodo visible— y que solo se
     salte el recorrido (MASTER.md §2.6 y §5). */
  const contexto = await browser.newContext({ reducedMotion: "reduce" });
  const page = await contexto.newPage();
  await page.goto(`/tema/${TEMA}`);
  await expect(page.getByRole("button", { name: "El patrón que se repite" })).toBeVisible();

  const estilos = await page.evaluate(() => {
    const de = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        animacion: cs.animationName,
        opacidad: cs.opacity,
        dashoffset: cs.strokeDashoffset,
      };
    };
    return {
      respiracion: de(".respiracion-nodo"),
      entrada: de(".entra-nodo"),
      trazo: de(".trazo-camino"),
    };
  });

  expect(estilos.respiracion?.animacion).toBe("none");
  expect(estilos.entrada?.animacion).toBe("none");
  expect(estilos.entrada?.opacidad).toBe("1");
  expect(estilos.trazo?.animacion).toBe("none");
  // El trazo queda dibujado entero, no a medias.
  expect(estilos.trazo?.dashoffset).toBe("0px");

  await contexto.close();
});

/**
 * Los dos casos que docs/pendientes.md dejó abiertos el 2026-07-27, cada uno
 * recorriendo **las cuatro superficies** que hablan del mismo estado: portada,
 * nodo de tema, nodo de lección y encabezado de tema.
 *
 * Se afirma el texto de las cuatro en el mismo test y con el mismo progreso
 * sembrado, que es la única forma de que una discrepancia entre ellas falle.
 * Comprobarlas por separado es justo lo que dejó pasar los dos defectos: cada
 * pantalla estaba bien mirada a solas.
 */
test("abierta sin avanzar: las cuatro superficies dicen lo mismo", async ({
  page,
}, testInfo) => {
  await sembrar(page, PROGRESO_ABIERTA_SIN_AVANZAR);

  /* Abrir la lección y salirse no es haberla empezado: la portada arranca igual
     que sin progreso. Antes decía "Te queda una lección del camino". */
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Empieza por acá" })).toBeVisible();
  await capturar(page, "6a-portada-abierta-sin-avanzar", testInfo.project.name);

  await page.goto("/camino");
  await expect(page.getByRole("link", { name: "Empezar el tema" })).toBeVisible();
  await capturar(page, "6b-camino-abierta-sin-avanzar", testInfo.project.name);

  await page.goto(`/tema/${TEMA}`);
  await expect(page.getByRole("link", { name: "Empezar la lección" })).toBeVisible();
  await expect(page.locator("header p").last()).toContainText("0/2");
});

test("terminada bajo el umbral: las cuatro superficies dicen lo mismo", async ({
  page,
}, testInfo) => {
  await sembrar(page, PROGRESO_BAJO_UMBRAL);

  /* La rama de deuda. Lo que NO puede decir es "Hiciste todo lo que está
     abierto", que es lo que decía antes sobre esta misma deuda. */
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Te conviene repasar una lección" }),
  ).toBeVisible();
  await expect(page.getByText("Hiciste todo")).toHaveCount(0);
  // El umbral se imprime desde lib/umbrales.ts, no escrito a mano.
  await expect(page.getByText("quedó bajo el 60% de aciertos")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Repasar: .+ · .+/ })).toBeVisible();
  await capturar(page, "7a-portada-deuda", testInfo.project.name);

  await page.goto("/camino");
  await expect(page.getByRole("link", { name: "Repasar el tema" })).toBeVisible();
  await capturar(page, "7b-camino-deuda", testInfo.project.name);

  await page.goto(`/tema/${TEMA}`);
  /* El nodo activo acá es el cierre —la lección ya no está ni en curso ni
     disponible—, así que hay que seleccionar el de la lección para leer su
     acción. */
  await page.getByRole("button", { name: "El patrón que se repite" }).click();
  await expect(page.getByRole("link", { name: "Repasar la lección" })).toBeVisible();
  await expect(page.locator("header p").last()).toContainText("1/2");
});

test("celebración de tema", async ({ page }, testInfo) => {
  /* Sin progreso, para que `marcarTemaCelebrado` la deje pasar: es idempotente
     y solo se muestra la primera vez por dispositivo. Se llega por URL directa
     porque el tema todavía no puede completarse jugando —l2 está en borrador—,
     que es el comportamiento correcto y está documentado en docs/pendientes.md. */
  await limpiar(page);
  await page.goto(`/tema/${TEMA}/completado`);
  await expect(page.getByText("Tema completado")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Función lineal y afín" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al camino" })).toBeVisible();
  await capturar(page, "5-celebracion", testInfo.project.name);
});

test("la celebración se muestra una sola vez", async ({ page }) => {
  /* Acá NO se puede usar `limpiar()`: `addInitScript` corre en cada
     navegación, así que borraría el registro de celebración justo antes de la
     segunda visita y el test nunca podría fallar. Se limpia una sola vez, ya
     dentro del sitio, y a partir de ahí manda lo que el producto guarde. */
  await page.goto("/camino");
  await page.evaluate((clave) => window.localStorage.removeItem(clave), CLAVE);

  await page.goto(`/tema/${TEMA}/completado`);
  await expect(page.getByText("Tema completado")).toBeVisible();

  // Segunda visita: se va al camino en vez de repetirla.
  await page.goto(`/tema/${TEMA}/completado`);
  await expect(page).toHaveURL(/\/camino$/);
});
