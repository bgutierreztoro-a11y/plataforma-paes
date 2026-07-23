-- 004 · entitlements
--
-- Núcleo del control de acceso. Nadie consulta esta tabla directamente: todo
-- pasa por tieneAcceso(usuarioId, producto) en lib/datos/. Chequear
-- origen = 'compra' en cualquier otro lugar del código está prohibido.
--
-- Productos de esta fase:
--   'm1-libre'   lecciones gratuitas; se otorga solo en user.created
--   'm1-2027'    curso M1 completo del ciclo PAES 2027 (todavía no se vende)
--
-- Son productos distintos a propósito. Si el acceso gratuito y el pagado
-- compartieran producto, distinguirlos exigiría mirar origen fuera de
-- tieneAcceso() — exactamente lo que la regla anterior prohíbe.
--
-- Modelo comercial que esto sostiene: acceso por ciclo PAES, que vence el 31
-- de diciembre del año de la prueba. Por eso existe vigencia_hasta. Pero el
-- esquema no lo asume: vigencia_hasta nula significa acceso perpetuo y tiene
-- que funcionar igual.
--
-- UNIQUE sobre (usuario_id, producto, origen), no sobre (usuario_id,
-- producto): un estudiante sí puede acumular una cortesía y después una
-- compra del mismo producto, porque son orígenes distintos. Lo que no puede
-- tener es dos filas idénticas en los tres campos.
--
-- Para qué sirve la restricción: Clerk reintenta los webhooks ante timeout o
-- error, así que user.created puede llegar dos veces. Con este UNIQUE, el
-- otorgamiento del entitlement gratuito se escribe con ON CONFLICT DO NOTHING
-- y la segunda entrega no hace nada. Sin él, un reintento dejaría filas
-- duplicadas justo en la tabla que existe para dar certeza.
--
-- Extender una cortesía o una compra es un UPDATE de vigencia_hasta sobre la
-- fila existente (accion 'extendido' en la auditoría), no una fila nueva.

CREATE TABLE entitlements (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      text        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto        text        NOT NULL,
  origen          text        NOT NULL,
  vigencia_desde  timestamptz NOT NULL DEFAULT now(),
  -- NULL = perpetuo. No es "todavía no sé la fecha": es acceso sin
  -- vencimiento, y tieneAcceso() lo trata como vigente para siempre.
  vigencia_hasta  timestamptz,
  -- Número de boleta u otra referencia del SII. Se llena en la fase de pagos.
  referencia_pago text,
  -- Por qué se otorgó una cortesía. Texto interno, nunca visible al estudiante.
  notas           text,
  creado_en       timestamptz NOT NULL DEFAULT now(),

  -- Hace idempotente el otorgamiento vía webhook (ver cabecera).
  CONSTRAINT entitlements_usuario_producto_origen_unico
    UNIQUE (usuario_id, producto, origen),
  CONSTRAINT entitlements_origen_valido
    CHECK (origen IN ('gratis', 'cortesia', 'compra')),
  -- Una vigencia que termina antes de empezar es un error de escritura, no un
  -- entitlement vencido. Que falle al insertarlo.
  CONSTRAINT entitlements_vigencia_coherente
    CHECK (vigencia_hasta IS NULL OR vigencia_hasta > vigencia_desde)
);

-- No hay CREATE INDEX aparte para (usuario_id, producto): el índice que
-- respalda el UNIQUE de arriba empieza por esas dos columnas, así que ya
-- cubre la consulta de tieneAcceso(). Un segundo índice con el mismo prefijo
-- solo costaría escrituras.

COMMENT ON TABLE entitlements IS
  'Control de acceso. Se consulta solo vía tieneAcceso() en lib/datos/.';
COMMENT ON COLUMN entitlements.vigencia_hasta IS
  'NULL = acceso perpetuo, no "fecha desconocida".';
