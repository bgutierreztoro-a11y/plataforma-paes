/**
 * Espejo manual de content/schema/leccion.schema.json. Sin codegen: si el
 * schema cambia, este archivo se actualiza a mano (regla del proyecto).
 */

export const ORDEN_PASOS = [
  "curiosidad",
  "problema",
  "pensar",
  "pistas",
  "descubrimiento",
  "generalizacion",
  "practica",
  "aplicacion",
  "reflexion",
  "consolidacion",
] as const;
export type TipoPaso = (typeof ORDEN_PASOS)[number];

export type Habilidad = "resolver" | "modelar" | "representar" | "argumentar";
export type Dificultad = "baja" | "media" | "alta";
export type ClaveAlternativa = "A" | "B" | "C" | "D";

export interface Alternativa {
  clave: ClaveAlternativa;
  texto: string;
  esCorrecta: boolean;
  feedback?: string;
  errorCatalogado?: string;
}

export interface Item {
  id: string;
  habilidad: Habilidad;
  dificultad: Dificultad;
  enunciado: string;
  alternativas: Alternativa[];
  solucion: string;
}

// ---------- bloques (discriminated union por `tipo`) ----------

export interface BloqueTexto {
  tipo: "texto";
  contenido: string;
  imagen?: string;
}

export interface BloquePrediccion {
  tipo: "prediccion";
  enunciado: string;
  tipoRespuesta: "numero" | "texto" | "seleccionSimple";
  opciones?: string[];
  eventoAnalytics?: string;
}

export interface OpcionSeleccion {
  id: string;
  texto: string;
  esCorrecta: boolean;
  feedback: string;
  errorCatalogado?: string;
}

export interface BloqueSeleccion {
  tipo: "seleccion";
  enunciado: string;
  opciones: OpcionSeleccion[];
}

export interface CampoNumerico {
  id: string;
  etiqueta: string;
  respuestaCorrecta: number;
  unidad?: string;
}

export interface FeedbackPorErrorNumerico {
  campoId: string;
  valorObtenido: number;
  mensaje: string;
  errorCatalogado?: string;
}

export interface BloqueNumerica {
  tipo: "numerica";
  enunciado: string;
  campos: CampoNumerico[];
  feedbackPorError?: FeedbackPorErrorNumerico[];
  feedbackPorDefecto: string;
}

export interface BloqueVerdaderoFalso {
  tipo: "verdaderoFalso";
  enunciado: string;
  respuestaCorrecta: boolean;
  feedbackVerdadero: string;
  feedbackFalso: string;
}

export interface BloqueAbierta {
  tipo: "abierta";
  enunciado: string;
  mostrarRespuestaModelo?: boolean;
  respuestaModelo?: string;
  notaDiseno?: string;
}

export interface BloquePregunta {
  tipo: "pregunta";
  enunciado: string;
  alternativas: Alternativa[];
  notaVerificacionMatematica?: string;
}

export interface VariableSlider {
  nombre: string;
  min: number;
  max: number;
  valorInicial?: number;
  editable: boolean;
}

export interface FeedbackPorPrediccionSlider {
  prediccion: string;
  mensaje: string;
  errorCatalogado?: string;
}

export interface MicropreguntaSlider {
  id: string;
  enunciado: string;
  feedbackPorPrediccion: FeedbackPorPrediccionSlider[];
  mensajeCorrecto?: string;
}

export interface BloqueInteractivoSlider {
  tipo: "interactivoSlider";
  /* El guion pedagógico: `unaVariable` es umbral de exploración, `dosVariables`
     es predice → mueve → comprueba. NO dice qué se dibuja — para eso está
     `objeto`, que es un eje aparte. */
  variante: "unaVariable" | "dosVariables";
  /* Qué se dibuja. Ausente significa "recta", así que todo el contenido escrito
     antes de que existiera la parábola sigue valiendo sin tocarlo.
     Contrato posicional de `variables`: con recta es [m, b]; con parábola es
     [a, b, c], en el orden de lectura de y = ax² + bx + c. */
  objeto?: "recta" | "parabola";
  variables: VariableSlider[];
  instruccion?: string;
  exploracionMinima?: number;
  feedbackExploracionInsuficiente?: string;
  secuenciaMicropreguntas?: MicropreguntaSlider[];
  /* Solo parábola. Marcas opcionales: un paso sobre "¿hacia dónde abre?" no
     tiene por qué regalar el vértice, y uno sobre el vértice no tiene por qué
     mostrar los ceros. */
  mostrarVertice?: boolean;
  mostrarCeros?: boolean;
}

export interface NivelPista {
  nivel: number;
  texto: string;
}

export interface BloquePistas {
  tipo: "pistas";
  condicionActivacion: "bajoDemanda" | "dosIntentosFallidos" | "ambos";
  niveles: NivelPista[];
}

export interface BloqueVisualizacion {
  tipo: "visualizacion";
  variante: "tabla" | "grafico" | "diagrama" | "regla-signos";
  descripcion: string;
  /* Libre salvo seis formas con contrato cerrado, discriminadas por `datos.tipo`:
     `DatosTransformacion`, `DatosSemejanza` y los cuatro `DatosGraficoEstadistico`
     (abajo). Sigue siendo `unknown` porque el resto de las variantes (tabla,
     bandas, figuras, cuerpos) se discrimina por forma en
     `BloqueVisualizacion.tsx`, no por un campo. */
  datos?: unknown;
}

// ---------- datos con contrato cerrado de `bloqueVisualizacion` ----------

/** Coordenada entera [x, y] en [−10, 10]. Espejo de `puntoEntero` del schema. */
export type PuntoEntero = [number, number];

export type TransformacionIsometrica =
  | { tipo: "traslacion"; vector: [number, number] }
  | { tipo: "rotacion"; grados: 90 | 180 | 270; sentido: "antihorario" | "horario"; centro?: PuntoEntero }
  | {
      tipo: "reflexion";
      eje: "x" | "y" | "origen" | { vertical: number } | { horizontal: number };
    };

/** Espejo de `datosTransformacion`. El contrato vivo es `motivoRechazoDatosTransformacion` en lib/transformacionesIsometricas.ts. */
export interface DatosTransformacion {
  tipo: "transformacion";
  figura: PuntoEntero[];
  transformaciones: TransformacionIsometrica[];
  rotulos?: string[];
  rotulosImagen?: string[];
  rotuloVector?: string;
  trazo?: "poligono" | "puntos";
  mostrarImagen?: boolean;
  mostrarIntermedias?: boolean;
}

export interface FiguraSemejanzaDatos {
  vertices: [number, number][];
  cotas: string[];
  rotulos?: string[];
}

export interface TrianguloAnidadoDatos {
  horizontal: number;
  vertical: number;
  etiquetaHorizontal: string;
  etiquetaVertical: string;
}

/** Espejo de `datosSemejanza`. El contrato vivo es `motivoRechazoDatosSemejanza` en lib/semejanza.ts. */
export type DatosSemejanza =
  | {
      tipo: "semejanza";
      disposicion: "ladoALado";
      original: FiguraSemejanzaDatos;
      k: number;
      imagen: { cotas: string[]; rotulos?: string[] };
    }
  | {
      tipo: "semejanza";
      disposicion: "anidada";
      grande: TrianguloAnidadoDatos;
      chica: TrianguloAnidadoDatos;
    };

export interface SerieDatos {
  nombre: string;
  valores: number[];
}

/** Espejo de `datosGraficoBarras`. El contrato vivo es `motivoRechazoDatosGrafico` en lib/estadistica.ts. */
export interface DatosGraficoBarras {
  tipo: "graficoBarras";
  categorias: string[];
  series: SerieDatos[];
  ejeVertical: string;
  ejeTruncado?: boolean;
  ejemploEnganoso?: boolean;
}

/** Espejo de `datosGraficoLineas`. */
export interface DatosGraficoLineas {
  tipo: "graficoLineas";
  categorias: string[];
  series: SerieDatos[];
  ejeVertical: string;
  ejeTruncado?: boolean;
  ejemploEnganoso?: boolean;
}

export interface SectorCircular {
  categoria: string;
  porcentaje?: number;
  angulo?: number;
}

/** Espejo de `datosGraficoCircular`: porcentajes que suman 100, o ángulos que suman 360. */
export interface DatosGraficoCircular {
  tipo: "graficoCircular";
  sectores: SectorCircular[];
  rotulo: "porcentaje" | "angulo";
}

export interface CajonResumen {
  nombre: string;
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
  datos?: number[];
}

export interface MarcaCajon {
  valor: number;
  rotulo: string;
}

/** Espejo de `datosDiagramaCajon`: uno o dos cajones sobre la misma escala. */
export interface DatosDiagramaCajon {
  tipo: "diagramaCajon";
  cajones: CajonResumen[];
  ejeHorizontal: string;
  marcas?: MarcaCajon[];
}

export type DatosGraficoEstadistico =
  | DatosGraficoBarras
  | DatosGraficoLineas
  | DatosGraficoCircular
  | DatosDiagramaCajon;

export type Bloque =
  | BloqueTexto
  | BloquePrediccion
  | BloqueSeleccion
  | BloqueNumerica
  | BloqueVerdaderoFalso
  | BloqueAbierta
  | BloquePregunta
  | BloqueInteractivoSlider
  | BloquePistas
  | BloqueVisualizacion;

export const TIPOS_BLOQUE_VALIDOS = [
  "texto",
  "prediccion",
  "seleccion",
  "numerica",
  "verdaderoFalso",
  "abierta",
  "pregunta",
  "interactivoSlider",
  "pistas",
  "visualizacion",
] as const;

// ---------- paso / contenedores de nivel superior ----------

export interface Paso {
  tipo: TipoPaso;
  titulo: string;
  bloques: Bloque[];
}

export interface Proveniencia {
  fuentesAnalisis: string[];
  declaracionOriginalidad: string;
  autor?: string;
  fecha?: string;
}

interface ContenidoBase {
  id: string;
  /**
   * Unidad del DAG (`content/diagnostico/dag-m1.json`) a la que pertenece el
   * archivo. Declarador único de módulo: de acá sale el catálogo canónico de
   * `content/errores/<moduloId>.json` que resuelve la Capa 2 del feedback.
   *
   * Obligatorio en lección y cierre (lo exige `scripts/validar-contenido.mjs`);
   * opcional en el tipo base sólo porque `DiagnosticoContenido` lo comparte y
   * `content/diagnostico.json` no lo lleva.
   */
  moduloId?: string;
  titulo: string;
  proveniencia: Proveniencia;
  contextosNumericos?: string[];
}

export interface Leccion extends ContenidoBase {
  tipo: "leccion";
  objetivo: string;
  tiempoEstimadoMin: number;
  prerrequisitos: string[];
  conceptos: string[];
  pasos: Paso[];
  itemsPAES: Item[];
}

export interface DiagnosticoContenido extends ContenidoBase {
  tipo: "diagnostico";
  items: Item[];
}

export interface CierreContenido extends ContenidoBase {
  tipo: "cierre";
  items: Item[];
}

export type Contenido = Leccion | DiagnosticoContenido | CierreContenido;
