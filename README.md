# Plataforma M1

Módulo piloto de funciones lineales y afines para Matemática M1 (PAES, Chile). Portada → diagnóstico (5 ítems) → lección interactiva (10 pasos) → cierre (8 ítems formato PAES).

## Cómo correr

```bash
npm install
npm run dev       # http://localhost:3000
```

Otros scripts:

```bash
npm run validar   # valida content/*.json contra content/schema/leccion.schema.json
npm run lint      # ESLint
npm run build     # build de producción
```

`npm run validar` corre automáticamente tras cada edición de contenido vía un hook de Claude Code (`.claude/settings.json`).

## Dónde vive el contenido

- `content/lecciones/*.json` — una lección por archivo (`l0-demo.json` es contenido de demostración técnica, nunca pasa a `"estado": "publicable"`).
- `content/diagnostico.json`, `content/cierre.json` — sets de ítems formato PAES.
- `content/schema/leccion.schema.json` — contrato que valida todo lo anterior.
- Los tipos TypeScript en `lib/tipos.ts` son un espejo manual de ese schema (sin codegen); si el schema cambia, este archivo se actualiza a mano.
- `lib/contenido.ts` carga y valida el contenido en el servidor (reutiliza `scripts/validar-contenido.mjs` y agrega una verificación de la forma interna de los bloques que el validador de CLI no cubre).

Ver `docs/pendientes.md` para un pendiente técnico conocido: `l1-patrones-de-cambio.json` (contenido real ya aprobado) usa una forma de bloques anterior al schema actual y no se renderiza todavía en esta app.

## Analítica

`posthog-js` se inicializa solo si existe `NEXT_PUBLIC_POSTHOG_KEY` (ver `.env.example`), con `autocapture`, `session recording` y persistencia en disco desactivados. Sin esa clave la app funciona igual: los 6 eventos (`leccion_inicio`, `paso_inicio`, `item_respuesta`, `pista_usada`, `leccion_fin`, `solicitud_siguiente_leccion`) se loguean a consola en desarrollo (`lib/eventos.ts`).

## Estado del estudiante

En memoria, por sesión (`useReducer` en cada ruta) — nada se persiste en `localStorage` ni cookies. Recargar la página o navegar entre `/diagnostico`, `/leccion/[id]` y `/cierre` reinicia el estado de esa ruta: es intencional (minimización de datos, usuarios menores de edad).

## Deploy en Vercel

1. Conectar el repo en Vercel (framework detectado automáticamente: Next.js).
2. Configurar `NEXT_PUBLIC_POSTHOG_KEY` (y `NEXT_PUBLIC_POSTHOG_HOST` si no se usa el host por defecto de PostHog) en las variables de entorno del proyecto, si se quiere analítica real en el piloto.
3. Deploy. El sitio no tiene autenticación (acceso por link privado); `public/robots.txt` bloquea indexación y todas las páginas llevan meta `noindex`.
