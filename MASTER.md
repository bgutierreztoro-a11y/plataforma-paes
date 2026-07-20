# Antigravity · Sistema de Diseño (MASTER)

> **Versión:** 1.0 · **Fecha:** 7 de julio de 2026
> **Alcance:** MVP v1 — módulo de Funciones M1 (diagnóstico + 4 lecciones + cierre PAES).
> **Fuente de verdad visual.** Todo componente nuevo se deriva de este documento. Si algo no está acá, se decide acá antes de codearlo. No se reescribe por inquietud; se actualiza cuando un gate se cruza o una prueba con usuarios lo obliga (alineado con MOS v2 §11.5).

---

## 0. Cómo usar este documento

1. **Antes de crear una pantalla**, revisa la sección 1 (filosofía) y 6 (anti-patrones). Son el filtro rápido de "¿esto se siente Antigravity o se siente preuniversitario?".
2. **Antes de escribir CSS**, copia los tokens de la sección 7. Nunca hardcodees un color o un tamaño; usa la variable.
3. **Antes de dar por terminada una pantalla**, corre la checklist de la sección 8.

Este archivo describe *decisiones*, no gustos. Cada elección tiene un porqué anclado en el negocio: vendemos puntaje a un apoderado que necesita confiar, y lo entregamos a un estudiante de 17 años que tiene que *volver a abrir la lección*. Confianza + ganas de volver. Todo el sistema sirve a esas dos cosas.

---

## 1. Filosofía de diseño

**Tesis:** el momento en que un concepto "hace clic" debería *sentirse*. Antigravity es la sensación de que una idea despega y queda flotando, sostenida por tu propia comprensión. El diseño existe para producir y celebrar ese momento, no para tapar la pantalla de fórmulas.

Cinco principios, en orden de prioridad:

1. **El interactivo es el héroe.** (De Brilliant.) En cada lección, el elemento memorable es la manipulación directa —mover un slider y ver la recta cambiar—, no el bloque de texto. Todo lo demás cede espacio y jerarquía al momento interactivo. Si una pantalla no tiene un momento de "toca y descubre", nos preguntamos por qué existe.

2. **Calma, no ansiedad.** (De Khan; anti-preuniversitario.) Aire, una sola acción principal por pantalla, ritmo que no apura. El estudiante de PAES ya vive con reloj encima; la plataforma es el lugar donde puede pensar sin que le griten "¡faltan 4 meses!". La urgencia vive en el mensaje de venta, jamás en la interfaz de aprendizaje.

3. **El error es información, no castigo.** (Pedagogía + Duolingo bien entendido.) Una respuesta incorrecta nunca se pinta de rojo alarma. Se trata como "aún no, mira esto": color cálido, feedback específico por distractor, camino claro hacia adelante. Nunca refuerzo negativo sobre la persona ("estás mal"), siempre sobre el paso ("este cálculo se saltó un signo").

4. **Progreso visible y honesto.** (De Duolingo/Khan.) El estudiante siempre sabe dónde está, cuánto avanzó y qué sigue. Pero sin manipular: nada de rachas artificiales que generen culpa, ni animaciones que premien tiempo en pantalla en vez de comprensión. Celebramos el descubrimiento, no la adicción.

5. **Credibilidad de producto pagado.** (Anti-preuniversitario.) Un apoderado paga cientos de miles al año en preuniversitario. Cuando ve Antigravity, tiene que verse serio, cuidado, actual —no un proyecto de colegio ni una app de juguete. Tipografía intencional, espaciado disciplinado, cero elementos rotos. La barra es: "esto se ve mejor que el material que ya pagué".

**Riesgo de diseño que asumimos a propósito:** apostamos por una identidad más cercana a una app de aprendizaje moderna (índigo profundo, mucho aire, interactivos protagonistas) que al look institucional azul-marino/rojo del preuniversitario chileno. El riesgo es que a algún apoderado le parezca "poco serio". Lo mitigamos con tipografía y espaciado impecables: lo lúdico está en la *interacción*, no en la *estética*, que se mantiene sobria.

---

## 2. Fundamentos (tokens)

### 2.1 Color

La paleta tiene tres capas: **primitivos** (los hex crudos, no se usan directo), **semánticos** (lo que sí usas: `--color-action`, `--color-success`…) y **modo oscuro** (opcional en v1, definido para no rehacer trabajo después).

#### Primitivos

**Índigo — marca y acción ("el despegue").** Es el color de todo lo que el usuario puede tocar para avanzar.

| Token | Hex | Uso |
|---|---|---|
| `indigo-50` | `#EEF1FF` | Fondos suaves, estados hover claros |
| `indigo-100` | `#E0E5FF` | Chips, badges, resaltados |
| `indigo-300` | `#A6AEFF` | Bordes activos, acentos secundarios |
| `indigo-500` | `#5B63F5` | Base de marca |
| `indigo-600` | `#4A4FE0` | **Acción principal** (botones, links) |
| `indigo-700` | `#3A3CC4` | Hover / pressed |
| `indigo-900` | `#23246B` | Texto sobre fondos índigo claros |

**Aurora (cian) — el interactivo.** Reservado para el elemento manipulable de cada lección (sliders, puntos arrastrables, la recta que cambia). Su exclusividad es lo que enseña al ojo "esto se toca".

| Token | Hex | Uso |
|---|---|---|
| `aurora-400` | `#2DD4E0` | Trazo activo del gráfico, thumb del slider |
| `aurora-500` | `#12B5C9` | Base del elemento interactivo |
| `aurora-600` | `#0E93A8` | Hover del interactivo |

**Ink (neutros con tinte azul) — texto y estructura.** El negro puro es duro; estos neutros tienen un pelo de azul para armonizar con el índigo.

| Token | Hex | Uso |
|---|---|---|
| `ink-900` | `#111629` | Títulos, texto principal |
| `ink-700` | `#2E3448` | Cuerpo de lección |
| `ink-500` | `#5B6478` | Texto secundario, ayudas |
| `ink-400` | `#8A93A8` | Placeholder, texto deshabilitado |
| `ink-300` | `#CDD3E0` | Bordes |
| `ink-200` | `#E4E8F0` | Divisores, bordes suaves |
| `ink-100` | `#F1F3F9` | Fondos de tarjeta alternos |
| `ink-50`  | `#F7F8FC` | Fondo de página |
| `white`   | `#FFFFFF` | Superficie de tarjetas |

**Semáforo pedagógico.** La distinción clave: *respuesta incorrecta* ≠ *error del sistema*. Son colores distintos a propósito.

| Token | Hex | Uso |
|---|---|---|
| `success-50` | `#E9FBF3` | Fondo de feedback correcto |
| `success-500` | `#12B76A` | "Correcto", check, barra de logro |
| `success-700` | `#087544` | Texto de éxito |
| `attention-50` | `#FFF6E9` | Fondo de "aún no / revisemos" |
| `attention-500` | `#F5A623` | Respuesta incorrecta **guiada** (ámbar, no rojo) |
| `attention-700` | `#B26A00` | Texto de "aún no" |
| `error-500` | `#E5484D` | **Solo** errores técnicos (formulario, carga). Rara vez visible al estudiante |

> **Regla dura:** una alternativa PAES mal elegida se pinta con `attention`, nunca con `error`. El rojo alarma queda reservado a fallos de sistema. Esta separación *es* la pedagogía del principio 3.

#### Semánticos (lo que usas en el código)

```
--color-bg:            var(--ink-50);
--color-surface:       var(--white);
--color-surface-alt:   var(--ink-100);
--color-border:        var(--ink-200);
--color-border-strong: var(--ink-300);

--color-text:          var(--ink-900);
--color-text-body:     var(--ink-700);
--color-text-muted:    var(--ink-500);

--color-action:        var(--indigo-600);
--color-action-hover:  var(--indigo-700);
--color-action-soft:   var(--indigo-50);

--color-interactive:   var(--aurora-500);   /* SOLO el elemento manipulable */
--color-interactive-hi: var(--aurora-400);

--color-success:       var(--success-500);
--color-success-soft:  var(--success-50);
--color-attention:     var(--attention-500);
--color-attention-soft:var(--attention-50);
--color-error:         var(--error-500);

--color-focus-ring:    rgba(91, 99, 245, 0.45);
```

**Contraste:** todo texto cumple WCAG AA mínimo (4.5:1 en cuerpo, 3:1 en títulos grandes). `ink-500` sobre `white` = 4.6:1 ✓. No uses `ink-400` para texto que haya que leer, solo para placeholders.

### 2.2 Tipografía

Emparejamiento deliberado —no las fuentes por defecto de cualquier plataforma educativa (Lato/Open Sans)—, pero ambas gratis y de carga rápida.

- **Display / títulos → Plus Jakarta Sans.** Geométrica con un toque redondeado: seria pero cálida, ni fría ni infantil. Le da personalidad a los encabezados sin gritar.
- **Cuerpo / lectura → Inter.** El caballo de batalla más legible para textos largos de lección. Neutral a propósito: el protagonismo es del contenido, no de la letra.
- **Números / valores interactivos → Inter con cifras tabulares** (`font-feature-settings: "tnum"`). Crítico: cuando un slider cambia de `2,4` a `2,5`, el número no debe "saltar" de ancho. La matemática necesita cifras que se alineen.

```
--font-display: "Plus Jakarta Sans", system-ui, sans-serif;
--font-body:    "Inter", system-ui, sans-serif;
--font-mono:    "IBM Plex Mono", ui-monospace, monospace;  /* código/expresiones si hace falta */
```

**Escala tipográfica** (base 16px). El cuerpo de lección es 18px, más grande de lo habitual: leer para aprender pide comodidad.

| Rol | Tamaño | Line-height | Peso | Fuente |
|---|---|---|---|---|
| `display` | 48px / 3rem | 1.1 | 700 | Display |
| `h1` | 34px / 2.125rem | 1.2 | 700 | Display |
| `h2` | 26px / 1.625rem | 1.25 | 600 | Display |
| `h3` | 20px / 1.25rem | 1.3 | 600 | Display |
| `body-lg` | 18px / 1.125rem | 1.65 | 400 | Body |
| `body` | 16px / 1rem | 1.6 | 400 | Body |
| `small` | 14px / 0.875rem | 1.5 | 400 | Body |
| `caption` | 12px / 0.75rem | 1.4 | 500 | Body |

Reglas: títulos con `letter-spacing: -0.02em` (más apretados, se ven premium); cuerpo sin tocar el tracking; ancho de línea de lectura máximo `68ch` para que el ojo no se canse.

### 2.3 Espaciado

Escala base 4px. Usa solo estos pasos; la consistencia del espaciado es la mitad de la sensación de "cuidado".

```
--space-1: 4px;    --space-2: 8px;    --space-3: 12px;
--space-4: 16px;   --space-5: 24px;   --space-6: 32px;
--space-7: 48px;   --space-8: 64px;   --space-9: 96px;
```

Ritmo: entre elementos relacionados `space-3/4`; entre bloques `space-6`; entre secciones de lección `space-7/8`. **El aire es una decisión, no un descuido.** Cuando dudes, deja más espacio (anti-densidad = principio 2).

### 2.4 Radios

Redondeo generoso (aporta la calidez de Duolingo) pero sin caer en burbuja.

```
--radius-sm: 8px;    /* inputs, chips */
--radius-md: 12px;   /* botones, alternativas */
--radius-lg: 16px;   /* tarjetas de lección */
--radius-xl: 24px;   /* contenedor del interactivo, modales */
--radius-full: 9999px; /* badges de progreso, avatares */
```

### 2.5 Elevación (sombras) — la metáfora del "lift"

Sombras suaves, de baja opacidad y multicapa. Nada de drop-shadows duras. La elevación sube cuando algo se vuelve interactivo o exitoso: literalmente "despega".

```
--shadow-1: 0 1px 2px rgba(17, 22, 41, 0.06);                          /* reposo */
--shadow-2: 0 4px 14px rgba(17, 22, 41, 0.08);                         /* tarjeta */
--shadow-3: 0 12px 32px rgba(17, 22, 41, 0.12);                        /* hover / activo */
--shadow-interactive: 0 8px 24px rgba(18, 181, 201, 0.22);             /* el bloque interactivo, tinte aurora */
--shadow-focus: 0 0 0 3px var(--color-focus-ring);                     /* foco de teclado */
```

### 2.6 Movimiento

El movimiento sirve al descubrimiento, no a la decoración. Un momento orquestado (la recta que se dibuja al revelar) vale más que diez efectos sueltos.

```
--dur-fast: 120ms;   /* micro-feedback: hover, tap */
--dur-base: 220ms;   /* transiciones de estado */
--dur-slow: 360ms;   /* revelaciones, "aha" */
--ease-out:  cubic-bezier(0.22, 1, 0.36, 1);   /* entradas: rápido y luego se asienta */
--ease-soft: cubic-bezier(0.4, 0, 0.2, 1);     /* transiciones generales */
```

Momentos con animación intencional: (a) el slider moviendo la recta —tiempo real, sin lag—; (b) el check de respuesta correcta —un pop breve con `ease-out`—; (c) la barra de progreso avanzando al terminar un paso. Todo lo demás, quieto. **Respeta `prefers-reduced-motion`: si está activo, transiciones instantáneas, cero animación decorativa.**

---

## 3. Componentes

Especificados con tokens. Cada uno lista sus estados obligatorios.

### 3.1 Botones

**Primario** (una sola acción principal por pantalla — "Continuar", "Comprobar"):
- Fondo `--color-action`, texto `white`, `--radius-md`, padding `--space-3 --space-5`, peso 600, `--shadow-1`.
- *Hover:* `--color-action-hover` + `--shadow-2` + sube 1px (`translateY(-1px)`).
- *Pressed:* baja 1px, quita sombra.
- *Focus (teclado):* `--shadow-focus`.
- *Disabled:* `--ink-200` fondo, `--ink-400` texto, sin sombra, `cursor: not-allowed`.

**Secundario** (acción alterna — "Ver pista", "Atrás"): fondo transparente, borde `--color-border-strong`, texto `--color-action`. Hover: fondo `--color-action-soft`.

**Fantasma / texto** (terciario — "Saltar"): solo texto `--color-text-muted`, sin borde. Para acciones de baja jerarquía.

> Microcopy de botón: dice exactamente qué pasa. "Comprobar", no "Enviar". "Siguiente lección", no "OK". (Ver §4.)

### 3.2 Tarjeta de lección

Contenedor de cada lección en el mapa del módulo.
- Superficie `--color-surface`, `--radius-lg`, `--shadow-2`, padding `--space-5`.
- Estados según progreso:
  - **Bloqueada:** opacidad reducida, ícono de candado `--ink-400`, sin sombra elevada. No frustra: comunica "primero la anterior".
  - **Disponible:** borde `--color-action` de 2px, badge "Empezar". Hover: `--shadow-3` + `translateY(-2px)` (despega).
  - **En curso:** barra de progreso interna visible.
  - **Completada:** check `--color-success`, superficie `--success-50` sutil.

### 3.3 Bloque interactivo (sliders) — **la insignia**

El componente que define el producto. Merece el mayor cuidado y el mayor espacio de la pantalla.
- Contenedor propio: superficie `white`, `--radius-xl`, `--shadow-interactive` (tinte aurora), padding `--space-6`. Se separa visualmente del texto para decir "acá se juega".
- **Gráfico:** ejes en `--ink-300`, grilla en `--ink-100` (tenue, no compite), recta en `--color-interactive` de 3px. La recta se redibuja en tiempo real, sin transición perceptible al arrastrar (el lag mata la intuición).
- **Slider:** riel `--ink-200`, tramo activo `--color-interactive`, thumb `--color-interactive-hi` de 24px con `--shadow-2` y anillo blanco de 3px. Área táctil mínima 44×44px (dedos de teléfono).
- **Lectura de valor:** el valor actual (ej. `m = 2,5`) en `--font-body` con cifras tabulares, tamaño `h3`, junto al slider. Nunca salta de ancho.
- Estados: foco de teclado en el thumb con `--shadow-focus`; manejable con flechas del teclado (accesibilidad).

> Este bloque es el "hero" de cada lección (guía de diseño §Design principles). Todo lo demás de la pantalla es más quieto y más chico que esto.

### 3.4 Alternativas PAES (A–D)

Ítems de selección múltiple, respuesta única, formato DEMRE (4 opciones).
- Cada alternativa: superficie `white`, borde `--color-border`, `--radius-md`, padding `--space-4`, con la letra (A/B/C/D) en un círculo `--color-action-soft`.
- *Hover:* borde `--color-action`, fondo `--color-action-soft`.
- *Seleccionada (sin comprobar):* borde `--color-action` de 2px + fondo `--color-action-soft`.
- *Correcta (tras comprobar):* borde y fondo `--color-success` suave, check verde.
- *Incorrecta elegida:* borde y fondo `--color-attention` (ámbar), ícono de "revisar" — **nunca rojo**.
- *Correcta no elegida (se revela):* borde punteado `--color-success` para mostrar cuál era, sin dramatismo.

### 3.5 Feedback (correcto / aún no / pista)

Panel que aparece bajo el ítem tras comprobar. Es el corazón pedagógico: feedback artesanal por distractor (MOS v2 §4).
- **Correcto:** fondo `--success-50`, borde izquierdo `--color-success` de 4px, título breve ("¡Eso es!") + una línea que explica *por qué* funciona, no solo que acertó.
- **Aún no:** fondo `--attention-50`, borde izquierdo `--color-attention`. Estructura: (1) nombra el paso donde se torció, específico al distractor elegido; (2) una pista para reintentar; (3) botón "Intentar de nuevo". Tono de guía, jamás de reproche.
- **Pista (a demanda):** se despliega progresiva —una pista a la vez, no todo el camino—. Fondo `--color-action-soft`, ícono de bombilla. Usar pistas no penaliza ni se registra como falla.

Microcopy de feedback (§4): describe el paso, no juzga a la persona.

### 3.6 Progreso

- **Barra de lección:** riel `--ink-200`, avance `--color-action`, `--radius-full`, altura 8px. Se anima al avanzar (`--dur-base`, `--ease-out`).
- **Mapa del módulo:** los pasos completados con check `--color-success`; el actual resaltado `--color-action`; los siguientes en `--ink-300`. Honesto: refleja comprensión y avance real, no tiempo en pantalla.
- **Sin rachas culposas.** No implementamos mecánicas que castiguen la ausencia. Celebramos terminar una lección, no "mantener el fuego". (Principio 4 + bienestar del usuario menor de edad.)

### 3.7 Render matemático

- Usar **KaTeX** (rápido, sin dependencias pesadas) para toda expresión. Nunca imágenes de fórmulas.
- Fórmulas inline en el color del texto circundante (`--color-text-body`); fórmulas destacadas (una ecuación central) en bloque, centradas, con `--space-5` de aire arriba y abajo.
- Decimales con **coma**, no punto (convención chilena: `2,5` no `2.5`). Miles con punto si aparecen. Consistencia total con cómo lo verán en la PAES.

---

## 4. Voz visual y microcopy

Las palabras son material de diseño (guía §writing). Tono: cercano pero respetuoso, tratando al estudiante de 17 como alguien capaz. Ni el "usted" del preuniversitario ni el infantilismo de una app para niños.

- **Español de Chile, tuteo, registro cálido y directo.** "Mueve el slider y mira qué pasa con la recta", no "El usuario deberá manipular el control deslizante".
- **Verbos activos y consistentes.** El botón dice "Comprobar" → el resultado dice "Comprobado". Una acción mantiene su nombre en todo el flujo.
- **El error orienta, no se disculpa.** "Este paso saltó un signo negativo — revísalo", no "¡Ups! Algo salió mal 😅". Nunca vago sobre qué pasó.
- **Pantallas vacías = invitación a actuar.** El diagnóstico vacío dice "Empieza tu diagnóstico de 5 preguntas para ver por dónde partir", no "No hay datos".
- **Cero emojis en el contenido de lección.** Restamos seriedad y el apoderado lo nota. Un ícono limpio comunica mejor que un emoji.

---

## 5. Accesibilidad y menores

No es opcional. Nuestros usuarios son menores de edad y usan el celular.

- **Contraste AA** en todo texto (§2.1). Verificar cada combinación nueva.
- **Táctil ≥ 44×44px** en todo lo que se toca (botones, thumb del slider, alternativas). Dedos, no mouse.
- **Foco de teclado visible** siempre (`--shadow-focus`). El slider se maneja con flechas.
- **`prefers-reduced-motion` respetado** (§2.6).
- **Mobile-first.** La mayoría entra por teléfono. Se diseña primero para 360px de ancho y luego se expande, no al revés.
- **Sin PII en la interfaz** (MOS v2 §7.5): nada de pedir nombre completo, RUT ni foto. La analítica es anónima. Ningún componente recolecta datos personales.

---

## 6. Anti-patrones (lo que NO hacemos)

El anti-referente es el preuniversitario típico. Cada línea acá es una tentación real a evitar:

- ❌ **Densidad de dashboard.** Nada de meter 6 métricas, 3 barras y 4 botones en una pantalla. Una acción principal por vista.
- ❌ **Rojo institucional / alarma como color base.** El rojo solo existe para errores técnicos. La marca es índigo, tranquila.
- ❌ **Urgencia en la interfaz de aprendizaje.** Sin contadores de "faltan X días", sin "¡apúrate!". La urgencia es del marketing, no del producto.
- ❌ **Gamificación culpógena.** Sin rachas que castiguen, sin notificaciones de "te extrañamos", sin mecánicas para inflar tiempo en pantalla.
- ❌ **Texto encima de texto.** Si una pantalla es un muro de párrafos, falta el interactivo (principio 1). El texto acompaña al descubrimiento, no lo reemplaza.
- ❌ **Fuentes por defecto sin intención** (Open Sans/Lato genéricos), esquinas cuadradas y grises corporativos. Eso *es* verse a preuniversitario.
- ❌ **Emojis en el contenido de lección** y tono infantil. Nuestro usuario tiene 17, no 7.
- ❌ **Fórmulas como imágenes.** Siempre KaTeX, siempre coma decimal chilena.

---

## 7. Implementación (copiar y pegar)

### 7.1 Variables CSS — `src/styles/tokens.css`

Impórtalo una vez en tu layout raíz. Funciona con o sin Tailwind.

```css
:root {
  /* --- Primitivos --- */
  --indigo-50:#EEF1FF; --indigo-100:#E0E5FF; --indigo-300:#A6AEFF;
  --indigo-500:#5B63F5; --indigo-600:#4A4FE0; --indigo-700:#3A3CC4; --indigo-900:#23246B;
  --aurora-400:#2DD4E0; --aurora-500:#12B5C9; --aurora-600:#0E93A8;
  --ink-900:#111629; --ink-700:#2E3448; --ink-500:#5B6478; --ink-400:#8A93A8;
  --ink-300:#CDD3E0; --ink-200:#E4E8F0; --ink-100:#F1F3F9; --ink-50:#F7F8FC; --white:#FFFFFF;
  --success-50:#E9FBF3; --success-500:#12B76A; --success-700:#087544;
  --attention-50:#FFF6E9; --attention-500:#F5A623; --attention-700:#B26A00;
  --error-500:#E5484D;

  /* --- Semánticos --- */
  --color-bg:var(--ink-50); --color-surface:var(--white); --color-surface-alt:var(--ink-100);
  --color-border:var(--ink-200); --color-border-strong:var(--ink-300);
  --color-text:var(--ink-900); --color-text-body:var(--ink-700); --color-text-muted:var(--ink-500);
  --color-action:var(--indigo-600); --color-action-hover:var(--indigo-700); --color-action-soft:var(--indigo-50);
  --color-interactive:var(--aurora-500); --color-interactive-hi:var(--aurora-400);
  --color-success:var(--success-500); --color-success-soft:var(--success-50);
  --color-attention:var(--attention-500); --color-attention-soft:var(--attention-50);
  --color-error:var(--error-500);
  --color-focus-ring:rgba(91,99,245,0.45);

  /* --- Tipografía --- */
  --font-display:"Plus Jakarta Sans",system-ui,sans-serif;
  --font-body:"Inter",system-ui,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,monospace;

  /* --- Espaciado --- */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --space-6:32px; --space-7:48px; --space-8:64px; --space-9:96px;

  /* --- Radios --- */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px; --radius-full:9999px;

  /* --- Sombras --- */
  --shadow-1:0 1px 2px rgba(17,22,41,0.06);
  --shadow-2:0 4px 14px rgba(17,22,41,0.08);
  --shadow-3:0 12px 32px rgba(17,22,41,0.12);
  --shadow-interactive:0 8px 24px rgba(18,181,201,0.22);
  --shadow-focus:0 0 0 3px var(--color-focus-ring);

  /* --- Movimiento --- */
  --dur-fast:120ms; --dur-base:220ms; --dur-slow:360ms;
  --ease-out:cubic-bezier(0.22,1,0.36,1);
  --ease-soft:cubic-bezier(0.4,0,0.2,1);
}

body { background:var(--color-bg); color:var(--color-text-body);
  font-family:var(--font-body); font-size:16px; line-height:1.6; }
h1,h2,h3 { font-family:var(--font-display); color:var(--color-text);
  letter-spacing:-0.02em; }
.num { font-variant-numeric:tabular-nums; }  /* valores del interactivo */

@media (prefers-reduced-motion: reduce) {
  * { animation-duration:0.001ms !important; transition-duration:0.001ms !important; }
}
```

### 7.2 Fuentes — en `app/layout.tsx` (Next.js)

```tsx
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600","700"], variable: "--font-display" });
const body    = Inter({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-body" });
// aplica className={`${display.variable} ${body.variable}`} en <html>
```

### 7.3 Tailwind (opcional) — `tailwind.config.js`

Si usas Tailwind, mapea los tokens para no repetir hex:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        action: "var(--color-action)", "action-soft": "var(--color-action-soft)",
        interactive: "var(--color-interactive)",
        success: "var(--color-success)", attention: "var(--color-attention)",
        ink: { DEFAULT:"var(--ink-900)", body:"var(--ink-700)", muted:"var(--ink-500)" },
      },
      borderRadius: { md:"var(--radius-md)", lg:"var(--radius-lg)", xl:"var(--radius-xl)" },
      boxShadow: { card:"var(--shadow-2)", lift:"var(--shadow-3)", interactive:"var(--shadow-interactive)" },
    },
  },
};
```

---

## 8. Checklist de calidad por pantalla

Antes de dar por lista cualquier pantalla, todas deben ser "sí":

- [ ] ¿Hay **una sola acción principal** clara? (principio 2)
- [ ] Si es una lección, ¿el **interactivo es lo más prominente** de la pantalla? (principio 1)
- [ ] ¿Todos los colores y tamaños vienen de **tokens**, sin hex sueltos?
- [ ] ¿Las respuestas incorrectas usan **`attention` (ámbar), no rojo**? (principio 3)
- [ ] ¿El **feedback explica el paso**, no juzga a la persona? (§4)
- [ ] ¿Contraste AA, táctil ≥44px, **foco de teclado visible**? (§5)
- [ ] ¿Se ve bien en **360px de ancho** (teléfono) primero?
- [ ] ¿`prefers-reduced-motion` respetado?
- [ ] ¿Decimales con **coma chilena**, fórmulas en KaTeX?
- [ ] ¿**Cero PII**, cero emojis en lección, cero urgencia en la interfaz?
- [ ] Prueba del espejo (Chanel): ¿hay algún elemento decorativo que sobra? Quítalo.

---

*Fin del MASTER. Este documento gobierna el look de Antigravity v1. Se actualiza al cruzar un gate o tras evidencia real de usuarios en el piloto, no por inquietud.*
