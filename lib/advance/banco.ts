import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { validarDatosBancoAdvance } from "../../scripts/validar-contenido.mjs";
import { ContenidoInvalidoError } from "../errores.ts";
import type { ClaveAlternativa, Dificultad, Habilidad } from "../tipos.ts";
import type { AlternativaAdvance, EjeCategorias, EjeValores, FiguraItem, ItemAdvance, SerieDatos } from "./descarte.ts";
import { protegerExpresiones } from "./protegerExpresiones.ts";

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
export interface ItemEnDisco {
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
    figura?: FiguraItem;
    esCorrecta: boolean;
    errorCatalogado?: string | null;
    sinErrorCatalogado?: { motivo: string; nota: string };
    feedbackDescarte?: string;
    feedbackDescarteIncorrecto?: string;
  }[];
  solucion: string;
  figura?: FiguraItem;
  figuraSolucion?: FiguraItem;
}

export interface Banco {
  unidadId: string;
  moduloId: string;
  /* Nombre técnico DEMRE de la unidad: lo que ve el estudiante. El unidadId
     es solo ruta y clave, nunca sale a producto. */
  titulo: string;
  /* Ya en forma cliente: sin `proveniencia`, `auditoria` ni `contextosNumericos`,
     con `claveOriginal` igual a `clave` (todavía sin mezclar). */
  items: ItemAdvance[];
}

function dirAdvance(): string {
  return path.join(process.cwd(), "content", "advance");
}

/** Unidades con `banco.json` en disco y válido, con su título, en orden alfabético de unidadId. */
export function unidadesConBanco(): { unidadId: string; titulo: string }[] {
  const dir = dirAdvance();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((ent) => ent.isDirectory() && ent.name !== "schema" && !ent.name.startsWith("_"))
    .map((ent) => ent.name)
    .sort()
    .flatMap((unidadId) => {
      try {
        const banco = obtenerBanco(unidadId);
        return banco ? [{ unidadId, titulo: banco.titulo }] : [];
      } catch (e) {
        console.warn(`unidadesConBanco: se excluye "${unidadId}": ${(e as Error).message}`);
        return [];
      }
    });
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

  const banco = data as { unidadId: string; moduloId: string; titulo: string; items: ItemEnDisco[] };
  return {
    unidadId: banco.unidadId,
    moduloId: banco.moduloId,
    titulo: banco.titulo,
    items: banco.items.map(itemParaCliente),
  };
}

/**
 * Quita lo que no viaja al cliente y fija `claveOriginal`. La solución sí
 * viaja (§6.1, descarte fatal). `sinErrorCatalogado` no viaja: es para el
 * revisor, y el cliente solo necesita saber que `errorCatalogado` es null.
 * `figura` viaja tal cual: solo muestra datos del enunciado, nunca la
 * transformación pedida, así que no revela nada. La excepción es el texto de
 * las figuras de datos (`figuraParaCliente`).
 *
 * Los cinco campos de texto pasan por `protegerExpresiones` (espacio duro
 * dentro de cada expresión): es el único punto por el que el texto del banco
 * llega a descarte y triage, así que ningún componente tiene que acordarse.
 */
export function itemParaCliente(item: ItemEnDisco): ItemAdvance {
  return {
    id: item.id,
    unidadId: item.unidadId,
    moduloId: item.moduloId,
    habilidad: item.habilidad,
    dificultad: item.dificultad,
    tiempoReferenciaSeg: item.tiempoReferenciaSeg,
    enunciado: protegerExpresiones(item.enunciado),
    solucion: protegerExpresiones(item.solucion),
    ...(item.figura ? { figura: figuraParaCliente(item.figura) } : {}),
    /* La figura de la solución sigue el camino de la solución: viaja siempre
       que viaja la solución, por el mismo figuraParaCliente que la del ítem. */
    ...(item.figuraSolucion ? { figuraSolucion: figuraParaCliente(item.figuraSolucion) } : {}),
    alternativas: item.alternativas.map((a): AlternativaAdvance => {
      /* El validador ya garantizó los campos de cada rama; los `?? ""` solo
         satisfacen al tipo. `errorCatalogado` es la excepción: null es un
         valor del contrato y se propaga tal cual, nunca como "". */
      /* Alternativa gráfica: la figura pasa por el mismo figuraParaCliente que la del ítem. */
      const figura = a.figura ? { figura: figuraParaCliente(a.figura) } : {};
      if (a.esCorrecta) {
        return {
          clave: a.clave,
          claveOriginal: a.clave,
          texto: protegerExpresiones(a.texto),
          ...figura,
          esCorrecta: true,
          feedbackDescarteIncorrecto: protegerExpresiones(a.feedbackDescarteIncorrecto ?? ""),
        };
      }
      return {
        clave: a.clave,
        claveOriginal: a.clave,
        texto: protegerExpresiones(a.texto),
        ...figura,
        esCorrecta: false,
        errorCatalogado: a.errorCatalogado ?? null,
        feedbackDescarte: protegerExpresiones(a.feedbackDescarte ?? ""),
      };
    }),
  };
}

const texto = protegerExpresiones;
const celda = (c: string | number) => (typeof c === "string" ? texto(c) : c);
const serie = (s: SerieDatos): SerieDatos => ({ ...(s.nombre !== undefined ? { nombre: texto(s.nombre) } : {}), valores: s.valores });
const ejeX = (e: EjeCategorias): EjeCategorias => ({ etiqueta: texto(e.etiqueta) });
const ejeY = (e: EjeValores): EjeValores => ({ ...e, etiqueta: texto(e.etiqueta) });

/**
 * Las figuras de datos (tabla-datos, grafico-barras, histograma,
 * grafico-lineas, grafico-circular, diagrama-cajon) llevan texto que se lee en
 * pantalla: columnas, celdas, categorías, nombres de serie o de caja, etiquetas
 * de eje y de sector.
 * Ese texto pasa por el mismo `protegerExpresiones` que el enunciado, para que
 * un intervalo como "10 − 20" o una etiqueta "n = 40" no se corte en el
 * operador. Los números viajan intactos. Las otras tres figuras (isometrías,
 * plano-funcion, tabla-valores) siguen viajando tal cual, como se firmó, y el
 * lienzo geométrico también: todo su texto va en un SVG, que no corta líneas,
 * y el validador ya midió sus rótulos tal como están en el banco.
 */
export function figuraParaCliente(figura: FiguraItem): FiguraItem {
  switch (figura.tipo) {
    case "tabla-datos":
      return {
        ...figura,
        ...(figura.titulo !== undefined ? { titulo: texto(figura.titulo) } : {}),
        columnas: figura.columnas.map(texto),
        filas: figura.filas.map((f) => f.map(celda)),
        ...(figura.filaTotal ? { filaTotal: figura.filaTotal.map(celda) } : {}),
      };
    case "grafico-barras":
    case "grafico-lineas":
      return { ...figura, categorias: figura.categorias.map(texto), series: figura.series.map(serie), ejeX: ejeX(figura.ejeX), ejeY: ejeY(figura.ejeY) };
    case "histograma":
      return { ...figura, ejeX: ejeX(figura.ejeX), ejeY: ejeY(figura.ejeY) };
    case "grafico-circular":
      return { ...figura, sectores: figura.sectores.map((s) => ({ etiqueta: texto(s.etiqueta), valor: s.valor })) };
    case "diagrama-cajon":
      return {
        ...figura,
        eje: { ...figura.eje, ...(figura.eje.etiqueta !== undefined ? { etiqueta: texto(figura.eje.etiqueta) } : {}) },
        cajas: figura.cajas.map((c) => ({ ...c, ...(c.nombre !== undefined ? { nombre: texto(c.nombre) } : {}) })),
      };
    default:
      return figura;
  }
}
