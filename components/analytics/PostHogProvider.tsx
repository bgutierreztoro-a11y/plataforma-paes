"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

let inicializado = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (inicializado) return;
    inicializado = true;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // sin key: la app funciona igual, eventos solo van a consola (lib/eventos.ts)
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      // Sin cookies ni localStorage: nada del estudiante sobrevive a un
      // reload, para no violar la minimización de datos (usuarios menores).
      persistence: "memory",
    });
  }, []);

  return <>{children}</>;
}
