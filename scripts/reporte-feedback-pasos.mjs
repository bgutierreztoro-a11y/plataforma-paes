/**
 * Corre `esPasoSimple` sobre el corpus real y reporta la distribución.
 *
 * No es un test: es el instrumento para decidir si la heurística de Fase 5
 * ("¿este paso puede usar la zona anclada?") se comporta como se espera sobre
 * el contenido que existe, antes de que un mecanismo de UI dependa de ella.
 *
 * Uso: node scripts/reporte-feedback-pasos.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { puntosDeFeedback, esPasoSimple } from "../lib/feedbackDelPaso.ts";

const DIR = "content/lecciones";

const archivos = readdirSync(DIR)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .sort();

let simples = 0;
let multiples = 0;
const ambiguos = [];

for (const archivo of archivos) {
  const leccion = JSON.parse(readFileSync(join(DIR, archivo), "utf8"));
  if (!leccion.pasos) continue;

  console.log(`\n${archivo}  (${leccion.estado})`);

  leccion.pasos.forEach((paso, i) => {
    const puntos = puntosDeFeedback(paso.bloques);
    const veredictos = puntos.filter((p) => p.clase === "veredicto");
    const acuses = puntos.filter((p) => p.clase === "acuse");
    const simple = esPasoSimple(paso.bloques);

    if (simple) simples++;
    else multiples++;

    /* Ambiguo = simple por la regla, pero con un acuse conviviendo con el
       veredicto (o sin veredicto y con acuses). Son los casos que la regla
       resuelve por default y que conviene mirar uno por uno. */
    if (simple && acuses.length > 0) {
      ambiguos.push({
        archivo,
        paso: i + 1,
        tipo: paso.tipo,
        veredictos: veredictos.length,
        acuses: acuses.map((a) => a.tipoBloque),
      });
    }

    const etiqueta = simple ? "SIMPLE  " : "MÚLTIPLE";
    const detalle =
      puntos.length === 0
        ? "sin feedback"
        : puntos.map((p) => `${p.tipoBloque}:${p.clase}`).join(", ");
    console.log(
      `  paso ${String(i + 1).padStart(2)} · ${paso.tipo.padEnd(15)} ${etiqueta}  ${detalle}`,
    );
  });
}

console.log(`\n${"=".repeat(70)}`);
console.log(`Total: ${simples} simples · ${multiples} múltiples`);

if (ambiguos.length > 0) {
  console.log(`\nCasos que la regla resuelve por default (veredicto + acuse):`);
  for (const a of ambiguos) {
    console.log(
      `  ${a.archivo} paso ${a.paso} (${a.tipo}): ${a.veredictos} veredicto(s) + acuse ${a.acuses.join(", ")}`,
    );
  }
}
