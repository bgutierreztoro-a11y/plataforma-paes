-- 011 · prueba de 7 días y perfil_inicio (docs/recorrido-entrada.md, Fase 3)
--
-- Dos cosas del recorrido de entrada, en una sola transacción:
--
-- 1. entitlements acepta el origen 'prueba' (ADR-04). La prueba es una fila
--    'm1-advance-2027' con origen 'prueba' y 7 días de vigencia, que crea
--    asegurarPrueba() al cargar /bienvenida. Los productos de pago del ciclo
--    2027 son 'm1-base-2027' y 'm1-advance-2027' (Advance incluye Base); viven
--    como constantes en lib/datos/entitlements.ts. 'm1-libre' y el webhook no
--    cambian.
--
--    UNA SOLA PRUEBA POR USUARIO, sea cual sea el producto. El UNIQUE de la 004
--    (usuario_id, producto, origen) ya impide dos pruebas del mismo producto,
--    pero no una segunda prueba de otro producto. El índice único parcial de
--    abajo cierra eso. asegurarPrueba() escribe con ON CONFLICT DO NOTHING sin
--    objetivo, que cubre las dos restricciones: recargar /bienvenida no crea
--    nada nuevo y no revienta.
--
-- 2. perfil_inicio (ADR-03): las respuestas de la bienvenida, el origen del
--    recorrido y la primera parada recomendada. "Ya hizo la bienvenida"
--    significa "existe su fila". parada_iniciada_en la marca una sola vez
--    POST /api/recorrido/inicio al tocar la tarjeta de primera parada: es el
--    paso del embudo de activación que se mide en Neon y no en PostHog (ADR-05).
--
--    CON FK A usuarios Y ON DELETE CASCADE, a diferencia de advance_*: acá la
--    fila de usuarios existe siempre antes, porque /bienvenida la asegura con
--    las mismas funciones del webhook (ADR-04) antes de escribir el perfil. El
--    borrado de la cuenta se lleva el perfil sin trabajo extra en la 007.
--
--    Sin datos personales: respuestas cerradas, ids de contenido y el id del
--    video con el formato de lib/recorrido/video.ts. Los CHECK son espejo de los
--    tipos de lib/eventos.ts (RespuestaP1/P2/P3, TipoParada) y de leerIdVideo,
--    no su reemplazo.

ALTER TABLE entitlements DROP CONSTRAINT entitlements_origen_valido;
ALTER TABLE entitlements ADD CONSTRAINT entitlements_origen_valido
  CHECK (origen IN ('gratis', 'cortesia', 'compra', 'prueba'));

CREATE UNIQUE INDEX entitlements_una_prueba_por_usuario
  ON entitlements (usuario_id)
  WHERE origen = 'prueba';

CREATE TABLE perfil_inicio (
  usuario_id          text        PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  -- NULL: pregunta saltada, o la 3 en la puerta B, donde no se hace.
  p1                  text,
  p2                  text,
  p3                  text,
  saltada             boolean     NOT NULL DEFAULT false,
  -- Origen desde la cookie fobos_origen. Los tres NULL en la puerta B.
  unidad_origen       text,
  error_origen        text,
  video               text,
  -- La primera parada recomendada (docs/recorrido-entrada.md §5).
  parada_tipo         text        NOT NULL,
  -- Ruta interna armada por el código, nunca texto del alumno.
  parada_destino      text        NOT NULL,
  -- NULL hasta que toca la tarjeta; después no cambia.
  parada_iniciada_en  timestamptz,
  creado_en           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT perfil_inicio_p1_valida
    CHECK (p1 IS NULL OR p1 IN ('me_cuestan', 'mas_o_menos', 'me_va_bien')),
  CONSTRAINT perfil_inicio_p2_valida
    CHECK (p2 IS NULL OR p2 IN ('entender_base', 'practicar_prueba', 'encontrar_errores')),
  CONSTRAINT perfil_inicio_p3_valida
    CHECK (p3 IS NULL OR p3 IN ('si', 'no')),
  -- La pregunta 3 solo existe en la puerta A, o sea con origen.
  CONSTRAINT perfil_inicio_p3_solo_con_origen
    CHECK (p3 IS NULL OR unidad_origen IS NOT NULL),
  -- Unidad y error llegan juntos desde la cookie, o no llega ninguno.
  CONSTRAINT perfil_inicio_origen_completo
    CHECK ((unidad_origen IS NULL) = (error_origen IS NULL)),
  CONSTRAINT perfil_inicio_video_con_origen
    CHECK (video IS NULL OR unidad_origen IS NOT NULL),
  CONSTRAINT perfil_inicio_video_formato
    CHECK (video IS NULL OR (video ~ '^v[0-9]{3}-[a-z0-9-]+$' AND length(video) <= 60)),
  CONSTRAINT perfil_inicio_parada_tipo_valida
    CHECK (parada_tipo IN ('leccion', 'diagnostico', 'descarte')),
  CONSTRAINT perfil_inicio_parada_destino_ruta
    CHECK (parada_destino LIKE '/%')
);

COMMENT ON TABLE perfil_inicio IS
  'Bienvenida del recorrido de entrada. Una fila por cuenta; sin datos personales.';
COMMENT ON COLUMN perfil_inicio.parada_iniciada_en IS
  'Se marca una sola vez al tocar la tarjeta de primera parada. Embudo de activación.';

-- Permisos del rol de la aplicación, en el formato de la 006: qué código
-- concreto necesita cada privilegio.
--
-- entitlements · sin cambios. La prueba la inserta asegurarPrueba() con el
-- INSERT que app_m1 ya tiene (006), y su rastro va a entitlements_auditoria
-- con el INSERT que ya tiene. Extender o revocar sigue siendo a mano.
--
-- perfil_inicio
-- INSERT: /bienvenida guarda la fila al terminar o saltar (Fase 4), con
-- ON CONFLICT DO NOTHING: la primera escritura gana.
-- SELECT: la portada y /bienvenida preguntan si existe la fila y qué se
-- recomendó (GET /api/recorrido/inicio, Fase 4).
-- UPDATE solo de parada_iniciada_en: POST /api/recorrido/inicio lo marca
-- con WHERE parada_iniciada_en IS NULL. Ninguna otra columna se corrige
-- después de escrita.
-- Sin DELETE: el borrado llega por la cascada desde usuarios.
GRANT INSERT, SELECT ON perfil_inicio TO app_m1;
GRANT UPDATE (parada_iniciada_en) ON perfil_inicio TO app_m1;
