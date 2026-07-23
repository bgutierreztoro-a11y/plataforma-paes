-- 005 · entitlements_auditoria
--
-- Append-only: nunca se actualiza ni se borra una fila de esta tabla.
--
-- Razón de existir: cuando un estudiante reclame que pagó y no tiene acceso,
-- esto es lo único que permite responder con certeza. Una bitácora que se
-- puede editar no sirve para eso.
--
-- Deliberadamente SIN claves foráneas, ni a entitlements ni a usuarios. Si un
-- entitlement se revoca y se borra, o si un usuario ejerce su derecho a
-- supresión y se lleva sus entitlements por cascade, el historial de qué se
-- otorgó y por qué tiene que sobrevivir. Una FK con ON DELETE CASCADE
-- destruiría justamente la evidencia que esta tabla existe para conservar.

CREATE TABLE entitlements_auditoria (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Sin FK a propósito (ver cabecera).
  entitlement_id  uuid        NOT NULL,
  usuario_id      text        NOT NULL,
  accion          text        NOT NULL,
  -- Estado previo de la fila de entitlements. NULL cuando accion = 'creado'.
  valor_anterior  jsonb,
  valor_nuevo     jsonb       NOT NULL,
  -- 'sistema' cuando lo escribió el webhook. Si fue a mano, quién lo hizo.
  actor           text        NOT NULL,
  ocurrido_en     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT entitlements_auditoria_accion_valida
    CHECK (accion IN ('creado', 'extendido', 'revocado')),
  -- Un 'creado' con valor_anterior es incoherente: no había nada antes.
  CONSTRAINT entitlements_auditoria_creado_sin_anterior
    CHECK (accion <> 'creado' OR valor_anterior IS NULL)
);

-- "Muéstrame la historia de este entitlement" y "muéstrame todo lo que se le
-- otorgó a este estudiante": las dos consultas de una disputa real.
CREATE INDEX entitlements_auditoria_entitlement_idx
  ON entitlements_auditoria (entitlement_id);
CREATE INDEX entitlements_auditoria_usuario_idx
  ON entitlements_auditoria (usuario_id, ocurrido_en);

COMMENT ON TABLE entitlements_auditoria IS
  'Append-only. Nunca UPDATE ni DELETE. Sin FK para que sobreviva al borrado.';
