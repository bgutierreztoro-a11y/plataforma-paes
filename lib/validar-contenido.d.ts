declare module "../scripts/validar-contenido.mjs" {
  /**
   * `erroresCatalogados` es el mapa `"<unidad>/error-N" → unidad` que arma el
   * runner del validador. Cuando se pasa, `validarDatos` corre además el chequeo
   * inverso (todo `errorCatalogado` referenciado resuelve). La llamada de
   * runtime en `lib/contenido.ts` lo omite a propósito.
   */
  export function validarDatos(
    data: unknown,
    erroresCatalogados?: Map<string, string>,
  ): string[];
  export function validarArchivo(
    ruta: string,
    erroresCatalogados?: Map<string, string>,
  ): string[];
}
