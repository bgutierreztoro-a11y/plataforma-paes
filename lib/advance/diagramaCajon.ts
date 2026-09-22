import type { CajaDatos, EjeCajon, FiguraDiagramaCajon } from "./descarte.ts";
import { formatoMarca } from "./planoFuncion.ts";

/**
 * Motor del diagrama de cajón de Advance (components/advance/figuras/
 * DiagramaCajon.tsx). Puro, sin React y sin DOM: decide dónde va cada caja,
 * cada marca y cada rótulo, y el validador (scripts/validar-contenido.mjs,
 * regla 24) lo usa para saber si dos rótulos se pisan. Una sola geometría para
 * el dibujo y para la regla: si el componente cambia un margen, la regla lo ve.
 *
 * Declarativo (decisión firmada): cada caja trae sus cinco números en el JSON y
 * esta figura no calcula ningún cuartil. El eje también viene declarado.
 *
 * Todo en unidades del viewBox (320 de ancho, igual que el resto de las figuras
 * de Advance). El SVG se escala entero, así que la distancia entre dos rótulos y
 * el ancho de cada rótulo crecen en la misma proporción: un choque en unidades
 * es un choque a 390 px y a cualquier otro ancho.
 */

export const ANCHO = 320;
/** Alto del lienzo vertical (sin la fila de nombres ni la de la unidad). */
export const ALTO_VERTICAL = 240;
/** Mismo tamaño que LETRA_MARCA de components/advance/figuras/lienzo.ts. */
export const LETRA = 9.5;
export const TICK = 3;
/** Aire mínimo entre dos rótulos vecinos, en unidades. */
export const AIRE_ROTULOS = 2;
/** Media altura de la caja (horizontal) o medio ancho (vertical). */
export const MEDIA_CAJA = 11;
/** Medio largo del remate de cada bigote. */
export const MEDIO_REMATE = 7;
/** Alto de una fila horizontal, con rótulos arriba y abajo o sin ellos. */
export const FILA_CON_ROTULOS = 58;
export const FILA_SIN_ROTULOS = 38;
/** Alto de la fila de la unidad o de los nombres. */
export const FILA_EXTRA = 14;
const MARGEN_LADO = 18;
const MARGEN_SUP = 8;
const SEPARACION_NOMBRE = 8;

/** Topes firmados y de legibilidad. */
export const MAX_CAJAS = 4;
export const MAX_LARGO_NOMBRE = 14;

/** Número en es-CL con signo menos Unicode y hasta 3 decimales, como en figurasDatos.ts. */
export const num = (v: number) => v.toLocaleString("es-CL", { maximumFractionDigits: 3 }).replace(/^-/, "−");

/**
 * Ancho estimado de un texto de `letra` unidades. Conservador: 0,6 em por
 * cifra o letra (Archivo con cifras tabulares queda bajo eso) y 0,3 em por
 * coma, punto y espacio. Sobrestimar solo adelanta el aviso del validador.
 */
export function anchoTexto(texto: string, letra = LETRA): number {
  let em = 0;
  for (const c of texto) em += /[.,\s]/.test(c) ? 0.3 : 0.6;
  return em * letra;
}

/* ---------- eje ---------- */

/** Marcas del eje, de min a max con el paso declarado. El validador ya exigió que el paso divida el rango. */
export function marcasCajon(eje: EjeCajon): number[] {
  const n = Math.round((eje.max - eje.min) / eje.paso);
  const marcas: number[] = [];
  for (let i = 0; i <= n; i++) marcas.push(Number((eje.min + i * eje.paso).toFixed(9)) + 0);
  return marcas;
}

export const rotuloDeMarca = (valor: number, eje: EjeCajon) => formatoMarca(valor, eje.paso);

/* ---------- rótulos de valores ---------- */

export type FilaRotulo = "arriba" | "abajo" | "lado";

export interface RotuloValor {
  caja: number;
  valor: number;
  texto: string;
  /** Centro del rótulo en el eje de valores (x en horizontal, y en vertical). */
  posicion: number;
  x: number;
  y: number;
  ancla: "start" | "middle";
  fila: FilaRotulo;
  /** Rótulo de la mediana: va en negrita, como su trazo. */
  esMediana: boolean;
}

/**
 * Los valores DISTINTOS de una caja, cada uno una vez. Si un valor es también
 * q1, mediana o q3 va con los de la caja (arriba en horizontal); solo el mínimo
 * y el máximo que no coinciden con la caja van abajo. q1 igual a la mediana es
 * un solo rótulo: es el caso que DEMRE usa para evaluar lectura.
 */
export function valoresRotulados(caja: CajaDatos): { valor: number; deCaja: boolean; esMediana: boolean }[] {
  const deCaja = [caja.q1, caja.mediana, caja.q3];
  const vistos = new Set<number>();
  const salida: { valor: number; deCaja: boolean; esMediana: boolean }[] = [];
  for (const valor of [caja.minimo, caja.q1, caja.mediana, caja.q3, caja.maximo]) {
    if (vistos.has(valor)) continue;
    vistos.add(valor);
    salida.push({ valor, deCaja: deCaja.includes(valor), esMediana: valor === caja.mediana });
  }
  return salida.sort((a, b) => a.valor - b.valor);
}

/* ---------- geometría completa ---------- */

export interface CajaResuelta {
  caja: CajaDatos;
  /** Centro de la caja en el eje transversal (y en horizontal, x en vertical). */
  centro: number;
  /** Ancho del carril de la caja en el eje transversal (solo vertical: los rótulos van dentro). */
  carril: number;
}

export interface GeometriaCajon {
  ancho: number;
  alto: number;
  /** Valor del eje → unidad del viewBox a lo largo del eje. */
  aPos: (valor: number) => number;
  /** Extremos del eje de valores en unidades (inicio, fin). */
  inicio: number;
  fin: number;
  /** Posición transversal de la línea del eje (y en horizontal, x en vertical). */
  lineaEje: number;
  /** Inicio y fin transversal del área de cajas, para la grilla. */
  areaDesde: number;
  areaHasta: number;
  cajas: CajaResuelta[];
  marcas: number[];
  rotulos: RotuloValor[];
  /** Posición de la etiqueta de unidad, si hay. */
  etiqueta: { x: number; y: number; ancla: "start" | "end" } | null;
}

const hayNombres = (figura: FiguraDiagramaCajon) => figura.cajas.some((c) => c.nombre !== undefined);

export function geometriaCajon(figura: FiguraDiagramaCajon): GeometriaCajon {
  return figura.orientacion === "horizontal" ? geometriaHorizontal(figura) : geometriaVertical(figura);
}

/**
 * Horizontal: una fila por caja, de arriba abajo en el orden del JSON, con el
 * nombre a la izquierda; el eje abajo, con sus números y la unidad bajo el
 * extremo derecho. Rótulos de la caja sobre ella y los del mínimo y el máximo
 * bajo los bigotes, como en la lección.
 */
function geometriaHorizontal(figura: FiguraDiagramaCajon): GeometriaCajon {
  const { eje, cajas } = figura;
  const anchoNombres = hayNombres(figura) ? Math.max(...cajas.map((c) => anchoTexto(c.nombre ?? "", LETRA))) + SEPARACION_NOMBRE : 0;
  const inicio = Math.max(MARGEN_LADO, anchoNombres + 10);
  const fin = ANCHO - MARGEN_LADO;
  const aPos = (v: number) => inicio + ((v - eje.min) / (eje.max - eje.min)) * (fin - inicio);

  const alguna = cajas.some((c) => c.rotulos);
  const alto_fila = alguna ? FILA_CON_ROTULOS : FILA_SIN_ROTULOS;
  const resueltas: CajaResuelta[] = cajas.map((caja, i) => ({ caja, centro: MARGEN_SUP + alto_fila * i + alto_fila / 2, carril: alto_fila }));
  const lineaEje = MARGEN_SUP + alto_fila * cajas.length + 4;
  const alto = lineaEje + TICK + 2 + LETRA + 4 + (eje.etiqueta ? FILA_EXTRA : 0);

  const rotulos: RotuloValor[] = [];
  resueltas.forEach(({ caja, centro }, i) => {
    if (!caja.rotulos) return;
    for (const { valor, deCaja, esMediana } of valoresRotulados(caja)) {
      const x = aPos(valor);
      rotulos.push({
        caja: i,
        valor,
        texto: num(valor),
        posicion: x,
        x,
        y: deCaja ? centro - MEDIA_CAJA - 4 : centro + MEDIA_CAJA + 4 + LETRA * 0.8,
        ancla: "middle",
        fila: deCaja ? "arriba" : "abajo",
        esMediana,
      });
    }
  });

  return {
    ancho: ANCHO,
    alto,
    aPos,
    inicio,
    fin,
    lineaEje,
    areaDesde: MARGEN_SUP,
    areaHasta: lineaEje,
    cajas: resueltas,
    marcas: marcasCajon(eje),
    rotulos,
    etiqueta: eje.etiqueta ? { x: fin, y: alto - 3, ancla: "end" } : null,
  };
}

/**
 * Vertical: un carril por caja, de izquierda a derecha en el orden del JSON,
 * con el nombre bajo el carril; el eje a la izquierda con sus números y la
 * unidad arriba, como el eje y de las otras figuras de datos. Todos los
 * rótulos de una caja van a su derecha, dentro del carril.
 */
function geometriaVertical(figura: FiguraDiagramaCajon): GeometriaCajon {
  const { eje, cajas } = figura;
  const anchoMarcas = Math.max(...marcasCajon(eje).map((m) => anchoTexto(rotuloDeMarca(m, eje))));
  const izq = Math.max(30, anchoMarcas + TICK + 6);
  const der = ANCHO - 8;
  const sup = MARGEN_SUP + (eje.etiqueta ? FILA_EXTRA : 0) + LETRA / 2;
  const inf = sup + ALTO_VERTICAL - 2 * MARGEN_SUP - LETRA;
  const alto = inf + 6 + (hayNombres(figura) ? FILA_EXTRA : 0);
  const aPos = (v: number) => inf - ((v - eje.min) / (eje.max - eje.min)) * (inf - sup);

  const carril = (der - izq) / cajas.length;
  const resueltas: CajaResuelta[] = cajas.map((caja, i) => ({ caja, centro: izq + carril * i + carril / 2, carril }));

  const rotulos: RotuloValor[] = [];
  resueltas.forEach(({ caja, centro }, i) => {
    if (!caja.rotulos) return;
    for (const { valor, deCaja, esMediana } of valoresRotulados(caja)) {
      const y = aPos(valor);
      rotulos.push({
        caja: i,
        valor,
        texto: num(valor),
        posicion: y,
        x: centro + (deCaja ? MEDIA_CAJA : MEDIO_REMATE) + 3,
        y: y + LETRA * 0.35,
        ancla: "start",
        fila: "lado",
        esMediana,
      });
    }
  });

  return {
    ancho: ANCHO,
    alto,
    aPos,
    inicio: inf,
    fin: sup,
    lineaEje: izq,
    areaDesde: izq,
    areaHasta: der,
    cajas: resueltas,
    marcas: marcasCajon(eje),
    rotulos,
    etiqueta: eje.etiqueta ? { x: izq, y: MARGEN_SUP + LETRA * 0.8, ancla: "start" } : null,
  };
}

/* ---------- choques (regla 24) y marcas (regla 22) ---------- */

export interface ChoqueRotulos {
  caja: number;
  /** Los dos valores cuyos rótulos se pisan, o uno solo si desborda su carril o el lienzo. */
  valores: number[];
  motivo: "se-pisan" | "desborda";
}

/**
 * Rótulos de valores que se pisan dentro de una misma fila (horizontal: la de
 * arriba o la de abajo de una caja) o columna (vertical), y rótulos que salen
 * de su carril o del lienzo. Dos valores iguales nunca chocan: comparten
 * rótulo. Vacío si todo cabe.
 */
export function choquesDeRotulos(figura: FiguraDiagramaCajon): ChoqueRotulos[] {
  const g = geometriaCajon(figura);
  const choques: ChoqueRotulos[] = [];
  const grupos = new Map<string, RotuloValor[]>();
  for (const r of g.rotulos) {
    const clave = `${r.caja}|${r.fila}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), r]);
  }
  for (const grupo of grupos.values()) {
    /* Por valor: en vertical el eje crece hacia arriba y la posición en unidades baja. */
    const orden = [...grupo].sort((a, b) => a.valor - b.valor);
    for (let i = 1; i < orden.length; i++) {
      const a = orden[i - 1];
      const b = orden[i];
      const necesario =
        figura.orientacion === "horizontal" ? (anchoTexto(a.texto) + anchoTexto(b.texto)) / 2 + AIRE_ROTULOS : LETRA + AIRE_ROTULOS;
      if (Math.abs(b.posicion - a.posicion) < necesario) choques.push({ caja: a.caja, valores: [a.valor, b.valor], motivo: "se-pisan" });
    }
  }
  for (const r of g.rotulos) {
    const ancho = anchoTexto(r.texto);
    if (figura.orientacion === "horizontal") {
      if (r.x - ancho / 2 < 0 || r.x + ancho / 2 > g.ancho) choques.push({ caja: r.caja, valores: [r.valor], motivo: "desborda" });
    } else {
      const { centro, carril } = g.cajas[r.caja];
      if (r.x + ancho > centro + carril / 2) choques.push({ caja: r.caja, valores: [r.valor], motivo: "desborda" });
    }
  }
  return choques;
}

/**
 * Números del eje que se pisan entre sí: en horizontal, dos marcas vecinas más
 * juntas que el promedio de sus anchos; en vertical, más juntas que una letra.
 * Devuelve el primer par que choca, o null.
 */
export function choqueDeMarcas(figura: FiguraDiagramaCajon): [number, number] | null {
  const g = geometriaCajon(figura);
  const { eje } = figura;
  for (let i = 1; i < g.marcas.length; i++) {
    const a = g.marcas[i - 1];
    const b = g.marcas[i];
    const distancia = Math.abs(g.aPos(b) - g.aPos(a));
    const necesario =
      figura.orientacion === "horizontal"
        ? (anchoTexto(rotuloDeMarca(a, eje)) + anchoTexto(rotuloDeMarca(b, eje))) / 2 + AIRE_ROTULOS
        : LETRA + AIRE_ROTULOS;
    if (distancia < necesario) return [a, b];
  }
  return null;
}
