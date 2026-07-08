import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
// El validador es un módulo ESM de texto plano (scripts/validar-contenido.mjs);
// se reutiliza en vez de duplicar reglas. El shim de tipos vive en
// lib/validar-contenido.d.ts.
import { validarDatos } from "../scripts/validar-contenido.mjs";
import { ContenidoInvalidoError } from "./errores";
import { TIPOS_BLOQUE_VALIDOS } from "./tipos";
import type { Contenido, Leccion, DiagnosticoContenido, CierreContenido } from "./tipos";

/**
 * El validador de scripts/validar-contenido.mjs no chequea la forma interna
 * de cada bloque (el `oneOf` del schema) — solo estructura superficial. Esta
 * es la única pieza que falta para que un `tipo` de bloque inválido no rompa
 * el render silenciosamente.
 */
function verificarFormaBloques(data: unknown, origen: string): void {
  if (
    typeof data !== "object" ||
    data === null ||
    (data as { tipo?: string }).tipo !== "leccion"
  ) {
    return;
  }
  const pasos = (data as { pasos?: unknown }).pasos;
  if (!Array.isArray(pasos)) return;
  pasos.forEach((paso, i) => {
    const bloques = (paso as { bloques?: unknown })?.bloques;
    if (!Array.isArray(bloques)) return;
    bloques.forEach((bloque, j) => {
      const tipo = (bloque as { tipo?: string })?.tipo;
      if (!tipo || !(TIPOS_BLOQUE_VALIDOS as readonly string[]).includes(tipo)) {
        throw new ContenidoInvalidoError(
          `${origen}: pasos[${i}].bloques[${j}] tiene un tipo de bloque inválido: ${JSON.stringify(tipo)}`,
        );
      }
    });
  });
}

function cargarYValidar<T extends Contenido>(rutaAbsoluta: string): T {
  if (!existsSync(rutaAbsoluta)) {
    throw new ContenidoInvalidoError(`No existe el archivo de contenido: ${rutaAbsoluta}`);
  }
  const crudo = readFileSync(rutaAbsoluta, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(crudo);
  } catch (e) {
    throw new ContenidoInvalidoError(`JSON inválido en ${rutaAbsoluta}: ${(e as Error).message}`);
  }
  const errores = validarDatos(data);
  if (errores.length > 0) {
    throw new ContenidoInvalidoError(
      `Contenido inválido en ${rutaAbsoluta}:\n${errores.map((e) => ` - ${e}`).join("\n")}`,
    );
  }
  verificarFormaBloques(data, rutaAbsoluta);
  return data as T;
}

/**
 * Solo devuelve ids de lecciones que el runner puede efectivamente pintar
 * (pasan cargarYValidar completo, incluida la forma de bloques). Una lección
 * con contenido inválido queda excluida de las rutas estáticas — y por lo
 * tanto cae en el 404 normal — en vez de tumbar el build completo. Ver
 * docs/pendientes.md: hoy excluye a l1-patrones-de-cambio.json, que usa una
 * forma de bloques anterior al schema actual.
 */
export function idsDeLecciones(): string[] {
  const dir = path.join(process.cwd(), "content", "lecciones");
  const candidatos = readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""));

  return candidatos.filter((id) => {
    try {
      obtenerLeccion(id);
      return true;
    } catch (e) {
      console.warn(
        `idsDeLecciones: se excluye "${id}" de las rutas de lección (contenido inválido): ${(e as Error).message}`,
      );
      return false;
    }
  });
}

export function obtenerLeccion(id: string): Leccion {
  const ruta = path.join(process.cwd(), "content", "lecciones", `${id}.json`);
  return cargarYValidar<Leccion>(ruta);
}

export function obtenerDiagnostico(): DiagnosticoContenido {
  return cargarYValidar<DiagnosticoContenido>(
    path.join(process.cwd(), "content", "diagnostico.json"),
  );
}

export function obtenerCierre(): CierreContenido {
  return cargarYValidar<CierreContenido>(path.join(process.cwd(), "content", "cierre.json"));
}
