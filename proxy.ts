import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Se llama proxy.ts, no middleware.ts: Next 16 renombró el archivo. El helper
 * de Clerk es el mismo y soporta los dos nombres; solo cambia dónde vive.
 *
 * NO PROTEGE NINGUNA RUTA, y es deliberado. Sin `createRouteMatcher`, sin
 * `auth.protect()`. Su único trabajo es que Clerk pueda leer y escribir la
 * cookie de sesión, de modo que la app sepa si hay alguien conectado.
 *
 * El diagnóstico, las lecciones y el cierre son y siguen siendo públicos: la
 * cuenta es una comodidad para no perder el avance, no un peaje para aprender
 * (MOS §9, excepción acotada de autenticación).
 *
 * Y aunque algún día haya algo que proteger, no se protege solo acá: la
 * autorización vive en lib/datos/, que es la capa que toca los datos
 * (CVE-2025-29927 — confiar únicamente en el middleware es lo que falló ahí).
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Todo salvo los estáticos de Next y el proxy de PostHog.
    //
    // `ingest` tiene que quedar fuera sí o sí: si el proxy lo intercepta, los
    // rewrites de next.config.ts dejan de servir los assets de posthog-js y la
    // analítica se cae en producción sin que se note en desarrollo. Es un error
    // que este proyecto ya cometió una vez.
    "/((?!_next/static|_next/image|ingest|favicon.ico|robots.txt).*)",
    "/(api|trpc)(.*)",
  ],
};
