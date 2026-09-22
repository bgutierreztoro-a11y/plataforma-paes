import type { CajaDatos, EjeCajon, FiguraDiagramaCajon } from "./descarte.ts";
import { formatoMarca } from "./planoFuncion.ts";

/**
 * Motor del diagrama de cajón de Advance (components/advance/figuras/
 * DiagramaCajon.tsx). Puro, sin React y sin DOM: decide dónde va cada caja,
 * cada marca y cada rótulo, y el validador (scripts/validar-contenido.mjs,
 * reglas 23, 24 y 27) lo usa para saber si algo se pisa o no cabe. Una sola
 * geometría para el dibujo y para las reglas: si el componente cambia un
 * margen, las reglas lo ven.
 *
 * Declarativo (decisión firmada): cada caja trae sus cinco números en el JSON y
 * esta figura no calcula ningún cuartil. El eje también viene declarado.
 *
 * Letra de 12 px como mínimo (decisión firmada 2026-09-22). El SVG se escala
 * entero con el ancho de su carril, así que la letra renderizada es
 * LETRA · carril / ancho del viewBox. El viewBox de cada ubicación se eligió
 * igual o menor que su carril más angosto a 390 px, medido en /_design:
 *
 * - enunciado: 320 unidades para un carril de 324 px (galería; en descarte y
 *   triage reales es de 358 px);
 * - alternativa: 280 unidades para un carril de 282 px (triage en la galería;
 *   en descarte y triage reales es de 316 px).
 *
 * Con LETRA = 12 la letra nunca baja de 12 px en esos carriles, y en uno más
 * ancho crece hasta el tope de ancho del componente. Todo se calcula en
 * unidades del viewBox; un choque en unidades es un choque a cualquier ancho.
 */

export type ContextoCajon = "enunciado" | "alternativa";

export const ANCHO_POR_CONTEXTO: Record<ContextoCajon, number> = { enunciado: 320, alternativa: 280 };
/** Alto del área de datos en vertical, en las dos ubicaciones. */
export const ALTO_VERTICAL = 240;
export const LETRA = 12;
export const TICK = 3;
/** Aire mínimo entre dos textos vecinos, en unidades. */
export const AIRE_ROTULOS = 2;
/** Media altura de la caja horizontal; en vertical es el tope del medio ancho. */
export const MEDIA_CAJA = 11;
/** Medio largo del remate de cada bigote horizontal. */
export const MEDIO_REMATE = 7;
/** Alto de una fila horizontal: rótulos arriba y abajo de la caja, o sin ellos. */
export const FILA_CON_ROTULOS = 2 * (MEDIA_CAJA + 4 + LETRA) + 6;
export const FILA_SIN_ROTULOS = 2 * MEDIA_CAJA + 16;
/** Alto de la fila de la unidad o de los nombres. */
export const FILA_EXTRA = LETRA + 4;
const MARGEN_LADO = 6;
const MARGEN_SUP = 8;
const SEPARACION_NOMBRE = 8;

/** Topes firmados y de legibilidad. */
export const MAX_CAJAS = 5;
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
  /** Ancho del carril de la caja en el eje transversal (en vertical los rótulos y el nombre van dentro). */
  carril: number;
  /** Medio grosor de la caja y medio largo del remate, en el eje transversal. */
  mediaCaja: number;
  medioRemate: number;
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
  /** Línea base de los nombres: x del nombre en horizontal, y en vertical. */
  nombres: { x: number; y: number };
}

const hayNombres = (figura: FiguraDiagramaCajon) => figura.cajas.some((c) => c.nombre !== undefined);

export function geometriaCajon(figura: FiguraDiagramaCajon, contexto: ContextoCajon = "enunciado"): GeometriaCajon {
  const ancho = ANCHO_POR_CONTEXTO[contexto];
  return figura.orientacion === "horizontal" ? geometriaHorizontal(figura, ancho) : geometriaVertical(figura, ancho);
}

/**
 * Horizontal: una fila por caja, de arriba abajo en el orden del JSON, con el
 * nombre a la izquierda; el eje abajo, con sus números y la unidad bajo el
 * extremo derecho. Rótulos de la caja sobre ella y los del mínimo y el máximo
 * bajo los bigotes, como en la lección. El eje se aparta de los bordes lo que
 * pida la mitad del primer y del último número.
 */
function geometriaHorizontal(figura: FiguraDiagramaCajon, ancho: number): GeometriaCajon {
  const { eje, cajas } = figura;
  const marcas = marcasCajon(eje);
  const mitad = (m: number) => anchoTexto(rotuloDeMarca(m, eje)) / 2 + 2;
  const anchoNombres = hayNombres(figura) ? Math.max(...cajas.map((c) => anchoTexto(c.nombre ?? ""))) + SEPARACION_NOMBRE : 0;
  const inicio = Math.max(MARGEN_LADO, anchoNombres + 4 + 6, mitad(marcas[0]));
  const fin = ancho - Math.max(MARGEN_LADO, mitad(marcas[marcas.length - 1]));
  const aPos = (v: number) => inicio + ((v - eje.min) / (eje.max - eje.min)) * (fin - inicio);

  const alguna = cajas.some((c) => c.rotulos);
  const altoFila = alguna ? FILA_CON_ROTULOS : FILA_SIN_ROTULOS;
  const resueltas: CajaResuelta[] = cajas.map((caja, i) => ({
    caja,
    centro: MARGEN_SUP + altoFila * i + altoFila / 2,
    carril: altoFila,
    mediaCaja: MEDIA_CAJA,
    medioRemate: MEDIO_REMATE,
  }));
  const lineaEje = MARGEN_SUP + altoFila * cajas.length + 4;
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
    ancho,
    alto,
    aPos,
    inicio,
    fin,
    lineaEje,
    areaDesde: MARGEN_SUP,
    areaHasta: lineaEje,
    cajas: resueltas,
    marcas,
    rotulos,
    etiqueta: eje.etiqueta ? { x: fin, y: alto - 4, ancla: "end" } : null,
    nombres: { x: 4, y: 0 },
  };
}

/**
 * Vertical: un carril por caja, de izquierda a derecha en el orden del JSON,
 * con el nombre bajo el carril; el eje a la izquierda con sus números y la
 * unidad arriba, como el eje y de las otras figuras de datos. Todos los
 * rótulos de una caja van a su derecha, dentro del carril. Con carriles
 * angostos (cinco cajas) la caja se adelgaza para dejarles lugar.
 */
function geometriaVertical(figura: FiguraDiagramaCajon, ancho: number): GeometriaCajon {
  const { eje, cajas } = figura;
  const marcas = marcasCajon(eje);
  const anchoMarcas = Math.max(...marcas.map((m) => anchoTexto(rotuloDeMarca(m, eje))));
  const izq = Math.max(24, anchoMarcas + TICK + 6);
  const der = ancho - MARGEN_LADO;
  const sup = MARGEN_SUP + (eje.etiqueta ? FILA_EXTRA : 0) + LETRA / 2;
  const inf = sup + ALTO_VERTICAL - 2 * MARGEN_SUP - LETRA;
  const conNombres = hayNombres(figura);
  const alto = inf + LETRA / 2 + 4 + (conNombres ? FILA_EXTRA : 0);
  const aPos = (v: number) => inf - ((v - eje.min) / (eje.max - eje.min)) * (inf - sup);

  const carril = (der - izq) / cajas.length;
  const mediaCaja = Math.min(MEDIA_CAJA, Math.max(6, carril * 0.16));
  const medioRemate = Math.min(MEDIO_REMATE, mediaCaja * 0.8);
  const resueltas: CajaResuelta[] = cajas.map((caja, i) => ({ caja, centro: izq + carril * i + carril / 2, carril, mediaCaja, medioRemate }));

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
        x: centro + (deCaja ? mediaCaja : medioRemate) + 3,
        y: y + LETRA * 0.35,
        ancla: "start",
        fila: "lado",
        esMediana,
      });
    }
  });

  return {
    ancho,
    alto,
    aPos,
    inicio: inf,
    fin: sup,
    lineaEje: izq,
    areaDesde: izq,
    areaHasta: der,
    cajas: resueltas,
    marcas,
    rotulos,
    etiqueta: eje.etiqueta ? { x: izq, y: MARGEN_SUP + LETRA * 0.8, ancla: "start" } : null,
    nombres: { x: 0, y: alto - 4 },
  };
}

/* ---------- choques y límites (reglas 23, 24 y 27) ---------- */

export interface ChoqueRotulos {
  caja: number;
  /** Los dos valores cuyos rótulos se pisan, o uno solo si desborda su carril o el lienzo. */
  valores: number[];
  motivo: "se-pisan" | "desborda";
}

/**
 * Regla (24). Rótulos de valores que se pisan dentro de una misma fila
 * (horizontal: la de arriba o la de abajo de una caja) o columna (vertical), y
 * rótulos que salen de su carril o del lienzo. Dos valores iguales nunca
 * chocan: comparten rótulo. Vacío si todo cabe.
 */
export function choquesDeRotulos(figura: FiguraDiagramaCajon, contexto: ContextoCajon = "enunciado"): ChoqueRotulos[] {
  const g = geometriaCajon(figura, contexto);
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
 * Regla (23), en vertical: el nombre va centrado bajo su caja y tiene que caber
 * en el carril, o pisa al de al lado. Devuelve los índices de las cajas cuyo
 * nombre no cabe. En horizontal los nombres tienen columna propia: vacío.
 */
export function nombresQueNoCaben(figura: FiguraDiagramaCajon, contexto: ContextoCajon = "enunciado"): number[] {
  if (figura.orientacion === "horizontal") return [];
  const g = geometriaCajon(figura, contexto);
  return g.cajas.flatMap(({ caja, carril }, i) => (caja.nombre !== undefined && anchoTexto(caja.nombre) + AIRE_ROTULOS > carril ? [i] : []));
}

export interface LimiteMarcas {
  /** Cuántas marcas caben en este eje sin que sus números se pisen. */
  maximo: number;
  /** Caracteres del número más largo del eje, que es el que fija el límite en horizontal. */
  caracteres: number;
}

/**
 * Regla (27): cuántas marcas caben en el eje de esta figura con letra de 12. En
 * horizontal cada marca ocupa el ancho del número más largo más el aire; en
 * vertical, una letra de alto más el aire. Se mide sobre el largo real del eje
 * en su ubicación (el de una alternativa es más corto que el del enunciado).
 */
export function limiteDeMarcas(figura: FiguraDiagramaCajon, contexto: ContextoCajon = "enunciado"): LimiteMarcas {
  const g = geometriaCajon(figura, contexto);
  const textos = g.marcas.map((m) => rotuloDeMarca(m, figura.eje));
  const largo = Math.abs(g.fin - g.inicio);
  const porMarca = figura.orientacion === "horizontal" ? Math.max(...textos.map((t) => anchoTexto(t))) + AIRE_ROTULOS : LETRA + AIRE_ROTULOS;
  return { maximo: Math.floor(largo / porMarca + 1e-9) + 1, caracteres: Math.max(...textos.map((t) => t.length)) };
}
