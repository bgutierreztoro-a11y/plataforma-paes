# Plan de Fase 3 — navegación persistente

Origen: sesión del 2026-07-25, tras cerrar Fase 1 (`0d3f7e7`) y Fase 2 (`c853f6f`).
Este archivo existe porque el plan de Fase 2 vivió solo en el contexto de una
sesión y se perdió al reiniciar: hubo que reconstruirlo desde el código. El plan
de Fase 3 se escribe en el repo **antes** de ejecutarlo para que la próxima
sesión lo lea de acá y no de la memoria de nadie.

**Estado: aprobado, sin ejecutar.** Ninguna línea de código de esta fase está
escrita.

---

## 1. Restricción de primer orden — la cuenta no guarda nada pedagógico

**Esto manda sobre todo lo demás en este documento.**

Verificado en el código el 2026-07-25:

- `lib/datos/progreso.ts` exporta `obtenerProgreso`, `guardarProgreso` y
  `migrarProgresoLocal`. **Ningún archivo de `app/` o `components/` las llama.**
  Los únicos consumidores de `lib/datos/*` son `app/api/webhooks/clerk/route.ts`
  (`usuarios`, `entitlements`).
- `RunnerLeccion` escribe solo en `lib/progresoSesion.ts`: memoria de módulo,
  que muere al recargar la página por decisión de privacidad explícita.
- No existe persistencia en `localStorage`: el Paso 2 del
  `plan-rediseno-entrada.md` (progreso local) nunca se construyó.

Consecuencia: **hoy tener cuenta crea una fila en `usuarios` y un entitlement
gratis, y nada más.** El progreso pedagógico no sobrevive a un reload, con
cuenta o sin ella. La persistencia real se reconsidera en **Fase 5**.

### Qué prohíbe esto en Fase 3

Ningún elemento de navegación, etiqueta, tooltip o copy puede afirmar ni
insinuar que la cuenta guarda, protege o recupera el avance. En concreto queda
**descartada** la etiqueta "Guardar mi avance" que propone
`plan-rediseno-entrada.md:60` para el usuario anónimo.

Por qué no es un detalle de redacción: sería prometerle a un menor de edad una
función que no existe, a cambio de su correo. Eso choca con MOS §11 #1 (legal)
antes que con cualquier consideración de UX, y con la excepción del gate de
autenticación del 2026-07-23 (`CLAUDE.md:20`), que prohíbe explícitamente
"cualquier cosa que empuje al estudiante a registrarse para poder aprender".

**Gatillo para revisar esta restricción:** cuando `guardarProgreso` esté
efectivamente cableada al runner y verificada end-to-end. No antes, y no por
inercia de que "ya casi está".

---

## 2. Corrección de API — Clerk v7 no exporta `SignedIn` ni `SignedOut`

Verificado contra `@clerk/nextjs@7.6.0` instalado (2026-07-25), leyendo
`node_modules/@clerk/nextjs/dist/types/index.d.ts` y `components.server.d.ts`:

| Se creía disponible | Realidad en v7 |
|---|---|
| `<SignedIn>` / `<SignedOut>` | **No existen.** Reemplazados por `<Show when="signed-in">` / `<Show when="signed-out">` |

Superficie real relevante para esta fase: `Show`, `UserButton`, `UserAvatar`,
`SignOutButton`, `SignInButton`, y los hooks `useUser` / `useAuth` / `useSession`.
El tipo de `when` es `'signed-in' | 'signed-out' | ...` (`@clerk/shared`,
`authorization.d.ts:61`).

Ya estaba anotado en `docs/pendientes.md:136`, incluida la advertencia que sigue
vigente: **`<Show>` solo oculta visualmente — el contenido sigue en el HTML.**
Para navegación eso es aceptable (una etiqueta de menú no es un secreto), pero
nunca sirve para proteger datos; para eso está `lib/datos/`.

---

## 3. Objetivo

Que el estudiante nunca quede sin salida.

Hoy, dentro de `/leccion/l1-patrones-de-cambio`, las únicas salidas son el botón
atrás del navegador o terminar los 10 pasos más los ítems PAES. No hay un solo
enlace al camino. `app/layout.tsx` no monta ninguna navegación.

**Incertidumbre que reduce (MOS §2):** pedagógica. Si el estudiante abandona a
mitad de lección porque se siente encerrado, el dato de retención del piloto
mide una trampa de navegación, no la calidad de la lección. Sin esto, los
números del piloto no son interpretables.

---

## 4. Decisiones tomadas

### 4.1 Barra, no drawer

Barra inferior en móvil, barra superior en desktop. Se descarta el drawer: paga
estado abierto/cerrado, atrapado de foco, Escape y bloqueo de scroll para
esconder tres destinos que caben a la vista (MOS §11 #5, simplicidad).

### 4.2 Modo foco — la barra NO se monta en `/leccion/[id]`

**Decidido el 2026-07-25.** Una lección es una sesión de concentración: la barra
persistente compite con ella y además tapa el CTA "Siguiente paso", que vive al
fondo del flujo del runner.

La salida dentro de la lección es **un enlace discreto "Salir al camino" en el
encabezado de `RunnerLeccion`**, junto al título y la barra de progreso. Discreto
significa: enlace de texto, no botón primario, sin competir con el CTA de avance.

Consecuencia técnica: la navegación no puede montarse ciegamente en
`app/layout.tsx` para todas las rutas. Se monta condicionada a la ruta (isla de
cliente que lee `usePathname()` y no se pinta bajo `/leccion/`), o el layout de
lección se separa. Preferir lo primero mientras sea una sola condición.

### 4.3 Secciones: tres

**Inicio** (`/inicio`) · **Camino** (`/lecciones`) · **Cuenta**.

Riesgo aceptado: Inicio y Camino se parecen. Se sostienen porque hacen cosas
distintas — Inicio decide por ti, Camino muestra todo y en qué estado está cada
lección. Si en el uso real se pisan, se colapsa a dos; no se agrega una cuarta.

### 4.4 Degradación por estado de sesión

| Estado | Etiqueta | Destino |
|---|---|---|
| `<Show when="signed-out">` | "Entrar" | `/ingresar` |
| `<Show when="signed-in">` | "Cuenta" | `UserButton` de Clerk (cerrar sesión, gestión de cuenta) |

Prohibido en ambos estados, por §1: cualquier promesa de persistencia. Prohibido
en `signed-in`: avance agregado, lecciones pasadas, métricas — eso es el
dashboard del estudiante, que está en la lista negra (`CLAUDE.md:17`) y necesita
cruzar su propio gate.

### 4.5 Tratamiento visual del camino — la grilla se queda

**Decidido el 2026-07-25.** Se descarta la ruta lineal con nodos conectados: con
tres tarjetas y una abierta, decora. Peor, el vocabulario visual de "mapa con
nodos completados" es el de la gamificación, que está en la lista negra.

**Sí se agrega:** rótulo ordinal en la tarjeta, **"Lección 1 de 3"**. Comunica la
secuencia sin dibujar el camino. Todo lo demás de la grilla queda igual.

Se reevalúa la ruta lineal cuando haya ≥4 lecciones publicables y prerrequisitos
reales entre ellas. No antes.

### 4.6 Comportamiento de `/` para sesión iniciada

`/` **se queda como hero público idéntico para todos**, sin rebote y sin
redirección — se confirma lo decidido en Fase 2. Lo único que se agrega es un
CTA secundario bajo el principal, envuelto en `<Show when="signed-in">`, que
apunta a `/inicio`.

Se descarta explícitamente redirigir de `/` a `/inicio` para sesión iniciada:
rompe el prerender estático de `/` y es exactamente el olor del muro de entrada
que la excepción del gate prohíbe.

---

## 5. Alcance de archivos

| Archivo | Cambio |
|---|---|
| `components/navegacion/Navegacion.tsx` | Nuevo. Isla de cliente. Barra + las tres secciones + `Show` |
| `app/layout.tsx` | Montar la isla (condicionada a ruta, ver 4.2) |
| `components/RunnerLeccion.tsx` | Enlace "Salir al camino" en el encabezado |
| `components/ui/Tarjeta.tsx` | Prop para el rótulo ordinal |
| `components/GrillaLecciones.tsx` | Calcular y pasar "Lección N de M" |
| `app/page.tsx` | CTA secundario `signed-in` → `/inicio` |

---

## 6. Riesgos técnicos a verificar, no a asumir

1. **Prerender estático.** `ClerkProvider` hoy no lleva la prop `dynamic` y por
   eso `/leccion/l1-patrones-de-cambio` prerenderiza (`●` en la tabla de rutas
   del build). No agregar `dynamic`. Además, `Show` se exporta en versión
   servidor y versión cliente: usar la de cliente, dentro de la isla marcada
   `"use client"`. Hipótesis a confirmar con la tabla de rutas del build, no por
   deducción: usar `Show` en un server component forzaría render dinámico y
   rompería el prerender.
2. **Parpadeo al hidratar.** `Show` no sabe el estado de sesión durante el SSR.
   Si la ranura de Cuenta no tiene alto y ancho reservados, la barra salta al
   hidratar. Mitigación: slot de tamaño fijo con placeholder neutro, mismo
   criterio que `useMontado` en `ChipLeccionCompletada` y `PuntoDePartida`.
3. **`<Show>` no protege nada.** Solo oculta visualmente; el contenido viaja en
   el HTML. Aceptable para etiquetas de navegación, inaceptable para datos.

---

## 7. Restricciones de la fase

Sin dependencias nuevas. **Sin eventos PostHog nuevos** — la barra no
instrumenta nada; si algún día se quiere medir uso de navegación, el nombre del
evento entra primero a la lista cerrada de `CLAUDE.md` y después se instrumenta.
Sin gamificación. No tocar `content/*.json` ni campos de certificación
(`checklistOriginalidad`, `revisionMatematica`). No tocar `proxy.ts`. MOS §11.

---

## 8. Fuera de alcance — resuelto antes de esta fase

**El CTA principal de `/` empujaba a `/diagnostico`, que está en `estado: revision`.**
Fase 1 sacó del camino todo lo no publicable, pero la portada seguía mandando ahí
como acción primaria — y, por no ser `publicable`, ese destino monta
`BannerDemostracion` (`components/Diagnostico.tsx:42`), así que el estudiante veía
**"DEMOSTRACIÓN — contenido no revisado"** (`components/ui/Banner.tsx:7`) al primer
clic.

Decidido el 2026-07-25: no se aborda *dentro* de Fase 3, pero tampoco queda
esperando — se resolvió **antes**, en su propio commit. El CTA de `/` pasó a la
primera lección abierta del camino y el diagnóstico quedó como opción secundaria
con etiqueta honesta. Detalle y lo que sigue abierto: `docs/pendientes.md`, sección
"CTA principal de `/` empujaba a contenido no publicable".

---

## 9. Cierre de la fase

`npm run validar`, `npx tsc --noEmit`, `npm run lint` y `npm run build`, los
cuatro en verde, más lectura explícita de la tabla de rutas del build para
confirmar que `/leccion/l1-patrones-de-cambio` sigue saliendo `●` (SSG) y que
`/` e `/inicio` siguen `○` (estáticas). Esa tabla es la evidencia de que no se
rompió el prerender, no una impresión.
