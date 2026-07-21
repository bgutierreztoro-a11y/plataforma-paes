/* Progreso de la sesión actual, SOLO en memoria de módulo (cliente).
   Sobrevive a la navegación client-side y muere al recargar la página.
   Decisión de privacidad documentada (menores, MOS §7.5): nada de
   localStorage, sessionStorage ni cookies. */

const leccionesCompletadas = new Set<string>();

export function marcarLeccionCompletada(id: string) {
  leccionesCompletadas.add(id);
}

export function esLeccionCompletada(id: string): boolean {
  return leccionesCompletadas.has(id);
}

/* Resultado del diagnóstico de esta misma sesión, para la comparación
   pre/post del cierre (MOS §6). null si no se rindió en esta sesión. */

interface ResultadoSet {
  aciertos: number;
  total: number;
}

let resultadoDiagnostico: ResultadoSet | null = null;

export function guardarResultadoDiagnostico(resultado: ResultadoSet) {
  resultadoDiagnostico = resultado;
}

export function obtenerResultadoDiagnostico(): ResultadoSet | null {
  return resultadoDiagnostico;
}
