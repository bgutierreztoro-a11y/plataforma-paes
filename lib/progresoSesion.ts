/* Estado de la sesión actual, SOLO en memoria de módulo (cliente). Sobrevive a
   la navegación client-side y muere al recargar la página.

   El comentario anterior decía que MOS §7.5 prohibía localStorage. Eso dejó de
   ser cierto el 2026-07-23: la enmienda de esa sección autoriza persistir
   desempeño pedagógico bajo una única clave versionada, y esa capa vive ahora
   en lib/progresoLocal.ts. El avance por lección se mudó allá.

   Lo que queda acá es lo que corresponde que muera con la pestaña: el resultado
   del diagnóstico se usa para la comparación pre/post dentro de una misma
   sesión (MOS §6) y no necesita sobrevivir a un reload. */

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
