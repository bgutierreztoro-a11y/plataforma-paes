import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright existe acá para una cosa: sacar las capturas de las pantallas del
 * camino de forma reproducible, y de paso comprobar que las rutas responden.
 *
 * Por qué se justifica la dependencia (CLAUDE.md pide una razón por cada una):
 * el trabajo del camino es puramente visual y el proyecto no tenía ninguna red
 * contra regresiones de layout — un cambio de padding que rompa el trazo no lo
 * detecta ni `tsc` ni el linter. Es `devDependency`: no toca el bundle que
 * recibe el estudiante.
 *
 * Corre contra el build de producción y no contra `next dev`. Lo que hay que
 * poder mirar es lo que se despliega, y en dev el overlay de Turbopack y la
 * recompilación al vuelo cambian tiempos y a veces pintan encima.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.resultados",
  /* Sin reintentos: una captura que solo sale bien al segundo intento esconde
     justo el problema que se quiere ver. */
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
  },
  projects: [
    {
      /* 360px es el ancho de diseño base del proyecto (MASTER.md §5,
         mobile-first). No es un tamaño de prueba arbitrario. */
      name: "movil",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 } },
    },
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "npm run build && npx next start --port 3100",
    /* Puerto propio para no pelear con un `npm run dev` abierto en 3000. */
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
