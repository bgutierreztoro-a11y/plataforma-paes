import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { validarDatosBancoAdvance } from "../../scripts/validar-contenido.mjs";
import { ContenidoInvalidoError } from "../errores.ts";
import type { ClaveAlternativa, Dificultad, Habilidad } from "../tipos.ts";
import type { AlternativaAdvance, ItemAdvance } from "./descarte.ts";

/**
 * Acceso a los bancos Advance en disco (`content/advance/<unidadId>/banco.json`).
 *
 * SOLO SERVIDOR, como `lib/catalogoErrores.ts`: lee disco y nada que corra en
 * el cliente puede importarlo con un import de valor.
 *
 * Mismo criterio que `lib/contenido.ts`: un banco que no pasa el validador no
 * se sirve. Se valida con `validarDatosBancoAdvance`, la misma función que
 * corre `npm run validar`, para no duplicar reglas. Sin caché, para que editar
 * el banco en desarrollo se vea sin reiniciar.
 */

/** Forma en disco, espejo de item-advance.schema.json. Solo lo que este módulo necesita leer. */
interface ItemEnDisco {
  id: string;
  unidadId: string;
  moduloId: string;
  habilidad: Habilidad;
  dificultad: Dificultad;
  tiempoReferenciaSeg: number;
  enunciado: string;
  alternativas: {
    clave: ClaveAlternativa;
    texto: string;
    esCorrecta: boolean;
    errorCatalogado?: string;
    feedbackDescarte?: string;
    feedbackDescarteIncorrecto?: string;
  }[];
  solucion: string;
}

export interface Banco {
  unidadId: string;
  moduloId: string;
  titulo?: string;
  /* Ya en forma cliente: sin `proveniencia`, `auditoria` ni `contextosNumericos`,
     con `claveOriginal` igual a `clave` (todavía sin mezclar). */
  items: ItemAdvance[];
}

function dirAdvance(): string {
  return path.join(process.cwd(), "content", "advance");
}

/** Unidades con `banco.json` en disco y válido, en orden alfabético. */
export function unidadesConBanco(): string[] {
  const dir = dirAdvance();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((ent) => ent.isDirectory() && ent.name !== "schema" && !ent.name.startsWith("_"))
    .map((ent) => ent.name)
    .filter((unidadId) => {
      try {
        return obtenerBanco(unidadId) !== null;
      } catch (e) {
        console.warn(`unidadesConBanco: se excluye "${unidadId}": ${(e as Error).message}`);
        return false;
      }
    })
    .sort();
}

/**
 * El banco de una unidad, o null si no existe. Lanza `ContenidoInvalidoError`
 * si existe y no pasa el validador: igual que `obtenerLeccion`, un banco roto
 * no se sirve a medias.
 */
export function obtenerBanco(unidadId: string): Banco | null {
  /* La unidad viene de la URL: solo kebab-case, y nunca un segmento de ruta. */
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(unidadId)) return null;
  const ruta = path.join(dirAdvance(), unidadId, "banco.json");
  if (!existsSync(ruta)) return null;

  let data: unknown;
  try {
    data = JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    throw new ContenidoInvalidoError(`JSON inválido en ${ruta}: ${(e as Error).message}`);
  }
  const errores = validarDatosBancoAdvance(data, unidadId, path.join(process.cwd(), "content"));
  if (errores.length > 0) {
    throw new ContenidoInvalidoError(
      `Banco inválido en ${ruta}:\n${errores.map((e) => ` - ${e}`).join("\n")}`,
    );
  }

  const banco = data as { unidadId: string; moduloId: string; titulo?: string; items: ItemEnDisco[] };
  return {
    unidadId: banco.unidadId,
    moduloId: banco.moduloId,
    titulo: banco.titulo,
    items: banco.items.map(itemParaCliente),
  };
}

/** Quita lo que no viaja al cliente y fija `claveOriginal`. La solución sí viaja (§6.1, descarte fatal). */
function itemParaCliente(item: ItemEnDisco): ItemAdvance {
  return {
    id: item.id,
    unidadId: item.unidadId,
    moduloId: item.moduloId,
    habilidad: item.habilidad,
    dificultad: item.dificultad,
    tiempoReferenciaSeg: item.tiempoReferenciaSeg,
    enunciado: item.enunciado,
    solucion: item.solucion,
    alternativas: item.alternativas.map((a): AlternativaAdvance => {
      /* El validador ya garantizó los campos de cada rama; los `?? ""` solo
         satisfacen al tipo. */
      if (a.esCorrecta) {
        return {
          clave: a.clave,
          claveOriginal: a.clave,
          texto: a.texto,
          esCorrecta: true,
          feedbackDescarteIncorrecto: a.feedbackDescarteIncorrecto ?? "",
        };
      }
      return {
        clave: a.clave,
        claveOriginal: a.clave,
        texto: a.texto,
        esCorrecta: false,
        errorCatalogado: a.errorCatalogado ?? "",
        feedbackDescarte: a.feedbackDescarte ?? "",
      };
    }),
  };
}
