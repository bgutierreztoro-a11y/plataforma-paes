import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar en modo dev desde el teléfono por la misma WiFi
  // (http://IP-de-tu-pc:3000, ver SETUP.md/prompt-mvp.md). Sin esto, Next.js
  // bloquea en dev los recursos internos (_next/*, incluidos los chunks de
  // JS) para cualquier origen que no sea localhost, y la página nunca
  // hidrata — no es una vulnerabilidad real en un servidor de desarrollo
  // dentro de una red local de confianza.
  allowedDevOrigins: ["192.168.0.174"],
};

export default nextConfig;
