# Deuda: los asteriscos que el estudiante ve en pantalla

**Estado:** registrado, sin corregir. No bloquea la Fase D.
**Fecha:** 2026-09-05
**Encontrado:** durante el inventario de destacado inline de la Fase D (el trazo de
destacador). No es un hallazgo de la fase; es algo que estaba ahí antes y que el
inventario destapó.

## Qué pasa

`lib/markdownSimple.tsx` es el único parser de markdown del proyecto. `TextoEnriquecido`
(líneas 97-144) convierte `**texto**` en `<strong>`, y **solo llega a dos campos** del
contenido: `contenido` y `enunciado` de los bloques.

El contenido de `content/lecciones/` usa `**negrita**` también en campos que **no pasan
por el parser** y se pintan como string crudo. En esos casos el estudiante ve los dos
asteriscos impresos en pantalla.

Ejemplo real, `content/lecciones/potencias-multiplicar-corto.json`,
`itemsPAES[1] potencias-multiplicar-corto-item-2 alternativas[0] A`:

```json
"texto": "**4⁻³**"
```

`components/ItemPAES.tsx:291` lo pinta con `<span>{alt.texto}</span>`. La alternativa A
de ese ítem se lee, literalmente, `**4⁻³**`.

## Dónde se pinta crudo

| Campo | Se pinta en | Marcas |
|---|---|---|
| `pasos[].bloques[].opciones[].texto` | `components/ui/SelectorOpciones.tsx:69` — `<span className="text-sm text-ink">{op.texto}</span>` | 16 |
| `itemsPAES[].alternativas[].texto` | `components/ItemPAES.tsx:291` — `<span>{alt.texto}</span>` | 12 |
| `pasos[].bloques[].feedbackPorError[].mensaje` | `components/bloques/BloqueNumerica.tsx:90` — `{mensajeParaCampo(...)}` dentro de `PanelFeedback` | 9 |
| `pasos[].bloques[].opciones[].feedback` | `components/bloques/BloqueSeleccion.tsx:56` — `{opcionElegida.feedback}` | 7 |
| `itemsPAES[].alternativas[].feedback` | `components/ui/PanelFeedback.tsx:106,123` — `{children}` | 7 |
| `pasos[].bloques[].niveles[].texto` (pistas) | `components/bloques/BloquePistas.tsx:23` — `<p className="mt-1">{n.texto}</p>` | 4 |
| `pasos[].bloques[].alternativas[].texto` | `components/bloques/BloquePregunta.tsx:200` — `<span>{alt.texto}</span>` | 3 |
| `pasos[].bloques[].feedbackVerdadero` | `components/bloques/BloqueVerdaderoFalso.tsx:63` | 2 |
| `pasos[].bloques[].feedbackFalso` | `components/bloques/BloqueVerdaderoFalso.tsx:63` | 1 |
| | **Total** | **61** |

Mismo mecanismo, hoy sin marcas pero igual de crudo:
`components/grafico/SecuenciaMicropreguntas.tsx:79` (`{actual.enunciado}` de una
micropregunta — nótese que este `enunciado` **no** pasa por `TextoEnriquecido`, a
diferencia del `enunciado` de los bloques normales) y `:130` (`<span>{mensaje}</span>`).

## Por qué no se arregla acá

Las dos salidas tocan cosas que la Fase D tiene fuera de alcance:

1. **Ampliar la cobertura del renderer** — pasar esos campos por `TextoEnriquecido` o
   `conEnfasis`. Es lo correcto, pero cambia cómo se ve el feedback y las alternativas
   en 8 archivos de contenido a la vez, y varias de esas marcas son notación
   (`**4⁻³**`, `**(0,25 / 1024)^(1/6)**`), así que la decisión no es solo técnica:
   hay que resolver si una alternativa entera en negrita es lo que se quiere.
2. **Sacar los asteriscos del contenido** — toca `content/`, congelado en esta fase, y
   pasa por las dos auditorías del flujo de contenido.

## Lo que la Fase D sí hace al respecto

Nada que lo empeore. El trazo de destacador se aplica **solo** dentro de
`TextoEnriquecido`, sobre bloques de párrafo y lista, así que ninguno de los campos de
esta tabla lo recibe. La cobertura del renderer queda exactamente igual que antes.

## Cómo reproducirlo

```
npm run dev
```

Ir a `/leccion/potencias-multiplicar-corto`, avanzar hasta los ítems PAES del cierre de
la lección: la alternativa A del segundo ítem muestra `**4⁻³**`.
