import { obtenerDiagnostico } from "@/lib/contenido";
import { Diagnostico } from "@/components/Diagnostico";

export default function PaginaDiagnostico() {
  const diagnostico = obtenerDiagnostico();
  return <Diagnostico diagnostico={diagnostico} />;
}
