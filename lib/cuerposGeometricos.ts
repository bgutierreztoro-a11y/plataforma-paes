import {
  escalarPuntosAViewBox,
  type ConfigViewBox,
  type Punto,
} from "./figurasGeometricas.ts";

/**
 * Primitivas de cuerpos geométricos: paralelepípedos, cubos y cilindros, en
 * proyección caballera, más sus desarrollos planos (redes).
 *
 * Vive aparte de `figurasGeometricas.ts` y no dentro de él porque las cinco
 * funciones `vertices*` de ese archivo comparten un contrato explícito en sus
 * docstrings —"base sobre el eje x desde el origen"— que ocho vértices de una
 * caja no cumplen. Lo que sí se reusa, y es la razón de importarlo, es
 * `escalarPuntosAViewBox`: su invariante documentada (una escala ÚNICA para x e
 * y, no una por eje) es exactamente la que un dibujo en perspectiva necesita
 * para no cizallarse.
 */

/** Punto en el espacio, convención matemática: y crece hacia arriba, z hacia el fondo. */
export interface Punto3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Factor de escorzo de la caballera (proyección "cabinet"): la arista de
 * profundidad se dibuja a la MITAD de su largo real, a 45°.
 *
 * Se eligió caballera sobre isométrica porque deja la cara frontal sin
 * deformar: en un módulo cuyo contenido es a·b·c y 2(ab+bc+ac), el estudiante
 * lee a·b sobre un rectángulo de verdad. En isométrica las tres caras son
 * rombos y ninguna se lee como "el rectángulo cuya área es a·b".
 *
 * El precio de esa elección es que el dibujo NO está a escala en profundidad.
 * Ver `docs/reglas-modulo.md` regla 6: ningún ítem puede pedir comparar
 * longitudes de aristas leyéndolas del dibujo.
 */
export const FACTOR_PROFUNDIDAD = 0.5;

const COS_45 = Math.SQRT1_2;

/** X = x + k·z·cos45°, Y = y + k·z·sin45°. */
export function proyectarCaballera(p: Punto3D, k = FACTOR_PROFUNDIDAD): Punto {
  return {
    x: p.x + k * p.z * COS_45,
    y: p.y + k * p.z * COS_45,
  };
}

/**
 * Los 8 vértices de un paralelepípedo, ya proyectados a 2D.
 *
 * `largo` va sobre x, `alto` sobre y, `ancho` sobre z (la profundidad). Es la
 * lectura habitual de una caja apoyada en una mesa: la base mide largo × ancho
 * y el alto sube.
 *
 * Orden fijo, del que dependen `CARAS_VISIBLES`, `SILUETA`, `ARISTAS_OCULTAS` y
 * `ARISTAS_ACOTADAS`: 0–3 la cara frontal (z=0) en sentido antihorario desde el
 * vértice inferior-izquierdo, 4–7 la cara trasera (z=ancho) en el mismo orden.
 */
export function verticesParalelepipedo(
  largo: number,
  ancho: number,
  alto: number,
  k = FACTOR_PROFUNDIDAD,
): Punto[] {
  if (!(largo > 0) || !(ancho > 0) || !(alto > 0)) {
    throw new Error(
      `largo, ancho y alto deben ser positivos (recibido: ${largo}, ${ancho}, ${alto})`,
    );
  }
  const crudos: Punto3D[] = [
    { x: 0, y: 0, z: 0 },
    { x: largo, y: 0, z: 0 },
    { x: largo, y: alto, z: 0 },
    { x: 0, y: alto, z: 0 },
    { x: 0, y: 0, z: ancho },
    { x: largo, y: 0, z: ancho },
    { x: largo, y: alto, z: ancho },
    { x: 0, y: alto, z: ancho },
  ];
  return crudos.map((p) => proyectarCaballera(p, k));
}

/**
 * Índices de las 3 caras que se ven, en orden de dibujo (la frontal encima).
 * Con la profundidad yendo hacia arriba-derecha, las visibles son la frontal,
 * la superior y la derecha.
 */
export const CARAS_VISIBLES = {
  frontal: [0, 1, 2, 3],
  superior: [3, 2, 6, 7],
  derecha: [1, 5, 6, 2],
} as const;

/** Los 6 vértices del contorno del sólido, en orden. El 2 y el 4 quedan dentro. */
export const SILUETA = [0, 1, 5, 6, 7, 3] as const;

/**
 * Las 3 aristas que concurren en el vértice oculto (índice 4, el
 * trasero-inferior-izquierdo). Se dibujan punteadas.
 */
export const ARISTAS_OCULTAS = [
  [4, 5],
  [4, 7],
  [4, 0],
] as const;

/**
 * Las 3 aristas que llevan cota, una por dimensión. SIEMPRE van rotuladas en
 * vista "solido": no hay modo sin cotas (`docs/reglas-modulo.md` regla 6).
 *
 * Forman el camino 3→0→1→5, o sea el "codo" que baja por la izquierda de la
 * cara frontal, cruza su base y sigue hacia el fondo. Son mutuamente
 * perpendiculares en el espacio y —esto es lo que las eligió— las tres son
 * VISIBLES.
 *
 * La tentación es tomar las tres que concurren en el vértice frontal-inferior-
 * izquierdo (0→1, 0→3, 0→4), pero 0→4 es una de las aristas ocultas: el vértice
 * 4 cae dentro de la silueta y esa arista se dibuja punteada. Poner una cota
 * sobre una arista punteada le pide al estudiante que mida algo que el dibujo
 * está declarando que no se ve. Se usa 1→5 en su lugar, que es la misma
 * dirección y el mismo largo, sobre la arista visible del borde inferior derecho.
 */
export const ARISTAS_ACOTADAS = [
  { desde: 0, hasta: 1, dimension: "largo" },
  { desde: 3, hasta: 0, dimension: "alto" },
  { desde: 1, hasta: 5, dimension: "ancho" },
] as const;

/** Razón entre la arista mayor y la menor. Vale 1 en un cubo. */
export function razonAristas(largo: number, ancho: number, alto: number): number {
  return Math.max(largo, ancho, alto) / Math.min(largo, ancho, alto);
}

/**
 * Largo en píxeles de la más corta de las 3 aristas acotadas, ya proyectada y
 * escalada al viewBox. Es la guarda que decide si un cuerpo es dibujable: una
 * arista más corta que `ARISTA_MINIMA_PX` no admite su cota sin pisar la vecina.
 *
 * La razón sola no sirve como predictor, y por eso existe esta función: la
 * arista de profundidad carga una penalización doble (el escorzo `k` MÁS la
 * escala del viewBox), así que dos cajas de la misma razón pueden dar
 * resultados incomparables. Medido el 2026-08-26 con MARGEN = 28: 100×10×100
 * da 13.6 px y 100×100×10 da 7.0 px, ambas de razón 10.
 */
export function aristaMasCortaEnPantalla(
  largo: number,
  ancho: number,
  alto: number,
  viewBox: ConfigViewBox,
  k = FACTOR_PROFUNDIDAD,
): number {
  const v = escalarPuntosAViewBox(verticesParalelepipedo(largo, ancho, alto, k), viewBox);
  return Math.min(
    ...ARISTAS_ACOTADAS.map(({ desde, hasta }) =>
      Math.hypot(v[hasta].x - v[desde].x, v[hasta].y - v[desde].y),
    ),
  );
}

/**
 * Umbral de legibilidad de una arista acotada, en píxeles del viewBox.
 *
 * 14 px es donde una etiqueta de `fontSize="11"` todavía se posa sin pisar la
 * arista vecina. Calibrado el 2026-08-26 contra el corpus real: las 14 figuras
 * de `figuras-geometricas` ya en producción tienen una arista mínima de 32.4 px
 * y una razón máxima de 4.4, o sea que ningún contenido escrito hasta hoy se
 * acerca al límite.
 */
export const ARISTA_MINIMA_PX = 14;

/**
 * Tope de razón entre aristas. Existe para dar un mensaje legible a quien
 * escribe contenido ("esta caja es demasiado alargada") antes de que
 * `aristaMasCortaEnPantalla` conteste con un número de píxeles.
 *
 * No reemplaza a la guarda en píxeles: por sí sola dejaría pasar 100×100×10,
 * que tiene razón 10 pero colapsa a 7.0 px.
 */
export const RAZON_MAXIMA = 4;

/**
 * Motivo por el que un paralelepípedo no es dibujable, o `null` si lo es.
 *
 * Devuelve el motivo en vez de lanzar porque el llamador es el type guard de
 * `BloqueVisualizacion`, que necesita un booleano para dejar caer el bloque al
 * `<figure>` de texto en vez de reventar la página. Lo que sí lanza es
 * `verticesParalelepipedo`, y solo ante imposibilidad geométrica (medida ≤ 0),
 * igual que `verticesTrapecio` en `figurasGeometricas.ts`.
 */
export function motivoRechazoParalelepipedo(
  largo: number,
  ancho: number,
  alto: number,
  viewBox: ConfigViewBox,
): string | null {
  if (!(largo > 0) || !(ancho > 0) || !(alto > 0)) {
    return `largo, ancho y alto deben ser positivos (recibido: ${largo}, ${ancho}, ${alto})`;
  }
  const razon = razonAristas(largo, ancho, alto);
  if (razon > RAZON_MAXIMA) {
    return `la caja es demasiado alargada para dibujarla con sus tres cotas: la razón entre la arista mayor y la menor es ${razon.toFixed(1)} y el tope es ${RAZON_MAXIMA}`;
  }
  const arista = aristaMasCortaEnPantalla(largo, ancho, alto, viewBox);
  if (arista < ARISTA_MINIMA_PX) {
    return `la arista más corta mide ${arista.toFixed(1)} px en pantalla y no admite su cota (mínimo ${ARISTA_MINIMA_PX} px)`;
  }
  return null;
}

/**
 * Banda de razón altura/radio de un cilindro dibujable.
 *
 * Medido el 2026-08-26: bajo 0.25 el cuerpo queda más aplastado que sus tapas y
 * deja de leerse como cilindro; sobre 8 el radio baja de ~16 px y no admite su
 * cota. El cilindro tolera más que la caja porque no tiene tres aristas
 * compitiendo por el mismo bounding box.
 */
export const RAZON_CILINDRO_MIN = 0.25;
export const RAZON_CILINDRO_MAX = 8;

export function motivoRechazoCilindro(radio: number, altura: number): string | null {
  if (!(radio > 0) || !(altura > 0)) {
    return `radio y altura deben ser positivos (recibido: ${radio}, ${altura})`;
  }
  const razon = altura / radio;
  if (razon < RAZON_CILINDRO_MIN) {
    return `el cilindro es demasiado chato para dibujarlo: altura/radio es ${razon.toFixed(2)} y el mínimo es ${RAZON_CILINDRO_MIN}`;
  }
  if (razon > RAZON_CILINDRO_MAX) {
    return `el cilindro es demasiado esbelto para rotular su radio: altura/radio es ${razon.toFixed(2)} y el tope es ${RAZON_CILINDRO_MAX}`;
  }
  return null;
}

export interface CilindroEnViewBox {
  centroSuperior: Punto;
  centroInferior: Punto;
  /** Semieje horizontal de las tapas: el radio real, escalado. */
  rx: number;
  /** Semieje vertical: `rx · k`. Es lo que convierte el círculo en elipse en perspectiva. */
  ry: number;
}

/**
 * Un cilindro recto de pie, en el mismo lenguaje visual que la caballera: las
 * tapas son elipses con `ry = rx · k`, no círculos.
 *
 * No reusa `calcularCirculoEnViewBox` de `figurasGeometricas.ts` a propósito:
 * esa función devuelve un círculo centrado y acá hacen falta dos elipses a
 * alturas distintas. En unidades de datos el dibujo ocupa `2·radio` de ancho y
 * `altura + 2·radio·k` de alto, contando las dos medias tapas que sobresalen.
 */
export function calcularCilindroEnViewBox(
  radio: number,
  altura: number,
  viewBox: ConfigViewBox,
  k = FACTOR_PROFUNDIDAD,
): CilindroEnViewBox {
  if (!(radio > 0) || !(altura > 0)) {
    throw new Error(`radio y altura deben ser positivos (recibido: ${radio}, ${altura})`);
  }
  const areaAncho = viewBox.ancho - viewBox.margen * 2;
  const areaAlto = viewBox.alto - viewBox.margen * 2;
  const anchoDatos = radio * 2;
  const altoDatos = altura + 2 * radio * k;
  const escala = Math.min(areaAncho / anchoDatos, areaAlto / altoDatos);
  const rx = radio * escala;
  const ry = radio * k * escala;
  const cx = viewBox.margen + areaAncho / 2;
  const arriba = viewBox.margen + (areaAlto - altoDatos * escala) / 2;
  return {
    centroSuperior: { x: cx, y: arriba + ry },
    centroInferior: { x: cx, y: arriba + ry + altura * escala },
    rx,
    ry,
  };
}

export interface CaraDesarrollo {
  /** Qué cara del cuerpo es. Se usa para rotularla y para colorearla por par. */
  nombre: string;
  /** Los 4 vértices del rectángulo, en unidades de datos y convención matemática. */
  puntos: [Punto, Punto, Punto, Punto];
}

/**
 * Desarrollo plano del paralelepípedo, en cruz: la fila horizontal lleva las 4
 * caras laterales y la columna vertical cierra con la base y la tapa.
 *
 * A diferencia del sólido, esto es una figura PLANA: no pasa por la caballera y
 * va directo a `escalarPuntosAViewBox`. Las 6 caras suman exactamente el área
 * de superficie 2(largo·ancho + largo·alto + ancho·alto), que es justamente lo
 * que la red existe para hacer visible.
 */
export function verticesDesarrolloParalelepipedo(
  largo: number,
  ancho: number,
  alto: number,
): CaraDesarrollo[] {
  if (!(largo > 0) || !(ancho > 0) || !(alto > 0)) {
    throw new Error(
      `largo, ancho y alto deben ser positivos (recibido: ${largo}, ${ancho}, ${alto})`,
    );
  }
  const rect = (x0: number, y0: number, w: number, h: number, nombre: string): CaraDesarrollo => ({
    nombre,
    puntos: [
      { x: x0, y: y0 },
      { x: x0 + w, y: y0 },
      { x: x0 + w, y: y0 + h },
      { x: x0, y: y0 + h },
    ],
  });
  const filaY = ancho;
  const frenteX = ancho;
  return [
    rect(0, filaY, ancho, alto, "izquierda"),
    rect(frenteX, filaY, largo, alto, "frente"),
    rect(frenteX + largo, filaY, ancho, alto, "derecha"),
    rect(frenteX + largo + ancho, filaY, largo, alto, "atrás"),
    rect(frenteX, 0, largo, ancho, "base"),
    rect(frenteX, filaY + alto, largo, ancho, "tapa"),
  ];
}

export interface DesarrolloCilindro {
  /** El manto: un rectángulo de ancho `2πr` y alto `altura`. */
  manto: [Punto, Punto, Punto, Punto];
  tapaSuperior: { centro: Punto; radio: number };
  tapaInferior: { centro: Punto; radio: number };
}

/**
 * Desarrollo plano del cilindro: el manto desenrollado es un rectángulo cuyo
 * ancho es la circunferencia `2πr`, más las dos tapas circulares tangentes a
 * sus bordes. Las áreas suman 2πr² + 2πrh.
 *
 * Que el ancho del rectángulo sea `2πr` y no otra cosa es el descubrimiento
 * completo del área de superficie de un cilindro; por eso la red no es
 * decorativa acá.
 */
export function verticesDesarrolloCilindro(radio: number, altura: number): DesarrolloCilindro {
  if (!(radio > 0) || !(altura > 0)) {
    throw new Error(`radio y altura deben ser positivos (recibido: ${radio}, ${altura})`);
  }
  const circunferencia = 2 * Math.PI * radio;
  const cx = circunferencia / 2;
  const baseY = 2 * radio;
  return {
    manto: [
      { x: 0, y: baseY },
      { x: circunferencia, y: baseY },
      { x: circunferencia, y: baseY + altura },
      { x: 0, y: baseY + altura },
    ],
    tapaInferior: { centro: { x: cx, y: radio }, radio },
    tapaSuperior: { centro: { x: cx, y: baseY + altura + radio }, radio },
  };
}
