-- 001 · usuarios
--
-- Espejo mínimo de Clerk. Lo puebla exclusivamente el webhook
-- /api/webhooks/clerk; ningún otro camino escribe acá. Clerk es la fuente de
-- verdad de la identidad — esta tabla existe solo para poder hacer joins y
-- claves foráneas contra el resto del esquema.
--
-- Es el único lugar del esquema donde vive PII. Ni el email ni el nombre se
-- copian a otra tabla, salen al dispositivo o entran a la analítica
-- (CLAUDE.md regla 7, MOS §7.5).

CREATE TABLE usuarios (
  -- User id de Clerk (formato "user_2abc..."), no un uuid nuestro.
  id                text        PRIMARY KEY,
  email             text        NOT NULL UNIQUE,
  -- Opcional: nunca se pide como requisito en el registro.
  nombre            text,
  -- Nula y sin uso en esta fase. Se pedirá en la fase de pagos, no antes.
  -- Existe ahora solo para no tener que migrar la tabla después.
  fecha_nacimiento  date,
  creado_en         timestamptz NOT NULL DEFAULT now(),
  -- La actualiza explícitamente lib/datos/ en cada escritura. No hay trigger
  -- a propósito: toda mutación debe quedar legible en el código, no escondida
  -- en el motor.
  actualizado_en    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE usuarios IS
  'Espejo de Clerk poblado por webhook. Único lugar del esquema con PII.';
