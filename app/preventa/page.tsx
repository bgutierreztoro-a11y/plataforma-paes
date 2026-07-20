import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso intensivo Funciones M1 — Cohorte fundadora",
  description: "Curso intensivo de Funciones para la Matemática M1. Cohorte fundadora, cupos limitados.",
  robots: { index: false, follow: false },
};

// Preventa (MOS §7, Test A — apuesta comercial): landing estática, sin captura
// de datos propia. El interés se reserva por un canal de confianza externo
// (WhatsApp / formulario), no por un input en la plataforma: así no entra PII
// de menores a nuestro sistema (CLAUDE.md regla 7, MOS §7.5) y la app sigue
// 100% estática, sin backend (fuera del alcance de v1).
//
// La captura de interés se hace con un formulario Tally embebido (un solo
// campo: correo). El dato vive solo en Tally, nunca entra a nuestro sistema:
// así no hay PII de menores en la app (CLAUDE.md regla 7, MOS §7.5) y la
// landing sigue 100% estática, sin backend.
//
// TODO(preventa): FECHA_INICIO — fijar la fecha real de arranque de la cohorte.
const FECHA_INICIO = "[FECHA POR DEFINIR]";

export default function Preventa() {
  return (
    <div className="fondo-cuadricula flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-wide text-ink-suave">
        Cohorte fundadora · Cupos limitados
      </p>
      <h1 className="max-w-lg text-4xl font-semibold leading-tight text-ink">
        Curso intensivo de Funciones para la PAES M1
      </h1>
      <p className="max-w-md text-lg leading-8 text-ink-suave">
        Un curso corto y guiado para dominar funciones lineales y afines: la base que más
        se repite en la prueba. Diagnóstico, lecciones interactivas y práctica con preguntas
        formato PAES.
      </p>
      <p className="max-w-md text-lg leading-8 text-ink-suave">
        <span className="text-2xl font-semibold text-ink">$9.990</span>
        <span className="mx-2 text-ink-suave">·</span>
        Parte el {FECHA_INICIO}
      </p>
      <iframe
        src="https://tally.so/embed/xXLQrE?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        title="Reservar cupo"
        loading="lazy"
        width="100%"
        height={200}
        className="w-full max-w-md border-0"
      ></iframe>
    </div>
  );
}
