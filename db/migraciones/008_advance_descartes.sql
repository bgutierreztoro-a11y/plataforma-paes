-- 008 · advance_descartes
--
-- Una fila por ítem resuelto en una sesión del modo descarte de Fobos Advance
-- (docs/fobos-advance.md §6.1). Append-only: nunca se actualiza ni se borra
-- una fila. Lo que se guarda es la decisión tal como se tomó.
--
-- F3 SOLO ESCRIBE. Nada de la aplicación lee esta tabla todavía. El historial,
-- la reanudación y el ocultar ítems ya resueltos son F4 y llegan con su propia
-- migración de permisos que justifique el SELECT.
--
-- IDENTIDAD COMPUESTA DEL ERROR. Los ids de errores_identificados son locales
-- al catálogo de la unidad: 'error-7' existe en porcentaje y puede existir, con
-- otro significado, en otra unidad. Por eso unidad_id vive en la misma fila.
-- La identidad de un error es (unidad_id, id local), nunca el id suelto.
-- Cualquier consulta de F4 que agrupe por error agrupa por los dos.
--
-- CLAVES ORIGINALES. orden_descartes y descarte_fatal guardan la clave del
-- JSON, no la letra visible tras mezclar (lib/advance/descarte.ts). La visible
-- es aleatoria por sesión y no sirve para comparar.
--
-- POR QUÉ text[] Y NO UNA TABLA HIJA. Primera columna de tipo arreglo del
-- esquema (decisión firmada 2026-09-11). El orden de los descartes es un dato
-- en sí (§6.1: leer bien vs adivinar) y un arreglo lo conserva sin columna de
-- posición ni join. Nadie filtra por elemento en F3; si F4 lo necesita, un
-- índice GIN es una migración nueva.
--
-- UNIQUE (usuario_id, sesion_id, item_id). sesion_id lo genera el cliente al
-- montar la sesión (crypto.randomUUID) y viaja con el envío. Un reenvío del
-- mismo cierre trae el mismo sesion_id y los mismos item_id, y el
-- INSERT ... ON CONFLICT DO NOTHING de lib/datos lo deja en nada: gana la
-- primera escritura. Con usuario_id en la clave, cada usuario solo colisiona
-- consigo mismo. Un ítem aparece una sola vez por sesión
-- (lib/advance/seleccion.ts), así que la restricción no rechaza datos válidos.
--
-- SIN FK A usuarios, A PROPÓSITO (decisión firmada 2026-09-11). El espejo de
-- Clerk lo escribe solo el webhook (001), que puede llegar después de la
-- primera sesión de una cuenta nueva. Con FK esa sesión se perdería; como en
-- 005, la fila tiene que poder existir antes que el espejo. Y Advance no crea
-- usuarios: ninguna lógica de identidad vive en su path de escritura.
-- Lo que asume esta decisión: no hay ON DELETE CASCADE. La 007 futura (DELETE
-- de usuarios) tiene que borrar también en advance_descartes. Hasta entonces
-- una cuenta borrada deja filas bajo un id opaco sin PII, igual que hoy
-- progreso y respuestas (app/api/webhooks/clerk/route.ts).

CREATE TABLE advance_descartes (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- User id de Clerk verificado con auth() en el servidor, nunca del cliente.
  -- Sin FK (ver cabecera).
  usuario_id            text        NOT NULL,
  -- uuid generado en el cliente al montar la sesión (ver cabecera).
  sesion_id             uuid        NOT NULL,
  -- Directorio bajo content/advance/. Sin FK: el contenido vive en el repo.
  unidad_id             text        NOT NULL,
  item_id               text        NOT NULL,
  -- Claves originales, en el orden en que se descartaron. Un ítem cerrado
  -- tiene al menos una.
  orden_descartes       text[]      NOT NULL,
  -- Ids locales del catálogo de la unidad, uno por descarte acertado
  -- (identidad compuesta: ver cabecera). Vacío si el primer toque fue fatal.
  errores_identificados text[]      NOT NULL,
  -- Clave original de la correcta si la descartó; NULL si cerró confirmando.
  descarte_fatal        text,
  -- Desde que se mostró el ítem hasta que se cerró. El cliente redondea.
  tiempo_ms             integer     NOT NULL,
  creado_en             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT advance_descartes_sesion_item_unico
    UNIQUE (usuario_id, sesion_id, item_id),
  CONSTRAINT advance_descartes_tiempo_no_negativo
    CHECK (tiempo_ms >= 0)
);

-- Sin índice aparte: el que respalda el UNIQUE empieza por usuario_id y cubre
-- "todo lo de este estudiante". Los índices de las consultas de F4 (por unidad,
-- por error) los define F4 cuando existan esas consultas.

COMMENT ON TABLE advance_descartes IS
  'Un ítem resuelto por fila, nunca se actualiza. Error = (unidad_id, id local).';

-- Permisos del rol de la aplicación, en el formato de la 006: qué código
-- concreto necesita cada privilegio.
--
-- advance_descartes · una fila por ítem resuelto, jamás se corrige.
-- INSERT: registrarSesionDescarte() en lib/datos/advanceDescartes.ts, llamada
-- desde POST /api/advance/sesion al terminar una sesión. Va con
-- ON CONFLICT DO NOTHING a secas, sin inferencia ni nombre de restricción: con
-- una sola restricción única hace lo mismo y no exige SELECT en ningún caso.
-- Sin SELECT: F3 no lee. Se otorga en la migración de F4 con el código que lo
-- use. Sin UPDATE ni DELETE: append-only, como respuestas (006).
GRANT INSERT ON advance_descartes TO app_m1;
