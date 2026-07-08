declare module "../scripts/validar-contenido.mjs" {
  export function validarDatos(data: unknown): string[];
  export function validarArchivo(ruta: string): string[];
}
