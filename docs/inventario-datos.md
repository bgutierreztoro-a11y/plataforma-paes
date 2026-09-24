# Inventario de datos

Qué se guarda, dónde, para qué y por cuánto tiempo. Requisito de la Ley 21.719 (vigente el 1 de diciembre de 2026) y del MOS §7.5; tarea 3.3 de `docs/fobos-advance.md` §4 F3. Documento, no código: describe lo que el repo hace hoy, verificado contra `db/migraciones/`, `lib/datos/`, `lib/progresoLocal.ts`, `components/analytics/PostHogProvider.tsx` y `app/api/webhooks/clerk/route.ts` el 2026-09-14; `lib/eventos.ts`, la cookie `fobos_origen` y la página pública del error, el 2026-09-24. Cuando el código y este documento se contradigan, gana el código y este documento se corrige.

Principio que ordena todo: **desempeño sí, identidad no** (MOS §7.5). La identidad vive en un solo lugar (Clerk y su espejo `usuarios`); todo lo demás cuelga de un id opaco.

## 1. Quién es quién

- **Responsable del tratamiento:** el proyecto Fobos (la persona natural o la sociedad que formalice el SII, MOS §7.6). Pendiente de formalización.
- **Encargados (terceros que procesan por cuenta del responsable):** Clerk (identidad y sesión), Neon (base Postgres), Vercel (hosting, funciones y logs), PostHog (analítica de producto). Ninguno recibe datos que el responsable no haya decidido enviarle; la lista de qué recibe cada uno está en las secciones 3 a 6.
- **Titulares:** estudiantes, en su mayoría menores de 18 años. Por eso la regla no es "recolectar lo razonable" sino minimización estricta.

## 2. Lo que no se recolecta, en ningún lugar

Nombre completo (el nombre es opcional y vive solo en Clerk y `usuarios`), RUT, colegio, curso, fecha de nacimiento, dirección, teléfono, foto, texto libre escrito por el estudiante, geolocalización, grabación de sesión, huella del dispositivo. No hay login social. No hay formularios que pidan nada de esto.

Ninguna tabla de desempeño, ninguna clave de `localStorage`, ningún evento de analítica y ningún log lleva email, nombre ni ningún otro campo que identifique a la persona (CLAUDE.md regla 7).

## 3. En el dispositivo del estudiante

| Qué | Dónde | Para qué | Cuánto tiempo |
|---|---|---|---|
| Progreso pedagógico: id de lección, paso alcanzado, respuestas por id de ítem (clave elegida A a D), correcta o no, intento, tiempo por ítem, marcas de tiempo | `localStorage`, única clave `pm1:progreso:v1`, tope de 500 respuestas (`lib/progresoLocal.ts`) | Retomar donde se quedó sin cuenta y medir el delta pre/post del MOS §6 más allá de una sesión | Hasta que el estudiante borre los datos del sitio en su navegador. La app no lo borra. Si crea cuenta, se fusiona con la base y la clave local queda como estaba |
| Resultado del diagnóstico de la sesión y conteo de errores en la sesión | Memoria de la pestaña (`lib/progresoSesion.ts`) | Comparación pre/post dentro de la misma sesión y el "te ha pasado N veces" | Muere al recargar o cerrar la pestaña |
| `sesion_id` de una sesión de descarte o de triage (uuid aleatorio) | Memoria del componente, generado al montar la sesión | Que un reenvío del mismo cierre no duplique filas en la base | Muere al salir de la pantalla |
| Cookies de sesión de Clerk | Cookies del dominio, puestas por Clerk | Mantener la sesión iniciada | Según la configuración de sesión de Clerk; no las administra el repo |
| Origen del recorrido: unidad, error y video (el `utm_content` del link, que solo pasa si calza con el formato `v001-...` de `lib/recorrido/video.ts`). Nada personal | Cookie propia `fobos_origen` | Saber si la cuenta vino de un video y de cuál (`docs/recorrido-entrada.md`, ADR-02) | 7 días (`SameSite=Lax`), o hasta que `/bienvenida` la lea, la guarde y la borre. La escribe el botón de la página pública del error (`components/recorrido/PreguntaPublica.tsx`) con el formato de `lib/recorrido/origen.ts`, que al leerla descarta lo que no nombre una página de la lista blanca |

La analítica no escribe nada en el dispositivo: PostHog corre con `persistence: "memory"`, sin cookies ni `localStorage` (`components/analytics/PostHogProvider.tsx`).

## 4. En la base de datos (Neon Postgres)

Toda escritura y lectura pasa por `lib/datos/` con el rol restringido `app_m1`, cuyos privilegios exactos están en `db/migraciones/006_permisos_app.sql`, `008`, `009` y `010`. La clave de todas las tablas de desempeño es `usuario_id`: el user id opaco de Clerk (`user_...`), verificado con `auth()` en el servidor, nunca recibido del cliente.

### 4.1 Identidad: tabla `usuarios` (001)

Único lugar del esquema con datos personales. La escribe solo el webhook de Clerk.

| Columna | Qué es | Para qué |
|---|---|---|
| `id` | user id de Clerk | Clave para el resto del esquema |
| `email` | correo del registro | Identificar la cuenta; hoy no se envía ningún correo desde la app |
| `nombre` | nombre que Clerk reporte, opcional, puede ser nulo | Ninguno en la app hoy; se guarda porque Clerk lo manda si el estudiante lo puso |
| `fecha_nacimiento` | columna nula, **sin ningún escritor en el código** | Reservada para la fase de pagos (001). Si alguna vez se puebla, exige firma de Benja y actualizar este inventario |
| `creado_en`, `actualizado_en` | marcas de tiempo | Auditoría |

Retención: hasta la baja. Al llegar `user.deleted`, el webhook reemplaza `email` por una lápida `borrado-<id>@invalido.local` y pone `nombre` en `NULL`; la fila sigue existiendo porque `app_m1` no tiene `DELETE` hasta la migración 007, pendiente (`docs/pendientes.md`, "Borrados de cuenta pendientes"). Desde ese momento la fila ya no identifica a nadie.

### 4.2 Desempeño en la capa gratis

| Tabla | Qué guarda | Para qué | Retención |
|---|---|---|---|
| `progreso_lecciones` (002) | Por (usuario, lección): paso actual, completada, marcas de tiempo | Retomar entre dispositivos | Hasta la baja; `ON DELETE CASCADE` desde `usuarios` cuando exista la 007 |
| `respuestas` (003) | Un intento por fila: contexto (diagnóstico, lección, cierre), id de ítem, clave elegida, correcta o no, número de intento, tiempo en ms, marca de tiempo | Delta pre/post del MOS §6 y contar intentos previos | Igual que la anterior. Append-only: nunca se corrige una fila |

### 4.3 Acceso: `entitlements` (004) y `entitlements_auditoria` (005)

| Tabla | Qué guarda | Para qué | Retención |
|---|---|---|---|
| `entitlements` | Por usuario: producto (`m1-libre` hoy), origen (`gratis`, `cortesia`, `compra`), vigencia desde y hasta, referencia de pago (nula, sin uso), `notas` (texto interno, nulo salvo cortesías otorgadas a mano) | Decidir si una cuenta tiene acceso a un producto (`tieneAcceso`). Es también donde vive la temporada de Advance, ver 4.5 | Hasta la baja, con cascada cuando exista la 007 |
| `entitlements_auditoria` | Bitácora append-only de cada alta, extensión o revocación: retrato de la fila de entitlements en jsonb, actor, instante | Resolver disputas de acceso y de cobro | Indefinida a propósito, sin FK: sobrevive al borrado de la cuenta. El retrato excluye `notas` por diseño (`lib/datos/entitlements.ts`) |

Riesgo conocido y anotado: `entitlements.notas` es texto libre y puede contener datos de terceros ("cortesía para el hermano de la profesora"). La 007 tiene que decidir qué pasa con esa columna al borrar. Hasta entonces, la regla operativa es no escribir en `notas` nada que identifique a una persona.

### 4.4 Desempeño en Fobos Advance

| Tabla | Qué guarda | Para qué | Retención |
|---|---|---|---|
| `advance_descartes` (008, lectura en 009) | Una fila por ítem de una sesión de descarte: unidad, id de ítem, claves originales descartadas en orden, ids locales de los errores identificados, clave de la correcta si la descartó, tiempo en ms, `sesion_id`, marca de tiempo | Calcular al vuelo el ciclo de vida de cada error (`/advance/errores`, §6.3) y el veredicto del triage (§6.5). No existe tabla `estado_error`: el estado se deriva en cada lectura | Hasta la baja. Sin FK a `usuarios` a propósito (008); la 007 debe borrar por `usuario_id` |
| `advance_triage` (010) | Una fila por ítem de una sesión de triage: unidad, id de ítem, decisión (`resuelvo`, `marco`, `dejo` sin emisor, `sin-decision`), ms hasta decidir, `sesion_id`, marca de tiempo | Entrenar la administración del tiempo; el veredicto no se guarda, se calcula | Igual que la anterior |

Lo que estas tablas no guardan, por diseño: ni la letra visible tras la mezcla, ni el enunciado, ni el texto de las alternativas, ni sesiones abandonadas a medias (solo se escribe al cerrar la sesión completa, en una transacción).

### 4.5 Temporada de Advance

No hay tabla `temporada` (decisión del 2026-09-14, registrada en `docs/fobos-advance.md` §4 F3). Una temporada es una fila de `entitlements` con el producto de Advance, `vigencia_desde` al contratar y `vigencia_hasta` al terminar; el estado (`activo`, `temporada-terminada`, `sin-acceso`) se deriva de las fechas en `lib/advance/temporada.ts`, nunca se guarda. Su rastro de altas y extensiones queda en `entitlements_auditoria`. No agrega ningún dato a este inventario.

### 4.6 Estado del aplicador: `_migraciones`

Nombre y sha256 de cada migración aplicada. Sin datos de personas. Solo la toca el rol dueño.

## 5. En terceros

| Encargado | Qué recibe | Para qué | Retención |
|---|---|---|---|
| Clerk | Email, código de verificación, nombre opcional, metadatos de sesión (IP, agente de usuario) que Clerk registra por su cuenta | Cuentas y sesiones. Único proveedor de identidad; sin login social | La que fije Clerk; al borrar la cuenta en Clerk se dispara `user.deleted` hacia la base (4.1) |
| Neon | Todo lo de la sección 4 | Base de datos | La de la sección 4, más los respaldos automáticos de Neon según su plan |
| Vercel | Logs de funciones: prefijos `[advance-sesion]`, `[advance-triage]`, `[webhook-clerk]`, `[BORRADO-PENDIENTE]` con el id opaco de Clerk y mensajes de error saneados (`lib/datos/db.ts` nunca vuelca el objeto del driver, que trae la cadena de conexión) | Diagnosticar fallos | La rotación del plan de Vercel; el repo no la configura. Ningún log es registro durable: la fuente de verdad es la base |
| PostHog | Eventos de producto declarados en `lib/eventos.ts` y en CLAUDE.md, con ids de lección, ítem, paso, unidad, error del catálogo, tiempos y contadores. Los del recorrido de entrada suman respuestas cerradas de la bienvenida y `video`, el id del video de origen validado por `lib/recorrido/video.ts`; hoy salen los tres de la página pública del error. PostHog agrega por su cuenta `$current_url` con la URL completa; por eso esa página, antes de que PostHog arranque, guarda el video validado en `history.state` y borra los parámetros de la dirección (`videoDeLaVisita`, `lib/recorrido/video.ts`): los `utm_*` del link no llegan a PostHog. `lib/eventos.test.ts` hace fallar `tsc` si un evento acepta correo, nombre, RUT, colegio u otra clave personal. Sin autocapture, sin grabación de sesión, sin `identify()`: cada carga de página es un visitante anónimo nuevo | Medir aprendizaje y uso (MOS §8) | La del proyecto de PostHog. Sin identidad, no hay nada que borrar a pedido de un titular |

Los eventos de Advance llevan `unidad_id`, `item_id`, la `clave` original del JSON, el id de error dominante del catálogo, decisiones de triage, tiempos y contadores por fase; nunca `usuario_id` ni `sesion_id` (`docs/fobos-advance.md` §8).

## 6. Derechos del titular: cómo se atienden hoy

- **Acceso y portabilidad:** todo lo de una cuenta se obtiene con una consulta por `usuario_id` sobre las tablas de la sección 4. No existe pantalla ni exportación automática.
- **Rectificación:** el correo y el nombre se corrigen en Clerk y llegan por `user.updated`. El desempeño no se rectifica: es un registro de lo que pasó.
- **Supresión:** borrar la cuenta en Clerk neutraliza la PII en `usuarios` de inmediato (4.1). El desempeño queda bajo un id opaco que ya no apunta a nadie hasta que exista la 007, que debe borrar en cascada `progreso_lecciones`, `respuestas`, `entitlements` y, por `usuario_id`, `advance_descartes` y `advance_triage`. La bitácora `entitlements_auditoria` se conserva a propósito.
- **Consentimiento del apoderado:** exigido por el MOS §7.5 para menores. Fuera del código; parte de la política de privacidad (3.2, Benja).

## 7. Lo que este inventario deja pendiente de firma

1. **Plazo de conservación del desempeño.** Hoy es "hasta la baja". La ley pide un plazo definido y proporcional al fin: una propuesta razonable es el cierre de la temporada más un margen para disputas, pero eso es una decisión de producto de Benja, no de este documento.
2. **Migración 007:** `DELETE` de `usuarios` con cascada, más el borrado por `usuario_id` en las dos tablas de Advance, y la decisión sobre `entitlements.notas`.
3. **`usuarios.fecha_nacimiento`:** existe nula. Decidir si se elimina en una migración o si la fase de pagos la necesita de verdad.
4. **Retención de logs en Vercel y de eventos en PostHog:** confirmar los plazos reales del plan contratado y anotarlos acá.

Cada cambio de esquema, de evento de analítica o de proveedor actualiza este documento en el mismo commit.
