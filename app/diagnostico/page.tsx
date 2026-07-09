import { obtenerDiagnostico } from "@/lib/contenido";
import { sanitizarDiagnostico } from "@/lib/sanitizar";
import { Diagnostico } from "@/components/Diagnostico";

export default function PaginaDiagnostico() {
  const diagnostico = obtenerDiagnostico();
  return <Diagnostico diagnostico={sanitizarDiagnostico(diagnostico)} />;
}
