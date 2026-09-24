/**
 * Control de acceso.
 *
 * `tieneAcceso()` es la única puerta: todo el resto del código pregunta acá y
 * no a la tabla. Chequear `origen === 'compra'` en cualquier otro lugar está
 * prohibido — si el acceso gratuito y el pagado se distinguieran así, la regla
 * quedaría repartida por toda la aplicación y bastaría olvidarla una vez.
 *
 * Por eso 'm1-libre' y 'm1-2027' son productos distintos y no el mismo producto
 * con distinto origen.
 */
import { consultar } from "./db";

/** Lecciones gratuitas. Se otorga solo en user.created. */
export const PRODUCTO_LIBRE = "m1-libre";

/** Fobos Base, ciclo PAES 2027 (docs/recorrido-entrada.md, ADR-04). */
export const PRODUCTO_BASE = "m1-base-2027";

/** Fobos Advance, ciclo PAES 2027. Incluye Base. La prueba de 7 días y las cortesías son de este producto. */
export const PRODUCTO_ADVANCE = "m1-advance-2027";

/** Espejo de db/migraciones/004_entitlements.sql y 011 (origen 'prueba'). */
export interface FilaEntitlement {
  id: string;
  usuario_id: string;
  producto: string;
  origen: "gratis" | "cortesia" | "compra" | "prueba";
  vigencia_desde: Date;
  vigencia_hasta: Date | null;
  referencia_pago: string | null;
  notas: string | null;
  creado_en: Date;
}

/**
 * ¿Este estudiante puede acceder a este producto ahora?
 *
 * Vigente significa las dos cosas: que ya empezó y que no ha terminado.
 * `vigencia_hasta` nula es acceso perpetuo, no "fecha desconocida".
 * `vigencia_desde` se compara además porque un entitlement con fecha futura no
 * debe dar acceso todavía.
 *
 * Puede haber más de una fila para el mismo producto (una cortesía y después
 * una compra). La pregunta es si existe alguna vigente, no cuál.
 */
export async function tieneAcceso(
  usuarioId: string,
  producto: string,
): Promise<boolean> {
  const filas = await consultar<{ existe: number }>(
    "tieneAcceso",
    `SELECT 1 AS existe
       FROM entitlements
      WHERE usuario_id = $1
        AND producto   = $2
        AND vigencia_desde <= now()
        AND (vigencia_hasta IS NULL OR vigencia_hasta > now())
      LIMIT 1`,
    [usuarioId, producto],
  );
  return filas.length > 0;
}

/**
 * Todas las vigencias de un estudiante para un producto, para que
 * `lib/advance/temporada.ts` distinga "nunca contrató" de "su temporada
 * terminó" (`EstadoAdvance`), cosa que el booleano de `tieneAcceso()` no puede
 * decir. Solo fechas: el resto de la fila no hace falta y no se lee.
 *
 * Es la segunda lectura de la tabla y respeta la misma regla: quien pregunte
 * por acceso lo hace acá, nunca con SQL propio. No hay filtro por fecha en la
 * consulta a propósito, el corte por instante lo hace la función pura con un
 * `ahora` inyectado, para que se pruebe sin reloj. Usa el SELECT que la 006
 * ya otorga; sin migración nueva.
 */
export async function vigenciasDe(
  usuarioId: string,
  producto: string,
): Promise<Pick<FilaEntitlement, "vigencia_desde" | "vigencia_hasta">[]> {
  return consultar<Pick<FilaEntitlement, "vigencia_desde" | "vigencia_hasta">>(
    "vigenciasDe",
    `SELECT vigencia_desde, vigencia_hasta
       FROM entitlements
      WHERE usuario_id = $1
        AND producto   = $2
      ORDER BY vigencia_desde ASC`,
    [usuarioId, producto],
  );
}

/**
 * Otorga el acceso gratuito y deja su rastro en la bitácora. Lo llama el
 * webhook en `user.created` (PASO 3). Devuelve true solo si creó un
 * entitlement nuevo.
 *
 * Las dos escrituras van encadenadas en un solo statement con CTE: la fila de
 * auditoría solo existe si el INSERT de entitlements realmente insertó. Si
 * Clerk reintenta el evento, el ON CONFLICT no hace nada y la auditoría
 * tampoco se duplica — sin necesidad de consultarla antes, que además app_m1
 * no puede hacer (no tiene SELECT sobre esa tabla).
 *
 * REGLA NO NEGOCIABLE — el jsonb se arma columna por columna con
 * jsonb_build_object, NUNCA con to_jsonb(fila). `notas` es texto libre para
 * justificar cortesías y puede contener datos identificatorios de terceros
 * ("cortesía para el hermano de la profesora de 2°B"). La bitácora es
 * append-only y no tiene FK a usuarios, así que ese texto sobreviviría al
 * borrado de la cuenta y a cualquier solicitud de supresión: sería PII
 * inmortal e irreversible, contra MOS §7.5 y la ley 21.719. Con to_jsonb
 * bastaría que alguien agregue la columna al RETURNING para colarla sin
 * darse cuenta; con la lista explícita hay que escribirla a mano.
 *
 * El resultado se devuelve desde `nuevo`, NO desde la inserción en la
 * bitácora. En Postgres, `INSERT ... RETURNING` exige privilegio SELECT sobre
 * las columnas devueltas, y app_m1 no lo tiene sobre `entitlements_auditoria`
 * — a propósito. La escritura de auditoría queda en un CTE sin RETURNING: se
 * ejecuta igual, porque Postgres corre las sentencias que modifican datos
 * dentro de un WITH exactamente una vez y hasta el final, las lea o no la
 * consulta principal.
 */
export async function otorgarEntitlementGratis(usuarioId: string): Promise<boolean> {
  const filas = await consultar<{ id: string }>(
    "otorgarEntitlementGratis",
    `WITH nuevo AS (
       INSERT INTO entitlements (usuario_id, producto, origen, vigencia_desde)
       VALUES ($1, $2, 'gratis', now())
       ON CONFLICT (usuario_id, producto, origen) DO NOTHING
       RETURNING id, usuario_id, producto, origen,
                 vigencia_desde, vigencia_hasta, referencia_pago, creado_en
     ),
     auditoria AS (
       INSERT INTO entitlements_auditoria
         (entitlement_id, usuario_id, accion, valor_nuevo, actor)
       SELECT n.id, n.usuario_id, 'creado',
              jsonb_build_object(
                'id',              n.id,
                'usuario_id',      n.usuario_id,
                'producto',        n.producto,
                'origen',          n.origen,
                'vigencia_desde',  n.vigencia_desde,
                'vigencia_hasta',  n.vigencia_hasta,
                'referencia_pago', n.referencia_pago,
                'creado_en',       n.creado_en
              ),
              'sistema'
         FROM nuevo n
     )
     SELECT id FROM nuevo`,
    [usuarioId, PRODUCTO_LIBRE],
  );
  return filas.length > 0;
}
