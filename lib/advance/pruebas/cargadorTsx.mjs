import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Hooks de carga para `node --test`: dejan importar un componente `.tsx` de
 * components/ desde un test de lib/ y renderizarlo con react-dom/server.
 *
 * Node quita los tipos de un `.ts` por su cuenta, pero no compila JSX. Acá lo
 * compila el SWC que ya trae Next (node_modules/next/dist/build/swc), así que
 * no entra ninguna dependencia nueva. También resuelve el alias `@/` de
 * tsconfig.json y los imports sin extensión de los componentes, que Node no
 * conoce.
 *
 * Se registra desde el test con `module.register`, antes del import dinámico
 * del componente (ver figurasDatos.render.test.ts). Solo tests: nada de esto
 * llega al bundle de Next.
 */

const RAIZ = new URL("../../../", import.meta.url);
const EXTENSIONES = [".tsx", ".ts", ".mjs", ".js"];

let swc = null;
async function compilarTsx(codigo, nombre) {
  if (!swc) {
    swc = await import(new URL("node_modules/next/dist/build/swc/index.js", RAIZ).href);
    await swc.loadBindings();
  }
  const salida = await swc.transform(codigo, {
    filename: nombre,
    jsc: {
      parser: { syntax: "typescript", tsx: true },
      transform: { react: { runtime: "automatic" } },
      target: "es2022",
    },
    module: { type: "es6" },
  });
  return salida.code;
}

/** Ruta absoluta con la extensión que exista, o la misma si ya la trae. */
function conExtension(rutaSinExtension) {
  if (existsSync(rutaSinExtension) && /\.[cm]?[jt]sx?$/.test(rutaSinExtension)) return rutaSinExtension;
  for (const ext of EXTENSIONES) {
    if (existsSync(rutaSinExtension + ext)) return rutaSinExtension + ext;
  }
  return null;
}

export async function resolve(especificador, contexto, siguiente) {
  if (especificador.startsWith("@/")) {
    const ruta = conExtension(fileURLToPath(new URL(especificador.slice(2), RAIZ)));
    if (ruta) return { url: pathToFileURL(ruta).href, shortCircuit: true };
  }
  if ((especificador.startsWith("./") || especificador.startsWith("../")) && contexto.parentURL) {
    const base = new URL(especificador, contexto.parentURL);
    if (!/\.[cm]?[jt]sx?$/.test(base.pathname)) {
      const ruta = conExtension(fileURLToPath(base));
      if (ruta) return { url: pathToFileURL(ruta).href, shortCircuit: true };
    }
  }
  return siguiente(especificador, contexto);
}

export async function load(url, contexto, siguiente) {
  if (url.endsWith(".tsx")) {
    const codigo = await readFile(fileURLToPath(url), "utf8");
    return { format: "module", source: await compilarTsx(codigo, fileURLToPath(url)), shortCircuit: true };
  }
  return siguiente(url, contexto);
}
