import type { Metadata } from "next";
import { idsPublicables, obtenerDiagnostico } from "@/lib/contenido";
import { sanitizarDiagnostico } from "@/lib/sanitizar";
import { Diagnostico } from "@/components/Diagnostico";

export const metadata: Metadata = {
  title: "Diagnóstico",
  description: "Cinco preguntas formato PAES para medir tu punto de partida.",
};

export default function PaginaDiagnostico() {
  const diagnostico = obtenerDiagnostico();
  /* Primera lección abierta del camino: es adónde manda el CTA final del
     diagnóstico. Se deriva acá, en servidor, para que Diagnostico.tsx
     ("use client") no tenga que importar lib/contenido. */
  const primeraLeccionId = idsPublicables()[0];
  return (
    <Diagnostico diagnostico={sanitizarDiagnostico(diagnostico)} primeraLeccionId={primeraLeccionId} />
  );
}
