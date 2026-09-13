-- 010 · advance_triage
--
-- Una fila por ítem decidido en una sesión del triage de 20 segundos de Fobos
-- Advance (docs/fobos-advance.md §6.5, F5a). Append-only: nunca se actualiza
-- ni se borra una fila. Lo que se guarda es la decisión tal como se tomó, y
-- el tiempo hasta tomarla.
--
-- LO QUE NO SE GUARDA. El veredicto (lectura buena, a revisar, punto
-- regalado, sin veredicto) no es una columna: se calcula en runtime desde el
-- estado de los errores del estudiante (lib/advance/dominio.ts sobre
-- advance_descartes) y nunca se persiste (D17). Un veredicto guardado quedaría
-- viejo en cuanto el historial cambiara.
--
-- decision. Cuatro valores cerrados del producto, con CHECK: resuelvo, dejo,
-- marco y sin-decision. `sin-decision` es el tiempo agotado y no se convierte
-- en `dejo` (D16); en ese caso `ms` es el límite, 20000, y no un instante
-- medido. El CHECK es espejo del validador de lib/advance/triage.ts, no su
-- reemplazo: la ruta responde 400 antes de llegar acá.
--
-- Mismo patrón que la 008 (advance_descartes), y por las mismas razones:
--
-- UNIQUE (usuario_id, sesion_id, item_id). sesion_id lo genera el cliente al
-- montar la sesión (crypto.randomUUID) y viaja con el envío. Un reenvío del
-- mismo cierre trae el mismo sesion_id y los mismos item_id, y el
-- INSERT ... ON CONFLICT DO NOTHING de lib/datos lo deja en nada: gana la
-- primera escritura. Un ítem aparece una sola vez por sesión
-- (lib/advance/triage.ts, seleccionarItems), así que la restricción no
-- rechaza datos válidos.
--
-- SIN FK A usuarios, A PROPÓSITO (decisión firmada 2026-09-11 para la 008,
-- que esta tabla hereda). El espejo de Clerk lo escribe solo el webhook (001)
-- y puede llegar después de la primera sesión de una cuenta nueva. Advance no
-- crea usuarios: ninguna lógica de identidad vive en su path de escritura.
-- Lo que asume esta decisión: no hay ON DELETE CASCADE. LA 007 FUTURA (DELETE
-- de usuarios) TIENE QUE BORRAR TAMBIÉN EN advance_triage por usuario_id,
-- además de advance_descartes. Anotado en docs/pendientes.md. Hasta entonces
-- una cuenta borrada deja filas bajo un id opaco sin PII.
--
-- unidad_id vive en la fila aunque item_id ya la implique: el cotejo con el
-- banco y las lecturas por unidad filtran por ella sin abrir el id del ítem.

CREATE TABLE advance_triage (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- User id de Clerk verificado con auth() en el servidor, nunca del cliente.
  -- Sin FK (ver cabecera).
  usuario_id  text        NOT NULL,
  -- uuid generado en el cliente al montar la sesión (ver cabecera).
  sesion_id   uuid        NOT NULL,
  -- Directorio bajo content/advance/. Sin FK: el contenido vive en el repo.
  unidad_id   text        NOT NULL,
  item_id     text        NOT NULL,
  decision    text        NOT NULL,
  -- Desde que se mostró el ítem hasta la decisión. 20000 si se agotó el tiempo.
  ms          integer     NOT NULL,
  creado_en   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT advance_triage_sesion_item_unico
    UNIQUE (usuario_id, sesion_id, item_id),
  CONSTRAINT advance_triage_decision_valida
    CHECK (decision IN ('resuelvo', 'dejo', 'marco', 'sin-decision')),
  CONSTRAINT advance_triage_ms_no_negativo
    CHECK (ms >= 0)
);

-- Sin índice aparte: el que respalda el UNIQUE empieza por usuario_id y cubre
-- "todo lo de este estudiante"; unidad_id se filtra sobre esas pocas filas.

COMMENT ON TABLE advance_triage IS
  'Una decisión de triage por fila, nunca se actualiza. El veredicto no se guarda.';

-- Permisos del rol de la aplicación, en el formato de la 006: qué código
-- concreto necesita cada privilegio.
--
-- advance_triage · una fila por ítem decidido, jamás se corrige.
-- INSERT: registrarSesionTriage() en lib/datos/advanceTriage.ts, llamada desde
-- POST /api/advance/triage al terminar una sesión. Va con ON CONFLICT DO
-- NOTHING a secas, sin inferencia ni nombre de restricción: con una sola
-- restricción única hace lo mismo.
-- SELECT: listarTriageDeUsuario() en lib/datos/advanceTriage.ts, las filas de
-- un estudiante en una unidad, en orden cronológico. En F5a ninguna ruta la
-- llama todavía: se otorga en esta migración por decisión firmada (D15), para
-- que la lectura de F5b o del reporte no exija una migración de permisos
-- aparte, como sí la exigió la 009.
-- Sin UPDATE ni DELETE: append-only, como respuestas (006) y advance_descartes.
GRANT INSERT, SELECT ON advance_triage TO app_m1;
