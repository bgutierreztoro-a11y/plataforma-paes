/**
 * Parser del subconjunto de markdown que admiten los documentos legales
 * (content/legal/*.md). Es aparte de lib/markdownSimple.tsx a propósito: ese
 * módulo lo comparte el contenido de lecciones y no se toca.
 *
 * Produce un árbol de datos, no React, para que la parte con reglas de
 * seguridad —qué esquemas de URL pasan a ser enlace— se pueda probar con
 * `node --test` sin transformar JSX. El render vive en
 * components/legal/TextoLegal.tsx.
 *
 * Cubre exactamente la forma real del archivo firmado, nada más:
 *   "# " h1 · "## " h2 con id · "### " h3 · "> " cita (líneas consecutivas se
 *   agrupan) · "---" regla · "- " lista · "1. " lista numerada · párrafos ·
 *   **negrita** · *cursiva* · `código` · [texto](https:… | mailto:…).
 *
 * Cualquier otro esquema de enlace (javascript:, data:, http:, relativo) no se
 * convierte en enlace: el texto fuente queda literal, visible, para que el
 * defecto se note en la revisión y no en el navegador de alguien.
 */

export type Inline =
  | { tipo: "texto"; texto: string }
  | { tipo: "negrita"; hijos: Inline[] }
  | { tipo: "cursiva"; hijos: Inline[] }
  | { tipo: "codigo"; texto: string }
  | { tipo: "enlace"; href: string; hijos: Inline[] };

export type Bloque =
  | { tipo: "h1"; hijos: Inline[] }
  | { tipo: "h2"; id: string; hijos: Inline[] }
  | { tipo: "h3"; hijos: Inline[] }
  | { tipo: "parrafo"; hijos: Inline[] }
  | { tipo: "cita"; parrafos: Inline[][] }
  | { tipo: "regla" }
  | { tipo: "lista"; ordenada: boolean; items: Inline[][] };

/** Lista blanca de esquemas. Se compara en minúsculas y sin espacios al borde. */
const ESQUEMAS_PERMITIDOS = /^(https:|mailto:)/i;

export function esHrefPermitido(href: string): boolean {
  return ESQUEMAS_PERMITIDOS.test(href.trim());
}

/**
 * Id de cláusula a partir del texto del h2: "## 3. Menores de edad" →
 * "3-menores-de-edad". Sin acentos ni signos; el número se conserva porque
 * es lo que distingue a "Definiciones" de otra "Definiciones".
 */
export function slugDeTitulo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MARCAS_INLINE = /(`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;

export function parsearInline(texto: string): Inline[] {
  const partes = texto.split(MARCAS_INLINE).filter((p) => p !== "");
  return partes.map((parte): Inline => {
    // Código primero: dentro de backticks las demás marcas son literales.
    const codigo = /^`([^`]+)`$/.exec(parte);
    if (codigo) return { tipo: "codigo", texto: codigo[1] };
    const enlace = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(parte);
    if (enlace) {
      if (esHrefPermitido(enlace[2])) {
        return { tipo: "enlace", href: enlace[2].trim(), hijos: parsearInline(enlace[1]) };
      }
      // Esquema no permitido: la fuente completa queda como texto plano.
      return { tipo: "texto", texto: parte };
    }
    const negrita = /^\*\*([^*]+)\*\*$/.exec(parte);
    if (negrita) return { tipo: "negrita", hijos: parsearInline(negrita[1]) };
    const cursiva = /^\*([^*]+)\*$/.exec(parte);
    if (cursiva) return { tipo: "cursiva", hijos: parsearInline(cursiva[1]) };
    return { tipo: "texto", texto: parte };
  });
}

/** Texto plano de un h2, para derivar el id. */
function textoPlano(hijos: Inline[]): string {
  return hijos
    .map((h) => (h.tipo === "texto" || h.tipo === "codigo" ? h.texto : textoPlano(h.hijos)))
    .join("");
}

export function parsearMarkdownLegal(markdown: string): Bloque[] {
  const lineas = markdown.replace(/\r\n?/g, "\n").split("\n");
  const bloques: Bloque[] = [];
  const idsUsados = new Map<string, number>();

  // Acumuladores de bloques que abarcan varias líneas.
  let parrafo: string[] = [];
  let cita: string[][] | null = null;
  let lista: { ordenada: boolean; items: string[] } | null = null;

  const cerrarParrafo = () => {
    if (parrafo.length) bloques.push({ tipo: "parrafo", hijos: parsearInline(parrafo.join(" ")) });
    parrafo = [];
  };
  const cerrarCita = () => {
    if (cita) {
      const parrafos = cita.filter((p) => p.length).map((p) => parsearInline(p.join(" ")));
      if (parrafos.length) bloques.push({ tipo: "cita", parrafos });
    }
    cita = null;
  };
  const cerrarLista = () => {
    if (lista) {
      bloques.push({
        tipo: "lista",
        ordenada: lista.ordenada,
        items: lista.items.map(parsearInline),
      });
    }
    lista = null;
  };
  const cerrarTodo = () => {
    cerrarParrafo();
    cerrarCita();
    cerrarLista();
  };

  for (const cruda of lineas) {
    const linea = cruda.trimEnd();

    if (linea.trim() === "") {
      cerrarTodo();
      continue;
    }

    const titulo = /^(#{1,3})\s+(.*)$/.exec(linea);
    if (titulo) {
      cerrarTodo();
      const hijos = parsearInline(titulo[2].trim());
      if (titulo[1].length === 1) bloques.push({ tipo: "h1", hijos });
      else if (titulo[1].length === 3) bloques.push({ tipo: "h3", hijos });
      else {
        const base = slugDeTitulo(textoPlano(hijos)) || "seccion";
        const n = idsUsados.get(base) ?? 0;
        idsUsados.set(base, n + 1);
        bloques.push({ tipo: "h2", id: n === 0 ? base : `${base}-${n + 1}`, hijos });
      }
      continue;
    }

    if (/^-{3,}$/.test(linea.trim())) {
      cerrarTodo();
      bloques.push({ tipo: "regla" });
      continue;
    }

    const lineaCita = /^>\s?(.*)$/.exec(linea);
    if (lineaCita) {
      cerrarParrafo();
      cerrarLista();
      if (!cita) cita = [[]];
      const contenido = lineaCita[1].trim();
      // Una línea ">" vacía separa párrafos dentro de la misma cita.
      if (contenido === "") cita.push([]);
      else cita[cita.length - 1].push(contenido);
      continue;
    }

    const item = /^(-|\d+\.)\s+(.*)$/.exec(linea);
    if (item) {
      const ordenada = item[1] !== "-";
      cerrarParrafo();
      cerrarCita();
      if (lista && lista.ordenada !== ordenada) cerrarLista();
      if (!lista) lista = { ordenada, items: [] };
      lista.items.push(item[2].trim());
      continue;
    }

    // Línea suelta: continúa el bloque abierto (párrafo, cita o último ítem)
    // o abre un párrafo nuevo.
    if (cita) {
      cita[cita.length - 1].push(linea.trim());
    } else if (lista) {
      lista.items[lista.items.length - 1] += ` ${linea.trim()}`;
    } else {
      parrafo.push(linea.trim());
    }
  }
  cerrarTodo();
  return bloques;
}
