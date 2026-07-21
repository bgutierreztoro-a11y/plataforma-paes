import type { Metadata } from "next";
import { obtenerDiagnostico } from "@/lib/contenido";
import { sanitizarDiagnostico } from "@/lib/sanitizar";
import { Diagnostico } from "@/components/Diagnostico";

export const metadata: Metadata = {
  title: "Diagnóstico",
  description: "Cinco preguntas formato PAES para medir tu punto de partida.",
};

export default function PaginaDiagnostico() {
  const diagnostico = obtenerDiagnostico();
  return <Diagnostico diagnostico={sanitizarDiagnostico(diagnostico)} />;
}
