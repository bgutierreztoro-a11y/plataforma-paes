-- 002 · progreso_lecciones
--
-- Una fila por (estudiante, lección). Es el destino de la migración del
-- progreso anónimo que se guarda en localStorage bajo pm1:progreso:v1.
--
-- Sin PII: id de lección, paso e instantes, nada más. La regla de fusión al
-- migrar ("gana el que tenga más avance, nunca se pierde nada") vive en
-- lib/datos/, no acá: es una decisión de producto, no una restricción del
-- motor.

CREATE TABLE progreso_lecciones (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id     text        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Coincide con el nombre del archivo en content/lecciones/ sin extensión
  -- (ej. 'l2-pendiente-e-intercepto'). Sin FK: el contenido vive en JSON
  -- versionado en el repo, no en la base.
  leccion_id     text        NOT NULL,
  paso_actual    integer     NOT NULL DEFAULT 0,
  completada     boolean     NOT NULL DEFAULT false,
  iniciada_en    timestamptz NOT NULL DEFAULT now(),
  actualizada_en timestamptz NOT NULL DEFAULT now(),

  -- Da además el índice para la consulta natural: el progreso de este
  -- estudiante en esta lección.
  CONSTRAINT progreso_lecciones_usuario_leccion_unica
    UNIQUE (usuario_id, leccion_id),
  CONSTRAINT progreso_lecciones_paso_no_negativo
    CHECK (paso_actual >= 0)
);

COMMENT ON TABLE progreso_lecciones IS
  'Avance por lección. Destino de la migración de pm1:progreso:v1. Sin PII.';
