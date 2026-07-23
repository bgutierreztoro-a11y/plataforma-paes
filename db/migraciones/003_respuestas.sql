-- 003 · respuestas
--
-- Cada intento es una fila nueva; nunca se actualiza una respuesta anterior.
-- Eso es lo que permite reconstruir cuántos intentos necesitó un ítem, que es
-- justamente la señal pedagógica que interesa.
--
-- 'diagnostico' y 'cierre' quedan separables por la columna contexto: de eso
-- depende la comparación pre/post del MOS §6. Por eso contexto es una columna
-- propia y no algo que haya que deducir del prefijo de contexto_id — deducirlo
-- funcionaría hoy y se rompería en cuanto una lección se llame 'cierre-algo'.

CREATE TABLE respuestas (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id          text        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  contexto            text        NOT NULL,
  -- id de lección cuando contexto = 'leccion'; 'diagnostico' o 'cierre'
  -- cuando contexto es uno de esos dos.
  contexto_id         text        NOT NULL,
  item_id             text        NOT NULL,
  -- Clave elegida. Hoy siempre 'A'–'D' (CLAUDE.md regla 2), pero sin CHECK:
  -- restringirlo acá obligaría a migrar la tabla si algún día un ítem admite
  -- otro formato de respuesta.
  alternativa_elegida text        NOT NULL,
  correcta            boolean     NOT NULL,
  -- 1 para el primer intento de ese ítem.
  intento             integer     NOT NULL,
  tiempo_ms           integer     NOT NULL,
  respondida_en       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT respuestas_contexto_valido
    CHECK (contexto IN ('diagnostico', 'leccion', 'cierre')),
  CONSTRAINT respuestas_intento_positivo
    CHECK (intento >= 1),
  CONSTRAINT respuestas_tiempo_no_negativo
    CHECK (tiempo_ms >= 0)
);

-- Cubre las dos consultas que importan: todo lo que respondió un estudiante,
-- y su desempeño en un contexto puntual (el pre/post del MOS §6).
CREATE INDEX respuestas_usuario_contexto_idx
  ON respuestas (usuario_id, contexto, contexto_id);

COMMENT ON TABLE respuestas IS
  'Un intento por fila, nunca se actualiza. Base del delta pre/post del MOS 6.';
