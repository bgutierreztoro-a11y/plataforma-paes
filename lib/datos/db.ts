/**
 * Acceso a Neon Postgres. Único módulo del proyecto que conoce la cadena de
 * conexión y el único que llama al driver.
 *
 * Se conecta con el rol restringido `app_m1`, no con el dueño. Ese rol no
 * puede crear ni alterar tablas, no puede borrar usuarios, y sobre
 * `entitlements_auditoria` solo puede insertar. Ver
 * db/migraciones/006_permisos_app.sql para la matriz completa y su
 * justificación.
 *
 * Driver HTTP (`neon`) y no `Pool`: ninguna función de este directorio
 * necesita una transacción interactiva, y el driver HTTP no emite eventos
 * asincrónicos —los errores llegan como promesa rechazada—, así que no existe
 * el volcado del objeto de conexión que filtraría la contraseña.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Estos módulos leen DATABASE_URL. Si alguno terminara en un bundle de
// cliente, la variable no estaría definida ahí, pero el import mismo es el
// error: significa que una consulta se está intentando desde el navegador.
if (typeof window !== "undefined") {
  throw new Error(
    "lib/datos solo puede importarse desde el servidor. Un componente de cliente " +
      "debe pasar por una Server Action o un route handler.",
  );
}

export class DatosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosError";
  }
}

/**
 * Extrae texto legible de un error del driver sin tocar el objeto.
 *
 * Nunca `String(e)` ni interpolar el error completo: el objeto de conexión de
 * Neon incluye `connectionString` con la contraseña en claro, y un volcado en
 * un log de servidor es una fuga de credenciales. Si ninguna de estas fuentes
 * da algo legible, se pierde el detalle a propósito.
 */
function mensajeSeguro(e: unknown): string {
  const err = e as { message?: string; error?: { message?: string }; type?: string } | null;
  return err?.message || err?.error?.message || err?.type || "error del driver";
}

let cliente: NeonQueryFunction<false, true> | null = null;

function obtenerCliente(): NeonQueryFunction<false, true> {
  if (cliente) return cliente;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new DatosError(
      "Falta DATABASE_URL (conexión del rol app_m1). Ver .env.example.",
    );
  }
  // fullResults da rowCount, que hace falta para distinguir un upsert que
  // insertó de uno que actualizó.
  cliente = neon(url, { fullResults: true });
  return cliente;
}

/**
 * Punto único de entrada al driver. Toda consulta del directorio pasa por acá,
 * para que el saneamiento del error no dependa de que cada función lo recuerde.
 *
 * `operacion` es el nombre de la función que llama, y sirve para que un error
 * en producción diga qué se estaba haciendo sin exponer el SQL ni los valores.
 */
export async function consultar<T>(
  operacion: string,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  try {
    const resultado = await obtenerCliente().query(sql, params);
    return resultado.rows as T[];
  } catch (e) {
    // Se relanza un error propio, sin `cause`: adjuntar el original volvería a
    // meter el objeto de conexión en cualquier log que serialice la cadena.
    throw new DatosError(`${operacion}: ${mensajeSeguro(e)}`);
  }
}

/**
 * Lote atómico. Todas las sentencias van en una transacción del lado del
 * servidor; si una falla, no se aplica ninguna.
 *
 * Recibe pares [sql, params] en vez de consultas ya construidas para que el
 * driver siga siendo invisible fuera de este módulo.
 */
export async function consultarEnLote(
  operacion: string,
  sentencias: ReadonlyArray<readonly [string, unknown[]]>,
): Promise<void> {
  if (sentencias.length === 0) return;
  const sql = obtenerCliente();
  try {
    await sql.transaction(sentencias.map(([texto, params]) => sql.query(texto, params)));
  } catch (e) {
    throw new DatosError(`${operacion}: ${mensajeSeguro(e)}`);
  }
}
