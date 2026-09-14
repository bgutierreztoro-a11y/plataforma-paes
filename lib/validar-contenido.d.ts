declare module "../scripts/validar-contenido.mjs" {
  /**
   * `erroresCatalogados` es el mapa `"<unidad>/<slug>" → unidad` que arma el
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
  /**
   * Contrato completo de un banco Advance (content/advance/<unidadId>/banco.json).
   * `unidadDelDirectorio` y `dirContent` habilitan las reglas que dependen del
   * disco (unidadId = directorio, catálogo del módulo existe); sin
   * `erroresCatalogados` no se cruzan las referencias, igual que en
   * `validarDatos`.
   */
  export function validarDatosBancoAdvance(
    data: unknown,
    unidadDelDirectorio?: string,
    dirContent?: string,
    erroresCatalogados?: Map<string, string>,
  ): string[];
  /**
   * Cobertura de `errorCatalogado` sobre los distractores de un banco
   * Advance: `mapeados/total`, el porcentaje, y los declarados con
   * `sinErrorCatalogado` agrupados por motivo (`sin-declarar` si falta).
   * Es el mismo número que la regla (9) del contrato usa para el piso.
   */
  export function coberturaErrorCatalogadoBanco(data: unknown): {
    total: number;
    mapeados: number;
    porcentaje: number;
    porMotivo: Record<string, number>;
  };
  /**
   * Contrato de forma de un catálogo canónico (content/errores/<unidad>.json),
   * sobre datos ya parseados: `{ unidad, errores[{ id, descripcion, titulo?,
   * apoyo?, repaso? }] }`. `validarCatalogoErrores` es el mismo contrato leyendo
   * el archivo desde `ruta`.
   */
  export function validarDatosCatalogoErrores(data: unknown): string[];
  export function validarCatalogoErrores(ruta: string): string[];
  /**
   * Cobertura del catálogo canónico: todo id de `data.errores[]` está en
   * `referenciados` (ids completos `<unidad>/<slug>` que el módulo usa) o
   * lleva `reservado` con el motivo. Solo la corrida completa del CLI arma
   * `referenciados`; sobre datos en memoria sirve para probar el contrato.
   */
  export function validarCoberturaCatalogo(data: unknown, referenciados: Set<string>): string[];
}
