# PROMPT — Fase 2: persistencia, cuentas y entitlements

## Cómo usarlo

1. Guarda este archivo como `docs/prompt-fase-clerk.md` en el repo.
2. En la terminal: `claude` → plan mode (Shift+Tab).
3. Escribe: `Lee @docs/prompt-fase-clerk.md y ejecuta el PASO 0`.
4. **Un paso a la vez.** CC se detiene en cada checkpoint y espera confirmación explícita.
5. No apruebes un plan que reabra decisiones ya tomadas más abajo.

---

## Contexto para Claude Code

Ya tienes CLAUDE.md y docs/mos-v2.md; no los repitas. Esta sesión agrega
persistencia de datos, cuentas opcionales y control de acceso. **No incluye pagos**
ni rediseño visual: si el plan los toca, está mal.

### Entregable de la sesión

Un estudiante puede: entrar sin cuenta y hacer la lección completa (como hoy) →
ver un aviso discreto de "crea una cuenta para guardar tu avance" → crear cuenta
con email → y encontrar su progreso previo ya migrado, sin haberlo perdido.
Además existe una tabla de entitlements funcional que distingue acceso gratuito,
de cortesía y comprado, aunque todavía no haya nada que comprar.

`npm run validar`, `npm run lint` y `npm run build` en verde.

---

## DECISIONES YA TOMADAS — no las reabras

Si detectas una ambigüedad no cubierta acá, **pregunta en vez de asumir**.

### Autenticación
- **Clerk**, solo email + código de verificación. **Sin social login** (sin Google,
  sin Apple, sin GitHub): reduce datos de terceros y superficie legal.
- Nombre y foto de perfil: **opcionales**, nunca requeridos.
- **NO pedir fecha de nacimiento en el registro.** El campo existe en el esquema,
  nulo. Se pedirá en la fase de pagos, no antes.
- La cuenta es **opcional en todo momento**. Ninguna lección gratuita queda detrás
  del login. Nunca mostrar un muro de registro al entrar.

### Next.js 16 — detalle crítico
- El proyecto usa **Next.js 16.2.10**. En Next ≥16 el archivo de Clerk se llama
  **`proxy.ts`**, NO `middleware.ts`. Verifica la versión en package.json antes de
  crear el archivo y usa el nombre correcto.
- **No confiar solo en el middleware/proxy para autorización** (CVE-2025-29927).
  Toda verificación de acceso ocurre además en la capa que lee los datos.

### Base de datos
- **Neon Postgres** vía el marketplace de Vercel (tier gratuito). Si detectas un
  bloqueo real para usar Neon, detente y explícamelo — no lo sustituyas por tu
  cuenta.
- Driver `@neondatabase/serverless`. **SQL plano**, sin ORM. Migraciones en
  archivos `.sql` numerados en `db/migraciones/`, aplicadas por un script simple.
  Razón: quiero poder leer y auditar cada query sin capas de abstracción.
- Dependencias nuevas permitidas en esta fase, y solo estas:
  `@clerk/nextjs`, `@neondatabase/serverless`. Nada más.

### Progreso anónimo
- Se guarda en `localStorage` bajo una única clave versionada:
  `pm1:progreso:v1`.
- **Solo se guardan**: id de lección, índice de paso, respuestas por item id,
  timestamps. **Prohibido** guardar nombre, email, o cualquier dato que
  identifique a la persona.
- Al crear cuenta, el progreso local se migra al servidor y **se borra del
  dispositivo**. La migración es idempotente: si ya existe progreso en el
  servidor para esa lección, gana el que tenga más avance, nunca se pierde nada.
- Si `localStorage` no está disponible (modo privado, cuota llena), la app
  funciona igual, sin persistir. No debe romperse.

### Analítica
- Se mantiene sin PII. **Prohibido** `posthog.identify()` con email o nombre.
  Si se identifica, es solo con el user id opaco de Clerk.
- Autocapture y session recording siguen desactivados (MOS §7.5).

---

## PASO 0 — Enmendar la regla de persistencia (hacer PRIMERO)

MOS §7.5 y CLAUDE.md Regla 7 prohíben hoy persistir cualquier dato del
estudiante, incluido `localStorage`. Esta fase lo cambia deliberadamente.

Tu tarea en este paso es **solo documental, sin tocar código**:

1. Lee la redacción actual de esa regla en ambos archivos.
2. Propóneme una redacción enmendada que permita persistencia de progreso
   pedagógico (no identificatorio) y siga prohibiendo PII, autocapture y
   session recording.
3. **No edites nada todavía.** Muéstrame el antes y el después y espera mi
   aprobación.

**CHECKPOINT 0.** Detente acá.

---

## PASO 1 — Esquema de datos

Escribe las migraciones SQL. Solo archivos `.sql` y el script que las aplica;
sin lógica de aplicación todavía.

### Tablas

**`usuarios`** — espejo mínimo de Clerk, poblado por webhook.
- `id` (texto, PK, = user id de Clerk)
- `email` (texto, único, no nulo)
- `nombre` (texto, nulo)
- `fecha_nacimiento` (date, **nulo**, sin usar todavía)
- `creado_en`, `actualizado_en` (timestamptz)

**`progreso_lecciones`**
- `id` (uuid, PK)
- `usuario_id` (FK → usuarios, on delete cascade)
- `leccion_id` (texto)
- `paso_actual` (int)
- `completada` (bool, default false)
- `iniciada_en`, `actualizada_en`
- Única por (`usuario_id`, `leccion_id`)

**`respuestas`**
- `id` (uuid, PK)
- `usuario_id` (FK → usuarios, on delete cascade)
- `contexto` (texto: `'diagnostico' | 'leccion' | 'cierre'`)
- `contexto_id` (texto: id de lección, o `'diagnostico'` / `'cierre'`)
- `item_id` (texto)
- `alternativa_elegida` (texto)
- `correcta` (bool)
- `intento` (int)
- `tiempo_ms` (int)
- `respondida_en`
- Índice por (`usuario_id`, `contexto`, `contexto_id`)

**Nota importante:** `diagnostico` y `cierre` deben quedar separables en la
consulta, porque la comparación pre/post de MOS §6 depende de eso.

**`entitlements`** — el núcleo de esta fase.
- `id` (uuid, PK)
- `usuario_id` (FK → usuarios, on delete cascade)
- `producto` (texto, ej. `'m1-2027'`)
- `origen` (texto: `'gratis' | 'cortesia' | 'compra'`)
- `vigencia_desde` (timestamptz, no nulo)
- `vigencia_hasta` (timestamptz, **nulo** = acceso perpetuo)
- `referencia_pago` (texto, nulo — para el número de boleta más adelante)
- `notas` (texto, nulo — por qué se otorgó una cortesía)
- `creado_en`
- Índice por (`usuario_id`, `producto`)

Modelo comercial que esto debe soportar: **acceso por ciclo PAES**. Se vende el
curso M1 completo y el acceso vence el 31 de diciembre del año de la PAES del
estudiante. Por eso `vigencia_hasta` existe. Pero el esquema no debe asumirlo:
un entitlement con `vigencia_hasta` nulo es perpetuo y debe funcionar igual.

**`entitlements_auditoria`** — append-only, nunca se actualiza ni se borra.
- `id` (uuid, PK)
- `entitlement_id` (uuid)
- `usuario_id` (texto)
- `accion` (texto: `'creado' | 'extendido' | 'revocado'`)
- `valor_anterior` (jsonb, nulo)
- `valor_nuevo` (jsonb)
- `actor` (texto: `'sistema'` o identificador de quien lo hizo a mano)
- `ocurrido_en`

Razón de esta tabla: cuando un usuario reclame que pagó y no tiene acceso,
esto es lo único que permite responder con certeza.

**CHECKPOINT 1.** Muéstrame las migraciones y espera aprobación antes de
aplicarlas.

---

## PASO 2 — Capa de acceso a datos

Crea `lib/datos/` con funciones tipadas. Reglas:

- **Ninguna query SQL fuera de esta carpeta.** Ningún componente arma SQL.
- Toda función que lee datos de un usuario recibe el `usuarioId` verificado
  desde el servidor con `auth()` de Clerk — **nunca** desde un parámetro que
  venga del cliente. Este es el punto donde se cumple lo del CVE: la
  autorización vive acá, no solo en el proxy.
- Una única función `tieneAcceso(usuarioId, producto): Promise<boolean>` que
  consulta entitlements y evalúa vigencia. **Todo el resto del código pregunta
  solo a esta función.** Prohibido chequear `origen === 'compra'` en otro lado.
- Cero `any`. Tipos explícitos para cada fila.

**CHECKPOINT 2.**

---

## PASO 3 — Clerk

- Instala `@clerk/nextjs`, `ClerkProvider` en el layout raíz.
- Crea el archivo de proxy con el **nombre correcto para Next 16** (`proxy.ts`).
- Por defecto **ninguna ruta protegida**: todo público. La protección se agrega
  solo donde haga falta, y siempre además en la capa de datos.
- Rutas `/ingresar` y `/registrarse` con los componentes de Clerk, localizados
  al español. Textos en español de Chile, tono cercano pero serio.
- Webhook `/api/webhooks/clerk` que sincroniza `usuarios`:
  - **REQUISITO BLOQUEANTE — verificación de firma svix.** El endpoint valida
    la cabecera `svix-signature` contra el signing secret de Clerk **antes de
    parsear el evento y antes de tocar la base de datos**, para todos los
    eventos sin excepción, incluido `user.deleted`. Si la firma no valida:
    responder 401 y no ejecutar ninguna query. No se escribe una sola línea
    del manejo de eventos antes de que esta verificación exista y esté
    probada. Razón: sin firma verificada, cualquiera que descubra la URL
    puede fabricar un `user.deleted` y borrar cuentas — y por el
    `ON DELETE CASCADE` se lleva también progreso, respuestas y entitlements.
  - **El rol `app_m1` NO tiene permiso de `DELETE` sobre `usuarios`.** Se le
    otorga en una migración aparte (`007`), y solo una vez que la
    verificación de firma esté implementada y probada. Hasta entonces
    `user.deleted` no puede completarse, y eso es deliberado: el permiso
    llega después de la defensa, nunca antes.
  - Maneja `user.created`, `user.updated`, `user.deleted`.
  - En `user.created`, otorga automáticamente un entitlement `origen='gratis'`
    para el producto `'m1-libre'`, y escribe su fila de auditoría. Las dos
    escrituras van encadenadas en un solo statement con CTE, de modo que la
    fila de auditoría solo exista si el entitlement realmente se insertó:
    si Clerk reintenta el evento, el `ON CONFLICT (usuario_id, producto,
    origen) DO NOTHING` no hace nada y la auditoría tampoco se duplica.
  - **REQUISITO — `valor_nuevo` nunca incluye `notas`.** La función que arma
    el retrato jsonb para `entitlements_auditoria` debe excluir explícitamente
    la columna `notas` de `entitlements`. Es texto libre para justificar
    cortesías y puede contener datos identificatorios de terceros
    ("cortesía para el hermano de la profesora de 2°B"). Como la bitácora es
    append-only y no tiene FK a `usuarios`, ese texto sobreviviría al borrado
    de la cuenta y a cualquier solicitud de supresión: sería PII inmortal e
    irreversible, contra MOS §7.5 y la ley 21.719. La exclusión va escrita
    como comentario en esa función, no solo acá.
- Rate limiting simple en todos los endpoints nuevos (in-memory por IP es
  suficiente en esta fase; no agregues dependencias para esto).
- Variables de entorno documentadas en `.env.example`. **Nunca** commitear claves.

**CHECKPOINT 3.**

---

## PASO 4 — Progreso: local, servidor y migración

- `lib/progresoLocal.ts`: leer/escribir/limpiar `pm1:progreso:v1`, con
  try/catch en todo (localStorage puede fallar). Validar la forma del objeto al
  leer: si el JSON está corrupto o es de otra versión, descartarlo en silencio.
- El runner de lecciones escribe progreso local si no hay sesión, y al servidor
  si la hay. La misma interfaz para ambos casos, decidida en un solo lugar.
- Migración al crear cuenta:
  - Se dispara una sola vez, tras la primera sesión válida.
  - Idempotente: si se ejecuta dos veces, no duplica ni pisa avance mayor.
  - Al terminar con éxito, borra la clave local.
  - Si falla, **no borra nada local** y no muestra error alarmante al estudiante.
- Aviso de "guarda tu avance": discreto, al terminar una lección, nunca al
  entrar. Descartable. Que no bloquee nada.

**CHECKPOINT 4.**

---

## PASO 5 — Verificación

Revisa uno por uno y repórtame el resultado de cada punto:

1. Sin cuenta, la lección completa funciona igual que antes de esta fase.
2. Cerrar y reabrir el navegador sin cuenta conserva el avance.
3. Crear cuenta migra el avance y deja `localStorage` limpio.
4. Un usuario nuevo recibe su entitlement `gratis` con su fila de auditoría.
5. `tieneAcceso()` devuelve false para un producto sin entitlement, true para
   uno vigente, y false para uno con `vigencia_hasta` en el pasado.
6. El webhook rechaza una petición con firma inválida.
7. Ningún evento de PostHog contiene email, nombre ni fecha de nacimiento.
8. Todo sigue usable a 360px de ancho.
9. Modo privado del navegador: la app funciona, sin persistir.
10. `npm run validar`, `npm run lint`, `npm run build` en verde.
11. Cero `any`. Ninguna query SQL fuera de `lib/datos/`.

**CHECKPOINT 5.** Repórtame los 11 antes de declarar terminado.

---

## Prohibido en esta sesión

- Tocar contenido pedagógico o archivos en `content/`.
- Implementar pagos, checkout o pasarelas.
- Rediseñar componentes visuales existentes.
- Agregar dependencias fuera de las dos autorizadas.
- Firmar `checklistOriginalidad` o `revisionMatematica` por cualquier motivo.
- Escribir notas de proveniencia o afirmar que algo fue "confirmado con el autor".
