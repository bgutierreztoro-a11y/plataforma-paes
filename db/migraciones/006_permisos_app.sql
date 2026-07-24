-- 006 · permisos del rol de la aplicación
--
-- La base tiene dos roles a propósito:
--   neondb_owner  dueño. Crea y altera tablas. Único que corre `npm run migrar`.
--   app_m1        restringido. Con él se conecta todo lo que sirve tráfico.
--
-- POR QUÉ DOS ROLES Y NO UN REVOKE SOBRE EL DUEÑO. En Neon, neondb_owner es
-- miembro de neon_superuser, que a su vez hereda pg_write_all_data. Ese rol
-- predefinido de Postgres otorga INSERT, UPDATE y DELETE sobre TODAS las
-- tablas, así que ningún REVOKE sobre una tabla puntual lo detiene. Por eso
-- app_m1 se creó con CREATE ROLE en SQL plano y NO desde la consola ni la API
-- de Neon: esos caminos otorgan membresía en neon_superuser y la barrera sería
-- falsa. Verificado contra la base el 2026-07-24, antes de otorgar nada:
--   pg_has_role('app_m1','neon_superuser')    = false
--   pg_has_role('app_m1','pg_write_all_data') = false
--   pg_auth_members para app_m1               = 0 filas
--   privilegios de app_m1 sobre las 6 tablas  = todos false
--
-- ALCANCE DE ESTA MATRIZ. Los permisos de abajo reflejan lo que hace el código
-- que existe en esta fase: cuentas, progreso y lectura de entitlements. No hay
-- pagos. Nada en la aplicación extiende ni revoca un entitlement — eso se hace
-- a mano, como dueño. Por eso `entitlements` no lleva UPDATE, y `respuestas`
-- no lleva UPDATE ni DELETE: cada intento es una fila nueva que nunca se
-- corrige.
--
-- CÓMO SE AMPLÍA. Con una migración NUEVA que justifique por escrito qué
-- código concreto necesita el permiso. No se edita esta migración
-- retroactivamente: el aplicador rechaza un archivo ya aplicado cuyo sha256
-- cambió, y esa negativa es intencional. Saber quién pudo hacer qué, y desde
-- cuándo, es parte de la auditoría.
--
-- POR QUÉ FALTA DELETE SOBRE usuarios. Al escribir esta migración el webhook
-- de Clerk no existe: no hay directorio app/api, no hay @clerk/nextjs
-- instalado, y por lo tanto no hay ninguna verificación de firma svix
-- corriendo. Un endpoint que no valida firma, con permiso de DELETE sobre
-- usuarios, dejaría que cualquiera que descubra la URL fabrique un
-- `user.deleted` y borre cuentas — y el ON DELETE CASCADE se llevaría además
-- su progreso, sus respuestas y sus entitlements. El permiso se otorga en la
-- 007, cuando el endpoint valide firma antes de tocar la base. El permiso
-- llega después de la defensa, nunca antes.

-- Tabla de ejemplo del tutorial de Neon. Sus 10 filas son los primeros 10
-- caracteres del md5 de los enteros 1..10 y un random(): datos generados por
-- máquina, sin nada humano. No la produjo ninguna migración y no figura en
-- _migraciones — el esquema debe contener solo lo que las migraciones declaran.
DROP TABLE IF EXISTS playing_with_neon;

-- Acceso base. Hoy app_m1 ya tiene las dos cosas heredadas de PUBLIC, así que
-- estos GRANT son redundantes. Se declaran igual porque son la única parte de
-- su acceso que de otro modo no quedaría escrita en ninguna migración: si
-- alguien endurece los privilegios de PUBLIC, la app deja de conectar y la
-- causa no aparecería documentada en ningún lado.
-- Ojo: el nombre de la base va literal. Si algún día se recrea con otro
-- nombre, esta línea hay que ajustarla en una migración nueva.
GRANT CONNECT ON DATABASE neondb TO app_m1;
GRANT USAGE ON SCHEMA public TO app_m1;

-- usuarios · espejo de Clerk, poblado por el webhook.
-- SELECT: `INSERT ... RETURNING` lo exige, y la capa de datos necesita saber
-- si la fila espejo ya llegó antes de escribir progreso (el webhook puede ir
-- más lento que el redirect posterior al registro).
-- Sin DELETE (ver cabecera).
GRANT SELECT, INSERT, UPDATE ON usuarios TO app_m1;

-- progreso_lecciones · upsert por (usuario_id, leccion_id) en cada paso, y
-- lectura previa para la fusión al migrar desde localStorage.
-- Sin DELETE: nada borra una fila de progreso. Si se borra el usuario, la
-- limpieza la hace el ON DELETE CASCADE, que no exige este privilegio.
GRANT SELECT, INSERT, UPDATE ON progreso_lecciones TO app_m1;

-- respuestas · una fila por intento, jamás se corrige una anterior.
-- SELECT para el delta pre/post del MOS §6 y para contar intentos previos.
GRANT SELECT, INSERT ON respuestas TO app_m1;

-- entitlements · SELECT es el corazón de tieneAcceso(). INSERT solo para el
-- 'm1-libre' con origen 'gratis' que otorga user.created.
GRANT SELECT, INSERT ON entitlements TO app_m1;

-- entitlements_auditoria · SOLO agregar. Nada en la aplicación lee la bitácora
-- en esta fase: se consulta a mano, como dueño, cuando hay una disputa.
GRANT INSERT ON entitlements_auditoria TO app_m1;

-- Redundante hoy: app_m1 nace sin privilegios y sin herencia, así que no hay
-- nada que revocar. Se deja escrito por dos razones. Documenta la intención
-- para quien lea esto dentro de un año, y protege si alguien otorgara
-- privilegios a PUBLIC sobre esta tabla — PUBLIC alcanza a todos los roles.
-- La barrera real es la ausencia de GRANT, no este REVOKE.
REVOKE UPDATE, DELETE ON entitlements_auditoria FROM app_m1;

-- _migraciones no recibe ningún privilegio, a propósito: es estado del
-- aplicador y solo el dueño la toca. No hay REVOKE porque nunca hubo GRANT.
