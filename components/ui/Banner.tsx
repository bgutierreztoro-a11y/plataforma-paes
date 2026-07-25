export function BannerDemostracion() {
  return (
    <div
      role="status"
      className="sticky top-0 z-10 border-b border-border bg-accent-suave px-4 py-2 text-center text-sm font-medium text-ink"
    >
      DEMOSTRACIÓN — contenido no revisado
    </div>
  );
}

/**
 * Aviso previo al click que lleva a contenido no publicable, para que el
 * estudiante sepa lo que va a encontrar antes de aterrizar en el
 * `BannerDemostracion`. Mismo vocabulario que los dos enlaces a /diagnostico
 * (`app/page.tsx` y `components/CierreFinal.tsx`): prosa inline, nunca cartel.
 *
 * Vive acá y no en cada componente para que la frase tenga un solo hogar: hoy
 * la usan los dos caminos que desembocan en /cierre (RunnerLeccion e
 * ItemsPAESFinal).
 */
export function AvisoCierreDemostracion() {
  return (
    <p className="text-sm leading-6 text-ink-suave">
      El cierre es hoy una versión de demostración.
    </p>
  );
}
