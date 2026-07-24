# Plan de rediseño — entrada, bienvenida, camino y navegación

Origen: sesión del 2026-07-24. Se detectó que, como usuario nuevo, la experiencia falla
en tres puntos: (1) "seguir sin cuenta" subordinado a un link chico en las páginas de
auth, contra la decisión de producto de que la cuenta nunca es peaje; (2) no hay punto
de partida tras entrar; (3) no existe navegación persistente.

**Hecho en la sesión de origen (Paso 1):** páginas de auth (`/ingresar`, `/registrarse`)
con "Seguir sin cuenta" como botón secundario de peso comparable y copy honesto (no
promete cross-device ni afirma completitud de contenido); y arreglo de `README.md:30`
(estaba obsoleto: afirmaba que l1 no renderiza, cuando la migración se resolvió el
2026-07-08 y está verificada).

**Lo demás queda diferido a sesiones separadas, en este orden.**

## Decisiones de producto confirmadas
- **Producto primero, sin puerta.** El front door es el contenido; "sin cuenta" deja de
  ser una decisión. La cuenta se ofrece por lo que habilita, no como peaje.
- **Arranque directo a la Lección 1 real** (l1, única `publicable`). El diagnóstico
  (contenido demo, `estado: revision`) queda secundario: un test de ubicación con un
  solo destino no ubica. Cuando haya más lecciones publicables, el diagnóstico pasa a
  ser el router natural.
- **Progreso en `localStorage` ahora** (= PASO 4 de la fase Clerk).
- **Camino honesto:** l1 abierta; l2/l3 (`borrador`) como etapas "En construcción"
  bloqueadas.

## Banderas legales/técnicas antes de cada sesión relevante (MOS §11 #1)
- `README.md:38` declara "nada se persiste en localStorage ni cookies" → contradice la
  capa localStorage; actualizar en la misma sesión que la construya.
- `app/privacidad/page.tsx:39-48` ya describe persistencia local; hoy la app está por
  debajo (memoria). Pasada de consistencia legal junto con la persistencia.
- Autorización de localStorage: `CLAUDE.md:29` (regla de contenido #7, "en `localStorage`
  cuando no hay cuenta"). No está atada al gate del 2026-07-23 (ese es `CLAUDE.md:20`,
  sobre autenticación).

## Paso 2 — Progreso local (= PASO 4 fase Clerk; sesión completa, 11 verificaciones)
`lib/progresoLocal.ts` a la forma `pm1:progreso:v1` (ya esperada por
`lib/datos/progreso.ts:91-100`), con try/catch total y seguro en modo privado.
Reconciliar `lib/progresoSesion.ts` y su comentario "nada de localStorage". Cablear
`RunnerLeccion` y `ChipLeccionCompletada`. Actualizar `README.md` y privacidad. Solo
desempeño, nunca identidad (MOS §7.5).

## Paso 3 — Camino honesto
`lib/camino.ts` (secuencia curada; `disponible === estado === "publicable"`),
`components/Camino.tsx`, prop `bloqueada` en `components/ui/Tarjeta.tsx` (rótulo "En
construcción", sin enlace). Gate de `generateStaticParams` en `app/leccion/[id]/page.tsx`
para excluir `borrador` (l2/l3 sin ruta, no abribles por URL). l0-demo fuera del camino
real, accesible como demo opcional desde un link secundario.

## Paso 4 — Bienvenida / punto de partida
`app/page.tsx` producto primero + `components/inicio/PuntoDePartida.tsx` (isla cliente):
usuario nuevo → CTA "Empezar Lección 1"; recurrente → CTA "Retomar" con deep link al
paso exacto, leyendo `progresoLocal`. Chip "Completada" en las tarjetas del camino.
**Sin pantalla de métricas** (eso es dashboard gated, ver abajo).

## Paso 5 — Navegación persistente
`components/navegacion/Navegacion.tsx`: tab bar inferior en móvil + barra superior en
desktop. Montaje en `app/layout.tsx` como isla cliente, sin romper el prerender estático
de las lecciones (no llamar `auth()` en servidor). Sección Cuenta con
`<SignedIn>/<SignedOut>` de Clerk: a un anónimo se le muestra "Guardar mi avance", nunca
"tu cuenta". **`/progreso` como pantalla dedicada NO se construye aquí** (ver pendiente
gated).

## Paso 6 — Animación de bienvenida + embudo
`fade-in-bienvenida` en `app/globals.css`: CSS puro, sobrio (opacity + `translateY`
~8px), bajo `motion-safe` y respetando `prefers-reduced-motion`. Sin dependencia nueva
(ninguna librería de animación reduce incertidumbre aquí; el proyecto ya hace toda su
animación con keyframes + utilidades de movimiento de Tailwind). Eventos aprobados
`bienvenida_vista { estado_usuario }` y `punto_partida_elegido { opcion }`: se agregan a
la lista cerrada de `CLAUDE.md` **antes** de instrumentar, no después.

## Pendiente GATED — no construir sin cruzar el gate (MOS §9-10)
**Dashboard del estudiante** = `/progreso` como pantalla dedicada que agrega avance,
lecciones pasadas y métricas. Está en la lista negra de `CLAUDE.md:17`. La frontera que
se aplicó: reanudar (CTA "Retomar") y marcar completado (chip "Completada") son
navegación y se permiten; **agregar todo eso en una pantalla de métricas propia es el
dashboard, y requiere cruzar el gate documentado igual que se hizo con autenticación.**
No se construye por default ni por inercia.
