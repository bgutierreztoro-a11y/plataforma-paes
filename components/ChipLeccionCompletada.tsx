"use client";

import { IconoCorrecto } from "@/components/ui/Icono";
import { esLeccionCompletada } from "@/lib/progresoSesion";
import { useMontado } from "@/lib/useMontado";

/** Chip "Completada" en la tarjeta de lección. Lee el progreso en memoria de
 *  sesión, así que solo puede saberse en el cliente: en servidor (y antes de
 *  hidratar) no renderiza nada, evitando un mismatch de hidratación. */
export function ChipLeccionCompletada({ leccionId }: { leccionId: string }) {
  const montado = useMontado();
  if (!montado || !esLeccionCompletada(leccionId)) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-suave px-2.5 py-0.5 text-xs font-medium text-success">
      <IconoCorrecto className="h-3.5 w-3.5" />
      Completada
    </span>
  );
}
