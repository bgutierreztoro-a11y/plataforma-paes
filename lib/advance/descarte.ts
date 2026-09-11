import type { ClaveAlternativa, Dificultad, Habilidad } from "../tipos.ts";

/**
 * Motor del modo descarte (docs/fobos-advance.md §6.1). Puro: sin React, sin
 * reloj propio, sin acceso a disco. Quien lo monta le pasa el tiempo en cada
 * acción y decide qué hacer con los payloads.
 *
 * Decisión firmada (2026-09-11): cada descarte se evalúa al instante y es
 * irreversible. No hay restaurar. Por eso el reducer devuelve el MISMO objeto
 * de estado cuando una acción no cambia nada: así el componente distingue un
 * toque que hizo algo de uno que no, sin comparar campo por campo.
 *
 * Dos claves por alternativa. `clave` es la letra visible, asignada por
 * posición después de mezclar (como en todo el producto, ver lib/mezclar.ts).
 * `claveOriginal` es la del JSON y es estable entre sesiones y estudiantes:
 * es la que va a `ordenDescartes`, `descarteFatal` y a los eventos, porque una
 * letra aleatoria no sirve para analizar nada en F4.
 */

/* ---------- forma cliente del ítem ---------- */

interface AlternativaBase {
  clave: ClaveAlternativa;
  claveOriginal: ClaveAlternativa;
  texto: string;
}

export interface DistractorAdvance extends AlternativaBase {
  esCorrecta: false;
  errorCatalogado: string;
  feedbackDescarte: string;
}

export interface CorrectaAdvance extends AlternativaBase {
  esCorrecta: true;
  feedbackDescarteIncorrecto: string;
}

export type AlternativaAdvance = DistractorAdvance | CorrectaAdvance;

/** Sin `proveniencia`: no viaja al cliente. `solucion` sí, porque el descarte fatal la muestra al instante. */
export interface ItemAdvance {
  id: string;
  unidadId: string;
  moduloId: string;
  habilidad: Habilidad;
  dificultad: Dificultad;
  tiempoReferenciaSeg: number;
  enunciado: string;
  alternativas: AlternativaAdvance[];
  solucion: string;
}

/* ---------- estado de un ítem ---------- */

export type EstadoAlternativa =
  | "intacta"
  | "descartada-correcta"
  | "descartada-por-error"
  | "sobreviviente";

export type FaseItem = "descartando" | "confirmar" | "cerrado-fatal" | "cerrado-confirmado";

/** Lo que se registra por ítem, exacto de §6.1. Claves en forma original. */
export interface RegistroItem {
  itemId: string;
  ordenDescartes: string[];
  erroresIdentificados: string[];
  descarteFatal: string | null;
  tiempoMs: number;
}

export interface EstadoItem {
  item: ItemAdvance;
  fase: FaseItem;
  /* Indexado por la clave VISIBLE, que es la que el estudiante toca. */
  estados: Record<ClaveAlternativa, EstadoAlternativa>;
  ordenDescartes: string[];
  erroresIdentificados: string[];
  descarteFatal: string | null;
  inicioMs: number;
  tiempoMs: number | null;
}

export type AccionItem =
  | { type: "DESCARTAR"; clave: ClaveAlternativa; enMs: number }
  | { type: "CONFIRMAR"; enMs: number };

export function estadoInicialItem(item: ItemAdvance, inicioMs: number): EstadoItem {
  const estados = {} as Record<ClaveAlternativa, EstadoAlternativa>;
  for (const a of item.alternativas) estados[a.clave] = "intacta";
  return {
    item,
    fase: "descartando",
    estados,
    ordenDescartes: [],
    erroresIdentificados: [],
    descarteFatal: null,
    inicioMs,
    tiempoMs: null,
  };
}

function alternativaVisible(estado: EstadoItem, clave: ClaveAlternativa): AlternativaAdvance | undefined {
  return estado.item.alternativas.find((a) => a.clave === clave);
}

export function reducerItem(estado: EstadoItem, accion: AccionItem): EstadoItem {
  switch (accion.type) {
    case "DESCARTAR": {
      if (estado.fase !== "descartando") return estado;
      const alt = alternativaVisible(estado, accion.clave);
      if (!alt || estado.estados[accion.clave] !== "intacta") return estado;

      if (alt.esCorrecta) {
        return {
          ...estado,
          fase: "cerrado-fatal",
          estados: { ...estado.estados, [alt.clave]: "descartada-por-error" },
          ordenDescartes: [...estado.ordenDescartes, alt.claveOriginal],
          descarteFatal: alt.claveOriginal,
          tiempoMs: accion.enMs - estado.inicioMs,
        };
      }

      const estados: Record<ClaveAlternativa, EstadoAlternativa> = {
        ...estado.estados,
        [alt.clave]: "descartada-correcta",
      };
      const ordenDescartes = [...estado.ordenDescartes, alt.claveOriginal];
      const erroresIdentificados = [...estado.erroresIdentificados, alt.errorCatalogado];

      const quedaUna = ordenDescartes.length === estado.item.alternativas.length - 1;
      if (!quedaUna) return { ...estado, estados, ordenDescartes, erroresIdentificados };

      const correcta = estado.item.alternativas.find((a) => a.esCorrecta);
      if (correcta) estados[correcta.clave] = "sobreviviente";
      return { ...estado, fase: "confirmar", estados, ordenDescartes, erroresIdentificados };
    }
    case "CONFIRMAR": {
      if (estado.fase !== "confirmar") return estado;
      return { ...estado, fase: "cerrado-confirmado", tiempoMs: accion.enMs - estado.inicioMs };
    }
  }
}

export function itemCerrado(estado: EstadoItem): boolean {
  return estado.fase === "cerrado-fatal" || estado.fase === "cerrado-confirmado";
}

export function registroDe(estado: EstadoItem): RegistroItem {
  return {
    itemId: estado.item.id,
    ordenDescartes: estado.ordenDescartes,
    erroresIdentificados: estado.erroresIdentificados,
    descarteFatal: estado.descarteFatal,
    tiempoMs: estado.tiempoMs ?? 0,
  };
}

/* ---------- resumen de sesión ---------- */

/** Subconjunto de `ResultadoDeItem` de FranjaDeItems: acá no hay pendientes. */
export type ResultadoItemDescarte = "correcto" | "incorrecto";

export interface ResumenSesion {
  items: number;
  descartesAcertados: number;
  /* Id local del catálogo (`error-7`) o null si no hubo descartes acertados.
     Empate: gana el que apareció primero en la sesión. */
  errorMasFrecuente: string | null;
  resultados: ResultadoItemDescarte[];
}

export function errorMasFrecuente(registros: RegistroItem[]): string | null {
  /* Map conserva el orden de inserción, así que recorrerlo y quedarse solo con
     un máximo ESTRICTAMENTE mayor resuelve el empate a favor del primero que
     apareció. */
  const conteo = new Map<string, number>();
  for (const r of registros) {
    for (const id of r.erroresIdentificados) conteo.set(id, (conteo.get(id) ?? 0) + 1);
  }
  let ganador: string | null = null;
  let maximo = 0;
  for (const [id, n] of conteo) {
    if (n > maximo) {
      ganador = id;
      maximo = n;
    }
  }
  return ganador;
}

export function resumenDeSesion(registros: RegistroItem[]): ResumenSesion {
  return {
    items: registros.length,
    descartesAcertados: registros.reduce((acc, r) => acc + r.erroresIdentificados.length, 0),
    errorMasFrecuente: errorMasFrecuente(registros),
    resultados: registros.map((r) => (r.descarteFatal === null ? "correcto" : "incorrecto")),
  };
}

/* ---------- payloads de eventos (§8) ---------- */
/* Se calculan acá y no en el componente para que sean testeables y para que
   la galería pueda montar el ejecutor sin emitir nada. lib/eventos.ts importa
   estos tipos: una sola fuente. */

export interface PayloadDescarteInicio {
  unidad_id: string;
  items: number;
}

export interface PayloadDescarteAlternativa {
  item_id: string;
  clave: string;
  acertado: boolean;
  /* 1 para el primer descarte del ítem. */
  posicion_en_orden: number;
  /* Desde que se mostró el ítem. */
  ms: number;
}

export interface PayloadDescarteFatal {
  item_id: string;
  clave: string;
}

export interface PayloadDescarteFin {
  unidad_id: string;
  /* Ítems cerrados sin descarte fatal. */
  aciertos: number;
  total: number;
  error_dominante: string | null;
}

export function payloadDescarteInicio(unidadId: string, items: number): PayloadDescarteInicio {
  return { unidad_id: unidadId, items };
}

/**
 * Se calcula sobre el estado PREVIO a aplicar la acción. Devuelve null cuando
 * la acción no descarta nada (ítem cerrado, alternativa ya descartada): ahí no
 * hay evento que emitir.
 */
export function payloadDescarteAlternativa(
  previo: EstadoItem,
  clave: ClaveAlternativa,
  enMs: number,
): PayloadDescarteAlternativa | null {
  if (previo.fase !== "descartando") return null;
  const alt = alternativaVisible(previo, clave);
  if (!alt || previo.estados[clave] !== "intacta") return null;
  return {
    item_id: previo.item.id,
    clave: alt.claveOriginal,
    acertado: !alt.esCorrecta,
    posicion_en_orden: previo.ordenDescartes.length + 1,
    ms: enMs - previo.inicioMs,
  };
}

export function payloadDescarteFatal(estado: EstadoItem): PayloadDescarteFatal | null {
  if (estado.fase !== "cerrado-fatal" || estado.descarteFatal === null) return null;
  return { item_id: estado.item.id, clave: estado.descarteFatal };
}

export function payloadDescarteFin(unidadId: string, registros: RegistroItem[]): PayloadDescarteFin {
  return {
    unidad_id: unidadId,
    aciertos: registros.filter((r) => r.descarteFatal === null).length,
    total: registros.length,
    error_dominante: errorMasFrecuente(registros),
  };
}
