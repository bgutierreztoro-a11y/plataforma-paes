import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar en modo dev desde el teléfono por la misma WiFi
  // (http://IP-de-tu-pc:3000, ver SETUP.md/prompt-mvp.md). Sin esto, Next.js
  // bloquea en dev los recursos internos (_next/*, incluidos los chunks de
  // JS) para cualquier origen que no sea localhost, y la página nunca
  // hidrata — no es una vulnerabilidad real en un servidor de desarrollo
  // dentro de una red local de confianza.
  allowedDevOrigins: ["192.168.0.174"],
  // lib/contenido.ts lee content/ con readdirSync/readFileSync sobre rutas
  // armadas con process.cwd(), que el tracer de Turbopack no puede resolver
  // estáticamente. Sin esto, el build empaqueta el repo completo (docs
  // internos, guiones de lecciones en progreso) dentro de la función de
  // /leccion/[id]. Se excluye todo lo que no sea código de la app o contenido
  // publicable.
  outputFileTracingExcludes: {
    "*": [
      "./docs/**",
      "./MD_Conversiones/**",
      "./*.md",
      "./scripts/consultar-fuentes.mjs",
      "./scripts/check-fuentes-aisladas.mjs",
      "./instalar-kit.sh",
      "./.claude/**",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
