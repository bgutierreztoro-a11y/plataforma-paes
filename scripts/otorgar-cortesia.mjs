#!/usr/bin/env node
/**
 * Otorga una cortesía de Fobos Advance a una cuenta que ya existe.
 * Lo corre Benja, a mano (docs/recorrido-entrada.md, Fase 3). Nunca lo corre la app.
 *
 * Uso:
 *   node scripts/otorgar-cortesia.mjs <correo> <hasta>
 *   node scripts/otorgar-cortesia.mjs amigo@correo.cl 2026-12-01
 *
 * <hasta> es una fecha AAAA-MM-DD y la vigencia termina a las 00:00 de ese día,
 * hora de Chile, exclusiva: con 2026-12-01 el acceso vale todo el 30 de
 * noviembre. La conversión de zona la hace Postgres (AT TIME ZONE
 * 'America/Santiago'), así que el horario de verano queda bien sin cuentas a mano.
 *
 * Crea una fila 'm1-advance-2027' con origen 'cortesia' y su rastro en
 * entitlements_auditoria, en un solo statement. Si la cuenta ya tiene una
 * cortesía de Advance, no toca nada y lo dice: extender es otra operación.
 * La persona tiene que haber creado su cuenta antes (la fila de usuarios la
 * escribe el webhook de Clerk).
 *
 * Usa DATABASE_URL_MIGRACIONES, la conexión del dueño: la 006 deja las
 * cortesías como operación manual del dueño, fuera de lo que la app puede hacer.
 * `notas` va fija: nunca texto libre que pueda identificar a alguien.
 */
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCTO_ADVANCE = 'm1-advance-2027';
const NOTAS = 'Cortesía del piloto (scripts/otorgar-cortesia.mjs)';
const ACTOR = 'benja (scripts/otorgar-cortesia.mjs)';

function salirConError(mensaje) {
  console.error(`ERROR  ${mensaje}`);
  process.exit(1);
}

// Mismo resguardo que scripts/migrar.mjs: el volcado por defecto de un error
// del driver incluye la cadena de conexión con la contraseña. Solo texto.
const soloMensaje = (e) =>
  salirConError(
    e?.message || e?.error?.message || e?.reason?.message || e?.code || e?.type ||
    'error asincrónico del driver, sin mensaje (revisa la conectividad a Neon)',
  );
process.on('uncaughtException', soloMensaje);
process.on('unhandledRejection', soloMensaje);

function leerArgumentos() {
  const [correo, hasta] = process.argv.slice(2);
  if (!correo || !hasta) {
    salirConError('Uso: node scripts/otorgar-cortesia.mjs <correo> <hasta AAAA-MM-DD>');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) salirConError(`"${correo}" no parece un correo.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hasta) || Number.isNaN(Date.parse(`${hasta}T00:00:00Z`))) {
    salirConError(`"${hasta}" no es una fecha AAAA-MM-DD.`);
  }
  return { correo, hasta };
}

function cargarEnv() {
  for (const archivo of ['.env.local', '.env']) {
    const ruta = join(RAIZ, archivo);
    if (!existsSync(ruta)) continue;
    try {
      process.loadEnvFile(ruta);
    } catch {
      // Archivo con formato inválido: se ignora y se sigue con el entorno.
    }
  }
}

async function main() {
  const { correo, hasta } = leerArgumentos();
  cargarEnv();
  const url = process.env.DATABASE_URL_MIGRACIONES;
  if (!url) salirConError('Falta DATABASE_URL_MIGRACIONES (la conexión del rol dueño). Ver .env.example.');

  const neon = await import('@neondatabase/serverless');
  if (typeof globalThis.WebSocket !== 'function') {
    salirConError(`Este Node (${process.version}) no expone WebSocket global. Usa Node 22 o superior.`);
  }
  neon.neonConfig.webSocketConstructor = globalThis.WebSocket;
  const pool = new neon.Pool({ connectionString: url });
  pool.on('error', soloMensaje);

  try {
    const { rows: cuentas } = await pool.query(
      'SELECT id FROM usuarios WHERE lower(email) = lower($1)',
      [correo],
    );
    if (cuentas.length === 0) {
      salirConError('No hay cuenta con ese correo. La persona tiene que registrarse primero.');
    }
    const usuarioId = cuentas[0].id;

    const { rows: vence } = await pool.query(
      `SELECT ($1::date)::timestamp AT TIME ZONE 'America/Santiago' AS hasta,
              ($1::date)::timestamp AT TIME ZONE 'America/Santiago' > now() AS futura`,
      [hasta],
    );
    if (!vence[0].futura) salirConError(`${hasta} 00:00 hora de Chile ya pasó.`);

    const { rows: nuevas } = await pool.query(
      `WITH nuevo AS (
         INSERT INTO entitlements (usuario_id, producto, origen, vigencia_desde, vigencia_hasta, notas)
         VALUES ($1, $2, 'cortesia', now(), ($3::date)::timestamp AT TIME ZONE 'America/Santiago', $4)
         ON CONFLICT (usuario_id, producto, origen) DO NOTHING
         RETURNING id, usuario_id, producto, origen, vigencia_desde, vigencia_hasta, referencia_pago, creado_en
       ),
       auditoria AS (
         INSERT INTO entitlements_auditoria (entitlement_id, usuario_id, accion, valor_nuevo, actor)
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
                $5
           FROM nuevo n
       )
       SELECT id, vigencia_hasta FROM nuevo`,
      [usuarioId, PRODUCTO_ADVANCE, hasta, NOTAS, ACTOR],
    );

    if (nuevas.length === 0) {
      const { rows: previa } = await pool.query(
        `SELECT vigencia_hasta FROM entitlements
          WHERE usuario_id = $1 AND producto = $2 AND origen = 'cortesia'`,
        [usuarioId, PRODUCTO_ADVANCE],
      );
      const fin = previa[0]?.vigencia_hasta;
      salirConError(
        `${usuarioId} ya tiene una cortesía de Advance${fin ? ` hasta ${fin.toISOString()}` : ' sin fecha de término'}. No se cambió nada.`,
      );
    }

    console.log(`OK  cortesía ${PRODUCTO_ADVANCE} para ${usuarioId}`);
    console.log(`    vigente hasta ${nuevas[0].vigencia_hasta.toISOString()} (exclusiva; ${hasta} 00:00 hora de Chile)`);
  } finally {
    await pool.end();
  }
}

await main();
