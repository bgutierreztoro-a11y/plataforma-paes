export class ContenidoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ContenidoInvalidoError";
  }
}
