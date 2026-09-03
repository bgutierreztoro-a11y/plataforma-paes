# Deuda: la pantalla 01 ("Entrada") promete una medición que hoy no existe

Estado: **registrado, sin corregir.** No bloquea la pantalla — la 01 se monta con
la forma del HTML de referencia, cifras derivadas de lo que hay escrito y un CTA
que dice la verdad sobre lo que abre. Lo que sigue es el desfase entre lo que el
HTML promete y lo que el producto puede sostener hoy.

Descubierto: 2026-09-02, al armar la pantalla 01 (fase 3F).

## Qué promete el HTML de referencia

`docs/referencia/B-linea-interfaz-completa.html:153-167` (pantalla 01):

- Rótulo "Competencia matemática 1".
- Titular a dos líneas: "Antes de partir, / una medición."
- Subtítulo: "**Doce preguntas, ocho minutos.** No es nota: sirve para saber en
  qué línea conviene que te subas."
- Tira de tres KPIs: **16 Estaciones**, **48 Lecciones**, **4 Líneas**.
- CTA primario `.btn.dark` "Hacer la medición".
- CTA secundario `.btn.ghost` "Prefiero elegir yo la línea".

## 1 · "Doce preguntas, ocho minutos": no hay tal prueba

`content/diagnostico.json` tiene **5 ítems**, no doce. Y su propia
`proveniencia.declaracionOriginalidad` dice: *"Set de diagnóstico de demostración
técnica, creado desde cero para probar la cáscara del MVP. No es contenido
pedagógico real: es andamiaje que se reemplaza cuando exista el banco de ítems de
diagnóstico."* El directorio `content/diagnostico/items/` está vacío.

El runner del diagnóstico abre con el cartel "DEMOSTRACIÓN — contenido no
revisado" (`components/Diagnostico.tsx`, vía `sanitizarDiagnostico`). Escribir
"doce preguntas, ocho minutos" en la entrada le afirma a un menor de edad un
hecho falso sobre lo que va a encontrar.

→ **El subtítulo se pinta con el dato real:** "Cinco preguntas, unos cinco
minutos." Cuando exista el banco de ítems de diagnóstico, el número y el tiempo
vuelven a lo que ese banco mida — y recién ahí el CTA "Hacer la medición" deja de
abrir una demostración.

## 2 · Los KPIs 16 / 48 son taxonomía, no contenido

`lib/modulos.ts` declara los 16 temas del temario M1 con sus 3 lecciones cada uno
(`TOTAL_TEMAS = 16`, `idsDeLeccionesEnOrden().length = 48`). Los números del mock
salen de ahí. Pero **11 de esos 16 temas no tienen ningún archivo de lección en
disco**: 5 temas están vacíos (`transformaciones-isometricas`,
`semejanza-y-proporcionalidad`, `probabilidad-y-estadistica`,
`medidas-de-posicion`, `reglas-de-probabilidades`). Escritas y validables hoy hay
**33 lecciones en 11 estaciones**.

Poner 16 · 48 en la entrada le promete a alguien que llega 5 estaciones y 15
lecciones que no puede abrir. Es el mismo criterio de `SIN_DATO` que ya aplica la
pantalla 11: una cifra que afirma más de lo que hay es peor que la cifra honesta.

→ **La tira se pinta con 11 · 33 · 4**, derivado en tiempo de build desde
`temasConNodo()` y `ejesDelCamino()` (`lib/camino.ts`), nunca escrito a mano. El
número sube solo cuando se escribe y valida contenido nuevo. Cuando el temario
esté completo, la tira dirá 16 · 48 · 4 sin tocar esta pantalla.

## 3 · El CTA "Hacer la medición" abre una demostración

Consecuencia directa del punto 1. Hay una decisión registrada del 2026-07-25
(citada en `components/PuntoDePartida.tsx:241-247`) de que el **primer clic del
producto no vaya al diagnóstico**, precisamente para no abrir con ese cartel.

La pantalla 01 del HTML contradice esa decisión: su acción principal *es* medirse.
Se resolvió a favor del HTML **solo en la rama de arranque** (`empezar` y el
render previo a hidratar): ahí el CTA primario es "Hacer la medición" → `/diagnostico`.
Las otras tres ramas de `PuntoDePartida` (`continuar`, `repasar`, `todo_al_dia`)
mantienen su destino — a alguien que ya empezó no se le ofrece medirse de nuevo
como acción principal.

→ Cuando el diagnóstico deje de ser demostración, esta tensión desaparece: el
primer clic llevará a una medición real y la decisión del 2026-07-25 queda
subsumida. Hasta entonces, la rama de arranque abre el cartel de demostración a
propósito, con el subtítulo diciendo cuántas preguntas son de verdad.

## Qué no cubre este documento

El banco de ítems de diagnóstico y el motor `lib/diagnostico/` tienen su propio
gate (MOS §9, excepción del 2026-08-02). Esta deuda no lo adelanta: solo deja
anotado que la entrada muestra hoy las cifras honestas y el copy honesto, y qué
tiene que pasar para que converjan con el HTML de referencia.
