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

export type Estado = "borrador" | "revision" | "publicable";
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
}

export interface BloqueInteractivoSlider {
  tipo: "interactivoSlider";
  variante: "unaVariable" | "dosVariables";
  variables: VariableSlider[];
  instruccion?: string;
  exploracionMinima?: number;
  feedbackExploracionInsuficiente?: string;
  secuenciaMicropreguntas?: MicropreguntaSlider[];
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
  variante: "tabla" | "grafico" | "diagrama";
  descripcion: string;
  datos?: unknown;
}

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

export interface ChecklistOriginalidad {
  enunciadosOriginales: boolean;
  diagramasOriginales: boolean;
  secuenciaOriginal: boolean;
  provenienciaRegistrada: boolean;
  revisadoPor?: string;
  fecha?: string;
}

export interface RevisionMatematica {
  aprobada: boolean;
  revisadoPor?: string;
  fecha?: string;
}

export interface ErrorCatalogado {
  id: string;
  descripcion: string;
}

interface ContenidoBase {
  id: string;
  titulo: string;
  estado: Estado;
  proveniencia: Proveniencia;
  checklistOriginalidad?: ChecklistOriginalidad;
  revisionMatematica?: RevisionMatematica;
  catalogoErrores?: ErrorCatalogado[];
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
