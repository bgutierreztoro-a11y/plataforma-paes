---
description: Produce una lección completa de punta a punta — diseño, redacción, auditorías y correcciones — hasta dejarla lista para firma
---
Produce la lección completa: $ARGUMENTS (id en kebab-case, p. ej. `proporcionalidad-inversa`).

Este comando encadena todo el ciclo de producción en una sola corrida. **Se detiene en dos puntos y solo en esos dos:** la aprobación del paso 5 y la firma antes del commit.

---

## Fase 0 — Contexto

Lee, en este orden:

1. `docs/reglas-modulo.md` — las reglas de construcción que salieron de auditar L1. Son las que se rompen en silencio.
2. `docs/calibracion-lecciones-e-items.md` — arquitectura de 10 pasos (§2), habilidades (§3.5), dificultad (§5.1), contextos saturados (§6), patrones de distractor (§7).
3. La L1 del módulo si ya existe, para el catálogo de errores y la coherencia de dominio.

Declara en una línea qué incertidumbre reduce esta lección (MOS §2). Si no reduce ninguna, dilo y detente.

## Fase 1 — Diseño del paso 5, con aprobación

**Este es el punto de detención número uno.** No redactes nada antes de que Benja apruebe.

Presenta, en no más de una pantalla:

- **El insight.** Qué construye el estudiante por sí mismo en el paso de descubrimiento. Una frase.
- **Cómo lo construye.** Qué calcula con su propia mano para que la invariante la vea, no se la cuenten.
- **La pregunta previa.** Qué queda genuinamente en duda hasta que el estudiante calcula. Si nada queda en duda, el paso 5 es una confirmación, no un descubrimiento — rediséñalo.
- **Diferenciación.** En qué se distingue del paso 5 de las lecciones ya escritas del mismo eje.
- **El dominio propuesto** y los términos que hay que verificar contra el corpus.
- **La constante** (o la invariante equivalente) y su valor.

Verificación de colisión de dominio: emite el comando exacto de `node scripts/consultar-fuentes.mjs "término" "término" ...` para que Benja lo corra fuera de la sesión, y espera la salida cruda pegada sin editar. **No lo corras tú: este hilo redacta.** Incluye en la lista los sinónimos, la sustancia genérica, el verbo de la acción y el adjetivo del resultado — no solo los sustantivos del contexto (ver `docs/reglas-modulo.md` y el hueco que dejó L1).

Espera aprobación explícita. Si Benja pide cambios, rehaz el diseño y vuelve a esperar.

## Fase 2 — Redacción

Redacta el archivo completo en `content/lecciones/<id>.json`, los 10 pasos en orden y 2–3 ítems PAES.

Mientras escribes, estas son las que se rompen solas:

- La constante no aparece en ningún paso anterior al 5, ni en pistas, ni en feedback de selección múltiple.
- Todo distractor: derivable de un mecanismo del catálogo **y** en banda de magnitud indistinguible de la correcta.
- Ningún distractor vale lo mismo que ninguna respuesta correcta del archivo.
- Ids de campo neutros, sin la cifra dentro.
- `catalogoErrores` embebido si es la L1 del módulo. Nada en `content/errores/`.
- Sin representación de función lineal si el concepto no la exige.

Declara el bloque `auditoria` en la raíz del JSON con al menos `constante`, para que el auditor mecánico pueda chequear la filtración:

```json
"auditoria": { "constante": 40 }
```

Si hay una colisión distractor/correcta deliberada o un slider justificado, decláralos ahí también (`colisionesPermitidas`, `sliderJustificado`).

## Fase 3 — Chequeos mecánicos

```
npm run validar && npm run auditar content/lecciones/<id>.json
```

Corrige **todo** hasta dejar los dos en verde. No sigas con hallazgos abiertos: las auditorías de contexto fresco son caras y no se gastan en lo que un script ya encontró.

## Fase 4 — Auditoría matemática

Invoca el subagente `auditor-matematico` vía el Agent tool, pasándole la ruta absoluta del archivo.

Aplica **todos** los hallazgos 🔴 y 🟡. Los 🟢 son opcionales y se reportan sin aplicar.

Cuando un distractor quede fuera de banda, la corrección es **cambiar los datos base del problema**, no buscar otro número. En L1 tres intentos de cambiar el número fallaron y el cambio de datos funcionó a la primera.

Si el subagente no está disponible como `subagent_type` en el entorno, **detente y dilo**. No lo sustituyas por una revisión en este mismo hilo: el hilo que redactó no puede auditar lo que redactó, y ese aislamiento es la regla, no una formalidad. La salida es abrir un hilo nuevo con `/clear` y correr la auditoría ahí.

## Fase 5 — Auditoría de originalidad

Invoca el subagente `auditor-originalidad` vía el Agent tool, con la ruta absoluta del archivo **y** la ruta absoluta de `fuentes-analisis-aisladas/`.

Aplica los hallazgos 🔴 y 🟡. Si el veredicto de algún punto del checklist es NO CERTIFICABLE, **no lo conviertas en aprobado**: queda registrado como tal en la proveniencia del archivo y en el reporte final.

Misma regla que la fase 4 si el subagente no está disponible: detente y dilo.

## Fase 6 — Re-corrida completa

Después de aplicar correcciones, todo de nuevo:

```
npm run validar && npm run auditar content/lecciones/<id>.json && npm run lint
```

Una corrección puede romper otra cosa — en L1, cambiar el distractor duro del paso 2 provocó una colisión con el paso 5 que solo apareció al re-correr.

Actualiza `proveniencia` para que refleje el **estado real**: qué auditorías corrieron, cuándo, con qué resultado y qué quedó sin certificar. Nunca dejes ahí una afirmación de intención escrita como hecho.

## Fase 7 — Reporte

Una tabla y nada más:

| Fase | Resultado | Hallazgos | Aplicados | Pendientes |
|---|---|---|---|---|
| Validador | ✅/❌ | | | |
| Auditor mecánico | ✅/❌ | 🔴 n · 🟡 n | | |
| Auditoría matemática | APROBADA/RECHAZADA | 🔴 n · 🟡 n | | |
| Auditoría originalidad | APROBADA/RECHAZADA | 🔴 n · 🟡 n | | |

Debajo, en tres líneas máximo: qué quedó sin resolver y por qué.

## Fase 8 — Detente

**Punto de detención número dos.** Muestra el `git diff --stat` y el mensaje de commit propuesto.

**No commitees. No pushees.** Espera la firma de Benja.

---

## Reglas de la corrida

- Si una fase falla, no avances. Corrige y repite esa fase.
- No inventes contenido para llenar un hueco que una auditoría dejó abierto. Un punto sin certificar se reporta sin certificar.
- Si el diseño del paso 5 resulta inviable durante la redacción, vuelve a la fase 1 y pide aprobación de nuevo. No lo parches sobre la marcha.
- Ante duda razonable de originalidad: se descarta y se crea de nuevo (MOS §7.2).
